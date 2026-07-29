/* pill.js — Scroll Into Motion. A pill blooms into a full-bleed 16-moment film.
   Everything is a pure function of damped scroll progress: scrub forward, drag
   back, freeze anywhere. Transforms/opacity/clip-path only — buttery by design. */

const MOMENTS = [
  ['nyc-grand-central-busy-2.webp', 'WAKE'],
  ['nyc-cafes1-2.webp', 'BREW'],
  ['nyc-cafes2-2.webp', 'WARM'],
  ['nyc-small-business-owner-2.webp', 'OPEN'],
  ['nyc-streets-businesses1-2.webp', 'HUSTLE'],
  ['nyc-streets-businesses2-2.webp', 'MOVE'],
  ['nyc-retail-2.webp', 'BROWSE'],
  ['nyc-streets-businesses3-2.webp', 'MAKE'],
  ['nyc-web-design.webp', 'BUILD'],
  ['website-design-nyc-1.webp', 'CRAFT'],
  ['nyc-streets-businesses4-2.webp', 'SERVE'],
  ['nyc-streets-businesses5.webp', 'GOLDEN'],
  ['nyc-brooklyn-2.webp', 'CROSS'],
  ['nyc-streets-businesses6.webp', 'GLOW'],
  ['nyc-outdoor-bar-2.webp', 'TOAST'],
  ['nyc-streets-businesses7.webp', 'NIGHT'],
];

const $ = (s) => document.querySelector(s);
const veil = $('[data-veil]'), veilFill = $('[data-veil-fill]');
const pin = $('[data-pin]'), frame = $('[data-frame]');
const imgsWrap = $('[data-imgs]'), tag = $('[data-tag]');
const wordEl = $('[data-word]'), countEl = $('[data-count]'), ticksEl = $('[data-ticks]');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TESTMODE = new URLSearchParams(location.search).has('test');

/* ---------- build the stack + ticks ---------- */
const imgs = MOMENTS.map(([src], i) => {
  const im = new Image();
  im.decoding = 'async';
  im.src = `assets/${src}`;
  im.alt = '';
  im.draggable = false;
  imgsWrap.appendChild(im);
  return im;
});
const ticks = MOMENTS.map(() => {
  const t = document.createElement('span');
  ticksEl.appendChild(t);
  return t;
});

/* ---------- preload with progress ---------- */
let loaded = 0;
const setProgress = () => { veilFill.style.width = `${Math.round(5 + (loaded / MOMENTS.length) * 95)}%`; };
const done = () => {
  veil.classList.add('is-done');
  start();
};
Promise.all(imgs.map((im) => new Promise((res) => {
  const fin = () => { loaded++; setProgress(); res(); };
  if (im.complete && im.naturalWidth) fin();
  else { im.onload = fin; im.onerror = fin; }
}))).then(done);
setTimeout(done, 6000); // never trap the user on a slow image

/* ---------- the scrub ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

/* pill rest shape (matches the CSS starting clip) */
const PILL = { top: 41, right: 34, bottom: 41, left: 34 };

let smooth = 0;
let raf = 0;
let started = false;
let lastWordIdx = -1;
let fpsAvg = 60;
let lastTs = 0;

function progressNow() {
  const rect = pin.getBoundingClientRect();
  const total = rect.height - innerHeight;
  return total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
}

/* phase map — one pure function of p */
function apply(p) {
  /* phases: 0–.10 pill idle · .10–.24 bloom · .24–.88 film · .88–.97 contract · tail rest */
  let inset, radius;
  if (p < 0.10) {
    const breathe = Math.sin(p * 60) * 0.4;
    inset = [PILL.top + breathe * 0.2, PILL.right - breathe, PILL.bottom + breathe * 0.2, PILL.left - breathe];
    radius = 999;
  } else if (p < 0.24) {
    const k = ease((p - 0.10) / 0.14);
    inset = [lerp(PILL.top, 0, k), lerp(PILL.right, 0, k), lerp(PILL.bottom, 0, k), lerp(PILL.left, 0, k)];
    radius = lerp(999, 0, ease(k));
  } else if (p < 0.88) {
    inset = [0, 0, 0, 0];
    radius = 0;
  } else if (p < 0.97) {
    const k = ease((p - 0.88) / 0.09);
    inset = [lerp(0, PILL.top, k), lerp(0, PILL.right, k), lerp(0, PILL.bottom, k), lerp(0, PILL.left, k)];
    radius = lerp(0, 999, ease(k));
  } else {
    inset = [PILL.top, PILL.right, PILL.bottom, PILL.left];
    radius = 999;
  }
  frame.style.clipPath = `inset(${inset[0]}% ${inset[1]}% ${inset[2]}% ${inset[3]}% round ${radius}px)`;

  /* film: which moment, crossfade, ken burns */
  const filmT = clamp((p - 0.24) / (0.88 - 0.24), 0, 1);
  const seg = filmT * (MOMENTS.length - 0.0001);
  const idx = clamp(Math.floor(seg), 0, MOMENTS.length - 1);
  const local = seg - idx;
  const FADE = 0.22;
  imgs.forEach((im, i) => {
    let op = 0;
    if (p < 0.24) op = i === 0 ? 1 : 0;
    else if (p >= 0.88) op = i === MOMENTS.length - 1 ? 1 : 0;
    else if (i === idx) op = 1;
    else if (i === idx + 1) op = local > 1 - FADE ? (local - (1 - FADE)) / FADE : 0;
    const on = op > 0.001;
    im.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    im.style.opacity = op.toFixed(3);
    const dir = i % 2 === 0 ? 1 : -1;
    const zoom = 1.06 + local * 0.05;
    const panX = dir * lerp(-1.4, 1.4, local);
    im.style.transform = `scale(${zoom.toFixed(4)}) translate(${panX.toFixed(2)}%, ${(local * -1.2).toFixed(2)}%)`;
  });

  /* words + counter + ticks */
  const inFilm = p >= 0.22 && p < 0.9;
  if (inFilm) {
    if (idx !== lastWordIdx) {
      lastWordIdx = idx;
      wordEl.textContent = MOMENTS[idx][1];
      countEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${MOMENTS.length}`;
      ticks.forEach((t, i) => t.classList.toggle('is-on', i <= idx));
    }
    const wordIn = clamp(local / 0.18, 0, 1);
    const wordOut = clamp((1 - local) / 0.12, 0, 1);
    const wordK = Math.min(wordIn, 1) * Math.min(wordOut, 1);
    wordEl.style.opacity = wordK.toFixed(3);
    wordEl.style.transform = `translateY(${lerp(18, 0, ease(clamp(wordIn, 0, 1)))}px)`;
    countEl.style.opacity = '1';
    ticksEl.style.opacity = '1';
  } else {
    wordEl.style.opacity = '0';
    countEl.style.opacity = '0';
    ticksEl.style.opacity = '0';
    lastWordIdx = -1;
  }
  tag.style.opacity = p < 0.1 ? String(1 - p * 8) : p > 0.965 ? String((p - 0.965) / 0.035 * 0.9) : '0';
}

function tick(ts) {
  raf = requestAnimationFrame(tick);
  const dt = Math.min((ts - lastTs) / 1000 || 0.016, 0.05);
  lastTs = ts;
  fpsAvg = fpsAvg * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
  const target = progressNow();
  smooth += (target - smooth) * (1 - Math.exp(-dt * 9));
  if (Math.abs(target - smooth) < 0.00005) smooth = target;
  apply(smooth);
}

function start() {
  if (started) return;
  started = true;
  if (reduceMotion) {
    imgs.forEach((im) => { im.style.visibility = 'visible'; im.style.opacity = '1'; im.style.transform = 'none'; });
    return;
  }
  apply(0);
  raf = requestAnimationFrame(tick);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(raf);
  else if (started && !reduceMotion) { lastTs = 0; raf = requestAnimationFrame(tick); }
});

/* ---------- acceptance checks (?test=1) ---------- */
if (TESTMODE) {
  setTimeout(() => {
    const results = [];
    const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
    check('16 moments present', imgs.length === 16);
    check('images loaded', loaded >= 15, `loaded=${loaded}`);
    if (!reduceMotion) {
      apply(0.02);
      const pillClip = frame.style.clipPath.includes('999px');
      apply(0.5);
      const cp = frame.style.clipPath;
      const fullClip = cp === 'inset(0%)' || cp.startsWith('inset(0% 0% 0% 0%');
      check('pill at rest', pillClip);
      check('full-bleed mid-film', fullClip);
      const visAtHalf = imgs.filter((im) => im.style.visibility === 'visible').length;
      check('≤2 layers composited', visAtHalf <= 2, `visible=${visAtHalf}`);
      apply(0.5); const w1 = wordEl.textContent;
      apply(0.31); const w2 = wordEl.textContent;
      apply(0.5); const w3 = wordEl.textContent;
      check('scrub reversible', w1 === w3 && w1 !== w2, `${w2}→${w1}`);
      const half = 0.24 + (0.88 - 0.24) * (8.5 / 16);
      apply(half);
      check('counter tracks film', countEl.textContent.startsWith('09'), countEl.textContent);
      apply(0);
      check('fps healthy', fpsAvg > 40, `fps=${Math.round(fpsAvg)}`);
    } else {
      check('reduced-motion grid', imgs.every((im) => im.style.opacity === '1'));
    }
    window.__testResults = { pass: results.every((r) => r.ok), results };
    console.log('[PILL TESTS]', JSON.stringify(window.__testResults, null, 1));
  }, 5000);
}

/* dev hooks */
window.__pillInfo = () => ({ progress: +smooth.toFixed(4), loaded, fps: Math.round(fpsAvg), word: wordEl.textContent, count: countEl.textContent, clip: frame.style.clipPath.slice(0, 60) });
window.__pillGo = (p) => { window.scrollTo(0, pin.offsetTop + (pin.offsetHeight - innerHeight) * p); };
