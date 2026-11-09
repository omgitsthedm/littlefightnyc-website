const {chromium}=require('/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/lfnyc-release-20261009/app/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const rows=[];
 for(const v of [{name:'desktop',width:1440,height:1000,deviceScaleFactor:2},{name:'phone',width:393,height:852,deviceScaleFactor:3,isMobile:true}]){
 const context=await browser.newContext({viewport:{width:v.width,height:v.height},deviceScaleFactor:v.deviceScaleFactor,isMobile:!!v.isMobile,serviceWorkers:'block'});
 await context.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
 const page=await context.newPage();await page.addInitScript(()=>{
 window.__perf={lcp:[],long:[],cls:[]};
 for(const [type,key] of [['largest-contentful-paint','lcp'],['longtask','long'],['layout-shift','cls']])try{new PerformanceObserver(l=>window.__perf[key].push(...l.getEntries().map(e=>({...e.toJSON(),element:e.element?.outerHTML?.slice(0,1000)})))).observe({type,buffered:true});}catch{}
 });
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 const responses=[];cdp.on('Network.responseReceived',e=>responses.push({url:e.response.url,mimeType:e.response.mimeType,status:e.response.status,headers:e.response.headers}));
 await page.goto('https://littlefightnyc.com/',{waitUntil:'networkidle'});await page.waitForTimeout(1500);
 let cold=await page.evaluate(()=>({nav:performance.getEntriesByType('navigation')[0].toJSON(),resources:performance.getEntriesByType('resource').map(r=>r.toJSON()),...window.__perf,images:[...document.images].map(i=>({src:i.currentSrc,loading:i.loading,w:i.width,h:i.height,nw:i.naturalWidth,nh:i.naturalHeight,top:i.getBoundingClientRect().top})),css:document.styleSheets.length,dom:document.getElementsByTagName('*').length}));
 await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(500);
 const uncachedRepeat=await page.evaluate(()=>({nav:performance.getEntriesByType('navigation')[0].toJSON(),...window.__perf}));
 rows.push({v,cold,uncachedRepeat,responses});await context.close();
 }
 await browser.close();fs.writeFileSync('/tmp/lfnyc-audit-20261009/performance/network.json',JSON.stringify(rows,null,2));
 console.log(rows.map(r=>({v:r.v.name,resources:r.cold.resources.length,totalTransfer:r.cold.resources.reduce((n,x)=>n+x.transferSize,0),lcp:r.cold.lcp.at(-1),longTasks:r.cold.long.length,cls:r.cold.cls.filter(x=>!x.hadRecentInput).reduce((n,x)=>n+x.value,0),largest:r.cold.resources.sort((a,b)=>b.transferSize-a.transferSize).slice(0,12).map(x=>({url:x.name,bytes:x.transferSize,duration:x.duration}))})));
})().catch(e=>{console.error(e);process.exit(1)});
