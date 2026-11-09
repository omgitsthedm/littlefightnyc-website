const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('../../../../../app/node_modules/@playwright/test');
const phase = process.argv[2] || 'before';
const base = 'http://127.0.0.1:63449';
const out = path.join(__dirname, phase);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = { phase, widths: {}, errors: [] };
  try {
    for (const width of [1440, 393, 834]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
      await context.route('**/*', route => new URL(route.request().url()).origin === base && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', e => report.errors.push(e.message));
      await page.goto(base + '/?qa=1');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      const tiles = page.locator('#canvas .sculpture-tile');
      assert.equal(await tiles.count(), 58);
      const records = [];
      for (let i = 0; i < 58; i++) {
        const tile = tiles.nth(i);
        await tile.scrollIntoViewIfNeeded();
        await tile.evaluate(async e => { await Promise.all([...e.querySelectorAll('img')].map(img => img.decode())); });
        const r = await tile.evaluate(e => {
          const box = e.getBoundingClientRect();
          const relative = el => { if (!el) return null; const b=el.getBoundingClientRect(); return { x:b.x-box.x,y:b.y-box.y,width:b.width,height:b.height }; };
          const img=e.querySelector('.sculpture-art img');
          const title=e.querySelector('.sculpture-title');
          const copy=e.querySelector('.sculpture-copy');
          return { id:e.dataset.answer,title:title.textContent,kind:e.dataset.sculptureKind,art:e.dataset.sculptureArt,ratio:e.dataset.artRatio,family:e.dataset.family,geometry:{x:box.x,y:box.y+scrollY,width:box.width,height:box.height},copy:relative(copy),titleBox:relative(title),image:relative(img),imageSrc:img?.currentSrc,fit:img?getComputedStyle(img).objectFit:null,position:img?getComputedStyle(img).objectPosition:null,scrollOverflow:e.scrollWidth>e.clientWidth+1 || e.scrollHeight>e.clientHeight+1 };
        });
        const file = String(i+1).padStart(2,'0') + '-' + r.id + '-' + width + '.png';
        await tile.screenshot({ path:path.join(out,file),animations:'disabled' });
        records.push({index:i+1,...r,screenshot:file});
      }
      report.widths[width] = records;
      for (const section of ['sculpture-services','topic-web','topic-it','topic-consulting','topic-software']) {
        await page.locator('#'+section).scrollIntoViewIfNeeded();
        await page.screenshot({path:path.join(out,section+'-'+width+'.png')});
      }
      await context.close();
      console.log(phase+': captured every tile at '+width+'px');
    }
    assert.deepEqual(report.errors,[]);
    fs.writeFileSync(path.join(out,'tiles.json'),JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
