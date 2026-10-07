/*
 * Browser contract for working applications inside Little Fight reader cards.
 *
 * This never submits a form or follows an external source. It proves that the
 * every catalog Lab and VERA remain functional, same-origin reader experiences rather
 * than hard navigations away from the mosaic.
 *
 * CARD_APP_URL=http://127.0.0.1:4396 node scripts/verify-card-app.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const app = path.resolve(__dirname, '..');
const base = (process.env.CARD_APP_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4396').replace(/\/$/, '');
const labs = JSON.parse(fs.readFileSync(path.join(app, 'preview-content', 'labs.json'), 'utf8'));
const evidence = path.resolve(app, '..', '.lifi', 'evidence', 'card-app');
const report = {
  kind: 'card-app-browser-verification', base, startedAt: new Date().toISOString(),
  browser: 'Google Chrome via Playwright channel chrome', assertions: [], labs: [], mobileLabs: [], vera: [],
  pageErrors: [], resourceFailures: [], blockedMutations: [],
};

function pass(name, detail = '') { report.assertions.push({ name, passed: true, detail }); }
async function check(name, task) {
  try { pass(name, (await task()) || ''); }
  catch (error) { report.assertions.push({ name, passed: false, detail: error.stack || String(error) }); throw error; }
}

async function makePage(browser, viewport) {
  const phone = viewport.width <= 600 || viewport.height <= 500;
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone });
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
    if (new URL(request.url()).origin !== new URL(base).origin) return;
    const failure = request.failure()?.errorText || 'request failed';
    if (failure !== 'net::ERR_ABORTED') report.resourceFailures.push({ status: failure, url: request.url() });
  });
  return { context, page };
}

async function frameFor(page, demo) {
  await page.waitForFunction(expected => {
    const frame = document.querySelector('#detail[open] iframe.reader-demo-frame');
    return frame?.closest('[data-demo]')?.dataset.demo === expected && Boolean(frame.getAttribute('src'));
  }, demo, { timeout: 20_000 });
  const matching = page.locator(`#detail[open] [data-demo="${demo}"] iframe.reader-demo-frame`);
  await matching.waitFor({ state: 'attached', timeout: 20_000 });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const handle = await matching.elementHandle();
    const frame = await handle?.contentFrame();
    if (frame) {
      // A remote iframe briefly has a ready about:blank document before its
      // real navigation starts. Await the requested URL, not that empty page.
      const source = new URL(await matching.getAttribute('src'), base);
      await frame.waitForURL(url => url.pathname === source.pathname, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForFunction(expected => document.querySelector(`#detail [data-demo="${expected}"]`)?.dataset.demoState === 'ready', demo);
      return { frame, frameElement: matching };
    }
    await page.waitForTimeout(50);
  }
  throw new Error(`${demo}: iframe never received a browsing context`);
}

async function openCard(page, route, demo) {
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 45_000 });
  await page.evaluate(() => { window.__cardAppParentMarker = `reader-${Date.now()}`; });
  const tile = page.locator(`a.tile[href="${route}"]`).first();
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  await page.locator('#detail[open]').waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, route);
  assert.equal(new URL(page.url()).pathname, route, `${demo}: reader updates history without leaving the parent document`);
  const pair = await frameFor(page, demo);
  const child = await pair.frame.evaluate(() => ({
    href: location.href, embedded: self !== top, title: document.title, body: Boolean(document.body),
  }));
  assert.equal(child.embedded, true, `${demo}: working app must run inside the card iframe`);
  assert.ok(child.body && child.title, `${demo}: iframe needs a real document`);
  assert.equal(await page.evaluate(() => Boolean(window.__cardAppParentMarker)), true, `${demo}: iframe load must not replace parent document`);
  // Move the outer reader to its working surface before operating fixed
  // controls inside the iframe. Child scrolling cannot reveal its parent.
  await pair.frameElement.evaluate(node => node.scrollIntoView({ block:'end', behavior:'instant' }));
  return pair;
}

async function closeCard(page) {
  const close = page.locator('#detail[open] #close-detail');
  await close.waitFor({ state: 'visible' });
  await close.click();
  await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
  await page.waitForFunction(() => !document.querySelector('#detail-body iframe.reader-demo-frame'), null, { timeout: 8_000 });
  assert.equal(new URL(page.url()).pathname, '/', 'reader X returns to the homepage hub');
}

async function assertCloseTarget(page, viewport) {
  const box = await page.locator('#detail[open] #close-detail').boundingBox();
  assert.ok(box, `${viewport.width}px: reader close must have a layout box`);
  assert.ok(box.width >= 44 && box.height >= 44, `${viewport.width}px: reader close target must be at least 44px`);
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height,
    `${viewport.width}px: reader close must remain visible in the viewport`);
  return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
}

async function assertReaderNavigation(page, route) {
  for (const id of ['reader-previous', 'reader-hub', 'reader-next']) {
    const button = page.locator(`#detail[open] #${id}`);
    await button.waitFor({ state: 'visible' });
    const box = await button.boundingBox();
    assert.ok(box && box.height >= 44, `${id}: visible 44px navigation target`);
  }
  const before = route;
  await page.locator('#detail[open] #reader-next').click();
  await page.waitForFunction(previous => document.querySelector('#detail-body')?.dataset.readerPath !== previous, before);
  const next = await page.locator('#detail-body').getAttribute('data-reader-path');
  assert.ok(next && next !== before, 'Next must open a different card without leaving the reader');
  await page.locator('#detail[open] #reader-back').click();
  await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, before);
  await page.locator('#detail[open] #reader-hub').click();
  await page.waitForFunction(() => !document.querySelector('#detail')?.open);
  assert.equal(new URL(page.url()).pathname, '/', 'All tiles returns to the mosaic hub');
  return { before, next };
}

async function runRepresentativeInteraction(frame, slug) {
  if (slug === 'aha-laser') {
    await frame.waitForFunction(() => window.__laser && !window.__laser.info().drawing, null, { timeout:20_000 });
    const chain = frame.locator('[data-chain]');
    const box = await chain.boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44, 'AHA pull-chain keeps a usable touch target');
    await chain.click();
    await frame.waitForFunction(() => document.querySelector('[data-chain]').getAttribute('aria-pressed') === 'false');
    await frame.waitForTimeout(550); // The authored switch has a 500ms settling interval.
    await chain.press('Enter');
    await frame.waitForFunction(() => document.querySelector('[data-chain]').getAttribute('aria-pressed') === 'true' && document.querySelectorAll('.tube.is-lit').length === 6);
    return 'pull-chain switches off by touch and back on by keyboard';
  }
  if (slug === 'pill-scroll' || slug === 'goliath') {
    const counter = slug === 'pill-scroll' ? '[data-count]' : '[data-counter]';
    await frame.evaluate(() => {
      const pin = document.querySelector('[data-pin]');
      scrollTo({ top:pin.offsetTop + (pin.offsetHeight - innerHeight) * .66, behavior:'instant' });
    });
    await frame.waitForFunction(selector => {
      const text = document.querySelector(selector)?.textContent.trim();
      return text && !/^0?1\s*\//.test(text) && text.includes('/');
    }, counter);
    return `native scroll advances film to ${(await frame.locator(counter).textContent()).trim()}`;
  }
  if (slug === 'growth-street') {
    await frame.locator('[data-ch="3"]').evaluate(node => window.scrollTo({ top:node.offsetTop, behavior:'instant' }));
    const chapter = await frame.locator('[data-ch="3"]').evaluate(node => ({ top:node.getBoundingClientRect().top, width:node.getBoundingClientRect().width }));
    assert.ok(Math.abs(chapter.top) <= 2 && chapter.width > 0, 'Growth Street can move through chapters inside the card');
    return 'third chapter reached through native scrolling';
  }
  if (slug === 'micro-animations' || slug === 'studio-engine') {
    const button = frame.locator(slug === 'micro-animations' ? 'button[data-theme-btn]' : 'button[data-pick="wine"]');
    await button.waitFor({ state: 'visible', timeout: 15_000 });
    await button.click();
    if (slug === 'studio-engine') await frame.locator('[data-site].m-done').waitFor({ state:'visible' });
    if (slug === 'micro-animations') {
      const clipped = await frame.locator('.row').evaluateAll(rows => rows.filter(row => {
        const box = row.getBoundingClientRect();
        if (!box.width || !box.height) return false;
        return [...row.querySelectorAll('.row__name,.row__price')].some(text => {
          const b = text.getBoundingClientRect();
          return b.top < box.top - 1 || b.bottom > box.bottom + 1;
        });
      }).map(row => row.textContent.trim()));
      assert.deepEqual(clipped, [], 'product names and prices must fit their scrollable rows');
    }
    return `${slug === 'micro-animations' ? 'theme toggle' : 'sample business choice'} clicked`;
  }
  if (slug === 'pool-room') {
    const video = frame.locator('video[data-pool-room-film]');
    await video.waitFor({ state: 'visible', timeout: 15_000 });
    const state = await video.evaluate(node => ({ controls: node.controls, playsInline: node.playsInline, readyState: node.readyState }));
    assert.equal(state.controls, true, 'Pool Room keeps native playback controls');
    assert.equal(state.playsInline, true, 'Pool Room keeps inline mobile playback');
    await video.click({ position: { x: 12, y: 12 } });
    return `video controls; readyState ${state.readyState}`;
  }
  if (slug === 'walkup-3d' || slug === 'terminal-3d') {
    const canvas = frame.locator('canvas[data-scene]');
    await canvas.waitFor({ state: 'visible', timeout: 20_000 });
    const state = await canvas.evaluate(node => ({ width: node.width, height: node.height, webgl: Boolean(node.getContext('webgl2') || node.getContext('webgl')) }));
    assert.ok(state.width > 0 && state.height > 0, `${slug}: WebGL canvas has render dimensions`);
    assert.equal(state.webgl, true, `${slug}: Chrome must provide a WebGL context`);
    if (slug === 'walkup-3d') {
      await frame.waitForFunction(() => Number(getComputedStyle(document.querySelector('[data-veil]')).opacity) < .01);
      for (const view of ['front', 'stairs', 'block']) {
        const button = frame.locator(`[data-walkup-view="${view}"]`);
        const box = await button.boundingBox();
        assert.ok(box?.height >= 44 && box.width >= 44, `${view}: touch-friendly camera preset`);
        await button.click();
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
      }
    } else {
      const menu = frame.locator('[data-rail-menu]');
      const compact = await menu.isVisible();
      if (compact) await menu.click();
      await frame.locator('[data-rail-speed]').click();
      assert.equal(await frame.locator('[data-rail-speed]').textContent(), '3×', 'Neon time control changes the simulation');
      if (compact) {
        assert.equal(await menu.getAttribute('aria-expanded'), 'false', 'choosing a control restores scene space');
        await menu.click();
      }
      await frame.locator('[data-rail-tour]').click();
      await frame.locator('[data-tour]:not([hidden])').waitFor({ state:'visible' });
      await frame.locator('[data-tour-next]').click();
      assert.equal(await frame.locator('[data-tour-step]').textContent(), '2 / 6', 'tour navigation advances');
      await frame.locator('[data-tour-end]').click();
      assert.equal(await frame.locator('[data-tour]').isVisible(), false);
    }
    return `WebGL ${state.width}×${state.height}; ${slug === 'walkup-3d' ? 'three camera presets' : 'time controls and guided tour'} exercised`;
  }
  return 'document loaded';
}

async function run() {
  fs.mkdirSync(evidence, { recursive: true });
  assert.ok(labs.length >= 9, 'Expected the original nine Labs plus any approved additions.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const desktop = { width: 1440, height: 940 };
    const { context, page } = await makePage(browser, desktop);
    try {
      await check('all Labs open inside reader cards and keep the parent document alive', async () => {
        for (const lab of labs) {
          const route = lab.sharePath || `/labs/${lab.slug}/`;
          const { frame, frameElement } = await openCard(page, route, lab.slug);
          const src = await frameElement.getAttribute('src');
          assert.equal(new URL(src || '', base).pathname, lab.embedPath || `/examples/lab/concepts/${lab.slug}/`, `${lab.slug}: iframe uses its canonical same-origin embed route`);
          const share = page.locator('#detail[open] .lab-share').last();
          assert.equal(await share.locator('button[data-copy-lab-link]').getAttribute('data-copy-lab-link'), route,
            `${lab.slug}: reader offers the canonical copyable Lab link`);
          assert.equal(await share.locator('a').getAttribute('href'), route, `${lab.slug}: reader keeps a normal share link`);
          const interaction = await runRepresentativeInteraction(frame, lab.slug);
          report.labs.push({ slug: lab.slug, route, src, interaction });
          await closeCard(page);
        }
        return `${labs.length} same-origin Lab iframes loaded, with video, interaction, and WebGL coverage`;
      });

      await check('reader navigation persists and returns Previous, All tiles, and Next behavior', async () => {
        const route = '/labs/micro-animations/';
        await openCard(page, route, 'micro-animations');
        const navigation = await assertReaderNavigation(page, route);
        return JSON.stringify(navigation);
      });

      await check('Escape from a focused Lab iframe closes the reader and unmounts its frame', async () => {
        const route = '/labs/micro-animations/';
        const { frame } = await openCard(page, route, 'micro-animations');
        await frame.locator('body').click({ position: { x: 8, y: 8 } });
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
        await page.waitForFunction(() => !document.querySelector('#detail-body iframe.reader-demo-frame'), null, { timeout: 8_000 });
        assert.equal(new URL(page.url()).pathname, '/', 'iframe Escape returns to the hub');
        return 'child-frame Escape closes outer reader and cleans up iframe';
      });

      await check('Lab exit messages require the active frame and the same origin', async () => {
        await openCard(page, '/labs/micro-animations/', 'micro-animations');
        await page.evaluate(() => {
          const source = document.querySelector('#detail iframe').contentWindow;
          const data = { type: 'lf:lab-exit', version: 1 };
          window.dispatchEvent(new MessageEvent('message', { data, origin: 'https://example.invalid', source }));
          window.dispatchEvent(new MessageEvent('message', { data, origin: location.origin, source: window }));
        });
        assert.equal(await page.locator('#detail').evaluate(node => node.open), true, 'unrelated messages must not dismiss a working card');
        await closeCard(page);
        return 'wrong origin and wrong sender both ignored';
      });

      await check('iframe Escape works while a nonessential asset is still downloading', async () => {
        let releaseAsset;
        const pendingAsset = new Promise(resolve => { releaseAsset = resolve; });
        const assetMatch = '**/__card_app_slow_asset.svg';
        const documentMatch = url => url.pathname === '/examples/lab/concepts/micro-animations/' && url.searchParams.get('embed') === '1';
        await page.route(assetMatch, async route => {
          await pendingAsset;
          await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' }).catch(() => {});
        });
        await page.route(documentMatch, async route => {
          const response = await route.fetch();
          const body = (await response.text()).replace('</body>', '<img src="/__card_app_slow_asset.svg" width="1" height="1" alt=""></body>');
          await route.fulfill({ response, body });
        });
        try {
          const { frame } = await openCard(page, '/labs/micro-animations/', 'micro-animations');
          assert.equal(await frame.evaluate(() => document.readyState), 'interactive', 'fixture must keep window.load pending');
          await frame.locator('button[data-theme-btn]').click();
          await page.keyboard.press('Escape');
          await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
          assert.equal(new URL(page.url()).pathname, '/', 'Escape returns home before the delayed asset completes');
        } finally {
          releaseAsset();
          await page.unroute(documentMatch);
          await page.unroute(assetMatch);
        }
        return 'a deliberately delayed asset cannot block iframe Escape or return to the hub';
      });

      await check('retained Lab agency links route through the top-level reader and preserve its Back trail', async () => {
        const labRoute = '/labs/micro-animations/';
        const { frame } = await openCard(page, labRoute, 'micro-animations');
        const marker = `micro-cta-${Date.now()}`;
        await page.evaluate(value => { window.__cardAppCtaMarker = value; }, marker);
        const cta = frame.locator('.outro__cta[href^="/tech-audit/"]');
        const ctaPath = await cta.getAttribute('href');
        assert.equal(ctaPath, '/tech-audit/?intent=website&source=lab', 'Micro CTA retains its declared inquiry route');
        // Compact embeds omit the standalone outro. Activate its retained
        // authored link to exercise routing independently of that presentation.
        await cta.evaluate(node => node.click());
        await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, ctaPath, { timeout: 12_000 });
        assert.equal(new URL(page.url()).pathname, '/tech-audit/', 'Lab CTA changes the outer reader route');
        assert.equal(await page.evaluate(expected => window.__cardAppCtaMarker === expected, marker), true, 'Lab CTA must not replace the parent document');
        assert.equal(await page.locator('#detail-body iframe.reader-demo-frame').count(), 0, 'Lab iframe is released before the inquiry reader opens');
        await page.locator('#detail[open] #reader-back').click();
        await page.waitForFunction(expected => document.querySelector('#detail-body')?.dataset.readerPath === expected, labRoute, { timeout: 12_000 });
        const restored = await frameFor(page, 'micro-animations');
        await restored.frame.locator('button[data-theme-btn]').waitFor({ state: 'visible', timeout: 15_000 });
        await page.locator('#detail[open] #reader-hub').click();
        await page.waitForFunction(() => !document.querySelector('#detail')?.open, null, { timeout: 8_000 });
        assert.equal(new URL(page.url()).pathname, '/', 'All tiles returns to the hub after a Lab CTA reader trail');
        return 'Micro CTA → top-level inquiry reader → Back to working Lab → All tiles hub';
      });

      await check('a directly opened Lab reader returns home through its in-app exit', async () => {
        const routes = await (await page.request.get(`${base}/reader-routes.json`)).json();
        const readerRoute = routes['/examples/lab/concepts/micro-animations/'];
        assert.ok(readerRoute?.startsWith('/_readers/'), 'Lab retains its direct companion reader');
        await page.goto(base + readerRoute, { waitUntil:'domcontentloaded' });
        const holder = page.locator('main[data-page-content] [data-demo="micro-animations"][data-demo-state="ready"] iframe');
        await holder.waitFor({ state:'visible' });
        await holder.evaluate(node => node.scrollIntoView({ block:'start', behavior:'instant' }));
        const frame = await (await holder.elementHandle()).contentFrame();
        await frame.locator('.lab-embed-exit').click();
        await page.waitForURL(base + '/');
        assert.equal(await page.locator('iframe.reader-demo-frame').count(), 0, 'direct reader exit leaves no working demo mounted');
        assert.ok(await page.locator('a.tile').count() > 0, 'the full hub is restored');
        return 'direct reader → embedded exit → homepage';
      });

      await check('VERA opens as an immersive, same-origin full-card working app', async () => {
        const { frame, frameElement } = await openCard(page, '/vera/', 'vera');
        assert.equal(await page.locator('#detail').getAttribute('data-reader-layout'), 'immersive');
        assert.match(await frameElement.getAttribute('src') || '', /\/vera\/\?embed=1$/, 'VERA iframe source');
        await frame.locator('[data-shell]').waitFor({ state: 'visible', timeout: 30_000 });
        const nav = frame.locator('a[data-nav="atlas"]').first();
        await nav.click();
        await frame.waitForFunction(() => location.hash.includes('/atlas'), null, { timeout: 10_000 });
        const closeBox = await assertCloseTarget(page, desktop);
        report.vera.push({ viewport: desktop, closeBox, childUrl: frame.url() });
        await closeCard(page);
        return 'VERA uses the full reader card, handles in-frame navigation, and retains a visible X';
      });
    } finally { await context.close(); }

    for (const viewport of [{ width:320, height:740 }, { width:390, height:844 }, { width:568, height:320 }, { width:844, height:390 }]) {
      await check(`all Labs fit ${viewport.width}×${viewport.height} and exit back to their originating tile`, async () => {
        const { context, page } = await makePage(browser, viewport);
        try {
          for (const lab of labs) {
            const route = lab.sharePath || `/labs/${lab.slug}/`;
            const { frame, frameElement } = await openCard(page, route, lab.slug);
            await frameElement.scrollIntoViewIfNeeded();
            const box = await frameElement.boundingBox();
            assert.ok(box.width <= viewport.width && box.height <= (viewport.height < 500 ? 340 : 440), `${lab.slug}: working surface fits the compact phone card`);
            const layout = await frame.evaluate(() => ({ width:innerWidth, scroll:document.documentElement.scrollWidth }));
            assert.ok(layout.scroll <= layout.width + 1, `${lab.slug}: no sideways page overflow: ${JSON.stringify(layout)}`);
            const interaction = await runRepresentativeInteraction(frame, lab.slug);
            const exit = frame.locator('.lab-embed-exit');
            await exit.waitFor({ state:'visible' });
            const target = await exit.evaluate(node => {
              const b = node.getBoundingClientRect();
              return { width:b.width, height:b.height, x:b.x, y:b.y, right:b.right, bottom:b.bottom,
                viewport:[innerWidth, innerHeight], hit:node.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)) };
            });
            assert.ok(target.width >= 44 && target.height >= 44 && target.x >= 0 && target.y >= 0 && target.right <= target.viewport[0] && target.bottom <= target.viewport[1] && target.hit,
              `${lab.slug}: visible, unobstructed in-app exit: ${JSON.stringify(target)}`);
            await assertCloseTarget(page, viewport);
            if (viewport.width === 390 || ['walkup-3d','terminal-3d'].includes(lab.slug)) {
              await page.screenshot({ path:path.join(evidence, `${lab.slug}-${viewport.width}x${viewport.height}.png`) });
            }
            await exit.tap();
            await page.waitForFunction(() => !document.querySelector('#detail')?.open && !document.querySelector('#detail-body iframe.reader-demo-frame'));
            assert.equal(new URL(page.url()).pathname, '/', `${lab.slug}: in-app exit returns to hub`);
            assert.equal(await page.locator(`a.tile[href="${route}"]`).evaluate(node => node === document.activeElement), true, `${lab.slug}: exit restores tile focus`);
            report.mobileLabs.push({ slug:lab.slug, viewport, box, target, interaction });
          }
        } finally { await context.close(); }
        return `${labs.length} compact working demos; both exits reachable; in-app exit unmounts demo and restores tile focus`;
      });
    }

    await check('VERA full card remains usable on a 390px phone', async () => {
      const mobile = { width: 390, height: 844 };
      const { context, page } = await makePage(browser, mobile);
      try {
        const { frame } = await openCard(page, '/vera/', 'vera');
        await frame.locator('[data-shell]').waitFor({ state: 'visible', timeout: 30_000 });
        const closeBox = await assertCloseTarget(page, mobile);
        report.vera.push({ viewport: mobile, closeBox, childUrl: frame.url() });
        await closeCard(page);
        return '390px VERA frame + persistent 44px close target';
      } finally { await context.close(); }
    });

    assert.deepEqual(report.blockedMutations, [], `Unexpected mutating requests: ${JSON.stringify(report.blockedMutations)}`);
    assert.deepEqual(report.pageErrors, [], `Page errors: ${report.pageErrors.join(' | ')}`);
    assert.deepEqual(report.resourceFailures, [], `Failed local resources: ${JSON.stringify(report.resourceFailures)}`);
    report.passed = true;
  } catch (error) {
    report.passed = false;
    report.failure = error.stack || String(error);
    throw error;
  } finally {
    report.completedAt = new Date().toISOString();
    fs.writeFileSync(path.join(evidence, 'card-app-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
    await browser.close();
  }
}

run().then(() => {
  console.log(`Card-app browser verification passed: ${report.assertions.length} assertions.`);
}).catch(error => {
  console.error(`Card-app browser verification failed: ${error.message}`);
  process.exitCode = 1;
});
