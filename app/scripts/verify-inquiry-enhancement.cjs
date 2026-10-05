/*
 * Local progressive-enhancement contract for the native Tech Audit inquiry.
 *
 * Holds the lazy TechAudit chunk long enough to simulate a person typing or
 * accepting browser autofill before React is ready. No request leaves the
 * local candidate; an otherwise-valid native POST is intercepted in memory.
 *
 *   INQUIRY_ENHANCEMENT_URL=http://127.0.0.1:4396 node scripts/verify-inquiry-enhancement.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.INQUIRY_ENHANCEMENT_URL || 'http://127.0.0.1:4396').replace(/\/$/, '');
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'inquiry-enhancement');
const screenshots = path.join(evidence, 'screenshots');
const report = {
  kind: 'inquiry-enhancement-browser-verification',
  base,
  startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome',
  assertions: [],
  blockedMutations: [],
  localFailures: [],
  pageErrors: [],
  posts: [],
};

function assertLocalCandidate() {
  const hostname = new URL(base).hostname;
  assert.ok(['127.0.0.1', 'localhost', '::1'].includes(hostname), `Inquiry verification refuses non-local origin: ${base}`);
}

function pass(name, detail = '') { report.assertions.push({ name, passed: true, detail }); }
function withTimeout(promise, milliseconds, message) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), milliseconds);
    promise.then(
      value => { clearTimeout(timeout); resolve(value); },
      error => { clearTimeout(timeout); reject(error); },
    );
  });
}
async function check(name, task) {
  try { pass(name, (await task()) || ''); }
  catch (error) {
    report.assertions.push({ name, passed: false, detail: error.stack || String(error) });
    throw error;
  }
}

async function heldTechAuditPage(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  let releaseChunk;
  let notifyHeld;
  const chunkReleased = new Promise(resolve => { releaseChunk = resolve; });
  const chunkHeld = new Promise(resolve => { notifyHeld = resolve; });
  const state = { chunkRequests: 0, released: false };
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== new URL(base).origin) return route.abort('blockedbyclient');
    if (request.method() === 'GET' && /^\/assets\/TechAudit-[^/]+\.js$/.test(url.pathname)) {
      state.chunkRequests += 1;
      notifyHeld();
      await chunkReleased;
      return route.continue();
    }
    if (request.method() === 'POST' && url.pathname === '/thanks/') {
      const fields = new URLSearchParams(request.postData() || '');
      report.posts.push({
        fieldNames: [...new Set([...fields.keys()])].sort(),
        formName: fields.get('form-name'),
        intent: fields.get('intent'),
        source: fields.get('source'),
      });
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Thanks</title><main>Thanks</main>' });
    }
    if (!['GET', 'HEAD'].includes(request.method())) {
      report.blockedMutations.push({ method: request.method(), url: request.url() });
      return route.abort('blockedbyclient');
    }
    await route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('response', response => {
    if (new URL(response.url()).origin === new URL(base).origin && response.status() >= 400) {
      report.localFailures.push({ status: response.status(), url: response.url() });
    }
  });
  const response = await page.goto(`${base}/tech-audit/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert.equal(response?.status(), 200, 'Tech Audit static candidate must return 200');
  await withTimeout(chunkHeld, 10_000, 'Timed out waiting for the local TechAudit chunk to be held.');
  const host = page.locator('[data-production-island="tech-audit"]');
  const form = host.locator('form.static-inquiry');
  await form.waitFor({ state: 'visible' });
  return {
    context, page, host, form, state,
    release: async () => { state.released = true; releaseChunk(); },
  };
}

async function assertNativeValuesAndFocus(page, expected) {
  for (const [name, value] of Object.entries(expected)) {
    assert.equal(await page.locator(`form.static-inquiry [name="${name}"]`).inputValue(), value, `${name} remains in native form`);
  }
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('name')), 'message', 'native message field retains focus');
}

async function run() {
  assertLocalCandidate();
  fs.mkdirSync(screenshots, { recursive: true });
  const probe = await fetch(base + '/tech-audit/');
  assert.equal(probe.status, 200, `Candidate unavailable at ${base}`);
  pass('local Tech Audit candidate is available');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await check('typed native inquiry survives delayed React enhancement and retains focus', async () => {
      const fixture = await heldTechAuditPage(browser);
      try {
        const expected = { name: 'Casey Test', business: 'Test Plumbing', website_url: 'testplumbing.example', contact: 'casey@example.test', message: 'Please make it easier to request an estimate.' };
        await fixture.form.locator('[name="name"]').fill(expected.name);
        await fixture.form.locator('[name="business"]').fill(expected.business);
        await fixture.form.locator('[name="website_url"]').fill(expected.website_url);
        await fixture.form.locator('[name="contact"]').fill(expected.contact);
        const message = fixture.form.locator('[name="message"]');
        await message.fill(expected.message);
        await message.focus();
        await fixture.release();
        await fixture.page.waitForFunction(() => document.querySelector('[data-production-island="tech-audit"]')?.dataset.productionIslandMode === 'native-inquiry');
        await assertNativeValuesAndFocus(fixture.page, expected);
        await fixture.page.screenshot({ path: path.join(screenshots, 'native-inquiry-390.png'), fullPage: true });

        const post = fixture.page.waitForResponse(response => new URL(response.url()).pathname === '/thanks/' && response.request().method() === 'POST');
        await fixture.form.locator('button[type="submit"]').click();
        await post;
        const payload = report.posts.at(-1);
        assert.deepEqual(payload, {
          fieldNames: ['bot-field', 'business', 'contact', 'follow_up', 'form-name', 'intent', 'message', 'name', 'source', 'website_url'],
          formName: 'tech-audit-scratch', intent: 'general', source: '/tech-audit/',
        }, 'native Netlify POST contract');
        return 'typed values + focus preserved; intercepted native Netlify payload remained valid';
      } finally { await fixture.context.close(); }
    });

    await check('an empty but focused native inquiry is never replaced mid-interaction', async () => {
      const fixture = await heldTechAuditPage(browser);
      try {
        const name = fixture.form.locator('[name="name"]');
        await name.focus();
        await fixture.release();
        await fixture.page.waitForFunction(() => document.querySelector('[data-production-island="tech-audit"]')?.dataset.productionIslandMode === 'native-inquiry');
        assert.equal(await fixture.form.locator('[name="name"]').inputValue(), '');
        assert.equal(await fixture.page.evaluate(() => document.activeElement?.getAttribute('name')), 'name');
        return 'focused empty form retained natively';
      } finally { await fixture.context.close(); }
    });

    await check('unfocused browser-autofilled native inquiry is never replaced without an input event', async () => {
      const fixture = await heldTechAuditPage(browser);
      try {
        const business = fixture.form.locator('[name="business"]');
        await business.evaluate((node, value) => { node.value = value; }, 'Autofilled Trade Co.');
        await fixture.page.locator('.topbar .wordmark').focus();
        assert.equal(await fixture.page.evaluate(() => document.activeElement?.closest('form.static-inquiry')), null, 'fixture focus must be outside the inquiry');
        await fixture.release();
        await fixture.page.waitForFunction(() => document.querySelector('[data-production-island="tech-audit"]')?.dataset.productionIslandMode === 'native-inquiry');
        assert.equal(await business.inputValue(), 'Autofilled Trade Co.', 'autofilled business value remains in native form');
        return 'unfocused value change without input event retained natively';
      } finally { await fixture.context.close(); }
    });

    await check('untouched native inquiry enhances after its route chunk becomes available', async () => {
      const fixture = await heldTechAuditPage(browser);
      try {
        await fixture.release();
        await fixture.page.waitForFunction(() => document.querySelector('[data-production-island="tech-audit"]')?.dataset.productionIslandMode === 'enhanced');
        assert.equal(await fixture.host.locator('form.static-inquiry').count(), 0, 'untouched fallback should hand off to the existing React form');
        assert.ok(await fixture.host.locator('form').count() > 0, 'existing enhanced inquiry form mounted');
        await fixture.page.screenshot({ path: path.join(screenshots, 'enhanced-inquiry-390.png'), fullPage: true });
        return 'untouched fallback hands off to existing React journey';
      } finally { await fixture.context.close(); }
    });

    await check('a shared site link pre-fills one editable enhanced field', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      try {
        const page = await context.newPage();
        await page.goto(`${base}/tech-audit/?intent=website&url=https%3A%2F%2Fexamplebusiness.com`, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => document.querySelector('[data-production-island="tech-audit"]')?.dataset.productionIslandMode === 'enhanced');
        const websiteField = page.locator('form [name="website_url"]');
        assert.equal(await websiteField.count(), 1, 'enhanced form keeps one registered website_url field');
        assert.equal(await websiteField.inputValue(), 'https://examplebusiness.com');
        await websiteField.fill('examplebusiness.com');
        assert.equal(await websiteField.inputValue(), 'examplebusiness.com', 'domain-only context remains editable');
        return 'shared URL prefills one editable enhanced field; a domain-only value is accepted';
      } finally { await context.close(); }
    });

    await check('choosing only a service before enhancement preserves the native selection', async () => {
      const fixture = await heldTechAuditPage(browser);
      try {
        await fixture.form.locator('[name="intent"]').selectOption('support');
        await fixture.page.locator('.topbar .wordmark').focus();
        await fixture.release();
        await fixture.page.waitForFunction(() => document.querySelector('[data-production-island="tech-audit"]')?.dataset.productionIslandMode === 'native-inquiry');
        assert.equal(await fixture.form.locator('[name="intent"]').inputValue(), 'support');
        return 'service-only choice preserved after focus leaves the form';
      } finally { await fixture.context.close(); }
    });

    await check('no-JavaScript inquiries submit the selected service instead of assuming website work', async () => {
      for (const intent of ['support', 'systems']) {
        const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
        let posted;
        await context.route('**/*', async route => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.origin !== new URL(base).origin) return route.abort('blockedbyclient');
          if (request.method() === 'POST' && url.pathname === '/thanks/') {
            posted = new URLSearchParams(request.postData() || '');
            return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Local receipt</title><main>Local test only</main>' });
          }
          if (!['GET', 'HEAD'].includes(request.method())) return route.abort('blockedbyclient');
          return route.continue();
        });
        try {
          const page = await context.newPage();
          await page.goto(`${base}/tech-audit/?intent=${intent}`);
          const form = page.locator('form.static-inquiry');
          assert.equal(await form.locator('[name="intent"]').inputValue(), '', 'without scripts the visitor explicitly chooses a service');
          await form.locator('[name="intent"]').selectOption(intent);
          const serviceControl = await form.locator('[name="intent"]').boundingBox();
          assert.ok(serviceControl && serviceControl.height >= 44, 'native service selector remains a comfortable touch target');
          await form.locator('[name="name"]').fill('Local service test');
          await form.locator('[name="business"]').fill('Example business');
          await form.locator('[name="contact"]').fill('service@example.test');
          await form.locator('[name="website_url"]').fill('examplebusiness.com');
          await form.locator('[name="message"]').fill('Local validation of the selected service.');
          await page.screenshot({ path: path.join(screenshots, `no-js-${intent}-390.png`), fullPage: true });
          // Exercise native keyboard submission with page JavaScript disabled.
          await form.locator('button[type="submit"]').press('Enter');
          await page.waitForURL(/\/thanks\//);
          assert.equal(posted?.get('intent'), intent);
          assert.equal(posted?.get('form-name'), 'tech-audit-scratch');
          assert.equal(posted?.get('website_url'), 'examplebusiness.com');
          assert.equal(new URL(page.url()).search, '', 'native form must not place personal details in the URL');
        } finally { await context.close(); }
      }
      return 'support and custom software native POSTs intercepted locally';
    });

    assert.equal(report.localFailures.length, 0, `Local failures: ${JSON.stringify(report.localFailures)}`);
    assert.equal(report.pageErrors.length, 0, `Page errors: ${report.pageErrors.join(' | ')}`);
    assert.equal(report.blockedMutations.length, 0, `Unexpected mutations: ${JSON.stringify(report.blockedMutations)}`);
    report.finishedAt = new Date().toISOString();
    report.passed = true;
  } catch (error) {
    report.finishedAt = new Date().toISOString();
    report.passed = false;
    report.error = error.stack || String(error);
    throw error;
  } finally {
    fs.writeFileSync(path.join(evidence, 'browser-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
    await browser.close();
  }
}

run().then(() => {
  console.log(`Inquiry enhancement verification passed: ${report.assertions.length} assertions.`);
}).catch(error => {
  console.error(`Inquiry enhancement verification failed: ${error.message}`);
  process.exitCode = 1;
});
