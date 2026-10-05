/* Read-only local browser contract for the answer finder. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const base = process.env.SEARCH_URL;
assert.ok(base && ['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Set SEARCH_URL to a local candidate.');
const fixtures = [
  ['printer', '/answers/help/printer/'],
  ['my email is not working', '/answers/help/email/'],
  ['emails going to spam', '/answers/help/email/#answer-email'],
  ['wifi keeps dropping', '/answers/help/wifi/'],
  ["can't sign in", '/answers/help/it-password-ownership/#answer-it-password-ownership'],
  ['change my hours', '/answers/help/maps/'],
  ['update my website', '/answers/help/web-site-health-check/'],
  ['website cost', '/answers/help/cost/'],
  ['website down', '/answers/website-down-emergency-nyc/'],
  ['internet down', '/answers/help/it-internet-outage/'],
  ['stop entering things twice', '/answers/help/software-duplicate-entry/'],
  ['roofing', '/industries/roofing/'],
  ['roofer', '/industries/roofing/']
];

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      return url.origin === new URL(base).origin && ['GET', 'HEAD'].includes(request.method()) ? route.continue() : route.abort('blockedbyclient');
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('#explore-toggle').click();
    const input = page.locator('#preview-search');
    for (const [query, expectedPath] of fixtures) {
      await input.fill(query);
      await page.waitForTimeout(180);
      assert.equal(await page.locator('.search-result').first().getAttribute('href'), expectedPath, `${query}: expected dedicated result first`);
    }
    await input.fill('zzzzzz');
    await page.waitForTimeout(180);
    assert.equal(await page.locator('.search-empty').innerText(), 'No clear match yet.');
    assert.equal(await page.getByRole('link', { name: "Can’t find it? Get help" }).getAttribute('href'), '/tech-audit/?intent=support&source=search-no-match');

    // Keyboard path: search field → clear control → first answer → reader.
    await input.fill('emails going to spam');
    await page.waitForTimeout(180);
    await input.focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'search-clear');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.search-result').first().evaluate(node => document.activeElement === node), true);
    await page.keyboard.press('Enter');
    await page.locator('#detail[open]').waitFor();
    assert.equal(page.url(), new URL('/answers/help/email/#answer-email', base).href);
    assert.ok(await page.locator('#detail-body').evaluate(node => node.scrollTop > 0), 'fragment result scrolls inside the reader');
    await page.goBack();
    await page.locator('#explore-menu[open]').waitFor();
    assert.equal(await input.inputValue(), 'emails going to spam', 'browser Back restores private search context');
    await page.locator('#search-clear').click();
    assert.equal(await input.inputValue(), '');
    assert.equal(await page.locator('.search-result').count(), 0);
    assert.deepEqual(errors, [], 'search journey has no uncaught browser errors');
    await context.close();
    console.log(`PASS browser search: ${fixtures.length + 11} assertions`);
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
