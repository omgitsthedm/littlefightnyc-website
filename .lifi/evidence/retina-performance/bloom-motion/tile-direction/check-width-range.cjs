const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {chromium}=require('../../../../../app/node_modules/@playwright/test');
const root=path.resolve(__dirname,'../../../../..');
const pending=process.argv.includes('--pending-css');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const checks=[];
 try{
  const page=await browser.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'});
  await page.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:63449'&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
  await page.goto('http://127.0.0.1:63449/?qa=1');
  if(pending)await page.addStyleTag({content:'.sculpture-tile[data-answer="backup"]{--object-scale:1.16}@media(min-width:1001px){.sculpture-tile[data-answer="page-industries"]{--object-x:-7px}}'});
  const source=fs.readFileSync(path.join(root,'app/scripts/verify-sculpture.cjs'),'utf8');
  const fn=source.slice(source.indexOf('async function geometry('),source.indexOf('async function collectionRhythm('));
  const context={page,expectedTiles:58,check:(name,passed,detail)=>checks.push({name,passed,detail})};
  vm.createContext(context);vm.runInContext(fn,context);
  const widths=[...new Set([...Array.from({length:81},(_,i)=>320+i*16),1048])].sort((a,b)=>a-b);
  for(const width of widths){
   await page.setViewportSize({width,height:1000});
   await page.waitForTimeout(220);
   context.label=width+'px';await vm.runInContext('geometry(page,label)',context);
  }
  const failures=checks.filter(c=>!c.passed);
  const report={pendingCSS:pending,widths,tilesPerWidth:58,checks:checks.length,failures};
  fs.writeFileSync(path.join(__dirname,pending?'width-range-pending.json':'width-range-final.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));assert.equal(failures.length,0);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
