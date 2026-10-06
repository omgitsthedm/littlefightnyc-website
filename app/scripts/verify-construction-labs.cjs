'use strict';

// Prove public share routes, lazy engines and the real in-reader return path.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');
const base = process.env.CONSTRUCTION_URL || process.env.PREVIEW_URL;
assert.ok(base, 'CONSTRUCTION_URL or PREVIEW_URL must identify the local candidate');
assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(base), 'Run only against a local candidate');
const app = path.resolve(__dirname, '..');
const labs = JSON.parse(fs.readFileSync(path.join(app, 'preview-content/labs.json'), 'utf8'));
const output = path.resolve(process.env.CONSTRUCTION_EVIDENCE || '/tmp/lfnyc-construction-labs');
fs.mkdirSync(output, { recursive: true });
const report = { assertions: [], screenshots: [], errors: [] };
const pass = value => report.assertions.push(value);
let browser;

async function overflow(page) {
  const delta = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(delta <= 1, `Horizontal overflow: ${delta}px`);
}

(async () => {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method())) return route.abort();
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + '/construction/', { waitUntil: 'networkidle' });
    await overflow(page);
    assert.equal(await page.locator('h1').textContent(), 'Help them seewhat’s possible.');
    const cards = page.locator('.construction-study');
    assert.ok(await cards.count() >= 5, 'All five construction and spatial studies are discoverable');
    assert.equal(await page.locator('iframe[src]').count(), 0, 'Showcase does not boot 3D engines');
    for (const image of await page.locator('.construction-showcase img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(node => node.decode());
    }
    assert.equal(await page.locator('.construction-showcase img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).length), 0, 'Every showcase image loads');
    const links = await cards.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
    for (const href of links) assert.match(href, /^\/labs\/[a-z0-9-]+\/$/);
    const shot = path.join(output, `construction-${width}.png`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: shot, fullPage: true });
    if (width === 1440) await page.screenshot({ path: path.join(output, 'construction-overview.png'), fullPage: false });
    report.screenshots.push(shot);
    const axe = await new AxeBuilder({ page }).include('.construction-showcase').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.length })), [], `Accessible construction content at ${width}px`);
    pass(`${width}px showcase: images, flow, no overflow, share paths, accessibility`);
  }

  const searchRows = await (await context.request.get(base + '/search-index.json')).json();
  for (const lab of labs) {
    assert.equal(searchRows.filter(row => row.path === lab.sharePath).length, 1, 'Each Lab has one canonical search answer');
    assert.ok(!searchRows.some(row => row.path === lab.embedPath), 'Raw engines do not duplicate their reader in search');
  }

  // The complete explanation is static HTML, even without the 3D runtime.
  for (const lab of labs) {
    const response = await context.request.get(base + lab.sharePath);
    assert.equal(response.status(), 200, lab.sharePath);
    const html = await response.text();
    assert.ok(html.includes(`https://littlefightnyc.com${lab.sharePath}`));
    assert.ok(html.includes('index, follow, max-image-preview:large'));
    assert.ok(html.includes('data-demo-src="' + lab.embedPath + '?embed=1"'));
    assert.ok(html.includes(lab.name));
    assert.ok(html.includes('data-copy-lab-link="' + lab.sharePath + '"'));
  }
  pass(`All ${labs.length} Labs have directly loadable, indexable, static reader pages`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/construction/');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copiedLabLink = value; } } }));
  await page.getByRole('button', { name: 'Copy showcase link' }).click();
  assert.equal(await page.evaluate(() => window.__copiedLabLink), base + '/construction/');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } }));
  await page.getByRole('button', { name: 'Copy showcase link' }).click();
  assert.ok(await page.locator('[data-copy-status]').textContent());
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Link to this showcase');
  pass('Copy link and denied-clipboard fallback both work');

  let sharedStudy;
  let sharedFingerprint;
  for (const slug of ['cabinet-concept', 'house-explorer']) {
    await page.goto(base + '/');
    const tile = page.locator(`a.tile[href="/labs/${slug}/"]`);
    await tile.click();
    const dialog = page.locator('#detail');
    await dialog.waitFor({ state: 'visible' });
    const frameElement = dialog.locator(`iframe[data-demo-src^="/examples/lab/concepts/${slug}/"]`);
    await frameElement.waitFor();
    await frameElement.evaluate(node => node.scrollIntoView({ block: 'end', behavior: 'instant' }));
    const frame = await (await frameElement.elementHandle()).contentFrame();
    if (slug === 'cabinet-concept') {
      await frame.getByRole('button', { name: 'View in 3D' }).click();
    }
    await frame.waitForSelector('canvas', { timeout: 45000 });
    await frame.waitForSelector('.lab-embed-exit', { state: 'visible' });
    await overflow(page);
    const inner = await frame.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(inner <= 1, `${slug}: embedded phone overflow ${inner}px`);
    if (slug === 'cabinet-concept') {
      const originalFingerprint = await frame.getByTestId('cabinet-concept-model').getAttribute('data-fingerprint');
      const heritage = frame.getByRole('button', { name: /^Heritage Black \+ Brass\./ });
      await heritage.click();
      assert.equal(await heritage.getAttribute('aria-pressed'), 'true');
      await frame.waitForFunction(previous => document.querySelector('[data-testid="cabinet-concept-model"]').dataset.fingerprint !== previous, originalFingerprint);
      sharedFingerprint = await frame.getByTestId('cabinet-concept-model').getAttribute('data-fingerprint');
      await frame.getByRole('button', { name: 'Save this kitchen as A', exact: true }).click();
      assert.equal(await frame.getByRole('button', { name: 'Open saved kitchen A', exact: true }).getAttribute('aria-pressed'), 'true');
      const downloadReady = page.waitForEvent('download');
      await frame.getByRole('button', { name: 'Download study sheet', exact: true }).click();
      const download = await downloadReady;
      const pdf = path.join(output, download.suggestedFilename());
      await download.saveAs(pdf);
      assert.equal(fs.readFileSync(pdf).subarray(0, 5).toString(), '%PDF-');
      await frame.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copiedStudy = value; } } }));
      await frame.getByRole('button', { name: 'Copy study link', exact: true }).click();
      sharedStudy = await frame.evaluate(() => window.__copiedStudy);
      assert.equal(new URL(sharedStudy).pathname, '/labs/cabinet-concept/');
      assert.match(new URL(sharedStudy).searchParams.get('study'), /^[zu]\./);
    }
    await frameElement.evaluate(node => node.scrollIntoView({ block: 'end', behavior: 'instant' }));
    await frame.locator('.lab-embed-exit').click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#detail iframe').count(), 0, 'Closing releases the 3D engine');
    assert.equal(await tile.evaluate(node => node === document.activeElement), true, 'Focus returns to the originating tile');
    pass(`${slug}: phone card, working canvas, same-origin close, focus restoration and engine disposal`);
  }
  const freshContext = await browser.newContext({ reducedMotion: 'reduce' });
  const sharedPage = await freshContext.newPage();
  await sharedPage.goto(sharedStudy);
  const sharedFrameElement = sharedPage.locator('main[data-page-content] iframe[data-demo-src]');
  await sharedFrameElement.waitFor();
  const sharedFrame = await (await sharedFrameElement.elementHandle()).contentFrame();
  await sharedFrame.waitForSelector('[data-testid="cabinet-concept-model"]');
  await sharedFrame.waitForFunction(expected => document.querySelector('[data-testid="cabinet-concept-model"]').dataset.fingerprint === expected, sharedFingerprint);
  assert.equal(new URL(await sharedFrameElement.getAttribute('src'), base).searchParams.get('study'), new URL(sharedStudy).searchParams.get('study'), 'Share reader forwards the versioned design payload into the working Lab');
  assert.equal(await sharedFrame.getByTestId('shared-notice').count(), 0, 'A valid study does not show a damaged-link warning');
  await freshContext.close();
  pass('Cabinet choices, comparison slot and PDF work; the design link restores the same study in a fresh browser');
  assert.deepEqual(report.errors, []);
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`Construction Labs passed: ${report.assertions.length} checks; ${output}`);
})().catch(error => {
  report.failure = error.stack;
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
}).finally(async () => { await browser?.close(); });
