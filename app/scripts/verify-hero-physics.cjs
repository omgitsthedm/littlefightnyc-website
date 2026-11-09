'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('@playwright/test');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:57470';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
const output = path.resolve(__dirname, '../../.lifi/evidence/master-fidelity/hero-physics');
const results = [], errors = [];
const check = (name, value) => { assert.ok(value, name); results.push(name); };
const state = page => page.locator('.hero-main .hero-body').evaluate(n => ({
  x:parseFloat(n.style.getPropertyValue('--hero-x')) || 0,
  y:parseFloat(n.style.getPropertyValue('--hero-y')) || 0,
  angle:parseFloat(n.style.getPropertyValue('--hero-angle')) || 0,
}));
(async () => {
  fs.mkdirSync(output, {recursive:true});
  for (const [engine, type] of [['chrome',chromium],['webkit',webkit]]) {
    const browser = await type.launch(engine === 'chrome' ? {channel:'chrome',headless:true} : {headless:true});
    try {
      const page = await browser.newPage({viewport:{width:1440,height:1080},reducedMotion:'no-preference'});
      page.on('pageerror', e => errors.push(engine+': '+e.message));
      await page.goto(base+'/?qa=1');
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.sculpture-hero img').evaluateAll(images => Promise.all(images.map(i => i.decode())));
      for (const route of ['/services/custom-local-websites/','/services/it-support/','/services/tech-consulting/','/services/business-systems/']) {
        const link = page.locator('.primary-nav a[href="'+route+'"]');
        check(engine+' header exposes '+route, await link.isVisible());
        await link.click();
        await page.waitForFunction(route => document.querySelector('#detail')?.open && document.querySelector('#detail-body').dataset.readerPath === route, route);
        await page.locator('#close-detail').click();
        await page.waitForFunction(() => !document.querySelector('#detail').open);
      }
      await page.mouse.move(5,5);
      const box = await page.locator('.hero-main').boundingBox();
      // Use a clear upper screen area, away from the foreground objects.
      const x = box.x+box.width*.65, y = box.y+box.height*.24;
      await page.mouse.move(x,y);
      await page.waitForTimeout(150);
      check(engine+' spring responds to pointer pressure', Math.abs((await state(page)).y) > .1);
      await page.mouse.down();
      await page.mouse.move(x+32,y-18,{steps:6});
      await page.waitForTimeout(150);
      check(engine+' anchored object has physical displacement', (await state(page)).x > 5);
      await page.mouse.up();
      await page.mouse.move(5,5);
      await page.waitForFunction(() => document.querySelector('[data-hero-physics]').dataset.physicsState === 'settled');
      const atRest = await state(page);
      check(engine+' drag returns to its exact resting position', Object.values(atRest).every(v => Math.abs(v)<.01));
      check(engine+' dragging does not accidentally open a project', !await page.locator('#detail').evaluate(n => n.open));
      await page.locator('.hero-main').click({position:{x:box.width*.5,y:box.height*.2}});
      await page.locator('#detail[open]').waitFor();
      check(engine+' ordinary project click still opens its reader', await page.locator('#detail-body').getAttribute('data-reader-path') === '/case-studies/chromatic-painting-design/');
      await page.locator('#close-detail').click();
      await page.waitForFunction(() => !document.querySelector('#detail').open);
      await page.locator('#explore-toggle').click();
      await page.locator('#motion-toggle').click();
      await page.locator('#explore-menu .menu-close').click();
      await page.mouse.move(x,y);
      await page.waitForTimeout(160);
      check(engine+' motion preference leaves objects still', Object.values(await state(page)).every(v => v===0));
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.reload();
      await page.mouse.move(x,y);
      await page.waitForTimeout(100);
      check(engine+' OS reduced motion remains static', Object.values(await state(page)).every(v => v===0));
      await page.close();
      const touch = await browser.newPage({viewport:{width:393,height:852},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
      await touch.goto(base+'/?qa=1');
      await touch.locator('.hero-secondary').tap();
      await touch.locator('#detail[open]').waitFor();
      check(engine+' touch opens the foldable project directly', await touch.locator('#detail-body').getAttribute('data-reader-path') === '/case-studies/hair-by-rachel-charles/');
      await touch.locator('#close-detail').click();
      check(engine+' scene allows native vertical scrolling', await touch.locator('[data-hero-physics]').evaluate(n => getComputedStyle(n).touchAction === 'pan-y'));
      await touch.close();
    } finally { await browser.close(); }
  }
  check('No browser JavaScript errors', errors.length===0);
  fs.writeFileSync(path.join(output,'interaction-results.json'), JSON.stringify({result:'passed',checks:results,errors},null,2));
  console.log('Passed '+results.length+' hero interaction checks in Chrome and WebKit.');
})().catch(error => { fs.writeFileSync(path.join(output,'interaction-results.json'),JSON.stringify({result:'failed',checks:results,errors,error:error.stack},null,2));console.error(error);process.exitCode=1; });
