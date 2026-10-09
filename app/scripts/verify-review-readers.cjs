/*
 * Local Chrome proof for the source-faithful review card flip/readers.
 * Run after a tile-preview build: REVIEW_READERS_URL=http://127.0.0.1:65033 node app/scripts/verify-review-readers.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.REVIEW_READERS_URL || 'http://127.0.0.1:65033').replace(/\/$/, '');
const source = JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'reviews.json'), 'utf8')).reviews;
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'review-readers');
const report = { base, browser: 'Google Chrome via Playwright channel chrome', assertions: [], failures: [] };
fs.mkdirSync(evidence, { recursive: true });
function pass(name, detail) { report.assertions.push({ name, passed: true, detail }); }
async function check(name, fn) { try { pass(name, await fn()); } catch (error) { report.failures.push(error.stack || String(error)); throw error; } }
function routeFor(record) { return `/reviews/${record.id}/`; }
function assertLocal() { assert.ok(['127.0.0.1', 'localhost', '::1'].includes(new URL(base).hostname), 'Verifier only opens a local candidate.'); }
async function sourceLink(root, record) {
  const link = root.locator(`a[href="${record.sourceUrl}"]`);
  assert.equal(await link.count(), 1, `${record.id}: one direct Google source link`);
  assert.equal(await link.getAttribute('target'), '_blank', `${record.id}: source opens Google separately`);
  assert.match(await link.getAttribute('rel') || '', /noopener/, `${record.id}: source isolates Google`);
}
(async() => {
  assertLocal();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const record of source) {
      const context = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
      await context.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(request.method())) return route.abort('blockedbyclient');
        return route.continue();
      });
      const page = await context.newPage();
      const response = await page.goto(base + routeFor(record), { waitUntil: 'networkidle' });
      assert.equal(response?.status(), 200, `${record.id}: direct reader route returns 200`);
      const reader = page.locator('[data-review-reader="true"]');
      await reader.waitFor({ state: 'visible' });
      assert.equal(await reader.getAttribute('data-review-id'), record.id, `${record.id}: direct reader identity`);
      assert.match(await reader.innerText(), new RegExp(record.displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${record.id}: first-name source attribution`);
      if (record.excerpt) assert.match(await reader.innerText(), new RegExp(record.excerpt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${record.id}: exact source excerpt`);
      await sourceLink(reader, record);
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
    await context.route('**/*', route => {
      const request = route.request(); const url = new URL(request.url());
      if (url.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(request.method())) return route.abort('blockedbyclient');
      return route.continue();
    });
    const page = await context.newPage();
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    const jenna = page.locator('[data-review-id="google-review-1"]');
    await jenna.scrollIntoViewIfNeeded();
    await jenna.click();
    const reader = page.locator('#detail[open] [data-review-reader="true"]');
    await reader.waitFor({ state: 'visible', timeout: 10000 });
    assert.equal(await page.locator('#detail').getAttribute('open'), '', 'Jenna opens in the physical card reader');
    assert.equal(await reader.getAttribute('data-review-id'), 'google-review-1', 'Jenna reader follows the review tile');
    assert.equal(await page.locator('#detail').getAttribute('data-reader-family'), 'web', 'Jenna inherits Websites reader family');
    assert.equal(await page.locator('#detail .detail-window').getAttribute('data-reader-family'), 'web', 'Jenna reader window keeps Websites family');
    assert.equal(await reader.locator('.review-reader-kicker').evaluate(node => getComputedStyle(node).color), 'rgb(146, 191, 255)', 'Jenna review reader renders Websites blue accent');
    await sourceLink(reader, source[0]);
    await page.screenshot({ path: path.join(evidence, 'jenna-430x932.png') });
    await page.locator('#close-detail').click();
    await page.waitForFunction(() => !document.querySelector('#detail')?.open);
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-review-id')), 'google-review-1', 'closing returns focus to Jenna card');
    pass('Jenna tile flip, source link, blue family, and close focus', '430x932 screenshot captured');
    await context.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
