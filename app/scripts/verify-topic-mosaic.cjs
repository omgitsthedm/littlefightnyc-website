/*
 * Exercise the grouped, responsive homepage mosaic in a real local Chrome.
 *
 * This is deliberately an end-user contract, rather than an implementation
 * snapshot: it proves original destinations survive the re-layout, every
 * topic can be read and opened, review evidence remains attributable, and the
 * document stays useful when JavaScript is unavailable. It also uses genuine
 * wheel, keyboard, and CDP touch input so a fixed-height shell cannot mask a
 * broken homepage. It never follows a Google review link or permits a non-GET
 * request.
 *
 *   TOPIC_MOSAIC_URL=http://127.0.0.1:4396 node scripts/verify-topic-mosaic.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const content = path.join(app, 'preview-content');
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'topic-mosaic');
const screenshots = path.join(evidence, 'screenshots');
const base = (process.env.TOPIC_MOSAIC_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4396').replace(/\/$/, '');
const expected = { totalInventory: 129, originals: 106, reviews: 7, routes: 402, groups: 19 };
const topics = [
  ['web', 'topic-web', 'Websites'],
  ['it', 'topic-it', 'Tech support'],
  ['consulting', 'topic-consulting', 'Consulting'],
  ['software', 'topic-software', 'Custom software'],
];
const topicTileCounts = { web: 21, it: 20, consulting: 16, software: 20 };
// These original cards deliberately keep their canonical URLs while their
// homepage context changes. Keep this list explicit: the regression is a
// wrong topic/color/reader identity, not an expected visual variation.
const regroupedCards = [
  ['lab-walkup-3d', 'software', 'magenta'],
  ['lab-terminal-3d', 'software', 'magenta'],
  ['lab-micro-animations', 'software', 'magenta'],
  ['lab-studio-engine', 'software', 'magenta'],
  ['lab-growth-street', 'software', 'magenta'],
  ['lab-pool-room', 'software', 'magenta'],
  ['lab-pill-scroll', 'software', 'magenta'],
  ['lab-aha-laser', 'software', 'magenta'],
  ['lab-goliath', 'software', 'magenta'],
  ['page-vera', 'software', 'magenta'],
  ['case-after-hours-agenda', 'software', 'magenta'],
  ['album-nyc', 'consulting', 'green'],
  ['album-marthas-vineyard', 'consulting', 'green'],
  ['album-arizona', 'consulting', 'green'],
  ['album-hospitality', 'consulting', 'green'],
  ['album-roofing', 'consulting', 'green'],
  ['album-shops', 'consulting', 'green'],
  ['album-trades', 'consulting', 'green'],
  ['album-makers', 'consulting', 'green'],
  ['maps', 'consulting', 'green'],
  ['web-redesign-decision', 'consulting', 'green'],
  ['ownership', 'it', 'yellow'],
];
const regroupedReaderSamples = [
  ['lab-studio-engine', 'software', 'a software Lab'],
  ['album-nyc', 'consulting', 'a geographic album'],
  ['maps', 'consulting', 'a moved answer'],
  ['page-vera', 'software', 'the VERA agency wrapper'],
];
const report = {
  kind: 'topic-mosaic-browser-verification',
  base,
  startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome',
  assertions: [],
  viewports: [],
  blockedMutations: [],
  pageErrors: [],
  resourceFailures: [],
};

fs.mkdirSync(screenshots, { recursive: true });
const pass = (name, detail = '') => report.assertions.push({ name, passed: true, detail });
const check = async (name, task) => {
  try { pass(name, (await task()) || ''); }
  catch (error) {
    report.assertions.push({ name, passed: false, detail: error.stack || String(error) });
    throw error;
  }
};
const sameOrigin = raw => new URL(raw).origin === new URL(base).origin;

function sourceOriginalDestinations() {
  const html = fs.readFileSync(path.join(content, 'mosaic.html'), 'utf8');
  const hrefs = [...html.matchAll(/<a\b(?=[^>]*\bclass=(['"])[^'"]*\btile\b[^'"]*\1)(?=[^>]*\bhref=(['"])([^'"]+)\2)[^>]*>/gi)]
    .map(match => match[3]);
  assert.equal(hrefs.length, expected.originals, 'source mosaic must retain exactly 106 remaining original identities');
  return hrefs.map(href => href.startsWith('/#album-') ? `/photos/${href.slice('/#album-'.length)}/` : href);
}

function sourceReviews() {
  const reviews = JSON.parse(fs.readFileSync(path.join(content, 'reviews.json'), 'utf8')).reviews;
  assert.equal(reviews.length, expected.reviews, 'source must retain seven verified Google review records');
  assert.equal(reviews.filter(review => review.showAsQuote).length, 6, 'source must retain six exact quoted excerpts');
  assert.deepEqual(reviews.filter(review => !review.showAsQuote).map(review => review.displayName), ['Emilee'],
    'only Emilee may remain a source-linked rating without an invented quote');
  return reviews;
}

function readHomepageInventory() {
  const file = path.join(app, 'dist', 'homepage-inventory.json');
  assert.ok(fs.existsSync(file), 'production artifact must include homepage-inventory.json');
  const inventory = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(inventory.sourceTileCount, expected.originals, 'inventory must retain all 106 source identities');
  assert.equal(inventory.totalTileInventory, expected.totalInventory, 'inventory must account for all 129 tiles');
  assert.equal(inventory.groups?.length, expected.groups, 'inventory must record all 19 consolidated groups');
  assert.ok(Array.isArray(inventory.visibleTiles), 'inventory needs visible homepage tiles');
  assert.ok(Array.isArray(inventory.retainedRoutes), 'inventory needs every retained destination');
  assert.ok(Array.isArray(inventory.hiddenHomeIds), 'inventory needs explicitly hidden homepage ids');
  const memberIds = inventory.groups.flatMap(group => {
    assert.ok(group && typeof group.id === 'string' && group.id, 'each consolidated group needs a stable lead id');
    assert.ok(typeof group.path === 'string' && group.path.startsWith('/'), `${group.id}: consolidated lead needs a local reader path`);
    assert.ok(Array.isArray(group.members), `${group.id}: consolidated group needs absorbed member ids`);
    return group.members;
  });
  const hidden = new Set([...memberIds, ...inventory.hiddenHomeIds]);
  const visibleIds = inventory.visibleTiles.map(tile => tile?.id);
  const retainedIds = inventory.retainedRoutes.map(route => route?.id);
  assert.equal(new Set(visibleIds).size, visibleIds.length, 'visible homepage ids must be unique');
  assert.equal(new Set(retainedIds).size, retainedIds.length, 'retained route ids must be unique');
  assert.equal(retainedIds.length, expected.totalInventory, 'every one of the 129 tiles needs a retained route/search record');
  assert.equal(inventory.visibleTiles.length, expected.totalInventory - hidden.size,
    'visible count must equal total inventory minus unique absorbed/hidden ids');
  assert.ok(visibleIds.every(id => typeof id === 'string' && id && !hidden.has(id)), 'visible ids cannot also be absorbed/hidden');
  assert.deepEqual(new Set(retainedIds), new Set([...visibleIds, ...hidden]),
    'retained route ids must account for visible plus absorbed/hidden tiles');
  for (const tile of inventory.visibleTiles) {
    assert.ok(typeof tile?.path === 'string' && (tile.path.startsWith('/') || /^https?:\/\//.test(tile.path)), `${tile?.id || '?'}: visible tile needs a local or attributed external path`);
    assert.ok(typeof tile.title === 'string' && tile.title.trim(), `${tile.id}: visible tile needs a title`);
  }
  for (const route of inventory.retainedRoutes) {
    assert.ok(typeof route.path === 'string' && route.path, `${route.id}: retained route needs a path`);
    assert.ok(typeof route.title === 'string' && route.title.trim(), `${route.id}: retained route needs a title`);
    assert.ok(typeof route.homePath === 'string' && route.homePath, `${route.id}: retained route needs a home path`);
  }
  return { inventory, hidden, visibleIds, retainedIds };
}

async function makePage(browser, viewport, javaScriptEnabled = true, contextOptions = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, javaScriptEnabled, ...contextOptions });
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
    const message = request.failure()?.errorText || 'request failed';
    if (sameOrigin(request.url()) && message !== 'net::ERR_ABORTED') report.resourceFailures.push({ status: message, url: request.url() });
  });
  return { context, page };
}

async function waitForHome(page) {
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('main#canvas.topic-canvas').waitFor({ state: 'visible' });
}

async function scrollMetrics(page) {
  return page.evaluate(() => {
    const root = document.scrollingElement || document.documentElement;
    return {
      top: root.scrollTop,
      scrollHeight: root.scrollHeight,
      clientHeight: root.clientHeight,
      windowY: window.scrollY,
    };
  });
}

async function waitForHomeScrollSettled(page) {
  // Chrome can expose y=0 one frame before native smooth Home scrolling has
  // finished on the compositor. Keep using real key input, but do not race
  // PageDown against that last frame. Eight repeated input sequences verify
  // continuous rest avoids the race without changing application scrolling.
  await page.waitForFunction(() => new Promise(resolve => {
    let zeroSince = performance.now();
    const check = () => {
      const now = performance.now();
      if (window.scrollY !== 0) zeroSince = now;
      if (window.scrollY === 0 && now - zeroSince >= 150) resolve(true);
      else requestAnimationFrame(check);
    };
    check();
  }), null, { timeout: 3_000 });
}

async function assertInputScrollingAndReaderResume(browser) {
  const desktop = await makePage(browser, { width: 1440, height: 940 });
  try {
    await waitForHome(desktop.page);
    const initial = await scrollMetrics(desktop.page);
    assert.ok(initial.scrollHeight > initial.clientHeight + 300,
      `desktop homepage must be a scrollable document, got ${initial.scrollHeight}px/${initial.clientHeight}px`);

    // These are browser input events, never window.scrollTo/scrollIntoView.
    await desktop.page.mouse.move(720, 720);
    await desktop.page.mouse.wheel(0, 720);
    await desktop.page.waitForTimeout(180);
    const afterWheel = await scrollMetrics(desktop.page);
    assert.ok(afterWheel.top > 80, `desktop wheel input did not scroll homepage: ${JSON.stringify(afterWheel)}`);

    await desktop.page.keyboard.press('Home');
    await waitForHomeScrollSettled(desktop.page);
    const afterHome = await scrollMetrics(desktop.page);
    assert.ok(afterHome.top < 8, `Home key did not return desktop homepage to its beginning: ${JSON.stringify(afterHome)}`);
    const source = desktop.page.locator('#topic-web a.tile[data-anchor="web"]').first();
    await source.waitFor({ state: 'visible' });
    const href = await source.getAttribute('href');
    await source.click();
    await desktop.page.locator('#detail[open]').waitFor({ state: 'visible' });
    await desktop.page.keyboard.press('Escape');
    await desktop.page.waitForFunction(() => !document.querySelector('#detail')?.open);
    assert.equal(await desktop.page.evaluate(() => document.activeElement?.getAttribute('href')), href,
      'closing a reader must restore focus to the source tile');
    await desktop.page.mouse.wheel(0, 720);
    await desktop.page.waitForTimeout(180);
    const afterCloseWheel = await scrollMetrics(desktop.page);
    assert.ok(afterCloseWheel.top > 80,
      `desktop homepage did not resume wheel scrolling after reader close: ${JSON.stringify(afterCloseWheel)}`);
    await desktop.page.keyboard.press('Home');
    await waitForHomeScrollSettled(desktop.page);
    await desktop.page.keyboard.press('PageDown');
    // Native smooth scrolling can take longer under parallel browser load.
    // Require real movement within a bound, rather than sampling one frame.
    await desktop.page.waitForFunction(() => window.scrollY > 80, null, { timeout: 2_000 });
    const afterPageDown = await scrollMetrics(desktop.page);
    assert.ok(afterPageDown.top > 80, `PageDown did not scroll homepage: ${JSON.stringify(afterPageDown)}`);
  } finally { await desktop.context.close(); }

  const mobile = await makePage(browser, { width: 390, height: 844 });
  try {
    await waitForHome(mobile.page);
    const initial = await scrollMetrics(mobile.page);
    assert.ok(initial.scrollHeight > initial.clientHeight + 300,
      `mobile homepage must be a scrollable document, got ${initial.scrollHeight}px/${initial.clientHeight}px`);
    const cdp = await mobile.context.newCDPSession(mobile.page);
    const point = (x, y) => ({ x, y, id: 1, radiusX: 1, radiusY: 1, force: 1 });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(195, 720)] });
    for (const y of [650, 570, 490, 410, 330]) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(195, y)] });
      await mobile.page.waitForTimeout(25);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await mobile.page.waitForTimeout(220);
    const afterTouch = await scrollMetrics(mobile.page);
    assert.ok(afterTouch.top > 80, `mobile touch input did not scroll homepage: ${JSON.stringify(afterTouch)}`);
  } finally { await mobile.context.close(); }

  return 'desktop wheel and PageDown scroll, reader close resumes wheel scrolling, and mobile CDP touch scrolls';
}

async function assertResponsiveAnchorPresentation(browser) {
  const measurements = [];
  for (const viewport of [{ width: 1440, height: 940 }, { width: 320, height: 720 }, { width: 390, height: 844 }]) {
    const { context, page } = await makePage(browser, viewport);
    try {
      await waitForHome(page);
      const presentation = await page.evaluate(() => {
        const visible = node => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 2 && rect.height > 2;
        };
        const webPhoto = document.querySelector('#topic-web a.tile[data-anchor="web"] .website-project-shot.is-active');
        const icons = [...document.querySelectorAll('.topic-section[data-topic] .topic-anchor-icon')]
          .map(node => {
            const rect = node.getBoundingClientRect();
            return { family: node.closest('[data-editorial-front]')?.dataset.editorialFront,
              width: rect.width, height: rect.height, visible: visible(node) };
          });
        const grid = document.querySelector('#topic-web [data-topic-grid]');
        const columns = getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length;
        const photoRect = webPhoto?.getBoundingClientRect();
        return {
          photo: webPhoto ? {
            visible: visible(webPhoto), complete: webPhoto.complete,
            naturalWidth: webPhoto.naturalWidth, width: photoRect.width, height: photoRect.height,
          } : null,
          icons,
          columns,
        };
      });
      assert.ok(presentation.photo, `${viewport.width}px Website anchor needs its contextual photo`);
      assert.ok(presentation.photo.visible && presentation.photo.complete && presentation.photo.naturalWidth > 0
        && presentation.photo.width > 32 && presentation.photo.height > 20,
      `${viewport.width}px Website anchor photo is not visibly rendered: ${JSON.stringify(presentation.photo)}`);
      assert.equal(presentation.icons.length, topics.length + 1, `${viewport.width}px needs one icon frame for every service anchor`);
      assert.ok(presentation.icons.every(icon => icon.visible), `${viewport.width}px service anchor icon is hidden: ${JSON.stringify(presentation.icons)}`);
      const services = presentation.icons.filter(icon => icon.family !== 'brand');
      const brand = presentation.icons.find(icon => icon.family === 'brand');
      assert.equal(services.length, topics.length, 'all four service icons remain present');
      const reference = services[0];
      assert.ok(services.every(icon => Math.abs(icon.width - reference.width) <= 1 && Math.abs(icon.height - reference.height) <= 1),
        `${viewport.width}px service anchor icon frames are inconsistent: ${JSON.stringify(services)}`);
      assert.ok(brand && brand.width >= 32 && brand.height >= 32 && brand.width <= reference.width,
        `${viewport.width}px the compact brand strip retains a visible, proportionate tugboat`);
      if (viewport.width <= 1000) assert.equal(presentation.columns, 6, `${viewport.width}px topic mosaic must use six columns`);
      else assert.equal(presentation.columns, 12, `${viewport.width}px topic mosaic must use twelve columns`);
      measurements.push({ viewport: viewport.width, ...presentation });
    } finally { await context.close(); }
  }

  for (const viewport of [{ width: 768, height: 1024 }, { width: 1000, height: 900 }, { width: 1001, height: 900 }]) {
    const { context, page } = await makePage(browser, viewport);
    try {
      await waitForHome(page);
      const columns = await page.locator('#topic-web [data-topic-grid]').evaluate(node => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
      assert.equal(columns, viewport.width <= 1000 ? 6 : 12,
        `${viewport.width}px topic mosaic must use ${viewport.width <= 1000 ? 6 : 12} columns`);
    } finally { await context.close(); }
  }
  return `Website anchor photo is visible at phone/desktop; equal icon frames; six-column layout through 1000px (${measurements.map(item => `${item.viewport}px`).join(', ')})`;
}

async function assessGeometry(page, width) {
  return page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 2 && rect.height > 2;
    };
    const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
      * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const groups = [...document.querySelectorAll('section.topic-section[data-topic]')].map(section => {
      const grid = section.querySelector('.mosaic[data-topic-grid]');
      const tiles = [...grid.querySelectorAll('a.tile[href]')];
      const rects = tiles.map(tile => {
        const rect = tile.getBoundingClientRect();
        return { href: tile.getAttribute('href'), left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height, visible: visible(tile) };
      });
      const overlaps = [];
      for (let left = 0; left < rects.length; left += 1) {
        for (let right = left + 1; right < rects.length; right += 1) {
          const area = overlap(rects[left], rects[right]);
          if (area > 2) overlaps.push({ left: rects[left].href, right: rects[right].href, area: Math.round(area) });
        }
      }
      const positions = tiles.map(tile => ({
        id: tile.dataset.answer || tile.getAttribute('href') || '',
        columnStart: Number.parseInt(tile.style.gridColumnStart, 10),
        columnEnd: Number.parseInt(tile.style.gridColumnEnd, 10),
        rowStart: Number.parseInt(tile.style.gridRowStart, 10),
        rowEnd: Number.parseInt(tile.style.gridRowEnd, 10),
      }));
      const invalidPositions = positions.filter(position => !Number.isInteger(position.columnStart) || !Number.isInteger(position.columnEnd)
        || !Number.isInteger(position.rowStart) || !Number.isInteger(position.rowEnd)
        || position.columnEnd <= position.columnStart || position.rowEnd <= position.rowStart);
      const maxColumn = Math.max(0, ...positions.map(position => position.columnEnd - 1));
      const maxRow = Math.max(0, ...positions.map(position => position.rowEnd - 1));
      const occupied = new Set();
      for (const position of positions) {
        for (let row = position.rowStart; row < position.rowEnd; row += 1) {
          for (let column = position.columnStart; column < position.columnEnd; column += 1) occupied.add(`${column}:${row}`);
        }
      }
      const vacancies = [];
      for (let row = 1; row <= maxRow; row += 1) {
        for (let column = 1; column <= maxColumn; column += 1) {
          if (!occupied.has(`${column}:${row}`)) vacancies.push(`${column}:${row}`);
        }
      }
      return {
        id: section.id, topic: section.dataset.topic, tileCount: tiles.length, hidden: rects.filter(rect => !rect.visible), overlaps,
        occupancy: { maxColumn, maxRow, invalidPositions, vacancies, lastRowVacancies: vacancies.filter(cell => cell.endsWith(`:${maxRow}`)), packVacancies: grid.dataset.packVacancies },
      };
    });
    const root = document.documentElement;
    const reviewTiles = [...document.querySelectorAll('[data-review-tile]')].map(tile => {
      const rect = tile.getBoundingClientRect();
      const stars = [...tile.querySelectorAll('svg.review-star')].map(star => {
        const bounds = star.getBoundingClientRect();
        return {
          width: bounds.width,
          height: bounds.height,
          contained: bounds.left >= rect.left - .75 && bounds.right <= rect.right + .75
            && bounds.top >= rect.top - .75 && bounds.bottom <= rect.bottom + .75,
        };
      });
      const columns = Number.parseInt(tile.style.gridColumnEnd, 10) - Number.parseInt(tile.style.gridColumnStart, 10);
      return { width: rect.width, height: rect.height, columns, visible: visible(tile), topic: tile.closest('.topic-section')?.dataset.topic || '', stars };
    });
    return {
      groups,
      reviewTiles,
      reviewSections: document.querySelectorAll('#topic-reviews,[data-topic="reviews"]').length,
      documentOverflow: root.scrollWidth - root.clientWidth,
      bodyOverflow: document.body.scrollWidth - root.clientWidth,
    };
  });
}

async function assertTopicStructure(page, manifest) {
  const release = JSON.parse(fs.readFileSync(path.join(app, 'dist', 'tile-release.json'), 'utf8'));
  assert.equal(release.tiles, manifest.inventory.visibleTiles.length, 'release marker must record the consolidated visible tile count');
  assert.equal(release.totalTileInventory, expected.totalInventory, 'release marker must preserve the full 129-tile inventory');
  assert.equal(release.originalTilesPreserved, expected.originals, 'release marker must record 106 remaining originals');
  assert.equal(release.consolidatedGroups, expected.groups, 'release marker must record all consolidated groups');
  assert.equal(release.routes, expected.routes, 'release marker must record 402 routes, including the two printed QR destinations');
  assert.equal(await page.locator('a.tile[href]').count(), manifest.inventory.visibleTiles.length, 'homepage must expose exactly the consolidated visible tiles as real links');
  const homeTiles = await page.locator('a.tile[href]').evaluateAll(tiles => tiles.map(tile => ({ id: tile.dataset.answer, href: tile.getAttribute('href') })));
  assert.deepEqual(new Set(homeTiles.map(tile => tile.id)), new Set(manifest.visibleIds), 'homepage tile ids must exactly match the visible inventory');
  for (const group of manifest.inventory.groups) {
    assert.equal(homeTiles.filter(tile => tile.id === group.id).length, 1, `${group.id} consolidated lead must appear once`);
    for (const member of group.members) assert.equal(homeTiles.filter(tile => tile.id === member).length, 0, `${member} must be absorbed into ${group.id}`);
  }
  for (const hiddenId of manifest.inventory.hiddenHomeIds) {
    assert.equal(homeTiles.filter(tile => tile.id === hiddenId).length, 0, `${hiddenId} must remain available without taking homepage space`);
  }
  const retainedPaths = new Set(manifest.inventory.retainedRoutes.map(route => route.path));
  for (const href of sourceOriginalDestinations()) assert.ok(retainedPaths.has(href), `original tile destination disappeared from retained routes: ${href}`);
  const nineClientPaths = [
    '/case-studies/easy-tiger/', '/case-studies/hair-by-rachel-charles/', '/case-studies/the-tarot-hotline/',
    '/case-studies/grand-funding-llc/', '/case-studies/the-break-room/', '/case-studies/clearhelp/',
    '/case-studies/logan-loans/', '/case-studies/cc-films/', '/case-studies/chromatic-painting-design/',
  ];
  for (const route of [...nineClientPaths, '/vera/']) assert.ok(retainedPaths.has(route), `protected/client route disappeared from inventory: ${route}`);
  assert.ok(sourceOriginalDestinations().some(route => route.startsWith('/examples/lab/')), 'source inventory must include Labs');
  for (const route of sourceOriginalDestinations().filter(route => route.startsWith('/examples/lab/'))) {
    assert.ok(retainedPaths.has(route), `Lab destination disappeared from inventory: ${route}`);
  }
  for (const [topic, id, label] of topics) {
    const section = page.locator(`section.topic-section#${id}[data-topic="${topic}"]`);
    assert.equal(await section.count(), 1, `${label} needs one semantic topic section`);
    await section.locator(':scope > header.topic-heading > h2').waitFor({ state: 'visible' });
    assert.equal(await section.locator(`.mosaic[data-topic-grid][data-topic="${topic}"] a.tile[href]`).count(), topicTileCounts[topic],
      `${label} must retain its approved semantic card count after regrouping`);
  }
  assert.equal(await page.locator('section.topic-section#topic-reviews,[data-topic="reviews"]').count(), 0,
    'reviews must be interleaved through services, never collected in a standalone topic');
  const distribution = await page.locator('section.topic-section[data-topic]').evaluateAll(sections => sections.map(section => {
    const tiles = [...section.querySelectorAll('[data-topic-grid] > a.tile')];
    const reviewIndexes = tiles.flatMap((tile, index) => tile.hasAttribute('data-review-tile') ? [index] : []);
    return { topic: section.dataset.topic, reviews: reviewIndexes.length, adjacent: reviewIndexes.some((index, offset) => offset && index === reviewIndexes[offset - 1] + 1) };
  }));
  assert.equal(distribution.length, topics.length, 'homepage must retain exactly four service topic sections');
  assert.ok(distribution.every(group => group.reviews >= 1), `each service group needs a sourced review: ${JSON.stringify(distribution)}`);
  assert.ok(distribution.every(group => !group.adjacent), `review cards must be interleaved rather than piled together: ${JSON.stringify(distribution)}`);
  assert.equal(await page.locator('[data-review-tile]').count(), expected.reviews, 'homepage must retain seven individual source-linked review cards');
  return `${manifest.inventory.visibleTiles.length} visible links; ${expected.totalInventory} retained routes; ${expected.groups} consolidated groups; four service groups each interleave reviews; seven reviews`;
}

async function assertBrandLeadsWebsite(page) {
  const brand = page.locator('a.tile.brand-tile').first();
  const website = page.locator('#topic-web a.tile[data-anchor="web"]').first();
  assert.equal(await brand.count(), 1, 'Problems? Solved. must remain one homepage brand card');
  assert.equal(await website.count(), 1, 'Websites must retain one service anchor');
  const relation = await page.evaluate(() => {
    const brandTile = document.querySelector('a.tile.brand-tile');
    const websiteTile = document.querySelector('#topic-web a.tile[data-anchor="web"]');
    const brand = brandTile.getBoundingClientRect();
    const website = websiteTile.getBoundingClientRect();
    return {
      brand: { top: brand.top, bottom: brand.bottom, rowStart: Number.parseInt(brandTile.style.gridRowStart, 10), rowEnd: Number.parseInt(brandTile.style.gridRowEnd, 10) },
      website: { top: website.top, bottom: website.bottom, rowStart: Number.parseInt(websiteTile.style.gridRowStart, 10), rowEnd: Number.parseInt(websiteTile.style.gridRowEnd, 10) },
    };
  });
  assert.ok(relation.brand.rowEnd <= relation.website.rowStart && relation.brand.bottom <= relation.website.top + 1,
    `Problems? Solved. must sit above, never beside, Websites: ${JSON.stringify(relation)}`);
  return 'Problems? Solved. occupies a complete grid row above the Websites service anchor';
}

function artifactFile(route) {
  const clean = route.replace(/^\/+/, '');
  if (!clean) return path.join(app, 'dist', 'index.html');
  if (route.endsWith('/') || !path.basename(clean).includes('.')) return path.join(app, 'dist', clean, 'index.html');
  return path.join(app, 'dist', clean);
}

function assertRetainedRouteArtifacts(manifest) {
  const search = JSON.parse(fs.readFileSync(path.join(app, 'dist', 'search-index.json'), 'utf8'));
  const searchPaths = new Set(search.filter(row => row && typeof row === 'object').map(row => row.path));
  for (const route of manifest.inventory.retainedRoutes) {
    if (!route.path.startsWith('/')) continue;
    const pathname = new URL(route.path, 'https://littlefightnyc.com').pathname;
    const target = artifactFile(pathname);
    assert.ok(fs.existsSync(target), `${route.id}: retained route file is missing: ${route.path}`);
    assert.ok(fs.readFileSync(target, 'utf8').trim(), `${route.id}: retained route file is empty: ${route.path}`);
    assert.ok(searchPaths.has(pathname), `${route.id}: retained route is missing from search index: ${route.path}`);
  }
  return `${expected.totalInventory} inventory destinations retain non-empty local readers and searchable records`;
}

async function assertTileGeometryAndType(page) {
  const dimensions = async locator => locator.evaluate(node => ({
    columns: Number(node.dataset.columns), rows: Number(node.dataset.rows),
    preferredColumns: Number(node.dataset.preferredColumns), preferredRows: Number(node.dataset.preferredRows),
  }));
  for (const [topic, id, label] of topics) {
    const anchor = page.locator(`#${id} a.tile[data-anchor="${topic}"]`).first();
    assert.equal(await anchor.count(), 1, `${label} must retain its service anchor tile`);
    const size = await dimensions(anchor);
    assert.deepEqual([size.preferredColumns, size.preferredRows], [6, 3], `${label} must use the service anchor frame reduced by 25 percent`);
    assert.equal(size.columns, 6, `${label} must occupy half of the desktop grid`);
    assert.ok(size.rows >= 3, `${label} must preserve room for meaningful art and its complete introduction`);
  }
  const brand = await dimensions(page.locator('a.tile.brand-tile'));
  assert.deepEqual([brand.preferredColumns, brand.preferredRows], [6, 1], 'Problems? Solved. must remain a compact identity strip');
  assert.equal(brand.columns, 6);
  assert.ok(brand.rows >= 1);
  assert.equal(await page.locator('a.tile.brand-tile .brand-anchor-art img').count(), 0, 'Problems? Solved. must not contain the NYC photograph');
  const artwork = page.locator('img.editorial-story-image');
  assert.ok(await artwork.count() >= 9, 'consolidated service stories need substantial original editorial artwork');
  await artwork.evaluateAll(async images => {
    images.forEach(image => { image.loading = 'eager'; });
    await Promise.all(images.map(image => image.decode()));
  });
  const artCoverage = await artwork.evaluateAll(images => images.map(image => {
    const box = image.getBoundingClientRect();
    const tile = image.closest('.tile').getBoundingClientRect();
    return { loaded: image.naturalWidth > 0, fraction: box.width * box.height / (tile.width * tile.height) };
  }));
  assert.ok(artCoverage.every(image => image.loaded && image.fraction >= .4), `featured artwork must be substantial and loaded: ${JSON.stringify(artCoverage)}`);
  const reviewSizes = await page.locator('[data-review-tile]').evaluateAll(nodes => nodes.map(node => ({
    id: node.dataset.reviewId,
    style: node.dataset.reviewStyle,
    preferredColumns: Number(node.dataset.preferredColumns), preferredRows: Number(node.dataset.preferredRows),
    mobileColumns: Number(node.dataset.mobileColumns), mobileRows: Number(node.dataset.mobileRows),
    quote: node.querySelector('.review-quote')?.textContent?.trim() || '',
  })));
  assert.equal(reviewSizes.length, expected.reviews, 'seven review cards need responsive compact geometry');
  assert.ok(reviewSizes.every(review => review.style === 'standard'),
    `review cards must use one coherent standard treatment: ${JSON.stringify(reviewSizes)}`);
  for (const review of reviewSizes) {
    assert.deepEqual([review.preferredColumns, review.preferredRows], [3, 2],
      `${review.id} must preserve the promised compact desktop review geometry before responsive content growth`);
    assert.deepEqual([review.mobileColumns, review.mobileRows], [3, review.quote.length > 40 ? 4 : 3],
      `${review.id} must use the promised readable mobile review geometry`);
  }
  const albums = page.locator('a.tile[data-kind="photo-album"]');
  assert.ok(await albums.count() > 0, 'original photo albums must remain');
  const albumSizes = await albums.evaluateAll(nodes => nodes.map(node => ({
    id: node.dataset.answer,
    columns: Number(node.dataset.columns), rows: Number(node.dataset.rows),
    preferredColumns: Number(node.dataset.preferredColumns), preferredRows: Number(node.dataset.preferredRows),
    gridColumns: getComputedStyle(node.closest('[data-topic-grid]')).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
  })));
  assert.ok(albumSizes.every(album => album.preferredColumns === 4 && album.preferredRows === 4),
    `photo cards must preserve their authored 4 by 4 source geometry: ${JSON.stringify(albumSizes)}`);
  assert.ok(albumSizes.every(album => Number.isInteger(album.columns) && Number.isInteger(album.rows)
    && album.columns >= 4 && album.rows >= 4 && album.columns <= album.gridColumns),
  `photo cards may grow by whole grid units for content, never shrink or exceed their grid: ${JSON.stringify(albumSizes)}`);
  const visibleSizes = await page.locator('a.tile[href]').evaluateAll(tiles => tiles
    .map(tile => `${tile.dataset.columns}x${tile.dataset.rows}`));
  assert.ok(new Set(visibleSizes).size >= 4, `consolidated homepage needs varied bento geometry, got ${[...new Set(visibleSizes)].join(', ')}`);
  return `five equal 8x4 desktop anchors; seven individually styled compact reviews; ${albumSizes.length} source-4x4 photos that can grow whole units; visible bento sizes ${[...new Set(visibleSizes)].join(', ')}`;
}

async function assertReadableLabels(page) {
  const typography = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily,
    heading: getComputedStyle(document.querySelector('.topic-heading h2')).fontFamily,
    anchorIcons: [...document.querySelectorAll('.topic-section[data-topic] .tile[data-anchor] .topic-anchor-icon')].length,
  }));
  assert.match(typography.body, /Atkinson Hyperlegible Next/i, `body must retain the approved Atkinson Hyperlegible Next family: ${typography.body}`);
  assert.match(typography.heading, /Atkinson Hyperlegible Next/i, `homepage topic headings must retain the approved Atkinson Hyperlegible Next family: ${typography.heading}`);
  assert.equal(typography.anchorIcons, topics.length + 1, 'each service anchor needs its approved icon treatment');
  const failures = await page.evaluate(() => [...document.querySelectorAll('[data-topic-grid] .tile')].flatMap(tile => {
    const visibleText = [...tile.querySelectorAll('.cell-title,.tile-title,.anchor-title,.proof-tile-label,.cell-kicker,.topic-anchor-copy :is(span,strong,small),.review-quote,.review-name,.review-stars')]
      .filter(node => (node.textContent || '').trim() && node.getAttribute('aria-hidden') !== 'true')
      .filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
      });
    return visibleText
      .filter(node => Number.parseFloat(getComputedStyle(node).fontSize) < 16)
      .map(node => ({ tile: tile.getAttribute('href'), text: (node.textContent || '').trim().slice(0, 60), size: getComputedStyle(node).fontSize }));
  }));
  assert.deepEqual(failures, [], `visible human-readable tile labels must be at least 16px: ${JSON.stringify(failures)}`);
  return 'Atkinson Hyperlegible Next across homepage copy and navigation; four service icons; all visible tile labels are at least 16px; icon-only tiles retain their accessible names';
}

async function assertIconOnlyFronts(page, viewportWidth) {
  const cards = await page.locator('.tile[data-cell-face="icon"]').evaluateAll(nodes => nodes.map(tile => {
    const art = tile.querySelector('.cell-art');
    const graphic = art?.querySelector('svg,.mineral-icon');
    const tileRect = tile.getBoundingClientRect();
    const artRect = art?.getBoundingClientRect();
    const graphicRect = graphic?.getBoundingClientRect();
    const artStyle = art ? getComputedStyle(art) : null;
    const graphicStyle = graphic ? getComputedStyle(graphic) : null;
    const visible = Boolean(art && graphic && artStyle.display !== 'none' && artStyle.visibility !== 'hidden' && Number(artStyle.opacity) > 0 && graphicStyle.display !== 'none' && graphicStyle.visibility !== 'hidden' && Number(graphicStyle.opacity) > 0 && graphicRect.width > 2 && graphicRect.height > 2 && graphicRect.left >= tileRect.left - 1 && graphicRect.right <= tileRect.right + 1 && graphicRect.top >= tileRect.top - 1 && graphicRect.bottom <= tileRect.bottom + 1);
    return { id: tile.dataset.answer, visible, art: artRect && [artRect.width, artRect.height], graphic: graphicRect && [graphicRect.width, graphicRect.height] };
  }));
  assert.ok(cards.length > 0, `${viewportWidth}px needs icon-only cards to test`);
  const blank = cards.filter(card => !card.visible);
  assert.deepEqual(blank, [], `${viewportWidth}px icon-only cards must show their familiar icon, not an empty tile: ${JSON.stringify(blank)}`);
  return cards;
}

async function assertVisibleTileTextFits(page, viewportWidth) {
  const failures = await page.evaluate(() => {
    const selector = '.cell-title,.cell-kicker,.topic-anchor-label,.topic-anchor-copy strong,.proof-tile-label,.proof-tile-face>strong,.review-stars,.review-quote,.review-attribution,.review-source,.photo-album-tile__copy strong,.photo-album-tile__copy>span,.brand-tile h1';
    const visible = node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const problems = [];
    for (const node of document.querySelectorAll(selector)) {
      if (!visible(node)) continue;
      const tile = node.closest('.tile');
      if (!tile) continue;
      const tileRect = tile.getBoundingClientRect();
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (textNode.parentElement?.closest('.sr-only')) continue;
        for (const match of textNode.data.matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(textNode, match.index);
          range.setEnd(textNode, match.index + match[0].length);
          for (const rect of range.getClientRects()) {
            if (rect.left < tileRect.left - 0.75 || rect.right > tileRect.right + 0.75 || rect.top < tileRect.top - 0.75 || rect.bottom > tileRect.bottom + 0.75) {
              problems.push({ tile: tile.dataset.answer, word: match[0], rect: [rect.left, rect.top, rect.right, rect.bottom], bounds: [tileRect.left, tileRect.top, tileRect.right, tileRect.bottom] });
            }
          }
        }
      }
      const face = node.closest('.cell-face');
      if (face && (face.scrollWidth > face.clientWidth + 1 || face.scrollHeight > face.clientHeight + 1)) problems.push({ tile: tile.dataset.answer, word: 'front-overflow', scroll: [face.scrollWidth, face.clientWidth, face.scrollHeight, face.clientHeight] });
    }
    return problems;
  });
  assert.deepEqual(failures, [], `${viewportWidth}px every visible tile word must remain within its front: ${JSON.stringify(failures)}`);
  return 'all visible words and front compositions fit their tile bounds';
}

async function assertReviewEvidence(page) {
  const details = await page.locator('[data-review-tile]').evaluateAll(tiles => tiles.map(tile => {
    const stars = tile.querySelector('.review-stars');
    const credit = tile.querySelector('.review-credit');
    return {
      id: tile.getAttribute('data-review-id'),
      name: tile.querySelector('.review-attribution')?.textContent?.trim() || '',
      quote: tile.querySelector('.review-quote')?.textContent?.trim().replace(/[“”]/g, '') || '',
      style: tile.dataset.reviewStyle || '',
      starsAria: stars?.getAttribute('aria-label') || '',
      stars: stars?.querySelectorAll('svg.review-star').length || 0,
      credit: credit?.textContent?.replace(/\s+/g, ' ').trim() || '',
      href: tile.matches('a[href^="https://"]') ? tile.getAttribute('href') || '' : tile.querySelector('a[href^="https://"]')?.getAttribute('href') || '',
      target: tile.matches('a') ? tile.getAttribute('target') || '' : tile.querySelector('a[href^="https://"]')?.getAttribute('target') || '',
      rel: tile.matches('a') ? tile.getAttribute('rel') || '' : tile.querySelector('a[href^="https://"]')?.getAttribute('rel') || '',
    };
  }));
  const source = sourceReviews();
  assert.equal(details.length, expected.reviews);
  assert.equal(new Set(details.map(item => item.id)).size, expected.reviews, 'each review needs a stable identity');
  assert.ok(details.every(item => item.style === 'standard'), 'all review cards must use the same standard visual treatment');
  for (const record of source) {
    const item = details.find(review => review.id === record.id);
    assert.ok(item, `source review ${record.id} must remain on the homepage`);
    assert.equal(item.name, record.displayName, `${record.id} may display only its source first name/initials`);
    assert.equal(item.quote, record.showAsQuote ? record.excerpt : '', `${record.id} must preserve its exact sourced excerpt or remain quote-free`);
    assert.equal(item.href, record.sourceUrl, `${record.id} must preserve its source path`);
    assert.equal(item.stars, 5, `${record.id} must show five SVG stars`);
    assert.match(item.starsAria, /^5(?:\.0)?\s*out of\s*5\s*stars?$/i, `${record.id} needs a precise five-star accessible label`);
    assert.ok(item.credit.includes(record.displayName) && /Google/i.test(item.credit),
      `${record.id} review credit must repeat the same attribution and source: ${item.credit}`);
    assert.match(item.href, /^https:\/\//, `review ${item.id} has no attributable external source link`);
    assert.equal(item.target, '_blank', `review ${item.id} must open its external source intentionally`);
    assert.match(item.rel, /\bnoopener\b/i, `review ${item.id} external link needs noopener`);
    assert.match(item.rel, /\bnoreferrer\b/i, `review ${item.id} external link needs noreferrer`);
  }
  assert.equal(details.filter(item => item.quote).length, 6, 'only six review cards may show sourced quotes');
  assert.equal(details.find(item => item.id === 'google-review-7')?.name, 'Emilee', 'Emilee must stay the source-linked rating-only review');
  return 'six exact first-name-only source quotes plus Emilee’s quote-free rating card, each with five SVG stars and matching credit';
}

async function assertReducedReviewMotion(page, label) {
  const motion = await page.locator('[data-review-tile]').evaluateAll(nodes => {
    const elements = nodes.flatMap(node => [node, ...node.querySelectorAll('*')]);
    return {
      styles: elements.map(node => {
        const style = getComputedStyle(node);
        return { animationName: style.animationName, animationDuration: style.animationDuration };
      }),
      animations: nodes.flatMap(node => node.getAnimations({ subtree: true }).map(animation => animation.animationName || animation.constructor?.name || 'animation')),
    };
  });
  assert.ok(motion.styles.every(style => style.animationName === 'none' || style.animationDuration === '0s'),
    `${label} reduced-motion review cards must not animate: ${JSON.stringify(motion.styles.filter(style => style.animationName !== 'none' && style.animationDuration !== '0s'))}`);
  assert.deepEqual(motion.animations, [], `${label} reduced-motion review cards must begin stable, not with a pending animation`);
}

async function assertReviewMotion(browser) {
  const normal = await makePage(browser, { width: 1440, height: 940 });
  try {
    await waitForHome(normal.page);
    const cards = normal.page.locator('[data-review-tile]');
    const before = await cards.evaluateAll(nodes => nodes.map(node => node.textContent.replace(/\s+/g, ' ').trim()));
    const timings = [];
    for (let index = 0; index < expected.reviews; index += 1) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      await card.hover();
      await normal.page.waitForTimeout(70);
      timings.push(await card.evaluate(node => node.getAnimations({ subtree: true }).map(animation => ({
        name: animation.animationName || animation.constructor?.name || '',
        iterations: animation.effect?.getComputedTiming?.().iterations,
      }))));
    }
    assert.ok(timings.every(animations => animations.length > 0), 'each review style must provide a real hover response');
    assert.ok(timings.flat().every(animation => Number.isFinite(animation.iterations)),
      `review motion must always finish rather than loop: ${JSON.stringify(timings)}`);
    await normal.page.waitForTimeout(900);
    const after = await cards.evaluateAll(nodes => nodes.map(node => node.textContent.replace(/\s+/g, ' ').trim()));
    assert.deepEqual(after, before, 'review motion must never change a sourced quote, name, rating, or credit');
  } finally { await normal.context.close(); }

  const reduced = await makePage(browser, { width: 390, height: 844 }, true, { reducedMotion: 'reduce' });
  try {
    await waitForHome(reduced.page);
    await assertReducedReviewMotion(reduced.page, '390px');
  } finally { await reduced.context.close(); }
  return 'seven coherent review hover responses complete finitely without changing source text; reduced motion disables them';
}

async function assertReviewTextGrowthAt390(browser) {
  const entry = await makePage(browser, { width: 390, height: 844 }, true, { reducedMotion: 'reduce' });
  try {
    await waitForHome(entry.page);
    await assertReducedReviewMotion(entry.page, '390px enlarged-text setup');
    const snapshot = await entry.page.locator('[data-review-tile]').evaluateAll(tiles => tiles.map(tile => ({
      id: tile.dataset.reviewId,
      quote: tile.querySelector('.review-quote') ? parseFloat(getComputedStyle(tile.querySelector('.review-quote')).fontSize) : null,
      attribution: parseFloat(getComputedStyle(tile.querySelector('.review-attribution')).fontSize),
    })));
    assert.equal(snapshot.length, expected.reviews, '390px enlarged-text test needs all seven reviews');
    await entry.page.evaluate(sizes => {
      for (const size of sizes) {
        const tile = document.querySelector(`[data-review-id="${size.id}"]`);
        const quote = tile?.querySelector('.review-quote');
        const attribution = tile?.querySelector('.review-attribution');
        if (quote && size.quote) quote.style.fontSize = `${size.quote * 2}px`;
        if (attribution && size.attribution) attribution.style.fontSize = `${size.attribution * 2}px`;
      }
      window.LF_MOSAIC?.layout?.();
    }, snapshot);
    await entry.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await entry.page.waitForTimeout(100);
    const bounds = await entry.page.locator('[data-review-tile]').evaluateAll(tiles => tiles.map(tile => {
      const tileBounds = tile.getBoundingClientRect();
      const words = [];
      for (const block of tile.querySelectorAll('.review-quote,.review-credit')) {
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
        let text;
        while ((text = walker.nextNode())) {
          if (text.parentElement?.closest('.sr-only')) continue;
          for (const match of text.data.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(text, match.index);
            range.setEnd(text, match.index + match[0].length);
            for (const rect of range.getClientRects()) {
              words.push({
                word: match[0],
                contained: rect.left >= tileBounds.left - .75 && rect.right <= tileBounds.right + .75
                  && rect.top >= tileBounds.top - .75 && rect.bottom <= tileBounds.bottom + .75,
              });
            }
          }
        }
      }
      const stars = [...tile.querySelectorAll('svg.review-star')].map(star => {
        const rect = star.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          contained: rect.left >= tileBounds.left - .75 && rect.right <= tileBounds.right + .75
            && rect.top >= tileBounds.top - .75 && rect.bottom <= tileBounds.bottom + .75,
        };
      });
      return { id: tile.dataset.reviewId, words, stars };
    }));
    assert.ok(bounds.every(review => review.words.length > 0 && review.words.every(word => word.contained)),
      `390px doubled review text must remain inside its card: ${JSON.stringify(bounds)}`);
    assert.ok(bounds.every(review => review.stars.length === 5 && review.stars.every(star => star.width > 0 && star.height > 0 && star.contained)),
      `390px doubled review text must not clip any star: ${JSON.stringify(bounds)}`);
    const geometry = await assessGeometry(entry.page, 390);
    for (const group of geometry.groups) assert.deepEqual(group.overlaps, [], `390px enlarged text makes ${group.id} overlap: ${JSON.stringify(group.overlaps)}`);
    return '390px reduced-motion review quote and credit text can double, relayout in whole grid units, and retain every word/star without overlap';
  } finally { await entry.context.close(); }
}

async function assertHeaderFooter(page) {
  const nav = page.locator('header.topbar nav.primary-nav');
  await nav.waitFor({ state: 'visible' });
  const navText = await nav.innerText();
  const normalizedNav = navText.toLowerCase().replace(/[’']/g, '');
  for (const label of ['Websites', 'Our work', 'Get help']) {
    assert.ok(normalizedNav.includes(label.toLowerCase().replace(/[’']/g, '')), `primary header navigation lacks ${label}`);
  }
  const dock = page.locator('footer.dock');
  assert.equal(await dock.count(), 0, 'the former bottom action dock must be removed');
  const footer = page.locator('footer.site-footer');
  await footer.waitFor({ state: 'visible' });
  const footerText = await footer.innerText();
  for (const label of ['Answers', 'Your business', 'Reviews', 'About', 'Privacy choices']) assert.match(footerText, new RegExp(label, 'i'), `footer lacks ${label}`);
  const flow = await page.evaluate(() => {
    const header = document.querySelector('header.topbar');
    const canvas = document.querySelector('main#canvas.topic-canvas');
    const footer = document.querySelector('footer.site-footer');
    const styles = [header, footer].map(node => ({ position: getComputedStyle(node).position, width: node.getBoundingClientRect().width }));
    return { order: [header, canvas, footer].map(node => [...document.body.querySelectorAll('*')].indexOf(node)), styles, viewport: window.innerWidth };
  });
  assert.ok(flow.order[0] < flow.order[1] && flow.order[1] < flow.order[2], 'header, canvas, and footer must follow document order');
  assert.notEqual(flow.styles[1].position, 'fixed', 'footer must remain in normal page flow');
  assert.ok(flow.styles[0].width >= flow.viewport * 0.9 && flow.styles[1].width >= flow.viewport * 0.9, 'header and footer must span the full content row');
  assert.ok(Math.abs(flow.styles[0].width - flow.styles[1].width) <= 1, 'footer must span exactly the same content width as the header');
  return 'top primary nav and full-content-width normal-flow footer';
}

async function assertNavigationGlyphs(page) {
  const offenders = await page.evaluate(() => [...document.querySelectorAll('a, button')]
    .filter(node => /[↗↖↘↙→←➜➔]/.test(node.textContent || '') || /arrow|diagonal/i.test(node.className || ''))
    .map(node => ({ tag: node.tagName, text: (node.textContent || '').trim().slice(0, 80), className: node.className || '' })));
  assert.deepEqual(offenders, [], `navigation controls contain banned arrow glyphs/classes: ${JSON.stringify(offenders)}`);
  const pluses = await page.locator('a.tile [aria-hidden="true"]').evaluateAll(nodes => nodes.filter(node => (node.textContent || '').trim() === '+').length);
  assert.ok(pluses > 0, 'tiles must retain plus marks as the navigation glyph');
  return `${pluses} plus navigation marks; no arrow navigation glyphs`;
}

async function assertBacksAndReaders(page) {
  const colors = [];
  for (const [topic, id, label] of topics) {
    const tile = page.locator(`#${id} .mosaic[data-topic-grid] a.tile[data-anchor="${topic}"][data-topic="${topic}"]`).first();
    await tile.scrollIntoViewIfNeeded();
    const href = await tile.getAttribute('href');
    await tile.click();
    const enamel = page.locator('.lf-tile-flight .lf-motion-enamel').last();
    await enamel.waitFor({ state: 'attached' });
    const surface = await enamel.evaluate(node => {
      const style = getComputedStyle(node);
      return { color: style.getPropertyValue('--motion-pop').trim(), image: style.backgroundImage };
    });
    assert.ok(surface.color, `${label} animated tile back is missing its topic color`);
    assert.notEqual(surface.image, 'none', `${label} animated tile back needs its enamel surface`);
    colors.push(surface.color);
    await page.locator('#detail[open]').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await page.locator('#detail').waitFor({ state: 'hidden' }).catch(async () => page.waitForFunction(() => !document.querySelector('#detail')?.open));
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('href')), href, `${label} reader close must restore source focus`);
  }
  assert.equal(new Set(colors).size, topics.length, `service anchors need four distinct semantic back colors, received ${colors.join(', ')}`);
  return `four distinct topic-back colors: ${colors.join(', ')}`;
}

async function assertRegroupedCardPlacement(page) {
  for (const [cardId, family, accent] of regroupedCards) {
    const tile = page.locator(`a.tile[data-answer="${cardId}"]`);
    assert.equal(await tile.count(), 1, `${cardId} must have one visible homepage card`);
    await tile.scrollIntoViewIfNeeded();
    const semantics = await tile.evaluate(node => ({
      sectionTopic: node.closest('section.topic-section')?.dataset.topic || '',
      gridTopic: node.closest('[data-topic-grid]')?.dataset.topic || '',
      tileTopic: node.dataset.topic || '',
      family: node.dataset.family || '',
      materialFamily: node.dataset.materialFamily || '',
      accent: node.dataset.accent || '',
    }));
    assert.deepEqual(semantics, {
      sectionTopic: family,
      gridTopic: family,
      tileTopic: family,
      family,
      materialFamily: family,
      accent,
    }, `${cardId} must use its ${family} topic, material family, and ${accent} accent: ${JSON.stringify(semantics)}`);
  }
  return `${regroupedCards.length} preserved cards sit in their intended topic sections with matching family and accent semantics`;
}

async function assertRegroupedReaderContext(page) {
  for (const [cardId, family, label] of regroupedReaderSamples) {
    const tile = page.locator(`a.tile[data-answer="${cardId}"]`);
    await tile.scrollIntoViewIfNeeded();
    const href = await tile.getAttribute('href');
    assert.ok(href, `${cardId} needs its canonical link`);
    await tile.click();
    await page.locator('#detail[open]').waitFor({ state: 'visible' });
    const context = await page.locator('#detail').evaluate(detail => ({
      family: detail.dataset.readerFamily || '',
      path: detail.dataset.readerPath || '',
      panelFamily: detail.querySelector('.detail-window')?.dataset.readerFamily || '',
    }));
    assert.equal(context.family, family, `${label} must open with its ${family} reader category`);
    assert.equal(context.panelFamily, family, `${label} panel must retain its ${family} reader category`);
    assert.equal(context.path, new URL(href, base).pathname, `${label} must load its own retained app reader`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#detail')?.open);
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('href')), href,
      `${label} must return focus to its originating card after closing`);
  }
  return 'software Lab, geographic album, moved answer, and VERA wrapper retain reader category and app-like close/focus return';
}

async function assertOriginalOrangePolicy(page) {
  const colors = await page.locator('a.tile[data-accent="orange"]').evaluateAll(tiles => tiles.map(tile => ({
    id: tile.dataset.answer || '',
    kind: tile.dataset.kind || '',
    family: tile.dataset.family || '',
    href: tile.getAttribute('href'),
    color: getComputedStyle(tile).getPropertyValue('--motion-pop').trim(),
  })));
  assert.ok(colors.some(item => item.kind === 'case-study'), 'case-study cards must retain Little Fight orange material');
  assert.ok(colors.some(item => item.family === 'brand' || item.id === ''), 'Little Fight brand cards must retain orange material');
  assert.ok(colors.some(item => item.kind === 'review' || /review/i.test(item.id)), 'review cards must retain orange material');
  const nonOrange = colors.filter(item => !/ff7839|ff9a68|orange/i.test(item.color));
  assert.deepEqual(nonOrange, [], `Little Fight brand, case, and review cards must preserve orange material: ${JSON.stringify(nonOrange)}`);
  return `${colors.length} remaining Little Fight brand, case, and review cards retain orange material`;
}

async function assertNoJavaScript(browser, manifest) {
  const { context, page } = await makePage(browser, { width: 390, height: 844 }, false);
  try {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    assert.equal(await page.locator('a.tile[href]').count(), manifest.inventory.visibleTiles.length, 'no-JS page must keep the complete consolidated tile hub');
    for (const [, id, label] of topics) {
      assert.equal(await page.locator(`#${id} > header.topic-heading > h2`).count(), 1, `no-JS page must retain ${label} heading`);
    }
    const sample = page.locator('#topic-consulting a.tile[href]').first();
    await sample.scrollIntoViewIfNeeded();
    const sampleRect = await sample.boundingBox();
    assert.ok(sampleRect && sampleRect.width > 2 && sampleRect.height > 2, 'no-JS tiles must remain visible and sized');
    const footer = page.locator('footer.site-footer');
    await footer.scrollIntoViewIfNeeded();
    assert.equal(await footer.isVisible(), true, 'no-JS footer must remain reachable');
    return `${manifest.inventory.visibleTiles.length} readable links, four headings, and footer without JavaScript`;
  } finally { await context.close(); }
}

async function assertReaderContextFigures(browser) {
  const readers = [
    ['website answer', '/answers/help/website/'],
    ['software answer', '/answers/help/software-duplicate-entry/'],
    ['IT answer', '/answers/help/it-payment-device-check/'],
    ['VERA companion', '/_readers/vera/'],
  ];
  const measurements = [];
  for (const viewport of [{ width: 1440, height: 940 }, { width: 768, height: 1024 }]) {
    const { context, page } = await makePage(browser, viewport);
    try {
      for (const [label, route] of readers) {
        await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
        if (label === 'VERA companion') {
          const context = page.locator('details.reader-demo-context');
          const summary = context.locator('> summary');
          assert.equal(await context.count(), 1, 'VERA must retain its disclosed context panel');
          await summary.waitFor({ state: 'visible' });
          assert.equal(await context.evaluate(node => node.open), false, 'VERA context starts closed so the working app stays primary');
          await summary.click();
          await page.waitForFunction(() => document.querySelector('details.reader-demo-context')?.open === true);
        }
        if (label === 'IT answer') {
          const visual = page.locator('.answer-visual .reader-context-visual');
          await visual.waitFor({ state: 'visible' });
          assert.equal(await visual.locator('.reader-context-image').count(), 0,
            'payment-device help must not reuse the unrelated workshop photograph');
          const bounds = await visual.evaluate(node => ({
            figureWidth: node.getBoundingClientRect().width,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            iconLoaded: [...node.querySelectorAll('img')].every(img => img.complete && img.naturalWidth > 0),
          }));
          assert.ok(bounds.figureWidth > 150 && bounds.overflow <= 1 && bounds.iconLoaded,
            `${viewport.width}px IT illustration must remain visible, loaded, and contained`);
          measurements.push({ viewport: viewport.width, label, ...bounds });
          continue;
        }
        const figure = page.locator('.story-art .reader-context-figure, .answer-visual .reader-context-figure');
        const caption = figure.locator('figcaption');
        await figure.waitFor({ state: 'visible' });
        const bounds = await figure.evaluate(node => {
          const figureRect = node.getBoundingClientRect();
          const captionRect = node.querySelector('figcaption')?.getBoundingClientRect();
          return {
            figureWidth: figureRect.width,
            captionWidth: captionRect?.width || 0,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        });
        assert.ok(bounds.figureWidth > 150, `${viewport.width}px ${label} contextual figure is too narrow: ${bounds.figureWidth}px`);
        assert.ok(bounds.captionWidth > 150, `${viewport.width}px ${label} contextual caption is too narrow: ${bounds.captionWidth}px`);
        assert.ok(bounds.overflow <= 1, `${viewport.width}px ${label} contextual reader overflows by ${bounds.overflow}px`);
        measurements.push({ viewport: viewport.width, label, ...bounds });
      }
    } finally { await context.close(); }
  }
  return `context figures stay useful at 1440/768px: ${measurements.map(item => `${item.label} ${item.figureWidth.toFixed(0)}px`).join(', ')}`;
}

async function assertEdgeLightClears(page) {
  await page.mouse.move(2, 2);
  const cards = page.locator('#topic-web .tile');
  const sample = () => cards.evaluateAll(tiles => tiles.slice(0, 4).map(tile => ({
    shadow: getComputedStyle(tile).boxShadow,
    edge: Number(getComputedStyle(tile, '::before').opacity),
    surface: Number(getComputedStyle(tile, '::after').opacity),
  })));
  const resting = await sample();
  // Cross several tiles before the former shared 560ms timeout could finish.
  for (let index = 0; index < 4; index += 1) {
    const box = await cards.nth(index).boundingBox();
    assert.ok(box, 'hover test tile must be visible');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(70);
  }
  await page.mouse.move(2, 2);
  await page.waitForTimeout(800);
  assert.deepEqual(await sample(), resting, 'rapidly crossed tiles must return to their resting surface after pointer exit');

  // Clearing pointer light must preserve the independent keyboard focus cue.
  for (let index = 0; index < 20; index += 1) {
    await page.keyboard.press('Tab');
    if (await page.locator('.tile:focus-visible').count()) break;
  }
  const focused = page.locator('.tile:focus-visible');
  assert.equal(await focused.count(), 1, 'keyboard navigation must visibly focus a tile');
  await page.waitForTimeout(220);
  assert.ok(await focused.evaluate(tile => {
    const style = getComputedStyle(tile);
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2
      && Number(getComputedStyle(tile, '::before').opacity) >= .8;
  }), 'keyboard focus must keep a clear outline and active edge light');
  return 'real pointer sweep clears all four tiles; keyboard focus retains its separate visible cue';
}

async function assertStoryArtworkFits(page, width) {
  const cards = await page.locator('.tile[data-editorial-story]').evaluateAll(tiles => tiles.map(tile => {
    const image = tile.querySelector('.editorial-story-image');
    const frame = tile.querySelector('.editorial-story-art').getBoundingClientRect();
    const art = image.getBoundingClientRect();
    const caption = tile.querySelector('.editorial-story-copy').getBoundingClientRect();
    const title = tile.querySelector('.editorial-story-copy .cell-title');
    return {
      id: tile.dataset.editorialStory,
      contained: art.left >= frame.left - 1 && art.top >= frame.top - 1
        && art.right <= frame.right + 1 && art.bottom <= frame.bottom + 1,
      overlap: Math.max(0, Math.min(art.right, caption.right) - Math.max(art.left, caption.left))
        * Math.max(0, Math.min(art.bottom, caption.bottom) - Math.max(art.top, caption.top)),
      fit: getComputedStyle(image).objectFit,
      visibleSide: Math.min(art.width, art.height),
      textOverflow: title.scrollWidth - title.clientWidth,
    };
  }));
  assert.ok(cards.length >= 9, `${width}px consolidated homepage needs at least nine distinct illustrated story fronts`);
  for (const card of cards) {
    assert.ok(card.contained, `${width}px ${card.id}: artwork extends outside its frame`);
    assert.equal(card.fit, 'contain', `${width}px ${card.id}: drawing must remain whole`);
    assert.ok(card.overlap <= 1, `${width}px ${card.id}: caption covers artwork`);
    assert.ok(card.visibleSide >= 100, `${width}px ${card.id}: whole drawing is too small (${card.visibleSide}px)`);
    assert.ok(card.textOverflow <= 1, `${width}px ${card.id}: title overflows its own column by ${card.textOverflow}px`);
  }
  return `${width}px: ${cards.length} drawings fit their frames without caption overlap`;
}

async function run() {
  const manifest = readHomepageInventory();
  pass('homepage inventory preserves every route while consolidating the hub',
    `${manifest.inventory.visibleTiles.length} visible of ${expected.totalInventory}; ${expected.groups} groups`);
  pass('all retained tile destinations have non-empty local readers and search records', assertRetainedRouteArtifacts(manifest));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const { context, page } = await makePage(browser, { width: 1440, height: 940 });
    await waitForHome(page);
    await check('edge light clears after rapid pointer movement and preserves keyboard focus', () => assertEdgeLightClears(page));
    await check('release marker and grouped homepage preserve all content', () => assertTopicStructure(page, manifest));
    await check('Problems? Solved. leads visually above the Websites anchor', () => assertBrandLeadsWebsite(page));
    await check('tile geometry preserves anchors, photographs, and original variety', () => assertTileGeometryAndType(page));
    await check('visible tile labels meet the 16px accessibility floor', () => assertReadableLabels(page));
    await check('icon-only desktop cards visibly contain their familiar symbol', () => assertIconOnlyFronts(page, 1440));
    await check('desktop tile words stay inside their fronts', () => assertVisibleTileTextFits(page, 1440));
    await check('review cards expose attributable five-star evidence', () => assertReviewEvidence(page));
    await check('header and footer use the requested document structure', () => assertHeaderFooter(page));
    await check('navigation uses plus marks instead of arrows', () => assertNavigationGlyphs(page));
    await check('each topic uses a distinct colored tile back and opens accessibly', () => assertBacksAndReaders(page));
    await check('reclassified cards use their correct homepage section, family, material, and accent', () => assertRegroupedCardPlacement(page));
    await check('representative reclassified readers keep their category and return to the app hub', () => assertRegroupedReaderContext(page));
    await check('Little Fight brand, case, and review cards retain orange material', () => assertOriginalOrangePolicy(page));
    await page.screenshot({ path: path.join(screenshots, 'topic-mosaic-1440.png'), fullPage: true });
    await context.close();

    for (const viewport of [{ width: 320, height: 720 }, { width: 390, height: 844 }, { width: 600, height: 940 }, { width: 768, height: 1024 }, { width: 1024, height: 940 }, { width: 1440, height: 940 }]) {
      const entry = await makePage(browser, viewport);
      try {
        // Geometry is measured in the stable accessible mode, so an entering
        // ribbon cannot briefly mask a clipped star or quote at a breakpoint.
        await entry.page.emulateMedia({ reducedMotion: 'reduce' });
        await waitForHome(entry.page);
        await assertReducedReviewMotion(entry.page, `${viewport.width}px`);
        await check(`${viewport.width}px Problems? Solved. stays above Websites`, () => assertBrandLeadsWebsite(entry.page));
        await check(`${viewport.width}px story artwork stays whole and clear of its caption`, () => assertStoryArtworkFits(entry.page, viewport.width));
        const geometry = await assessGeometry(entry.page, viewport.width);
        assert.ok(geometry.documentOverflow <= 1, `${viewport.width}px document overflows by ${geometry.documentOverflow}px`);
        assert.ok(geometry.bodyOverflow <= 1, `${viewport.width}px body overflows by ${geometry.bodyOverflow}px`);
        assert.equal(geometry.groups.length, topics.length, `${viewport.width}px must retain exactly four service groups`);
        for (const group of geometry.groups) {
          assert.ok(group.tileCount > 0, `${viewport.width}px ${group.id} has no tiles`);
          assert.deepEqual(group.hidden, [], `${viewport.width}px ${group.id} contains hidden or zero-size tiles`);
          assert.deepEqual(group.overlaps, [], `${viewport.width}px ${group.id} tiles overlap: ${JSON.stringify(group.overlaps)}`);
          assert.deepEqual(group.occupancy.invalidPositions, [], `${viewport.width}px ${group.id} needs exact integer grid placement: ${JSON.stringify(group.occupancy.invalidPositions)}`);
          assert.equal(group.occupancy.packVacancies, 'false', `${viewport.width}px ${group.id} packer reported a vacant cell`);
          assert.deepEqual(group.occupancy.vacancies, [], `${viewport.width}px ${group.id} has empty cells inside its occupied grid rectangle: ${JSON.stringify(group.occupancy.vacancies)}`);
          assert.deepEqual(group.occupancy.lastRowVacancies, [], `${viewport.width}px ${group.id} leaves empty cells on its final occupied grid row: ${JSON.stringify(group.occupancy.lastRowVacancies)}`);
        }
        assert.equal(geometry.reviewSections, 0, `${viewport.width}px review cards must never form a standalone review section`);
        assert.equal(geometry.reviewTiles.length, expected.reviews, `${viewport.width}px must retain seven reviews`);
        assert.ok(geometry.reviewTiles.every(tile => tile.visible && tile.width > 2 && tile.height > 2), `${viewport.width}px review cards are clipped or hidden`);
        assert.ok(geometry.reviewTiles.every(tile => tile.columns === 3),
          `${viewport.width}px review cards must keep the same three-column measure instead of stretching to fill gaps: ${JSON.stringify(geometry.reviewTiles)}`);
        assert.ok(new Set(geometry.reviewTiles.map(tile => tile.topic)).size >= topics.length,
          `${viewport.width}px reviews must stay distributed across all service groups: ${JSON.stringify(geometry.reviewTiles)}`);
        assert.ok(geometry.reviewTiles.every(tile => tile.stars.length === 5 && tile.stars.every(star => star.width > 0 && star.height > 0 && star.contained)),
          `${viewport.width}px every review star must remain visible inside its card: ${JSON.stringify(geometry.reviewTiles)}`);
        const iconOnly = await assertIconOnlyFronts(entry.page, viewport.width);
        const textFit = await assertVisibleTileTextFits(entry.page, viewport.width);
        report.viewports.push({ ...viewport, ...geometry, iconOnly, textFit });
        await entry.page.screenshot({ path: path.join(screenshots, `topic-mosaic-${viewport.width}.png`), fullPage: true });
      } finally { await entry.context.close(); }
    }
    await check('homepage accepts real desktop wheel and keyboard input, mobile touch input, and resumes after a reader closes', () => assertInputScrollingAndReaderResume(browser));
    await check('Website anchor photos and equal icon frames remain visible at phone sizes with six columns through 1000px', () => assertResponsiveAnchorPresentation(browser));
    await check('review micro-interactions remain finite, source-faithful, and reduced-motion-safe', () => assertReviewMotion(browser));
    await check('390px review text enlargement relayouts complete square units without clipping', () => assertReviewTextGrowthAt390(browser));
    await check('no-JavaScript homepage remains a complete readable document', () => assertNoJavaScript(browser, manifest));
    await check('ordinary readers and the VERA companion keep useful contextual figures', () => assertReaderContextFigures(browser));
    assert.deepEqual(report.blockedMutations, [], `unexpected mutating requests: ${JSON.stringify(report.blockedMutations)}`);
    assert.deepEqual(report.pageErrors, [], `page errors: ${report.pageErrors.join(' | ')}`);
    assert.deepEqual(report.resourceFailures, [], `failed local resources: ${JSON.stringify(report.resourceFailures)}`);
    pass('local test used no form submission or review-site request');
  } finally { await browser.close(); }
}

run().then(() => {
  report.completedAt = new Date().toISOString();
  report.passed = report.assertions.every(assertion => assertion.passed);
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
