#!/usr/bin/env node
/* Measure the homepage mosaic engine at every viewport width and save its
 * output so the browser can apply it instead of measuring on load.
 *
 *   npm run build && node scripts/generate-mosaic-layouts.cjs
 *
 * Runs the real engine (preview-ui/vendor/mosaic-layout.js) in installed
 * Chrome and Playwright WebKit against the built dist/, from 320 to 2560px.
 * Each width starts from the authored markup, so the result is the same as a
 * fresh load at that width. Only attributes the engine itself writes are
 * recorded. The build publishes the map only while its signature (canvas markup,
 * home.css, the engine's packing code) still matches; otherwise the live engine runs.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, webkit } = require('playwright');

const APP = path.resolve(__dirname, '..');
const DIST = path.join(APP, 'dist');
const OUT = path.join(APP, 'preview-content/mosaic-layouts.json');
const MIN = Number(process.env.LAYOUT_MIN || 320);
const MAX = Number(process.env.LAYOUT_MAX || 2560);
const STEP = Number(process.env.LAYOUT_STEP || 1);
const SELECTOR = '[data-topic-grid], [data-topic-grid] > *, [data-topic-grid] > * .cell-face';
const ATTRIBUTES = ['aria-label', 'data-cells', 'data-collection-layout', 'data-collection-narrow', 'data-collection-wide',
  'data-columns', 'data-editorial-content-rows', 'data-editorial-content-signature', 'data-editorial-stack', 'data-grid-revision',
  'data-narrow-compact', 'data-pack-base-columns', 'data-pack-base-rows', 'data-pack-repairs', 'data-pack-vacancies', 'data-rows',
  'data-shape', 'data-short-label', 'data-tile-count', 'data-wrap-word'];
const STYLES = ['--cell-unit', '--sculpture-art-top', '--tile-columns', 'gap', 'grid-column', 'grid-column-end', 'grid-column-start',
  'grid-row', 'grid-row-end', 'grid-row-start', 'grid-template-columns', 'grid-template-rows', 'width'];
const CLASSES = ['is-large-text'];
const KEYS = [...STYLES.map(name => 's:' + name), ...ATTRIBUTES.map(name => 'a:' + name), ...CLASSES.map(name => 'c:' + name)];

const signatureOf = (html, css, engine) => {
  const start = html.indexOf('<main class="topic-canvas"');
  const end = html.indexOf('</main>', start);
  if (start < 0 || end < 0) throw new Error('Homepage canvas not found');
  return crypto.createHash('sha256').update(html.slice(start, end)).update('\0').update(css).update('\0').update(engine).digest('hex');
};

function serve() {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
  const server = http.createServer((request, response) => {
    let file = path.join(DIST, decodeURIComponent(new URL(request.url, 'http://x').pathname));
    if (!file.startsWith(DIST)) { response.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function measure(type, name, base) {
  const browser = await type.launch(name === 'blink' ? { channel: 'chrome', headless: true } : { headless: true });
  const context = await browser.newContext({ viewport: { width: MAX, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await context.addInitScript(() => { window.__LF_LAYOUT_GENERATOR = true; });
  const page = await context.newPage();
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const setup = await page.evaluate(async ({ SELECTOR, KEYS }) => {
    const html = await (await fetch('/', { cache: 'no-store' })).text();
    const authored = new DOMParser().parseFromString(html, 'text/html');
    const canvas = document.querySelector('#canvas');
    const live = [canvas, ...canvas.querySelectorAll(SELECTOR)];
    const pristineCanvas = authored.querySelector('#canvas');
    const pristine = [pristineCanvas, ...pristineCanvas.querySelectorAll(SELECTOR)];
    if (live.length !== pristine.length) return { error: `element count ${live.length} vs authored ${pristine.length}` };
    const keys = KEYS.map(key => ({ kind: key[0], name: key.slice(2) }));
    const read = (element, { kind, name }) => {
      if (kind === 's') { const value = element.style.getPropertyValue(name); return value ? value + (element.style.getPropertyPriority(name) ? ' !important' : '') : null; }
      if (kind === 'c') return element.classList.contains(name) ? '1' : '0';
      return element.getAttribute(name);
    };
    const write = (element, { kind, name }, value) => {
      if (kind === 's') { if (value === null) element.style.removeProperty(name); else element.style.setProperty(name, value.replace(/ !important$/, ''), value.endsWith(' !important') ? 'important' : ''); }
      else if (kind === 'c') element.classList.toggle(name, value === '1');
      else if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
    };
    const baseline = pristine.map(element => keys.map(key => read(element, key)));
    window.__lfLayoutProbe = {
      reset() { live.forEach((element, index) => keys.forEach((key, k) => write(element, key, baseline[index][k]))); },
      snapshot() {
        const diff = [];
        live.forEach((element, index) => keys.forEach((key, k) => {
          const value = read(element, key);
          if (value !== baseline[index][k]) diff.push([index, k, value]);
        }));
        const cards = [...canvas.querySelectorAll('[data-topic-grid] > .tile')];
        const spill = cards.flatMap((card, index) => card.scrollHeight > card.clientHeight + 2 || card.scrollWidth > card.clientWidth + 2 ? [index] : []);
        return { diff, spill };
      },
    };
    return { elements: live.length, rootFontSize: getComputedStyle(document.documentElement).fontSize, scrollbar: innerWidth - document.documentElement.clientWidth };
  }, { SELECTOR, KEYS });
  if (setup.error) throw new Error(`${name}: ${setup.error}`);
  const results = [];
  for (let width = MIN; width <= MAX; width += STEP) {
    await page.setViewportSize({ width, height: 900 });
    const result = await page.evaluate(async () => {
      const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
      await frame(); await frame();
      window.__lfLayoutProbe.reset();
      window.LF_MOSAIC.layout({ force: true });
      // Let content observers deliver any follow-up pass, as a real load would.
      let quiet = 0;
      const observer = new MutationObserver(() => { quiet = 0; });
      observer.observe(document.querySelector('#canvas'), { attributes: true, subtree: true });
      for (let i = 0; i < 30 && quiet < 3; i += 1) { await frame(); quiet += 1; }
      observer.disconnect();
      return window.__lfLayoutProbe.snapshot();
    });
    results.push({ width, ...result });
    if (width % 160 === 0) process.stdout.write(`${name} ${width}px\n`);
  }
  await browser.close();
  return { setup, results };
}

(async () => {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(DIST, 'home.css'), 'utf8');
  // Only the packing code decides layouts; the loader below it may change freely.
  const engine = fs.readFileSync(path.join(APP, 'preview-ui/vendor/mosaic-layout.js'), 'utf8').split("  let layoutKey = '';")[0];
  const signature = signatureOf(html, css, engine);
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const values = []; const valueIndex = new Map();
  const intern = value => { if (value === null) return -1; if (!valueIndex.has(value)) { valueIndex.set(value, values.length); values.push(value); } return valueIndex.get(value); };
  // Every layout becomes one integer vector over the slots the engine ever
  // writes (-2 = authored value, -1 = absent, n = values[n]). Identical
  // layouts are shared between Chrome and WebKit.
  const measured = {};
  let reference;
  try {
    for (const [name, type] of [['blink', chromium], ['webkit', webkit]]) {
      const run = await measure(type, name, base);
      reference ||= run.setup;
      for (const field of ['elements', 'rootFontSize', 'scrollbar']) {
        if (run.setup[field] !== reference[field]) throw new Error(`${name} ${field} ${run.setup[field]} differs from ${reference[field]}`);
      }
      measured[name] = run.results;
    }
  } finally {
    server.close();
  }
  const touched = new Set();
  Object.values(measured).forEach(results => results.forEach(({ diff }) => diff.forEach(([index, key]) => touched.add(index * KEYS.length + key))));
  const slots = [...touched].sort((a, b) => a - b);
  const slotIndex = new Map(slots.map((slot, i) => [slot, i]));
  const states = []; const spill = []; const stateIndex = new Map();
  const output = { schema: 2, signature, selector: SELECTOR, keys: KEYS, range: [MIN, MAX], elements: reference.elements,
    rootFontSize: reference.rootFontSize, scrollbar: reference.scrollbar,
    touched: slots.map(slot => [Math.floor(slot / KEYS.length), slot % KEYS.length]), values, states, spill, engines: {} };
  for (const [name, results] of Object.entries(measured)) {
    const ranges = [];
    for (const { width, diff, spill: spilled } of results) {
      const vector = new Array(slots.length).fill(-2);
      diff.forEach(([index, key, value]) => { vector[slotIndex.get(index * KEYS.length + key)] = intern(value); });
      const id = vector.join(',') + '|' + spilled.join(',');
      if (!stateIndex.has(id)) { stateIndex.set(id, states.length); states.push(vector); spill.push(spilled); }
      const state = stateIndex.get(id);
      const last = ranges[ranges.length - 1];
      if (last && last[2] === state && last[1] === width - 1) last[1] = width + STEP - 1;
      else ranges.push([width, width + STEP - 1, state]);
    }
    output.engines[name] = { ranges };
    console.log(`${name}: ${results.length} widths in ${ranges.length} ranges`);
  }
  console.log(`${states.length} distinct layouts across both engines over ${slots.length} engine-written slots`);
  fs.writeFileSync(OUT, JSON.stringify(output) + '\n');
  console.log(`Wrote ${path.relative(APP, OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB, signature ${signature.slice(0, 12)})`);
})().catch(error => { console.error(error); process.exit(1); });
