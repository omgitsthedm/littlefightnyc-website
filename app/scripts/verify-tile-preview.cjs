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
const verifiedReviewSources = new Set(JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'reviews.json'), 'utf8')).reviews.map(review => review.sourceUrl));
const expectedInventory = { total: 129, originals: 106, groups: 19, reviews: 7 };
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

function artifactFile(route) {
  const clean = route.replace(/^\/+/, '');
  if (!clean) return path.join(app, artifactDir, 'index.html');
  if (route.endsWith('/') || !path.basename(clean).includes('.')) return path.join(app, artifactDir, clean, 'index.html');
  return path.join(app, artifactDir, clean);
}

function readHomepageInventory() {
  const file = path.join(app, artifactDir, 'homepage-inventory.json');
  assert.ok(fs.existsSync(file), 'tile artifact must include homepage-inventory.json');
  const inventory = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(inventory.sourceTileCount, expectedInventory.originals, 'inventory must retain all source tiles');
  assert.equal(inventory.totalTileInventory, expectedInventory.total, 'inventory must retain all tile routes');
  assert.equal(inventory.groups?.length, expectedInventory.groups, 'inventory must retain all consolidated groups');
  assert.ok(Array.isArray(inventory.visibleTiles) && Array.isArray(inventory.retainedRoutes) && Array.isArray(inventory.hiddenHomeIds), 'inventory needs visible, retained, and hidden records');
  const members = inventory.groups.flatMap(group => {
    assert.ok(group && typeof group.id === 'string' && group.id && Array.isArray(group.members), 'consolidated groups need stable leaders and member ids');
    return group.members;
  });
  const hidden = new Set([...members, ...inventory.hiddenHomeIds]);
  const visibleIds = inventory.visibleTiles.map(tile => tile?.id);
  const retainedIds = inventory.retainedRoutes.map(route => route?.id);
  assert.equal(new Set(visibleIds).size, visibleIds.length, 'visible tile ids must be unique');
  assert.equal(new Set(retainedIds).size, retainedIds.length, 'retained route ids must be unique');
  assert.equal(retainedIds.length, expectedInventory.total, 'all 129 tile routes must remain retained');
  assert.equal(inventory.visibleTiles.length, expectedInventory.total - hidden.size, 'visible count must be total inventory minus unique absorbed/hidden ids');
  assert.ok(visibleIds.every(id => id && !hidden.has(id)), 'absorbed/hidden tiles cannot appear on the hub');
  assert.deepEqual(new Set(retainedIds), new Set([...visibleIds, ...hidden]), 'retained records must cover every visible and absorbed/hidden tile');
  return { inventory, hidden, visibleIds };
}

function assertRetainedRouteArtifacts(manifest) {
  const search = JSON.parse(fs.readFileSync(path.join(app, artifactDir, 'search-index.json'), 'utf8'));
  const searchPaths = new Set(search.filter(row => row && typeof row === 'object').map(row => row.path));
  for (const route of manifest.inventory.retainedRoutes) {
    assert.ok(route && typeof route.id === 'string' && route.id && typeof route.path === 'string' && route.path,
      'every retained record needs an id and path');
    if (!route.path.startsWith('/')) continue;
    const pathname = new URL(route.path, 'https://littlefightnyc.com').pathname;
    const target = artifactFile(pathname);
    assert.ok(fs.existsSync(target), `${route.id}: retained route is missing: ${route.path}`);
    assert.ok(fs.readFileSync(target, 'utf8').trim(), `${route.id}: retained route is empty: ${route.path}`);
    assert.ok(searchPaths.has(pathname), `${route.id}: retained route is absent from search index: ${route.path}`);
  }
  return `${expectedInventory.total} retained tile routes have non-empty local destinations and search records`;
}

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
  const body = page.locator('.rw-body.website-service-body').last();
  await body.waitFor({ state: 'visible' });
  const reader = page.locator('.lf-reader[data-reader-template="website-service"]').filter({ has: body }).last();
  const hero = reader.locator('.rw-scene--hero[data-rw-scene="opening"]');
  assert.equal(await hero.count(), 1, label + ': one Website opening scene');
  assert.equal((await hero.locator('#detail-title').innerText()).replace(/\s+/g, ' ').trim(), 'Make your business easy to choose.', label + ': Website opening uses the rewritten customer promise');
  assert.equal(await hero.locator('.rw-kinetic-phrase').count(), 1, label + ': rewritten headline retains its restrained motion hook');

  const benefitLinks = hero.locator('.rw-benefits a');
  assert.equal(await benefitLinks.count(), 6, label + ': six hero benefits link into the reader');
  const benefitTargets = await benefitLinks.evaluateAll(links => links.map(link => link.getAttribute('href')));
  for (const href of benefitTargets) {
    assert.match(href || '', /^#reader-[a-z-]+$/, label + ': benefit must use a local reader section');
    assert.equal(await body.locator(href).count(), 1, label + ': benefit target resolves once: ' + href);
  }
  if (await page.locator('#detail[open]').count()) {
    // Real clicks must retain the card's history state, not close the dialog.
    for (let index = 0; index < benefitTargets.length; index += 1) {
      await benefitLinks.nth(index).click();
      assert.equal(await page.locator('#detail[open]').count(), 1, label + ': benefit jump keeps reader open');
      assert.equal(await body.locator(benefitTargets[index]).evaluate(node => document.activeElement === node), true, label + ': benefit jump moves keyboard focus to its destination');
    }
  }

  assert.equal(await reader.locator(':is(.rw-journey-controls,[role="tablist"],[role="tab"],[data-rw-choice],.rw-journey-panel,.rw-hero-actions)').count(), 0, label + ': Website story has no goal selector or secondary hero action');
  assert.equal(await page.locator('#reader-motion-toggle').count(), 0, label + ': reader does not expose a Motion control');

  const scenes = reader.locator('[data-rw-scene]');
  assert.deepEqual(await scenes.evaluateAll(items => items.map(item => item.dataset.rwScene)), [
    'opening',
    'different-worlds',
    'your-business-not-template',
    'a-question-needs-an-answer',
    'six-weeks-from-brief',
    'you-keep-the-keys',
  ], label + ': Website story remains a complete linear sequence');

  assert.equal(await hero.locator('.rw-opening-work, .rw-opening-project').count(), 0, label + ': opening keeps its icon and does not duplicate client project screens');

  const fullGallery = body.locator('.rw-full-gallery');
  if (await fullGallery.count() && !await fullGallery.evaluate(node => node.open)) {
    await fullGallery.locator('summary').click();
  }
  const gallery = body.locator('#reader-work .rw-client-gallery');
  assert.equal(await gallery.count(), 1, label + ': one real-client Website gallery');
  const projects = gallery.locator('figure.rw-client-project');
  assert.equal(await projects.count(), 9, label + ': nine real client website examples');
  assert.equal(await gallery.locator('figure.rw-client-project[data-rw-item]').count(), 9, label + ': every client example participates in native-scroll enhancement');
  const expectedCases = [
    'easy-tiger', 'hair-by-rachel-charles', 'the-tarot-hotline', 'grand-funding-llc', 'the-break-room',
    'clearhelp', 'logan-loans', 'cc-films', 'chromatic-painting-design',
  ];
  const galleryProof = [];
  for (let index = 0; index < expectedCases.length; index += 1) {
    const project = projects.nth(index);
    const media = project.locator('a.rw-client-project-media[data-reader-link]');
    assert.equal(await media.count(), 1, label + ': gallery item has an in-reader case link for ' + expectedCases[index]);
    assert.equal(await media.getAttribute('href'), '/case-studies/' + expectedCases[index] + '/', label + ': gallery item leads to the matching case');
    const image = media.locator('img');
    assert.equal(await image.count(), 1, label + ': gallery item has one proof image for ' + expectedCases[index]);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(node => node.decode());
    const proof = await image.evaluate(node => ({
      src: node.getAttribute('src') || '', complete: node.complete,
      naturalWidth: node.naturalWidth, naturalHeight: node.naturalHeight,
    }));
    assert.ok(proof.complete && proof.naturalWidth > 0 && proof.naturalHeight > 0, label + ': gallery proof image loads for ' + expectedCases[index]);
    galleryProof.push({ case: expectedCases[index], ...proof });
  }
  assert.equal(new Set(galleryProof.map(project => project.src)).size, 9, label + ': the single nine-client gallery uses a distinct screen for every project');

  const details = body.locator('details');
  assert.ok(await details.count() >= 7, label + ': detailed Website story uses native disclosures');
  assert.equal(await body.locator('details > summary').count(), await details.count(), label + ': every disclosure keeps a native summary');
  const firstInsight = body.locator('.rw-custom-copy details').first();
  assert.equal(await firstInsight.getAttribute('open'), null, label + ': detail starts closed without hiding its story behind JavaScript');
  await firstInsight.locator('summary').click();
  assert.equal(await firstInsight.getAttribute('open'), '', label + ': native detail opens without a custom selector');

  const color = await reader.locator('.rw-scene-heading').first().evaluate(node => getComputedStyle(node).color);
  assert.equal(color, 'rgb(146, 191, 255)', label + ': Websites story headings use service blue');
  const contact = page.locator('#detail[open] .reader-rail a').first();
  if (await contact.count()) {
    assert.equal(await contact.evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 120, 57)', label + ': reader contact actions keep Little Fight orange');
  }
  const ownership = body.locator('#reader-ownership.rw-scene--ownership');
  assert.equal(await ownership.count(), 1, label + ': ownership section');
  assert.equal(await ownership.locator('.rw-ownership-passport dl > div').count(), 3, label + ': ownership covers code, domain, and content');
  assert.deepEqual(await ownership.locator('.rw-ownership-passport dt').allTextContents(), ['Code', 'Domain', 'Content'], label + ': ownership passport keeps the three business assets');
  assert.match(await ownership.innerText(), /finished website files belong to your business[\s\S]*web address stays in an account you control[\s\S]*business information remain yours/i, label + ': ownership copy');
  assert.match(await body.locator('#reader-launch').innerText(), /six weeks or less/i, label + ': launch promise is six weeks or less with an agreed brief');
  assert.match(await ownership.innerText(), /No monthly hosting fee/i, label + ': offer keeps the no-monthly-hosting-fee term');
  assert.equal(await reader.locator('.story-faq details').count(), 2, label + ': only the two service-specific FAQs remain outside the full answer collection');
  assert.equal(await reader.locator('.category-answer#answer-cost').count(), 1, label + ': the custom-quote answer appears once in the category collection');
  const reviewTiles = reader.locator('a.rw-review-tile');
  assert.equal(await reviewTiles.count(), 3, label + ': reader keeps three single-link Google review tiles');
  const reviewSection = reviewTiles.first().locator('xpath=ancestor::section[1]');
  assert.equal(await reviewSection.locator(':is(h1,h2,h3)').count(), 0, label + ': review tiles have no redundant heading');
  assert.equal(await reviewSection.locator('a:not(.rw-review-tile)').count(), 0, label + ': review tiles have no separate Read action');
  assert.doesNotMatch(await reviewSection.innerText(), /\b5\.0\b|\b7 reviews\b|read all/i, label + ': review tiles omit rating-count copy');
  for (let index = 0; index < await reviewTiles.count(); index += 1) {
    const tile = reviewTiles.nth(index);
    const href = await tile.getAttribute('href');
    assert.ok(verifiedReviewSources.has(href), label + ': review tile uses a verified Google review source');
    assert.match(await tile.innerText(), /★★★★★/, label + ': review tile keeps five visible stars');
    assert.equal(await tile.locator('blockquote').count(), 1, label + ': review tile keeps one quoted client excerpt');
    assert.equal(await tile.locator('cite').count(), 1, label + ': review tile credits its reviewer');
    assert.equal(await tile.getAttribute('target'), '_blank', label + ': entire review tile intentionally opens its Google source');
    assert.match(await tile.getAttribute('rel') || '', /\bnoopener\b/i, label + ': review tile isolates the external destination');
  }
  await ownership.scrollIntoViewIfNeeded();
  const scrollProof = await ownership.evaluate(target => {
    const detail = target.closest('#detail');
    const scroller = detail?.open ? detail.querySelector('#detail-body') : document.scrollingElement;
    const rect = target.getBoundingClientRect();
    return { maxScroll: scroller.scrollHeight - scroller.clientHeight, scrollTop: scroller.scrollTop, targetTop: rect.top, targetBottom: rect.bottom };
  });
  assert.ok(scrollProof.maxScroll > 0 && scrollProof.scrollTop > 0, label + ': complete Website story is reachable by native scrolling');
  const overflow = await expectNoOverflow(page, label);
  report.routeAudit.push({ label, route: new URL(page.url()).pathname, scenes: await scenes.count(), galleryProjects: galleryProof, ownership: true, scrollProof, overflow: JSON.parse(overflow) });
  return 'linear Website story + ownership; ' + JSON.stringify(scrollProof) + '; ' + overflow;
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
  const controls = await rail.locator('a').evaluateAll(links => {
    const close = document.querySelector('.reader-hub-return')?.getBoundingClientRect();
    return links.map(link => {
      const box = link.getBoundingClientRect();
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      return { label: link.textContent, width: box.width, height: box.height,
        overlapped: Boolean(close && box.left < close.right && box.right > close.left && box.top < close.bottom && box.bottom > close.top),
        reachable: hit === link || link.contains(hit) };
    });
  });
  assert.equal(controls.length, 3, `${label}: three direct contact actions`);
  for (const control of controls) {
    assert.ok(control.width >= 44 && control.height >= 44, `${label}: ${control.label} is at least 44px`);
    assert.equal(control.overlapped, false, `${label}: close button must not overlap ${control.label}`);
    assert.equal(control.reachable, true, `${label}: ${control.label} remains reachable after scrolling`);
  }
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
  const manifest = readHomepageInventory();
  const release = JSON.parse(fs.readFileSync(path.join(app, artifactDir, releaseFilename), 'utf8'));
  assert.equal(release.tiles, manifest.inventory.visibleTiles.length, 'Preview release must record the consolidated visible tile count.');
  assert.equal(release.totalTileInventory, expectedInventory.total, 'Preview release must retain all 129 tile routes.');
  assert.equal(release.originalTilesPreserved, expectedInventory.originals, 'Preview release must retain all 106 remaining original tiles.');
  assert.equal(release.consolidatedGroups, expectedInventory.groups, 'Preview release must record all 19 consolidated groups.');
  pass('release manifest preserves all routes while recording the consolidated hub', `visible ${release.tiles}; artifact ${release.artifactSha256}`);
  pass('all retained tile destinations are non-empty and searchable', assertRetainedRouteArtifacts(manifest));

  const sourceMosaic = fs.readFileSync(path.join(app, 'preview-content', 'mosaic.html'), 'utf8');
  const originalTiles = (sourceMosaic.match(/<a\b[^>]*>/gi) || []).filter(tag =>
    /\bclass=(['"])[^'"]*\btile\b[^'"]*\1/i.test(tag) && /\bhref=(['"])[^'"]+\1/i.test(tag)
  );
  assert.equal(originalTiles.length, 106, 'Source mosaic must contain 106 original tile anchors.');
  const photoIds = ['nyc', 'marthas-vineyard', 'arizona', 'hospitality', 'roofing', 'shops', 'trades', 'makers'];
  const retainedPaths = new Set(manifest.inventory.retainedRoutes.map(route => route.path));
  for (const id of photoIds) assert.ok(retainedPaths.has(`/photos/${id}/`), `photo destination must remain retained: ${id}`);
  pass('all 106 remaining source tile anchors remain in the retained inventory and 8 known photo anchors retain static gallery routes', photoIds.join(', '));

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const { context, page } = await makePage(browser, { width: 1440, height: 940 });
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    await check('home exposes every consolidated tile link exactly once', async () => {
      assert.equal(await page.locator('a.tile[href]').count(), manifest.inventory.visibleTiles.length);
      const ids = await page.locator('a.tile[href]').evaluateAll(tiles => tiles.map(tile => tile.dataset.answer));
      assert.deepEqual(new Set(ids), new Set(manifest.visibleIds), 'home must exactly match the visible inventory');
      for (const group of manifest.inventory.groups) {
        assert.equal(ids.filter(id => id === group.id).length, 1, `${group.id} lead must appear once`);
        for (const member of group.members) assert.equal(ids.filter(id => id === member).length, 0, `${member} must be absorbed`);
      }
      for (const hiddenId of manifest.inventory.hiddenHomeIds) assert.equal(ids.filter(id => id === hiddenId).length, 0, `${hiddenId} must not consume homepage space`);
      assert.equal(await page.locator('a.tile[href^="/"]').count(), manifest.inventory.visibleTiles.length - expectedInventory.reviews);
      const external = await page.locator('a.tile[href^="https://"]').evaluateAll(tiles => tiles.map(tile => ({ href: tile.getAttribute('href'), target: tile.getAttribute('target'), rel: tile.getAttribute('rel') || '' })));
      assert.equal(external.length, expectedInventory.reviews, 'seven review cards must keep their direct Google sources');
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
      await openTile(page, '/answers/help/maps/');
      const readerTitle = await page.title();
      assert.match(readerTitle, /find|maps/i);
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForFunction(() => !document.querySelector('#detail')?.open);
      assert.equal(await page.url(), `${base}/`);
      await page.goForward({ waitUntil: 'networkidle' });
      await page.locator('#detail[open]').waitFor();
      assert.equal(await page.title(), readerTitle);
    });

    await check('nested reader link replaces reader and close returns home', async () => {
      const currentReader = '/answers/help/maps/';
      const innerLinks = page.locator('#detail-body a[data-reader-link]');
      const nextIndex = await innerLinks.evaluateAll((links, current) => links.findIndex(link => link.getAttribute('href') !== current), currentReader);
      assert.ok(nextIndex >= 0, 'combined Maps reader needs a useful next in-card link');
      const inner = innerLinks.nth(nextIndex);
      await inner.click();
      await page.waitForFunction(path => document.querySelector('#detail-body')?.dataset.readerPath !== path, currentReader);
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

    await check('standalone VERA tile opens its working app inside the reader and returns to the hub', async () => {
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      const tile = page.locator('a.tile[href="/vera/"]').first();
      assert.equal(await tile.count(), 1, 'Candidate needs one VERA tile.');
      const originalHref = await tile.getAttribute('href');
      const readerSource = await tile.getAttribute('data-reader-src');
      assert.equal(originalHref, '/vera/');
      assert.equal(readerSource, '/_readers/vera/');
      const readerFetch = page.waitForResponse(response => new URL(response.url()).pathname === readerSource && response.status() === 200);
      await tile.scrollIntoViewIfNeeded();
      await tile.click();
      await readerFetch;
      await page.waitForURL(base + originalHref);
      const readerTitle = await page.title();
      assert.equal(await page.locator('#detail').evaluate(node => node.dataset.readerPath), originalHref);
      assert.notEqual(readerTitle, '', 'Mini-reader must set a document title.');
      assert.equal(await page.locator('#detail').getAttribute('data-reader-layout'), 'immersive');
      const frame = page.locator('#detail-body [data-demo="vera"] iframe.reader-demo-frame');
      await frame.waitFor({ state: 'attached', timeout: 20_000 });
      await page.waitForFunction(() => Boolean(document.querySelector('#detail-body [data-demo="vera"] iframe[src]')));
      const frameHandle = await frame.elementHandle();
      const child = await frameHandle?.contentFrame();
      assert.ok(child, 'VERA reader needs an iframe browsing context.');
      await child.locator('[data-shell]').waitFor({ state: 'visible', timeout: 30_000 });
      assert.equal(await child.evaluate(() => self !== top), true, 'VERA must remain inside its reader card.');
      assert.equal(await page.locator('#detail-body [data-document-link]').count(), 0, 'Working-card reader must not expose a hard-navigation CTA.');
      const close = page.locator('#close-detail');
      const closeBox = await close.boundingBox();
      assert.ok(closeBox && closeBox.width >= 44 && closeBox.height >= 44, 'Reader X must remain a 44px target.');
      await close.click();
      await page.waitForURL(base + '/');
      await page.waitForFunction(() => !document.querySelector('#detail-body iframe.reader-demo-frame'));
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('href')), originalHref);
    });

    await check('direct service route renders the complete linear Website story and ownership terms', async () => {
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
      const contactPath = page.locator('a[data-reader-link][href^="/tech-audit/?intent=website&source="]').first();
      await contactPath.waitFor({ state: 'visible' });
      const inquiryUrl = new URL(await contactPath.getAttribute('href'), base);
      assert.equal(inquiryUrl.pathname, '/tech-audit/');
      assert.equal(inquiryUrl.searchParams.get('intent'), 'website');
      assert.equal(inquiryUrl.searchParams.get('source'), '/industries/roofing/');
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
      await check('direct linear Website story and ownership fit ' + viewport.width + 'px', () => inspectWebsiteBody(directPage, viewport.width + ' direct website route'));
      await check('direct contact rail stays available at ' + viewport.width + 'px', () => inspectDirectContactRail(directPage, viewport.width + ' direct website route'));
      await directPage.screenshot({ path: path.join(screenshots, 'verify-website-direct-' + viewport.width + '.png'), fullPage: true });
      for (const route of ['/services/it-support/', '/services/tech-consulting/', '/services/business-systems/']) {
        await directPage.goto(base + route, { waitUntil: 'networkidle' });
        await check(`${route} contact and close controls stay separate at ${viewport.width}px`, () => inspectDirectContactRail(directPage, route));
        await directPage.locator('.direct-contact-rail a').evaluateAll(links => {
          const sizes = links.map(link => parseFloat(getComputedStyle(link).fontSize));
          links.forEach((link, index) => { link.style.fontSize = sizes[index] * 2 + 'px'; });
        });
        await check(`${route} enlarged contact text stays reachable at ${viewport.width}px`, () => inspectDirectContactRail(directPage, route + ' 200% contact text'));
      }
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
      await openTile(viewportPage, '/answers/help/maps/');
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
