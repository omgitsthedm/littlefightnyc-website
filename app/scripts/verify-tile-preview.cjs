/*
 * Browser verification for the isolated tile preview.
 *
 * Run after `python3 app/scripts/build-tile-preview.py` and a local static
 * server are available. This stays local: it blocks every non-GET request
 * and writes only evidence under .lifi/evidence/tile-preview.
 *
 *   PREVIEW_URL=http://127.0.0.1:4393 node app/scripts/verify-tile-preview.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

const app = path.resolve(__dirname, '..');
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'tile-preview');
const screenshots = path.join(evidence, 'screenshots');
const base = (process.env.PREVIEW_URL || 'http://127.0.0.1:4393').replace(/\/$/, '');
const productionMode = process.env.TILE_DIST === 'production' || new URL(base).port === '4394';
const artifactDir = productionMode ? 'dist' : 'preview-dist';
const releaseFilename = productionMode ? 'tile-release.json' : 'preview-release.json';
const report = {
  kind: 'tile-preview-browser-verification',
  base,
  startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome',
  assertions: [],
  viewports: [],
  pageErrors: [],
  resourceFailures: [],
  blockedMutations: [],
  axe: [],
  routeAudit: [],
  performance: [],
};

fs.mkdirSync(screenshots, { recursive: true });
const pass = (name, detail = '') => report.assertions.push({ name, passed: true, detail });
const check = async (name, task) => {
  try { const detail = await task(); pass(name, detail || ''); }
  catch (error) { report.assertions.push({ name, passed: false, detail: error.stack || String(error) }); throw error; }
};
const sameOrigin = raw => new URL(raw).origin === new URL(base).origin;

async function makePage(browser, viewport, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion });
  const page = await context.newPage();
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method())) {
      report.blockedMutations.push({ method: request.method(), url: request.url() });
      return route.abort('blockedbyclient');
    }
    await route.continue();
  });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('response', response => {
    if (sameOrigin(response.url()) && response.status() >= 400) report.resourceFailures.push({ status: response.status(), url: response.url() });
  });
  page.on('requestfailed', request => {
    const failure = request.failure()?.errorText || 'request failed';
    if (sameOrigin(request.url()) && failure !== 'net::ERR_ABORTED') report.resourceFailures.push({ status: failure, url: request.url() });
  });
  return { context, page };
}

async function expectNoOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.documentElement.clientWidth,
    dialog: document.querySelector('#detail')?.open
      ? document.querySelector('#detail .detail-window')?.scrollWidth - document.querySelector('#detail .detail-window')?.clientWidth
      : 0,
  }));
  assert.ok(overflow.document <= 1, `${label}: document overflow ${overflow.document}px`);
  assert.ok(overflow.body <= 1, `${label}: body overflow ${overflow.body}px`);
  assert.ok(overflow.dialog <= 1, `${label}: dialog overflow ${overflow.dialog}px`);
  return JSON.stringify(overflow);
}

async function auditAxe(page, label) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length,
    targets: violation.nodes.slice(0, 5).map(node => node.target),
  }));
  report.axe.push({ page: label, violations });
  assert.equal(violations.length, 0, label + ' Axe violations: ' + violations.map(item => item.id).join(', '));
  return 'full Axe audit including color contrast';
}

async function inspectWebsiteBody(page, label) {
  const body = page.locator('.rw-body');
  await body.waitFor({ state: 'visible' });
  assert.equal(await page.locator('.rw-waterfall .rw-project').count(), 3, label + ': three approved work cards');
  assert.equal(await page.locator('.rw-ownership').count(), 1, label + ': ownership section');
  assert.match(await page.locator('.rw-ownership').innerText(), /Your site\.\s*Your keys\./i, label + ': ownership copy');
  const scrollProof = await page.evaluate(() => {
    const detail = document.querySelector('#detail');
    const target = document.querySelector('.rw-ownership');
    const scroller = detail?.open ? document.querySelector('#detail-body') : document.scrollingElement;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    const before = scroller.scrollTop;
    const previousBehavior = scroller.style.scrollBehavior;
    scroller.style.scrollBehavior = 'auto';
    if (detail?.open) scroller.scrollTop = Math.min(maxScroll, target.offsetTop);
    else window.scrollTo({ top: Math.min(maxScroll, target.getBoundingClientRect().top + window.scrollY), behavior: 'instant' });
    const after = detail?.open ? scroller.scrollTop : window.scrollY;
    scroller.style.scrollBehavior = previousBehavior;
    return { maxScroll, before, after };
  });
  assert.ok(scrollProof.maxScroll > 0 && scrollProof.after > scrollProof.before, label + ': waterfall and ownership must be reachable by scrolling');
  const overflow = await expectNoOverflow(page, label);
  report.routeAudit.push({ label, route: new URL(page.url()).pathname, waterfallProjects: 3, ownership: true, scrollProof, overflow: JSON.parse(overflow) });
  return 'waterfall + ownership; ' + JSON.stringify(scrollProof) + '; ' + overflow;
}

async function inspectDirectContactRail(page, label) {
  const rail = page.locator('.direct-contact-rail');
  await rail.waitFor({ state: 'visible' });
  assert.equal(await rail.evaluate(node => getComputedStyle(node).position), 'sticky', `${label}: contact rail must use sticky positioning`);
  const before = await rail.boundingBox();
  assert.ok(before, `${label}: contact rail must have a layout box`);
  await page.evaluate(() => window.scrollTo({ top: 1300, behavior: 'instant' }));
  await page.waitForTimeout(40);
  const after = await rail.boundingBox();
  assert.ok(after, `${label}: contact rail disappeared after scroll`);
  assert.ok(after.y >= 0 && after.y <= 120, `${label}: contact rail scrolled out of view (${Math.round(after.y)}px)`);
  return JSON.stringify({ beforeTop: Math.round(before.y), afterTop: Math.round(after.y) });
}

async function coldMobileRun(run) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const { context, page } = await makePage(browser, { width: 390, height: 844 });
    const session = await context.newCDPSession(page);
    await session.send('Network.enable');
    await session.send('Network.setCacheDisabled', { cacheDisabled: true });
    await session.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: Math.round((1.6 * 1024 * 1024) / 8),
      uploadThroughput: Math.round((750 * 1024) / 8),
      connectionType: 'cellular3g',
    });
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__tilePreviewVitals = { lcp: null, cls: 0 };
      try {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) window.__tilePreviewVitals.lcp = last.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) window.__tilePreviewVitals.cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (_) {}
    });
    const started = Date.now();
    await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const byteSum = predicate => resources.filter(entry => predicate(entry.name)).reduce((total, entry) => total + (entry.transferSize || 0), 0);
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        lcpMs: window.__tilePreviewVitals?.lcp ?? null,
        cls: window.__tilePreviewVitals?.cls ?? 0,
        jsBytes: byteSum(name => /\.js(?:\?|$)/.test(name)),
        cssBytes: byteSum(name => /\.css(?:\?|$)/.test(name)),
        totalTransferBytes: resources.reduce((total, entry) => total + (entry.transferSize || 0), 0),
        resourceCount: resources.length,
        ttfbMs: nav?.responseStart ?? null,
        domContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
        loadMs: nav?.loadEventEnd ?? null,
      };
    });
    report.performance.push({ run, profile: 'cold mobile 390px, 4x CPU, 1.6Mbps, 150ms RTT', elapsedMs: Date.now() - started, ...metrics });
    await context.close();
  } finally {
    await browser.close();
  }
}

async function openTile(page, href) {
  const tile = page.locator(`a.tile[href="${href}"]`).first();
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  await page.locator('#detail[open] #detail-body main, #detail[open] #detail-body .story-hero').first().waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#detail')?.open && document.querySelector('#detail-body')?.children.length > 0);
  await page.waitForURL(base + href);
  // Screenshots must show the settled reader, not an intentional in-between
  // frame of the physical tile flip.
  await page.waitForFunction(() => !document.querySelector('.lf-tile-flight'), null, { timeout: 1500 }).catch(() => {});
}

async function observeTileFlight(page) {
  await page.evaluate(() => {
    window.__lfTileFlightObserved = Boolean(document.querySelector('.lf-tile-flight'));
    const observer = new MutationObserver(() => {
      if (document.querySelector('.lf-tile-flight')) window.__lfTileFlightObserved = true;
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.__lfTileFlightObserver = observer;
  });
}

async function run() {
  const release = JSON.parse(fs.readFileSync(path.join(app, artifactDir, releaseFilename), 'utf8'));
  assert.equal(release.tiles, 133, 'Preview release must retain 133 total tiles.');
  assert.equal(release.originalTilesPreserved, 110, 'Preview release must retain all original 110 tiles.');
  pass('release manifest preserves 133 tiles and 110 original tiles', `artifact ${release.artifactSha256}`);

  const sourceMosaic = fs.readFileSync(path.join(app, 'preview-content', 'mosaic.html'), 'utf8');
  const originalTiles = (sourceMosaic.match(/<a\b[^>]*>/gi) || []).filter(tag =>
    /\bclass=(['"])[^'"]*\btile\b[^'"]*\1/i.test(tag) && /\bhref=(['"])[^'"]+\1/i.test(tag)
  );
  assert.equal(originalTiles.length, 110, 'Source mosaic must contain 110 original tile anchors.');
  const photoIds = ['nyc', 'marthas-vineyard', 'arizona', 'hospitality', 'roofing', 'shops', 'trades', 'makers'];
  for (const id of photoIds) assert.match(fs.readFileSync(path.join(app, 'preview-dist', 'index.html'), 'utf8'), new RegExp(`href="/photos/${id}/"`));
  pass('all 110 source tile anchors remain and 8 known photo anchors use static gallery routes', photoIds.join(', '));

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const { context, page } = await makePage(browser, { width: 1440, height: 940 });
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    await check('home exposes 133 real tile links', async () => {
      assert.equal(await page.locator('a.tile[href]').count(), 133);
      assert.equal(await page.locator('a.tile[href^="/"]').count(), 126);
      const external = await page.locator('a.tile[href^="https://"]').evaluateAll(tiles => tiles.map(tile => ({ href: tile.getAttribute('href'), target: tile.getAttribute('target'), rel: tile.getAttribute('rel') || '' })));
      assert.equal(external.length, 7, 'seven review cards must keep their direct Google sources');
      for (const link of external) {
        assert.match(link.href || '', /^https:\/\//, 'review tile needs an external source');
        assert.equal(link.target, '_blank', 'review source must intentionally open externally');
        assert.match(link.rel, /\bnoopener\b/i, 'review source needs noopener');
        assert.match(link.rel, /\bnoreferrer\b/i, 'review source needs noreferrer');
      }
    });
    await check('homepage passes full Axe including color contrast', () => auditAxe(page, '/ homepage'));
    await page.screenshot({ path: path.join(screenshots, 'verify-home-1440.png'), fullPage: true });

    await check('website tile opens enhanced reader with tile motion available', async () => {
      assert.equal(await page.evaluate(() => typeof window.LFTileMotion?.open), 'function');
      await openTile(page, '/services/custom-local-websites/');
      assert.equal(await page.locator('#detail').evaluate(node => node.open), true);
      await inspectWebsiteBody(page, 'desktop website reader opened from main web tile');
    });
    await check('opened website reader passes full Axe including color contrast', () => auditAxe(page, '/services/custom-local-websites/ reader dialog'));
    await page.screenshot({ path: path.join(screenshots, 'verify-reader-website-1440.png'), fullPage: true });

    await check('Escape closes reader and restores source focus', async () => {
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('#detail')?.open);
      await page.waitForURL(base + '/');
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('href')), '/services/custom-local-websites/');
    });

    await check('Back and Forward restore reader state and title', async () => {
      await openTile(page, '/industries/roofing/');
      const readerTitle = await page.title();
      assert.match(readerTitle, /roof/i);
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForFunction(() => !document.querySelector('#detail')?.open);
      assert.equal(await page.url(), `${base}/`);
      await page.goForward({ waitUntil: 'networkidle' });
      await page.locator('#detail[open]').waitFor();
      assert.equal(await page.title(), readerTitle);
    });

    await check('nested reader link replaces reader and close returns home', async () => {
      const inner = page.locator('#detail-body a[data-reader-link]').first();
      await inner.click();
      await page.waitForFunction(() => document.querySelector('#detail-body')?.dataset.readerPath !== '/industries/roofing/');
      assert.equal(await page.locator('#detail').evaluate(node => node.open), true);
      await page.locator('#close-detail').click();
      await page.waitForFunction(() => !document.querySelector('#detail')?.open);
      await page.waitForURL(base + '/');
      assert.equal(await page.url(), `${base}/`);
    });

    await check('Explore search opens its selected reader and keeps the consent-safe event in page', async () => {
      await page.locator('#explore-toggle').click();
      await page.locator('#explore-menu[open]').waitFor();
      await page.locator('#preview-search').fill('roofer');
      const result = page.locator('#search-results a.search-result[href="/industries/roofing/"]').first();
      await result.waitFor({ state: 'visible' });
      await page.evaluate(() => {
        window.__tilePreviewInteractions = [];
        document.addEventListener('lf:interaction', event => window.__tilePreviewInteractions.push(event.detail));
      });
      await result.click();
      await page.locator('#detail[open]').waitFor();
      await page.waitForURL(base + '/industries/roofing/');
      assert.ok(await page.evaluate(() => window.__tilePreviewInteractions.some(event => event.event === 'search_result_selected' && event.contentId === 'industries_roofing')),
        'Search selection event must dispatch before opening the reader.');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('#explore-menu')?.open);
      await page.waitForFunction(() => !document.querySelector('#detail')?.open);
      await page.waitForURL(base + '/');
    });

    await check('photo tile opens reader and static gallery contains photos', async () => {
      await openTile(page, '/photos/roofing/');
      assert.ok(await page.locator('#detail-body .photo-grid figure').count() > 0);
      await page.locator('#close-detail').click();
      await page.goto(`${base}/photos/roofing/`, { waitUntil: 'networkidle' });
      assert.ok(await page.locator('main[data-page-content] .photo-grid figure').count() > 0);
    });

    await check('standalone app tile fetches its mini-reader while retaining the original URL and hard-navigates Try it', async () => {
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      const tile = page.locator('a.tile[data-reader-src]').first();
      assert.ok(await tile.count(), 'Candidate needs a standalone-app reader fixture.');
      const originalHref = await tile.getAttribute('href');
      const readerSource = await tile.getAttribute('data-reader-src');
      assert.ok(originalHref && readerSource, 'Reader fixture needs both href and data-reader-src.');
      const readerFetch = page.waitForResponse(response => new URL(response.url()).pathname === readerSource && response.status() === 200);
      await tile.scrollIntoViewIfNeeded();
      await tile.click();
      await readerFetch;
      await page.waitForURL(base + originalHref);
      const readerTitle = await page.title();
      assert.equal(await page.locator('#detail').evaluate(node => node.dataset.readerPath), originalHref);
      assert.notEqual(readerTitle, '', 'Mini-reader must set a document title.');
      await page.keyboard.press('Escape');
      await page.waitForURL(base + '/');
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('href')), originalHref);
      await tile.click();
      await page.waitForURL(base + originalHref);
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForURL(base + '/');
      await page.goForward({ waitUntil: 'networkidle' });
      await page.locator('#detail[open]').waitFor();
      assert.equal(await page.title(), readerTitle);
      const tryIt = page.locator('#detail-body [data-document-link]').first();
      await tryIt.scrollIntoViewIfNeeded();
      const hardTarget = await tryIt.getAttribute('href');
      assert.equal(hardTarget, originalHref);
      await tryIt.click();
      await page.waitForURL(base + hardTarget);
      assert.equal(await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.type), 'navigate');
    });

    await check('direct service route renders the approved waterfall and ownership story', async () => {
      await page.goto(base + '/services/custom-local-websites/', { waitUntil: 'networkidle' });
      await inspectWebsiteBody(page, 'desktop direct website route');
      await inspectDirectContactRail(page, 'desktop direct website route');
      await page.screenshot({ path: path.join(screenshots, 'verify-website-direct-1440.png'), fullPage: true });
      await auditAxe(page, '/services/custom-local-websites/ direct');
      const requestedRoute = await page.goto(base + '/small-business-websites-nyc/', { waitUntil: 'networkidle' });
      report.requestedVanityRoute = { path: '/small-business-websites-nyc/', status: requestedRoute?.status() || null, generated: requestedRoute?.ok() || false };
      assert.ok([200, 404].includes(report.requestedVanityRoute.status), 'Requested vanity route must resolve to a document response.');
      report.resourceFailures = report.resourceFailures.filter(item => item.url !== base + '/small-business-websites-nyc/');
    });

    await check('direct roofing landing keeps shared controls and leads to the native inquiry form', async () => {
      await page.goto(`${base}/industries/roofing/`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#detail').evaluate(node => node.open), false);
      const contactPath = page.locator('a[data-document-link][href^="/tech-audit/"]').first();
      await contactPath.waitFor({ state: 'visible' });
      assert.match(await contactPath.getAttribute('href'), /^\/tech-audit\/\?intent=website$/);
      await page.locator('#explore-toggle').click();
      await page.locator('#explore-menu[open]').waitFor();
      await page.keyboard.press('Escape');
      await page.goto(`${base}/tech-audit/?intent=website`, { waitUntil: 'networkidle' });
      const form = page.locator('form[data-netlify="true"]').first();
      await form.waitFor({ state: 'visible' });
      assert.equal((await form.getAttribute('method') || '').toLowerCase(), 'post');
      assert.equal(await form.evaluate(node => node.checkValidity()), false, 'native inquiry must retain browser validation before a user completes it');
    });

    await page.goto(`${base}/industries/roofing/`, { waitUntil: 'networkidle' });
    const axeResults = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    report.axe.push({ page: '/industries/roofing/', violations: axeResults.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })) });
    assert.equal(axeResults.violations.length, 0, `Axe violations: ${axeResults.violations.map(v => v.id).join(', ')}`);
    pass('direct roofing landing has no Axe violations excluding color contrast');
    await check('direct roofing reader passes full Axe including color contrast', () => auditAxe(page, '/industries/roofing/ direct'));
    await context.close();

    const { context: reducedContext, page: reduced } = await makePage(browser, { width: 390, height: 844 }, 'reduce');
    await reduced.goto(`${base}/`, { waitUntil: 'networkidle' });
    await check('reduced motion starts with motion disabled and still opens reader', async () => {
      assert.equal(await reduced.locator('body').evaluate(node => node.classList.contains('no-motion')), true);
      await openTile(reduced, '/services/custom-local-websites/');
      await expectNoOverflow(reduced, '390 reduced reader');
    });
    await reduced.screenshot({ path: path.join(screenshots, 'verify-reader-reduced-390.png'), fullPage: true });
    await reducedContext.close();

    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 720 }]) {
      const { context: directContext, page: directPage } = await makePage(browser, viewport);
      await directPage.goto(base + '/services/custom-local-websites/', { waitUntil: 'networkidle' });
      await check('direct website waterfall and ownership fit ' + viewport.width + 'px', () => inspectWebsiteBody(directPage, viewport.width + ' direct website route'));
      await check('direct contact rail stays available at ' + viewport.width + 'px', () => inspectDirectContactRail(directPage, viewport.width + ' direct website route'));
      await directPage.screenshot({ path: path.join(screenshots, 'verify-website-direct-' + viewport.width + '.png'), fullPage: true });
      await directContext.close();
    }

    await check('390px website tile physically flips into a modal reader and restores focus on close', async () => {
      const { context: mobileContext, page: mobile } = await makePage(browser, { width: 390, height: 844 });
      try {
        await mobile.goto(`${base}/`, { waitUntil: 'networkidle' });
        await observeTileFlight(mobile);
        await openTile(mobile, '/services/custom-local-websites/');
        assert.equal(await mobile.evaluate(() => window.__lfTileFlightObserved), true, 'mobile tile must create its physical flip layer before the reader settles');
        assert.equal(await mobile.locator('#detail').evaluate(node => node.open), true, 'mobile reader must be an open native modal dialog');
        assert.equal(await mobile.evaluate(() => document.activeElement?.id), 'close-detail', 'modal reader must take focus at its close control');
        await mobile.keyboard.press('Escape');
        await mobile.waitForFunction(() => !document.querySelector('#detail')?.open);
        assert.equal(await mobile.evaluate(() => document.activeElement?.getAttribute('href')), '/services/custom-local-websites/', 'mobile close must restore focus to the website tile');
      } finally { await mobileContext.close(); }
    });

    for (const viewport of [{ width: 320, height: 720 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 940 }]) {
      const { context: viewportContext, page: viewportPage } = await makePage(browser, viewport);
      await viewportPage.goto(`${base}/`, { waitUntil: 'networkidle' });
      const homeOverflow = await expectNoOverflow(viewportPage, `${viewport.width} home`);
      await openTile(viewportPage, '/industries/roofing/');
      const dialogOverflow = await expectNoOverflow(viewportPage, `${viewport.width} reader`);
      await viewportPage.screenshot({ path: path.join(screenshots, `verify-reader-${viewport.width}.png`), fullPage: true });
      report.viewports.push({ ...viewport, homeOverflow: JSON.parse(homeOverflow), dialogOverflow: JSON.parse(dialogOverflow) });
      await viewportContext.close();
    }

    assert.deepEqual(report.blockedMutations, [], `Unexpected mutating requests: ${JSON.stringify(report.blockedMutations)}`);
    assert.deepEqual(report.pageErrors, [], `Page errors: ${report.pageErrors.join(' | ')}`);
    assert.deepEqual(report.resourceFailures, [], `Failed or 404 local resources: ${JSON.stringify(report.resourceFailures)}`);
    pass('no POST or other mutating request, page error, local 404, or failed local resource');
  } finally {
    await browser.close();
  }
  for (let run = 1; run <= 3; run += 1) await coldMobileRun(run);
  assert.deepEqual(report.blockedMutations, [], 'Unexpected mutating requests: ' + JSON.stringify(report.blockedMutations));
  assert.deepEqual(report.pageErrors, [], 'Page errors: ' + report.pageErrors.join(' | '));
  assert.deepEqual(report.resourceFailures, [], 'Failed or 404 local resources: ' + JSON.stringify(report.resourceFailures));
  pass('three cold mobile 4x CPU / 1.6Mbps / 150ms performance runs completed without browser errors');
}

run().then(() => {
  report.completedAt = new Date().toISOString();
  report.passed = report.assertions.every(item => item.passed);
  fs.writeFileSync(path.join(evidence, 'browser-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.passed ? 0 : 1;
}).catch(error => {
  report.completedAt = new Date().toISOString();
  report.passed = false;
  report.failure = error.stack || String(error);
  fs.writeFileSync(path.join(evidence, 'browser-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.error(error.stack || error);
  process.exitCode = 1;
});
