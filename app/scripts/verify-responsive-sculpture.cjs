/* Touch, orientation, hero actions and inquiry input across both browser engines. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium,webkit}=require('@playwright/test');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:51944';
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname));
const out=path.resolve(__dirname,'../../.lifi/evidence/visual-overhaul');
const report={checks:[],errors:[],resources:[],engines:{},physicalDevices:false};
const check=(name,pass,detail)=>report.checks.push({name,passed:!!pass,detail});
const settle=async page=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450)};
const profiles=[
 {name:'small-phone',width:320,height:568,touch:true},
 {name:'phone',width:393,height:852,touch:true},
 {name:'large-phone',width:430,height:932,touch:true},
 {name:'foldable',width:540,height:720,touch:true},
 {name:'small-tablet',width:744,height:1133,touch:true},
 {name:'tablet',width:820,height:1180,touch:true},
 {name:'large-tablet',width:1024,height:1366,touch:true},
 {name:'laptop',width:1366,height:768,touch:false},
 {name:'desktop',width:1920,height:1080,touch:false},
 {name:'ultrawide',width:2560,height:1080,touch:false},
];
async function heroGeometry(page,label){
 const result=await page.locator('.sculpture-hero').evaluate(hero=>{
  const issues=[];
  const inside=r=>r.left>=-1&&r.right<=innerWidth+1;
  for(const el of hero.querySelectorAll('h1,p,a,img')){
   if(!el.closest('.hero-ground')&&!inside(el.getBoundingClientRect()))issues.push('element outside viewport: '+el.tagName);
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
   while((n=walker.nextNode())){const range=document.createRange();range.selectNodeContents(n);if([...range.getClientRects()].some(r=>!inside(r)))issues.push('text outside viewport: '+n.textContent)}
  }
  for(const link of hero.querySelectorAll('a')){const r=link.getBoundingClientRect();if(r.height<44||r.width<44)issues.push('small action: '+link.textContent)}
  const art=hero.querySelector('.hero-boat img').getBoundingClientRect(),copy=hero.querySelector('.sculpture-hero-copy').getBoundingClientRect();
  if(Math.min(art.right,copy.right)>Math.max(art.left,copy.left)+1&&Math.min(art.bottom,copy.bottom)>Math.max(art.top,copy.top)+1)issues.push('boat overlaps words');
  return {issues,overflow:document.documentElement.scrollWidth>innerWidth+1,viewport:[innerWidth,innerHeight],imageLoaded:hero.querySelector('.hero-boat img').complete&&hero.querySelector('.hero-boat img').naturalWidth>0};
 });
 check(label+' readable hero, 44px actions, loaded boat and no overflow',!result.overflow&&result.imageLoaded&&!result.issues.length,result);
}
async function main(){
 for(const [engine,type] of [['chrome',chromium],['webkit',webkit]]){
  const browser=await type.launch(engine==='chrome'?{channel:'chrome',headless:true}:{headless:true});
  report.engines[engine]=browser.version();
  try{
  // Exercise rapid first-visit closes without incidental geometry reads.
  for(let visit=0;visit<3;visit++){
   const context=await browser.newContext({viewport:{width:393,height:1000},hasTouch:true,isMobile:true,deviceScaleFactor:2,reducedMotion:'reduce'});
   await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin&&['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
   const page=await context.newPage();
   try{
    await page.goto(base+'/?qa=1');await settle(page);
    for(const action of ['.hero-main','.hero-secondary','.sculpture-help']){
     const link=page.locator(action),href=await link.getAttribute('href');await link.scrollIntoViewIfNeeded();await link.tap();
     await page.waitForFunction(href=>document.querySelector('#detail')?.open&&document.querySelector('#detail-body')?.dataset.readerPath===href,href);
     await page.locator('#close-detail').click();
     await page.waitForFunction(action=>!document.querySelector('#detail').open&&document.activeElement===document.querySelector(action),action,{timeout:1500});
     check(engine+' cold visit '+visit+' immediately closing '+href+' returns focus',true);
    }
   }finally{await context.close()}
  }
  for(const profile of profiles){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},hasTouch:profile.touch,isMobile:profile.touch,deviceScaleFactor:profile.touch?2:1,reducedMotion:'reduce'});
   await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin&&['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
   const page=await context.newPage();
   const label=engine+' '+profile.name;
   page.on('pageerror',e=>report.errors.push({label,message:e.message}));
   page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)report.resources.push({label,status:r.status(),url:r.url()})});
   try{
    await page.goto(base+'/?qa=1');await settle(page);
    await heroGeometry(page,label);
    if(['phone','tablet','desktop'].includes(profile.name))await page.screenshot({path:path.join(out,`refined-hero-${engine}-${profile.width}.png`)});
    for(const action of ['.sculpture-help','.sculpture-work','.hero-main','.hero-secondary']){
     const link=page.locator(action);await link.scrollIntoViewIfNeeded();const scroll=await page.evaluate(()=>scrollY),href=await link.getAttribute('href');
     if(profile.touch)await link.tap();else await link.click();
     await page.waitForFunction(href=>document.querySelector('#detail')?.open&&document.querySelector('#detail-body')?.dataset.readerPath===href,href);
     await settle(page);
     const reader=await page.locator('#detail-body').evaluate(body=>({overflow:body.scrollWidth>body.clientWidth+1}));
     const close=page.locator('#close-detail');
     const hit=await close.evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el}});
     check(label+' '+href+' reader fits with reachable 44px close',!reader.overflow&&hit.hit&&hit.width>=44&&hit.height>=44,{reader,hit});
     if(action==='.sculpture-help'){
      const field=page.locator('#detail-body [name="name"]');
      await field.fill('Local layout check');
      check(label+' inquiry accepts input without mobile auto-zoom sizing',await field.evaluate(el=>el.value==='Local layout check'&&parseFloat(getComputedStyle(el).fontSize)>=16));
     }
     await close.click();await page.waitForFunction(()=>!document.querySelector('#detail').open);
     await page.waitForFunction(action=>document.activeElement===document.querySelector(action),action,{timeout:1500});
     check(label+' '+href+' closes to the original hero action',await link.evaluate((el,y)=>el===document.activeElement&&Math.abs(scrollY-y)<3,scroll));
    }
    await page.locator('#explore-toggle').click();
    const input=page.locator('#preview-search');await input.fill('printer');
    await page.locator('.search-result').first().waitFor();
    check(label+' search remains reachable',await input.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=44}));
    await page.locator('.search-result').first().click();await page.locator('#detail[open]').waitFor();
    await page.locator('#close-detail').click();await page.locator('#explore-menu[open]').waitFor();
    await page.locator('#explore-menu .menu-close').click();
    if(profile.touch){
     await page.setViewportSize({width:profile.height,height:profile.width});await settle(page);await heroGeometry(page,label+' landscape');
     const cards=await page.locator('#canvas .tile').evaluateAll(tiles=>({count:tiles.length,overflow:document.documentElement.scrollWidth>innerWidth+1}));
     check(label+' orientation change retains all 80 tiles without overflow',cards.count===80&&!cards.overflow,cards);
    }
    if(['small-phone','tablet','desktop'].includes(profile.name)){
     await page.setViewportSize({width:profile.width,height:profile.height});
     await page.locator('.sculpture-hero h1,.sculpture-hero p,.sculpture-hero a').evaluateAll(nodes=>nodes.forEach(el=>el.style.fontSize=parseFloat(getComputedStyle(el).fontSize)*2+'px'));
     await settle(page);await heroGeometry(page,label+' 200% hero text');
    }
   }finally{await context.close()}
  }}finally{await browser.close()}
 }
 check('No browser JavaScript errors',report.errors.length===0,report.errors);
 check('No failed local resources',report.resources.length===0,report.resources);
 const failed=report.checks.filter(x=>!x.passed);report.result=failed.length?'failed':'passed';
 fs.writeFileSync(path.join(out,'responsive-engines.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({result:report.result,checks:report.checks.length,failed},null,2));
 assert.equal(failed.length,0);
}
main().catch(e=>{report.fatal=e.stack;fs.writeFileSync(path.join(out,'responsive-engines.json'),JSON.stringify(report,null,2));console.error(e);process.exitCode=1});
