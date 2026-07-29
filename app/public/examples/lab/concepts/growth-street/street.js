/* street.js — Numbers, wearing costumes.
   Five chapters of one flower shop's growth, told as pictographs:
   people are dots, orders are tickets, reviews are stars, months are
   buildings. Chapters wake on scroll, replay on return, and stand
   fully told under reduced motion. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TESTMODE = new URLSearchParams(location.search).has('test');

const story = $('[data-story]');
const rail = $('[data-rail]');
const chapters = $$('[data-ch]');

const WALKER_COLORS = ['#e9564f', '#2e86c1', '#f2b134', '#7fb069', '#9b5de5', '#ff8fab', '#f3ecff'];

/* ---------- chapter 1 + 2: sidewalks of jellybean people ---------- */

function buildWalkway(walkway, { total, entering, door }) {
  walkway.classList.add('walkway');
  const scene = walkway.closest('[data-scene]');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < total; i++) {
    const w = document.createElement('i');
    const goesIn = i < entering;
    w.className = goesIn ? 'walker walker--in' : 'walker';
    w.style.background = WALKER_COLORS[i % WALKER_COLORS.length];
    w.style.setProperty('--dur', `${rand(7.5, 14).toFixed(2)}s`);
    w.style.setProperty('--delay', `${(-rand(0, 14)).toFixed(2)}s`);
    w.style.bottom = `${Math.round(rand(14, 40))}px`;
    frag.appendChild(w);
  }
  walkway.appendChild(frag);

  const size = () => {
    const sw = scene.getBoundingClientRect().width + 60;
    walkway.style.setProperty('--sceneW', `${Math.round(sw)}px`);
    if (door) {
      const d = door.getBoundingClientRect();
      const s = scene.getBoundingClientRect();
      walkway.style.setProperty('--doorX', `${Math.round(d.left - s.left + d.width / 2)}px`);
    }
  };
  size();
  window.addEventListener('resize', size);
}

buildWalkway($('[data-walkway]'), { total: 100, entering: 2, door: $('[data-door]') });
buildWalkway($('[data-walkway2]'), { total: 46, entering: 14, door: $('[data-shop2] .shop__door') });

/* ---------- chapter 3: night stars + the ticket stack ---------- */

const nightStars = $('[data-nightstars]');
nightStars.classList.add('stars');
for (let i = 0; i < 26; i++) {
  const s = document.createElement('i');
  s.className = 'nstar';
  s.style.left = `${rand(2, 96).toFixed(1)}%`;
  s.style.top = `${rand(2, 46).toFixed(1)}%`;
  s.style.setProperty('--delay', `${rand(0, 2.8).toFixed(2)}s`);
  nightStars.appendChild(s);
}

const ticketsBox = $('[data-tickets]');
const TICKET_NAMES = ['peonies', 'ranunculus', 'tulips ×12', 'the big one', 'sunflowers', 'dahlias', 'sweet peas', 'wedding trial', 'roses ×24'];
const ticketEls = TICKET_NAMES.map((n, i) => {
  const t = document.createElement('div');
  t.className = 'ticket';
  t.style.setProperty('--rot', `${rand(-4, 4).toFixed(1)}deg`);
  t.style.setProperty('--stack', `${-(i * 9)}px`);
  t.style.zIndex = String(i + 1);
  t.innerHTML = `<b>ORDER #${String(112 + i)}</b>${n} · 🌷`;
  ticketsBox.appendChild(t);
  return t;
});
const ding = document.createElement('span');
ding.className = 'ding';
ticketsBox.appendChild(ding);

/* ---------- chapter 4: the thirty-star burst ---------- */

const starfield = $('[data-starfield]');
const starEls = [];
for (let i = 0; i < 30; i++) {
  const s = document.createElement('i');
  s.className = 'wstar';
  if (i < 5) { s.style.width = '24px'; s.style.height = '24px'; }
  starfield.appendChild(s);
  starEls.push(s);
}

function aimStars() {
  const w = starfield.getBoundingClientRect().width || 700;
  starEls.forEach((s, i) => {
    s.style.setProperty('--dx', `${Math.round(rand(w * 0.24, w * 0.72))}px`);
    s.style.setProperty('--dy', `${Math.round(rand(-90, 130))}px`);
    s.style.setProperty('--delay', `${(i < 5 ? i * 0.12 : rand(0.3, 1.5)).toFixed(2)}s`);
    s.style.setProperty('--fdur', `${rand(1.4, 2.2).toFixed(2)}s`);
  });
}
aimStars();

/* ---------- chapter 5: the skyline bar chart ---------- */

const MONTHS = [['JAN', 3.2], ['FEB', 5.1], ['MAR', 7.4], ['APR', 9.8], ['MAY', 13.5], ['JUN', 18]];
const BLDG_COLORS = ['#e9564f', '#2e86c1', '#7fb069', '#9b5de5', '#f2856d', '#c96f4a'];
const skyline = $('[data-skyline]');
MONTHS.forEach(([m, v], i) => {
  const b = document.createElement('div');
  b.className = 'bldg' + (i === MONTHS.length - 1 ? ' bldg--tower' : '');
  b.style.setProperty('--h', String(Math.round((v / 18) * 86 + 10)));
  b.style.setProperty('--bldg-bg', BLDG_COLORS[i]);
  b.style.setProperty('--delay', `${(i * 0.14).toFixed(2)}s`);
  b.dataset.val = String(v);
  b.innerHTML = `<span class="bldg__windows"></span><span class="bldg__val">$${v < 10 ? v.toFixed(1) : v}k</span><span class="bldg__label">${m}</span>`;
  skyline.appendChild(b);
});

/* ---------- counters ---------- */

const timers = new Map(); /* chapter -> timeout ids */
const addTimer = (ch, id) => { if (!timers.has(ch)) timers.set(ch, []); timers.get(ch).push(id); };
const clearChapter = (ch) => { (timers.get(ch) || []).forEach(clearTimeout); timers.set(ch, []); };

function fmtCount(el, v) {
  if (el.hasAttribute('data-money')) return `$${v < 10 ? v.toFixed(1) : Math.round(v)}k`;
  const n = Math.round(v);
  if (el.hasAttribute('data-plus')) return `+${n}`;
  if (el.hasAttribute('data-x')) return `×${n}`;
  return String(n);
}

function runCounter(el, ch, { dur = 1300, from = 0 } = {}) {
  const target = el.hasAttribute('data-money') ? +el.dataset.money : +el.dataset.count;
  const start = el.hasAttribute('data-money') ? 3.2 : from;
  if (RM) { el.textContent = fmtCount(el, target); return; }
  const t0 = performance.now();
  function step(ts) {
    const k = Math.min((ts - t0) / dur, 1);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmtCount(el, start + (target - start) * e);
    if (k < 1 && el.closest('.is-live')) requestAnimationFrame(step);
    else if (k >= 1) el.textContent = fmtCount(el, target);
  }
  requestAnimationFrame(step);
}

function resetCounter(el) {
  el.textContent = fmtCount(el, el.hasAttribute('data-money') ? 3.2 : 0);
}

/* ---------- chapter activation ---------- */

function activate(ch) {
  const n = +ch.dataset.ch;
  if (ch.classList.contains('is-live')) return;
  ch.classList.add('is-live');

  const counter = $('[data-count], [data-money]', ch);

  if (n === 3) {
    /* tickets ding in one by one; the counter rides along */
    ticketEls.forEach((t, i) => {
      addTimer(ch, setTimeout(() => {
        t.classList.add('is-in');
        ding.classList.remove('is-live'); void ding.offsetWidth; ding.classList.add('is-live');
        counter.textContent = fmtCount(counter, i + 1);
      }, RM ? 0 : 500 + i * 370));
    });
    if (RM) { ticketEls.forEach(t => t.classList.add('is-in')); counter.textContent = fmtCount(counter, 9); }
  } else if (n === 4) {
    aimStars();
    starEls.forEach(s => s.classList.add('is-live'));
    if (counter) addTimer(ch, setTimeout(() => runCounter(counter, ch, { dur: 1700 }), RM ? 0 : 350));
  } else if (counter) {
    addTimer(ch, setTimeout(() => runCounter(counter, ch), RM ? 0 : 450));
  }
}

function deactivate(ch) {
  const n = +ch.dataset.ch;
  if (!ch.classList.contains('is-live')) return;
  ch.classList.remove('is-live');
  clearChapter(ch);
  const counter = $('[data-count], [data-money]', ch);
  if (counter) resetCounter(counter);
  if (n === 3) ticketEls.forEach(t => t.classList.remove('is-in'));
  if (n === 4) starEls.forEach(s => s.classList.remove('is-live'));
}

$$('[data-count], [data-money]').forEach(resetCounter);

if (RM) {
  chapters.forEach(activate);
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.intersectionRatio > 0.38) activate(e.target);
      else if (e.intersectionRatio < 0.04) deactivate(e.target);
    });
  }, { threshold: [0, 0.04, 0.38, 0.6] });
  chapters.forEach(ch => io.observe(ch));
}

/* rail sync */
const railDots = $$('[data-rail-dot]');
const railIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.intersectionRatio > 0.5) {
      railDots.forEach(d => d.classList.toggle('is-here', d.dataset.railDot === e.target.dataset.ch));
    }
  });
}, { threshold: [0.5] });
chapters.forEach(ch => railIO.observe(ch));

const storyIO = new IntersectionObserver((entries) => {
  entries.forEach(e => rail.classList.toggle('is-on', e.isIntersecting));
}, { threshold: [0.02] });
storyIO.observe(story);

/* ---------- dev hooks ---------- */

window.__street = {
  activate: (n) => activate(chapters[n - 1]),
  deactivate: (n) => deactivate(chapters[n - 1]),
  info: () => ({
    live: chapters.filter(c => c.classList.contains('is-live')).map(c => +c.dataset.ch),
    walkers: $$('.walker').length,
    entering: $$('.walker--in').length,
    tickets: $$('.ticket.is-in').length,
    stars: $$('.wstar.is-live').length,
    bars: $$('.bldg').length,
  }),
};

/* ---------- acceptance checks (?test=1) ---------- */

if (TESTMODE) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: String(detail) });

  (async () => {
    await sleep(400);
    check('five chapters', chapters.length === 5, chapters.length);
    check('a hundred walk by chapter one', $$('.walker', $('[data-walkway]')).length === 100, '');
    check('two of them turn in', $$('.walker--in', $('[data-walkway]')).length === 2, '');
    check('fourteen turn in after the website', $$('.walker--in', $('[data-walkway2]')).length === 14, '');
    check('door target measured', ($('[data-walkway]').style.getPropertyValue('--doorX') || '').includes('px'), $('[data-walkway]').style.getPropertyValue('--doorX'));
    check('grain texture on every chapter', $$('.ch__grain').length === 5 && !!document.getElementById('grain'), '');

    /* chapter 1 counter */
    window.__street.activate(1);
    await sleep(RM ? 200 : 2100);
    check('chapter 1 counts to 2', $('[data-count]', chapters[0]).textContent === '2', $('[data-count]', chapters[0]).textContent);

    /* chapter 3 tickets */
    window.__street.activate(3);
    await sleep(RM ? 300 : 4600);
    check('nine tickets stack up', $$('.ticket.is-in').length === 9, $$('.ticket.is-in').length);
    check('overnight counter says +9', $('[data-count]', chapters[2]).textContent === '+9', $('[data-count]', chapters[2]).textContent);

    /* chapter 4 stars */
    window.__street.activate(4);
    await sleep(RM ? 200 : 600);
    check('thirty stars fly', $$('.wstar.is-live').length === 30, $$('.wstar.is-live').length);

    /* chapter 5 skyline */
    window.__street.activate(5);
    await sleep(RM ? 200 : 1800);
    const hs = $$('.bldg', skyline).map(b => +b.style.getPropertyValue('--h'));
    check('six buildings, strictly growing', hs.length === 6 && hs.every((h, i) => i === 0 || h > hs[i - 1]), hs.join(','));
    check('june is the $18k tower', $$('.bldg', skyline)[5].dataset.val === '18' && !!$('.bldg--tower', skyline), '');
    check('money counter lands on $18k', $('[data-money]', chapters[4]).textContent === '$18k', $('[data-money]', chapters[4]).textContent);

    /* replay: deactivate resets */
    if (!RM) {
      window.__street.deactivate(3);
      await sleep(120);
      check('leaving a chapter resets it for replay', $$('.ticket.is-in').length === 0 && $('[data-count]', chapters[2]).textContent === '+0', '');
      window.__street.activate(3);
    }

    let fps = 0;
    await new Promise((res) => {
      let frames = 0; const t0 = performance.now();
      const loop = (ts) => { frames++; if (ts - t0 < 1000) requestAnimationFrame(loop); else { fps = frames; res(); } };
      requestAnimationFrame(loop);
    });
    check('fps healthy', fps > 40 || RM, `fps=${fps}`);

    window.__testResults = { pass: results.every(r => r.ok), results };
    console.log('[STREET TESTS]', JSON.stringify(window.__testResults, null, 1));
  })();
}
