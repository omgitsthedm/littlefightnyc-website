/* Read-only checks for the answer hub and the reported mid-width layout regression. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const base = (process.env.ANSWER_HUB_URL || '').replace(/\/$/, '');
assert.ok(base && ['127.0.0.1', 'localhost', 'littlefightnyc.com'].includes(new URL(base).hostname), 'Use the local candidate or canonical live site');
const guides = require('../preview-content/answer-guides.json').guides;
const searchIndex = require('../dist/search-index.json');
const helpRoutes = searchIndex.filter(row => String(row.path || '').startsWith('/answers/help/')).map(row => row.path);
const evidence = path.resolve(__dirname, '../../.lifi/evidence/reader-audit/answer-hub-overhaul');
fs.mkdirSync(evidence, { recursive: true });
const report = { checks: [], layouts: [], errors: [], resources: [] };
const pass = message => report.checks.push(message);

async function openContext(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 924, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block', ...options });
  await context.route('**/*', route => {
    const req = route.request();
    return new URL(req.url()).origin === new URL(base).origin && ['GET', 'HEAD'].includes(req.method()) ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) report.resources.push(`${response.status()} ${response.url()}`); });
  return { context, page };
}

async function layout(page) {
  await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  return page.evaluate(() => {
    const tiles = [...document.querySelectorAll('a.tile')].filter(n => n.getClientRects().length);
    const rect = n => { const r = n.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
    const boxes = tiles.map(n => ({ id: n.dataset.answer, ...rect(n) }));
    const overlaps = boxes.flatMap((a, i) => boxes.slice(i + 1).filter(b => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1).map(b => [a.id, b.id]));
    const anchors = [...document.querySelectorAll('[data-editorial-front]')].map(n => ({ family: n.dataset.editorialFront, ...rect(n) }));
    return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, anchors, overlaps };
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 390, 600, 601, 768, 924, 1000, 1001, 1440]) {
      const { context, page } = await openContext(browser, { viewport: { width, height: 900 } });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      const measured = await layout(page);
      assert.ok(measured.documentWidth <= width + 1, `${width}: homepage reflows`);
      assert.deepEqual(measured.overlaps, [], `${width}: tiles must never cover one another`);
      const brand = measured.anchors.find(a => a.family === 'brand');
      const web = measured.anchors.find(a => a.family === 'web');
      assert.ok(brand && web && brand.bottom <= web.top + 1, `${width}: compact brand introduction precedes Websites`);
      if (width >= 601 && width <= 1000) {
        assert.ok(brand.height <= 210, `${width}: brand must not balloon (${brand.height}px)`);
        assert.ok(web.height <= 400, `${width}: website anchor must not balloon (${web.height}px)`);
      }
      assert.equal(await page.locator('.brand-anchor-art').count(), 0, `${width}: abstract filler is removed`);
      assert.match(await page.locator('.primary-nav .start-button').innerText(), /get help/i);
      report.layouts.push(measured);
      if ([390, 768, 924, 1440].includes(width)) await page.screenshot({ path: path.join(evidence, `home-${width}.png`) });
      await context.close();
    }
    pass('Nine widths: no overlapping tiles, no horizontal page overflow, compact mid-width anchors and clear contact label');

    const plain = await openContext(browser, { javaScriptEnabled: false });
    await plain.page.goto(base + '/library/');
    for (const route of helpRoutes) {
      assert.ok(await plain.page.locator(`[data-page-content] a[href="${route}"]`).count(), `${route}: static library link exists without JavaScript`);
    }
    for (const guide of guides) {
      await plain.page.goto(base + guide.path);
      const main = plain.page.locator('[data-page-content]');
      assert.equal(await main.locator('h1').count(), 1, `${guide.path}: one heading`);
      assert.equal((await main.locator('h1').innerText()).trim(), guide.heading);
      assert.ok(await main.locator('.guide-section').count() >= 3, `${guide.path}: substantive static guide`);
      assert.ok(await main.locator('table,ol,figure').count() >= 1, `${guide.path}: useful comparison, procedure or visual`);
      assert.ok(await main.locator('a[href^="https://"]').count() >= 1, `${guide.path}: source references`);
      assert.equal(await plain.page.locator('link[rel="canonical"]').getAttribute('href'), `https://littlefightnyc.com${guide.path}`);
      assert.match(await plain.page.locator('meta[name="robots"]').getAttribute('content'), /^index, follow/);
      assert.doesNotMatch(await main.innerText(), /How the work starts|company where the domain is registered account/);
      for (const protocol of ['tel:', 'sms:', 'mailto:']) assert.ok(await plain.page.locator(`.direct-contact-rail a[href^="${protocol}"]`).count());
    }
    await plain.context.close();
    pass('Every retained help route and eight direct guides have static library access; guide sources, visual structure, contacts and canonical/indexing state are preserved without JavaScript');

    for (const width of [320, 390, 924, 1440]) {
      const { context, page } = await openContext(browser, { viewport: { width, height: 900 } });
      await page.goto(base + '/library/', { waitUntil: 'networkidle' });
      for (const guide of guides) assert.ok(await page.locator(`[data-page-content] a[href="${guide.path}"]`).count(), `${guide.path}: reachable from the library`);
      await page.screenshot({ path: path.join(evidence, `library-${width}.png`) });
      const first = page.locator(`[data-page-content] a[href="${guides[0].path}"]`).first();
      const group = first.locator('xpath=ancestor::details').first();
      if (await group.count() && !await group.getAttribute('open').then(value => value !== null)) await group.locator('summary').click();
      await first.click();
      await page.locator('#detail[open] .guide-section').first().waitFor();
      assert.equal((await page.locator('#detail h1').innerText()).trim(), guides[0].heading, 'tile reader uses the same authored answer');
      assert.ok(await page.locator('#close-detail').isVisible());
      assert.ok(await page.locator('#detail-body').evaluate(n => n.scrollWidth <= n.clientWidth + 1), `${width}: guide fits its reader`);
      await page.screenshot({ path: path.join(evidence, `guide-${width}.png`) });
      if (width === 390) {
        await page.addStyleTag({ content: 'html{font-size:200%!important}' });
        assert.ok(await page.locator('#detail-body').evaluate(n => n.scrollWidth <= n.clientWidth + 1), '200% text: guide remains readable without page overflow');
      }
      await page.goBack();
      await page.locator('#detail').waitFor({ state: 'hidden' });
      assert.equal(new URL(page.url()).pathname, '/library/', 'browser Back restores the library');
      assert.ok(await first.evaluate(n => document.activeElement === n), 'Back returns keyboard focus to the answer link');
      await first.click();
      await page.locator('#detail[open] .guide-section').first().waitFor();
      await page.locator('#close-detail').click();
      await page.waitForURL(base + '/');
      assert.ok(await page.locator('.mosaic-home').isVisible(), 'the X explicitly returns to the homepage hub');
      await context.close();
    }
    pass('Library → guide → Back restores the link; X returns to the hub on phone, intermediate and desktop widths');
    assert.deepEqual(report.errors, [], 'no uncaught browser errors');
    assert.deepEqual(report.resources, [], 'no missing first-party resources');
    report.passed = true;
  } catch (error) {
    report.passed = false;
    report.error = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: report.passed, checks: report.checks, error: report.error, errors: report.errors, resources: report.resources }, null, 2));
  }
})();
