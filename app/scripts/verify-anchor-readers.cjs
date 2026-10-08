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
      const sizes = await page.locator('[data-reader-anchor]:not([data-reader-anchor=booking])').evaluateAll(nodes => nodes.map(n => ({ family:n.dataset.readerAnchor, width:n.getBoundingClientRect().width, height:n.getBoundingClientRect().height })));
      assert.equal(sizes.length, 5);
      const services = sizes.filter(x => x.family !== 'brand');
      const brand = sizes.find(x => x.family === 'brand');
      assert.ok(services.every(x => Math.abs(x.width - services[0].width) < 1), `equal four service anchor widths at ${width}: ${JSON.stringify(sizes)}`);
      for (const row of [services.slice(0, 2), services.slice(2)]) {
        assert.ok(row.every(x => Math.abs(x.height - row[0].height) < 1), `service pairs share a row height at ${width}: ${JSON.stringify(sizes)}`);
      }
      if (width > 600) assert.ok(services.every(x => Math.abs(x.height - services[0].height) < 1), `desktop service rows match at ${width}: ${JSON.stringify(sizes)}`);
      else assert.ok(services[2].height >= services[0].height, `phone second row makes room for copy and artwork at ${width}`);
      assert.ok(brand.width >= services[0].width, `the brand context card stays wider than a service anchor at ${width}: ${JSON.stringify(sizes)}`);
      for (const [family] of Object.entries(routes)) {
        const tile = page.locator(`a.tile[data-reader-anchor="${family}"]`);
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
      pass(`${width}px: service widths and paired row heights match, brand remains a wide context card, readers scroll independently, category colors hold, no horizontal overflow, Escape restores focus`);
      if (width === 390) {
        await page.addStyleTag({ content:'html{font-size:200%!important}' });
        for (const family of ['brand','it','consulting','software']) {
          await page.locator(`a.tile[data-reader-anchor="${family}"]`).click();
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
  // The owner removed the cursor; a shared ground contains the storefront.
  const current = await context(browser);
  try {
    const { page } = current;
    await page.goto(base + '/', { waitUntil:'networkidle' });
    const displays = page.locator('.sculpture-hero img');
    assert.equal(await displays.count(), 4);
    const sources = await displays.evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
    assert.deepEqual(sources, ['hero-stage','browser-chromatic-painting-design','browser-hair-by-rachel-charles','boat'].map(name => '/assets/sculpture/'+name+'.webp'));
    assert.equal(await page.locator('.hero-cursor').count(), 0);
    assert.ok(await displays.evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0)));
    assert.equal(await page.locator('.hero-work-index').count(), 0);
    assert.equal(await page.locator('.hero-project').count(), 2);
    assert.deepEqual(await page.locator('.sculpture-hero-actions a').evaluateAll(links => links.map(a => a.getAttribute('href'))), ['/tech-audit/', '/examples/']);
    await page.locator('#explore-toggle').click();
    await page.locator('#motion-toggle').click();
    await page.locator('#explore-menu .menu-close').click();
    assert.ok(await page.locator('body').evaluate(n => n.classList.contains('no-motion')));
    const tile = page.locator('[data-reader-anchor=web]');
    await tile.hover();
    assert.equal(await tile.locator('.sculpture-object').evaluate(n => getComputedStyle(n).transform), 'none');
    await page.emulateMedia({ reducedMotion:'reduce' });
    assert.deepEqual(await displays.evaluateAll(imgs => imgs.map(img => img.getAttribute('src'))), sources);
    pass('The reference hero has two authentic screens, a shared storefront ground and tugboat, with two useful actions and no pointer or caption rail; pause and reduced motion suppress decorative tile motion');
  } finally { await current.ctx.close(); }
  const plain = await context(browser, { javaScriptEnabled:false });
  try {
    await plain.page.goto(base + '/');
    assert.ok(await plain.page.locator('.sculpture-hero img').evaluateAll(imgs => imgs.length === 4 && imgs.every(img => img.complete && img.naturalWidth > 0)));
    assert.equal(await plain.page.locator('.sculpture-hero-actions a[href]').count(), 2);
    pass('Without JavaScript, the complete reference hero and both actions remain available');
  } finally { await plain.ctx.close(); }
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
