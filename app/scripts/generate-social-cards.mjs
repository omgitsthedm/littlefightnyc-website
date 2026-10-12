/** Render the current reader catalog with the installed Chrome; no hosted builds. */
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(app, '..');
const publicRoot = path.join(app, 'public');
const evidence = path.join(root, '.lifi/evidence/social-cards');
const manifestFile = path.join(app, 'preview-content/social-cards.json');
const output = path.join(publicRoot, 'assets/social/clay');
const origin = 'https://littlefightnyc.com';
const only = process.argv.find(value => value.startsWith('--only='))?.slice(7);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const decode = value => String(value ?? '').replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, c => c.startsWith('&#') ? String.fromCodePoint(parseInt(c.slice(c[2].toLowerCase()==='x'?3:2,-1), c[2].toLowerCase()==='x'?16:10)) : ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"})[c]);
const attr = (tag, key) => decode(tag.match(new RegExp(`\\b${key}=(['"])([\\s\\S]*?)\\1`, 'i'))?.[2]);

function meta(html, key) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)].find(m => attr(m[0], 'property') === key || attr(m[0], 'name') === key);
  return tag ? attr(tag[0], 'content') : '';
}
function canonical(html) {
  const tag = [...html.matchAll(/<link\b[^>]*>/gi)].find(m => attr(m[0], 'rel') === 'canonical');
  return tag ? attr(tag[0], 'href') : '';
}
async function files(directory) {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes:true })) {
    const p = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...await files(p)); else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

await mkdir(evidence, { recursive:true });
await mkdir(output, { recursive:true });
// The compiler exports exactly the copy and artwork it uses, including hidden readers.
execFileSync('python3', ['scripts/build-tile-preview.py', '--production'], { cwd:app, stdio:'pipe' });
// Match the production build order: VERA's authored prerender replaces the
// imported manual/archive snapshots before their final metadata is collected.
execFileSync(process.execPath, ['scripts/vera-prerender.mjs'], { cwd:app, stdio:'pipe' });
const plan = JSON.parse(await readFile(path.join(evidence, 'plan.json'), 'utf8')).cards;
const previous = JSON.parse(await readFile(manifestFile, 'utf8').catch(() => '{"cards":{}}'));
const standalone = [];
for (const prefix of ['examples', 'vera', 'ads', 'myspace-demo']) {
  for (const file of await files(path.join(publicRoot, prefix))) {
    const html = await readFile(file, 'utf8');
    if (file.endsWith('/404.html')) continue;
    const relative = path.relative(publicRoot, file).split(path.sep).join('/');
    const route = '/'+relative.replace(/index\.html$/, '');
    const destination = canonical(html) || origin+route;
    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'Little Fight NYC');
    let description = meta(html, 'description') || meta(html, 'og:description');
    const lab = route.match(/^\/examples\/lab\/concepts\/([^/]+)\//);
    const matchingLab = lab && plan['/labs/'+lab[1]+'/'];
    let card = matchingLab ? { ...matchingLab } : plan[route];
    if (!card || route.startsWith('/vera/')) {
      const oldImage = previous.cards[route]?.artSource || meta(html, 'og:image');
      const image = oldImage.startsWith(origin) ? new URL(oldImage).pathname : oldImage.startsWith('/') ? oldImage : '';
      card = { path:route, title, description, headline:title.replace(/\s*[|—·].*$/, ''),
        mode:image ? 'screen' : 'clay', image:image || '/assets/clay-png/object-software.png',
        artAlt:(previous.cards[route]?.artAlt || meta(html, 'og:image:alt') || 'A handmade clay model of connected software tools.').split(' Text: ')[0],
        label:'Little Fight Lab', color:'#f09bdd' };
      if (route.startsWith('/vera/')) {
        card = { ...card, label:'VERA · NYC rental intelligence', color:'#a0df85',
          mode:'clay', image:'/assets/clay-png/object-vera-brownstone.png',
          artAlt:'A handmade clay New York brownstone.',
          headline: route === '/vera/' ? 'NYC rentals.\nOn the record.' : title.replace(/\s*—\s*VERA$/, '') };
      } else if (route.startsWith('/examples/audit/')) {
        card = { ...card, label:'Website Audit Lab', mode:'clay', image:'/assets/clay-png/object-homepage-sketchbook.png',
          artAlt:'A handmade clay sketchbook showing a website layout.' };
      } else if (route.startsWith('/examples/lab/suites/')) {
        card = { ...card, mode:'clay', image:'/assets/clay-png/object-software.png' };
      }
    }
    description ||= card.description || 'An illustrative Little Fight NYC design study. Explore the working example.';
    // A copied engine URL can still have a rich card, without changing its runtime or crawl policy.
    plan[route] = { ...card, path:route, title, description };
    standalone.push({ file, route, canonical:destination, description, hadCanonical:!!canonical(html), html });
  }
}
// Prerendered VERA resources use their own headline with the product's brownstone.
for (const slug of ['manual','archive']) {
  const html = await readFile(path.join(app, 'dist/vera', slug, 'index.html'), 'utf8');
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  plan['/vera/'+slug+'/'] = { ...plan['/vera/'], path:'/vera/'+slug+'/', title,
    description:meta(html, 'description'), headline:title.replace(/\s*—\s*VERA$/, '') };
}
const homeHTML = await readFile(path.join(app, 'dist/index.html'), 'utf8');
const clayCSS = await readFile(path.join(app, 'preview-ui/sculpture.css'), 'utf8');
const artCache = new Map();
async function assetHash(url) {
  if (artCache.has(url)) return artCache.get(url);
  const source = path.join(app, 'dist', decodeURIComponent(url.split('?')[0]));
  const hash = createHash('sha256').update(await readFile(source)).digest('hex');
  artCache.set(url, hash); return hash;
}

const server = createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/__social-card.html') { res.writeHead(200, {'Content-Type':'text/html'});res.end('<!doctype html><html><head></head><body></body></html>');return; }
    const source = path.resolve(app, 'dist', '.'+pathname);
    if (!source.startsWith(path.join(app,'dist')+path.sep)) throw new Error('Invalid path');
    const body = await readFile(source);
    const mime = {'.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.css':'text/css'}[path.extname(source)] || 'text/html';
    res.writeHead(200, {'Content-Type':mime});res.end(body);
  } catch { res.writeHead(404);res.end(); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const local = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel:'chrome', headless:true });
const context = await browser.newContext({ viewport:{width:1200,height:630}, deviceScaleFactor:2, reducedMotion:'reduce' });
const page = await context.newPage();
const broken = [];
page.on('requestfailed', request => broken.push(request.url()));
await page.goto(local+'/__social-card.html');
await page.setContent(homeHTML.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace('<head>', `<head><base href="${local}/">`));
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
broken.length=0;
const scene = await page.locator('.clay-neighborhood').evaluate(node => {
  const copy = node.cloneNode(true);
  // Cards are a deliberately still composition, using native source assets.
  copy.querySelectorAll('source').forEach(el => el.remove());
  copy.querySelectorAll('[srcset]').forEach(el => { el.removeAttribute('srcset');el.removeAttribute('sizes'); });
  copy.querySelectorAll('img').forEach(el => {el.loading='eager';});
  return copy.outerHTML;
});
const browserScene = await page.locator('.clay-neighborhood .hero-main').evaluate(node => {const copy=node.cloneNode(true);copy.querySelectorAll('source').forEach(el=>el.remove());return copy.outerHTML;});
const sceneAssets = [...new Set([...scene.matchAll(/\bsrc="([^"]+)"/g)].map(match=>match[1]))];
const sceneHashes = await Promise.all(sceneAssets.map(assetHash));
const fontHash = await assetHash('/assets/mineral/atkinson-hyperlegible-next-latin.woff2');
const sceneHash = createHash('sha256').update(scene+clayCSS+sceneHashes.join('')).digest('hex');
const css = `
@font-face{font-family:Atkinson;src:url('/assets/mineral/atkinson-hyperlegible-next-latin.woff2') format('woff2');font-weight:100 900}
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#101515;color:#f5f3ec;font-family:Atkinson,sans-serif;-webkit-font-smoothing:antialiased}
.card{position:relative;width:1200px;height:630px;background:#101515;isolation:isolate;overflow:hidden}
.brand{position:absolute;left:56px;top:43px;display:flex;align-items:center;gap:12px;font-size:26px;font-weight:750;letter-spacing:-.6px}
.brand img{width:49px;height:36px;object-fit:contain}.category{position:absolute;left:58px;top:135px;max-width:525px;font-size:21px;font-weight:700;color:var(--accent);line-height:1.2}
.copy{position:absolute;left:56px;top:185px;width:536px;height:242px;display:flex;align-items:flex-start}
h1{font-size:64px;line-height:1.02;font-weight:750;letter-spacing:-2.2px;margin:0;white-space:pre-line;text-wrap:balance;width:100%}
.note{position:absolute;left:58px;top:451px;width:520px;max-height:99px;margin:0;font-size:24px;line-height:1.26;color:#c7ceca;white-space:pre-line;text-wrap:pretty}
.url{position:absolute;left:58px;bottom:36px;font-size:19px;color:#d8ded9;letter-spacing:.2px}.signal{position:absolute;bottom:39px;right:57px;width:65px;height:5px;border-radius:4px;background:var(--accent)}
.art{position:absolute;left:600px;top:125px;width:558px;height:424px;display:grid;place-items:center}
.art>.object{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 22px 16px #0005)}
.screen{position:absolute;left:622px;top:156px;width:522px;padding:12px;background:#333d39;border-radius:23px;box-shadow:0 20px 35px #0006,inset 0 1px 0 #ffffff30;transform:rotate(-3deg)}
.screen .chrome{height:25px;display:flex;gap:6px;align-items:center;padding-left:5px}.chrome i{width:7px;height:7px;border-radius:50%;background:#a7b4ac}.screen img{display:block;width:100%;height:326px;object-fit:cover;object-position:center top;border-radius:11px;outline:1px solid #ffffff1a}
.scene{position:absolute;left:575px;top:162px;width:590px;height:360px}.scene .sculpture-hero-stage{position:relative;width:100%;height:auto;aspect-ratio:1.82;margin:0;--depth-x:0px;--depth-y:0px}
${clayCSS}
.scene *{animation:none!important;transition:none!important}.scene .clay-room-link{display:none}.scene .clay-pigeon{min-width:0;min-height:0}.scene .clay-pose{opacity:0}.scene .clay-cat-0,.scene .clay-pigeon-pose-0{opacity:1}
.web-browser{position:absolute;left:610px;top:157px;width:545px;--depth-x:0px;--depth-y:0px}.web-browser .hero-main{position:relative;left:0;top:0;width:100%;rotate:-4deg}
.home .category{top:115px}.home .copy{top:155px;width:560px;height:258px}.home h1{font-size:68px;letter-spacing:-2.5px}.home .note{top:447px;font-size:27px;width:485px}.home .scene{left:566px;top:192px;width:600px}
`;
const rendered = {};
let created = 0;
try {
  for (const [route, spec] of Object.entries(plan)) {
    const signature = createHash('sha256').update(JSON.stringify(spec)+css+fontHash+(['hero','browser'].includes(spec.mode) ? sceneHash : await assetHash(spec.image))).digest('hex');
    const old = previous.cards[route];
    if (only && !only.split(',').includes(route)) { if (old) rendered[route]=old; continue; }
    if (old?.signature === signature && await stat(path.join(publicRoot, old.image)).catch(() => false)) {rendered[route]=old;continue;}
    const art = spec.mode === 'hero' ? `<div class="scene">${scene}</div>` : spec.mode === 'browser' ? `<div class="clay-neighborhood web-browser">${browserScene}</div>` : spec.mode === 'screen' ?
      `<div class="screen"><div class="chrome"><i></i><i></i><i></i></div><img src="${esc(spec.image)}" alt=""></div>` :
      `<div class="art"><img class="object" src="${esc(spec.image)}" alt=""></div>`;
    await page.setContent(`<!doctype html><html lang="en"><head><base href="${local}/"><meta charset="utf-8"><style>${css}</style></head><body><main class="card ${route==='/'?'home':''}" style="--accent:${spec.color}"><div class="brand"><img src="/assets/boat-orange.svg" alt="">little fight NYC</div><div class="category">${esc(spec.label)}</div><div class="copy"><h1>${esc(spec.headline)}</h1></div><p class="note">${esc(spec.note || spec.description)}</p>${art}<div class="url">littlefightnyc.com</div><div class="signal"></div></main></body></html>`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(img => img.decode()));
      const title = document.querySelector('h1');
      while(title.getBoundingClientRect().height > 242 && parseFloat(getComputedStyle(title).fontSize)>35) title.style.fontSize=(parseFloat(getComputedStyle(title).fontSize)-1)+'px';
      const note = document.querySelector('.note');
      while(note.scrollHeight>99 && parseFloat(getComputedStyle(note).fontSize)>19) note.style.fontSize=(parseFloat(getComputedStyle(note).fontSize)-1)+'px';
      if(title.getBoundingClientRect().height>248 || note.scrollHeight>103) throw new Error('Card copy does not fit');
    });
    const image = '/assets/social/clay/'+(route==='/'?'home':route.replace(/^\/+|\/+$/g,'').replace(/[^a-z0-9-]+/gi,'-'))+'-'+signature.slice(0,12)+'.jpg';
    await page.screenshot({path:path.join(publicRoot,image),type:'jpeg',quality:90});
    const bytes = await readFile(path.join(publicRoot,image));
    rendered[route] = { ...spec, image, artSource:spec.mode==='hero'?'approved-clay-hero':spec.mode==='browser'?'/assets/portfolio-20261007/chromatic-painting-design-desktop.webp':spec.image,
      width:2400,height:1260,type:'image/jpeg',bytes:bytes.length,
      alt:`${spec.artAlt} Text: ${spec.headline.replaceAll('\n',' ')} Little Fight NYC.`,
      sha256:createHash('sha256').update(bytes).digest('hex'),signature };
    created++;
    if(created%50===0) console.log(`Rendered ${created} cards…`);
  }
  if(broken.length) throw new Error('Failed card requests: '+broken.slice(0,5).join(', '));
  const protectedDocuments = { ...previous.protectedDocuments };
  if (!only) {
    for (const doc of standalone) {
      const card = rendered[doc.route];
      if (!card) throw new Error('Missing standalone card: '+doc.route);
      let html = doc.html.replace(/\s*<meta\b[^>]*(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+)["'][^>]*>/gi,'');
      const tags = {'og:type':'website','og:title':card.title,'og:description':doc.description,'og:url':doc.canonical,'og:site_name':doc.route.startsWith('/vera/')?'VERA':'Little Fight NYC','og:locale':'en_US','og:image':origin+card.image,'og:image:secure_url':origin+card.image,'og:image:type':card.type,'og:image:width':card.width,'og:image:height':card.height,'og:image:alt':card.alt,'twitter:card':'summary_large_image','twitter:title':card.title,'twitter:description':doc.description,'twitter:image':origin+card.image,'twitter:image:alt':card.alt};
      let block = Object.entries(tags).map(([key,value])=>`<meta ${key.startsWith('og:')?'property':'name'}="${key}" content="${esc(value)}">`).join('\n');
      if(!doc.hadCanonical) block+=`\n<link rel="canonical" href="${esc(doc.canonical)}">`;
      if(!meta(html,'robots') && !doc.hadCanonical) block+='\n<meta name="robots" content="noindex, follow">';
      if(!meta(html,'description')) block+=`\n<meta name="description" content="${esc(doc.description)}">`;
      html=/<\/head>/i.test(html) ? html.replace(/<\/head>/i,block+'\n</head>') : html.replace(/<body\b/i,block+'\n</head><body');
      if (doc.html.slice(doc.html.indexOf('<body')) !== html.slice(html.indexOf('<body'))) throw new Error('Share metadata must not alter a standalone page body');
      await writeFile(doc.file,html);
    }
  }
  if (!only) {
    // Farm House's reviewed fixtures are exact-byte build inputs. Update only
    // their head metadata, proving the interactive body stays byte-identical.
    const fixture = path.join(root,'.lifi/design-source/farm-house-public-v1/index.html');
    const inside = path.join(app,'scripts/property-explorer/inside/index.html');
    for (const [source, relative] of [[fixture,'index.html'],[inside,'inside/index.html']]) {
      const before = await readFile(source,'utf8');
      const after = await readFile(path.join(publicRoot,'examples/lab/concepts/house-explorer',relative),'utf8');
      if (before.slice(before.indexOf('<body')) !== after.slice(after.indexOf('<body'))) throw new Error('Social metadata must not alter the Farm House body');
      await writeFile(source,after);
    }
    const contractFile=path.join(app,'scripts/property-explorer/farm-house-public.json');
    const contract=JSON.parse(await readFile(contractFile,'utf8'));
    contract.publicFixture.htmlSha256=createHash('sha256').update(await readFile(fixture)).digest('hex');
    for (const relative of ['index.html','inside/index.html']) contract.artifactHashes[relative]=createHash('sha256').update(await readFile(path.join(publicRoot,'examples/lab/concepts/house-explorer',relative))).digest('hex');
    await writeFile(contractFile,JSON.stringify(contract,null,2)+'\n');

    // VERA keeps its existing source pins. Only these five HTML heads change;
    // preserve separate body pins so future card refreshes cannot bless UI edits.
    const baseline = JSON.parse(await readFile(path.join(root,'.lifi/design-source/sculpture/previous-site.json'),'utf8'));
    const approved = JSON.parse(await readFile(path.join(root,'.lifi/design-source/sculpture/clay-release.json'),'utf8'));
    const originalHashes = { ...baseline.protectedVera, ...approved.protectedVeraCopyOverrides };
    for (const doc of standalone.filter(doc => doc.route.startsWith('/vera/'))) {
      const relative = path.relative(publicRoot,doc.file).split(path.sep).join('/');
      const html = await readFile(doc.file,'utf8');
      const bodySha256 = createHash('sha256').update(html.slice(html.indexOf('<body'))).digest('hex');
      const pin = protectedDocuments[relative];
      if (pin && (pin.bodySha256 !== bodySha256 || pin.baselineSha256 !== originalHashes[relative])) throw new Error('VERA body or approved baseline changed: '+relative);
      protectedDocuments[relative] = { baselineSha256:originalHashes[relative], bodySha256,
        sha256:createHash('sha256').update(html).digest('hex') };
    }
  }
  await writeFile(manifestFile,JSON.stringify({format:'lfnyc-clay-share-v1',cards:rendered,protectedDocuments},null,2)+'\n');
  const priorities=['/','/services/custom-local-websites/','/services/it-support/','/services/tech-consulting/','/services/business-systems/','/case-studies/hair-by-rachel-charles/','/case-studies/chromatic-painting-design/','/labs/pool-room/'];
  const sorted=Object.values(rendered).sort((a,b)=>(priorities.includes(a.path)?priorities.indexOf(a.path):99)-(priorities.includes(b.path)?priorities.indexOf(b.path):99)||a.path.localeCompare(b.path));
  const gallery=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Little Fight NYC — share cards</title><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#101515;color:#f5f3ec;font:17px/1.5 system-ui}header{max-width:1100px;margin:0 auto 32px}h1{font-size:42px;line-height:1.1}input{width:100%;padding:14px;border-radius:10px;border:1px solid #526058;background:#202a25;color:inherit;font:inherit}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;max-width:1500px;margin:auto}article{min-width:0}img{display:block;width:100%;height:auto;aspect-ratio:1200/630;border-radius:14px;outline:1px solid #ffffff20}a{color:inherit;text-decoration:none}p{margin:10px 0;overflow-wrap:anywhere;color:#c7ceca}small{color:#a0df85}@media(max-width:760px){body{padding:20px}main{grid-template-columns:1fr}h1{font-size:32px}}</style></head><body><header><small>LOCAL REVIEW · ${sorted.length} CARDS · 2400 × 1260</small><h1>The same little world.<br>Everywhere you share it.</h1><p>Finished share artwork for the website. Client cards show the real work. The previews below are local; social apps choose their own surrounding layout.</p><label for="filter">Find a page</label><input id="filter" type="search" placeholder="Try tech support, Rachel, booking…"></header><main>${sorted.map(c=>`<article data-search="${esc((c.path+' '+c.title).toLowerCase())}"><a href="${esc(c.image)}" target="_blank"><img src="${esc(c.image)}" width="2400" height="1260" loading="lazy" alt="${esc(c.alt)}"></a><p>${esc(c.path)}</p></article>`).join('')}</main><script>document.querySelector('input').addEventListener('input',event=>{const query=event.target.value.toLowerCase();document.querySelectorAll('article').forEach(card=>card.hidden=!card.dataset.search.includes(query))});</script></body></html>`;
  await writeFile(path.join(evidence,'index.html'),gallery);
  console.log(JSON.stringify({cards:Object.keys(rendered).length,created,standaloneDocuments:only?0:standalone.length,gallery:path.join(evidence,'index.html')}));
} finally { await browser.close();await new Promise(resolve=>server.close(resolve)); }
