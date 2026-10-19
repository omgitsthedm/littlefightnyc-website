/* Regression coverage for first paint, reader controls, and standalone branding. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, webkit} = require('@playwright/test');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:54627';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = process.env.UI_EVIDENCE_DIR || path.resolve(__dirname, '../../.lifi/evidence/ui-consistency');
fs.mkdirSync(out, {recursive: true});
const checks = [], errors = [];
const check = (name, condition, detail) => { checks.push({name, passed: !!condition, detail}); assert.ok(condition, name + ': ' + JSON.stringify(detail)); };
const ready = page => page.waitForFunction(() => document.documentElement.dataset.siteBoot === 'ready');
async function controls(page, label) {
  const result = await page.locator('#detail .workbench-chrome-top').evaluate(root => {
    const controls = [...root.querySelectorAll('a,button')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility === 'visible');
    const boxes = controls.map(el => ({name: el.textContent.trim(), box: el.getBoundingClientRect()}));
    const issues = [];
    for (let i = 0; i < boxes.length; i++) {
      const {name, box: a} = boxes[i];
      if (a.width < 44 || a.height < 44 || a.left < 0 || a.right > innerWidth + 1) issues.push('target: ' + name);
      const hit = document.elementFromPoint(a.x + a.width / 2, a.y + a.height / 2);
      if (!controls[i].contains(hit)) issues.push('covered: ' + name);
      for (const {name: other, box: b} of boxes.slice(i + 1)) {
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) issues.push(name + ' overlaps ' + other);
      }
    }
    return issues;
  });
  check(label + ' contact and card controls stay separate and reachable', !result.length, result);
}
async function snapshot(page, name) {
  await page.screenshot({path: path.join(out, name + '.png')});
}
(async () => {
  for (const [engine, type] of [['chrome', chromium], ['webkit', webkit]]) {
    const browser = await type.launch(engine === 'chrome' ? {channel: 'chrome', headless: true} : {headless: true});
    try {
      for (const width of [320, 393, 820, 1024, 1440, 1920]) {
        const page = await browser.newPage({viewport: {width, height: width < 500 ? 852 : 1000}, deviceScaleFactor: width < 500 ? 3 : 2});
        page.on('pageerror', e => errors.push(engine + ' ' + width + ': ' + e.message));
        await page.goto(base + '/?qa=1');
        await ready(page);
        await page.waitForFunction(() => [...document.querySelectorAll('.sculpture-hero img')].every(i => i.complete && i.naturalWidth), null, {timeout: 15000});
        const start = await page.evaluate(() => ({
          bootMs: performance.getEntriesByName('lf-first-view-ready')[0].startTime,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          heroLoaded: [...document.querySelectorAll('.sculpture-hero img')].every(i => i.complete && i.naturalWidth),
          inert: document.querySelector('.app-shell').inert,
          layout: document.querySelector('#canvas').dataset.layoutReady,
          canvasVisible: getComputedStyle(document.querySelector('#canvas')).visibility === 'visible',
        }));
        check(engine + ' ' + width + ' settled homepage', !start.overflow && start.heroLoaded && !start.inert && !!start.layout && start.canvasVisible, start);
        const tile = page.locator('#canvas a[href="/services/custom-local-websites/"]');
        await tile.scrollIntoViewIfNeeded();
        const idle = await page.locator('#canvas').evaluate(el => !el.querySelector('[data-clay-running="true"],.is-performing'));
        check(engine + ' ' + width + ' tiles do not animate on arrival', idle);
        await tile.click();
        await page.waitForFunction(() => document.querySelector('#detail').open && document.activeElement === document.querySelector('#close-detail'));
        await controls(page, engine + ' ' + width);
        const artwork = await page.locator('#detail-body .reader-clay-cutout img').evaluate(async el => { await el.decode(); return {src: el.currentSrc, width: el.naturalWidth, alphaSurface: getComputedStyle(el.closest('.clay-illustration')).backgroundColor}; });
        check(engine + ' ' + width + ' reader uses transparent clay AVIF/WebP', /\/clay-(avif|webp)\/[^/]+\.(avif|webp)$/.test(artwork.src) && artwork.alphaSurface === 'rgba(0, 0, 0, 0)', artwork);
        if (engine === 'chrome' && [393, 820, 1440].includes(width)) await snapshot(page, 'card-' + width);
        await page.locator('#reader-next').click();
        await page.locator('#reader-back').waitFor({state: 'visible'});
        // Card-to-card moves use a View Transition; check the settled reader.
        await page.waitForFunction(() => !document.documentElement.dataset.readerTurn);
        await controls(page, engine + ' ' + width + ' with Back');
        await page.locator('#reader-back').click();
        await page.waitForFunction(() => document.querySelector('#detail-body').dataset.readerPath === '/services/custom-local-websites/');
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('#detail').open);
        check(engine + ' ' + width + ' Escape restores tile focus', await tile.evaluate(el => document.activeElement === el));
        await page.close();
      }
      for (const width of [393, 820, 1440]) {
        const page = await browser.newPage({viewport: {width, height: 1000}});
        for (const route of ['/services/custom-local-websites/', '/answers/help/ownership/', '/examples/lab/', '/examples/lab/suites/cinema/', '/examples/lab/suites/construction/', '/examples/audit/', '/examples/audit/about/', '/examples/audit/contact/', '/examples/audit/privacy/', '/ads/', '/ads/concepts.html']) {
          await page.goto(base + route);
          await page.evaluate(() => document.fonts.ready);
          const state = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            heading: getComputedStyle(document.querySelector('h1')).fontFamily,
            brand: !!document.querySelector('.workbench-brand img[src^="/assets/brand/tugboat-clay"]'),
            contacts: [...document.querySelectorAll('.workbench-chrome-top a[href^="tel:"],.workbench-chrome-top a[href^="sms:"],.workbench-chrome-top a[href^="mailto:"]')].filter(el => el.getClientRects().length).length,
          }));
          check(engine + ' ' + width + ' direct brand ' + route, !state.overflow && state.heading.includes('LFReader') && state.brand && state.contacts === 3, state);
          if (route === '/examples/lab/') {
            await page.locator('.lab-hero__visual img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const art = await page.locator('.lab-hero__visual').evaluate(frame => {
              const images = [...frame.querySelectorAll('img')];
              return images.length === 2 && images.every(image => image.complete && image.naturalWidth > 0)
                && images.reduce((sum, image) => sum + image.getBoundingClientRect().width, 0) > frame.clientWidth * .85;
            });
            check(engine + ' ' + width + ' Lab hero images fill the frame', art);
            if (engine === 'chrome') await snapshot(page, 'labs-' + width);
          }
        }
        await page.close();
      }
      const fallback = await browser.newPage({javaScriptEnabled: false, viewport: {width: 393, height: 852}});
      await fallback.goto(base + '/');
      check(engine + ' no-JS page stays usable', await fallback.locator('.wordmark').isVisible() && !(await fallback.locator('.site-loading').isVisible()));
      await fallback.close();
      const reduced = await browser.newPage({reducedMotion: 'reduce'});
      await reduced.goto(base + '/'); await ready(reduced);
      check(engine + ' reduced motion is still', await reduced.locator('.sculpture-hero').getAttribute('data-motion') === 'paused');
      await reduced.close();
    } finally { await browser.close(); }
  }
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 393, height: 852}});
    await page.route('**/assets/clay-library/hero-diorama*', async route => { await new Promise(r => setTimeout(r, 1300)); await route.continue(); });
    await page.goto(base + '/', {waitUntil: 'domcontentloaded'});
    check('Slow artwork never hides the page', await page.locator('#home-title').isVisible() && await page.locator('.app-shell').isVisible() && !(await page.locator('.site-loading').count()));
    await snapshot(page, 'slow-artwork-first-view');
    await page.waitForFunction(() => document.querySelector('.clay-building img')?.complete && document.querySelector('.clay-building img').naturalWidth > 0, null, {timeout: 15000});
    check('Slow artwork appears when it arrives', true);
    await page.close();
    const stalled = await browser.newPage();
    await stalled.route('**/assets/clay-library/**', route => new Promise(resolve => setTimeout(resolve, 6000)).then(() => route.abort().catch(() => {})));
    await stalled.goto(base + '/', {waitUntil: 'domcontentloaded'});
    await ready(stalled);
    check('Stalled artwork cannot trap the visitor', await stalled.locator('.wordmark').isVisible());
    await stalled.close();
  } finally { await browser.close(); }
  check('No page JavaScript errors', errors.length === 0, errors);
  fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({checks, errors, physicalDevices: false}, null, 2));
  console.log('PASS UI consistency: ' + checks.length + ' checks across installed Chrome and WebKit.');
})().catch(error => { fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({checks, errors, failure: error.message}, null, 2)); console.error(error); process.exitCode = 1; });
