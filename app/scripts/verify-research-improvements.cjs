/* Read-only local journey checks for the October 5 research improvements. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const base = process.env.RESEARCH_URL;
assert.ok(base && ['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Use the local candidate only');
const out = path.resolve(__dirname, '../../.lifi/evidence/research-improvements');
fs.mkdirSync(out, { recursive: true });
const copies = require('../preview-content/inquiry-copy.json');
const report = { assertions: [], errors: [], viewports: [], screenshots: [] };
const pass = message => report.assertions.push(message);
async function context(browser, options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', ...options });
  await ctx.route('**/*', route => {
    const req = route.request();
    return new URL(req.url()).origin === new URL(base).origin && ['GET', 'HEAD'].includes(req.method())
      ? route.continue() : route.abort('blockedbyclient');
  });
  const page = await ctx.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  return { ctx, page };
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(out, name) });
  report.screenshots.push(name);
}
async function noOverflow(page, selector, label) {
  const bad = await page.locator(selector).evaluateAll(nodes => nodes.filter(node => node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 2).map(node => ({ tag: node.tagName, class: node.className, width: node.clientWidth, scroll: node.scrollWidth })));
  assert.deepEqual(bad, [], label);
}
async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 390, 768, 1440]) {
      const { ctx, page } = await context(browser, { viewport: { width, height: width > 600 ? 1000 : 844 } });
      await page.goto(base, { waitUntil: 'networkidle' });
      await noOverflow(page, 'html,.topbar,.tile[data-reader-anchor="web"]', `${width}: homepage fits`);
      assert.match(await page.locator('#explore-toggle').getAttribute('aria-label'), /Search answers/);
      assert.equal(await page.locator('.tile[data-reader-anchor="web"] .sculpture-object').count(), 1);
      const imageWidth = await page.locator('.tile[data-reader-anchor="web"] .sculpture-object').first().evaluate(el => el.getBoundingClientRect().width);
      assert.ok(imageWidth >= 44, `${width}: project preview remains meaningful (${imageWidth})`);
      await shot(page, `home-${width}.png`);
      await page.locator('#explore-toggle').click();
      await page.waitForFunction(() => document.activeElement?.id === 'preview-search');
      const lastExploreLink = page.locator('#explore-menu .menu-links a').last();
      await lastExploreLink.focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('menu-close')), true, `${width}: Tab from the final Explore action returns to the menu close control`);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await lastExploreLink.evaluate(link => document.activeElement === link), true, `${width}: Shift+Tab from close returns to the final Explore action`);
      await page.locator('[data-filter="software"]').click();
      await page.waitForFunction(() => document.activeElement?.closest('#topic-software'));
      pass(`${width}: named Services menu reaches Software with keyboard focus`);
      await page.locator('.tile[data-reader-anchor="web"]').click();
      await page.locator('#detail[open] .website-service-body').waitFor();
      const stories = page.locator('#detail [data-business-story]');
      assert.equal(await stories.count(), 3);
      assert.equal(await page.locator('#detail .rw-client-gallery .rw-client-project').count(), 9);
      assert.equal(await page.locator('#detail .rw-full-gallery').evaluate(el => el.open), false);
      await noOverflow(page, '#detail-body,.rw-proof-story,.rw-proof-story-copy', `${width}: reader text fits`);
      await page.locator('#detail-body').evaluate(el => {
        el.scrollTop += el.querySelector('#reader-work').getBoundingClientRect().top - el.getBoundingClientRect().top - 16;
      });
      await page.waitForFunction(() => {
        const body = document.querySelector('#detail-body').getBoundingClientRect();
        const visible = [...document.querySelectorAll('#detail [data-business-story] img')].filter(img => {
          const rect = img.getBoundingClientRect();
          return rect.bottom > body.top && rect.top < body.bottom;
        });
        return visible.length > 0 && visible.every(img => img.complete && img.naturalWidth > 0);
      });
      await shot(page, `reader-${width}.png`);
      await page.locator('#detail .rw-full-gallery > summary').click();
      assert.ok(await page.locator('#detail .rw-client-gallery').isVisible());
      await page.locator('#detail a[href*="/tech-audit/?intent=website"]').first().click();
      await page.locator('#detail .lf-audit__form').waitFor();
      assert.equal(await page.locator('#detail .lf-audit-intro h1').innerText(), copies.website.title);
      assert.equal(await page.locator('#detail').getAttribute('aria-label'), copies.website.title);
      assert.ok(await page.locator('#detail button[type="submit"]').filter({ hasText: copies.website.submit }).isVisible());
      assert.equal(await page.locator('#reader-previous').isVisible(), false);
      assert.equal(await page.locator('#reader-next').isVisible(), false);
      assert.ok(await page.locator('#reader-hub').isVisible());
      await noOverflow(page, '#detail-body,.lf-audit__form,.lf-audit-intro', `${width}: inquiry fits`);
      await shot(page, `inquiry-${width}.png`);
      await page.locator('#reader-back').click();
      await page.locator('#detail .website-service-body').waitFor();
      assert.ok(await page.locator('#reader-next').isVisible());
      await page.locator('#close-detail').click();
      await page.waitForFunction(() => !document.querySelector('#detail').open);
      pass(`${width}: Website → contextual inquiry → back → hub works`);
      report.viewports.push({ width, projectPreviewWidth: imageWidth });
      await ctx.close();
    }
    // The user can enlarge text without losing the menu or their answer.
    {
      const { ctx, page } = await context(browser);
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: 'html{font-size:200%!important}' });
      await page.locator('.tile[data-reader-anchor="web"]').click();
      await page.locator('#detail .website-service-body').waitFor();
      await noOverflow(page, 'html,#detail-body,.rw-proof-story,.rw-proof-story-copy', '200%: text reflows');
      assert.ok(await page.locator('#close-detail').isVisible());
      await shot(page, 'reader-text-200.png');
      pass('200% root text: proof copy reflows and exit remains visible');
      await ctx.close();
    }
    // A saved request must not be silently repurposed for another service.
    {
      const { ctx, page } = await context(browser);
      await page.goto(base + '/tech-audit/?intent=website', { waitUntil: 'networkidle' });
      await page.locator('#fit-name').fill('Local draft test');
      await page.locator('#fit-business').fill('Example business');
      await page.locator('#fit-message').fill('A website request, not a support request.');
      await page.waitForFunction(() => Object.values(sessionStorage).some(value => value.includes('Local draft test')));
      await page.goto(base + '/tech-audit/?intent=support', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#fit-name').inputValue(), '');
      assert.equal(await page.locator('#fit-business').inputValue(), '');
      assert.equal(await page.locator('#fit-message').inputValue(), '');
      pass('Switching services does not reassign an earlier request or its contact fields');
      await ctx.close();
    }
    // A second inquiry in the reader must not steal labels from the page behind it.
    {
      const { ctx, page } = await context(browser);
      await page.goto(base + '/tech-audit/?intent=website', { waitUntil: 'networkidle' });
      await page.locator('#fit-name').fill('Original local draft');
      await page.locator('#explore-toggle').click();
      await page.locator('#explore-menu .menu-links a[href="/services/custom-local-websites/"]').click();
      await page.locator('#detail .website-service-body').waitFor();
      assert.ok(await page.getByRole('dialog', { name: copies.website.title, exact: true }).isVisible());
      await page.locator('#detail a[href*="/tech-audit/?intent=website"]').first().click();
      await page.locator('#detail .lf-audit__form').waitFor();
      const name = page.locator('#detail').getByLabel('Your name', { exact: true });
      await name.fill('Updated in card');
      const nameId = await name.getAttribute('id');
      assert.equal(await page.locator(`[id="${nameId}"]`).count(), 1, 'modal input has its own label target');
      assert.equal(await page.locator('#fit-name').inputValue(), 'Original local draft');
      await page.locator('#detail .lf-audit-intro__channels a[href$="fit-step-title"]').click();
      assert.equal(await page.locator('#detail').evaluate(el => el.scrollTop), 0);
      await page.locator('#close-detail').click();
      await page.waitForURL(new URL('/', base).href);
      assert.ok(await page.locator('.tile[data-reader-anchor="web"]').isVisible());
      pass('Standalone inquiry → reader → inquiry keeps labels and fields separate, then exits to the hub');
      await ctx.close();
    }
    // Keep context even if the enhanced form never arrives, and keep it typed.
    {
      const { ctx, page } = await context(browser);
      await ctx.route('**/assets/TechAudit-*.js', route => route.abort('blockedbyclient'));
      await page.goto(base + '/tech-audit/?intent=website&source=%2Fservices%2Fcustom-local-websites%2F&url=https%3A%2F%2Fexamplebusiness.com', { waitUntil: 'networkidle' });
      const form = page.locator('form.static-inquiry');
      assert.equal(await form.locator('[name="intent"]').inputValue(), 'website');
      assert.equal(await page.locator('[data-inquiry-title]').innerText(), copies.website.title);
      assert.equal(await form.locator('[name="source"]').inputValue(), '/services/custom-local-websites/');
      assert.equal(await form.locator('[name="website_url"]').inputValue(), 'https://examplebusiness.com');
      await form.locator('[name="message"]').fill('Keep my draft while I choose a service.');
      await form.locator('[name="intent"]').selectOption('support');
      assert.equal(await page.locator('[data-inquiry-title]').innerText(), copies.support.title);
      assert.equal(await form.locator('[name="message"]').inputValue(), 'Keep my draft while I choose a service.');
      pass('Native inquiry preserves bounded context and entered message when enhancement is unavailable');
      await ctx.close();
    }
    for (const intent of ['support', 'consulting', 'systems', 'general']) {
      const { ctx, page } = await context(browser);
      await page.goto(`${base}/tech-audit/?intent=${intent}`, { waitUntil: 'networkidle' });
      await page.locator('.lf-audit__form').waitFor();
      assert.equal(await page.locator('.lf-audit-intro h1').innerText(), copies[intent].title);
      assert.ok(await page.getByRole('button', { name: copies[intent].submit, exact: true }).isVisible());
      assert.ok(await page.locator('.direct-contact-rail a[href^="tel:"]').isVisible());
      assert.equal(await page.locator('.lf-audit-intro__channels a[href^="tel:"]').isVisible(), false);
      if (intent === 'support') {
        assert.equal(await page.locator('.lf-audit-intro__channels').count(), 0, 'support leads directly to the form without a duplicate contact row');
      } else {
        assert.ok(await page.locator('.lf-audit-intro__channels a[href="#fit-step-title"]').isVisible());
      }
      pass(`${intent}: shared inquiry uses the right service copy`);
      await ctx.close();
    }
    {
      const { ctx, page } = await context(browser, { javaScriptEnabled: false });
      await page.goto(base + '/services/custom-local-websites/');
      assert.equal(await page.locator('[data-business-story]').count(), 3);
      assert.equal(await page.locator('.rw-client-project').count(), 9);
      await page.locator('.rw-full-gallery > summary').click();
      assert.ok(await page.locator('.rw-client-gallery').isVisible());
      await page.goto(base + '/tech-audit/');
      assert.ok(await page.locator('form.static-inquiry button[type="submit"]').isVisible());
      pass('Without JavaScript: real project links, native gallery and inquiry form remain available');
      await ctx.close();
    }
    assert.deepEqual(report.errors, [], 'No uncaught errors');
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
}
run().then(() => console.log(`PASS research improvements: ${report.assertions.length} journey assertions`)).catch(error => { console.error(error); process.exitCode = 1; });
