/*
 * Browser contract for working applications inside Little Fight reader cards.
 *
 * This never submits a form or follows an external source. It proves that the
 * nine Labs and VERA remain functional, same-origin reader experiences rather
 * than hard navigations away from the mosaic.
 *
 * CARD_APP_URL=http://127.0.0.1:4396 node scripts/verify-card-app.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.CARD_APP_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4396').replace(/\/$/, '');
const labs = JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'labs.json'), 'utf8'));
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'card-app');
const report = {
  kind: 'card-app-browser-verification', base, startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome', assertions: [], labs: [], vera: [],
  pageErrors: [], resourceFailures: [], blockedMutations: [],
};

function pass(name, detail = '') { report.assertions.push({ name, passed: true, detail }); }
async function check(name, task) {
  try { pass(name, (await task()) || ''); }
  catch (error) { report.assertions.push({ name, passed: false, detail: error.stack || String(error) }); throw error; }
}

async function makePage(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method())) {
      report.blockedMutations.push({ method: request.method(), url: request.url() });
      return route.abort('blockedbyclient');
    }
    await route.continue();
  });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('response', response => {
    if (new URL(response.url()).origin === new URL(base).origin && response.status() >= 400) {
      report.resourceFailures.push({ status: response.status(), url: response.url() });
    }
  });
  page.on('requestfailed', request => {
    if (new URL(request.url()).origin !== new URL(base).origin) return;
    const failure = request.failure()?.errorText || 'request failed';
    if (failure !== 'net::ERR_ABORTED') report.resourceFailures.push({ status: failure, url: request.url() });
  });
  return { context, page };
}

async function frameFor(page, demo) {
  await page.waitForFunction(expected => {
    const frame = document.querySelector('#detail[open] iframe.reader-demo-frame');
    return frame?.closest('[data-demo]')?.dataset.demo === expected && Boolean(frame.getAttribute('src'));
  }, demo, { timeout: 20_000 });
  const matching = page.locator(`#detail[open] [data-demo="${demo}"] iframe.reader-demo-frame`);
  await matching.waitFor({ state: 'attached', timeout: 20_000 });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const handle = await matching.elementHandle();
    const frame = await handle?.contentFrame();
    if (frame) {
      await frame.waitForLoadState('domcontentloaded', { timeout: 20_000 }).catch(() => {});
      return { frame, frameElement: matching };
    }
    await page.waitForTimeout(50);
  }
  throw new Error(`${demo}: iframe never received a browsing context`);
}

async function openCard(page, route, demo) {
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 45_000 });
  await page.evaluate(() => { window.__cardAppParentMarker = `reader-${Date.now()}`; });
  const tile = page.locator(`a.tile[href="${route}"]`).first();
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  await page.locator('#detail[open]').waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, route);
  assert.equal(new URL(page.url()).pathname, route, `${demo}: reader updates history without leaving the parent document`);
  const pair = await frameFor(page, demo);
  const child = await pair.frame.evaluate(() => ({
    href: location.href, embedded: self !== top, title: document.title, body: Boolean(document.body),
  }));
  assert.equal(child.embedded, true, `${demo}: working app must run inside the card iframe`);
  assert.ok(child.body && child.title, `${demo}: iframe needs a real document`);
  assert.equal(await page.evaluate(() => Boolean(window.__cardAppParentMarker)), true, `${demo}: iframe load must not replace parent document`);
  return pair;
}

async function closeCard(page) {
  const close = page.locator('#detail[open] #close-detail');
  await close.waitFor({ state: 'visible' });
  await close.click();
  await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
  await page.waitForFunction(() => !document.querySelector('#detail-body iframe.reader-demo-frame'), null, { timeout: 8_000 });
  assert.equal(new URL(page.url()).pathname, '/', 'reader X returns to the homepage hub');
}

async function assertCloseTarget(page, viewport) {
  const box = await page.locator('#detail[open] #close-detail').boundingBox();
  assert.ok(box, `${viewport.width}px: reader close must have a layout box`);
  assert.ok(box.width >= 44 && box.height >= 44, `${viewport.width}px: reader close target must be at least 44px`);
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height,
    `${viewport.width}px: reader close must remain visible in the viewport`);
  return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
}

async function assertReaderNavigation(page, route) {
  for (const id of ['reader-previous', 'reader-hub', 'reader-next']) {
    const button = page.locator(`#detail[open] #${id}`);
    await button.waitFor({ state: 'visible' });
    const box = await button.boundingBox();
    assert.ok(box && box.height >= 44, `${id}: visible 44px navigation target`);
  }
  const before = route;
  await page.locator('#detail[open] #reader-next').click();
  await page.waitForFunction(previous => document.querySelector('#detail-body')?.dataset.readerPath !== previous, before);
  const next = await page.locator('#detail-body').getAttribute('data-reader-path');
  assert.ok(next && next !== before, 'Next must open a different card without leaving the reader');
  await page.locator('#detail[open] #reader-back').click();
  await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, before);
  await page.locator('#detail[open] #reader-hub').click();
  await page.waitForFunction(() => !document.querySelector('#detail')?.open);
  assert.equal(new URL(page.url()).pathname, '/', 'All tiles returns to the mosaic hub');
  return { before, next };
}

async function runRepresentativeInteraction(frame, slug) {
  if (slug === 'micro-animations' || slug === 'studio-engine') {
    const button = frame.locator(slug === 'micro-animations' ? 'button[data-theme-btn]' : 'button[data-pick="wine"]');
    await button.waitFor({ state: 'visible', timeout: 15_000 });
    await button.click();
    return `${slug === 'micro-animations' ? 'theme toggle' : 'sample business choice'} clicked`;
  }
  if (slug === 'pool-room') {
    const video = frame.locator('video[data-pool-room-film]');
    await video.waitFor({ state: 'visible', timeout: 15_000 });
    const state = await video.evaluate(node => ({ controls: node.controls, playsInline: node.playsInline, readyState: node.readyState }));
    assert.equal(state.controls, true, 'Pool Room keeps native playback controls');
    assert.equal(state.playsInline, true, 'Pool Room keeps inline mobile playback');
    await video.click({ position: { x: 12, y: 12 } });
    return `video controls; readyState ${state.readyState}`;
  }
  if (slug === 'walkup-3d' || slug === 'terminal-3d') {
    const canvas = frame.locator('canvas[data-scene]');
    await canvas.waitFor({ state: 'visible', timeout: 20_000 });
    const state = await canvas.evaluate(node => ({ width: node.width, height: node.height, webgl: Boolean(node.getContext('webgl2') || node.getContext('webgl')) }));
    assert.ok(state.width > 0 && state.height > 0, `${slug}: WebGL canvas has render dimensions`);
    assert.equal(state.webgl, true, `${slug}: Chrome must provide a WebGL context`);
    return `WebGL ${state.width}×${state.height}`;
  }
  return 'document loaded';
}

async function run() {
  fs.mkdirSync(evidence, { recursive: true });
  assert.equal(labs.length, 9, 'Expected the nine approved Lab demos.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const desktop = { width: 1440, height: 940 };
    const { context, page } = await makePage(browser, desktop);
    try {
      await check('all nine Labs open inside reader cards and keep the parent document alive', async () => {
        for (const lab of labs) {
          const route = `/examples/lab/concepts/${lab.slug}/`;
          const { frame, frameElement } = await openCard(page, route, lab.slug);
          const src = await frameElement.getAttribute('src');
          assert.match(src || '', new RegExp(`/examples/lab/concepts/${lab.slug}/\\?embed=1$`), `${lab.slug}: iframe uses its canonical same-origin embed route`);
          const interaction = await runRepresentativeInteraction(frame, lab.slug);
          report.labs.push({ slug: lab.slug, route, src, interaction });
          await closeCard(page);
        }
        return '9 same-origin Lab iframes loaded, with video, interaction, and WebGL coverage';
      });

      await check('reader navigation persists and returns Previous, All tiles, and Next behavior', async () => {
        const route = '/examples/lab/concepts/micro-animations/';
        await openCard(page, route, 'micro-animations');
        const navigation = await assertReaderNavigation(page, route);
        return JSON.stringify(navigation);
      });

      await check('Escape from a focused Lab iframe closes the reader and unmounts its frame', async () => {
        const route = '/examples/lab/concepts/micro-animations/';
        const { frame } = await openCard(page, route, 'micro-animations');
        await frame.locator('body').click({ position: { x: 8, y: 8 } });
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
        await page.waitForFunction(() => !document.querySelector('#detail-body iframe.reader-demo-frame'), null, { timeout: 8_000 });
        assert.equal(new URL(page.url()).pathname, '/', 'iframe Escape returns to the hub');
        return 'child-frame Escape closes outer reader and cleans up iframe';
      });

      await check('a Lab inquiry CTA opens the top-level inquiry reader, Back restores the Lab, and All tiles returns to the hub', async () => {
        const labRoute = '/examples/lab/concepts/micro-animations/';
        const { frame } = await openCard(page, labRoute, 'micro-animations');
        const marker = `micro-cta-${Date.now()}`;
        await page.evaluate(value => { window.__cardAppCtaMarker = value; }, marker);
        const cta = frame.locator('.outro__cta[href^="/tech-audit/"]');
        await cta.scrollIntoViewIfNeeded();
        const ctaPath = await cta.getAttribute('href');
        assert.equal(ctaPath, '/tech-audit/?intent=website&source=lab', 'Micro CTA retains its declared inquiry route');
        await cta.click();
        await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, ctaPath, { timeout: 12_000 });
        assert.equal(new URL(page.url()).pathname, '/tech-audit/', 'Lab CTA changes the outer reader route');
        assert.equal(await page.evaluate(expected => window.__cardAppCtaMarker === expected, marker), true, 'Lab CTA must not replace the parent document');
        assert.equal(await page.locator('#detail-body iframe.reader-demo-frame').count(), 0, 'Lab iframe is released before the inquiry reader opens');
        await page.locator('#detail[open] #reader-back').click();
        await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, labRoute, { timeout: 12_000 });
        const restored = await frameFor(page, 'micro-animations');
        await restored.frame.locator('button[data-theme-btn]').waitFor({ state: 'visible', timeout: 15_000 });
        await page.locator('#detail[open] #reader-hub').click();
        await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
        assert.equal(new URL(page.url()).pathname, '/', 'All tiles returns to the hub after a Lab CTA reader trail');
        return 'Micro CTA → top-level inquiry reader → Back to working Lab → All tiles hub';
      });

      await check('VERA opens as an immersive, same-origin full-card working app', async () => {
        const { frame, frameElement } = await openCard(page, '/vera/', 'vera');
        assert.equal(await page.locator('#detail').getAttribute('data-reader-layout'), 'immersive');
        assert.match(await frameElement.getAttribute('src') || '', /\/vera\/\?embed=1$/, 'VERA iframe source');
        await frame.locator('[data-shell]').waitFor({ state: 'visible', timeout: 30_000 });
        const nav = frame.locator('a[data-nav="atlas"]').first();
        await nav.click();
        await frame.waitForFunction(() => location.hash.includes('/atlas'), null, { timeout: 10_000 });
        const closeBox = await assertCloseTarget(page, desktop);
        report.vera.push({ viewport: desktop, closeBox, childUrl: frame.url() });
        await closeCard(page);
        return 'VERA uses the full reader card, handles in-frame navigation, and retains a visible X';
      });
    } finally { await context.close(); }

    await check('VERA full card remains usable on a 390px phone', async () => {
      const mobile = { width: 390, height: 844 };
      const { context, page } = await makePage(browser, mobile);
      try {
        const { frame } = await openCard(page, '/vera/', 'vera');
        await frame.locator('[data-shell]').waitFor({ state: 'visible', timeout: 30_000 });
        const closeBox = await assertCloseTarget(page, mobile);
        report.vera.push({ viewport: mobile, closeBox, childUrl: frame.url() });
        await closeCard(page);
        return '390px VERA frame + persistent 44px close target';
      } finally { await context.close(); }
    });

    assert.deepEqual(report.blockedMutations, [], `Unexpected mutating requests: ${JSON.stringify(report.blockedMutations)}`);
    assert.deepEqual(report.pageErrors, [], `Page errors: ${report.pageErrors.join(' | ')}`);
    assert.deepEqual(report.resourceFailures, [], `Failed local resources: ${JSON.stringify(report.resourceFailures)}`);
    report.passed = true;
  } catch (error) {
    report.passed = false;
    report.failure = error.stack || String(error);
    throw error;
  } finally {
    report.completedAt = new Date().toISOString();
    fs.writeFileSync(path.join(evidence, 'card-app-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
    await browser.close();
  }
}

run().then(() => {
  console.log(`Card-app browser verification passed: ${report.assertions.length} assertions.`);
}).catch(error => {
  console.error(`Card-app browser verification failed: ${error.message}`);
  process.exitCode = 1;
});
