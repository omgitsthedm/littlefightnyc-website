/* The sculpture system's visible contract, exercised in installed Chrome.
 * Source identities, real screen provenance, every tile, small viewports,
 * enlarged text, keyboard return, and reader accessibility are release facts.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {chromium,webkit}=require('@playwright/test');
const {AxeBuilder}=require('@axe-core/playwright');
const app=path.resolve(__dirname,'..');
const evidence=path.resolve(app,'../.lifi/evidence/visual-overhaul');
const base=process.env.SCULPTURE_URL||process.env.PREVIEW_URL||'http://127.0.0.1:51944';
const isWebKit=process.argv.includes('--webkit');
const engineName=isWebKit?'webkit':'chrome';
const reportFile=isWebKit?'sculpture-webkit-verification.json':'sculpture-verification.json';
const report={browser:isWebKit?'Playwright WebKit':'Installed Google Chrome',checks:[],errors:[],resources:[],screenshots:[],physicalDevices:'Not verified by this desktop browser run'};
const check=(name,condition,detail)=>{report.checks.push({name,passed:Boolean(condition),detail});};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function settled(page){await page.evaluate(()=>document.fonts.ready);await delay(500);}
async function geometry(page,label){
 const result=await page.locator('#canvas .sculpture-tile').evaluateAll(tiles=>{
  const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  const inside=(a,b)=>a.left>=b.left-2&&a.right<=b.right+2&&a.top>=b.top-2&&a.bottom<=b.bottom+2;
  const problems=[];
  for(const tile of tiles){
   const box=rect(tile),art=tile.querySelector('.sculpture-art'),img=art?.querySelector('img');
   const icon=tile.querySelector('.sculpture-symbol');
   if(!icon || !inside(rect(icon),box) || rect(icon).width<28 || rect(icon).height<28 || getComputedStyle(icon).maskImage==='none')problems.push({id:tile.dataset.answer,issue:'matching icon missing, clipped, or too small'});
   if(tile.dataset.sculptureKind==='review'){
    if(art||tile.dataset.sculptureArt)problems.push({id:tile.dataset.answer,issue:'review has unwanted 3D art'});
   }else if(!img){problems.push({id:tile.dataset.answer,issue:'missing topic illustration'});}
   else{
    if(!inside(rect(img),box))problems.push({id:tile.dataset.answer,issue:'art outside tile',image:rect(img),box});
    if(rect(img).height<44||rect(img).width<44)problems.push({id:tile.dataset.answer,issue:'art too small',image:rect(img)});
   }
   for(const node of tile.querySelectorAll('.sculpture-title,.sculpture-description,.sculpture-lab-action')){
    const textNodes=[];const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;
    while((text=walker.nextNode()))if(!text.parentElement.closest('.sr-only,[aria-hidden="true"]'))textNodes.push(text);
    if(textNodes.some(text=>{const range=document.createRange();range.selectNodeContents(text);return [...range.getClientRects()].some(r=>!inside(r,box))}))problems.push({id:tile.dataset.answer,issue:'text outside tile',text:node.textContent});
    if(parseFloat(getComputedStyle(node).fontSize)<16)problems.push({id:tile.dataset.answer,issue:'text below 16px'});
   }
  }
  const grids=[...document.querySelectorAll('[data-topic-grid]')];
  for(const grid of grids){const cards=[...grid.children].filter(e=>e.matches('.tile'));for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){const a=rect(cards[i]),b=rect(cards[j]);const area=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));if(area>3)problems.push({issue:'tiles overlap',a:cards[i].dataset.answer,b:cards[j].dataset.answer,area});}}
  return {problems,count:tiles.length,overflow:document.documentElement.scrollWidth>innerWidth+1};
 });
 check(label+' has 80 sculptural tiles',result.count===80,result.count);
 check(label+' has no horizontal overflow',!result.overflow);
 check(label+' keeps words and sculpture inside every tile',result.problems.length===0,result.problems);
}
async function materialMotion(browser,inventory){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 const page=await context.newPage();
 await page.goto(base+'/?qa=1');await settled(page);
 const rows=[];
 for(const tile of inventory){
  const card=page.locator(`[data-answer="${tile.id}"]`);
  await card.scrollIntoViewIfNeeded();await delay(120);
  await page.waitForFunction(()=>!document.querySelector('.sculpture-tile.is-performing'),null,{timeout:5000});
  await page.evaluate(()=>document.activeElement?.blur());
  await card.focus();await delay(50);
  const animation=await card.evaluate(card=>{
   const inspect=selector=>{const node=card.querySelector(selector);const style=getComputedStyle(node);const active=node.getAnimations().find(a=>a.playState==='running');return {name:style.animationName,transform:style.transform,duration:active?.effect.getTiming().duration,iterations:active?.effect.getTiming().iterations}};
   return {...(card.dataset.sculptureKind==='review'?{}:{art:inspect('.sculpture-art img')}),icon:inspect('.sculpture-symbol')};
  });
  rows.push({id:tile.id,...animation});
  check(tile.id+' has visible finite material and icon motion',Object.values(animation).every(a=>a.name.startsWith('sculpture-')&&a.transform!=='none'&&a.duration>=250&&a.duration<=400&&a.iterations===1),animation);
 }
 await delay(500);
 check('Material animation settles without an idle loop',await page.locator('.sculpture-tile').evaluateAll(tiles=>tiles.every(tile=>tile.getAnimations({subtree:true}).every(a=>a.playState!=='running'))));
 // Exercise the real UI control and OS preference independently.
 await page.locator('#explore-toggle').click();await page.locator('#motion-toggle').click();await page.locator('#explore-menu .menu-close').click();
 await page.locator('[data-answer="software-smallest-useful-change"]').focus();
 await delay(60);
 check('Pause control stops all sculpture motion',await page.locator('.sculpture-tile').evaluateAll(tiles=>document.body.classList.contains('no-motion')&&tiles.every(t=>t.getAnimations({subtree:true}).every(a=>a.playState!=='running'))));
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await settled(page);
 await page.locator('[data-answer="page-services-custom-local-websites"]').focus();
 check('OS reduced motion keeps every icon and sculpture static',await page.locator('.sculpture-tile').evaluateAll(tiles=>tiles.every(t=>[...t.querySelectorAll('.sculpture-symbol,.sculpture-art img')].every(n=>getComputedStyle(n).animationName==='none'&&getComputedStyle(n).transform==='none'))));
 fs.writeFileSync(path.join(evidence,`all-80-motion-${engineName}.json`),JSON.stringify(rows,null,2));await context.close();
}
async function main(){
 fs.mkdirSync(evidence,{recursive:true});
 const baseline=JSON.parse(fs.readFileSync(path.resolve(app,'../.lifi/design-source/sculpture/previous-site.json')));
 const inventory=JSON.parse(fs.readFileSync(path.join(app,'dist/sculpture-inventory.json')));
 check('All original visible identities and destinations retained',baseline.tiles.every(t=>inventory.some(i=>i.id===t['data-answer']&&i.href===t.href))&&inventory.length===80);
 const illustrated=inventory.filter(t=>t.art);
 check('All 73 illustrated tiles use globally unique artwork',illustrated.length===73&&new Set(illustrated.map(t=>t.art)).size===73);
 check('No large extruded symbol illustrations remain',illustrated.every(t=>!t.art.startsWith('cast-')));
 check('Unique artwork names resolve to 73 different image files',new Set(illustrated.map(t=>crypto.createHash('sha256').update(fs.readFileSync(path.join(app,'dist/assets/sculpture',t.art+'.webp'))).digest('hex'))).size===73);
 check('Seven review tiles have no 3D star illustration',inventory.filter(t=>t.kind==='review').length===7&&inventory.filter(t=>t.kind==='review').every(t=>t.art===null));
 for(const art of ['printer','security','software'])check(art+' appears exactly once among all tiles',inventory.filter(t=>t.art===art).length===1);
 const routes=JSON.parse(fs.readFileSync(path.join(app,'dist/reader-routes.json')));
 check('All '+Object.keys(baseline.routes).length+' reader route mappings retained',JSON.stringify(routes)===JSON.stringify(baseline.routes));
 const receipts=JSON.parse(fs.readFileSync(path.resolve(app,'../.lifi/design-source/sculpture/screen-composites.json')));
 check('Every composited screenshot source remains byte exact',receipts.every(r=>crypto.createHash('sha256').update(fs.readFileSync(path.resolve(app,r.source))).digest('hex')===r.sourceSha256));
 check('Protected VERA source bytes unchanged',Object.entries(baseline.protectedVera).every(([f,hash])=>crypto.createHash('sha256').update(fs.readFileSync(path.join(app,'public',f))).digest('hex')===hash));
 const browser=isWebKit?await webkit.launch({headless:true}):await chromium.launch({channel:'chrome',headless:true});
 report.version=browser.version();
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)report.resources.push([r.status(),r.url()]);});
  await page.goto(base+'/?qa=1');await settled(page);
  check('Hero restores the reference composition without the added project caption rail',await page.locator('.sculpture-hero').evaluate(hero=>hero.querySelectorAll('img').length===4&&!hero.querySelector('.hero-cursor')&&Boolean(hero.querySelector('.hero-ground'))&&hero.querySelector('.hero-boat img').getAttribute('src')==='/assets/sculpture/boat.webp'&&hero.querySelectorAll('.hero-project').length===2&&!hero.querySelector('.hero-work-index')));
  check('Category icons distinguish every non-review tile',await page.locator('[data-topic-grid]').evaluateAll(grids=>grids.every(grid=>{const icons=[...grid.querySelectorAll('.tile:not(.review-tile)')].map(t=>t.dataset.sculptureIcon);return icons.length===new Set(icons).size})));
  await page.locator('.sculpture-object').evaluateAll(async imgs=>{await Promise.all(imgs.map(async img=>{img.loading='eager';try{await img.decode()}catch(error){throw new Error(img.currentSrc+': '+error.message)}}))});
  for(const width of [320,360,375,393,414,430,540,600,640,667,744,768,800,820,834,912,1000,1001,1024,1180,1280,1366,1440,1920,2560]){
   await page.setViewportSize({width,height:1000});await settled(page);await geometry(page,width+'px');
   if([393,834,1440].includes(width)){const file=`sculpture-home-${engineName}-${width}.png`;await page.screenshot({path:path.join(evidence,file),fullPage:true});report.screenshots.push(file);}
  }
  for(const width of [320,393,1440]){
   await page.setViewportSize({width,height:1000});await settled(page);await page.evaluate(()=>{for(const node of document.querySelectorAll('.sculpture-title,.sculpture-description,.sculpture-lab-action'))node.style.setProperty('font-size',parseFloat(getComputedStyle(node).fontSize)*2+'px','important')});await settled(page);await geometry(page,width+'px 200% text');await page.goto(base+'/?qa=1');await settled(page);
  }
  await page.setViewportSize({width:1440,height:1000});await settled(page);
  const allAxe=await new AxeBuilder({page}).analyze();check('Homepage has no Axe violations',allAxe.violations.length===0,allAxe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  if(!process.argv.includes('--layout-only')){
   for(const tile of inventory.filter(t=>t.href.startsWith('/'))){
    const card=page.locator(`[data-answer="${tile.id}"]`);await card.scrollIntoViewIfNeeded();const scroll=await page.evaluate(()=>scrollY);
    await card.click();
    try{await page.locator('#detail[open] #detail-title').waitFor({state:'attached',timeout:20000});}
    catch(error){
     report.readerFailure={tile:tile.id,...await page.evaluate(()=>({url:location.href,open:document.querySelector('#detail')?.open,readerPath:document.querySelector('#detail-body')?.dataset.readerPath,heading:document.querySelector('#detail-body h1')?.outerHTML,focused:document.activeElement?.outerHTML,scroll:scrollY}))};
     await page.screenshot({path:path.join(evidence,`reader-failure-${engineName}.png`)});
     throw error;
    }
    await page.waitForFunction(href=>document.querySelector('#detail-body')?.dataset.readerPath===href,tile.href,{timeout:20000});
    if(tile.id==='page-vera')await page.locator('#detail .reader-demo-frame').waitFor({state:'visible',timeout:20000});
    check(tile.id+' opens in the shared reader',await page.locator('#detail').evaluate(d=>d.open));
    const close=page.locator('#close-detail');const hit=await close.evaluate(b=>{const r=b.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b});check(tile.id+' keeps a reachable close',hit);
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#detail').open);
    check(tile.id+' restores source focus and grid position',await card.evaluate((c,y)=>document.activeElement===c&&Math.abs(scrollY-y)<3,scroll));
    // WebKit enforces 100 History API calls per 10 seconds. The robot's
    // rapid open/close sweep must stay below this browser-level quota.
    if(isWebKit)await delay(300);
   }
   for(const route of ['/services/custom-local-websites/','/services/it-support/','/services/tech-consulting/','/services/business-systems/','/answers/help/email/','/case-studies/chromatic-painting-design/','/case-studies/hair-by-rachel-charles/','/photos/nyc/','/reviews/','/library/','/construction/','/legal/']){
    await page.goto(base+route+'?qa=1');await settled(page);const result=await new AxeBuilder({page}).analyze();check(route+' has no Axe violations',result.violations.length===0,result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
   }
  }
  for(const width of [320,393,834,1440]){
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:1000}});const simple=await nojs.newPage();await simple.goto(base+'/');await simple.evaluate(()=>document.fonts.ready);await geometry(simple,width+'px without JavaScript');await nojs.close();
  }
  if(!process.argv.includes('--layout-only'))await materialMotion(browser,inventory);
  check('No page errors',report.errors.length===0,report.errors);check('No failed local resources',report.resources.length===0,report.resources);
 }finally{await browser.close()}
 const failed=report.checks.filter(c=>!c.passed);report.result=failed.length?'failed':'passed';fs.writeFileSync(path.join(evidence,reportFile),JSON.stringify(report,null,2));
 console.log(JSON.stringify({result:report.result,checks:report.checks.length,failed},null,2));assert.equal(failed.length,0,'Sculpture contract failures');
}
main().catch(e=>{report.fatal=e.stack;fs.writeFileSync(path.join(evidence,reportFile),JSON.stringify(report,null,2));console.error(e);process.exitCode=1});
