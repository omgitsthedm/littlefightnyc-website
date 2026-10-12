/* Approved clay hero: real destinations, native artwork, usable controls and motion. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium, webkit } = require('@playwright/test');
const root = path.resolve(__dirname, '../..');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:63453';
const receipt = JSON.parse(fs.readFileSync(path.join(root, '.lifi/design-source/sculpture/clay-release.json')));
const checks = [];
const pass = (name, value) => { assert.ok(value, name); checks.push(name); };
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const evidence = path.join(root, '.lifi/evidence/clay-release');

(async () => {
  fs.mkdirSync(evidence, { recursive: true });
  for (const [file, expected] of Object.entries(receipt.assets)) {
    pass(file + ' retains approved bytes', hash(path.join(root, file)) === expected);
    const served = file.replace(/^app\/public\//, '').replace(/^app\/preview-ui\//, '');
    pass(served + ' is in the final artifact', hash(path.join(root, 'app/dist', served)) === expected);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'app/preview-content/clay-library.json')));
  for (const [id, asset] of Object.entries(manifest.assets)) {
    for (const variant of asset.variants) {
      const file = path.join(root, 'app/dist/assets/clay-png', variant.file);
      const data = fs.readFileSync(file);
      pass(id + ' ' + variant.width + ' preserves RGBA and recorded resolution',
        data[25] === 6 && data.readUInt32BE(16) === variant.width &&
        data.readUInt32BE(20) === variant.height && variant.width <= asset.sourceWidth && hash(file) === variant.sha256);
    }
  }
  for (const [engine, type] of [['chrome', chromium], ['webkit', webkit]]) {
    const browser = await type.launch(engine === 'chrome' ? { channel: 'chrome', headless: true } : { headless: true });
    try {
      for (const width of [320, 393, 768, 1440, 2560]) {
        const page = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + '/?qa=1');
        await page.evaluate(() => document.fonts.ready);
        const state = await page.locator('.sculpture-hero').evaluate(hero => ({
          design: hero.dataset.hero, overflow: document.documentElement.scrollWidth > innerWidth + 1,
          rooms: hero.querySelectorAll('.clay-room-link').length,
          projects: hero.querySelectorAll('.clay-hero-project').length,
          rachel: !!hero.querySelector('.hero-secondary image[href$="rachel-clay-portrait-yellow.webp"]'),
          motion: hero.dataset.motion,
          buttons: [...document.querySelectorAll('.primary-nav .start-button,.sculpture-help')].filter(a => a.getClientRects().length).map(a => {
            const r = a.getBoundingClientRect();
            return { width: r.width, height: r.height, text: a.textContent, href: a.getAttribute('href'), surface: getComputedStyle(a, '::before').backgroundImage };
          }),
        }));
        pass(engine + ' ' + width + ' approved scene fits', state.design === 'clay-neighborhood' && !state.overflow && state.rooms === 4 && state.projects === 2 && state.rachel);
        pass(engine + ' ' + width + ' accessible handmade Get help buttons', state.buttons.length >= 1 && state.buttons.every(b => b.width >= 44 && b.height >= 44 && b.text.includes('Get help') && b.href === '/tech-audit/' && b.surface.includes('help-button-orange.webp')));
        pass(engine + ' ' + width + ' respects reduced motion', state.motion === 'paused');
        for (const selector of ['.sculpture-help', '.hero-main', '.hero-secondary', '.clay-room-home', '.clay-room-studio', '.clay-room-meeting', '.clay-room-shop']) {
          const link = page.locator(selector), href = await link.getAttribute('href');
          await link.click();
          await page.waitForFunction(href => document.querySelector('#detail')?.open && document.querySelector('#detail-body')?.dataset.readerPath === href, href);
          await page.locator('#close-detail').click();
          await page.waitForFunction(selector => !document.querySelector('#detail').open && document.activeElement === document.querySelector(selector), selector);
          pass(engine + ' ' + width + ' ' + selector + ' opens and restores focus', true);
        }
        await page.evaluate(() => scrollTo(0, 0));
        if ([393, 1440, 2560].includes(width)) await page.screenshot({ path: path.join(evidence, `${engine}-${width}.png`) });
        pass(engine + ' ' + width + ' has no page errors', errors.length === 0);
        await page.close();
      }
      const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'no-preference' });
      await page.goto(base + '/?qa=1');
      const hero = page.locator('.sculpture-hero');
      await page.locator('.clay-diorama').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.sculpture-hero').dataset.motion === 'running');
      pass(engine + ' scene loops continuously', await hero.evaluate(h => h.getAnimations({ subtree: true }).some(a => a.playState === 'running' && a.effect.getTiming().iterations === Infinity)));
      await page.locator('.clay-motion-toggle').click();
      pass(engine + ' pause stops the scene', await hero.getAttribute('data-motion') === 'paused');
      await page.locator('.clay-motion-toggle').click();
      pass(engine + ' resume restarts the loop', await hero.getAttribute('data-motion') === 'running');
      await page.locator('.clay-pigeon').click();
      pass(engine + ' pigeon reveals its pizza crust', await page.locator('.clay-pigeon').getAttribute('data-surprise') === 'found');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.sculpture-hero').dataset.motion === 'paused');
      pass(engine + ' offscreen scene pauses', true);
      await page.close();
      const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 393, height: 852 } });
      await nojs.goto(base + '/');
      pass(engine + ' native links and artwork survive without JavaScript', await nojs.locator('.sculpture-hero a[href]').count() === 10 && await nojs.locator('.clay-building image').count() > 0);
      await nojs.close();
    } finally { await browser.close(); }
  }
  fs.writeFileSync(path.join(evidence, 'verification.json'), JSON.stringify({ passed: true, checks }, null, 2));
  console.log('Passed ' + checks.length + ' clay artwork and hero checks.');
})().catch(error => { console.error(error); process.exitCode = 1; });
