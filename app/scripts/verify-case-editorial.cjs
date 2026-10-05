/*
 * Local browser contract for the editorial work index and case-study reader.
 *
 * Run after the tile builder and a static local server are available:
 *   CASE_EDITORIAL_URL=http://127.0.0.1:4396 node scripts/verify-case-editorial.cjs
 *
 * It never follows external work links or submits data. Every non-GET/HEAD
 * request is aborted and the only persistent output is ignored local evidence.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

const app = path.resolve(__dirname, '..');
const base = (process.env.CASE_EDITORIAL_URL || 'http://127.0.0.1:4396').replace(/\/$/, '');
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'case-editorial');
const screenshots = path.join(evidence, 'screenshots');
const cases = JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'cases.json'), 'utf8'));
const labs = JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'labs.json'), 'utf8'));

const report = {
  kind: 'case-editorial-browser-verification',
  base,
  startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome',
  assertions: [],
  viewports: [],
  axe: [],
  imageAudit: [],
  pageErrors: [],
  resourceFailures: [],
  blockedMutations: [],
  labRoutes: [],
  shareCards: [],
};

function pass(name, detail = '') { report.assertions.push({ name, passed: true, detail }); }
async function check(name, task) {
  try { pass(name, (await task()) || ''); }
  catch (error) {
    report.assertions.push({ name, passed: false, detail: error.stack || String(error) });
    throw error;
  }
}

function pathname(value) { return new URL(value, base).pathname; }
function isPublic(caseStudy) {
  return caseStudy.publicType === 'Website design' || caseStudy.publicType === 'Little Fight product';
}

async function makePage(browser, viewport, options = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...options });
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
    if (new URL(response.url()).origin === new URL(base).origin && response.status() >= 400) {
      report.resourceFailures.push({ status: response.status(), url: response.url() });
    }
  });
  page.on('requestfailed', request => {
    if (new URL(request.url()).origin === new URL(base).origin) {
      const error = request.failure()?.errorText || 'request failed';
      if (error !== 'net::ERR_ABORTED') report.resourceFailures.push({ status: error, url: request.url() });
    }
  });
  return { context, page };
}

async function go(page, route) {
  const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45_000 });
  assert.ok(response, `No document response for ${route}`);
  assert.equal(response.status(), 200, `${route} must return 200`);
  return response;
}

async function assertNoOverflow(page, label) {
  const amount = await page.evaluate(() => Math.max(
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
    document.body.scrollWidth - document.documentElement.clientWidth,
    document.querySelector('#detail[open] .detail-window')
      ? document.querySelector('#detail[open] .detail-window').scrollWidth - document.querySelector('#detail[open] .detail-window').clientWidth
      : 0,
  ));
  assert.ok(amount <= 1, `${label}: ${amount}px horizontal overflow`);
  return `${amount}px overflow`;
}

async function auditAxe(page, route) {
  const result = await new AxeBuilder({ page }).analyze();
  const violations = result.violations.map(item => ({
    id: item.id,
    impact: item.impact,
    nodes: item.nodes.length,
    targets: item.nodes.slice(0, 4).map(node => node.target),
  }));
  report.axe.push({ route, violations });
  assert.equal(violations.length, 0, `${route} Axe violations: ${violations.map(item => item.id).join(', ')}`);
  return 'full Axe audit including color contrast';
}

async function assertImagesLoaded(page, selector, label) {
  const images = page.locator(selector);
  const count = await images.count();
  assert.ok(count > 0, `${label}: expected at least one image`);
  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(node => new Promise((resolve, reject) => {
      if (node.complete && node.naturalWidth > 0) return resolve();
      node.addEventListener('load', resolve, { once: true });
      node.addEventListener('error', () => reject(new Error(node.currentSrc || node.src)), { once: true });
    }));
  }
  const observed = await images.evaluateAll(nodes => nodes.map(node => ({
    src: node.currentSrc || node.getAttribute('src'), complete: node.complete, width: node.naturalWidth,
  })));
  assert.ok(observed.every(item => item.complete && item.width > 0), `${label}: unloaded image`);
  report.imageAudit.push({ label, count, images: observed });
  return `${count} images loaded`;
}

async function screenshotEvidence(page, target, label) {
  // Playwright's full-page capture does not itself scroll lazy media into view.
  // Walk only images that participate in this document's layout, so the image
  // evidence is honest without requiring a mobile-hidden companion device shot.
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  const images = page.locator('img[src]');
  const visible = await images.evaluateAll(nodes => nodes.map((node, index) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return { index, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
  }).filter(item => item.visible).map(item => item.index));
  for (const index of visible) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(node => new Promise((resolve, reject) => {
      if (node.complete && node.naturalWidth > 0) return resolve();
      node.addEventListener('load', resolve, { once: true });
      node.addEventListener('error', () => reject(new Error(node.currentSrc || node.src)), { once: true });
    }));
  }
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('#detail-body')?.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: target, fullPage: true });
  report.imageAudit.push({ label, screenshot: path.relative(path.resolve(app, '..'), target), visibleImageCount: visible.length });
}

async function ensureReader(page, route) {
  await page.locator('#detail[open]').waitFor({ state: 'visible' });
  await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, route);
  assert.equal(pathname(page.url()), route, `Reader URL must be ${route}`);
}

async function verifyPublicCaseShareCards(page) {
  const publicClients = cases.filter(caseStudy =>
    caseStudy.type.startsWith('Client work') && caseStudy.type.toLowerCase().includes('public work, live')
  );
  assert.equal(publicClients.length, 9, 'Expected nine public client cases for dedicated share cards');
  for (const caseStudy of publicClients) {
    await go(page, `/case-studies/${caseStudy.slug}/`);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    assert.ok(ogImage, `${caseStudy.slug}: missing og:image`);
    assert.match(ogImage, new RegExp(`case-${caseStudy.slug.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`), `${caseStudy.slug}: og:image must name its case, not the homepage card`);
    const parsed = new URL(ogImage, base);
    const localAsset = new URL(parsed.pathname + parsed.search, base);
    const response = await fetch(localAsset, { headers: { accept: 'image/avif,image/webp,image/*,*/*;q=0.8' } });
    assert.equal(response.status, 200, `${caseStudy.slug}: local share-card asset ${localAsset.pathname}`);
    assert.match(response.headers.get('content-type') || '', /^image\//, `${caseStudy.slug}: share-card content type`);
    report.shareCards.push({ slug: caseStudy.slug, ogImage, localAsset: localAsset.pathname, contentType: response.headers.get('content-type') });
  }
  return '9 public client cases have dedicated, locally resolving og:image cards';
}

async function assertCaseBriefClearsStickyRail(page, viewport) {
  const heading = page.locator('#case-brief h2');
  await heading.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForFunction(() => {
    const target = document.querySelector('#case-brief h2');
    const rail = document.querySelector('.direct-contact-rail');
    if (!target || !rail) return false;
    return target.getBoundingClientRect().top >= rail.getBoundingClientRect().bottom + 8;
  }, null, { timeout: 5_000 });
  const positions = await page.evaluate(() => {
    const target = document.querySelector('#case-brief h2')?.getBoundingClientRect();
    const rail = document.querySelector('.direct-contact-rail')?.getBoundingClientRect();
    return { headingTop: target?.top, railBottom: rail?.bottom };
  });
  assert.ok(positions.headingTop >= positions.railBottom + 8, `${viewport.width}px case story heading (${positions.headingTop}px) is obscured by sticky contact rail (${positions.railBottom}px)`);
  return positions;
}

async function verifyStaticFallback(browser) {
  const { context, page } = await makePage(browser, { width: 390, height: 844 }, { javaScriptEnabled: false });
  try {
    await go(page, '/examples/');
    assert.equal(await page.locator('main[data-page-content]').count(), 1, 'No-JS work index needs static main content');
    assert.match((await page.locator('h1').first().innerText()).trim(), /^Our work\.?$/, 'No-JS work index needs the concise public heading');
    assert.equal(await page.locator('a.work-project[href^="/case-studies/"]').count(), 11, 'No-JS work index needs its 9 public cards plus 2 products');
    assert.equal(await page.locator('a.work-lab[data-reader-link]').count(), labs.length, 'No-JS work index needs all Labs as real links');
    const chromatic = page.locator('a.work-project[href="/case-studies/chromatic-painting-design/"]').first();
    assert.equal(await chromatic.count(), 1, 'No-JS work index must link to Chromatic');
    await go(page, '/case-studies/chromatic-painting-design/');
    assert.equal(await page.locator('main[data-page-content] .case-story').count(), 1, 'No-JS case study needs its complete static story');
    assert.equal(await page.locator('a.case-primary[target="_blank"]').count(), 1, 'No-JS public case retains one clear live website action');
    return 'static work index and Chromatic case usable without JavaScript';
  } finally { await context.close(); }
}

async function run() {
  fs.mkdirSync(screenshots, { recursive: true });
  const probe = await fetch(base + '/examples/');
  assert.equal(probe.status, 200, `Candidate unavailable at ${base}`);
  pass('local editorial candidate is available');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await check('editorial work index and case study retain complete useful no-JavaScript documents', () => verifyStaticFallback(browser));

    const { context, page } = await makePage(browser, { width: 1440, height: 940 });
    try {
      await go(page, '/examples/');
      await check('work index has nine public client cards, two Little Fight products, all fifteen case destinations, and reader-card VERA', async () => {
        assert.match((await page.locator('h1').first().innerText()).trim(), /^Our work\.?$/, 'Work index keeps a concise public heading');
        assert.equal(await page.locator('#client-work a.work-project').count(), 9, 'Public client card count');
        assert.equal(await page.locator('#our-products a.work-project').count(), 2, 'Little Fight product card count');
        assert.equal(await page.locator('.work-project--featured').count(), 0, 'Client work cards use one equal treatment');
        const destinations = new Set(await page.locator('a[href^="/case-studies/"]').evaluateAll(links => links.map(link => new URL(link.href).pathname)));
        const expected = new Set(cases.map(caseStudy => `/case-studies/${caseStudy.slug}/`));
        assert.deepEqual([...destinations].sort(), [...expected].sort(), 'Work index must represent every catalog case destination');
        const vera = page.locator('a.work-vera[href="/vera/"][data-reader-link]');
        assert.equal(await vera.count(), 1, 'VERA needs one reader-card route');
        assert.equal(await vera.getAttribute('data-document-link'), null, 'VERA must not hard-navigate away from the reader');
        return '9 public cards; 2 products; 15 case routes; VERA reader card';
      });
      await check('work index loads each project image and all nine Lab thumbnails', async () => {
        await assertImagesLoaded(page, '.work-project-image img', 'work index project imagery');
        await assertImagesLoaded(page, '.work-lab > img', 'work index Lab imagery');
      });
      await check('work index offers nine real Lab routes that open their working cards', async () => {
        const hrefs = await page.locator('a.work-lab[data-reader-link]').evaluateAll(links => links.map(link => link.getAttribute('href')));
        assert.equal(hrefs.length, labs.length, 'Lab link count');
        assert.deepEqual(hrefs.sort(), labs.map(lab => `/examples/lab/concepts/${lab.slug}/`).sort(), 'Lab destinations');
        for (const route of hrefs) {
          // Several Labs deliberately keep an animation loop or asset stream
          // alive. A document response plus DOM readiness proves the actual
          // local product route without treating its live interaction loop as
          // a failed page load.
          const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45_000 });
          assert.equal(response?.status(), 200, `Lab route ${route}`);
          assert.match(await page.title(), /Little Fight NYC|Lab/i, `${route}: working document title`);
          report.labRoutes.push({ route, status: response.status(), title: await page.title() });
        }
        await go(page, '/examples/');
        return `${hrefs.length} canonical Lab routes remain directly available; card embedding is verified separately`;
      });
      await check('public case studies expose exactly real new-tab website actions; design concepts do not', async () => {
        for (const caseStudy of cases) {
          await go(page, `/case-studies/${caseStudy.slug}/`);
          const actions = page.locator('a.case-primary');
          const count = await actions.count();
          if (isPublic(caseStudy)) {
            assert.ok(count >= 1, `${caseStudy.slug}: public record needs a live action`);
            for (let index = 0; index < count; index += 1) {
              const action = actions.nth(index);
              const href = await action.getAttribute('href');
              assert.match(href || '', /^https:\/\//, `${caseStudy.slug}: live action must be an external HTTPS URL`);
              assert.equal(await action.getAttribute('target'), '_blank', `${caseStudy.slug}: live action opens a new tab`);
              assert.match(await action.getAttribute('rel') || '', /noopener/, `${caseStudy.slug}: live action isolates opener`);
            }
          } else {
            assert.equal(count, 0, `${caseStudy.slug}: design concept must not claim a live external action`);
          }
        }
        return 'all 15 case routes checked against their public presentation';
      });
      await check('case stories keep public labels and omit private project notes or status history', async () => {
        for (const caseStudy of cases) {
          await go(page, `/case-studies/${caseStudy.slug}/`);
          const story = page.locator('.case-story');
          const openingLabel = story.locator('.case-opening > .case-label');
          assert.equal(await openingLabel.count(), 1, `${caseStudy.slug}: public type stays visible in the case opening`);
          assert.equal((await openingLabel.textContent()).trim(), caseStudy.publicType, `${caseStudy.slug}: public type label`);
          const copy = await story.innerText();
          assert.doesNotMatch(copy, /project notes|project context|behind the scenes|private work|current status|build history|next milestone|last verified/i, `${caseStudy.slug}: internal project tracking leaked into public story`);
          assert.doesNotMatch(copy, /client work\s*—|public work, live/i, `${caseStudy.slug}: internal catalog type leaked into public story`);
        }
        return '15 public stories use curated facts and plain public labels';
      });
      await check('nine public client cases have case-specific social cards that resolve locally', () => verifyPublicCaseShareCards(page));

      await go(page, '/examples/');
      await check('work index passes full Axe including color contrast', () => auditAxe(page, '/examples/'));
      await screenshotEvidence(page, path.join(screenshots, 'work-index-1440.png'), 'work index full-page evidence');

      await go(page, '/case-studies/chromatic-painting-design/');
      await check('Chromatic public case has usable desktop and phone screens plus a real live site action', async () => {
        assert.equal(await page.locator('.case-story[data-case="chromatic-painting-design"]').count(), 1);
        await assertImagesLoaded(page, '.case-stage-desktop img, .case-stage-phone img, .case-mobile-story img', 'Chromatic responsive case imagery');
        const actions = page.locator('a.case-primary[href="https://chromaticaz.com/"]');
        assert.equal(await actions.count(), 1, 'Chromatic should have one clear live action');
      });
      await check('Chromatic public case passes full Axe including color contrast', () => auditAxe(page, '/case-studies/chromatic-painting-design/'));
      await screenshotEvidence(page, path.join(screenshots, 'chromatic-1440.png'), 'Chromatic full-page evidence');

      await check('homepage Website gallery opens a client case in the reader, Back restores the Website story, and X returns to its hub tile', async () => {
        await go(page, '/');
        const tile = page.locator('a.tile[href="/services/custom-local-websites/"]').first();
        await tile.scrollIntoViewIfNeeded();
        await tile.click();
        await ensureReader(page, '/services/custom-local-websites/');
        await page.locator('#detail-body .rw-full-gallery > summary').click();
        const proof = page.locator('#detail-body .rw-client-project--easy-tiger a.rw-client-project-media[href="/case-studies/easy-tiger/"][data-reader-link]');
        await proof.scrollIntoViewIfNeeded();
        await proof.click();
        await ensureReader(page, '/case-studies/easy-tiger/');
        assert.equal(await page.locator('#detail[open] .case-story[data-case="easy-tiger"]').count(), 1, 'Client case must stay in reader dialog');
        const back = page.locator('#reader-back');
        await back.waitFor({ state: 'visible' });
        await back.click();
        await ensureReader(page, '/services/custom-local-websites/');
        assert.equal(await page.locator('#detail-body .rw-client-gallery .rw-client-project[data-rw-item]').count(), 9, 'Back must restore the full Website client gallery');
        assert.equal(await back.isHidden(), true, 'Back is hidden after returning to the opening Website card');
        await page.locator('#close-detail').click();
        await page.waitForFunction(() => !document.querySelector('#detail')?.open);
        await page.waitForURL(base + '/');
        await tile.waitFor({ state: 'visible' });
        assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('a.tile[href="/services/custom-local-websites/"]')), true, 'X returns focus to the opening Website card in the hub');
        return 'tile → Website gallery → client case reader → Back → Website story → X → Website hub tile focus';
      });
    } finally { await context.close(); }

    await check('editorial headings and layouts avoid horizontal overflow from 320 through desktop', async () => {
      for (const viewport of [
        { width: 320, height: 740 }, { width: 390, height: 844 },
        { width: 768, height: 940 }, { width: 1440, height: 940 },
      ]) {
        const { context, page } = await makePage(browser, viewport);
        try {
          await go(page, '/examples/');
          await page.locator('h1').first().waitFor({ state: 'visible' });
          assert.match((await page.locator('h1').first().innerText()).trim(), /^Our work\.?$/, `${viewport.width}px work heading`);
          const workOverflow = await assertNoOverflow(page, `${viewport.width}px work index`);
          await go(page, '/case-studies/chromatic-painting-design/');
          assert.match(await page.locator('h1').first().innerText(), /Chromatic Painting/i, `${viewport.width}px case heading`);
          let caseBrief;
          if (viewport.width <= 390) caseBrief = await assertCaseBriefClearsStickyRail(page, viewport);
          const caseOverflow = await assertNoOverflow(page, `${viewport.width}px Chromatic case`);
          report.viewports.push({ ...viewport, workOverflow, caseOverflow, caseBrief });
        } finally { await context.close(); }
      }
      return '320, 390, 768, and 1440px all have visible headings and no overflow';
    });

    assert.equal(report.pageErrors.length, 0, `Page errors: ${report.pageErrors.join(' | ')}`);
    assert.equal(report.resourceFailures.length, 0, `Local resource failures: ${JSON.stringify(report.resourceFailures)}`);
    report.finishedAt = new Date().toISOString();
    report.passed = true;
  } catch (error) {
    report.finishedAt = new Date().toISOString();
    report.passed = false;
    report.error = error.stack || String(error);
    throw error;
  } finally {
    fs.mkdirSync(evidence, { recursive: true });
    fs.writeFileSync(path.join(evidence, 'browser-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
    await browser.close();
  }
}

run().then(() => {
  console.log(`Case editorial browser verification passed: ${report.assertions.length} assertions.`);
}).catch(error => {
  console.error(`Case editorial browser verification failed: ${error.message}`);
  process.exitCode = 1;
});
