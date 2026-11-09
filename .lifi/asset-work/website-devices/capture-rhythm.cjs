const {chromium}=require('../../../app/node_modules/@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../evidence/website-devices');
const desktop='/Users/davidmarsh/Desktop/Active Projects/LiFi Tile Website/Little Fight NYC Master Match Review - 2026-10-08';
const topics={web:'Website',it:'Tech Support',consulting:'Consulting',software:'Custom Software'};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const measurements=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:65031/?qa=1&v=mixed-tile-rhythm');
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('#canvas img').evaluateAll(images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode()})));
  for(const width of [1440,1051,834,393,320]){
   await page.setViewportSize({width,height:1000});await page.waitForTimeout(350);
   const groups=await page.locator('[data-topic-grid]:not([data-sculpture-layout=compact])').evaluateAll(grids=>grids.map(grid=>({section:grid.dataset.topicGrid,height:grid.clientHeight,cards:[...grid.querySelectorAll(':scope > .tile')].map(card=>{const r=card.getBoundingClientRect();return{id:card.dataset.answer,width:r.width,height:r.height,icon:card.querySelector('.sculpture-symbol').getBoundingClientRect().width,font:getComputedStyle(card.querySelector('.sculpture-title')).fontSize}})})));
   measurements.push({width,groups});
   if(width!==1440 && width!==393)continue;
   for(const [topic,label] of Object.entries(topics)){
    const height=await page.locator('#topic-'+topic).evaluate(section=>Math.ceil(section.getBoundingClientRect().height)+48);
    await page.setViewportSize({width,height:Math.min(height,4000)});
    await page.evaluate(topic=>window.scrollTo({top:document.querySelector('#topic-'+topic).getBoundingClientRect().top+scrollY-24,behavior:'instant'}),topic);
    await page.waitForTimeout(300);
    const file=label+' Tiles '+(width===1440?'Desktop':'Mobile')+'.png';
    await page.screenshot({path:path.join(out,file),fullPage:false});
    fs.copyFileSync(path.join(out,file),path.join(desktop,file));
   }
  }
  await page.setViewportSize({width:1440,height:1560});
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#topic-web').getBoundingClientRect().top+scrollY-24,behavior:'instant'}));
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(out,'Tile Scale Desktop.png'),fullPage:false});
  fs.copyFileSync(path.join(out,'Tile Scale Desktop.png'),path.join(desktop,'Tile Scale Desktop.png'));
  fs.writeFileSync(path.join(out,'rhythm-measurements.json'),JSON.stringify(measurements,null,2)+'\n');
  console.log('Saved all four collections on desktop and phone, the cross-category view, and five-width measurements.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
