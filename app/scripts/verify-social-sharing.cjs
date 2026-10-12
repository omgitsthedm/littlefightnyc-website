/* Local-only browser checks: no actual shares, messages, or clipboard writes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('@playwright/test');

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:63453';
const evidence = path.resolve(__dirname, '../../.lifi/evidence/social-cards');
const origin = 'https://littlefightnyc.com';
fs.mkdirSync(evidence, { recursive: true });

(async () => {
  const checks = [];
  for (const engine of ['chrome', 'webkit']) {
    const browser = await (engine === 'chrome' ? chromium.launch({ channel: 'chrome' }) : webkit.launch());
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
      await context.addInitScript(() => {
        window.__copied = [];
        window.__shared = [];
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copied.push(value); } } });
        Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
        Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        return url.origin === new URL(base).origin && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort();
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      const homeImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      await page.locator('#canvas a[href="/services/it-support/"]').first().click();
      await page.waitForFunction(() => document.querySelector('#detail-body')?.dataset.readerPath === '/services/it-support/');
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin+'/services/it-support/');
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), origin+'/services/it-support/');
      assert.notEqual(await page.locator('meta[property="og:image"]').getAttribute('content'), homeImage);
      const group = page.locator('#detail-body .reader-share');
      await group.locator('[data-copy-page-link]').click();
      assert.deepEqual(await page.evaluate(() => window.__copied), [origin+'/services/it-support/']);
      assert.equal(await group.locator('[role="status"]').textContent(), 'Link copied.');
      checks.push(engine+': modal metadata and public canonical copy');

      await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable:true, value:async data => {window.__shared.push(data);} }));
      await group.locator('[data-native-share]').click();
      assert.equal(await page.evaluate(() => window.__shared.at(-1).url), origin+'/services/it-support/');
      checks.push(engine+': native share works without canShare');

      await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable:true, value:async () => {throw new DOMException('Cancelled', 'AbortError');} }));
      await group.locator('[data-native-share]').click();
      assert.equal(await page.evaluate(() => window.__copied.length), 1, 'cancelled share must not copy');
      checks.push(engine+': cancellation has no clipboard side effect');

      await page.evaluate(() => {navigator.clipboard.writeText=async () => {throw new Error('Permission denied');};});
      await group.locator('[data-copy-page-link]').click();
      assert.equal(await group.locator('[data-share-fallback]').isVisible(), true);
      assert.equal(await group.locator('[data-share-fallback]').getAttribute('href'), origin+'/services/it-support/');
      assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-share-fallback')), true);
      checks.push(engine+': blocked clipboard offers a focused usable link');

      await page.locator('#close-detail').click();
      await page.waitForFunction(() => !document.querySelector('#detail').open);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin+'/');
      assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), homeImage);
      checks.push(engine+': closing the reader restores home metadata');

      await page.setViewportSize({width:393,height:852});
      await page.goto(base+'/labs/pool-room/', {waitUntil:'networkidle'});
      const direct = page.locator('main[data-page-content] .reader-share');
      await direct.locator('[data-copy-page-link]').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => window.__copied.at(-1)), origin+'/labs/pool-room/');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), true);
      await direct.screenshot({path:path.join(evidence,`share-controls-${engine}-phone.png`)});
      assert.deepEqual(errors, []);
      checks.push(engine+': phone controls, keyboard copying and clear console');
    } finally { await browser.close(); }
  }
  fs.writeFileSync(path.join(evidence,'browser-checks.json'),JSON.stringify({checks},null,2)+'\n');
  console.log(`PASS ${checks.length} social sharing browser checks (Chrome and WebKit).`);
})().catch(error => { console.error(error);process.exitCode=1; });
