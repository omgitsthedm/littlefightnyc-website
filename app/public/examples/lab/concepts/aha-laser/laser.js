/* laser.js — Brand as light.
   A laser head traces AHA's actual letterform vectors (POSTER_PATHS), each
   element catches like real neon when its trace completes, and the whole
   sign hangs on a pull-chain with spring physics. Brand is law: the pink
   is #ff2bd6 tip to bloom, the geometry is the client's own. */

const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SVGNS = 'http://www.w3.org/2000/svg';

const room = $('[data-room]');
const svg = $('[data-svg]');
const chain = $('[data-chain]');

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TESTMODE = new URLSearchParams(location.search).has('test');
const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };

const PATHS = window.POSTER_PATHS || {};
for (const k of ['aha', 'script', 'est', 'nyc']) {
  if (!PATHS[k] || !PATHS[k].d) throw new Error(`Missing brand path: ${k}`);
}

/* ---------- build the sign ---------- */

function el(name, attrs = {}, parent = null) {
  const node = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

/* defs: brand gradient + glow filters */
const defs = el('defs', {}, svg);
const grad = el('linearGradient', { id: 'tubePink', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
el('stop', { offset: '0', 'stop-color': '#ff9af2' }, grad);
el('stop', { offset: '0.55', 'stop-color': '#ff2bd6' }, grad);
el('stop', { offset: '1', 'stop-color': '#ff67ea' }, grad);

const glow = el('filter', { id: 'tubeGlow', x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
el('feGaussianBlur', { stdDeviation: '7', result: 'b' }, glow);
const gm = el('feMerge', {}, glow);
el('feMergeNode', { in: 'b' }, gm);
el('feMergeNode', { in: 'SourceGraphic' }, gm);

const bigGlow = el('filter', { id: 'bloomGlow', x: '-120%', y: '-120%', width: '340%', height: '340%' }, defs);
el('feGaussianBlur', { stdDeviation: '20' }, bigGlow);

const headGlow = el('filter', { id: 'headGlow', x: '-300%', y: '-300%', width: '700%', height: '700%' }, defs);
el('feGaussianBlur', { stdDeviation: '5' }, headGlow);

/* breathing wrapper for everything lit */
const breathe = el('g', { class: 'sign__breathe' }, svg);

/* the sign frame: two rounded tubes, drawn like everything else */
const FRAME_PATHS = [
  'M46 30 H1154 Q1170 30 1170 46 V804 Q1170 820 1154 820 H46 Q30 820 30 804 V46 Q30 30 46 30 Z',
  'M64 50 H1136 Q1150 50 1150 64 V786 Q1150 800 1136 800 H64 Q50 800 50 64 V64 Q50 50 64 50 Z',
];
/* fix inner frame path (typo-proof, rebuilt cleanly) */
FRAME_PATHS[1] = 'M64 50 H1136 Q1150 50 1150 64 V786 Q1150 800 1136 800 H64 Q50 800 50 786 V64 Q50 50 64 50 Z';

/* layout slots: centered composition, measured after mount via getBBox */
const SLOTS = {
  frameOuter: null,
  frameInner: null,
  aha: { cx: 600, cy: 275, width: 620 },
  script: { cx: 600, cy: 535, width: 800 },
  est: { cx: 600, cy: 662, width: 350 },
  nyc: { cx: 600, cy: 722, width: 430 },
};

const tubes = [];

function makeTube(key, d, { strokeW = 2.4, fillIt = true, slot = null } = {}) {
  const g = el('g', { class: 'tube', 'data-tube': key }, breathe);
  const bloom = el('path', { d, class: 'tube__bloom', fill: fillIt ? 'url(#tubePink)' : 'none', stroke: fillIt ? 'none' : '#ff2bd6', 'stroke-width': fillIt ? 0 : strokeW * 3.4, filter: 'url(#bloomGlow)' }, g);
  const fill = el('path', { d, class: 'tube__fill', fill: fillIt ? 'url(#tubePink)' : 'none', stroke: fillIt ? '#ffd0f7' : '#ff2bd6', 'stroke-width': fillIt ? 1.2 : strokeW, filter: 'url(#tubeGlow)' }, g);
  const trace = el('path', { d, class: 'tube__trace', fill: 'none', stroke: '#fff0fc', 'stroke-width': fillIt ? 1.6 : strokeW * 0.6, 'stroke-linecap': 'round' }, g);

  if (slot) {
    /* fit the raw glyph coordinates into the composition slot (font data is y-up → flip) */
    const bb = trace.getBBox();
    const s = slot.width / bb.width;
    const tx = slot.cx - (bb.x + bb.width / 2) * s;
    const ty = slot.cy + (bb.y + bb.height / 2) * s;
    g.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)} ${(-s).toFixed(5)})`);
    /* keep stroke widths visually constant despite scale */
    const sw = (w) => (w / s).toFixed(3);
    if (fillIt) {
      fill.setAttribute('stroke-width', sw(1.2));
      trace.setAttribute('stroke-width', sw(1.6));
    } else {
      bloom.setAttribute('stroke-width', sw(strokeW * 3.4));
      fill.setAttribute('stroke-width', sw(strokeW));
      trace.setAttribute('stroke-width', sw(strokeW * 0.6));
    }
  }

  const len = trace.getTotalLength();
  trace.style.strokeDasharray = `${len} ${len}`;
  trace.style.strokeDashoffset = String(len);

  const tube = { key, g, trace, fill, bloom, len, lit: false, scale: slot ? slot.width / trace.getBBox().width : 1 };
  tubes.push(tube);
  return tube;
}

const frameOuter = makeTube('frameOuter', FRAME_PATHS[0], { fillIt: false, strokeW: 2.6 });
const frameInner = makeTube('frameInner', FRAME_PATHS[1], { fillIt: false, strokeW: 1.6 });
const ahaTube = makeTube('aha', PATHS.aha.d, { slot: SLOTS.aha });
const scriptTube = makeTube('script', PATHS.script.d, { slot: SLOTS.script });
const estTube = makeTube('est', PATHS.est.d, { slot: SLOTS.est });
const nycTube = makeTube('nyc', PATHS.nyc.d, { slot: SLOTS.nyc });

/* the laser head — lives at the svg root, positioned in root coords */
const head = el('g', { class: 'laserhead' }, svg);
el('circle', { r: '10', fill: 'rgba(255,43,214,0.5)', filter: 'url(#headGlow)' }, head);
el('circle', { r: '3.2', fill: '#fff0fc' }, head);
const headSpark = el('circle', { r: '6', fill: 'none', stroke: 'rgba(255,240,252,0.7)', 'stroke-width': '1' }, head);

function headTo(tube, dist) {
  const p = tube.trace.getPointAtLength(clamp(dist, 0, tube.len));
  const m = tube.g.getCTM();
  const rootM = svg.getCTM() || m;
  /* convert tube-local point to viewBox coords via the group transform */
  const t = tube.g.transform.baseVal.consolidate();
  let x = p.x, y = p.y;
  if (t) {
    x = t.matrix.a * p.x + t.matrix.c * p.y + t.matrix.e;
    y = t.matrix.b * p.x + t.matrix.d * p.y + t.matrix.f;
  }
  head.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  return { x, y };
}

/* ---------- draw timeline ---------- */

const SEQ = [
  { tube: frameOuter, dur: 1.0 },
  { tube: frameInner, dur: 0.7 },
  { tube: ahaTube, dur: 1.5 },
  { tube: scriptTube, dur: 1.7 },
  { tube: estTube, dur: 0.55 },
  { tube: nycTube, dur: 0.6 },
];

let drawing = false;
let lastHeadError = 0;

function light(tube, catching = true) {
  tube.lit = true;
  tube.trace.style.strokeDashoffset = '0';
  tube.g.classList.add('is-lit');
  if (catching && !RM) {
    tube.g.classList.add('is-catching');
    setTimeout(() => tube.g.classList.remove('is-catching'), 500);
  }
}

function unlightAll() {
  for (const t of tubes) {
    t.lit = false;
    t.g.classList.remove('is-lit', 'is-catching');
    t.trace.style.strokeDashoffset = String(t.len);
  }
}

function drawSequence(done) {
  if (RM) { tubes.forEach(t => light(t, false)); room.classList.add('is-drawn'); done && done(); return; }
  drawing = true;
  head.classList.add('is-on');
  let i = 0;
  let t0 = performance.now();

  function step(now) {
    if (!drawing) return;
    const item = SEQ[i];
    const t = clamp((now - t0) / (item.dur * 1000), 0, 1);
    const dist = t * item.tube.len;
    item.tube.trace.style.strokeDashoffset = String(item.tube.len - dist);
    headTo(item.tube, dist);
    /* spark ring pulses as it cuts */
    headSpark.setAttribute('r', String(5 + Math.sin(now / 28) * 2.2));
    if (TESTMODE && item.tube === ahaTube && t > 0.4 && t < 0.6) {
      const p = item.tube.trace.getPointAtLength(dist);
      const m = item.tube.g.transform.baseVal.consolidate().matrix;
      const hx = m.a * p.x + m.c * p.y + m.e;
      const tr = head.getAttribute('transform');
      const shown = parseFloat((tr.match(/translate\(([-\d.]+)/) || [0, 0])[1]);
      lastHeadError = Math.abs(hx - shown);
    }
    if (t >= 1) {
      light(item.tube);
      i++;
      t0 = now + 120; /* beat between elements */
      if (i >= SEQ.length) {
        drawing = false;
        head.classList.remove('is-on');
        room.classList.add('is-drawn');
        done && done();
        return;
      }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* fast power-on: no re-trace, tubes catch in stagger groups */
function igniteAll(done) {
  const groups = [[frameOuter, frameInner], [ahaTube], [scriptTube], [estTube, nycTube]];
  groups.forEach((g, gi) => {
    setTimeout(() => g.forEach(t => light(t)), RM ? 0 : gi * 190);
  });
  setTimeout(() => done && done(), RM ? 60 : groups.length * 190 + 480);
}

/* ---------- idle micro-flicker ---------- */

let idleTimer = 0;
function scheduleFlicker() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (powered && !drawing && !RM) {
      const candidates = [ahaTube, scriptTube, estTube, nycTube, frameInner];
      const t = candidates[Math.floor(Math.random() * candidates.length)];
      t.g.classList.add('is-flick');
      setTimeout(() => t.g.classList.remove('is-flick'), 180);
    }
    scheduleFlicker();
  }, 5200 + Math.random() * 7000);
}

/* ---------- pull chain: spring + rubber-band + click ---------- */

const engine = { set: new Set(), raf: 0, last: 0 };
function engineTick(ts) {
  const dt = clamp((ts - engine.last) / 1000 || 0.016, 0.001, 1 / 30);
  engine.last = ts;
  for (const s of engine.set) if (!s.step(dt)) engine.set.delete(s);
  engine.raf = engine.set.size ? requestAnimationFrame(engineTick) : 0;
}
function wake(s) {
  engine.set.add(s);
  if (!engine.raf) { engine.last = performance.now(); engine.raf = requestAnimationFrame(engineTick); }
}

class Spring {
  constructor(value, { response = 0.4, damping = 1, onUpdate = null } = {}) {
    this.x = value; this.v = 0; this.target = value; this.onUpdate = onUpdate;
    const w = (2 * Math.PI) / response;
    this.k = w * w; this.c = damping * 2 * w;
  }
  to(target, velocity = null) {
    this.target = target;
    if (velocity !== null) this.v = velocity;
    if (RM) { this.x = target; this.v = 0; this.onUpdate && this.onUpdate(this.x); return this; }
    wake(this);
    return this;
  }
  set(value) { this.x = value; this.v = 0; this.target = value; this.onUpdate && this.onUpdate(this.x); return this; }
  step(dt) {
    const a = -this.k * (this.x - this.target) - this.c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    const done = Math.abs(this.v) < 0.05 && Math.abs(this.x - this.target) < 0.05;
    if (done) { this.x = this.target; this.v = 0; }
    this.onUpdate && this.onUpdate(this.x);
    return !done;
  }
}

const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

const chainSpring = new Spring(0, {
  response: 0.34, damping: 0.5,
  onUpdate: (y) => { chain.style.transform = `translateY(${y.toFixed(2)}px)`; },
});

const PULL_COMMIT = 62;
let chainDrag = null;
let chainHist = [];

chain.addEventListener('pointerdown', (e) => {
  try { chain.setPointerCapture(e.pointerId); } catch (err) {}
  chainDrag = { startY: e.clientY, startPos: chainSpring.x, pulled: false };
  chainHist = [{ t: performance.now(), y: e.clientY }];
  engine.set.delete(chainSpring);
});

chain.addEventListener('pointermove', (e) => {
  if (!chainDrag) return;
  chainHist.push({ t: performance.now(), y: e.clientY });
  while (chainHist.length > 6) chainHist.shift();
  let y = chainDrag.startPos + (e.clientY - chainDrag.startY);
  if (Math.abs(e.clientY - chainDrag.startY) > 5) chainDrag.pulled = true;
  if (y < 0) y = rubberband(y, 140);
  if (y > 110) y = 110 + rubberband(y - 110, 140);
  chainSpring.set(y);
});

function chainRelease(e) {
  if (!chainDrag) return;
  const wasPull = chainDrag.pulled;
  chainDrag = null;
  let vy = 0;
  if (chainHist.length > 1) {
    const a = chainHist[0], b = chainHist[chainHist.length - 1];
    vy = (b.y - a.y) / Math.max((b.t - a.t) / 1000, 0.008);
  }
  const committed = chainSpring.x > PULL_COMMIT;
  chainSpring.to(0, vy * 0.5);
  if (committed) togglePower();
  else if (!wasPull) togglePower(); /* simple tap works too */
}
chain.addEventListener('pointerup', chainRelease);
chain.addEventListener('pointercancel', chainRelease);
chain.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePower(); }
});

/* ---------- power ---------- */

let powered = true;
let switching = false;

function togglePower() {
  if (switching || drawing) return;
  switching = true;
  powered = !powered;
  buzz(10);
  chain.setAttribute('aria-pressed', String(powered));
  if (!powered) {
    room.classList.add('is-off');
    tubes.forEach(t => t.g.classList.remove('is-lit'));
    setTimeout(() => { switching = false; }, 500);
  } else {
    room.classList.remove('is-off');
    igniteAll(() => { switching = false; });
  }
}

/* ---------- boot ---------- */

room.classList.remove('is-off');
drawSequence(() => scheduleFlicker());

/* ---------- dev hooks ---------- */

window.__laser = {
  tubes: tubes.map(t => t.key),
  togglePower,
  info: () => ({
    powered,
    drawing,
    lit: tubes.filter(t => t.lit).map(t => t.key),
    lens: Object.fromEntries(tubes.map(t => [t.key, Math.round(t.len)])),
    headError: +lastHeadError.toFixed(2),
  }),
};

/* ---------- acceptance checks (?test=1) ---------- */

if (TESTMODE) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: String(detail) });
  const fire = (elm, type, opts = {}) => elm.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 9, clientX: 40, clientY: 40, ...opts }));

  (async () => {
    check('brand paths present', ['aha', 'script', 'est', 'nyc'].every(k => PATHS[k] && PATHS[k].d.length > 100), '');
    check('six tubes mounted', tubes.length === 6, tubes.length);
    check('trace lengths sane', tubes.every(t => t.len > 500), tubes.map(t => Math.round(t.len)).join(','));

    /* layout: each glyph group centered near its slot */
    const bb = ahaTube.g.getBoundingClientRect();
    const sb = svg.getBoundingClientRect();
    const cx = (bb.left + bb.width / 2 - sb.left) / sb.width;
    check('AHA centered', Math.abs(cx - 0.5) < 0.06, cx.toFixed(3));

    /* wait for the full draw */
    const t0 = performance.now();
    while (tubes.some(t => !t.lit) && performance.now() - t0 < (RM ? 2000 : 9000)) await sleep(200);
    check('draw completes, all lit', tubes.every(t => t.lit), window.__laser.info().lit.join(','));
    check('laser head tracked path', RM || lastHeadError < 8, `err=${lastHeadError.toFixed(2)}`);
    check('no legacy control panel', !document.querySelector('select, input[type="range"]'), '');

    /* chain pull toggles off */
    const rect = chain.getBoundingClientRect();
    const cxp = rect.left + rect.width / 2, cyp = rect.top + 10;
    fire(chain, 'pointerdown', { clientX: cxp, clientY: cyp });
    for (let i = 1; i <= 6; i++) fire(chain, 'pointermove', { clientX: cxp, clientY: cyp + i * 15 });
    fire(chain, 'pointerup', { clientX: cxp, clientY: cyp + 90 });
    await sleep(700);
    check('pull switches off', !powered && room.classList.contains('is-off'), `powered=${powered}`);
    check('off = pale glass', getComputedStyle(ahaTube.trace).opacity < 0.3, getComputedStyle(ahaTube.trace).opacity);

    /* tap toggles back on with fast ignition */
    fire(chain, 'pointerdown', { clientX: cxp, clientY: cyp });
    fire(chain, 'pointerup', { clientX: cxp, clientY: cyp + 2 });
    await sleep(RM ? 400 : 1800);
    check('tap re-ignites', powered && tubes.every(t => t.lit), window.__laser.info().lit.length);

    /* fps at idle — the state the sign lives in */
    let fps = 0;
    await new Promise((res) => {
      let frames = 0; const t0 = performance.now();
      const loop = (ts) => { frames++; if (ts - t0 < 1000) requestAnimationFrame(loop); else { fps = frames; res(); } };
      requestAnimationFrame(loop);
    });
    check('fps healthy at idle', fps > 40 || RM, `fps=${fps}`);

    window.__testResults = { pass: results.every(r => r.ok), results };
    console.log('[LASER TESTS]', JSON.stringify(window.__testResults, null, 1));
  })();
}
