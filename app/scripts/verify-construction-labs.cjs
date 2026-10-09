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

const FARM_VIEWS = ['aerial', 'west', 'east', 'south', 'north', 'plan', 'gates', 'porch', 'paths', 'barnEast'];
const FARM_LIGHTING = ['dawn', 'noon', 'dusk', 'night'];

async function farmState(frame) {
  return frame.evaluate(() => window.farmHouseViewer?.getState?.() || null);
}

async function farmGardenState(frame) {
  return frame.evaluate(() => ({
    garden: window.farmHouseViewer?.getState?.().garden,
    yard: document.body.dataset.yard,
    landscapeVisible: window.farmExterior?.landscape?.visible,
  }));
}

function rectanglesOverlap(first, second) {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

// The share reader reserves horizontal room for its own close affordance. On a
// 320px phone that leaves the Farm House frame narrower than the direct route.
// Keep each real control reachable inside that effective viewport rather than
// proving only that the frame loads.
async function verifyFarmCompactControls(frame, label, { page = null, frameElement = null } = {}) {
  const layout = await frame.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      brand: rect('.brand'),
      christmas: rect('#christmas-toggle'),
      exit: rect('.lab-embed-exit'),
      collections: [...document.querySelectorAll('.collections button')].map((button) => ({
        name: button.textContent.trim(),
        rect: (() => {
          const box = button.getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
        })(),
      })),
    };
  });
  assert.deepEqual(layout.collections.map(({ name }) => name), ['Property', 'Inside', 'Find'], `${label}: compact navigation keeps all three Farm House sections`);
  for (const { name, rect } of layout.collections) {
    assert.ok(rect.width > 0 && rect.height >= 44 && rect.left >= 0 && rect.right <= layout.viewport.width && rect.top >= 0 && rect.bottom <= layout.viewport.height,
      `${label}: ${name} stays fully tappable in the visible Farm House viewport: ${JSON.stringify(rect)}`);
  }
  for (let index = 1; index < layout.collections.length; index += 1) {
    assert.equal(rectanglesOverlap(layout.collections[index - 1].rect, layout.collections[index].rect), false,
      `${label}: compact section controls do not overlap`);
  }
  for (const [name, rect] of Object.entries({ brand: layout.brand, christmas: layout.christmas, exit: layout.exit })) {
    if (!rect) continue;
    assert.ok(rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.right <= layout.viewport.width && rect.top >= 0 && rect.bottom <= layout.viewport.height,
      `${label}: ${name} stays within the visible Farm House viewport: ${JSON.stringify(rect)}`);
  }
  if (layout.brand && layout.christmas) {
    assert.equal(rectanglesOverlap(layout.brand, layout.christmas), false, `${label}: Farm House title and Christmas control do not overlap`);
  }
  if (layout.exit && layout.christmas) {
    assert.equal(rectanglesOverlap(layout.exit, layout.christmas), false, `${label}: Farm House exit and Christmas control do not overlap`);
  }

  if (!page || !frameElement) return;
  const outer = await frameElement.boundingBox();
  assert.ok(outer, `${label}: compact Farm House frame has a rendered outer box`);
  for (const { name, rect } of layout.collections) {
    const target = await page.evaluate(({ x, y }) => {
      const element = document.elementFromPoint(x, y);
      return element?.tagName === 'IFRAME';
    }, { x: outer.x + rect.left + rect.width / 2, y: outer.y + rect.top + rect.height / 2 });
    assert.equal(target, true, `${label}: ${name} receives pointer input through the reader, not an overlaid page section`);
  }
}

async function verifyFarmCollectionSwitches(frame, label) {
  for (const collection of ['inside', 'find']) {
    await frame.locator(`button[data-collection="${collection}"]`).click();
    const panel = frame.locator('#construction-panel iframe');
    await panel.waitFor();
    const nested = await (await panel.elementHandle()).contentFrame();
    await nested.locator('#view canvas').waitFor({ timeout: 45000 });
    if (collection === 'find') await nested.locator('#search').waitFor({ state: 'visible' });
    await nested.locator('#property').click();
    await panel.waitFor({ state: 'detached' });
    assert.equal(await frame.locator('button[data-collection="property"]').getAttribute('aria-pressed'), 'true', `${label}: ${collection} returns to Property cleanly`);
  }
}

async function verifyFarmHouse(frame, label) {
  const load = frame.getByRole('button', { name: 'Load experience', exact: true });
  if (await load.count()) {
    assert.equal(await frame.locator('#scene canvas').count(), 0, `${label}: keeps the optional 3D renderer cold behind the exterior poster`);
    await load.click();
  }
  await frame.locator('#scene canvas').waitFor({ timeout: 45000 });
  await frame.locator('body[data-model-ready="true"]').waitFor({ timeout: 45000 });
  assert.equal(await frame.locator('#scene canvas').count(), 1, `${label}: one interactive Farm House canvas`);

  const viewSelect = frame.locator('select#view-select');
  await viewSelect.waitFor({ state: 'visible' });
  assert.deepEqual(
    await viewSelect.locator('option').evaluateAll(options => options.map(option => option.value)),
    FARM_VIEWS,
    `${label}: exposes the complete ten-view Farm House camera set`,
  );

  const lightButtons = frame.locator('button[data-lighting]');
  assert.deepEqual(
    await lightButtons.evaluateAll(buttons => buttons.map(button => button.dataset.lighting)),
    FARM_LIGHTING,
    `${label}: exposes dawn, day, dusk, and night`,
  );

  await viewSelect.selectOption('barnEast');
  await frame.waitForFunction(() => document.querySelector('#view-select')?.value === 'barnEast');
  const night = frame.locator('button[data-lighting="night"]');
  await night.click();
  await frame.waitForFunction(() => document.querySelector('button[data-lighting="night"]')?.getAttribute('aria-pressed') === 'true');
  assert.equal(await night.getAttribute('aria-pressed'), 'true', `${label}: active lighting reports its state`);

  for (const selector of ['#gate-toggle', '#christmas-toggle']) {
    const control = frame.locator(selector);
    await control.waitFor({ state: 'visible' });
    const before = await control.getAttribute('aria-pressed');
    await control.click();
    await frame.waitForFunction(({ selector, before }) => document.querySelector(selector)?.getAttribute('aria-pressed') !== before, { selector, before });
    assert.equal(await control.getAttribute('aria-pressed'), before === 'true' ? 'false' : 'true', `${label}: ${selector} updates its accessible state`);
  }

  // Garden is a real scene mode, not a label that only toggles in the dock.
  const yard = frame.locator('#yard-toggle');
  await yard.click();
  await frame.waitForFunction(() => document.body.dataset.yard === 'existing');
  assert.deepEqual(await farmGardenState(frame), {
    garden: false,
    yard: 'existing',
    landscapeVisible: false,
  }, `${label}: Existing mode updates the rendered property scene`);
  await yard.click();
  await frame.waitForFunction(() => document.body.dataset.yard === 'proposed');
  assert.deepEqual(await farmGardenState(frame), {
    garden: true,
    yard: 'proposed',
    landscapeVisible: true,
  }, `${label}: Garden mode restores the rendered property scene`);

  const afterInteraction = await farmState(frame);
  if (afterInteraction) {
    assert.equal(afterInteraction.ready, true, `${label}: public viewer reports readiness`);
    assert.equal(afterInteraction.view, 'barnEast', `${label}: state follows the selected camera`);
    assert.equal(afterInteraction.lighting, 'night', `${label}: state follows lighting choice`);
  }

  await frame.locator('#reset').click();
  await frame.waitForFunction(() => document.querySelector('#view-select')?.value === 'aerial');
  const reset = await farmState(frame);
  if (reset) assert.equal(reset.view, 'aerial', `${label}: reset restores the whole-property view`);
  await frame.locator('button[data-lighting="noon"]').click();
  await frame.waitForFunction(() => document.querySelector('button[data-lighting="noon"]')?.getAttribute('aria-pressed') === 'true');
  assert.equal((await farmState(frame))?.lighting, 'noon', `${label}: whole-property reset evidence returns to daytime`);
}

async function verifyFarmInside(frame, label, { exitToHub = false } = {}) {
  const inside = frame.locator('button[data-collection="inside"]');
  await inside.click();
  const panel = frame.locator('#construction-panel iframe');
  await panel.waitFor();
  const insideFrame = await (await panel.elementHandle()).contentFrame();
  await insideFrame.locator('#view canvas').waitFor({ timeout: 45000 });
  await insideFrame.waitForFunction(() => Boolean(window.farmHouseInside?.getState?.().safeData));
  const modelStats = await insideFrame.evaluate(() => ({
    layers: Object.keys(window.farmHouseInside.model.layers).length,
    objects: window.farmHouseInside.model.objects.length,
    entries: window.farmHouseInside.getState().entries,
    barnMembers: window.farmHouseInside.model.objects.filter((object) => object.userData.layer === 'barn' && /column|rafter|purlin|girt/i.test(object.name)).length,
    roofVisible: window.farmHouseInside.model.layers.roof.visible,
    framingVisible: window.farmHouseInside.model.layers.walls.visible || window.farmHouseInside.model.layers.trusses.visible,
    emptyControlNames: [...document.querySelectorAll('#layers .layer')].map((label) => label.textContent.trim()).filter((name) => {
      const layer = Object.values(window.farmHouseInside.model.layers).find((group) => group.name === name);
      return layer && layer.children.length === 0;
    }),
  }));
  assert.equal(modelStats.layers, 25, `${label}: safe Inside model preserves its layer system`);
  assert.ok(modelStats.objects > 4800 && modelStats.entries >= 400 && modelStats.barnMembers > 0,
    `${label}: safe Inside model retains substantial searchable house and barn geometry`);
  assert.equal(modelStats.roofVisible, false, `${label}: default Inside view keeps the roof out of the framing study`);
  assert.equal(modelStats.framingVisible, true, `${label}: default Inside view exposes real framing`);
  assert.deepEqual(modelStats.emptyControlNames, [], `${label}: default Inside controls omit empty model layers`);
  const defaultShot = path.join(output, 'house-inside-default-393.png');
  await panel.screenshot({ path: defaultShot });
  report.screenshots.push(defaultShot);

  const phoneBounds = await insideFrame.evaluate(() => {
    const view = document.querySelector('#view').getBoundingClientRect();
    const canvas = document.querySelector('#view canvas').getBoundingClientRect();
    return { canvasWidth: canvas.width, canvasHeight: canvas.height, viewWidth: view.width, viewHeight: view.height, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  assert.ok(phoneBounds.canvasWidth > 0 && phoneBounds.canvasHeight > 0 && phoneBounds.canvasWidth <= phoneBounds.viewWidth + 1 && phoneBounds.canvasHeight <= phoneBounds.viewHeight + 1 && phoneBounds.overflow <= 1,
    `${label}: canvas stays bounded while phone controls can scroll`);

  await insideFrame.locator('#cut').evaluate((input) => {
    input.value = '60';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await insideFrame.waitForFunction(() => window.farmHouseInside.renderer.clippingPlanes.length === 1);
  await insideFrame.locator('#cut').evaluate((input) => {
    input.value = '100';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await insideFrame.waitForFunction(() => window.farmHouseInside.renderer.clippingPlanes.length === 0);

  await insideFrame.locator('#show-barn').click();
  await insideFrame.waitForFunction(() => window.farmHouseInside.model.layers.barn.visible);
  assert.equal(await insideFrame.locator('#barn-toggle').isChecked(), true, `${label}: barn inspection exposes the barn layer`);
  const barnShot = path.join(output, 'house-inside-barn-393.png');
  await panel.screenshot({ path: barnShot });
  report.screenshots.push(barnShot);

  assert.equal(await insideFrame.locator('#truss option').count(), 60, `${label}: every safe truss profile is available`);
  await insideFrame.locator('#show-truss').click();
  await insideFrame.waitForFunction(() => window.farmHouseInside.getState().galleryOpen);
  assert.deepEqual(await insideFrame.evaluate(() => ({
    gallery: window.farmHouseInside.model.trussGallery.visible,
    root: window.farmHouseInside.model.root.visible,
    children: window.farmHouseInside.model.trussGallery.children.length,
  })), { gallery: true, root: false, children: 1 }, `${label}: truss gallery swaps to a bounded single-profile scene`);
  const trussShot = path.join(output, 'house-inside-truss-393.png');
  await panel.screenshot({ path: trussShot });
  report.screenshots.push(trussShot);
  await insideFrame.locator('#reset').click();
  await insideFrame.waitForFunction(() => !window.farmHouseInside.getState().galleryOpen && window.farmHouseInside.model.root.visible);

  await insideFrame.locator('#search').fill('toilet');
  const firstResult = insideFrame.locator('#results .result').first();
  await firstResult.waitFor();
  await firstResult.click();
  await insideFrame.waitForFunction(() => Boolean(window.farmHouseInside.getState().selected));
  const selected = await insideFrame.evaluate(() => {
    const id = window.farmHouseInside.getState().selected;
    const object = window.farmHouseInside.model.registry[id];
    const layer = window.farmHouseInside.model.layers[object.userData.layer];
    return { id, layerVisible: layer.visible, objectVisible: object.visible };
  });
  assert.ok(selected.id && selected.layerVisible && selected.objectVisible, `${label}: search selects a visible, usable construction object`);
  const restoredLayer = await insideFrame.evaluate(() => {
    const api = window.farmHouseInside;
    api.model.layers.electrical.visible = false;
    api.select('panel-A');
    const object = api.model.registry['panel-A'];
    return { layerVisible: api.model.layers.electrical.visible, objectVisible: object.visible };
  });
  assert.deepEqual(restoredLayer, { layerVisible: true, objectVisible: true },
    `${label}: selecting a Find result re-enables its real model layer`);
  const selectedShot = path.join(output, 'house-inside-selected-393.png');
  await panel.screenshot({ path: selectedShot });
  report.screenshots.push(selectedShot);
  await insideFrame.locator('#clear').click();
  await insideFrame.waitForFunction(() => !window.farmHouseInside.getState().selected);
  assert.equal(await insideFrame.evaluate(() => window.farmHouseInside.model.registry['panel-A'].visible), true,
    `${label}: clearing a Find result restores its model object`);

  await insideFrame.locator('#property').click();
  await panel.waitFor({ state: 'detached' });
  assert.equal(await frame.locator('button[data-collection="property"]').getAttribute('aria-pressed'), 'true', `${label}: Property returns to the exterior and releases the nested engine`);

  if (!exitToHub) return;
  await frame.locator('button[data-collection="find"]').click();
  const exitPanel = frame.locator('#construction-panel iframe');
  await exitPanel.waitFor();
  const exitFrame = await (await exitPanel.elementHandle()).contentFrame();
  await exitFrame.locator('#exit').click();
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
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    const constructionHub = page.locator('.construction-hub-tile');
    assert.equal(await constructionHub.count(), 0,
      `${width}px homepage keeps the approved construction-showcase cut out of the mosaic`);
    pass(`${width}px homepage omits the curated construction-showcase front; /construction/ remains the direct canonical route`);
  }
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

  await page.setViewportSize({ width: 393, height: 844 });
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
    if (slug === 'house-explorer') {
      // Farm House deliberately keeps its renderer cold behind the approved
      // exterior poster. Its verifier performs the explicit visitor load
      // before asserting the canvas and every available control.
      await verifyFarmHouse(frame, 'Farm House in-card embed');
      const shot = path.join(output, 'house-explorer-embed-393.png');
      await frameElement.screenshot({ path: shot });
      report.screenshots.push(shot);
      await verifyFarmInside(frame, 'Farm House Inside and Find on phone', { exitToHub: true });
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await page.locator('#detail iframe').count(), 0, 'Inside exit releases both nested and exterior engines');
      assert.equal(await tile.evaluate(node => node === document.activeElement), true, 'Inside exit restores focus to the originating tile');
      pass('Farm House Inside and Find: safe model, cutaway, barn, truss, search, Property return, and hub exit');
      continue;
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

  const desktopHouse = await context.newPage();
  desktopHouse.on('pageerror', error => report.errors.push(error.message));
  await desktopHouse.setViewportSize({ width: 1440, height: 900 });
  await desktopHouse.goto(base + '/');
  const desktopTile = desktopHouse.locator('a.tile[href="/labs/house-explorer/"]');
  await desktopTile.click();
  const desktopDialog = desktopHouse.locator('#detail');
  await desktopDialog.waitFor({ state: 'visible' });
  const desktopFrameElement = desktopDialog.locator('iframe[data-demo-src^="/examples/lab/concepts/house-explorer/"]');
  await desktopFrameElement.waitFor();
  await desktopFrameElement.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const desktopFrame = await (await desktopFrameElement.elementHandle()).contentFrame();
  await verifyFarmHouse(desktopFrame, 'Farm House desktop in-card embed');
  const desktopOpenShot = path.join(output, 'house-explorer-embed-open-1440.png');
  await desktopFrameElement.screenshot({ path: desktopOpenShot });
  report.screenshots.push(desktopOpenShot);
  await desktopFrame.locator('.lab-embed-exit').click();
  await desktopDialog.waitFor({ state: 'hidden' });
  assert.equal(await desktopHouse.locator('#detail iframe').count(), 0, 'Desktop close releases the 3D engine');
  assert.equal(await desktopTile.evaluate(node => node === document.activeElement), true, 'Desktop close restores tile focus');
  await overflow(desktopHouse);
  const desktopShot = path.join(output, 'house-explorer-embed-1440.png');
  await desktopHouse.screenshot({ path: desktopShot, fullPage: false });
  report.screenshots.push(desktopShot);
  pass('Farm House desktop in-card: full viewer controls, embed exit restoration, and no overflow');
  await desktopHouse.close();

  const directHouse = await context.newPage();
  directHouse.on('pageerror', error => report.errors.push(error.message));
  for (const width of [393, 320]) {
    await directHouse.setViewportSize({ width, height: 844 });
    await directHouse.goto(base + '/examples/lab/concepts/house-explorer/', { waitUntil: 'networkidle' });
    await verifyFarmHouse(directHouse, `Farm House direct route at ${width}px`);
    if (width === 320) {
      await verifyFarmCompactControls(directHouse, 'Farm House direct route at 320px');
      await verifyFarmCollectionSwitches(directHouse, 'Farm House direct route at 320px');
    }
    await overflow(directHouse);
    const shot = path.join(output, `house-explorer-direct-${width}.png`);
    await directHouse.screenshot({ path: shot, fullPage: true });
    report.screenshots.push(shot);
    pass(`Farm House direct route: ${width}px camera views, lighting, controls, and no overflow`);
  }
  await directHouse.close();

  const readerHouse = await context.newPage();
  readerHouse.on('pageerror', error => report.errors.push(error.message));
  await readerHouse.setViewportSize({ width: 393, height: 844 });
  await readerHouse.goto(base + '/labs/house-explorer/', { waitUntil: 'networkidle' });
  const readerFrameElement = readerHouse.locator('main[data-page-content] iframe[data-demo-src^="/examples/lab/concepts/house-explorer/"]');
  await readerFrameElement.waitFor();
  await readerHouse.getByRole('link', { name: 'Try the working demo +' }).click();
  await readerHouse.waitForFunction(() => {
    const demo = document.querySelector('main[data-page-content] iframe[data-demo-src^="/examples/lab/concepts/house-explorer/"]')?.getBoundingClientRect();
    const rail = document.querySelector('.direct-contact-rail')?.getBoundingClientRect();
    return demo && rail && demo.top >= rail.bottom - 1;
  });
  assert.equal(await readerHouse.evaluate(() => {
    const demo = document.querySelector('main[data-page-content] iframe[data-demo-src^="/examples/lab/concepts/house-explorer/"]')?.getBoundingClientRect();
    const rail = document.querySelector('.direct-contact-rail')?.getBoundingClientRect();
    return Boolean(demo && rail && demo.top >= rail.bottom - 1);
  }), true, 'Farm House share reader anchor keeps the working demo clear of the fixed contact rail');
  await readerFrameElement.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const readerFrame = await (await readerFrameElement.elementHandle()).contentFrame();
  await verifyFarmHouse(readerFrame, 'Farm House share reader');
  await overflow(readerHouse);
  pass('Farm House share reader loads the same full property viewer');
  await readerHouse.close();

  const compactContext = await browser.newContext({
    viewport: { width: 320, height: 700 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  await compactContext.route('**/*', route => {
    const request = route.request();
    return ['GET', 'HEAD'].includes(request.method()) ? route.continue() : route.abort();
  });
  const compactReader = await compactContext.newPage();
  compactReader.on('pageerror', error => report.errors.push(error.message));
  await compactReader.goto(base + '/labs/house-explorer/', { waitUntil: 'networkidle' });
  const compactFrameElement = compactReader.locator('main[data-page-content] iframe[data-demo-src^="/examples/lab/concepts/house-explorer/"]');
  await compactFrameElement.waitFor();
  await compactReader.getByRole('link', { name: 'Try the working demo +' }).click();
  await compactFrameElement.scrollIntoViewIfNeeded();
  const compactFrame = await (await compactFrameElement.elementHandle()).contentFrame();
  const compactLoad = compactFrame.getByRole('button', { name: 'Load experience', exact: true });
  if (await compactLoad.count()) await compactLoad.click();
  await compactFrame.locator('body[data-model-ready="true"]').waitFor({ timeout: 45000 });
  assert.ok((await compactFrame.evaluate(() => innerWidth)) <= 280, '320px share reader exercises the reduced embedded Farm House viewport');
  await verifyFarmCompactControls(compactFrame, 'Farm House 320px share reader', { page: compactReader, frameElement: compactFrameElement });
  await verifyFarmCollectionSwitches(compactFrame, 'Farm House 320px share reader');
  await overflow(compactReader);
  const compactShot = path.join(output, 'house-explorer-reader-320.png');
  await compactFrameElement.screenshot({ path: compactShot });
  report.screenshots.push(compactShot);
  await compactContext.close();
  pass('Farm House 320px direct and embedded routes keep every header and Property, Inside, Find control visible, separate, and tappable');

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
