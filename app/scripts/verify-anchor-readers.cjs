/* Exercise anchor stories against a local release artifact, using installed Chrome. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const base = (process.env.ANCHOR_READER_URL || 'http://127.0.0.1:55116').replace(/\/$/, '');
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Local verification only');
const routes = {
  brand: '/how-we-help/', web: '/services/custom-local-websites/', it: '/services/it-support/',
  consulting: '/services/tech-consulting/', software: '/services/business-systems/',
};
const colors = { brand:'rgb(255, 120, 57)', web:'rgb(146, 191, 255)', it:'rgb(245, 217, 91)', consulting:'rgb(160, 223, 133)', software:'rgb(240, 155, 221)' };
const evidence = path.resolve(__dirname, '../../.lifi/evidence/reader-audit/anchors');
fs.mkdirSync(evidence, { recursive: true });
const report = { checks: [], errors: [], failures: [] };
const pass = value => report.checks.push(value);

async function context(browser, options = {}) {
  const ctx = await browser.newContext({ viewport:{ width:1440, height:940 }, ...options });
  await ctx.route('**/*', route => {
    const req = route.request();
    if (new URL(req.url()).origin !== new URL(base).origin || !['GET', 'HEAD'].includes(req.method())) return route.abort();
    return route.continue();
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) report.failures.push(r.url() + ': ' + r.status()); });
  return { ctx, page };
}

async function checkStatic(browser) {
  const { ctx, page } = await context(browser, { javaScriptEnabled:false });
  try {
    for (const [family, route] of Object.entries(routes)) {
      await page.goto(base + route);
      const main = page.locator('[data-page-content]');
      assert.equal(await main.locator('h1').count(), 1, `${family}: one clear heading`);
      assert.ok((await main.locator('[data-rw-scene]').count()) >= 6, `${family}: complete native story`);
      assert.ok((await main.locator('img').count()) >= 4, `${family}: visual explanation`);
      assert.ok((await main.locator('details').count()) >= 3, `${family}: useful native details`);
      for (const method of ['tel:', 'sms:', 'mailto:']) assert.equal(await page.locator(`.direct-contact-rail a[href^="${method}"]`).count(), 1);
      const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
      assert.ok(graph.some(x => x['@type'] === 'Organization'));
      assert.ok(graph.some(x => x['@type'] === 'WebPage'));
      if (family !== 'brand') assert.ok(graph.some(x => x['@type'] === 'Service'));
      const faqs = graph.find(x => x['@type'] === 'FAQPage');
      assert.ok(faqs?.mainEntity.length >= 3, `${family}: matching question schema`);
      const text = await main.evaluate(n => { const walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); const parts=[]; while(walker.nextNode()) parts.push(walker.currentNode.textContent); return parts.join(' ').replace(/\s+/g, ' '); });
      for (const faq of faqs.mainEntity) {
        assert.ok(text.includes(faq.name), `${family}: schema question exists in HTML`);
        assert.ok(text.includes(faq.acceptedAnswer.text.replace(/\s+/g, ' ')), `${family}: schema answer exists in HTML`);
      }
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://littlefightnyc.com' + route);
      assert.match(await page.locator('meta[name=robots]').getAttribute('content'), /^index, follow/);
      pass(`${family}: initial HTML includes full story, visual evidence, contacts, canonical metadata and matching FAQ schema`);
    }
  } finally { await ctx.close(); }
}

async function checkReaders(browser) {
  for (const width of [320,390,768,1024,1440]) {
    const { ctx, page } = await context(browser, { viewport:{ width, height:940 }, reducedMotion:'reduce' });
    try {
      await page.goto(base + '/', { waitUntil:'networkidle' });
      const sizes = await page.locator('[data-editorial-front]:not([data-editorial-front=booking])').evaluateAll(nodes => nodes.map(n => ({ family:n.dataset.editorialFront, width:n.getBoundingClientRect().width, height:n.getBoundingClientRect().height })));
      assert.equal(sizes.length, 5);
      const services = sizes.filter(x => x.family !== 'brand');
      const brand = sizes.find(x => x.family === 'brand');
      assert.ok(services.every(x => Math.abs(x.width - services[0].width) < 1 && Math.abs(x.height - services[0].height) < 1), `equal four service anchor dimensions at ${width}: ${JSON.stringify(sizes)}`);
      assert.ok(brand.height < services[0].height, `brand stays more compact at ${width}: ${JSON.stringify(sizes)}`);
      for (const [family] of Object.entries(routes)) {
        const tile = page.locator(`a.tile[data-editorial-front="${family}"]`);
        await tile.click();
        const main = page.locator('#detail-body');
        await main.locator('[data-rw-scene]').first().waitFor({ state:'visible' });
        const root = page.locator('#detail .lf-reader');
        assert.equal(await root.getAttribute('data-reader-family'), family);
        if (family !== 'web') {
          const headingColor = await main.locator('.anchor-story-body h2').first().evaluate(n => getComputedStyle(n).color);
          assert.equal(headingColor, colors[family]);
        }
        const jump = main.locator('.rw-benefits a').first();
        await jump.click();
        await page.waitForFunction(() => document.querySelector('#detail-body').scrollTop > 100);
        assert.ok(await page.locator('#close-detail').isVisible());
        assert.equal(await page.locator('#detail').evaluate(n => n.scrollTop), 0, 'the shell stays fixed while its story scrolls');
        await main.locator('details').first().evaluate(n => { n.open = true; });
        const layout = await main.evaluate(n => ({ width:n.clientWidth, scroll:n.scrollWidth, page:document.documentElement.scrollWidth, viewport:innerWidth }));
        assert.ok(layout.scroll <= layout.width + 1 && layout.page <= layout.viewport + 1, `${family}@${width} must not overflow: ${JSON.stringify(layout)}`);
        await main.evaluate(n => { n.scrollTop = 0; });
        await page.screenshot({ path:path.join(evidence, `${family}-${width}.png`) });
        await page.keyboard.press('Escape');
        await page.locator('#detail').waitFor({ state:'hidden' });
        assert.equal(await tile.evaluate(n => n === document.activeElement), true, 'closing restores focus');
      }
      pass(`${width}px: four service anchors match and brand is compact, readers scroll independently, category colors hold, no horizontal overflow, Escape restores focus`);
      if (width === 390) {
        await page.addStyleTag({ content:'html{font-size:200%!important}' });
        for (const family of ['brand','it','consulting','software']) {
          await page.locator(`a.tile[data-editorial-front="${family}"]`).click();
          await page.locator('#detail-body .anchor-story-body').waitFor({ state:'visible' });
          assert.ok(await page.locator('#detail-body').evaluate(n => n.scrollWidth <= n.clientWidth + 1), `${family}: enlarged text must wrap`);
          await page.keyboard.press('Escape');
        }
        pass('200% text: all new readers preserve content without horizontal overflow');
      }
    } finally { await ctx.close(); }
  }
}

async function checkRotation(browser) {
  const { ctx, page } = await context(browser);
  try {
    await page.goto(base + '/', { waitUntil:'networkidle' });
    const tile = page.locator('[data-editorial-front=web]');
    const rotator = tile.locator('[data-website-project-rotator]');
    await tile.scrollIntoViewIfNeeded();
    assert.equal(await rotator.locator('img').count(), 5, 'five genuine project previews');
    const sources = await rotator.locator('img').evaluateAll(images => images.map(i => i.getAttribute('src') || i.dataset.src));
    assert.equal(new Set(sources).size, 5);
    assert.ok(sources.every(src => src.startsWith('/assets/proof/')));
    assert.ok(await rotator.locator('img').first().evaluate(n => n.complete && n.naturalWidth > 0));
    await page.waitForFunction(() => document.querySelector('[data-website-project-rotator]').dataset.projectIndex === '1', { timeout:12000 });
    assert.ok(await rotator.locator('.is-active').evaluate(n => n.complete && n.naturalWidth > 0), 'replacement is decoded before display');
    await page.locator('#explore-toggle').click();
    await page.locator('#motion-toggle').click();
    await page.locator('#explore-menu .menu-close').click();
    const paused = await rotator.getAttribute('data-project-index');
    await page.waitForTimeout(7300);
    assert.equal(await rotator.getAttribute('data-project-index'), paused, 'explicit pause stops rotation');
    await page.locator('#explore-toggle').click();
    await page.locator('#motion-toggle').click();
    await page.locator('#explore-menu .menu-close').click();
    await tile.click();
    await page.locator('#detail-body .website-service-body').waitFor();
    await page.waitForTimeout(7300);
    assert.equal(await rotator.getAttribute('data-project-index'), paused, 'open reader suspends background rotation');
    await page.keyboard.press('Escape');
    await page.emulateMedia({ reducedMotion:'reduce' });
    await page.waitForTimeout(7300);
    assert.equal(await rotator.getAttribute('data-project-index'), paused, 'reduced motion preserves a static preview');
    pass('five real client frames rotate only after loading; explicit pause, reader open and reduced motion stop rotation');
  } finally { await ctx.close(); }
  const fallback = await context(browser, { javaScriptEnabled:false });
  try {
    await fallback.page.goto(base + '/');
    const first = fallback.page.locator('[data-website-project-rotator] img').first();
    assert.ok(await first.evaluate(n => n.complete && n.naturalWidth > 0 && getComputedStyle(n).opacity === '1'));
    pass('no JavaScript: the first real client preview remains visible');
  } finally { await fallback.ctx.close(); }
}

(async () => {
  const browser = await chromium.launch({ channel:'chrome', headless:true });
  try {
    await checkStatic(browser);
    await checkReaders(browser);
    await checkRotation(browser);
    assert.deepEqual(report.errors, [], 'no JavaScript errors');
    assert.deepEqual(report.failures, [], 'no missing local resources');
    report.passed = true;
  } catch (e) { report.passed = false; report.error = e.stack; process.exitCode = 1; }
  finally { await browser.close(); fs.writeFileSync(path.join(evidence, 'report.json'), JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); }
})();
