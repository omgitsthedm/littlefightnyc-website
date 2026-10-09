/* Read-only task journeys from the October 5 accessibility handoff. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');
const base = (process.env.ANSWER_HUB_URL || '').replace(/\/$/, '');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Local candidate only; never submit a production inquiry');
const out = path.resolve(__dirname, '../../.lifi/evidence/reader-audit/accessibility');
fs.mkdirSync(out, { recursive: true });
const report = { checks: [], violations: [], errors: [] };
const check = text => report.checks.push(text);
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 try {
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  const page = await context.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  async function axe(label, include) {
   let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
   if (include) builder = builder.include(include);
   const results = await builder.analyze();
   report.violations.push(...results.violations.map(v => ({ page: label, id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })) })));
  }
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  assert.match(await page.locator('.primary-nav .start-button').innerText(), /Get help/);
  assert.match(await page.locator('.primary-nav .start-button').getAttribute('href'), /intent=support/);
  assert.match(await page.locator('#explore-toggle').getAttribute('aria-label'), /Search answers/);
  await axe('homepage');
  await page.locator('#explore-toggle').click();
  assert.equal(await page.locator('#preview-search').evaluate(n => document.activeElement === n), true);
  await page.locator('#preview-search').fill('printer');
  const first = page.locator('#search-results a.search-result').first();
  await first.waitFor();
  await page.waitForFunction(() => document.querySelector('#search-results a.search-result')?.getAttribute('href')?.includes('/answers/help/printer/'));
  await axe('printer search', '#explore-menu');
  await page.screenshot({ path: path.join(out, 'printer-search-393.png') });
  await first.click();
  await page.locator('#detail[open] .story-title').waitFor();
  assert.match(await page.locator('#detail .story-title').innerText(), /print/i);
  assert.equal(await page.locator('#detail .story-hero .story-art').count(), 1, 'printer help has its approved subject illustration');
  assert.ok(await page.locator('#detail .story-hero').evaluate(hero => hero.querySelector('.story-art').getBoundingClientRect().top >= hero.querySelector('.story-summary').getBoundingClientRect().bottom - 1), 'the substantive diagnosis comes before its supporting illustration');
  assert.equal(await page.locator('#reader-previous').isVisible(), false, 'support answers do not divert into unrelated previous cards');
  assert.equal(await page.locator('#reader-next').isVisible(), false, 'support answers do not divert into unrelated next cards');
  assert.equal(await page.locator('#reader-hub').innerText(), 'Back to home +', 'return control names its actual destination');
  const printerArt = page.locator('#detail img.reader-context-image');
  assert.equal(await printerArt.count(), 1, 'printer help has one subject-specific physical illustration');
  assert.equal(await printerArt.getAttribute('src'), '/assets/sculpture/printer.webp', 'printer help must not use an unrelated trades photograph');
  assert.ok(await printerArt.getAttribute('alt'), 'the printer illustration has a useful text alternative');
  await axe('printer reader', '#detail');
  await page.locator('#detail-body a.contact-plan[href^="/tech-audit/?intent=support"]').click();
  const form = page.locator('#detail .lf-audit__form');
  await form.waitFor();
  assert.match(page.url(), /intent=support/);
  assert.equal(await form.locator('[name=lead_origin]').inputValue(), '/answers/help/printer/');
  await axe('support form', '#detail');
  await form.locator('button[type="submit"]').click();
  await form.locator('.lf-audit__error-summary').waitFor();
  await axe('support form errors', '#detail');
  await page.locator('#reader-back').click();
  await page.locator('#detail .story-title').filter({ hasText: /print/i }).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#detail').waitFor({ state: 'hidden' });
  assert.equal(new URL(page.url()).pathname, '/');
  await page.locator('#explore-menu[open]').waitFor();
  assert.equal(await page.locator('#preview-search').inputValue(), 'printer');
  await page.keyboard.press('Escape');
  await page.locator('#explore-menu').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('#explore-toggle').evaluate(n => document.activeElement === n), true);
  check('Visible help → printer search → useful answer → contextual support form → Back → Escape restores search, then the hub control');
  for (const route of ['/answers/help/email/', '/answers/help/wifi/', '/answers/help/it-password-ownership/', '/answers/help/backup/', '/answers/help/web-menu-and-hours/', '/answers/help/cost/']) {
   await page.goto(base + route, { waitUntil: 'networkidle' });
   const main = page.locator('[data-page-content]');
   assert.equal(await main.locator('h1').count(), 1);
   assert.equal(await main.locator('.story-hero .story-art').count(), route === '/answers/help/wifi/' ? 1 : 0, route + ': only the approved Wi-Fi subject illustration accompanies this answer');
   if (route === '/answers/help/wifi/') {
    assert.equal(await main.locator('.reader-support-opening img.reader-context-image').getAttribute('src'), '/assets/sculpture/router.webp');
    assert.ok(await main.locator('.story-hero').evaluate(hero => hero.querySelector('.story-art').getBoundingClientRect().top >= hero.querySelector('.story-summary').getBoundingClientRect().bottom - 1), 'Wi-Fi diagnosis precedes its supporting illustration');
   }
   assert.ok((await main.locator('.story-summary').innerText()).length > 45, route + ': immediate substantive answer');
   assert.ok(await page.locator('.workbench-page > .workbench-chrome .direct-contact-rail a[href^="tel:"]').isVisible());
   await axe(route, '[data-page-content]');
  }
  check('Six representative answers lead with the question and answer, preserve direct URLs, and keep human contact available');
  for (const [route, heading, source] of [
   ['/answers/help/email/', 'Give Microsoft 365 a named owner', 'learn.microsoft.com'],
   ['/answers/help/computer/', 'Move Mac and Windows work without surprises', 'support.microsoft.com'],
   ['/answers/help/it-password-ownership/', 'Keep device accounts easy to identify', 'support.apple.com'],
  ]) {
   await page.goto(base + route, { waitUntil: 'networkidle' });
   assert.equal(await page.getByRole('heading', { name: heading, exact: true }).count(), 1, 'platform guidance survives the grouped-reader compiler');
   assert.ok(await page.locator('[data-page-content] a[href*="' + source + '"]').count(), 'platform guidance retains its primary source');
  }
  check('Apple, Windows, and Microsoft 365 guidance and official sources reach the generated readers');
  await page.goto(base + '/library/', { waitUntil: 'networkidle' });
  await axe('library', '[data-page-content]');
  for (const viewport of [{ width: 568, height: 320 }, { width: 320, height: 480 }]) {
   await page.setViewportSize(viewport);
   await page.emulateMedia({ reducedMotion: 'no-preference' });
   await page.goto(base + '/', { waitUntil: 'networkidle' });
   await page.locator('.tile[data-reader-anchor="web"]').click();
   await page.locator('#detail[open]').waitFor();
   await page.locator('#close-detail').focus();
   await page.keyboard.press('Tab');
   assert.equal(await page.locator('#detail').evaluate(n => n.contains(document.activeElement)), true, 'Tab stays in the reader, including during opening');
   await page.waitForFunction(() => !document.querySelector('#detail .detail-window').hasAttribute('data-motion-phase'));
   const last = page.locator('#reader-next');
   await last.focus();
   await page.keyboard.press('Tab');
   assert.equal(await page.locator('#close-detail').evaluate(n => n === document.activeElement), true, 'last control wraps to close');
   const closeBox = await page.locator('#close-detail').boundingBox();
   assert.ok(closeBox && closeBox.y >= 0 && closeBox.y + closeBox.height <= viewport.height, 'close remains inside the short viewport');
   const scroll = await page.evaluate(() => {
    // The Workbench keeps one usable scroller within the dialog at short
    // heights while its close control stays in the viewport.
    const candidates = [document.querySelector('#detail-body'), document.querySelector('#detail .detail-window')];
    const scroller = candidates.find(n => n.scrollHeight > n.clientHeight && /auto|scroll/.test(getComputedStyle(n).overflowY));
    if (!scroller) return { found: false, candidates: candidates.map(n => ({ class: n.className, client: n.clientHeight, scroll: n.scrollHeight, overflow: getComputedStyle(n).overflowY })) };
    const windowTop = scrollY;
    scroller.scrollTo({ top: 100, behavior: 'instant' });
    return { found: true, height: scroller.clientHeight, top: scroller.scrollTop, pageMoved: windowTop !== scrollY };
   });
   assert.ok(scroll.found && scroll.height > 80 && scroll.top > 0 && !scroll.pageMoved, 'short viewport retains a usable scroller inside the reader without moving the page: ' + JSON.stringify(scroll));
   await page.keyboard.press('Escape');
   await page.locator('#detail').waitFor({ state: 'hidden' });
  }
  check('Short phone and landscape viewports keep scrolling and close available; keyboard input interrupts decorative opening and stays contained');
  assert.deepEqual(report.errors, [], 'no uncaught browser errors');
  assert.deepEqual(report.violations, [], 'automated WCAG checks must not report violations on sampled task surfaces');
  report.passed = true;
  await context.close();
 } catch (error) { report.passed = false; report.error = error.stack; process.exitCode = 1; }
 finally { await browser.close(); fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); }
})();
