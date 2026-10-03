/*
 * Local Chrome regression for the app-like reader improvements.
 *
 * This refuses every remote origin and every non-GET/HEAD request. It opens
 * cards and follows in-reader navigation, but never submits an inquiry.
 *
 *   READER_AUDIT_URL=http://127.0.0.1:4396 node scripts/verify-reader-audit.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.READER_AUDIT_URL || 'http://127.0.0.1:4396').replace(/\/$/, '');
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'reader-audit');
const report = {
  kind: 'reader-audit-browser-verification',
  base,
  startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome',
  assertions: [],
  blockedMutations: [],
  localFailures: [],
  pageErrors: [],
};

function pass(name, detail = '') {
  report.assertions.push({ name, passed: true, detail });
}

async function check(name, task) {
  try {
    pass(name, (await task()) || '');
  } catch (error) {
    report.assertions.push({ name, passed: false, detail: error.stack || String(error) });
    throw error;
  }
}

function assertLocalCandidate() {
  const hostname = new URL(base).hostname;
  assert.ok(['127.0.0.1', 'localhost', '::1'].includes(hostname),
    'Reader verification refuses a non-local candidate.');
}

async function makePage(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await context.route('**/*', async (route) => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== new URL(base).origin) return route.abort('blockedbyclient');
    if (!['GET', 'HEAD'].includes(request.method())) {
      report.blockedMutations.push({ method: request.method(), url: request.url() });
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  page.on('response', (response) => {
    if (new URL(response.url()).origin === new URL(base).origin && response.status() >= 400) {
      report.localFailures.push({ status: response.status(), url: response.url() });
    }
  });
  return { context, page };
}

async function openWebsiteReader(page) {
  const response = await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(response?.status(), 200, 'local homepage must return 200');
  const tile = page.locator('.tile[data-answer="page-services-custom-local-websites"]');
  await tile.waitFor({ state: 'visible' });
  await tile.click();
  await page.locator('#detail[open] #detail-body .website-service-body')
    .waitFor({ state: 'visible', timeout: 15000 });
}

async function openInReaderTechAudit(page) {
  const ctas = page.locator('#detail-body a[href*="/tech-audit/"]');
  assert.ok(await ctas.count() > 0, 'Website reader needs an in-reader Tech Audit link');
  const href = await ctas.first().getAttribute('href');
  assert.ok(href, 'Website reader Tech Audit link needs a destination');
  const expectedSource = new URL(href, base).searchParams.get('source');
  assert.equal(expectedSource, '/services/custom-local-websites/',
    'Website reader inquiry link must carry its canonical reader path');
  await ctas.first().click();
  const host = page.locator('#detail [data-production-island="tech-audit"]');
  await host.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForFunction(() =>
    document.querySelector('[data-production-island="tech-audit"]')?.dataset.productionIslandMode === 'enhanced',
  { timeout: 15000 });
  await host.locator('.lf-audit__form').waitFor({ state: 'visible' });
  return expectedSource;
}

async function assertFragmentJump(page, width) {
  const formJump = page.locator('#detail .lf-audit-intro__channels a[href="#fit-step-title"]');
  await formJump.waitFor({ state: 'visible' });
  await formJump.click();
  await page.waitForFunction(() => {
    const detail = document.querySelector('#detail');
    const body = document.querySelector('#detail-body');
    const target = document.querySelector('#detail #fit-step-title');
    return Boolean(detail && body && target && detail.scrollTop === 0 && body.scrollTop > 0);
  });
  const dimensions = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return { top: value.top, right: value.right, bottom: value.bottom, left: value.left };
    };
    const detail = document.querySelector('#detail');
    const body = document.querySelector('#detail-body');
    const target = document.querySelector('#detail #fit-step-title');
    return {
      detailScrollTop: detail?.scrollTop,
      bodyScrollTop: body?.scrollTop,
      target: rect('#detail #fit-step-title'),
      rail: rect('#detail .reader-rail'),
      close: rect('#detail #close-detail'),
      viewport: { width: innerWidth, height: innerHeight },
    };
  });
  assert.equal(dimensions.detailScrollTop, 0, width + 'px: fixed reader shell cannot scroll');
  assert.ok(dimensions.bodyScrollTop > 0, width + 'px: reader body must reach the form');
  for (const pair of [['rail', dimensions.rail], ['close', dimensions.close]]) {
    const name = pair[0];
    const rect = pair[1];
    assert.ok(rect, width + 'px: ' + name + ' exists');
    assert.ok(rect.top >= -1 && rect.bottom <= dimensions.viewport.height + 1,
      width + 'px: ' + name + ' remains visible after Form jump');
  }
  assert.ok(dimensions.target.top >= 0 && dimensions.target.bottom <= dimensions.viewport.height + 1,
    width + 'px: Form target enters the reading viewport');
  return JSON.stringify(dimensions);
}

function assertRafTimestampDoesNotForce(storySource) {
  const listeners = new Map();
  let scheduled;
  const style = () => {
    const values = new Map();
    return {
      setProperty: (name, value) => values.set(name, value),
      removeProperty: (name) => values.delete(name),
      get: (name) => values.get(name),
    };
  };
  const distantScene = {
    dataset: { rwScene: 'gallery' },
    style: style(),
    getBoundingClientRect: () => ({ top: 5000, bottom: 5100, height: 100 }),
  };
  const root = {
    dataset: {},
    isConnected: true,
    parentElement: null,
    matches: (selector) => selector === '[data-reader-template="website-service"]',
    querySelector: () => null,
    querySelectorAll: (selector) => selector === '[data-rw-scene]' ? [distantScene] : [],
    getBoundingClientRect: () => ({ top: 0, bottom: 100, height: 100 }),
  };
  const body = { classList: { contains: () => false } };
  const document = {
    body,
    hidden: false,
    readyState: 'loading',
    addEventListener: (type, callback) => listeners.set(type, callback),
    removeEventListener: () => {},
    querySelectorAll: () => [],
  };
  const sandbox = {
    document,
    window: null,
    innerHeight: 1000,
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    getComputedStyle: () => ({ overflowY: 'visible' }),
    requestAnimationFrame: (callback) => { scheduled = callback; return 1; },
    cancelAnimationFrame: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    ResizeObserver: class { observe() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(storySource, sandbox, { filename: 'website-story.js' });
  sandbox.LFWebsiteStory.mount(root);
  distantScene.style.removeProperty('--rw-progress');
  listeners.get('scroll')();
  assert.equal(typeof scheduled, 'function', 'ordinary scroll schedules an animation frame');
  scheduled(2468.5);
  assert.equal(distantScene.style.get('--rw-progress'), undefined,
    'an ordinary rAF timestamp does not force an offscreen scene update');
}

async function run() {
  assertLocalCandidate();
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await check('standalone Tech Audit retains every immediate contact channel', async () => {
      const session = await makePage(browser, { width: 390, height: 844 });
      try {
        const response = await session.page.goto(base + '/tech-audit/', { waitUntil: 'networkidle', timeout: 30000 });
        assert.equal(response?.status(), 200, 'standalone Tech Audit must return 200');
        const channels = session.page.locator('.lf-audit-intro__channels');
        await channels.waitFor({ state: 'visible' });
        for (const href of ['tel:', 'sms:', 'mailto:', '#fit-step-title']) {
          await channels.locator('a[href^="' + href + '"]').waitFor({ state: 'visible' });
        }
        return 'Call, Text, Email, and Form remain visible outside the reader';
      } finally {
        await session.context.close();
      }
    });

    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      await check('in-reader Form jump preserves the reader shell at ' + viewport.width + 'px', async () => {
        const session = await makePage(browser, viewport);
        try {
          await openWebsiteReader(session.page);
          const expectedSource = await openInReaderTechAudit(session.page);
          const leadOrigin = await session.page.locator('#detail .lf-audit__form input[name="lead_origin"]').inputValue();
          assert.equal(leadOrigin, expectedSource, 'enhanced native form keeps the reader origin');

          const channels = session.page.locator('#detail .lf-audit-intro__channels');
          for (const href of ['tel:', 'sms:', 'mailto:']) {
            assert.equal(await channels.locator('a[href^="' + href + '"]').isVisible(), false,
              viewport.width + 'px: duplicate ' + href + ' channel must be removed in the card');
          }
          await channels.locator('a[href="#fit-step-title"]').waitFor({ state: 'visible' });

          const proofColor = await session.page.locator('#detail .lf-audit-intro__proof-links a').first()
            .evaluate((link) => getComputedStyle(link).color);
          assert.equal(proofColor, 'rgb(255, 120, 57)', 'proof links use opaque orange text');
          return await assertFragmentJump(session.page, viewport.width);
        } finally {
          await session.context.close();
        }
      });
    }

    for (const mobile of [
      { width: 320, textScale: 1 },
      { width: 390, textScale: 1 },
      { width: 390, textScale: 2 },
    ]) await check('gallery labels and contact controls remain whole at ' + mobile.width + 'px / ' + (mobile.textScale * 100) + '% text', async () => {
      const session = await makePage(browser, { width: mobile.width, height: 844 });
      try {
        await openWebsiteReader(session.page);
        if (mobile.textScale !== 1) {
          await session.page.addStyleTag({ content: 'html { font-size: ' + mobile.textScale + 'em !important; }' });
        }
        const plus = session.page.locator('#detail-body .rw-client-project__plus').first();
        await plus.scrollIntoViewIfNeeded();
        await plus.waitFor({ state: 'visible' });
        const gallery = await plus.evaluate((node) => {
          const link = node.closest('a');
          const plusRect = node.getBoundingClientRect();
          const linkRect = link?.getBoundingClientRect();
          return {
            whiteSpace: getComputedStyle(node).whiteSpace,
            linkText: link?.textContent ?? '',
            plus: { left: plusRect.left, right: plusRect.right },
            link: linkRect && { left: linkRect.left, right: linkRect.right },
          };
        });
        assert.equal(gallery.whiteSpace, 'nowrap', 'gallery plus must stay as one non-wrapping unit');
        assert.ok(gallery.linkText.includes('\u00a0+'), 'gallery label binds the plus with a non-breaking space');
        assert.ok(gallery.link && gallery.plus.left >= gallery.link.left - 1 && gallery.plus.right <= gallery.link.right + 1,
          'gallery plus stays inside its project link');

        const contact = session.page.locator('#detail-body .story-contact .contact-actions');
        await contact.scrollIntoViewIfNeeded();
        const layout = await contact.evaluate((container) => {
          const bounds = container.getBoundingClientRect();
          const controls = [...container.querySelectorAll('a')].map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              className: node.className,
              left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
              scrollWidth: node.scrollWidth, clientWidth: node.clientWidth,
            };
          });
          return { bounds: { left: bounds.left, right: bounds.right }, controls };
        });
        const plan = layout.controls.find((control) => String(control.className).includes('contact-plan'));
        const quick = layout.controls.filter((control) => control !== plan);
        assert.ok(plan && quick.length >= 3, 'story contact keeps three quick controls and one plan action');
        assert.ok(plan.top > Math.max(...quick.map((control) => control.bottom)) - 1,
          'the longer plan action uses its own row');
        assert.ok(plan.left >= layout.bounds.left - 1 && plan.right <= layout.bounds.right + 1,
          'the longer plan action remains inside the reader width');
        assert.ok(layout.controls.every((control) => control.scrollWidth <= control.clientWidth + 1),
          'contact labels do not overflow their controls');
        return 'gallery plus and four contact actions remain bounded at ' + mobile.width + 'px / ' + (mobile.textScale * 100) + '% text';
      } finally {
        await session.context.close();
      }
    });

    const storySource = fs.readFileSync(path.join(app, 'preview-ui', 'website-story.js'), 'utf8');
    await check('ordinary reader animation frames do not treat rAF timestamps as force', () => {
      assert.doesNotMatch(storySource, /requestAnimationFrame\(update\)/u);
      assert.match(storySource, /requestAnimationFrame\(\(\) => update\(\)\)/u);
      assertRafTimestampDoesNotForce(storySource);
      return 'source and VM prove an ordinary rAF timestamp does not force offscreen work';
    });
  } finally {
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(evidence, 'reader-audit.json'), JSON.stringify(report, null, 2) + '\n');
    await browser.close();
  }
  assert.equal(report.blockedMutations.length, 0, 'reader audit must not attempt a mutation');
  assert.equal(report.pageErrors.length, 0, 'page errors: ' + report.pageErrors.join('; '));
  assert.equal(report.localFailures.length, 0, 'local failures: ' + JSON.stringify(report.localFailures));
  console.log('PASS reader-audit — ' + report.assertions.length + ' local Chrome assertions.');
}

run().catch((error) => {
  report.finishedAt = new Date().toISOString();
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(path.join(evidence, 'reader-audit.json'), JSON.stringify(report, null, 2) + '\n');
  console.error(error.stack || error);
  process.exitCode = 1;
});
