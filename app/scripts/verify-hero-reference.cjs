'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium,webkit}=require('@playwright/test');
const root=path.resolve(__dirname,'../..');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:57470';
const receipt=JSON.parse(fs.readFileSync(path.join(root,'.lifi/design-source/sculpture/hero-reference.json')));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const checks=[];
function pass(name,value){assert.ok(value,name);checks.push(name);}
(async()=>{
 pass('Selected master remains byte exact',hash(receipt.source)===receipt.sourceSha256&&receipt.sourceSha256==='c64745aef55ea754f4b980701bafadd523b270c7307240e754ebdb0bb6253e38');
 for(const output of receipt.outputs)pass(output.name+' served bytes match the reference receipt',hash(path.join(root,output.file))===output.sha256&&hash(path.join(root,'app/dist/assets/sculpture',output.name+'.webp'))===output.sha256);
 for(const [engine,type] of [['chrome',chromium],['webkit',webkit]]){
  const browser=await type.launch(engine==='chrome'?{channel:'chrome',headless:true}:{headless:true});
  try{for(const width of [320,393,768,1440]){
   const page=await browser.newPage({viewport:{width,height:1100},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/?qa=1');await page.evaluate(()=>document.fonts.ready);await page.locator('.sculpture-hero img').evaluate(i=>i.decode());
   const state=await page.locator('.sculpture-hero').evaluate(hero=>({source:hero.querySelector('img').currentSrc,extraObjects:hero.querySelectorAll('[data-hero-body],.hero-software,.hero-router,.hero-notebook').length,overflow:document.documentElement.scrollWidth>innerWidth+1,headline:hero.querySelector('h1').innerText,controls:[...hero.querySelectorAll('a')].map(a=>{const r=a.getBoundingClientRect();return {href:a.getAttribute('href'),width:r.width,height:r.height}})}));
   pass(engine+' '+width+' uses the matching unchanged master composition',state.source.endsWith(width<=600?'hero-reference-mobile.webp':'hero-reference-desktop.webp')&&state.extraObjects===0&&!state.overflow&&state.controls.length===4&&state.controls.every(c=>c.width>=44&&c.height>=44));
   if(width===1440)pass(engine+' header matches the master navigation',JSON.stringify(await page.locator('.primary-nav>a:not(.start-button)').allTextContents())===JSON.stringify(['Websites','Our work']));
   for(const selector of ['.hero-main','.hero-secondary']){const target=page.locator(selector),href=await target.getAttribute('href');await target.click();await page.waitForFunction(href=>document.querySelector('#detail')?.open&&document.querySelector('#detail-body')?.dataset.readerPath===href,href);await page.locator('#close-detail').click();await page.waitForFunction(selector=>!document.querySelector('#detail').open&&document.activeElement===document.querySelector(selector),selector);pass(engine+' '+width+' '+selector+' opens its project and returns focus',true);}
   pass(engine+' '+width+' has no JavaScript errors',errors.length===0);await page.close();
  }
  const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:393,height:852}});await page.goto(base+'/');pass(engine+' artwork and native links survive without JavaScript',await page.locator('.sculpture-hero img').evaluate(i=>i.complete&&i.naturalWidth>0)&&await page.locator('.sculpture-hero a[href]').count()===4);await page.close();
  }finally{await browser.close();}
 }
 const evidence=path.join(root,'.lifi/evidence/master-fidelity/reference-locked/interaction-results.json');
 fs.mkdirSync(path.dirname(evidence),{recursive:true});
 fs.writeFileSync(evidence,JSON.stringify({passed:true,checks},null,2));console.log('Passed '+checks.length+' master reference and interaction checks.');
})().catch(e=>{console.error(e);process.exitCode=1;});
