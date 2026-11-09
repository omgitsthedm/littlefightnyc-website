/* Browser evidence for responsive tile-art selection.
 * Run against a local tile-preview server. It scrolls every illustrated tile
 * at 393 CSS px / DPR 3 and verifies the browser chose an existing source
 * that can cover the rendered art without a soft upsample. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:51944';
const app = path.resolve(__dirname, '..');
const delivery = JSON.parse(fs.readFileSync(path.resolve(app, '../.lifi/design-source/sculpture/delivery.json'), 'utf8'));
const widths = new Map(Object.values(delivery).flat().map(entry => [entry.file, entry.width]));
const report = { base, profiles: [], result: 'failed' };

function selectedWidth(src) {
  return widths.get(new URL(src).pathname.split('/').pop()) || 0;
}

async function measure(profile) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: profile.width, height: 900 },
    deviceScaleFactor: profile.dpr,
    isMobile: profile.width <= 600,
    hasTouch: profile.width <= 600,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    await page.goto(base + '/?qa=1', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const samples = [];
    const cards = page.locator('.sculpture-tile:has(.sculpture-art img)');
    for (let index = 0; index < await cards.count(); index += 1) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      const image = card.locator('.sculpture-art img');
      await image.evaluate(async element => { try { await element.decode(); } catch {} });
      samples.push(await image.evaluate((element, dpr) => {
        const box = element.getBoundingClientRect();
        return { src: element.currentSrc, cssWidth: box.width, required: Math.ceil(box.width * dpr) };
      }, profile.dpr));
    }
    const unresolved = samples.filter(sample => !selectedWidth(sample.src));
    // Use the recorded file dimensions, not density-adjusted naturalWidth,
    // and reject any selected source that would soften through upsampling.
    const undersized = samples.filter(sample => selectedWidth(sample.src) + 1 < sample.required).map(sample => ({
      ...sample,
      selectedWidth: selectedWidth(sample.src),
    }));
    const summary = {
      name: profile.name,
      dpr: profile.dpr,
      illustratedTiles: samples.length,
      selectedBytes: samples.reduce((total, sample) => total + (Object.values(delivery).flat().find(entry => entry.file === new URL(sample.src).pathname.split('/').pop())?.bytes || 0), 0),
      largestOversupplyRatio: Math.max(...samples.map(sample => selectedWidth(sample.src) / Math.max(1, sample.required))),
      unresolved,
      undersized,
    };
    report.profiles.push(summary);
    assert.equal(summary.illustratedTiles, 51, `${profile.name} did not load every illustrated tile`);
    assert.equal(unresolved.length, 0, `${profile.name} selected a source outside delivery.json`);
    assert.equal(undersized.length, 0, `${profile.name} selected undersized tile artwork: ${JSON.stringify(undersized)}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  await measure({ name: 'phone-retina', width: 393, dpr: 3 });
  await measure({ name: 'desktop', width: 1440, dpr: 1 });
  report.result = 'passed';
  console.log(JSON.stringify(report, null, 2));
})().catch(error => {
  report.error = error.stack;
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
});
