/* Read-only browser check for VERA's publication freshness signal. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.VERA_PREVIEW_URL || 'http://127.0.0.1:4394').replace(/\/$/, '');
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'tile-preview');
const fixture = JSON.parse(fs.readFileSync(path.join(app, 'tests', 'fixtures', 'vera-feed.json'), 'utf8'));
const workspace = {
  bracket: 'all', unit: 'all', hoods: [], areas: [], transit: 0,
  lens: { noBrokers: false, noMgmt: false, privateFirst: false },
  view: 'owner', density: 'comfortable', atlasMode: 'list',
};
const report = { kind: 'vera-freshness-browser-verification', base, startedAt: new Date().toISOString(), cases: [] };

function publication(generatedAt) {
  return JSON.stringify({ ...fixture, generated_at: generatedAt });
}

async function runCase(browser, name, body, verify) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const stored = JSON.stringify(workspace);
  const blocked = [];
  await context.addInitScript((value) => localStorage.setItem('vera-workspace', value), stored);
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (!['GET', 'HEAD'].includes(request.method())) {
      blocked.push({ method: request.method(), path: url.pathname });
      return route.abort('blockedbyclient');
    }
    if (url.origin === new URL(base).origin && url.pathname === '/vera/data/public.json') {
      return route.fulfill({ status: 200, contentType: 'application/json', body });
    }
    if (url.hostname === 'tiles.openfreemap.org') return route.fulfill({ status: 204, body: '' });
    return route.continue();
  });
  try {
    await page.goto(`${base}/vera/#/today`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await verify(page);
    assert.equal(await page.evaluate(() => localStorage.getItem('vera-workspace')), stored, `${name}: freshness handling changed saved workspace`);
    assert.deepEqual(blocked, [], `${name}: unexpected mutating request`);
    report.cases.push({ name, passed: true });
  } catch (error) {
    report.cases.push({ name, passed: false, detail: error.stack || String(error) });
    throw error;
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await runCase(browser, 'fresh publication keeps the stale banner hidden', publication(new Date().toISOString()), async page => {
      await page.waitForFunction(() => Boolean(window.__vera?.info?.().loaded), null, { timeout: 12_000 });
      assert.equal(await page.locator('[data-feed-freshness]').isHidden(), true);
    });
    await runCase(browser, 'stale publication explains its age', publication(new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString()), async page => {
      await page.waitForFunction(() => Boolean(window.__vera?.info?.().loaded), null, { timeout: 12_000 });
      const banner = page.locator('[data-feed-freshness]');
      await banner.waitFor({ state: 'visible' });
      assert.match(await banner.innerText(), /2 days old.*availability may have changed/i);
    });
    await runCase(browser, 'invalid publication does not present a false freshness state', '{"generated_at":"not-a-contract"}', async page => {
      await page.getByRole('button', { name: 'Try again' }).waitFor({ state: 'visible', timeout: 12_000 });
      assert.equal(await page.locator('[data-feed-freshness]').isHidden(), true);
    });
  } finally {
    await browser.close();
  }
  report.completedAt = new Date().toISOString();
  report.passed = report.cases.every(item => item.passed);
  fs.writeFileSync(path.join(evidence, 'vera-freshness-browser-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
}

main().catch(error => {
  report.completedAt = new Date().toISOString();
  report.passed = false;
  report.failure = error.stack || String(error);
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(path.join(evidence, 'vera-freshness-browser-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.error(error.stack || error);
  process.exitCode = 1;
});
