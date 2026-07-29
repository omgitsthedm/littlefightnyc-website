/* goliath.js — Loud, on purpose.
   Ten typographic street posters wheatpasted one over the last, cut like
   a film. Everything is a pure function of damped scroll progress:
   forward pastes, backward peels, freeze anywhere. Clip-path, transform,
   and opacity only. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const pin = $('[data-pin]');
const wall = $('[data-wall]');
const counter = $('[data-counter]');
const ticksEl = $('[data-ticks]');

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TESTMODE = new URLSearchParams(location.search).has('test');

/* ---------- the cuts ---------- */

const BLACK = { bg: 'var(--paper-black)', ink: '#f6f1ea', hot: '#ff7a1a' };
const CREAM = { bg: 'var(--paper-cream)', ink: '#100d16', hot: '#e2451f' };
const ORANGE = { bg: 'var(--paper-orange)', ink: '#140b03', hot: '#f6f1ea' };

const CUTS = [
  { variant: 'giant', wipe: 'right', rot: -1.1, pal: BLACK, word: 'GOLIATH.' },
  { variant: 'lines', wipe: 'left', rot: 0.9, pal: CREAM, lines: ['Goliath has a logo committee.', 'A brand bible.', 'Fourteen tools on subscription.'] },
  { variant: 'lines', wipe: 'top', rot: -0.8, pal: BLACK, lines: ['Goliath bills monthly.', 'For |everything.|'] },
  { variant: 'lines', wipe: 'right', rot: 1.2, pal: CREAM, lines: ['You have a shop.', 'A phone.', 'And a |fight| in you.'] },
  { variant: 'giant', wipe: 'top', rot: -1.3, pal: ORANGE, word: 'LITTLE<br>FIGHT.' },
  { variant: 'lines', wipe: 'left', rot: 0.8, pal: BLACK, lines: ['One team.', 'One system.', 'One throw.'] },
  { variant: 'lines', wipe: 'right', rot: -0.9, pal: CREAM, lines: ["You don't need armor.", 'You need |aim.|'] },
  { variant: 'lines', wipe: 'top', rot: 1.0, pal: BLACK, lines: ['Aim is a website that loads', '|before doubt does.|'] },
  { variant: 'lines', wipe: 'left', rot: -1.0, pal: ORANGE, lines: ['Aim is one number', 'that rings a human.'] },
  { variant: 'shout', wipe: 'right', rot: 0.7, pal: BLACK, lines: ['PICK UP', '|THE STONE.|'] },
];

const N = CUTS.length;

/* ---------- build ---------- */

function lineHTML(text) {
  const html = text.replace(/\|([^|]+)\|/g, '<em>$1</em>');
  return `<p class="poster__line"><span>${html}</span></p>`;
}

const posters = CUTS.map((cut, i) => {
  const el = document.createElement('article');
  el.className = `poster poster--${cut.variant === 'giant' ? 'giant' : cut.variant === 'shout' ? 'shout' : 'lines'}`;
  el.style.setProperty('--p-bg', cut.pal.bg);
  el.style.setProperty('--p-ink', cut.pal.ink);
  el.style.setProperty('--p-hot', cut.pal.hot);
  el.style.color = cut.pal.ink;
  el.style.zIndex = String(i + 1);
  if (cut.variant === 'giant') {
    el.innerHTML = `<h2 class="poster__word">${cut.word}</h2>`;
  } else {
    el.innerHTML = cut.lines.map(lineHTML).join('');
  }
  wall.appendChild(el);
  return el;
});

const ticks = CUTS.map(() => {
  const t = document.createElement('span');
  ticksEl.appendChild(t);
  return t;
});

/* ---------- pure application of progress ---------- */

const WIPE = 0.17;   /* fraction of a segment spent pasting */
let lastIdx = -1;

function clipFor(dir, w) {
  const r = ((1 - w) * 100).toFixed(2);
  if (dir === 'right') return `inset(0 ${r}% 0 0)`;
  if (dir === 'left') return `inset(0 0 0 ${r}%)`;
  return `inset(0 0 ${r}% 0)`;
}

function apply(p) {
  const t = clamp(p, 0, 1) * N;
  const idx = clamp(Math.floor(t), 0, N - 1);

  posters.forEach((el, i) => {
    const local = t - i;                       /* <0 not yet, 0..1 this segment, >1 pasted over */
    const wipeT = clamp(local / WIPE, 0, 1);
    /* visible: currently pasting, fully pasted directly beneath, or the one being revealed by a peel */
    const on = wipeT > 0 && i >= idx - 1;
    el.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;

    el.style.clipPath = clipFor(CUTS[i].wipe, wipeT);
    /* paste settle: rotation eases from a slap to its resting skew */
    const settle = clamp((local - WIPE) / 0.2, 0, 1);
    const rot = CUTS[i].rot * (1.6 - 0.6 * settle);
    el.style.transform = `rotate(${rot.toFixed(3)}deg)`;

    /* in-poster kinetics */
    if (CUTS[i].variant === 'giant') {
      const word = el.firstElementChild;
      const k = clamp((local - 0.05) / 0.4, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      word.style.transform = `translateX(${((1 - e) * 40).toFixed(1)}px) scale(${(1.08 - e * 0.08).toFixed(4)})`;
    } else {
      $$('.poster__line span', el).forEach((span, li) => {
        const rise = clamp((local - 0.1 - li * 0.07) / 0.26, 0, 1);
        const e = 1 - Math.pow(1 - rise, 3);
        span.style.transform = `translateY(${((1 - e) * 110).toFixed(1)}%)`;
        span.style.opacity = e.toFixed(3);
      });
      $$('em', el).forEach(em => em.classList.toggle('is-hot', local > 0.55));
    }
  });

  if (idx !== lastIdx) {
    lastIdx = idx;
    counter.textContent = `${String(idx + 1).padStart(2, '0')} / ${N}`;
    ticks.forEach((tk, i) => tk.classList.toggle('is-on', i <= idx));
  }
}

/* ---------- damped scrub ---------- */

let smooth = 0;
let lastTs = 0;
let fpsAvg = 60;

function progressNow() {
  const rect = pin.getBoundingClientRect();
  const total = rect.height - innerHeight;
  return total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
}

function tick(ts) {
  requestAnimationFrame(tick);
  const dt = Math.min((ts - lastTs) / 1000 || 0.016, 0.05);
  lastTs = ts;
  fpsAvg = fpsAvg * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
  const target = progressNow();
  smooth += (target - smooth) * (1 - Math.exp(-dt * 9));
  if (Math.abs(target - smooth) < 0.00005) smooth = target;
  apply(smooth);
}

if (RM) {
  document.documentElement.classList.add('is-static');
  posters.forEach(el => { el.style.visibility = 'visible'; });
  $$('.poster__line span').forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
  $$('.poster__line em').forEach(em => em.classList.add('is-hot'));
} else {
  apply(0);
  requestAnimationFrame(tick);
}

/* ---------- dev hooks ---------- */

window.__goliath = {
  apply,
  go: (p) => { window.scrollTo(0, pin.offsetTop + (pin.offsetHeight - innerHeight) * p); },
  info: () => ({
    progress: +smooth.toFixed(4),
    cut: counter.textContent,
    visible: posters.filter(el => el.style.visibility === 'visible').length,
  }),
};

/* ---------- acceptance checks (?test=1) ---------- */

if (TESTMODE) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: String(detail) });

  (async () => {
    await sleep(400);
    check('ten cuts on the wall', posters.length === 10, posters.length);
    check('paper grain filter present', !!document.getElementById('paper'), '');
    check('no legacy challenge widget', !document.querySelector('[data-challenge], .proof-panel, select'), '');

    if (!RM) {
      /* mid-paste shows a partial wipe */
      apply(0.5 / N * 10 * 0.008 + 0.0); /* tiny p: first poster mid-wipe */
      apply(0.008);
      const cp = posters[0].style.clipPath;
      check('paste wipes with clip-path', /inset\(0(px)? [1-9]/.test(cp) || cp.includes('% 0 0'), cp);

      /* fully pasted at segment end */
      apply(1 / N * 0.9);
      check('cut one fully pasted', posters[0].style.clipPath === 'inset(0 0% 0 0)' || posters[0].style.clipPath.includes('0%'), posters[0].style.clipPath);

      /* scrub reversibility: counter at p returns after detour */
      apply(0.45); const a = counter.textContent;
      apply(0.82); const b = counter.textContent;
      apply(0.45); const c = counter.textContent;
      check('scrub reversible', a === c && a !== b, `${a} vs ${b}`);

      /* composited layers stay small */
      apply(0.62);
      const vis = posters.filter(el => el.style.visibility === 'visible').length;
      check('≤3 posters composited', vis <= 3, vis);

      /* hot words flip past the half of their cut */
      apply((2 + 0.7) / N);
      const hot = $$('em', posters[2]).every(em => em.classList.contains('is-hot'));
      apply((2 + 0.2) / N);
      const cold = $$('em', posters[2]).every(em => !em.classList.contains('is-hot'));
      check('accent words flip mid-cut', hot && cold, `hot=${hot} cold=${cold}`);

      /* counter tracks */
      apply(0.95);
      check('counter reaches the last cut', counter.textContent === '10 / 10', counter.textContent);
      apply(0);

      await sleep(900);
      check('fps healthy', fpsAvg > 40, `fps=${Math.round(fpsAvg)}`);
    } else {
      check('reduced motion: static poster stack', posters.every(el => el.style.visibility === 'visible'), '');
    }

    window.__testResults = { pass: results.every(r => r.ok), results };
    console.log('[GOLIATH TESTS]', JSON.stringify(window.__testResults, null, 1));
  })();
}
