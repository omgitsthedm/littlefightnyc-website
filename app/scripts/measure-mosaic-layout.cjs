/* Runtime evidence that the mosaic ignores redundant layout requests while
 * still repacking after a real width or text-size change. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:51944';
const report = { base, result: 'failed' };

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(550);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    await page.goto(base + '/?qa=1', { waitUntil: 'networkidle' });
    await settle(page);
    report.stable = await page.evaluate(() => new Promise(resolve => {
      const canvas = document.querySelector('#canvas');
      const observer = new MutationObserver(records => {
        changes += records.filter(record => record.type === 'attributes').length;
      });
      let changes = 0;
      observer.observe(canvas, { subtree: true, attributes: true, attributeFilter: ['style', 'data-columns', 'data-rows', 'data-shape', 'data-wrap-word'] });
      window.LF_MOSAIC.layout();
      window.LF_MOSAIC.layout();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        observer.disconnect();
        resolve({ changes, tiles: canvas.querySelectorAll('.sculpture-tile').length });
      }));
    }));
    await page.setViewportSize({ width: 394, height: 852 });
    await settle(page);
    report.resize = await page.evaluate(() => ({
      tiles: document.querySelectorAll('#canvas .sculpture-tile').length,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      vacancies: [...document.querySelectorAll('[data-topic-grid]:not([data-sculpture-layout=compact])')].some(grid => grid.dataset.packVacancies === 'true'),
    }));
    report.textZoom = await page.evaluate(() => {
      const title = document.querySelector('#canvas .sculpture-title');
      title.style.setProperty('font-size', `${parseFloat(getComputedStyle(title).fontSize) * 2}px`, 'important');
      return true;
    });
    await settle(page);
    report.textZoom = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      tiles: document.querySelectorAll('#canvas .sculpture-tile').length,
    }));
    assert.equal(report.stable.tiles, 58);
    assert.equal(report.stable.changes, 0, 'unchanged layout calls rewrote the mosaic');
    assert.equal(report.resize.tiles, 58);
    assert.equal(report.resize.overflow, false);
    assert.equal(report.resize.vacancies, false);
    assert.equal(report.textZoom.tiles, 58);
    assert.equal(report.textZoom.overflow, false);
    report.result = 'passed';
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  report.error = error.stack;
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
});
