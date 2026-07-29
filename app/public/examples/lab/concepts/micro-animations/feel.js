/* feel.js — Feedback you can feel.
   A tiny bodega app where every interaction runs on real springs:
   response/damping parametrization, velocity handoff from the finger,
   momentum projection for snap targets, rubber-banding at bounds.
   Transforms, opacity, and clip-path only. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const phone = $('[data-phone]');
const coachEl = $('[data-coach]');
const rail = $('[data-rail]');
const railDone = $('[data-rail-done]');

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TESTMODE = new URLSearchParams(location.search).has('test');
const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };

/* ---------- spring engine (mass 1; Apple's response + damping-ratio params) ---------- */

const engine = { set: new Set(), raf: 0, last: 0 };

function engineTick(ts) {
  const dt = clamp((ts - engine.last) / 1000 || 0.016, 0.001, 1 / 30);
  engine.last = ts;
  for (const s of engine.set) {
    if (!s.step(dt)) engine.set.delete(s);
  }
  engine.raf = engine.set.size ? requestAnimationFrame(engineTick) : 0;
}

function wake(spring) {
  engine.set.add(spring);
  if (!engine.raf) { engine.last = performance.now(); engine.raf = requestAnimationFrame(engineTick); }
}

class Spring {
  constructor(value, { response = 0.4, damping = 1, onUpdate = null } = {}) {
    this.x = value; this.v = 0; this.target = value;
    this.onUpdate = onUpdate;
    this.tune(response, damping);
  }
  tune(response, damping) {
    const w = (2 * Math.PI) / response;
    this.k = w * w;
    this.c = damping * 2 * w;
    return this;
  }
  /* retarget from the CURRENT value + velocity — interruptible by construction */
  to(target, velocity = null) {
    this.target = target;
    if (velocity !== null) this.v = velocity;
    if (RM) { this.x = target; this.v = 0; this.onUpdate && this.onUpdate(this.x); this.settled && this.settled(); return this; }
    wake(this);
    return this;
  }
  set(value) {
    this.x = value; this.v = 0; this.target = value;
    this.onUpdate && this.onUpdate(this.x);
    return this;
  }
  step(dt) {
    const a = -this.k * (this.x - this.target) - this.c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    const done = Math.abs(this.v) < 0.05 && Math.abs(this.x - this.target) < 0.05;
    if (done) { this.x = this.target; this.v = 0; }
    this.onUpdate && this.onUpdate(this.x);
    if (done && this.settled) { const fn = this.settled; this.settled = null; fn(); }
    return !done;
  }
}

/* momentum projection — where the gesture was going (Apple's decay form) */
const project = (v, rate = 0.998) => (v / 1000) * rate / (1 - rate);

/* soft boundary — the further past the edge, the less it follows */
const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

/* finger velocity from a short history window */
function makeVelocityTracker() {
  let hist = [];
  return {
    reset() { hist = []; },
    push(x, y) {
      const t = performance.now();
      hist.push({ t, x, y });
      while (hist.length > 6 || (hist.length > 2 && t - hist[0].t > 110)) hist.shift();
    },
    read() {
      if (hist.length < 2) return { vx: 0, vy: 0 };
      const a = hist[0], b = hist[hist.length - 1];
      const dt = Math.max((b.t - a.t) / 1000, 0.008);
      return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
    },
  };
}

const capture = (el, e) => { try { el.setPointerCapture(e.pointerId); } catch (err) {} };

/* ---------- app state ---------- */

const PRODUCTS = [
  { id: 'coffee', emoji: '☕️', name: 'Coffee, regular', price: 2.5 },
  { id: 'bec', emoji: '🥯', name: 'Bacon, egg + cheese', price: 6.0 },
  { id: 'seltzer', emoji: '🥤', name: 'Lime seltzer', price: 1.75 },
  { id: 'cookie', emoji: '🍪', name: 'Chocolate chip cookie', price: 3.0 },
];

const state = {
  bag: new Map(),      // id -> qty (insertion order preserved)
  saved: new Set(),
  felt: new Set(),
};

const money = (n) => `$${n.toFixed(2)}`;
const bagCount = () => [...state.bag.values()].reduce((a, b) => a + b, 0);
const bagTotal = () => [...state.bag].reduce((a, [id, q]) => a + PRODUCTS.find(p => p.id === id).price * q, 0);

/* ---------- coach + rail ---------- */

const STEPS = [
  ['press', 'Press ADD — feel it press back'],
  ['throw', 'Now throw the bag sheet open'],
  ['hold', 'Hold ✕ on an item until it gives'],
  ['undo', 'Undo it — or swipe the toast away'],
  ['slide', 'Slide over to Saved'],
  ['flip', 'Flip the lights'],
  ['commit', 'Drag the sheet up and place the order'],
];

let coachTimer = 0;
function coachShow(text) {
  clearTimeout(coachTimer);
  coachEl.classList.add('is-out');
  coachTimer = setTimeout(() => {
    coachEl.textContent = text;
    coachEl.classList.remove('is-out');
  }, RM ? 60 : 240);
}

function coachSync() {
  const next = STEPS.find(([id]) => !state.felt.has(id));
  if (next) coachShow(next[1]);
  else { coachShow('Free play. Feel everything again.'); railDone.hidden = false; }
}

function felt(id) {
  if (state.felt.has(id)) return;
  state.felt.add(id);
  const li = rail.querySelector(`[data-m="${id}"]`);
  if (li) li.classList.add('is-felt');
  buzz(6);
  coachSync();
}

/* ---------- FLIP list rendering (delete/undo re-flow rides springs) ---------- */

function flipList(container, render) {
  const before = new Map();
  $$('[data-key]', container).forEach((el) => before.set(el.dataset.key, el.getBoundingClientRect().top));
  render();
  $$('[data-key]', container).forEach((el) => {
    const old = before.get(el.dataset.key);
    const now = el.getBoundingClientRect().top;
    if (old === undefined) {
      /* entering: settle in from a slightly smaller, lower place */
      const s = new Spring(0, { response: 0.38, damping: 0.82, onUpdate: (x) => {
        el.style.transform = `translateY(${(1 - x) * 10}px) scale(${0.94 + x * 0.06})`;
        el.style.opacity = String(clamp(x, 0, 1));
      } });
      s.to(1);
    } else if (Math.abs(old - now) > 0.5) {
      const s = new Spring(old - now, { response: 0.4, damping: 0.9, onUpdate: (x) => {
        el.style.transform = `translateY(${x}px)`;
      } });
      s.to(0);
    }
  });
}

/* ---------- press physics: buttons that press back ---------- */

function pressable(el, { down = 0.94, releaseDamping = 0.6 } = {}) {
  const s = new Spring(1, { response: 0.16, damping: 1, onUpdate: (x) => { el.style.transform = `scale(${x.toFixed(4)})`; } });
  el.addEventListener('pointerdown', (e) => {
    capture(el, e);
    s.tune(0.14, 1).to(down);
  });
  const up = () => s.tune(0.34, releaseDamping).to(1);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('lostpointercapture', up);
  return s;
}

/* ---------- shop panel ---------- */

const shopPanel = $('[data-panel="shop"]');
const savedList = $('[data-saved-list]');
const savedEmpty = $('[data-saved-empty]');

const HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5C7 16.6 3.5 13.4 3.5 9.9 3.5 7.2 5.6 5 8.2 5c1.5 0 2.9.7 3.8 1.9C12.9 5.7 14.3 5 15.8 5c2.6 0 4.7 2.2 4.7 4.9 0 3.5-3.5 6.7-8.5 10.6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg><span class="heart__ring"></span>';

function productRow(p) {
  const row = document.createElement('article');
  row.className = 'row';
  row.dataset.key = p.id;
  row.innerHTML = `
    <span class="row__tile">${p.emoji}</span>
    <div class="row__info"><p class="row__name">${p.name}</p><p class="row__price">${money(p.price)}</p></div>
    <button class="heart" type="button" aria-label="Save ${p.name}" style="position:relative">${HEART_SVG}</button>
    <button class="add" type="button"><span class="add__label">Add</span></button>`;
  const heart = $('.heart', row);
  const addBtn = $('.add', row);

  /* heart: springy pop + ring */
  const heartIcon = $('svg', heart);
  const hs = new Spring(1, { response: 0.3, damping: 0.5, onUpdate: (x) => { heartIcon.style.transform = `scale(${x.toFixed(4)})`; } });
  heart.addEventListener('click', () => {
    const on = !state.saved.has(p.id);
    on ? state.saved.add(p.id) : state.saved.delete(p.id);
    heart.classList.toggle('is-on', on);
    hs.set(on ? 0.6 : 0.85).to(1);
    if (on && !RM) {
      const ring = $('.heart__ring', heart);
      ring.classList.remove('is-live'); void ring.offsetWidth; ring.classList.add('is-live');
    }
    renderSaved();
  });

  /* add: press-back + morph + badge squash */
  pressable(addBtn, { down: 0.92, releaseDamping: 0.55 });
  addBtn.addEventListener('click', () => {
    state.bag.set(p.id, (state.bag.get(p.id) || 0) + 1);
    addBtn.classList.add('is-swapping');
    setTimeout(() => {
      $('.add__label', addBtn).textContent = '✓ Added';
      addBtn.classList.add('is-added');
      addBtn.classList.remove('is-swapping');
    }, RM ? 0 : 150);
    setTimeout(() => {
      addBtn.classList.add('is-swapping');
      setTimeout(() => {
        $('.add__label', addBtn).textContent = 'Add';
        addBtn.classList.remove('is-added', 'is-swapping');
      }, RM ? 0 : 150);
    }, 1100);
    renderBadge(true);
    renderBag();
    felt('press');
  });

  return row;
}

PRODUCTS.forEach((p) => shopPanel.appendChild(productRow(p)));
const shopFoot = document.createElement('p');
shopFoot.className = 'panel__foot';
shopFoot.textContent = 'Open 24/7 · Broome & Lafayette';
shopPanel.appendChild(shopFoot);

function savedRow(p) {
  const row = document.createElement('article');
  row.className = 'row';
  row.dataset.key = `s-${p.id}`;
  row.innerHTML = `
    <span class="row__tile">${p.emoji}</span>
    <div class="row__info"><p class="row__name">${p.name}</p><p class="row__price">${money(p.price)}</p></div>
    <button class="heart is-on" type="button" aria-label="Unsave ${p.name}" style="position:relative">${HEART_SVG}</button>`;
  $('.heart', row).addEventListener('click', () => {
    state.saved.delete(p.id);
    const shopHeart = $$('.row', shopPanel).find(r => r.dataset.key === p.id);
    if (shopHeart) $('.heart', shopHeart).classList.remove('is-on');
    renderSaved();
  });
  return row;
}

function renderSaved() {
  savedEmpty.style.display = state.saved.size ? 'none' : '';
  flipList(savedList, () => {
    savedList.innerHTML = '';
    [...state.saved].forEach((id) => savedList.appendChild(savedRow(PRODUCTS.find(p => p.id === id))));
  });
}

/* ---------- badge squash ---------- */

const badge = $('[data-badge]');
const badgeSpring = new Spring(1, { response: 0.32, damping: 0.45, onUpdate: (x) => { badge.style.transform = `scale(${Math.max(0.2, x).toFixed(4)})`; } });

function renderBadge(pop) {
  const n = bagCount();
  badge.hidden = n === 0;
  badge.textContent = String(n);
  if (pop && n > 0) badgeSpring.set(0.55).to(1);
}

/* ---------- bottom sheet: throw physics ---------- */

const sheet = $('[data-sheet]');
const scrim = $('[data-scrim]');
const sheetFoot = $('[data-sheet-foot]');
const confirmBox = $('[data-confirm]');
sheetFoot.hidden = false;
confirmBox.hidden = true;
confirmBox.style.display = 'none';

const sheetPos = { full: 0, half: 0, closed: 0 };
function measureSheet() {
  const h = sheet.getBoundingClientRect().height || 1;
  sheetPos.full = 0;
  sheetPos.half = h * 0.46;
  sheetPos.closed = h + 24;
}
measureSheet();
window.addEventListener('resize', measureSheet);

const sheetSpring = new Spring(sheetPos.closed || 640, {
  response: 0.42, damping: 0.86,
  onUpdate: (y) => {
    sheet.style.transform = `translateY(${y.toFixed(2)}px)`;
    const openness = 1 - clamp(y / (sheetPos.closed || 1), 0, 1);
    scrim.style.opacity = (openness * 0.9).toFixed(3);
    scrim.classList.toggle('is-active', openness > 0.06);
  },
});
sheetSpring.set(sheetPos.closed);

let sheetName = 'closed';
function sheetTo(name, velocity = null) {
  sheetName = name;
  sheetSpring.to(sheetPos[name], velocity);
}

const sheetTracker = makeVelocityTracker();
let sheetDrag = null;

sheet.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button, input, .zap')) return;
  capture(sheet, e);
  sheetDrag = { startY: e.clientY, startPos: sheetSpring.x, moved: false };
  sheetTracker.reset();
  sheetTracker.push(e.clientX, e.clientY);
  engine.set.delete(sheetSpring); /* grab it mid-flight */
});

sheet.addEventListener('pointermove', (e) => {
  if (!sheetDrag) return;
  sheetTracker.push(e.clientX, e.clientY);
  let y = sheetDrag.startPos + (e.clientY - sheetDrag.startY);
  if (Math.abs(e.clientY - sheetDrag.startY) > 6) sheetDrag.moved = true;
  if (y < sheetPos.full) y = sheetPos.full + rubberband(y - sheetPos.full, sheet.getBoundingClientRect().height);
  if (y > sheetPos.closed) y = sheetPos.closed;
  sheetSpring.set(y);
});

function sheetRelease(e) {
  if (!sheetDrag) return;
  const wasDrag = sheetDrag.moved;
  sheetDrag = null;
  const { vy } = sheetTracker.read();
  const projected = sheetSpring.x + project(vy);
  let best = 'closed', dist = Infinity;
  for (const name of ['full', 'half', 'closed']) {
    const d = Math.abs(projected - sheetPos[name]);
    if (d < dist) { dist = d; best = name; }
  }
  sheetTo(best, vy);
  if (wasDrag && (best === 'half' || best === 'full') && Math.abs(vy) > 120) felt('throw');
}
sheet.addEventListener('pointerup', sheetRelease);
sheet.addEventListener('pointercancel', sheetRelease);

$('[data-bag-btn]').addEventListener('click', () => sheetTo(sheetName === 'closed' ? 'half' : 'closed'));
scrim.addEventListener('pointerdown', () => sheetTo('closed'));

/* ---------- bag list + hold-to-delete ---------- */

const bagList = $('[data-bag-list]');
const bagEmpty = $('[data-bag-empty]');
const totalEl = $('[data-total]');

function bagRow(id, qty) {
  const p = PRODUCTS.find(x => x.id === id);
  const row = document.createElement('article');
  row.className = 'row';
  row.dataset.key = `b-${id}`;
  row.innerHTML = `
    <span class="row__tile">${p.emoji}</span>
    <div class="row__info"><p class="row__name">${p.name}${qty > 1 ? ` ×${qty}` : ''}</p><p class="row__price">${money(p.price * qty)}</p></div>
    <button class="zap" type="button" aria-label="Hold to remove ${p.name}"><span class="zap__fill"></span><span class="zap__x">✕</span></button>`;

  const zap = $('.zap', row);
  const fill = $('.zap__fill', zap);
  let holdTimer = 0;
  let armed = false;

  const disarm = () => {
    if (!armed) return;
    armed = false;
    clearTimeout(holdTimer);
    row.classList.remove('is-arming');
    zap.classList.remove('is-arming');
    fill.style.transition = 'clip-path 180ms cubic-bezier(0.23, 1, 0.32, 1)';
    fill.style.clipPath = 'inset(0 100% 0 0)';
  };

  zap.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    capture(zap, e);
    armed = true;
    row.classList.add('is-arming');
    zap.classList.add('is-arming');
    fill.style.transition = `clip-path ${RM ? 400 : 1050}ms linear`;
    void fill.offsetWidth;
    fill.style.clipPath = 'inset(0 0% 0 0)';
    holdTimer = setTimeout(() => {
      armed = false;
      removeFromBag(id);
    }, RM ? 420 : 1080);
  });
  zap.addEventListener('pointerup', disarm);
  zap.addEventListener('pointercancel', disarm);
  zap.addEventListener('lostpointercapture', disarm);

  return row;
}

function renderBag() {
  bagEmpty.style.display = state.bag.size ? 'none' : '';
  totalEl.textContent = money(bagTotal());
  flipList(bagList, () => {
    bagList.innerHTML = '';
    [...state.bag].forEach(([id, qty]) => bagList.appendChild(bagRow(id, qty)));
  });
}

let lastRemoved = null;

function removeFromBag(id) {
  const qty = state.bag.get(id);
  if (!qty) return;
  const order = [...state.bag.keys()];
  lastRemoved = { id, qty, index: order.indexOf(id) };
  state.bag.delete(id);
  buzz(10);
  renderBag();
  renderBadge(true);
  felt('hold');
  const p = PRODUCTS.find(x => x.id === id);
  toastShow(`Removed ${p.name}`, () => {
    if (!lastRemoved) return;
    const entries = [...state.bag];
    entries.splice(lastRemoved.index, 0, [lastRemoved.id, lastRemoved.qty]);
    state.bag = new Map(entries);
    lastRemoved = null;
    renderBag();
    renderBadge(true);
  });
}

/* ---------- toast: enters on a spring, rides your swipe ---------- */

const toast = $('[data-toast]');
const toastText = $('[data-toast-text]');
const toastUndo = $('[data-toast-undo]');

const toastY = new Spring(110, { response: 0.42, damping: 0.72, onUpdate: (y) => applyToast() });
const toastX = new Spring(0, { response: 0.38, damping: 0.9, onUpdate: () => applyToast() });

function applyToast() {
  toast.style.transform = `translate(${toastX.x.toFixed(2)}px, ${toastY.x.toFixed(2)}px)`;
  const w = toast.getBoundingClientRect().width || 300;
  toast.style.opacity = String(clamp(1 - Math.abs(toastX.x) / w, 0, 1));
}

let toastTimer = 0;
let toastUndoFn = null;

function toastShow(text, onUndo) {
  toastText.textContent = text;
  toastUndoFn = onUndo;
  toast.hidden = false;
  toastX.set(0);
  toastY.set(110).to(0);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastHide('down'), 4600);
}

function toastHide(how, velocity = 0) {
  clearTimeout(toastTimer);
  toastUndoFn = null;
  if (how === 'down') {
    toastY.to(120);
    toastY.settled = () => { toast.hidden = true; };
  } else {
    const w = toast.getBoundingClientRect().width || 300;
    toastX.to(how === 'left' ? -(w + 60) : w + 60, velocity);
    toastX.settled = () => { toast.hidden = true; toastX.set(0); };
  }
}

toastUndo.addEventListener('click', () => {
  const fn = toastUndoFn;
  toastHide('down');
  fn && fn();
  felt('undo');
});

const toastTracker = makeVelocityTracker();
let toastDrag = null;

toast.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  capture(toast, e);
  clearTimeout(toastTimer);
  toastDrag = { startX: e.clientX, startPos: toastX.x };
  toastTracker.reset();
  toastTracker.push(e.clientX, e.clientY);
  engine.set.delete(toastX);
});

toast.addEventListener('pointermove', (e) => {
  if (!toastDrag) return;
  toastTracker.push(e.clientX, e.clientY);
  toastX.set(toastDrag.startPos + (e.clientX - toastDrag.startX));
});

function toastRelease() {
  if (!toastDrag) return;
  toastDrag = null;
  const { vx } = toastTracker.read();
  const w = toast.getBoundingClientRect().width || 300;
  /* a flick dismisses regardless of distance; distance dismisses regardless of speed */
  if (Math.abs(vx) > 110 || Math.abs(toastX.x) > w * 0.4) {
    toastHide((vx || toastX.x) < 0 ? 'left' : 'right', vx);
    felt('undo');
  } else {
    toastX.to(0, vx);
    toastTimer = setTimeout(() => toastHide('down'), 2600);
  }
}
toast.addEventListener('pointerup', toastRelease);
toast.addEventListener('pointercancel', toastRelease);

/* ---------- tabs: the color slides, clipped ---------- */

const tabsActive = $('[data-tabs-active]');
const tabSpring = new Spring(0, { response: 0.34, damping: 1, onUpdate: (t) => {
  const left = clamp(t, 0, 1) * 50;
  const right = 50 - clamp(t, 0, 1) * 50;
  tabsActive.style.clipPath = `inset(0 ${right}% 0 ${left}% round 999px)`;
} });

$$('[data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const toSaved = btn.dataset.tab === 'saved';
    tabSpring.to(toSaved ? 1 : 0);
    $$('.panel').forEach((p) => p.classList.toggle('is-on', p.dataset.panel === btn.dataset.tab));
    if (toSaved) felt('slide');
  });
});

/* ---------- theme flip ---------- */

const themeKnob = $('[data-theme-knob]');
const knobSpring = new Spring(0, { response: 0.32, damping: 0.68, onUpdate: (x) => { themeKnob.style.transform = `translateX(${x.toFixed(2)}px)`; } });

$('[data-theme-btn]').addEventListener('click', () => {
  const dark = phone.dataset.theme !== 'dark';
  phone.dataset.theme = dark ? 'dark' : 'light';
  knobSpring.to(dark ? 19 : 0);
  buzz(8);
  felt('flip');
});

/* ---------- checkout: errors shake, success settles ---------- */

const orderBtn = $('[data-order]');
const orderLabel = $('[data-order-label]');
const field = $('[data-field]');
const nameInput = $('[data-name]');
const confirmMark = $('.sheet__confirm-mark');
const sheetItems = $('[data-bag-list]');

pressable(orderBtn, { down: 0.97, releaseDamping: 0.7 });
nameInput.addEventListener('input', () => field.classList.remove('is-err'));

let ordering = false;

orderBtn.addEventListener('click', () => {
  if (ordering) return;
  if (!state.bag.size) {
    coachShow('Bag is empty — add something first');
    setTimeout(coachSync, 2200);
    return;
  }
  if (!nameInput.value.trim()) {
    field.classList.add('is-err');
    if (!RM) {
      nameInput.classList.remove('shake'); void nameInput.offsetWidth; nameInput.classList.add('shake');
    }
    buzz([12, 40, 12]);
    return;
  }
  ordering = true;
  orderBtn.classList.add('is-busy');
  const spin = document.createElement('span');
  spin.className = 'order__spin';
  orderBtn.appendChild(spin);
  setTimeout(() => {
    spin.remove();
    orderBtn.classList.remove('is-busy');
    ordering = false;
    /* success settles: swap sheet content for the confirmation */
    $('.sheet__head').style.display = 'none';
    sheetItems.style.display = 'none';
    bagEmpty.style.display = 'none';
    sheetFoot.style.display = 'none';
    confirmBox.hidden = false;
    confirmBox.style.display = '';
    $('[data-confirm-line]').textContent = `Pickup in 10 minutes, ${nameInput.value.trim()}.`;
    const ms = new Spring(0.5, { response: 0.4, damping: 0.55, onUpdate: (x) => { confirmMark.style.transform = `scale(${x.toFixed(4)})`; } });
    ms.to(1);
    state.bag.clear();
    renderBadge(true);
    buzz([10, 60, 18]);
    felt('commit');
    setTimeout(() => {
      sheetTo('closed');
      setTimeout(() => {
        confirmBox.hidden = true;
        confirmBox.style.display = 'none';
        $('.sheet__head').style.display = '';
        sheetItems.style.display = '';
        sheetFoot.style.display = '';
        nameInput.value = '';
        renderBag();
      }, 500);
    }, 2400);
  }, RM ? 300 : 800);
});

/* ---------- boot ---------- */

renderBag();
renderBadge(false);
renderSaved();
coachSync();

/* ---------- dev hooks ---------- */

window.__feel = {
  state,
  sheetTo,
  project,
  rubberband,
  Spring,
  info: () => ({
    felt: [...state.felt],
    bag: [...state.bag],
    sheet: sheetName,
    sheetY: +sheetSpring.x.toFixed(1),
    theme: phone.dataset.theme,
    springsLive: engine.set.size,
  }),
};

/* ---------- acceptance checks (?test=1) ---------- */

if (TESTMODE) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: String(detail) });
  const fire = (el, type, opts = {}) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: 0, clientY: 0, ...opts }));

  (async () => {
    await sleep(500);
    let fps = 0;
    (function count(prev) {
      let frames = 0; const t0 = performance.now();
      const loop = (ts) => { frames++; if (ts - t0 < 1000) requestAnimationFrame(loop); else fps = frames; };
      requestAnimationFrame(loop);
    })();

    /* pure physics */
    const s = new Spring(0, { response: 0.3, damping: 1 });
    s.target = 1;
    for (let i = 0; i < 400; i++) s.step(1 / 120);
    check('spring settles', Math.abs(s.x - 1) < 0.01, s.x.toFixed(4));
    check('projection sane', project(1000) > 400 && project(1000) < 600, project(1000).toFixed(0));
    check('rubberband bounded', rubberband(600, 700) < 320 && rubberband(300, 700) < rubberband(600, 700), rubberband(600, 700).toFixed(0));

    /* press responds on pointer-down */
    const addBtn = $('.add', shopPanel);
    fire(addBtn, 'pointerdown');
    await sleep(90);
    const m = new DOMMatrixReadOnly(getComputedStyle(addBtn).transform);
    check('press responds on touch-down', m.a < 0.995, `scale=${m.a.toFixed(3)}`);
    fire(addBtn, 'pointerup');
    addBtn.click();
    await sleep(120);
    check('add fills bag', bagCount() === 1 && !badge.hidden, `count=${bagCount()}`);

    /* sheet snaps with velocity projection */
    sheetTo('half');
    await sleep(700);
    check('sheet snaps to half', Math.abs(sheetSpring.x - sheetPos.half) < 40, `y=${sheetSpring.x.toFixed(0)} target=${sheetPos.half.toFixed(0)}`);
    const projected = sheetPos.half + project(-1400);
    const nearerFull = Math.abs(projected - sheetPos.full) < Math.abs(projected - sheetPos.half);
    check('flick projects past half', nearerFull, `projected=${projected.toFixed(0)}`);

    /* hold: early release keeps the item */
    const zap = $('.zap', bagList);
    fire(zap, 'pointerdown');
    await sleep(250);
    fire(zap, 'pointerup');
    await sleep(250);
    check('early release keeps item', bagCount() === 1, `count=${bagCount()}`);

    /* hold to commit deletes + toast */
    fire(zap, 'pointerdown');
    await sleep(RM ? 600 : 1250);
    check('hold commit deletes', bagCount() === 0, `count=${bagCount()}`);
    check('toast arrived', !toast.hidden, '');

    /* undo restores */
    toastUndo.click();
    await sleep(200);
    check('undo restores item', bagCount() === 1, `count=${bagCount()}`);

    /* tabs slide the clip */
    $$('[data-tab]').find(b => b.dataset.tab === 'saved').click();
    await sleep(500);
    check('tabs clip slides', tabsActive.style.clipPath.includes('50% round'), tabsActive.style.clipPath);
    $$('[data-tab]').find(b => b.dataset.tab === 'shop').click();

    /* theme flips */
    $('[data-theme-btn]').click();
    await sleep(400);
    check('theme flips dark', phone.dataset.theme === 'dark' && knobSpring.x > 8, `x=${knobSpring.x.toFixed(1)}`);
    $('[data-theme-btn]').click();

    /* checkout: error shakes, success settles */
    sheetTo('full');
    await sleep(600);
    nameInput.value = '';
    orderBtn.click();
    await sleep(150);
    check('empty name errors', field.classList.contains('is-err'), '');
    nameInput.value = 'Dave';
    nameInput.dispatchEvent(new Event('input'));
    orderBtn.click();
    await sleep(RM ? 700 : 1300);
    check('order confirms', !confirmBox.hidden, '');
    check('bag cleared on order', bagCount() === 0, '');

    await sleep(900);
    check('fps healthy', fps > 40 || RM, `fps=${fps}`);
    check('moments tracked', state.felt.size >= 5, [...state.felt].join(','));

    window.__testResults = { pass: results.every(r => r.ok), results };
    console.log('[FEEL TESTS]', JSON.stringify(window.__testResults, null, 1));
  })();
}
