const {chromium}=require('../../../app/node_modules/@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../evidence/website-devices');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:57470/?qa=1&v=website-devices');await page.evaluate(()=>document.fonts.ready);
 await page.locator('#canvas img').evaluateAll(images=>Promise.all(images.map(async i=>{i.loading='eager';await i.decode()})));
 const results=[];
 for(const width of [1440,1024,834,393,320]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(700);
  const grid=page.locator('[data-topic-grid="web"]');
  await grid.screenshot({path:path.join(out,'websites-'+width+'.png')});
  const cards=await grid.locator('.tile').evaluateAll(tiles=>tiles.map(t=>{
   const b=t.getBoundingClientRect(),i=t.querySelector('img'),a=i?.getBoundingClientRect();
   const ratio=i?Number(i.getAttribute('width'))/Number(i.getAttribute('height')):0;
   const paintedWidth=a?Math.min(a.width,a.height*ratio):0,paintedHeight=a?Math.min(a.height,a.width/ratio):0;
   return {id:t.dataset.answer,device:t.dataset.device,cols:t.dataset.columns,rows:t.dataset.rows,box:[b.width,b.height],art:a?[a.width,a.height]:null,painted:[paintedWidth,paintedHeight],coverage:(paintedWidth*paintedHeight)/(b.width*b.height)};
  }));results.push({width,cards});
 }
 fs.writeFileSync(path.join(out,'after-geometry.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results[0],null,2));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
