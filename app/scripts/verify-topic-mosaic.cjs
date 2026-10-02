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
const expected = { tiles: 133, originals: 110, reviews: 7, routes: 405 };
const topics = [
  ['web', 'topic-web', 'Websites'],
  ['it', 'topic-it', 'Tech support'],
  ['consulting', 'topic-consulting', 'Consulting'],
  ['software', 'topic-software', 'Custom software'],
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
  assert.equal(hrefs.length, expected.originals, 'source mosaic must retain exactly 110 original identities');
  return hrefs.map(href => href.startsWith('/#album-') ? `/photos/${href.slice('/#album-'.length)}/` : href);
}

async function makePage(browser, viewport, javaScriptEnabled = true) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, javaScriptEnabled });
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
    await desktop.page.waitForFunction(() => window.scrollY < 8, null, { timeout: 1_500 });
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
    await desktop.page.waitForFunction(() => window.scrollY < 8, null, { timeout: 1_500 });
    await desktop.page.keyboard.press('PageDown');
    await desktop.page.waitForTimeout(180);
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
        const webPhoto = document.querySelector('#topic-web a.tile[data-anchor="web"] .topic-anchor-photo img');
        const icons = [...document.querySelectorAll('.topic-section[data-topic]:not(#topic-reviews) .topic-anchor-icon')]
          .map(node => {
            const rect = node.getBoundingClientRect();
            return { width: rect.width, height: rect.height, visible: visible(node) };
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
      assert.equal(presentation.icons.length, topics.length, `${viewport.width}px needs one icon frame for every service anchor`);
      assert.ok(presentation.icons.every(icon => icon.visible), `${viewport.width}px service anchor icon is hidden: ${JSON.stringify(presentation.icons)}`);
      const reference = presentation.icons[0];
      assert.ok(presentation.icons.every(icon => Math.abs(icon.width - reference.width) <= 1 && Math.abs(icon.height - reference.height) <= 1),
        `${viewport.width}px service anchor icon frames are inconsistent: ${JSON.stringify(presentation.icons)}`);
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
      const tiles = [...section.querySelectorAll('.mosaic[data-topic-grid] a.tile[href]')];
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
      return { id: section.id, topic: section.dataset.topic, tileCount: tiles.length, hidden: rects.filter(rect => !rect.visible), overlaps };
    });
    const root = document.documentElement;
    const reviewTiles = [...document.querySelectorAll('#topic-reviews [data-review-tile]')].map(tile => {
      const rect = tile.getBoundingClientRect();
      return { width: rect.width, height: rect.height, visible: visible(tile) };
    });
    return {
      groups,
      reviewTiles,
      documentOverflow: root.scrollWidth - root.clientWidth,
      bodyOverflow: document.body.scrollWidth - root.clientWidth,
    };
  });
}

async function assertTopicStructure(page) {
  const release = JSON.parse(fs.readFileSync(path.join(app, 'dist', 'tile-release.json'), 'utf8'));
  assert.equal(release.tiles, expected.tiles, 'release marker must record 133 tiles');
  assert.equal(release.originalTilesPreserved, expected.originals, 'release marker must record 110 originals');
  assert.equal(release.routes, expected.routes, 'release marker must record 405 routes');
  assert.equal(await page.locator('a.tile[href]').count(), expected.tiles, 'homepage must expose every tile as a real link');
  const homeHrefs = await page.locator('a.tile[href]').evaluateAll(tiles => tiles.map(tile => tile.getAttribute('href')));
  for (const href of sourceOriginalDestinations()) assert.ok(homeHrefs.includes(href), `original tile destination disappeared: ${href}`);
  for (const [topic, id, label] of topics) {
    const section = page.locator(`section.topic-section#${id}[data-topic="${topic}"]`);
    assert.equal(await section.count(), 1, `${label} needs one semantic topic section`);
    await section.locator(':scope > header.topic-heading > h2').waitFor({ state: 'visible' });
    assert.ok(await section.locator(`.mosaic[data-topic-grid][data-topic="${topic}"] a.tile[href]`).count() > 0, `${label} needs at least one tile`);
  }
  const reviewSection = page.locator('section.topic-section#topic-reviews[data-topic="reviews"]');
  assert.equal(await reviewSection.count(), 1, 'Google reviews needs its own semantic topic section');
  await reviewSection.locator(':scope > header.topic-heading > h2').waitFor({ state: 'visible' });
  assert.ok(await reviewSection.locator('.mosaic[data-topic-grid][data-topic="reviews"] a.tile[href]').count() > 0, 'Google reviews needs a topic grid');
  const reviews = page.locator('#topic-reviews [data-review-tile]');
  assert.equal(await reviews.count(), expected.reviews, 'review section must contain seven individual review tiles');
  return `133 links; 110 original destinations; ${topics.length} service groups plus review group; seven reviews`;
}

async function assertTileGeometryAndType(page) {
  const dimensions = async locator => locator.evaluate(node => ({
    columns: Number(node.dataset.columns), rows: Number(node.dataset.rows),
    preferredColumns: Number(node.dataset.preferredColumns), preferredRows: Number(node.dataset.preferredRows),
  }));
  for (const [topic, id, label] of topics) {
    const anchor = page.locator(`#${id} a.tile[data-anchor="${topic}"]`).first();
    assert.equal(await anchor.count(), 1, `${label} must retain its 4 by 2 anchor tile`);
    const size = await dimensions(anchor);
    assert.deepEqual([size.columns, size.rows], [4, 2], `${label} anchor must lay out at 4 by 2`);
    assert.deepEqual([size.preferredColumns, size.preferredRows], [4, 2], `${label} anchor must preserve its 4 by 2 preferred geometry`);
  }
  const brand = page.locator('#topic-reviews a.tile[data-answer="google-reviews"]').first();
  assert.equal(await brand.count(), 1, 'the existing aggregate Google review link must remain a tile');
  const brandSize = await dimensions(brand);
  assert.deepEqual([brandSize.columns, brandSize.rows], [4, 2], 'aggregate Google review tile must lay out at 4 by 2');
  const reviewSizes = await page.locator('#topic-reviews [data-review-tile]').evaluateAll(nodes => nodes.map(node => [Number(node.dataset.columns), Number(node.dataset.rows)]));
  assert.ok(reviewSizes.every(([columns, rows]) => (columns === 3 && rows === 3) || (columns === 3 && rows === 1)), `review tiles must be 3x3 or 3x1: ${JSON.stringify(reviewSizes)}`);
  const albums = page.locator('a.tile[data-kind="photo-album"]');
  assert.ok(await albums.count() > 0, 'original photo albums must remain');
  const albumSizes = await albums.evaluateAll(nodes => nodes.map(node => [Number(node.dataset.columns), Number(node.dataset.rows)]));
  assert.ok(albumSizes.every(([columns, rows]) => columns === 4 && rows === 4), `photo tiles must retain 4 by 4 geometry: ${JSON.stringify(albumSizes)}`);
  const originalHrefs = new Set(sourceOriginalDestinations());
  const originalSizes = await page.locator('a.tile[href]').evaluateAll((tiles, hrefs) => tiles
    .filter(tile => hrefs.includes(tile.getAttribute('href')))
    .map(tile => `${tile.dataset.columns}x${tile.dataset.rows}`), [...originalHrefs]);
  for (const needed of ['1x1', '2x1', '1x2', '2x2', '2x3', '3x2']) {
    assert.ok(originalSizes.includes(needed), `original varied geometry ${needed} disappeared`);
  }
  return `4x2 anchors + brand; seven 3x3/3x1 reviews; ${albumSizes.length} 4x4 photos; varied originals ${[...new Set(originalSizes)].join(', ')}`;
}

async function assertReadableLabels(page) {
  const typography = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily,
    heading: getComputedStyle(document.querySelector('.topic-heading h2')).fontFamily,
    anchorIcons: [...document.querySelectorAll('.topic-section[data-topic] .tile[data-anchor] .topic-anchor-icon')].length,
  }));
  assert.match(typography.body, /Atkinson Hyperlegible Next/i, `body must retain the approved Atkinson Hyperlegible Next family: ${typography.body}`);
  assert.match(typography.heading, /Atkinson Hyperlegible Next/i, `homepage topic headings must retain the approved Atkinson Hyperlegible Next family: ${typography.heading}`);
  assert.equal(typography.anchorIcons, topics.length, 'each service anchor needs its approved icon treatment');
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

async function assertReviewEvidence(page) {
  const details = await page.locator('#topic-reviews [data-review-tile]').evaluateAll(tiles => tiles.map(tile => ({
    id: tile.getAttribute('data-review-id'),
    quote: tile.querySelector('.review-quote')?.textContent?.trim() || '',
    ratingOnly: tile.querySelector('.review-rating-only')?.textContent?.trim() || '',
    stars: tile.querySelector('.review-stars')?.getAttribute('aria-label') || tile.querySelector('.review-stars')?.textContent?.trim() || '',
    href: tile.matches('a[href^="https://"]') ? tile.getAttribute('href') || '' : tile.querySelector('a[href^="https://"]')?.getAttribute('href') || '',
    target: tile.matches('a') ? tile.getAttribute('target') || '' : tile.querySelector('a[href^="https://"]')?.getAttribute('target') || '',
    rel: tile.matches('a') ? tile.getAttribute('rel') || '' : tile.querySelector('a[href^="https://"]')?.getAttribute('rel') || '',
  })));
  assert.equal(details.length, expected.reviews);
  assert.equal(new Set(details.map(item => item.id)).size, expected.reviews, 'each review needs a stable identity');
  assert.equal(details.filter(item => item.quote.length >= 12).length, 6, 'six verified excerpts must remain quoted');
  assert.equal(details.filter(item => /five-star rating/i.test(item.ratingOnly)).length, 1, 'the text-free rating must remain an honest rating-only tile');
  for (const item of details) {
    assert.ok(item.id, 'review tile is missing data-review-id');
    assert.ok(item.quote.length >= 12 || /five-star rating/i.test(item.ratingOnly), `review ${item.id} has neither a verified quote nor the approved rating-only treatment`);
    assert.match(item.stars, /5(?:\.0)?\s*(?:out of\s*)?5|★★★★★/i, `review ${item.id} does not expose a five-star rating`);
    assert.match(item.href, /^https:\/\//, `review ${item.id} has no attributable external source link`);
    assert.equal(item.target, '_blank', `review ${item.id} must open its external source intentionally`);
    assert.match(item.rel, /\bnoopener\b/i, `review ${item.id} external link needs noopener`);
    assert.match(item.rel, /\bnoreferrer\b/i, `review ${item.id} external link needs noreferrer`);
  }
  return 'six verified excerpts plus one honest rating-only tile, all with five stars, distinct IDs, and safe external source links';
}

async function assertHeaderFooter(page) {
  const nav = page.locator('header.topbar nav.primary-nav');
  await nav.waitFor({ state: 'visible' });
  const navText = await nav.innerText();
  const normalizedNav = navText.toLowerCase().replace(/[’']/g, '');
  for (const label of ['Websites', 'Our work', 'Let’s build']) {
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

async function assertOriginalOrangePolicy(page) {
  const colors = await page.locator('a.tile[data-accent="orange"], a.tile[data-kind="photo-album"], a.tile[data-kind="lab"], a.tile[data-kind="project"]').evaluateAll(tiles => tiles.map(tile => ({
    href: tile.getAttribute('href'), color: getComputedStyle(tile).getPropertyValue('--motion-pop').trim(),
  })));
  assert.ok(colors.length > 0, 'original orange editorial tiles must remain in the grouped mosaic');
  const nonOrange = colors.filter(item => !/ff7839|ff9a68|orange/i.test(item.color));
  assert.deepEqual(nonOrange, [], `original brand, case, Lab, and album cards must preserve orange material: ${JSON.stringify(nonOrange)}`);
  return `${colors.length} original editorial cards retain orange material`;
}

async function assertNoJavaScript(browser) {
  const { context, page } = await makePage(browser, { width: 390, height: 844 }, false);
  try {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    assert.equal(await page.locator('a.tile[href]').count(), expected.tiles, 'no-JS page must keep all 133 tile links');
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
    return '133 readable links, four headings, and footer without JavaScript';
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
        const figure = page.locator('.story-art .reader-context-figure');
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

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const { context, page } = await makePage(browser, { width: 1440, height: 940 });
    await waitForHome(page);
    await check('release marker and grouped homepage preserve all content', () => assertTopicStructure(page));
    await check('tile geometry preserves anchors, photographs, and original variety', () => assertTileGeometryAndType(page));
    await check('visible tile labels meet the 16px accessibility floor', () => assertReadableLabels(page));
    await check('review cards expose attributable five-star evidence', () => assertReviewEvidence(page));
    await check('header and footer use the requested document structure', () => assertHeaderFooter(page));
    await check('navigation uses plus marks instead of arrows', () => assertNavigationGlyphs(page));
    await check('each topic uses a distinct colored tile back and opens accessibly', () => assertBacksAndReaders(page));
    await check('original case, Lab, album, and brand cards retain orange material', () => assertOriginalOrangePolicy(page));
    await page.screenshot({ path: path.join(screenshots, 'topic-mosaic-1440.png'), fullPage: true });
    await context.close();

    for (const viewport of [{ width: 320, height: 720 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 940 }]) {
      const entry = await makePage(browser, viewport);
      try {
        await waitForHome(entry.page);
        const geometry = await assessGeometry(entry.page, viewport.width);
        assert.ok(geometry.documentOverflow <= 1, `${viewport.width}px document overflows by ${geometry.documentOverflow}px`);
        assert.ok(geometry.bodyOverflow <= 1, `${viewport.width}px body overflows by ${geometry.bodyOverflow}px`);
        assert.equal(geometry.groups.length, topics.length + 1, `${viewport.width}px must retain four service groups plus reviews`);
        for (const group of geometry.groups) {
          assert.ok(group.tileCount > 0, `${viewport.width}px ${group.id} has no tiles`);
          assert.deepEqual(group.hidden, [], `${viewport.width}px ${group.id} contains hidden or zero-size tiles`);
          assert.deepEqual(group.overlaps, [], `${viewport.width}px ${group.id} tiles overlap: ${JSON.stringify(group.overlaps)}`);
        }
        assert.ok(geometry.groups.some(group => group.id === 'topic-reviews' && group.topic === 'reviews'), `${viewport.width}px must retain the review group boundary`);
        assert.equal(geometry.reviewTiles.length, expected.reviews, `${viewport.width}px must retain seven reviews`);
        assert.ok(geometry.reviewTiles.every(tile => tile.visible && tile.width > 2 && tile.height > 2), `${viewport.width}px review cards are clipped or hidden`);
        report.viewports.push({ ...viewport, ...geometry });
        await entry.page.screenshot({ path: path.join(screenshots, `topic-mosaic-${viewport.width}.png`), fullPage: true });
      } finally { await entry.context.close(); }
    }
    await check('homepage accepts real desktop wheel and keyboard input, mobile touch input, and resumes after a reader closes', () => assertInputScrollingAndReaderResume(browser));
    await check('Website anchor photos and equal icon frames remain visible at phone sizes with six columns through 1000px', () => assertResponsiveAnchorPresentation(browser));
    await check('no-JavaScript homepage remains a complete readable document', () => assertNoJavaScript(browser));
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
