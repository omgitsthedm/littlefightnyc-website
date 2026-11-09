/* Local checks for the ambient field: motion preference, lifecycle, bounded
 * drawing, accessible controls, and unchanged tile geometry. Never submits. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require("/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/lfnyc-retina-performance-20261010/app/node_modules/@playwright/test");
const { AxeBuilder } = require("/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/lfnyc-retina-performance-20261010/app/node_modules/@axe-core/playwright");
const base = process.env.PREVIEW_URL;
assert(base && ['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'A local PREVIEW_URL is required');
const out = "/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/lfnyc-retina-performance-20261010/.lifi/evidence/retina-performance/bloom-motion/premium-surface";
fs.mkdirSync(out, { recursive: true });
const baselinePath = process.env.BLOOM_GEOMETRY_BASELINE;
const baseline = baselinePath ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : null;
const report = { base, checks: [], screenshots: [], errors: [], failedResources: [] };
const pass = (name, detail) => report.checks.push({ name, detail, passed: true });
const settle = async page => { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(650); };
async function contextFor(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  const page = await context.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) report.failedResources.push(r.url()); });
  return { context, page };
}
async function capture(page, name) {
  await page.waitForFunction(() => [...document.images].filter(image => {
    const r = image.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  }).every(image => image.complete && image.naturalWidth > 0));
  await page.evaluate(() => Promise.all([...document.images].filter(image => image.complete && image.naturalWidth).map(image => image.decode().catch(() => {}))));
  await page.screenshot({ path: path.join(out, name) });
  report.screenshots.push(name);
}
async function pixels(page) { return page.locator('.signal-field').evaluate(canvas => canvas.toDataURL()); }
async function runEngine(name, browserType) {
  const browser = await browserType.launch(name === 'chrome' ? { channel: 'chrome', headless: true } : { headless: true });
  try {
    const { context, page } = await contextFor(browser);
    await page.addInitScript(() => {
      window.signalDraws = 0;
      const clear = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function (...args) {
        if (this.canvas.classList.contains('signal-field')) window.signalDraws++;
        return clear.apply(this, args);
      };
    });
    await page.goto(base + '/?qa=1');
    await page.locator('.signal-field[data-state=running]').waitFor();
    await settle(page);
    const geometry = await page.locator('.signal-field').evaluate(c => ({ width: c.width, height: c.height, decorative: c.getAttribute('aria-hidden') === 'true', interactive: getComputedStyle(c).pointerEvents }));
    assert(geometry.width <= 1800 && geometry.height <= 1250 && geometry.decorative && geometry.interactive === 'none');
    const before = await pixels(page), start = await page.evaluate(() => window.signalDraws);
    await page.waitForTimeout(1100);
    const draws = await page.evaluate(() => window.signalDraws) - start;
    assert(draws >= 5 && draws <= 23, 'Ambient drawing must move and stay at or below 20fps');
    assert.notEqual(await pixels(page), before);
    pass(name + ': decorative, non-interactive animation with bounded resolution/frame rate', { geometry, drawsIn1100ms: draws });
    await capture(page, `after-home-${name}-1440.png`);
    await page.locator('.sculpture-services').scrollIntoViewIfNeeded();
    await capture(page, `after-services-${name}-1440.png`);
    await page.locator('#topic-web').scrollIntoViewIfNeeded();
    await capture(page, `after-tiles-${name}-1440.png`);
    for (const family of ['it', 'consulting', 'software']) {
      await page.locator('#topic-' + family).scrollIntoViewIfNeeded();
      await capture(page, `after-${family}-${name}-1440.png`);
    }
    await page.locator('#topic-web .tile').first().click();
    await page.locator('#detail[open]').waitFor();
    await page.waitForTimeout(150);
    const paused = await pixels(page);
    await page.waitForTimeout(250);
    assert.equal(await pixels(page), paused, 'Reader must stop background painting');
    assert.equal(await page.locator('.signal-field').getAttribute('data-state'), 'paused');
    await capture(page, `after-reader-${name}.png`);
    await page.locator('#close-detail').click();
    await page.locator('.signal-field[data-state=running]').waitFor();
    pass(name + ': opening a reader pauses the field; closing resumes it');
    await page.locator('#explore-toggle').click();
    await page.locator('.signal-field[data-state=paused]').waitFor({ state: 'attached' });
    await page.locator('#motion-toggle').click();
    await page.locator('#explore-menu .menu-close').click();
    assert.equal(await page.locator('body').evaluate(e => e.classList.contains('no-motion')), true);
    const still = await pixels(page);
    await page.waitForTimeout(250);
    assert.equal(await pixels(page), still);
    await page.reload(); await settle(page);
    assert.equal(await page.locator('.signal-field').count(), 0);
    assert.equal(await page.locator('[data-motion-toggle]').first().getAttribute('aria-pressed'), 'true');
    pass(name + ': pause stops drawing and persists across reload');
    await page.locator('.app-shell > .site-footer [data-motion-toggle]').click();
    await page.locator('.signal-field[data-state=running]').waitFor();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.signal-field[data-state=paused]').waitFor({ state: 'attached' });
    assert.equal(await page.locator('[data-motion-toggle]').first().isDisabled(), true);
    pass(name + ': device reduced-motion preference wins over saved motion preference');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.signal-field[data-state=running]').waitFor();
    await page.evaluate(() => {
      window.signalHidden = true;
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.signalHidden });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const hiddenCount = await page.evaluate(() => window.signalDraws);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.signalDraws), hiddenCount);
    await page.evaluate(() => { window.signalHidden = false; document.dispatchEvent(new Event('visibilitychange')); });
    await page.locator('.signal-field[data-state=running]').waitFor();
    pass(name + ': simulated hidden-tab lifecycle stops drawing and resumes safely');
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
    assert.deepEqual(violations.map(v => v.id), [], JSON.stringify(violations));
    pass(name + ': homepage accessibility scan passes');
    await context.close();

    for (const width of name === 'chrome' ? [360, 393, 600, 834, 1100, 1440] : [393, 834]) {
      const { context: c, page: p } = await contextFor(browser, { viewport: { width, height: 1000 }, reducedMotion: 'reduce', deviceScaleFactor: width < 700 ? 3 : 1 });
      await p.goto(base + '/?qa=1'); await settle(p);
      assert.equal(await p.locator('.signal-field').count(), 0, 'No canvas allocation on a reduced-motion visit');
      const tiles = await p.locator('#canvas .tile').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { href: e.getAttribute('href'), x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; }));
      assert.equal(tiles.length, 58);
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      if (name === 'chrome' && baseline) assert.deepEqual(tiles, baseline[width], `Tile geometry changed at ${width}px`);
      if ([393, 834].includes(width)) {
        await capture(p, `after-home-${name}-${width}.png`);
        await p.locator('.sculpture-services').scrollIntoViewIfNeeded();
        await capture(p, `after-services-${name}-${width}.png`);
        await p.locator('#topic-web').scrollIntoViewIfNeeded();
        await capture(p, `after-tiles-${name}-${width}.png`);
        if (width === 393) {
          await p.locator('#topic-it').scrollIntoViewIfNeeded();
          await capture(p, `after-it-${name}-${width}.png`);
        }
      }
      pass(name + ': 58 tiles fit at ' + width + 'px; reduced motion allocates no canvas' + (name === 'chrome' && baseline ? '; exact baseline geometry preserved' : ''));
      await c.close();
    }
    const fallback = await contextFor(browser, { javaScriptEnabled: false });
    await fallback.page.goto(base + '/?qa=1');
    assert.equal(await fallback.page.locator('#canvas .tile').count(), 58);
    assert.equal(await fallback.page.locator('[data-motion-toggle]').first().isVisible(), false);
    pass(name + ': script-free fallback retains all real tile links and hides inactive motion controls');
    await fallback.context.close();
    if (name === 'chrome') {
      for (const setting of ['save-data', 'forced-colors', 'blocked-storage']) {
        const limited = await contextFor(browser, setting === 'forced-colors' ? { forcedColors: 'active' } : {});
        if (setting === 'save-data') await limited.page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } }));
        if (setting === 'blocked-storage') await limited.page.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage blocked', 'SecurityError'); } }));
        await limited.page.goto(base + '/?qa=1'); await settle(limited.page);
        if (setting === 'blocked-storage') {
          await limited.page.locator('.signal-field[data-state=running]').waitFor();
          await limited.page.locator('.app-shell > .site-footer [data-motion-toggle]').click();
          await limited.page.locator('.signal-field[data-state=paused]').waitFor({ state: 'attached' });
        } else assert.equal(await limited.page.locator('.signal-field').count(), 0);
        pass(name + ': ' + setting + ' remains usable without unnecessary animation');
        await limited.context.close();
      }
    }
  } finally { await browser.close(); }
}
(async () => {
  await runEngine('chrome', chromium);
  await runEngine('webkit', webkit);
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.failedResources, []);
  report.result = 'passed';
  fs.writeFileSync(path.join(out, 'browser-verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ result: report.result, checks: report.checks.length, screenshots: report.screenshots.length }));
})().catch(error => {
  report.result = 'failed'; report.failure = error.stack;
  fs.writeFileSync(path.join(out, 'browser-verification.json'), JSON.stringify(report, null, 2));
  console.error(error); process.exitCode = 1;
});
