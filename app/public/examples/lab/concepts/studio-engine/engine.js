/* engine.js — Describe it. Watch it happen.
   A deterministic design system: four business kits × three vibes, all
   generated in-browser. The site materializes in phases — skeleton →
   type → color flood → imagery — and re-skins live on a vibe switch. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const input = $('[data-input]');
const askForm = $('[data-ask]');
const picks = $('[data-picks]');
const vibesBar = $('[data-vibes]');
const frameBody = $('[data-site]');
const urlEl = $('[data-url]');

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TESTMODE = new URLSearchParams(location.search).has('test');

/* ---------- the kits: content + hue + imagery per business ---------- */

const KITS = {
  wine: {
    label: 'Wine bar',
    name: 'Hush & Pour',
    domain: 'hushandpour.nyc',
    kicker: 'Natural wine · Red Hook',
    hero: 'Small pours. Long evenings.',
    sub: 'A candlelit natural wine bar at the end of Van Brunt — forty bottles, six by the glass, and a kitchen that closes late.',
    cta: 'Reserve a table',
    sectionTitle: 'By the glass',
    items: [
      ['Pét-nat, Loire', 'Cloudy, alive, a little wild. Poured cold.', '$16'],
      ['Trousseau, Jura', 'Light red for people who say they hate red.', '$17'],
      ['Orange, Friuli', 'Ten days on skins. Apricot and salt.', '$15'],
    ],
    aboutTitle: 'Open till 2am, Thursday–Sunday',
    about: 'We opened in 2019 with one rule: nothing on the list we wouldn\'t drink at home. Come alone, bring a book, stay past your bedtime.',
    foot: '411 Van Brunt St, Brooklyn · Walk-ins welcome',
    hue: 340,
    art: (a) => `radial-gradient(120% 150% at 20% 0%, hsl(${a} 55% 38%) 0%, hsl(${a - 25} 45% 22%) 60%, hsl(${a - 40} 40% 14%) 100%)`,
    cardArts: [
      (a) => `radial-gradient(90% 120% at 30% 20%, hsl(${a + 12} 60% 52%), hsl(${a - 10} 50% 30%))`,
      (a) => `radial-gradient(90% 120% at 70% 30%, hsl(${a - 30} 45% 46%), hsl(${a - 45} 42% 26%))`,
      (a) => `radial-gradient(90% 120% at 50% 80%, hsl(${a + 28} 62% 55%), hsl(${a} 48% 30%))`,
    ],
  },
  barber: {
    label: 'Barbershop',
    name: 'Fadeaway',
    domain: 'fadeaway.nyc',
    kicker: 'Barbershop · Lower East Side',
    hero: 'Walk in rough. Walk out right.',
    sub: 'Four chairs, no attitude, twenty minutes. Fades, tapers, beard work — book online or take your chances as a walk-in.',
    cta: 'Book a chair',
    sectionTitle: 'The menu',
    items: [
      ['Skin fade', 'Tight to the bone, blended like weather.', '$38'],
      ['Scissor cut', 'For length that needs judgment, not clippers.', '$45'],
      ['Beard + hot towel', 'Line-up, oil, and ten quiet minutes.', '$28'],
    ],
    aboutTitle: 'Tue–Sat · 9am to 7pm',
    about: 'Fifteen years cutting on Ludlow. Cash or card, kids welcome before 3, and the playlist is not up for discussion.',
    foot: '188 Ludlow St · Walk-ins after 4pm',
    hue: 210,
    art: (a) => `linear-gradient(135deg, hsl(${a} 45% 30%) 0%, hsl(${a - 20} 40% 18%) 55%, hsl(${a + 15} 35% 12%) 100%)`,
    cardArts: [
      (a) => `linear-gradient(120deg, hsl(${a} 50% 48%), hsl(${a - 25} 45% 26%))`,
      (a) => `linear-gradient(150deg, hsl(${a + 20} 42% 52%), hsl(${a} 40% 28%))`,
      (a) => `linear-gradient(100deg, hsl(${a - 35} 38% 44%), hsl(${a - 15} 42% 24%))`,
    ],
  },
  bakery: {
    label: 'Bakery',
    name: 'Crumb Theory',
    domain: 'crumbtheory.nyc',
    kicker: 'Bakery · Astoria',
    hero: 'Butter is a love language.',
    sub: 'Naturally leavened everything — sourdough at 7, croissants till they\'re gone, and a bench out front for the first bite.',
    cta: 'See today\'s bake',
    sectionTitle: 'Out of the oven',
    items: [
      ['Sea-salt croissant', 'Forty-nine layers. We counted.', '$5'],
      ['Country loaf', 'Thirty-hour ferment, burnished crust.', '$9'],
      ['Rye chocolate cookie', 'Half cookie, half confession.', '$4'],
    ],
    aboutTitle: 'Daily · 7am until sold out',
    about: 'Two ovens, one starter named Franklin, zero shortcuts. If the case looks empty by noon, that\'s not a supply problem — that\'s Astoria.',
    foot: '31-08 Ditmars Blvd · Pre-order Fridays',
    hue: 36,
    art: (a) => `radial-gradient(130% 140% at 80% 10%, hsl(${a} 78% 62%) 0%, hsl(${a - 12} 70% 46%) 55%, hsl(${a - 24} 60% 32%) 100%)`,
    cardArts: [
      (a) => `radial-gradient(100% 120% at 30% 30%, hsl(${a + 8} 82% 66%), hsl(${a - 8} 68% 44%))`,
      (a) => `radial-gradient(100% 120% at 70% 20%, hsl(${a - 14} 66% 52%), hsl(${a - 22} 58% 34%))`,
      (a) => `radial-gradient(100% 120% at 50% 90%, hsl(${a + 16} 80% 60%), hsl(${a} 64% 40%))`,
    ],
  },
  pilates: {
    label: 'Pilates studio',
    name: 'Standing Still',
    domain: 'standingstill.nyc',
    kicker: 'Pilates · Fort Greene',
    hero: 'Strong is a quiet thing.',
    sub: 'Reformer and mat classes capped at eight people, taught slow, cued precisely. First session is on us.',
    cta: 'Claim a free class',
    sectionTitle: 'This week',
    items: [
      ['Reformer basics', 'Footwork to teaser, no rushing.', '$34'],
      ['Mat at sunrise', '7am. Coffee after. You\'ll be back.', '$22'],
      ['Deep stretch', 'Fifty minutes of undoing your desk.', '$26'],
    ],
    aboutTitle: 'Seven days · 6:30am to 8pm',
    about: 'We opened Standing Still because fitness in this city got loud. Eight bodies, one instructor, zero mirrors-and-yelling energy.',
    foot: '68 Lafayette Ave, Brooklyn · Mats provided',
    hue: 160,
    art: (a) => `linear-gradient(160deg, hsl(${a} 35% 42%) 0%, hsl(${a - 18} 30% 26%) 60%, hsl(${a - 30} 28% 16%) 100%)`,
    cardArts: [
      (a) => `linear-gradient(140deg, hsl(${a + 10} 38% 54%), hsl(${a - 8} 32% 32%))`,
      (a) => `linear-gradient(160deg, hsl(${a - 20} 30% 48%), hsl(${a - 32} 28% 28%))`,
      (a) => `linear-gradient(120deg, hsl(${a + 24} 34% 50%), hsl(${a + 4} 30% 30%))`,
    ],
  },
};

/* ---------- the vibes: one token set re-skins everything ---------- */

const VIBES = {
  warm: {
    label: 'Warm minimal',
    tokens: (hue) => ({
      '--s-bg': `hsl(${hue} 28% 96%)`,
      '--s-ink': `hsl(${hue} 32% 12%)`,
      '--s-dim': `hsl(${hue} 14% 38%)`,
      '--s-card': `hsl(${hue} 30% 91%)`,
      '--s-line': `hsl(${hue} 20% 84%)`,
      '--s-accent': `hsl(${hue} 72% 44%)`,
      '--s-accent-ink': `hsl(${hue} 40% 97%)`,
      '--s-display': '"Fraunces", serif',
      '--s-display-weight': '600',
      '--s-display-track': '-0.015em',
      '--s-display-case': 'none',
      '--s-logo-case': 'none',
      '--s-radius': '18px',
      '--s-hero-ink': `hsl(${hue} 30% 97%)`,
      '--s-hero-dim': `hsl(${hue} 26% 88% / 0.85)`,
      '--s-hero-kicker': `hsl(${hue} 60% 80%)`,
    }),
  },
  bold: {
    label: 'Bold editorial',
    tokens: (hue) => ({
      '--s-bg': `hsl(${hue} 10% 97%)`,
      '--s-ink': `hsl(${hue} 25% 8%)`,
      '--s-dim': `hsl(${hue} 10% 34%)`,
      '--s-card': `hsl(${hue} 12% 92%)`,
      '--s-line': `hsl(${hue} 15% 82%)`,
      '--s-accent': `hsl(${hue} 85% 48%)`,
      '--s-accent-ink': `hsl(${hue} 30% 98%)`,
      '--s-display': '"Barlow Condensed", sans-serif',
      '--s-display-weight': '800',
      '--s-display-track': '0.005em',
      '--s-display-case': 'uppercase',
      '--s-logo-case': 'uppercase',
      '--s-logo-track': '0.06em',
      '--s-radius': '8px',
      '--s-hero-ink': `hsl(${hue} 20% 98%)`,
      '--s-hero-dim': `hsl(${hue} 15% 90% / 0.85)`,
      '--s-hero-kicker': `hsl(${hue} 70% 78%)`,
    }),
  },
  night: {
    label: 'Late night',
    tokens: (hue) => ({
      '--s-bg': `hsl(${hue} 30% 8%)`,
      '--s-ink': `hsl(${hue} 25% 94%)`,
      '--s-dim': `hsl(${hue} 15% 66%)`,
      '--s-card': `hsl(${hue} 26% 13%)`,
      '--s-line': `hsl(${hue} 20% 20%)`,
      '--s-accent': `hsl(${hue} 90% 62%)`,
      '--s-accent-ink': `hsl(${hue} 60% 8%)`,
      '--s-display': '"Space Grotesk", sans-serif',
      '--s-display-weight': '700',
      '--s-display-track': '-0.01em',
      '--s-display-case': 'none',
      '--s-logo-case': 'none',
      '--s-radius': '14px',
      '--s-hero-ink': `hsl(${hue} 25% 96%)`,
      '--s-hero-dim': `hsl(${hue} 18% 80% / 0.85)`,
      '--s-hero-kicker': `hsl(${hue} 85% 72%)`,
    }),
  },
};

/* ---------- parse a typed brief ---------- */

const TYPE_WORDS = {
  wine: ['wine', 'bar', 'cocktail', 'taproom', 'brewery', 'speakeasy', 'lounge'],
  barber: ['barber', 'cuts', 'fade', 'salon', 'grooming', 'shave'],
  bakery: ['bakery', 'bake', 'bread', 'pastry', 'croissant', 'cafe', 'café', 'coffee', 'donut', 'pizza', 'restaurant', 'deli'],
  pilates: ['pilates', 'yoga', 'gym', 'fitness', 'studio', 'wellness', 'spa', 'training'],
};

function parseBrief(text) {
  const t = text.toLowerCase();
  let type = null;
  for (const [k, words] of Object.entries(TYPE_WORDS)) {
    if (words.some(w => t.includes(w))) { type = k; break; }
  }
  if (!type) type = ['wine', 'barber', 'bakery', 'pilates'][Math.abs([...t].reduce((a, c) => a + c.charCodeAt(0), 0)) % 4];
  /* name: possessive or leading capitalized words ("Marco's Pizza", "Blue Door Bakery") */
  let name = null;
  const poss = text.match(/([A-Z][\w']+(?:\s+[A-Z][\w']+)*)/);
  if (poss && poss[1] && poss[1].length > 2 && !/^(A|An|The|My|Our)$/i.test(poss[1])) name = poss[1];
  return { type, name };
}

/* ---------- render the site ---------- */

let current = { type: 'wine', vibe: 'warm', name: null };

function render({ type, vibe, name }) {
  const kit = KITS[type];
  const tokens = VIBES[vibe].tokens(kit.hue);
  const siteName = name || kit.name;

  const site = document.createElement('div');
  site.className = 'site';
  for (const [k, v] of Object.entries(tokens)) site.style.setProperty(k, v);
  site.style.setProperty('--s-hero', kit.art(kit.hue));

  site.innerHTML = `
    <div class="skel" aria-hidden="true">
      <div class="skel__row"><i class="skel__logo"></i><i class="skel__nav"></i></div>
      <i class="skel__hero"></i>
      <i class="skel__line-a"></i>
      <i class="skel__line-b"></i>
      <div class="skel__cards"><i class="skel__card"></i><i class="skel__card"></i><i class="skel__card"></i></div>
    </div>
    <nav class="site__nav" data-m="0">
      <span class="site__logo">${siteName}</span>
      <span class="site__links"><a href="#">${kit.sectionTitle}</a><a href="#">About</a><a href="#">Visit</a></span>
    </nav>
    <header class="site__hero" data-m="1">
      <p class="site__kicker">${kit.kicker}</p>
      <h1 class="site__headline">${kit.hero}</h1>
      <p class="site__sub">${kit.sub}</p>
      <a class="site__cta" href="#">${kit.cta}</a>
    </header>
    <section class="site__section" data-m="2">
      <h2 class="site__section-title">${kit.sectionTitle}</h2>
      <div class="site__cards">
        ${kit.items.map(([n, d, p], i) => `
          <article class="site__card">
            <div class="site__card-art" style="--art:${kit.cardArts[i](kit.hue)}"></div>
            <div class="site__card-body">
              <p class="site__card-name"><span>${n}</span><b>${p}</b></p>
              <p class="site__card-desc">${d}</p>
            </div>
          </article>`).join('')}
      </div>
    </section>
    <section class="site__about" data-m="3">
      <b>${kit.aboutTitle}</b>
      <p>${kit.about}</p>
    </section>
    <footer class="site__foot" data-m="4">
      <span>${siteName} · ${kit.foot}</span>
      <span>Site by Little Fight NYC</span>
    </footer>`;

  frameBody.innerHTML = '';
  frameBody.appendChild(site);
  urlEl.textContent = name ? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.nyc` : kit.domain;
  return site;
}

/* ---------- materialize choreography ---------- */

let phaseTimers = [];
let building = false;

function clearPhases() {
  phaseTimers.forEach(clearTimeout);
  phaseTimers = [];
  frameBody.classList.remove('m-skeleton', 'm-type', 'm-color', 'm-done', 'retheme');
}

function materialize(next) {
  clearPhases();
  building = true;
  current = next;
  syncChips();
  render(next);
  frameBody.scrollTop = 0;

  if (RM) {
    frameBody.classList.add('m-done');
    building = false;
    return;
  }

  frameBody.classList.add('m-skeleton');
  const at = (ms, fn) => phaseTimers.push(setTimeout(fn, ms));
  at(760, () => { frameBody.classList.remove('m-skeleton'); frameBody.classList.add('m-type'); });
  at(1650, () => { frameBody.classList.remove('m-type'); frameBody.classList.add('m-color'); });
  at(2450, () => { frameBody.classList.remove('m-color'); frameBody.classList.add('m-done'); building = false; });
}

/* vibe switch: no skeleton — the system just re-decides */
function retheme(vibe) {
  if (building) return;
  current.vibe = vibe;
  syncChips();
  const kit = KITS[current.type];
  const site = $('.site', frameBody);
  if (!site) return;
  frameBody.classList.add('retheme');
  const tokens = VIBES[vibe].tokens(kit.hue);
  for (const [k, v] of Object.entries(tokens)) site.style.setProperty(k, v);
  setTimeout(() => frameBody.classList.remove('retheme'), 500);
}

function syncChips() {
  $$('button', picks).forEach(b => b.classList.toggle('is-on', b.dataset.pick === current.type && !current.name));
  $$('button', vibesBar).forEach(b => b.classList.toggle('is-on', b.dataset.vibe === current.vibe));
}

/* ---------- wire up ---------- */

picks.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pick]');
  if (!b) return;
  input.value = '';
  materialize({ type: b.dataset.pick, vibe: current.vibe, name: null });
});

vibesBar.addEventListener('click', (e) => {
  const b = e.target.closest('[data-vibe]');
  if (b) retheme(b.dataset.vibe);
});

askForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const { type, name } = parseBrief(text);
  materialize({ type, vibe: current.vibe, name });
});

/* rotating placeholder */
const HINTS = [
  'a wine bar in Red Hook…',
  "Marco's Pizza on Court St…",
  'a barbershop with walk-ins…',
  'a sunrise pilates studio…',
  'a bakery that sells out by noon…',
];
let hintI = 0;
input.placeholder = `Try: ${HINTS[0]}`;
setInterval(() => {
  if (document.activeElement === input) return;
  hintI = (hintI + 1) % HINTS.length;
  input.placeholder = `Try: ${HINTS[hintI]}`;
}, 3600);

/* ---------- boot: the first site builds itself ---------- */

materialize({ type: 'wine', vibe: 'warm', name: null });

/* ---------- dev hooks ---------- */

window.__studio = {
  materialize,
  retheme,
  parseBrief,
  info: () => ({
    ...current,
    building,
    phase: ['m-skeleton', 'm-type', 'm-color', 'm-done'].find(c => frameBody.classList.contains(c)) || 'idle',
    sections: $$('.site [data-m]', frameBody).length,
    url: urlEl.textContent,
  }),
};

/* ---------- acceptance checks (?test=1) ---------- */

if (TESTMODE) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: String(detail) });

  (async () => {
    /* boot build completes */
    await sleep(RM ? 500 : 3100);
    check('boot build completes', frameBody.classList.contains('m-done'), window.__studio.info().phase);
    check('five sections render', window.__studio.info().sections === 5, window.__studio.info().sections);
    check('no legacy dashboard', !document.querySelector('select, progress, [class*="coverage"], [class*="rulebook"]'), '');

    /* chips swap the kit */
    $('[data-pick="bakery"]').click();
    await sleep(RM ? 400 : 3100);
    const bakeryLogo = $('.site__logo', frameBody).textContent;
    check('chip swaps business', bakeryLogo === 'Crumb Theory', bakeryLogo);
    check('url follows kit', urlEl.textContent === 'crumbtheory.nyc', urlEl.textContent);

    /* vibe re-skin: bg + display font change without rebuild */
    const siteEl = $('.site', frameBody);
    const bgBefore = getComputedStyle(siteEl).backgroundColor;
    const fontBefore = getComputedStyle($('.site__headline', frameBody)).fontFamily;
    $('[data-vibe="night"]').click();
    await sleep(650);
    const bgAfter = getComputedStyle(siteEl).backgroundColor;
    const fontAfter = getComputedStyle($('.site__headline', frameBody)).fontFamily;
    check('vibe floods palette', bgBefore !== bgAfter, `${bgBefore} → ${bgAfter}`);
    check('vibe swaps display font', fontBefore !== fontAfter, `${fontBefore.slice(0, 24)} → ${fontAfter.slice(0, 24)}`);
    check('same content, new skin', $('.site__logo', frameBody).textContent === 'Crumb Theory', '');

    /* typed brief: name extraction + type match */
    const parsed = parseBrief("Marco's Pizza on Court St");
    check('typed brief maps type', parsed.type === 'bakery', parsed.type);
    check('typed brief keeps the name', parsed.name === "Marco's Pizza", parsed.name);
    input.value = "Marco's Pizza on Court St";
    askForm.dispatchEvent(new Event('submit'));
    await sleep(RM ? 400 : 3100);
    check('typed name lands in the logo', $('.site__logo', frameBody).textContent === "Marco's Pizza", $('.site__logo', frameBody).textContent);
    check('typed name lands in the url', urlEl.textContent === 'marcospizza.nyc', urlEl.textContent);

    /* fps at idle */
    let fps = 0;
    await new Promise((res) => {
      let frames = 0; const t0 = performance.now();
      const loop = (ts) => { frames++; if (ts - t0 < 1000) requestAnimationFrame(loop); else { fps = frames; res(); } };
      requestAnimationFrame(loop);
    });
    check('fps healthy at idle', fps > 40 || RM, `fps=${fps}`);

    window.__testResults = { pass: results.every(r => r.ok), results };
    console.log('[STUDIO TESTS]', JSON.stringify(window.__testResults, null, 1));
  })();
}
