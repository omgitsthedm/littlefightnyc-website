/*
 * Browser contract for the catalog-driven Lab tile fronts.
 *
 * Run after the candidate has been built and served locally:
 *   LAB_FRONTS_URL=http://127.0.0.1:4396 node scripts/verify-lab-fronts.cjs
 *
 * This only reads the local artifact in installed Google Chrome. It blocks all
 * non-GET/HEAD requests, never opens a Lab engine, and writes ignored local
 * screenshots plus a report outside the repository by default.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.LAB_FRONTS_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4396').replace(/\/$/, '');
const labs = JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'labs.json'), 'utf8'));
const curation = JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'homepage-curation.json'), 'utf8'));
const hiddenLabSlugs = new Set(curation.hiddenTiles
  .filter(tile => tile.id.startsWith('lab-'))
  .map(tile => tile.id.slice(4)));
const visibleLabs = labs.filter(lab => !hiddenLabSlugs.has(lab.slug));
const hiddenLabs = labs.filter(lab => hiddenLabSlugs.has(lab.slug));
const evidence = path.resolve(process.env.LAB_FRONT_EVIDENCE_DIR || '/tmp/lfnyc-lab-fronts');
const screenshots = path.join(evidence, 'screenshots');
const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 940 },
];
const expectedByHref = new Map(visibleLabs.map(lab => [lab.sharePath || `/labs/${lab.slug}/`, lab]));
const report = {
  kind: 'lab-fronts-browser-verification',
  base,
  startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome',
  assertions: [],
  viewports: [],
  images: [],
  screenshots: [],
  textEnlargement: [],
  pageErrors: [],
  resourceFailures: [],
  blockedMutations: [],
};

function pass(name, detail = '') { report.assertions.push({ name, passed: true, detail }); }
async function check(name, task) {
  try { pass(name, (await task()) || ''); }
  catch (error) {
    report.assertions.push({ name, passed: false, detail: error.stack || String(error) });
    throw error;
  }
}

function sameOrigin(raw) {
  try { return new URL(raw).origin === new URL(base).origin; }
  catch { return false; }
}

async function makePage(browser, viewport, javaScriptEnabled = true) {
  const isPhone = viewport.width <= 600;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: isPhone,
    hasTouch: isPhone,
    javaScriptEnabled,
  });
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
    if (sameOrigin(response.url()) && response.status() >= 400) {
      report.resourceFailures.push({ status: response.status(), url: response.url() });
    }
  });
  page.on('requestfailed', request => {
    const error = request.failure()?.errorText || 'request failed';
    if (sameOrigin(request.url()) && error !== 'net::ERR_ABORTED') {
      report.resourceFailures.push({ status: error, url: request.url() });
    }
  });
  return { context, page };
}

async function waitForHome(page) {
  const response = await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 60_000 });
  assert.ok(response, 'homepage needs a document response');
  assert.equal(response.status(), 200, 'homepage must return 200');
  await page.locator('main#canvas.topic-canvas').waitFor({ state: 'visible', timeout: 20_000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
}

function boxInside(inner, outer, slack = 1.5) {
  return inner.left >= outer.left - slack && inner.top >= outer.top - slack
    && inner.right <= outer.right + slack && inner.bottom <= outer.bottom + slack;
}

function overlapArea(a, b) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

async function assertCatalog(page, label) {
  assert.equal(visibleLabs.length, 5, 'homepage curation keeps exactly five Lab fronts');
  assert.equal(hiddenLabs.length, 6, 'homepage curation cuts exactly six Lab fronts');
  const observed = await page.locator('a.tile[data-kind="lab"]').evaluateAll(nodes => nodes.map(node => ({
    href: new URL(node.href).pathname,
    visible: Boolean(node.offsetWidth && node.offsetHeight && getComputedStyle(node).visibility !== 'hidden'),
    active: !node.hidden && getComputedStyle(node).display !== 'none',
  })));
  assert.equal(observed.length, visibleLabs.length, `${label}: each approved visible Lab has one homepage tile`);
  assert.equal(new Set(observed.map(item => item.href)).size, visibleLabs.length, `${label}: homepage Lab tile routes must be unique`);
  assert.deepEqual([...new Set(observed.map(item => item.href))].sort(), [...expectedByHref.keys()].sort(),
    `${label}: each approved visible Lab share route remains active on the homepage`);
  assert.ok(observed.every(item => item.visible && item.active), `${label}: every approved Lab tile must remain active and visible`);
  for (const lab of hiddenLabs) {
    const href = lab.sharePath || `/labs/${lab.slug}/`;
    assert.equal(await page.locator(`a.tile[data-kind="lab"][href="${href}"]`).count(), 0,
      `${label}/${lab.slug}: approved curation removes this Lab front from the homepage`);
  }
  return `${observed.length} visible Lab fronts; ${hiddenLabs.length} named curation cuts absent`;
}

async function awaitImage(image, label) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(async node => {
    if (!node.complete || !node.naturalWidth) {
      await new Promise((resolve, reject) => {
        node.addEventListener('load', resolve, { once: true });
        node.addEventListener('error', () => reject(new Error(node.currentSrc || node.src)), { once: true });
      });
    }
    if (typeof node.decode === 'function') {
      try { await node.decode(); } catch (error) {
        if (!node.complete || !node.naturalWidth) throw error;
      }
    }
  });
  const metadata = await image.evaluate(node => ({
    src: new URL(node.currentSrc || node.src, location.href).pathname,
    loading: node.getAttribute('loading'),
    complete: node.complete,
    naturalWidth: node.naturalWidth,
    naturalHeight: node.naturalHeight,
    renderedWidth: node.getBoundingClientRect().width,
    renderedHeight: node.getBoundingClientRect().height,
  }));
  assert.equal(metadata.loading, 'lazy', `${label}: below-fold Lab cover keeps native lazy loading`);
  assert.ok(metadata.complete && metadata.naturalWidth > 0 && metadata.naturalHeight > 0,
    `${label}: Lab cover must decode after scrolling into view`);
  assert.ok(metadata.renderedWidth > 0 && metadata.renderedHeight > 0, `${label}: Lab cover has rendered dimensions`);
  report.images.push({ label, ...metadata });
  return metadata;
}

async function inspectLab(page, lab, label) {
  const href = lab.sharePath || `/labs/${lab.slug}/`;
  const tile = page.locator(`a.tile[data-kind="lab"][href="${href}"]`);
  assert.equal(await tile.count(), 1, `${label}/${lab.slug}: one Lab tile`);
  await tile.scrollIntoViewIfNeeded();
  const face = tile.locator('.lab-tile-face');
  const media = face.locator('.lab-tile-media');
  const image = media.locator('img');
  const title = face.locator('.lab-tile-title');
  const hook = face.locator('.lab-tile-hook');
  const action = face.locator('.lab-tile-action');
  assert.equal(await face.count(), 1, `${label}/${lab.slug}: Lab front contract`);
  assert.equal(await media.count(), 1, `${label}/${lab.slug}: one Lab media mount`);
  assert.equal(await image.count(), 1, `${label}/${lab.slug}: one Lab cover`);
  assert.equal((await title.innerText()).trim(), lab.name, `${label}/${lab.slug}: title matches catalog`);
  assert.equal((await hook.innerText()).trim(), lab.tileDescription, `${label}/${lab.slug}: visible hook matches catalog`);
  assert.equal((await action.innerText()).trim(), lab.tileAction, `${label}/${lab.slug}: visible action matches catalog`);
  await awaitImage(image, `${label}/${lab.slug}`);

  const geometry = await tile.evaluate(node => {
    const rect = value => {
      const box = value.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    };
    const rangeRects = value => {
      const range = document.createRange();
      range.selectNodeContents(value);
      return [...range.getClientRects()].filter(box => box.width > 0 && box.height > 0)
        .map(box => ({ left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height }));
    };
    const face = node.querySelector('.lab-tile-face');
    const media = node.querySelector('.lab-tile-media');
    const image = media?.querySelector('img');
    const copy = node.querySelector('.lab-tile-copy');
    const parts = ['.lab-tile-title', '.lab-tile-hook', '.lab-tile-action'].map(selector => {
      const element = node.querySelector(selector);
      return { selector, box: element ? rect(element) : null, lines: element ? rangeRects(element) : [] };
    });
    return { tile: rect(node), face: rect(face), media: rect(media), image: rect(image), copy: rect(copy), parts };
  });
  assert.ok(geometry.tile.width > 0 && geometry.tile.height > 0, `${label}/${lab.slug}: tile has a layout box`);
  for (const [name, box] of Object.entries({ face: geometry.face, media: geometry.media, image: geometry.image, copy: geometry.copy })) {
    assert.ok(boxInside(box, geometry.tile), `${label}/${lab.slug}: ${name} must stay inside its tile`);
  }
  assert.ok(boxInside(geometry.image, geometry.media), `${label}/${lab.slug}: cover stays inside media mount`);
  assert.ok(overlapArea(geometry.media, geometry.copy) <= 2, `${label}/${lab.slug}: cover and copy cannot overlap`);
  for (const part of geometry.parts) {
    assert.ok(part.box && part.box.width > 0 && part.box.height > 0, `${label}/${lab.slug}: ${part.selector} is visible`);
    assert.ok(boxInside(part.box, geometry.copy), `${label}/${lab.slug}: ${part.selector} box stays inside copy`);
    assert.ok(part.lines.length > 0, `${label}/${lab.slug}: ${part.selector} has visible text lines`);
    for (const line of part.lines) {
      assert.ok(boxInside(line, geometry.copy), `${label}/${lab.slug}: ${part.selector} text does not clip`);
      assert.ok(boxInside(line, geometry.tile), `${label}/${lab.slug}: ${part.selector} text does not leave tile`);
    }
  }
  for (let index = 0; index < geometry.parts.length; index += 1) {
    for (let other = index + 1; other < geometry.parts.length; other += 1) {
      assert.ok(overlapArea(geometry.parts[index].box, geometry.parts[other].box) <= 2,
        `${label}/${lab.slug}: ${geometry.parts[index].selector} and ${geometry.parts[other].selector} cannot overlap`);
    }
  }
  return geometry;
}

async function assertGridFits(page, label) {
  const result = await page.evaluate(() => {
    const rect = node => {
      const box = node.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    };
    const intersections = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
      * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const grids = [...document.querySelectorAll('[data-topic-grid]')].map(grid => {
      const gridRect = rect(grid);
      const tiles = [...grid.querySelectorAll(':scope > a.tile')].filter(tile => {
        const style = getComputedStyle(tile);
        return style.display !== 'none' && style.visibility !== 'hidden' && tile.getBoundingClientRect().width > 0;
      });
      const boxes = tiles.map(tile => ({ id: tile.dataset.answer || tile.getAttribute('href'), box: rect(tile) }));
      const overlaps = [];
      for (let outer = 0; outer < boxes.length; outer += 1) {
        for (let inner = outer + 1; inner < boxes.length; inner += 1) {
          if (intersections(boxes[outer].box, boxes[inner].box) > 2) overlaps.push([boxes[outer].id, boxes[inner].id]);
        }
      }
      const outside = boxes.filter(item => item.box.left < gridRect.left - 1 || item.box.right > gridRect.right + 1).map(item => item.id);
      return { id: grid.closest('[data-topic]')?.id || grid.id || 'topic-grid', tileCount: tiles.length, overlaps, outside, scrollOverflow: grid.scrollWidth - grid.clientWidth };
    });
    return {
      documentOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth,
      grids,
    };
  });
  assert.ok(result.documentOverflow <= 1, `${label}: homepage has ${result.documentOverflow}px horizontal overflow`);
  assert.ok(result.grids.length >= 4, `${label}: expected all topic grids`);
  for (const grid of result.grids) {
    assert.ok(grid.scrollOverflow <= 1, `${label}/${grid.id}: grid has ${grid.scrollOverflow}px horizontal overflow`);
    assert.deepEqual(grid.outside, [], `${label}/${grid.id}: tiles must remain inside the grid`);
    assert.deepEqual(grid.overlaps, [], `${label}/${grid.id}: tiles must not overlap`);
  }
  return `${result.grids.length} grids fit with no horizontal overflow or overlaps`;
}

async function assertKeyboardFocus(page, label) {
  const tile = page.locator('a.tile[data-kind="lab"]').first();
  await tile.scrollIntoViewIfNeeded();
  await tile.focus();
  const focused = await tile.evaluate(node => ({
    active: document.activeElement === node,
    visible: node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0,
  }));
  assert.ok(focused.active && focused.visible, `${label}: first Lab tile remains keyboard focusable and visible`);
  return 'first Lab tile accepts keyboard focus';
}

async function assertPausedMotionKeepsContent(page, label) {
  await page.locator('#explore-toggle').click();
  const toggle = page.locator('#motion-toggle');
  await toggle.waitFor({ state: 'visible' });
  await toggle.click();
  await page.waitForFunction(() => document.body.classList.contains('no-motion'));
  const content = await page.locator('a.tile[data-kind="lab"] .lab-tile-face').evaluateAll(nodes => nodes.map(face => ({
    title: face.querySelector('.lab-tile-title')?.textContent.trim(),
    hook: face.querySelector('.lab-tile-hook')?.textContent.trim(),
    action: face.querySelector('.lab-tile-action')?.textContent.trim(),
    imageVisible: Boolean(face.querySelector('.lab-tile-media img')?.getBoundingClientRect().width),
  })));
  assert.equal(content.length, visibleLabs.length, `${label}: pause mode retains every visible Lab front`);
  const expected = new Map(visibleLabs.map(lab => [lab.name, lab]));
  assert.ok(content.every(item => {
    const lab = expected.get(item.title);
    return lab && item.hook === lab.tileDescription && item.action === lab.tileAction && item.imageVisible;
  }), `${label}: pause mode must not hide Lab content`);
  await page.keyboard.press('Escape');
  return 'paused motion retains every visible Lab title, hook, action, and cover';
}

async function assertTwoHundredPercentText(page, label) {
  const before = await page.locator('a.tile[data-kind="lab"]').evaluateAll(nodes => nodes.map(node => ({
    slug: new URL(node.href).pathname.split('/').filter(Boolean).pop(),
    title: parseFloat(getComputedStyle(node.querySelector('.lab-tile-title')).fontSize),
    hook: parseFloat(getComputedStyle(node.querySelector('.lab-tile-hook')).fontSize),
    action: parseFloat(getComputedStyle(node.querySelector('.lab-tile-action')).fontSize),
  })));
  await page.evaluate(() => {
    if (document.documentElement.dataset.labFrontTextDoubled) throw new Error('Lab front text enlargement must run once per page');
    document.documentElement.dataset.labFrontTextDoubled = 'true';
    for (const tile of document.querySelectorAll('a.tile[data-kind="lab"]')) {
      for (const selector of ['.lab-tile-title', '.lab-tile-hook', '.lab-tile-action']) {
        const element = tile.querySelector(selector);
        const current = parseFloat(getComputedStyle(element).fontSize);
        element.style.setProperty('font-size', `${current * 2}px`, 'important');
      }
    }
  });
  await page.waitForFunction(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForTimeout(180);
  const after = await page.locator('a.tile[data-kind="lab"]').evaluateAll(nodes => nodes.map(node => ({
    slug: new URL(node.href).pathname.split('/').filter(Boolean).pop(),
    title: parseFloat(getComputedStyle(node.querySelector('.lab-tile-title')).fontSize),
    hook: parseFloat(getComputedStyle(node.querySelector('.lab-tile-hook')).fontSize),
    action: parseFloat(getComputedStyle(node.querySelector('.lab-tile-action')).fontSize),
  })));
  assert.equal(after.length, before.length, `${label}: 200% test retains every visible Lab tile`);
  for (const initial of before) {
    const current = after.find(item => item.slug === initial.slug);
    assert.ok(current, `${label}/${initial.slug}: 200% text tile remains in the grid`);
    for (const field of ['title', 'hook', 'action']) {
      assert.ok(current[field] >= initial[field] * 1.99, `${label}/${initial.slug}: ${field} is actually doubled (${initial[field]} -> ${current[field]})`);
    }
  }
  for (const lab of visibleLabs) await inspectLab(page, lab, `${label}/200-percent-text`);
  await assertGridFits(page, `${label}/200-percent-text`);
  report.textEnlargement.push({ label, before, after });
  return 'title, hook, and action doubled once for every visible Lab tile without clipping or collisions';
}

async function captureEvidence(page, viewport) {
  if (![390, 1440].includes(viewport.width)) return;
  await page.evaluate(() => document.activeElement?.blur());
  for (const lab of visibleLabs) {
    const href = lab.sharePath || `/labs/${lab.slug}/`;
    const tile = page.locator(`a.tile[data-kind="lab"][href="${href}"]`);
    await tile.scrollIntoViewIfNeeded();
    const target = path.join(screenshots, `lab-${lab.slug}-${viewport.width}.png`);
    await tile.screenshot({ path: target });
    report.screenshots.push(path.relative(path.resolve(app, '..'), target));
  }
  const software = page.locator('#topic-software');
  assert.equal(await software.count(), 1, `${viewport.width}px: Custom software topic exists for overview evidence`);
  await software.scrollIntoViewIfNeeded();
  const target = path.join(screenshots, `topic-software-${viewport.width}.png`);
  await software.screenshot({ path: target });
  report.screenshots.push(path.relative(path.resolve(app, '..'), target));
}

async function run() {
  fs.mkdirSync(screenshots, { recursive: true });
  const probe = await fetch(`${base}/`);
  assert.equal(probe.status, 200, `Candidate unavailable at ${base}`);
  pass('local Lab-front candidate is available');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const viewport of viewports) {
      const label = `${viewport.width}x${viewport.height}`;
      const { context, page } = await makePage(browser, viewport);
      try {
        await waitForHome(page);
        await check(`${label}: visible Lab routes survive and curation cuts remain absent`, () => assertCatalog(page, label));
        await check(`${label}: full mosaic grid fits`, () => assertGridFits(page, label));
        await check(`${label}: each Lab front is readable and its cover decodes`, async () => {
          for (const lab of visibleLabs) await inspectLab(page, lab, label);
          return `${visibleLabs.length} visible Lab fronts match catalog copy, fit their tiles, and decode their lazy covers`;
        });
        await check(`${label}: Lab fronts remain focusable`, () => assertKeyboardFocus(page, label));
        await check(`${label}: paused motion keeps Lab content`, () => assertPausedMotionKeepsContent(page, label));
        await captureEvidence(page, viewport);
        if (viewport.width === 320 || viewport.width === 390) {
          await check(`${label}: actual 200% Lab text stays usable`, () => assertTwoHundredPercentText(page, label));
        }
        report.viewports.push({ ...viewport, passed: true });
      } finally {
        await context.close();
      }
    }
    for (const width of [320, 360, 361, 375, 390, 414, 768, 1024, 1440]) {
      const { context, page } = await makePage(browser, { width, height: 844 }, false);
      try {
        await waitForHome(page);
        await check(`${width}px: Lab fronts work without JavaScript`, async () => {
          await assertCatalog(page, `${width}px/no-js`);
          for (const lab of visibleLabs) await inspectLab(page, lab, `${width}px/no-js`);
          await assertGridFits(page, `${width}px/no-js`);
          return 'all visible Lab descriptions, previews, and native links remain readable';
        });
      } finally { await context.close(); }
    }
    await check('browser reports no same-origin resource failures', () => {
      assert.deepEqual(report.resourceFailures, [], JSON.stringify(report.resourceFailures));
      return 'no same-origin 4xx/5xx or failed assets';
    });
    await check('browser reports no page errors', () => {
      assert.deepEqual(report.pageErrors, [], JSON.stringify(report.pageErrors));
      return 'no JavaScript errors';
    });
  } finally {
    await browser.close();
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(`PASS Lab fronts: ${visibleLabs.length} visible fronts (${hiddenLabs.length} approved cuts absent) across ${viewports.length} viewports; evidence in ${evidence}`);
}

run().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
