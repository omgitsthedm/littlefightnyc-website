const {chromium}=require('../../../app/node_modules/@playwright/test');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname;
const library='/Users/davidmarsh/Desktop/Active Projects/LiFi Tile Website/Little Fight NYC Verified Screenshots 2026-10-07';
const manifest=JSON.parse(fs.readFileSync(path.join(library,'_gallery/manifest.json')));
const jobs=[['clearhelp','tablet',834,1112],['grand-funding-llc','tablet',834,1112],['the-break-room','duo',900,632],['the-tarot-hotline','duo',900,632]].filter(job=>!process.argv[2]||job[0]===process.argv[2]);
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const records=process.argv[2]?JSON.parse(fs.readFileSync(path.join(root,'new-screens.json'))).filter(r=>r.project!==process.argv[2]):[];
 try{
  for(const [project,profile,width,height] of jobs){
   const source=manifest.records.find(r=>r.key===project+'-desktop');
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,reducedMotion:'reduce'});
   await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(source.url,{waitUntil:'domcontentloaded',timeout:60000});
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(2000);
   const decline=page.getByRole('button',{name:/^(decline|reject all|essential only|keep analytics off)$/i}).first();
   if(await decline.isVisible())await decline.click();
   await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(500);
   const key=project+'-'+profile+'-20261008',file=project+'/'+key+'.png';
   await page.screenshot({path:path.join(library,file)});
   const observed=await page.evaluate(()=>({url:location.href,title:document.title,heading:document.querySelector('h1')?.textContent,scrollY,brokenVisibleImages:[...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0&&(!i.complete||!i.naturalWidth)).map(i=>i.src)}));
   records.push({key,project,url:source.url,profile,kind:'fresh-public-capture',file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(library,file))).digest('hex'),viewport:{width,height},deviceScaleFactor:2,width:width*2,height:height*2,capturedAt:new Date().toISOString(),browser:'installed Google Chrome',state:'Public opening, fonts settled; no submission',observed,pageErrors:errors,review:'pending'});
   console.log(key,JSON.stringify(observed));await context.close();
  }
  fs.writeFileSync(path.join(root,'new-screens.json'),JSON.stringify(records,null,2)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
