const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.env.FARM_HOUSE_TEST_URL || 'http://127.0.0.1:65201';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${base}/examples/lab/concepts/house-explorer/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#farm-house-poster').isVisible(), true, 'approved exterior poster is visible before 3D starts');
  assert.equal(await page.getByRole('button', { name: 'Load experience', exact: true }).isVisible(), true, 'explicit load control is visible');
  assert.equal(await page.locator('#scene canvas').count(), 0, 'viewer remains cold before the explicit load');
  assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('farm-house-viewer.js'))), false, 'viewer script is not requested before the explicit load');

  await page.getByRole('button', { name: 'Load experience', exact: true }).click();
  await page.locator('body[data-model-ready="true"]').waitFor({ timeout: 45000 });
  assert.equal(await page.locator('#scene canvas').count(), 1, 'viewer loads after explicit action');
  assert.equal(await page.locator('#farm-house-start').isHidden(), true, 'load panel clears after readiness');
  assert.equal(await page.locator('#farm-house-poster').getAttribute('aria-hidden'), 'true', 'poster becomes inert after readiness');
  assert.deepEqual(await page.locator('#view-select option').evaluateAll(options => options.map(option => option.value)), ['aerial', 'west', 'east', 'south', 'north', 'plan', 'gates', 'porch', 'paths', 'barnEast'], 'all approved viewpoints survive');
  assert.deepEqual(await page.locator('button[data-lighting]').evaluateAll(buttons => buttons.map(button => button.dataset.lighting)), ['dawn', 'noon', 'dusk', 'night'], 'all approved lighting controls survive');
  await page.locator('#view-select').selectOption('barnEast');
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await page.waitForFunction(() => document.body.dataset.view === 'barnEast' && document.body.dataset.lighting === 'night');
  assert.deepEqual(errors, [], 'cold load and active controls finish without page errors');

  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await phone.goto(`${base}/examples/lab/concepts/house-explorer/`, { waitUntil: 'networkidle' });
  assert.equal(await phone.locator('#scene canvas').count(), 0, 'phone route also keeps the renderer cold before interaction');
  assert.ok(await phone.locator('#farm-house-load').boundingBox(), 'phone keeps the poster load target reachable');
  await phone.getByRole('button', { name: 'Load experience', exact: true }).click();
  await phone.locator('body[data-model-ready="true"]').waitFor({ timeout: 45000 });
  assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1), 'phone exterior experience has no horizontal overflow');

  await browser.close();
  console.log('PASS Farm House cold exterior poster, explicit desktop and phone load, ten viewpoints, four lighting states, and active viewer controls');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
