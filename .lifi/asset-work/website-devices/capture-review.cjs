const {chromium}=require('../../../app/node_modules/@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const out=path.resolve(__dirname,'../../evidence/website-devices');
const desktop='/Users/davidmarsh/Desktop/Active Projects/LiFi Tile Website/Little Fight NYC Master Match Review - 2026-10-08';

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const report={screenshots:[],imageSources:[],errors:[]};
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
    page.on('pageerror',error=>report.errors.push(error.message));
    for(const width of [1440,393]){
      await page.setViewportSize({width,height:1050});
      await page.goto('http://127.0.0.1:57470/?qa=1&v=website-devices');
      await page.evaluate(()=>document.fonts.ready);
      await page.locator('#canvas img').evaluateAll(images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode()})));
      await page.waitForTimeout(400);
      if(width===1440){
        const height=await page.locator('#topic-web').evaluate(section=>Math.ceil(section.getBoundingClientRect().height)+48);
        await page.setViewportSize({width,height});
      }
      await page.evaluate(()=>window.scrollTo({top:document.querySelector('#topic-web').getBoundingClientRect().top+scrollY-24,behavior:'instant'}));
      await page.waitForTimeout(250);
      const name=width===1440?'Website Tiles Desktop.png':'Website Tiles Mobile.png';
      const file=path.join(out,name);
      await page.screenshot({path:file,fullPage:false});
      fs.copyFileSync(file,path.join(desktop,name));
      report.screenshots.push({width,file,desktop:path.join(desktop,name)});
      const images=await page.locator('[data-topic-grid=web] [data-device] img').evaluateAll(images=>images.map(image=>({src:image.currentSrc,displayWidth:image.getBoundingClientRect().width,sizes:image.sizes})));
      report.imageSources.push({width,images});
      if(width===1440 && !images.find(image=>image.src.endsWith('/website-cc-films.webp')))throw new Error('Wide desktop preview did not select its full-resolution asset.');
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw new Error('Horizontal overflow in review capture.');
    }
    if(report.errors.length)throw new Error(report.errors.join('\n'));
    fs.writeFileSync(path.join(out,'review-verification.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({result:'passed',screenshots:report.screenshots,errors:report.errors},null,2));
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
