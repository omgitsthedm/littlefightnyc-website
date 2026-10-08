/*
 * Exhaustive read-only reader pass for the homepage tile hub.
 *
 * Unlike the app-card verifier, this covers the authored reader interiors
 * behind every unique ordinary homepage tile at phone and desktop widths.
 * Working Labs and VERA have their own iframe/application contract in
 * verify-card-app.cjs and are explicitly recorded as skipped here.
 *
 * CARD_INTERIORS_URL=http://127.0.0.1:4396 node scripts/verify-card-interiors.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.CARD_INTERIORS_URL || process.env.PREVIEW_URL || '').replace(/\/$/, '');
assert.ok(base, 'CARD_INTERIORS_URL must point to the isolated local candidate');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Card interior sweep is local only');

const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'reader-audit', 'card-interiors');
const screenshots = path.join(evidence, 'screenshots');
fs.mkdirSync(screenshots, { recursive: true });

const viewports = [
  { name: 'phone', width: 320, height: 720 },
  { name: 'desktop', width: 1440, height: 940 },
];
// A fresh Chrome process per small batch keeps this exhaustive local pass
// stable on macOS while still exercising every card through its real opener.
const TARGETS_PER_BROWSER = 20;

const report = {
  kind: 'homepage-card-interior-sweep',
  base,
  startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome',
  viewports,
  targets: [],
  skipped: [],
  readers: [],
  pageErrors: [],
  resourceFailures: [],
  blockedMutations: [],
};

const sameOrigin = url => new URL(url).origin === new URL(base).origin;
const slug = value => value.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/g, '') || 'home';
const selectorForHref = href => `a.tile[href=${JSON.stringify(href)}]`;

function classifyTiles(tiles) {
  const ordinary = new Map();
  for (const tile of tiles) {
    const href = tile.href;
    const reason = !href.startsWith('/')
      ? 'external destination (review/source links do not open an in-card reader)'
      : tile.kind === 'lab'
        ? 'working Lab; covered by verify-card-app.cjs'
        : href === '/vera/' || tile.answer === 'vera'
          ? 'VERA application; covered by verify-card-app.cjs'
          : null;
    if (reason) {
      report.skipped.push({ href, answer: tile.answer || null, kind: tile.kind || null, family: tile.family || null, reason });
      continue;
    }
    const previous = ordinary.get(href);
    if (previous) {
      previous.tileCount += 1;
      continue;
    }
    ordinary.set(href, {
      href,
      answer: tile.answer || null,
      kind: tile.kind || 'unspecified',
      family: tile.family || tile.topic || tile.kind || 'other',
      topic: tile.topic || null,
      label: tile.label || tile.answer || href,
      tileCount: 1,
    });
  }
  return [...ordinary.values()].sort((left, right) => left.href.localeCompare(right.href));
}

function screenshotTargets(targets) {
  const selected = new Map();
  for (const target of targets) {
    if (!selected.has(target.family)) selected.set(target.family, target.href);
  }
  return selected;
}

async function makePage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.width <= 600,
    hasTouch: viewport.width <= 600,
    // This is an exhaustive content pass. Motion has its own focused suite;
    // reduced motion lets every reader settle immediately for a bounded run.
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.route('**/*', async route => {
    const request = route.request();
    if (!sameOrigin(request.url()) || !['GET', 'HEAD'].includes(request.method())) {
      if (!['GET', 'HEAD'].includes(request.method())) report.blockedMutations.push({ method: request.method(), url: request.url() });
      return route.abort('blockedbyclient');
    }
    return route.continue();
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

async function waitForReader(page, route) {
  await page.locator('#detail[open]').waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(expected => {
    const body = document.querySelector('#detail-body');
    return body && body.dataset.readerPath === expected && body.children.length > 0;
  }, route, { timeout: 15_000 });
}

async function assertControls(page, viewport) {
  const close = page.locator('#detail[open] #close-detail');
  await close.waitFor({ state: 'visible' });
  const closeBox = await close.boundingBox();
  assert.ok(closeBox && closeBox.width >= 44 && closeBox.height >= 44, 'close needs a visible 44px target');
  assert.ok(closeBox.x >= 0 && closeBox.y >= 0 && closeBox.x + closeBox.width <= viewport.width && closeBox.y + closeBox.height <= viewport.height,
    'close must remain inside the viewport');

  const contacts = page.locator('#detail[open] .reader-rail a:visible');
  const count = await contacts.count();
  assert.ok(count >= 3, 'reader must expose Call, Text, and Email');
  if (await page.locator('#detail[open] [data-reader-template="website-service"]').count()) {
    assert.equal(count, 3, 'the reference Website header keeps exactly Call, Text, and Email');
    assert.ok(await page.locator('#detail-body a.contact-plan').count() > 0, 'Website inquiry remains available in the complete service body');
  }
  const controls = [];
  for (let index = 0; index < count; index += 1) {
    const control = contacts.nth(index);
    await control.waitFor({ state: 'visible' });
    const box = await control.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `contact control ${index + 1} needs a 44px target`);
    const reachable = await control.evaluate(node => {
      const rect = node.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit === node || node.contains(hit);
    });
    assert.equal(reachable, true, `contact control ${index + 1} must not be covered`);
    controls.push({ label: (await control.innerText()).trim(), href: await control.getAttribute('href'), width: Math.round(box.width), height: Math.round(box.height) });
  }
  const contactDestinations = controls.map(control => control.href || '');
  assert.ok(contactDestinations.some(href => href.startsWith('tel:')), 'reader must expose Call');
  assert.ok(contactDestinations.some(href => href.startsWith('sms:')), 'reader must expose Text');
  assert.ok(contactDestinations.some(href => href.startsWith('mailto:')), 'reader must expose Email');
  return { close: { x: Math.round(closeBox.x), y: Math.round(closeBox.y), width: Math.round(closeBox.width), height: Math.round(closeBox.height) }, controls };
}

async function inspectReader(page) {
  const body = page.locator('#detail[open] #detail-body');
  const text = (await body.innerText()).replace(/\s+/gu, ' ').trim();
  const headings = await body.locator('h1, h2, h3').allTextContents();
  assert.ok(headings.some(heading => heading.trim().length >= 3), 'reader needs a visible headline');
  assert.ok(text.length >= 120, `reader body is too short to be a useful interior (${text.length} characters)`);

  const scroll = await body.evaluate(node => {
    const originalTop = node.scrollTop;
    const pageTop = window.scrollY;
    const max = Math.max(0, node.scrollHeight - node.clientHeight);
    node.scrollTo({ top: Math.round(max / 2), behavior: 'instant' });
    const middle = node.scrollTop;
    node.scrollTo({ top: max, behavior: 'instant' });
    const end = node.scrollTop;
    return {
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
      max,
      middle,
      end,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      originalTop,
      pageTop,
      pageTopAfter: window.scrollY,
    };
  });
  if (scroll.max > 1) {
    assert.ok(scroll.middle > 0 && scroll.end >= scroll.max - 1, 'reader must reach middle and end inside its own scroller');
  } else {
    assert.ok(scroll.scrollHeight <= scroll.clientHeight + 1, 'short reader must fit all of its content');
    assert.equal(scroll.pageTopAfter, scroll.pageTop, 'short reader must not move the hub document when checked');
  }
  assert.ok(scroll.scrollWidth <= scroll.clientWidth + 1, `reader horizontal overflow: ${scroll.scrollWidth - scroll.clientWidth}px`);

  const documentOverflow = await page.evaluate(() => Math.max(
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
    document.body.scrollWidth - document.documentElement.clientWidth,
  ));
  assert.ok(documentOverflow <= 1, `page horizontal overflow: ${documentOverflow}px`);

  const images = body.locator('img');
  const imageResults = [];
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    if (!await image.isVisible()) {
      imageResults.push({ skipped: 'not visible' });
      continue;
    }
    const rendered = await image.evaluate(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    });
    if (!rendered) {
      imageResults.push({ skipped: 'not rendered' });
      continue;
    }
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async node => { await node.decode?.().catch(() => {}); });
    const result = await image.evaluate(node => ({
      src: node.currentSrc || node.getAttribute('src') || '',
      alt: node.getAttribute('alt') || '',
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight,
      hidden: node.getAttribute('aria-hidden') === 'true',
    }));
    if (result.src) {
      assert.equal(sameOrigin(new URL(result.src, base).href), true, `reader image ${index + 1} must remain local`);
      assert.ok(result.complete && result.naturalWidth > 0 && result.naturalHeight > 0, `reader image ${index + 1} failed to load`);
    }
    imageResults.push(result);
  }
  const visualSupport = await body.evaluate(node => ({
    svg: node.querySelectorAll('svg').length,
    icons: node.querySelectorAll('.mineral-icon, [data-icon]').length,
  }));
  const loadedVisibleImages = imageResults.filter(image => image.src && image.complete && image.naturalWidth > 0).length;
  assert.ok(loadedVisibleImages + visualSupport.svg + visualSupport.icons > 0, 'reader needs visual support, not a copy wall');
  return {
    headline: headings.find(heading => heading.trim().length >= 3)?.replace(/\s+/gu, ' ').trim() || '',
    textLength: text.length,
    scroll,
    documentOverflow,
    images: {
      total: imageResults.filter(image => !image.skipped).length,
      skipped: imageResults.filter(image => image.skipped).length,
      loaded: imageResults.filter(image => image.src && image.complete && image.naturalWidth > 0).length,
      meaningful: imageResults.filter(image => image.src && image.alt.trim() && !image.hidden).length,
      sources: imageResults.filter(image => image.src).map(image => image.src),
    },
    visualSupport,
  };
}

async function capturePositions(page, target, viewport, positions) {
  const body = page.locator('#detail[open] #detail-body');
  for (const [name, top] of positions) {
    await body.evaluate((node, targetTop) => node.scrollTo({ top: targetTop, behavior: 'instant' }), top);
    await page.waitForTimeout(40);
    await page.screenshot({ path: path.join(screenshots, `${slug(target.family)}-${slug(target.href)}-${viewport.width}-${name}.png`) });
  }
}

async function inspectTarget(page, target, viewport, capture) {
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  const opener = page.locator(selectorForHref(target.href)).first();
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await waitForReader(page, target.href);
  const controls = await assertControls(page, viewport);
  const interior = await inspectReader(page);
  if (capture) {
    await capturePositions(page, target, viewport, [
      ['top', 0],
      ['middle', Math.round(interior.scroll.max / 2)],
      ['end', interior.scroll.max],
    ]);
  }
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
  assert.equal(new URL(page.url()).pathname, '/', 'Escape must return to the hub');
  assert.equal(await opener.evaluate(node => document.activeElement === node), true, 'Escape must restore focus to the opening tile');
  return { controls, interior };
}

async function discoverTargets(browser) {
  const { context, page } = await makePage(browser, { width: 1440, height: 940 });
  try {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    const tiles = await page.locator('a.tile[href]').evaluateAll(nodes => nodes.map(node => ({
      href: node.getAttribute('href') || '',
      answer: node.dataset.answer || '',
      kind: node.dataset.kind || '',
      family: node.dataset.family || '',
      topic: node.dataset.topic || '',
      label: node.getAttribute('data-cell-title') || node.getAttribute('aria-label') || node.textContent?.replace(/\s+/gu, ' ').trim() || '',
    })));
    return classifyTiles(tiles);
  } finally {
    await context.close();
  }
}

async function run() {
  let discoveryBrowser;
  try {
    discoveryBrowser = await chromium.launch({ channel: 'chrome', headless: true });
    const targets = await discoverTargets(discoveryBrowser);
    await discoveryBrowser.close();
    discoveryBrowser = null;
    assert.ok(targets.length > 0, 'homepage has no ordinary internal tile readers');
    report.targets = targets;
    const captures = screenshotTargets(targets);

    for (const viewport of viewports) {
      for (let start = 0; start < targets.length; start += TARGETS_PER_BROWSER) {
        const browser = await chromium.launch({ channel: 'chrome', headless: true });
        const { context, page } = await makePage(browser, viewport);
        try {
          for (const target of targets.slice(start, start + TARGETS_PER_BROWSER)) {
            const entry = { href: target.href, family: target.family, kind: target.kind, label: target.label, viewport: viewport.name, width: viewport.width, passed: false };
            try {
              Object.assign(entry, await inspectTarget(page, target, viewport, captures.get(target.family) === target.href));
              entry.passed = true;
            } catch (error) {
              entry.error = error.stack || String(error);
            }
            report.readers.push(entry);
          }
        } finally {
          await context.close();
          await browser.close();
        }
      }
    }

    const failed = report.readers.filter(reader => !reader.passed);
    assert.equal(failed.length, 0, `${failed.length} reader interior(s) failed:\n${failed.map(reader => `${reader.viewport} ${reader.href}: ${reader.error}`).join('\n')}`);
    assert.deepEqual(report.blockedMutations, [], `Unexpected mutation attempt(s): ${JSON.stringify(report.blockedMutations)}`);
    assert.deepEqual(report.pageErrors, [], `Browser error(s): ${report.pageErrors.join(' | ')}`);
    assert.deepEqual(report.resourceFailures, [], `Local resource failure(s): ${JSON.stringify(report.resourceFailures)}`);
    report.passed = true;
  } catch (error) {
    report.passed = false;
    report.error = error.stack || String(error);
    process.exitCode = 1;
  } finally {
    await discoveryBrowser?.close();
    report.completedAt = new Date().toISOString();
    fs.writeFileSync(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({
      passed: report.passed,
      targets: report.targets.length,
      skipped: report.skipped.length,
      readers: report.readers.length,
      failed: report.readers.filter(reader => !reader.passed).length,
      evidence: path.join(evidence, 'report.json'),
    }, null, 2));
    // Playwright/Chrome can retain macOS helper handles after every context is
    // closed. The synchronous report is already durable; terminate the local
    // verifier so a quality gate receives its result instead of hanging.
    process.exit(report.passed ? 0 : 1);
  }
}

run();
