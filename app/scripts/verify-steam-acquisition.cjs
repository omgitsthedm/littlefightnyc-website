/* Local-only buyer flow and approved Steam Assembly regression coverage. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('@playwright/test');
const {default:AxeBuilder} = require('@axe-core/playwright');
const base = (process.env.PREVIEW_URL || 'http://127.0.0.1:4464').replace(/\/$/, '');
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Local candidate required');
const out = path.resolve(__dirname, '../../.lifi/evidence/steam-acquisition');
fs.mkdirSync(out, {recursive: true});
const config = require('../preview-content/steam-mark.json');
const report = {browser:'Installed Google Chrome', physicalDevices:false, base, checks:[], errors:[], localFailures:[], blockedMutations:0};
const check = (name, value) => { assert.ok(value, name); report.checks.push(name); };
const mark = '[data-steam-mark="header"]';
async function context(browser, options={}) {
  const ctx = await browser.newContext({viewport:{width:1440,height:1000}, ...options});
  await ctx.route('**/*', route => {
    const req = route.request();
    if (!['GET','HEAD'].includes(req.method())) { report.blockedMutations++; return route.abort(); }
    if (new URL(req.url()).origin !== new URL(base).origin) return route.abort();
    return route.continue();
  });
  ctx.on('page', p => {
    p.on('pageerror', e => report.errors.push(e.message));
    p.on('response', r => { if (r.url().startsWith(base) && r.status()>=400) report.localFailures.push({url:r.url(),status:r.status()}); });
  });
  return ctx;
}
async function staticMark(page, name) {
  check(name, await page.locator(mark).first().evaluate(el => el.dataset.steamState !== 'playing' && getComputedStyle(el.querySelector('svg')).visibility === 'visible'));
  assert.deepEqual(await page.locator(mark).first().locator('path').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d'))), config.paths);
}
async function main() {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    for (const width of [320,390,1440]) {
      const ctx = await context(browser,{viewport:{width,height:900},reducedMotion:'reduce'}), page=await ctx.newPage();
      for (const route of ['/', '/services/custom-local-websites/', '/markets/nyc/', '/markets/marthas-vineyard/', '/markets/arizona/phoenix/']) {
        await page.goto(base+route); await page.evaluate(()=>document.fonts.ready);
        check(`${width} ${route} readable without horizontal overflow`, await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        check(`${width} ${route} one primary heading`, await page.locator('h1').count()===1);
        await staticMark(page, `${width} ${route} complete static mark for reduced motion`);
        if (width===390 || (width===1440 && route==='/')) await page.screenshot({path:path.join(out, `${width}-${route==='/'?'home':route.split('/').filter(Boolean).pop()}.png`),fullPage:route!=='/'});
        if (width===390 && route.startsWith('/markets/')) {
          check(`${route} proof captions are 44px touch targets`, await page.locator('.website-market figcaption a').evaluateAll(links=>links.length===2 && links.every(link=>link.getBoundingClientRect().height>=44)));
          const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
          check(`${route} no detected automated accessibility violations`, accessibility.violations.length===0);
        }
        if (route==='/') {
          await page.locator('.sculpture-help').click();
          await page.locator('#detail[open] [name="intent"]').waitFor({state:'attached'});
          check(`${width} homepage goes directly to website inquiry`, await page.locator('#detail [name="intent"]').inputValue()==='website' && !await page.locator('#get-help-panel').evaluate(el=>el.open));
          check(`${width} inquiry retains homepage source`, await page.locator('#detail form').evaluate(form=>(form.elements.namedItem('lead_origin') || form.elements.namedItem('source')).value)==='/');
          check(`${width} budget and audience do not become required fields`, await page.locator('#detail [required]').evaluateAll(nodes=>nodes.every(n=>!['budget','audience','website','company'].includes(n.name))));
          await page.locator('#close-detail').click();
        } else {
          const inquiry = page.locator('main a[href*="/tech-audit/?intent=website"]').first();
          check(`${width} ${route} website CTA present`, await inquiry.count()===1);
          const href=await inquiry.getAttribute('href');
          check(`${width} ${route} CTA preserves its source`, new URL(href,base).searchParams.get('source')===route);
          await inquiry.click();
          await page.locator('#detail[open] [name="intent"]').waitFor({state:'attached'});
          check(`${width} ${route} selected website intent`, await page.locator('#detail [name="intent"]').inputValue()==='website');
          check(`${width} ${route} source survives reader`, await page.locator('#detail form').evaluate(form=>(form.elements.namedItem('lead_origin') || form.elements.namedItem('source')).value)===route);
          await page.locator('#close-detail').click();
        }
      }
      await ctx.close();
    }
    const ctx=await context(browser), p=await ctx.newPage();
    await p.goto(base+'/');
    await p.waitForFunction(s=>document.querySelector(s)?.dataset.steamState==='playing',mark);
    const openingBox=await p.locator(mark).first().boundingBox();
    await p.locator(mark).first().screenshot({path:path.join(out,'mark-opening.png')});
    await p.waitForTimeout(2300);
    await p.locator(mark).first().screenshot({path:path.join(out,'mark-assembly.png')});
    await p.waitForFunction(s=>document.querySelector(s)?.dataset.steamState==='static',mark);
    await staticMark(p,'six-second playback ends on the complete approved tugboat');
    const finishedBox=await p.locator(mark).first().boundingBox();
    check('playback reserves the same logo dimensions', openingBox.width===finishedBox.width && openingBox.height===finishedBox.height);
    await p.locator(mark).first().screenshot({path:path.join(out,'mark-complete.png')});
    await p.reload(); await p.waitForTimeout(300);
    await staticMark(p,'header does not autoplay again in the same session');
    await p.locator('.wordmark').hover();
    check('deliberate hover replays without intercepting navigation',await p.locator(mark).first().getAttribute('data-steam-state')==='playing' && await p.locator('.wordmark').getAttribute('href')==='/');
    await p.emulateMedia({reducedMotion:'reduce'}); await p.waitForTimeout(50);
    await staticMark(p,'changing reduced motion mid-play restores the complete tugboat');
    await ctx.close();

    const pauseContext=await context(browser), pause=await pauseContext.newPage();
    await pause.goto(base+'/'); await pause.locator('.clay-motion-toggle').click();
    await staticMark(pause,'scene pause also stops logo motion');
    check('pause covers both existing scene and new mark',await pause.locator('body').evaluate(el=>el.classList.contains('no-motion')) && await pause.locator('.sculpture-hero').getAttribute('data-motion')==='paused');
    await pause.goto(base+'/markets/nyc/'); await staticMark(pause,'pause preference survives navigation');
    check('pause preference persists on other pages',await pause.locator('body').evaluate(el=>el.classList.contains('no-motion')));
    await pause.goto(base+'/'); await pause.locator('.clay-motion-toggle').click();
    check('resume restores motion permission',!await pause.locator('body').evaluate(el=>el.classList.contains('no-motion')));
    await pause.locator('.wordmark').focus();
    await pause.waitForFunction(s=>document.querySelector(s)?.dataset.steamState==='playing',mark);
    check('keyboard focus can replay',await pause.locator(mark).first().getAttribute('data-steam-state')==='playing');
    await pause.locator('footer').scrollIntoViewIfNeeded();
    await pause.waitForFunction(s=>document.querySelector(s).dataset.steamState==='static',mark);
    await staticMark(pause,'offscreen mark stops at the complete tugboat');
    await pause.locator('.wordmark').scrollIntoViewIfNeeded();
    await pause.locator('.wordmark').hover();
    await pause.waitForFunction(s=>document.querySelector(s)?.dataset.steamState==='playing',mark);
    // Deterministic lifecycle fixture: exercise the browser visibility event
    // without assuming headless Chrome backgrounds tabs like a physical device.
    await pause.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    await staticMark(pause,'simulated hidden-tab event stops playback on the complete mark');
    await pauseContext.close();

    for (const mode of ['no-js','script-failure','blocked-storage','motion-canvas-failure']) {
      const ctx=await context(browser, {javaScriptEnabled:mode!=='no-js'}), p=await ctx.newPage();
      if (mode==='script-failure') await ctx.route('**/steam-mark.js',r=>r.abort());
      if (mode==='blocked-storage') await ctx.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new Error('QA storage unavailable')}}));
      if (mode==='motion-canvas-failure') await ctx.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){return this.width===512&&this.height===512?null:original.apply(this,args)};});
      await p.goto(base+'/'); await p.waitForTimeout(200);
      await staticMark(p,`${mode}: complete recognizable mark remains`);
      check(`${mode}: home navigation remains a link`,await p.locator('.wordmark').getAttribute('href')==='/');
      await ctx.close();
    }
    const thanksContext=await context(browser), thanks=await thanksContext.newPage();
    await thanks.goto(base+'/thanks/');
    await thanks.locator('.lf-thanks [data-steam-mark="static"]').waitFor();
    check('direct thank-you visit does not claim a received inquiry',!(await thanks.locator('.lf-thanks').innerText()).includes('Message received'));
    await thanks.goto(base+'/thanks/?submitted=tech-audit&intent=website&internal_test=1');
    await thanks.locator('.lf-thanks [data-steam-mark="confirmation"]').waitFor();
    check('local confirmation fixture gets the one-shot mark',await thanks.locator('.lf-thanks [data-steam-mark="confirmation"] path').count()===3);
    await thanks.waitForFunction(()=>document.querySelector('.lf-thanks [data-steam-mark]')?.dataset.steamState==='static');
    await thanks.screenshot({path:path.join(out,'thanks-local-display-fixture.png'),fullPage:true});
    await thanksContext.close();
    check('no form or account mutation was attempted',report.blockedMutations===0);
    check('no JavaScript page errors',report.errors.length===0);
    check('no failed local resources',report.localFailures.length===0);
    report.passed=true;
  } finally {await browser.close(); fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));}
  console.log(`PASS ${report.checks.length} local buyer-flow and motion checks. Confirmation is a synthetic display fixture, not a received inquiry.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
