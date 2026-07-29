/* engine.js — Describe it. Watch it happen.
   Four business kits, each with its OWN layout DNA and iconography —
   a printed wine list, a barbershop price board, a bakery marquee, a
   studio timetable — skinned by three vibes (token sets). The site
   materializes in phases and re-skins live. */

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

/* ---------- iconography: line icons drawn per business ---------- */

const I = (paths, extra = '') =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}${extra}</svg>`;

const ICONS = {
  glass: I('<path d="M7.5 3h9l-.7 6a4.3 4.3 0 0 1-3.8 3.8V19"/><path d="M8.8 21h6.4"/><path d="M8 7.5h8"/>'),
  bottle: I('<path d="M10.2 3h3.6v2.6l1.6 2.6V20a1 1 0 0 1-1 1h-4.8a1 1 0 0 1-1-1V8.2l1.6-2.6V3Z"/><path d="M9.6 13.5h4.8"/><path d="M9.6 16.5h4.8"/>'),
  grapes: I('<circle cx="9" cy="10" r="2.1"/><circle cx="15" cy="10" r="2.1"/><circle cx="12" cy="14" r="2.1"/><path d="M12 8V4.5M12 4.5c1-.2 2-1 2.3-1.9"/>'),
  scissors: I('<circle cx="6" cy="7" r="2.3"/><circle cx="6" cy="17" r="2.3"/><path d="M8 8.6 19.5 18.5M8 15.4 19.5 5.5"/>'),
  comb: I('<path d="M5 6h14v4H5Z"/><path d="M6.8 10v4.5M9.4 10v6.5M12 10v4.5M14.6 10v6.5M17.2 10v4.5"/>'),
  pole: I('<path d="M9 5h6v14H9Z"/><path d="M9 5a3 1.6 0 0 1 6 0M9 19a3 1.6 0 0 0 6 0"/><path d="m9 9.5 6-2.6M9 13.5l6-2.6M9 17.5l6-2.6"/>'),
  razor: I('<path d="m4.5 19.5 4-4"/><path d="M8.5 15.5 17 7a2.1 2.1 0 0 1 3 3l-8.5 8.5-3-3Z"/><path d="m15.5 8.5 1.5 1.5"/>'),
  croissant: I('<path d="M4 15a8.5 8.5 0 0 1 16 0"/><path d="M4 15c0 1.4 1 2.2 2.4 1.8M20 15c0 1.4-1 2.2-2.4 1.8"/><path d="M9 9.7 8 15M15 9.7 16 15M12 8.8V15"/>'),
  bread: I('<path d="M5 10.5a3.5 3.5 0 0 1 3.5-3.5h7A3.5 3.5 0 0 1 19 10.5c0 .9-.5 1.6-1 2.1V19H6v-6.4c-.5-.5-1-1.2-1-2.1Z"/><path d="m9.5 10-1 2.5M13 10l-1 2.5M16.5 10l-1 2.5"/>'),
  cookie: I('<circle cx="12" cy="12" r="8"/><circle cx="9.4" cy="10" r=".9"/><circle cx="14.2" cy="9.2" r=".9"/><circle cx="11.6" cy="14.2" r=".9"/><circle cx="15.4" cy="13.4" r=".7"/>'),
  wheat: I('<path d="M12 21V8"/><path d="M12 11c-2.4 0-3.6-1.2-3.8-3.2C10.6 7.6 11.8 8.8 12 11ZM12 11c2.4 0 3.6-1.2 3.8-3.2C13.4 7.6 12.2 8.8 12 11ZM12 15c-2.4 0-3.6-1.2-3.8-3.2 2.4-.2 3.6 1 3.8 3.2ZM12 15c2.4 0 3.6-1.2 3.8-3.2-2.4-.2-3.6 1-3.8 3.2Z"/><path d="M12 8c.8-.8 1-2 .6-3.2C11.4 5.4 11.2 6.8 12 8Z"/>'),
  rings: I('<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="6.4" opacity=".55"/><circle cx="12" cy="12" r="9.4" opacity=".28"/>'),
  mat: I('<path d="M4 10.5h12.5a3.25 3.25 0 0 1 0 6.5H4v-6.5Z"/><circle cx="7" cy="13.75" r="1.4"/><path d="M20 10.5v6.5"/>'),
  hands: I('<path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><circle cx="12" cy="12" r="2.6"/>'),
  clock: I('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 1.8"/>'),
  pin: I('<path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10Z"/><circle cx="12" cy="10.6" r="2.2"/>'),
};

/* ---------- the kits: copy + hue + art + layout-specific data ---------- */

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
      ['Pét-nat, Loire', 'Cloudy, alive, a little wild. Poured cold.', '$16', 'glass'],
      ['Trousseau, Jura', 'Light red for people who say they hate red.', '$17', 'bottle'],
      ['Orange, Friuli', 'Ten days on skins. Apricot and salt.', '$15', 'grapes'],
      ['Chenin, Anjou', 'Honeyed nose, bone-dry finish.', '$14', 'glass'],
    ],
    aboutTitle: 'Open till 2am, Thursday–Sunday',
    about: 'We opened in 2019 with one rule: nothing on the list we wouldn\'t drink at home. Come alone, bring a book, stay past your bedtime.',
    foot: '411 Van Brunt St, Brooklyn · Walk-ins welcome',
    hue: 340,
    art: (a) => `radial-gradient(120% 150% at 20% 0%, hsl(${a} 55% 38%) 0%, hsl(${a - 25} 45% 22%) 60%, hsl(${a - 40} 40% 14%) 100%)`,
  },
  barber: {
    label: 'Barbershop',
    name: 'Fadeaway',
    domain: 'fadeaway.nyc',
    kicker: 'Barbershop · Lower East Side',
    hero: 'Walk in rough. Walk out right.',
    sub: 'Four chairs, no attitude, twenty minutes. Book online or take your chances as a walk-in.',
    cta: 'Book a chair',
    sectionTitle: 'The board',
    items: [
      ['Skin fade', 'Tight to the bone, blended like weather.', '$38', 'scissors'],
      ['Scissor cut', 'For length that needs judgment, not clippers.', '$45', 'comb'],
      ['Beard + hot towel', 'Line-up, oil, and ten quiet minutes.', '$28', 'razor'],
      ['The full works', 'Cut, beard, towel, and a strong opinion.', '$62', 'pole'],
    ],
    badge: ['EST. 2009', 'LUDLOW ST', 'WALK-INS'],
    rules: [
      ['comb', 'Kids cut before 3pm'],
      ['clock', 'Last chair at 6:40'],
      ['pin', 'Cash or card, no apps'],
    ],
    aboutTitle: 'Tue–Sat · 9am to 7pm',
    about: 'Fifteen years cutting on Ludlow. The playlist is not up for discussion.',
    foot: '188 Ludlow St · Walk-ins after 4pm',
    hue: 210,
    art: (a) => `linear-gradient(135deg, hsl(${a} 45% 30%) 0%, hsl(${a - 20} 40% 18%) 55%, hsl(${a + 15} 35% 12%) 100%)`,
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
      ['Sea-salt croissant', 'Forty-nine layers. We counted.', '$5', 'croissant'],
      ['Country loaf', 'Thirty-hour ferment, burnished crust.', '$9', 'bread'],
      ['Rye chocolate cookie', 'Half cookie, half confession.', '$4', 'cookie'],
    ],
    marquee: ['Sourdough at 7am', 'Croissants till they\'re gone', 'Pre-order Fridays', 'Starter\'s name is Franklin'],
    aboutTitle: 'Daily · 7am until sold out',
    about: 'Two ovens, one starter named Franklin, zero shortcuts. If the case looks empty by noon, that\'s not a supply problem — that\'s Astoria.',
    foot: '31-08 Ditmars Blvd · Pre-order Fridays',
    hue: 36,
    art: (a) => `radial-gradient(130% 140% at 80% 10%, hsl(${a} 78% 62%) 0%, hsl(${a - 12} 70% 46%) 55%, hsl(${a - 24} 60% 32%) 100%)`,
  },
  pilates: {
    label: 'Pilates studio',
    name: 'Standing Still',
    domain: 'standingstill.nyc',
    kicker: 'Pilates · Fort Greene',
    hero: 'Strong is a quiet thing.',
    sub: 'Reformer and mat classes capped at eight people, taught slow, cued precisely. First session is on us.',
    cta: 'Claim a free class',
    sectionTitle: 'The week',
    schedule: [
      ['Mon–Fri', '7:00', 'Mat at sunrise', '$22'],
      ['Mon–Fri', '12:15', 'Reformer basics', '$34'],
      ['Tue · Thu', '18:30', 'Deep stretch', '$26'],
      ['Weekends', '9:30', 'Open practice', '$18'],
    ],
    principles: [
      ['rings', 'Eight bodies, never more'],
      ['mat', 'Cued precisely, never yelled'],
      ['hands', 'Slow is the whole point'],
    ],
    aboutTitle: 'Seven days · 6:30am to 8pm',
    about: 'We opened Standing Still because fitness in this city got loud. No mirrors, no leaderboard, no shouting.',
    foot: '68 Lafayette Ave, Brooklyn · Mats provided',
    hue: 160,
    art: (a) => `linear-gradient(160deg, hsl(${a} 35% 42%) 0%, hsl(${a - 18} 30% 26%) 60%, hsl(${a - 30} 28% 16%) 100%)`,
  },
};

/* ---------- the vibes: one token set re-skins any layout ---------- */

const VIBES = {
  warm: {
    tokens: (hue) => ({
      '--s-bg': `hsl(${hue} 28% 96%)`, '--s-ink': `hsl(${hue} 32% 12%)`,
      '--s-dim': `hsl(${hue} 14% 38%)`, '--s-card': `hsl(${hue} 30% 91%)`,
      '--s-line': `hsl(${hue} 20% 82%)`, '--s-accent': `hsl(${hue} 72% 44%)`,
      '--s-accent-ink': `hsl(${hue} 40% 97%)`,
      '--s-display': '"Fraunces", serif', '--s-display-weight': '600',
      '--s-display-track': '-0.015em', '--s-display-case': 'none',
      '--s-logo-case': 'none', '--s-radius': '18px',
      '--s-hero-ink': `hsl(${hue} 30% 97%)`, '--s-hero-dim': `hsl(${hue} 26% 88% / 0.85)`,
      '--s-hero-kicker': `hsl(${hue} 60% 80%)`,
    }),
  },
  bold: {
    tokens: (hue) => ({
      '--s-bg': `hsl(${hue} 10% 97%)`, '--s-ink': `hsl(${hue} 25% 8%)`,
      '--s-dim': `hsl(${hue} 10% 34%)`, '--s-card': `hsl(${hue} 12% 92%)`,
      '--s-line': `hsl(${hue} 15% 80%)`, '--s-accent': `hsl(${hue} 85% 48%)`,
      '--s-accent-ink': `hsl(${hue} 30% 98%)`,
      '--s-display': '"Barlow Condensed", sans-serif', '--s-display-weight': '800',
      '--s-display-track': '0.005em', '--s-display-case': 'uppercase',
      '--s-logo-case': 'uppercase', '--s-logo-track': '0.06em', '--s-radius': '8px',
      '--s-hero-ink': `hsl(${hue} 20% 98%)`, '--s-hero-dim': `hsl(${hue} 15% 90% / 0.85)`,
      '--s-hero-kicker': `hsl(${hue} 70% 78%)`,
    }),
  },
  night: {
    tokens: (hue) => ({
      '--s-bg': `hsl(${hue} 30% 8%)`, '--s-ink': `hsl(${hue} 25% 94%)`,
      '--s-dim': `hsl(${hue} 15% 66%)`, '--s-card': `hsl(${hue} 26% 13%)`,
      '--s-line': `hsl(${hue} 20% 22%)`, '--s-accent': `hsl(${hue} 90% 62%)`,
      '--s-accent-ink': `hsl(${hue} 60% 8%)`,
      '--s-display': '"Space Grotesk", sans-serif', '--s-display-weight': '700',
      '--s-display-track': '-0.01em', '--s-display-case': 'none',
      '--s-logo-case': 'none', '--s-radius': '14px',
      '--s-hero-ink': `hsl(${hue} 25% 96%)`, '--s-hero-dim': `hsl(${hue} 18% 80% / 0.85)`,
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
  let name = null;
  const poss = text.match(/([A-Z][\w']+(?:\s+[A-Z][\w']+)*)/);
  if (poss && poss[1] && poss[1].length > 2 && !/^(A|An|The|My|Our)$/i.test(poss[1])) name = poss[1];
  return { type, name };
}

/* ---------- per-kit layout templates ---------- */

function navHTML(kit, siteName, iconKey) {
  return `
    <nav class="site__nav" data-m="0">
      <span class="site__logo">${ICONS[iconKey]}<span>${siteName}</span></span>
      <span class="site__links"><a href="#">${kit.sectionTitle}</a><a href="#">About</a><a href="#">Visit</a></span>
    </nav>`;
}

const TEMPLATES = {
  /* WINE — a printed list: centered hero, dotted leaders, cellar note */
  wine(kit, siteName) {
    return `
      ${navHTML(kit, siteName, 'glass')}
      <header class="site__hero wine-hero" data-m="1">
        <span class="wine-hero__ic">${ICONS.grapes}</span>
        <p class="site__kicker">${kit.kicker}</p>
        <h1 class="site__headline">${kit.hero}</h1>
        <p class="site__sub">${kit.sub}</p>
        <a class="site__cta" href="#">${kit.cta}</a>
      </header>
      <section class="site__section wine-list" data-m="2">
        <h2 class="site__section-title wine-title"><i></i>${kit.sectionTitle}<i></i></h2>
        ${kit.items.map(([n, d, p, ic]) => `
          <div class="wine-row">
            <span class="wine-row__ic">${ICONS[ic]}</span>
            <div class="wine-row__main">
              <p class="wine-row__name"><span>${n}</span><em class="wine-row__lead"></em><b>${p}</b></p>
              <p class="wine-row__desc">${d}</p>
            </div>
          </div>`).join('')}
      </section>
      <section class="site__about wine-about" data-m="3">
        <span class="wine-about__ic">${ICONS.bottle}</span>
        <div><b>${kit.aboutTitle}</b><p>${kit.about}</p></div>
      </section>
      <footer class="site__foot wine-foot" data-m="4">
        <span>${siteName} · ${kit.foot}</span>
        <span>Site by Little Fight NYC</span>
      </footer>`;
  },

  /* BARBER — poster energy: stripe ribbon, stamp badge, price board */
  barber(kit, siteName) {
    return `
      <div class="barber-stripes" data-m="0" aria-hidden="true"></div>
      ${navHTML(kit, siteName, 'pole')}
      <header class="site__hero barber-hero" data-m="1">
        <div>
          <p class="site__kicker">${kit.kicker}</p>
          <h1 class="site__headline">${kit.hero}</h1>
          <p class="site__sub">${kit.sub}</p>
          <a class="site__cta" href="#">${kit.cta}</a>
        </div>
        <div class="barber-badge" aria-hidden="true">
          ${ICONS.scissors}
          ${kit.badge.map(b => `<span>${b}</span>`).join('')}
        </div>
      </header>
      <section class="site__section barber-board" data-m="2">
        <h2 class="site__section-title">${kit.sectionTitle}</h2>
        ${kit.items.map(([n, d, p, ic], i) => `
          <div class="barber-row">
            <span class="barber-row__num">${String(i + 1).padStart(2, '0')}</span>
            <span class="barber-row__ic">${ICONS[ic]}</span>
            <div class="barber-row__main"><p>${n}</p><p>${d}</p></div>
            <b class="barber-row__price">${p}</b>
          </div>`).join('')}
      </section>
      <section class="barber-rules" data-m="3">
        ${kit.rules.map(([ic, r]) => `<div>${ICONS[ic]}<span>${r}</span></div>`).join('')}
      </section>
      <footer class="site__foot" data-m="4">
        <span>${siteName} · ${kit.foot}</span>
        <span>Site by Little Fight NYC</span>
      </footer>
      <div class="barber-stripes" aria-hidden="true"></div>`;
  },

  /* BAKERY — warm and round: arched hero art, marquee, scalloped cards */
  bakery(kit, siteName) {
    const loop = [...kit.marquee, ...kit.marquee].map(m => `<span>${ICONS.wheat}${m}</span>`).join('');
    return `
      ${navHTML(kit, siteName, 'croissant')}
      <header class="site__hero bake-hero" data-m="1">
        <div>
          <p class="site__kicker">${kit.kicker}</p>
          <h1 class="site__headline">${kit.hero}</h1>
          <p class="site__sub">${kit.sub}</p>
          <a class="site__cta" href="#">${kit.cta}</a>
        </div>
        <div class="bake-arch" aria-hidden="true">${ICONS.bread}</div>
      </header>
      <div class="bake-marquee" data-m="2" aria-hidden="true"><div class="bake-marquee__track">${loop}</div></div>
      <section class="site__section" data-m="3">
        <h2 class="site__section-title">${kit.sectionTitle}</h2>
        <div class="site__cards">
          ${kit.items.map(([n, d, p, ic]) => `
            <article class="site__card bake-card">
              <div class="bake-card__scallop" aria-hidden="true"></div>
              <span class="bake-card__ic">${ICONS[ic]}</span>
              <div class="site__card-body">
                <p class="site__card-name"><span>${n}</span><b>${p}</b></p>
                <p class="site__card-desc">${d}</p>
              </div>
            </article>`).join('')}
        </div>
      </section>
      <section class="site__about bake-about" data-m="4">
        <b>${kit.aboutTitle}</b>
        <p>${kit.about}</p>
      </section>
      <footer class="site__foot" data-m="5">
        <span>${siteName} · ${kit.foot}</span>
        <span>Site by Little Fight NYC</span>
      </footer>`;
  },

  /* PILATES — air and rhythm: breath rings, timetable, principles */
  pilates(kit, siteName) {
    return `
      ${navHTML(kit, siteName, 'rings')}
      <header class="site__hero pil-hero" data-m="1">
        <div>
          <p class="site__kicker">${kit.kicker}</p>
          <h1 class="site__headline">${kit.hero}</h1>
          <p class="site__sub">${kit.sub}</p>
          <a class="site__cta" href="#">${kit.cta}</a>
        </div>
        <div class="pil-breath" aria-hidden="true"><i></i><i></i><i></i></div>
      </header>
      <section class="site__section pil-sched" data-m="2">
        <h2 class="site__section-title">${kit.sectionTitle}</h2>
        ${kit.schedule.map(([day, time, cls, p]) => `
          <div class="pil-row">
            <span class="pil-row__day">${day}</span>
            <span class="pil-row__time">${time}</span>
            <span class="pil-row__class">${cls}</span>
            <b class="pil-row__price">${p}</b>
          </div>`).join('')}
      </section>
      <section class="pil-principles" data-m="3">
        ${kit.principles.map(([ic, t]) => `<div>${ICONS[ic]}<span>${t}</span></div>`).join('')}
      </section>
      <section class="site__about pil-about" data-m="4">
        <b>${kit.aboutTitle}</b>
        <p>${kit.about}</p>
      </section>
      <footer class="site__foot" data-m="5">
        <span>${siteName} · ${kit.foot}</span>
        <span>Site by Little Fight NYC</span>
      </footer>`;
  },
};

/* ---------- render ---------- */

let current = { type: 'wine', vibe: 'warm', name: null };

function render({ type, vibe, name }) {
  const kit = KITS[type];
  const tokens = VIBES[vibe].tokens(kit.hue);
  const siteName = name || kit.name;

  const site = document.createElement('div');
  site.className = 'site';
  site.dataset.kit = type;
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
    ${TEMPLATES[type](kit, siteName)}`;

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

/* ---------- boot ---------- */

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
    icons: $$('.site .ic', frameBody).length,
    url: urlEl.textContent,
  }),
};

/* ---------- acceptance checks (?test=1) ---------- */

if (TESTMODE) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: String(detail) });
  const sig = () => $$('.site [data-m]', frameBody).map(el => el.className.split(' ')[0] + ':' + (el.className.split(' ')[1] || '')).join('|');

  (async () => {
    await sleep(RM ? 500 : 3100);
    check('boot build completes', frameBody.classList.contains('m-done'), window.__studio.info().phase);
    check('wine layout is a list, not cards', !!$('.wine-row', frameBody) && !$('.site__card', frameBody), '');
    check('iconography present', window.__studio.info().icons >= 6, window.__studio.info().icons);
    const wineSig = sig();

    $('[data-pick="barber"]').click();
    await sleep(RM ? 400 : 3100);
    check('barber has stripes + badge + board', !!$('.barber-stripes', frameBody) && !!$('.barber-badge', frameBody) && $$('.barber-row', frameBody).length === 4, '');
    const barberSig = sig();
    check('layouts differ structurally', wineSig !== barberSig, `${wineSig.slice(0, 40)} vs ${barberSig.slice(0, 40)}`);

    $('[data-pick="bakery"]').click();
    await sleep(RM ? 400 : 3100);
    check('bakery has marquee + arch + scallops', !!$('.bake-marquee', frameBody) && !!$('.bake-arch', frameBody) && $$('.bake-card__scallop', frameBody).length === 3, '');
    check('chip swaps business', $('.site__logo span', frameBody).textContent === 'Crumb Theory', $('.site__logo span', frameBody)?.textContent);

    $('[data-pick="pilates"]').click();
    await sleep(RM ? 400 : 3100);
    check('pilates has timetable + breath rings', $$('.pil-row', frameBody).length === 4 && !!$('.pil-breath', frameBody), '');

    /* vibe re-skin without rebuild */
    const siteEl = $('.site', frameBody);
    const bgBefore = getComputedStyle(siteEl).backgroundColor;
    $('[data-vibe="night"]').click();
    await sleep(650);
    check('vibe floods palette', getComputedStyle(siteEl).backgroundColor !== bgBefore, '');
    check('same layout, new skin', $$('.pil-row', frameBody).length === 4, '');

    /* typed brief */
    const parsed = parseBrief("Marco's Pizza on Court St");
    check('typed brief maps type + name', parsed.type === 'bakery' && parsed.name === "Marco's Pizza", `${parsed.type}/${parsed.name}`);
    input.value = "Marco's Pizza on Court St";
    askForm.dispatchEvent(new Event('submit'));
    await sleep(RM ? 400 : 3100);
    check('typed name lands in logo + url', $('.site__logo span', frameBody).textContent === "Marco's Pizza" && urlEl.textContent === 'marcospizza.nyc', urlEl.textContent);

    check('no legacy dashboard', !document.querySelector('select, progress, [class*="coverage"], [class*="rulebook"]'), '');

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
