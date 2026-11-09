'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { chromium } = require('@playwright/test');
const app = path.resolve(__dirname, '..');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:64358';
const report = { checks: [], css: {}, images: 0 };
const pass = name => report.checks.push(name);
const manifest = JSON.parse(fs.readFileSync(path.join(app, '../.lifi/design-source/sculpture/reader-delivery.json')));
for (const [source, record] of Object.entries(manifest.images)) {
  for (const variant of record.variants) {
    const bytes = fs.readFileSync(path.join(app, 'public', variant.src));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), variant.sha256, variant.src);
    assert(variant.width <= record.width, `${source}: a delivery variant must not upscale its source`);
  }
  report.images++;
}
pass('Every reader image derivative matches its recorded source chain');
for (const file of ['home.css', 'site.css']) {
  const data = fs.readFileSync(path.join(app, 'dist', file));
  report.css[file] = { raw: data.length, gzip: zlib.gzipSync(data).length };
}
assert(report.css['home.css'].gzip < report.css['site.css'].gzip * 0.7, 'Home must save at least 30% of compressed CSS');
assert(report.css['home.css'].raw < 135000, 'Initial stylesheet exceeds the project budget');
pass('Homepage CSS is smaller without deleting reader styles');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [393, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const requests = [];
      page.on('request', request => requests.push(new URL(request.url()).pathname));
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let releaseCss;
      await page.route('**/site.css', async route => {
        await new Promise(resolve => { releaseCss = resolve; });
        await route.continue();
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      assert(!requests.includes('/site.css'), 'Full reader CSS loaded without reader intent');
      const proof = await page.locator('.homepage-proof__inner').evaluate(el => {
        const boxes = [...el.children].map(node => node.getBoundingClientRect());
        return {
          overlapping: boxes.some((a, i) => boxes.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1)),
          clipped: [...el.querySelectorAll('h2,h3,p,strong,a')].some(node => node.scrollWidth > node.clientWidth + 1 && getComputedStyle(node).display !== 'inline'),
        };
      });
      assert.deepEqual(proof, { overlapping: false, clipped: false }, 'Homepage process/proof content must remain readable');
      const boxes = () => page.locator('.sculpture-tile').evaluateAll(nodes => nodes.map(node => {
        const r = node.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height };
      }));
      const before = await boxes();
      const menu = page.locator(width < 600 ? '#menu-toggle' : '#explore-toggle');
      await menu.click();
      await page.locator('#explore-menu[open]').waitFor({ state: 'visible' });
      assert(!requests.includes('/site.css'), 'Search unnecessarily loads reader styles');
      await page.keyboard.press('Escape');
      await page.locator('.sculpture-work').first().click();
      await page.waitForFunction(() => !!document.querySelector('#reader-styles'));
      await page.waitForTimeout(200);
      assert.equal(await page.locator('#detail[open]').count(), 0, 'Reader opens before styles arrive');
      releaseCss();
      await page.locator('#detail[open]').waitFor({ state: 'visible' });
      await page.locator('#close-detail').click();
      await page.locator('#detail[open]').waitFor({ state: 'hidden' });
      const after = await boxes();
      assert.equal(after.length, before.length);
      for (let i = 0; i < before.length; i++) for (const key of ['x', 'y', 'w', 'h']) {
        assert(Math.abs(before[i][key] - after[i][key]) < 1, `Reader CSS changed tile ${i} ${key}`);
      }
      assert.equal(requests.filter(p => p === '/site.css').length, 1);
      assert.deepEqual(errors, []);
      pass(`${width}px: deferred CSS, usable search, styled card flip, stable return geometry`);
      await page.close();
    }
    const fallback = await browser.newPage();
    let attempts = 0;
    await fallback.route('**/site.css', route => ++attempts === 1 ? route.abort() : route.continue());
    await fallback.goto(base, { waitUntil: 'networkidle' });
    await fallback.evaluate(() => { window.__readerMarker = true; });
    await fallback.locator('.sculpture-work').first().click();
    await fallback.waitForURL('**/examples/');
    await fallback.waitForLoadState('networkidle');
    assert.equal(await fallback.evaluate(() => window.__readerMarker), undefined);
    assert(await fallback.evaluate(() => !!document.querySelector('#reader-styles')?.sheet));
    pass('Failed lazy stylesheet recovers through the fully styled native page');
    await fallback.close();
    console.log(JSON.stringify({ ...report, result: 'passed' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
