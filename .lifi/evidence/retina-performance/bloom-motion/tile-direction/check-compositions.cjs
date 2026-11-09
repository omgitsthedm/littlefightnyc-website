const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('../../../../../app/node_modules/@playwright/test');
const bounds = JSON.parse(fs.readFileSync(path.join(__dirname,'asset-bounds.json'),'utf8'));
const report = { widths: {}, issues: [] };
const overlap = (a,b) => Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  for(const width of [360,393,600,834,1100,1440]) {
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   const page=await context.newPage();
   await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:63449'&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
   await page.goto('http://127.0.0.1:63449/?qa=1');
   await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(650);
   const tiles=await page.locator('#canvas .sculpture-tile').evaluateAll(es=>es.map(e=>{
    const r=e.getBoundingClientRect();
    const rect=el=>{if(!el)return null;const b=el.getBoundingClientRect();return{x:b.x-r.x,y:b.y-r.y,width:b.width,height:b.height}};
    const img=e.querySelector('.sculpture-art img');
    const text=[]; const walker=document.createTreeWalker(e.querySelector('.sculpture-copy'),NodeFilter.SHOW_TEXT);let n;
    while(n=walker.nextNode()) {if(n.parentElement.closest('[aria-hidden=true],.sr-only'))continue;const range=document.createRange();range.selectNodeContents(n);for(const b of range.getClientRects())if(b.width&&b.height)text.push({text:n.textContent,x:b.x-r.x,y:b.y-r.y,width:b.width,height:b.height});}
    const st=img?getComputedStyle(img):null;
    return {id:e.dataset.answer,width:r.width,height:r.height,image:rect(img),fit:st?.objectFit,position:st?.objectPosition,plus:rect(e.querySelector('.sculpture-plus')),text};
   }));
   for(const t of tiles){
    for(const r of t.text)if(r.x < -1 || r.y < -1 || r.x+r.width>t.width+1 || r.y+r.height>t.height+1)report.issues.push({width,id:t.id,kind:'text outside tile',rect:r});
    if(!t.image)continue;
    if(t.image.width<1||t.image.height<1){report.issues.push({width,id:t.id,kind:'invisible artwork'});continue;}
    const src=bounds.find(b=>b.id===t.id).alphaBounds;
    const naturalRatio=src.size[0]/src.size[1];
    const factor=t.fit==='cover'?Math.max(t.image.width/src.size[0],t.image.height/src.size[1]):Math.min(t.image.width/src.size[0],t.image.height/src.size[1]);
    const dw=src.size[0]*factor,dh=src.size[1]*factor;
    const pos=t.position.split(' ').map(v=>parseFloat(v)/100);
    const drawX=t.image.x+(t.image.width-dw)*pos[0],drawY=t.image.y+(t.image.height-dh)*pos[1];
    const [l,top,r,b]=src.fractions;
    let opaque={x:drawX+dw*l,y:drawY+dh*top,width:dw*(r-l),height:dh*(b-top)};
    // Approved cover crops may reach the edge, but still need clear text and controls.
    if(t.fit==='cover'){
     const x=Math.max(opaque.x,t.image.x),y=Math.max(opaque.y,t.image.y);
     opaque={x,y,width:Math.max(0,Math.min(opaque.x+opaque.width,t.image.x+t.image.width)-x),height:Math.max(0,Math.min(opaque.y+opaque.height,t.image.y+t.image.height)-y)};
    }
    t.opaque=opaque;
    if(t.fit!=='cover'&&(opaque.x < 1 || opaque.y < 1 || opaque.x+opaque.width>t.width-1 || opaque.y+opaque.height>t.height-1))report.issues.push({width,id:t.id,kind:'opaque artwork reaches clipped edge',opaque,tile:[t.width,t.height]});
    for(const r of t.text)if(overlap(opaque,r)>8)report.issues.push({width,id:t.id,kind:'artwork bounds overlap copy',text:r.text,area:overlap(opaque,r)});
    if(t.plus&&t.plus.width&&overlap(opaque,t.plus)>8)report.issues.push({width,id:t.id,kind:'artwork bounds overlap plus',area:overlap(opaque,t.plus)});
   }
   report.widths[width]=tiles;
   await context.close();
  }
 } finally {await browser.close();}
 fs.writeFileSync(path.join(__dirname,'composition-check.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({tiles:Object.values(report.widths).reduce((s,a)=>s+a.length,0),issues:report.issues},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
