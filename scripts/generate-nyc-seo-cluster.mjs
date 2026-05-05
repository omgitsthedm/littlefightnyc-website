import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const today = "2026-05-05";
const cssVersion = "20260505i";

const sharedHead = (page) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="/js/lifi-tracking.min.js" defer data-ga4-id="G-0Q1TGWH0HL"></script>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="author" content="David Marsh">
  <link rel="canonical" href="${page.url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${page.ogTitle || page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${page.url}">
  <meta property="og:image" content="https://littlefightnyc.com/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.ogTitle || page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="https://littlefightnyc.com/images/og-image.jpg">
  <meta name="theme-color" content="#080b14">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/css/lifi-shared-page.min.css">
  <link rel="stylesheet" href="/css/lifi-motion-polish.css?v=20260325a">
  <link rel="stylesheet" href="/css/lifi-animations.css">
  <link rel="stylesheet" href="/css/lifi-core.css">
  <link rel="stylesheet" href="/css/lifi-nav-footer.css">
  <link rel="stylesheet" href="/css/lifi-dark-theme.css">
  <link rel="stylesheet" href="/css/lifi-overhaul.css?v=${cssVersion}">
  <script type="application/ld+json">${JSON.stringify(page.schema)}</script>
</head>`;

const nav = `<nav role="navigation" aria-label="Main navigation"><div class="nav-bg"></div><div class="nav-container"><a href="/" class="nav-brand"><div class="logo"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="28" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">LITTLE</text><text x="50" y="56" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="26" letter-spacing="-1">FIGHT</text><text x="50" y="82" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">NYC</text></svg></div><div class="nav-brand-text"><span class="nav-brand-name">Little Fight NYC</span><span class="nav-brand-tagline">Local Business Advantage</span></div></a><div class="nav-links" id="nav-links"><a href="/business-systems/">Save Money</a><a href="/websites/">Websites</a><a href="/it-support/">IT Support</a><a href="/local-search/">Get Found</a><a href="/software-guides/">Guides</a><a href="/work/">Work</a><a href="/fit-check/">Start Here</a></div><div class="nav-right"><a href="tel:+16463600318" class="nav-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg><span class="nav-phone-dot"></span>(646) 360-0318</a><div class="nav-divider"></div><a href="/fit-check/" class="nav-cta-btn">Start Here &rarr;</a><button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button></div></div></nav>`;

const footer = `<footer role="contentinfo"><div class="footer-grid"><div class="footer-column"><div class="footer-logo"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="28" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">LITTLE</text><text x="50" y="56" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="26" letter-spacing="-1">FIGHT</text><text x="50" y="82" text-anchor="middle" fill="white" font-family="'Lexend',sans-serif" font-weight="800" font-size="24" letter-spacing="-1">NYC</text></svg></div><h3>Little Fight NYC</h3><p>Better tech. Fewer bills. More customers.</p><p>Built for New York businesses that cannot waste time or money.</p></div><div class="footer-column"><h3>How We Help</h3><ul><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/local-search/">Get Found</a></li><li><a href="/software-guides/">Software Guides</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a></li><li><a href="/pricing/">Pricing</a></li></ul></div><div class="footer-column"><h3>NYC Areas</h3><ul><li><a href="/areas/manhattan">Manhattan</a></li><li><a href="/areas/brooklyn">Brooklyn</a></li><li><a href="/areas/queens">Queens</a></li><li><a href="/areas/bronx">Bronx</a></li><li><a href="/areas/staten-island">Staten Island</a></li><li><a href="/industries/">Industries</a></li><li><a href="/fit-check/">Start Here</a></li></ul></div><div class="footer-column"><h3>Contact</h3><ul><li><a href="tel:+16463600318" style="color:#fe5800;font-weight:700">(646) 360-0318</a></li><li><a href="mailto:hello@littlefightnyc.com" style="color:#fe5800;font-weight:700">hello@littlefightnyc.com</a></li></ul><p style="color:#8a8ea0;font-size:13px;margin-top:8px">New York City<br>Websites, IT support, and practical systems</p></div></div><div class="footer-bottom"><p>&copy; 2026 Little Fight NYC. Built in New York for local businesses with bills to lower and customers to win.</p><p style="margin-top:8px"><a href="https://littlefightnyc.com">Designed, hosted, and cared for by LittleFightNYC.com</a></p></div></footer>`;

const orgGraph = (url, name, description, extra = []) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://littlefightnyc.com/#org",
      name: "Little Fight NYC",
      url: "https://littlefightnyc.com/",
      email: "hello@littlefightnyc.com",
      telephone: "+16463600318",
      logo: "https://littlefightnyc.com/apple-touch-icon.png",
      image: "https://littlefightnyc.com/images/og-image.jpg",
      founder: { "@type": "Person", name: "David Marsh", url: "https://littlefightnyc.com/about/" }
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://littlefightnyc.com/#business",
      name: "Little Fight NYC",
      description: "NYC websites, on-site IT support, Google visibility, software cleanup, and practical business systems for local businesses.",
      url: "https://littlefightnyc.com/",
      telephone: "+16463600318",
      email: "hello@littlefightnyc.com",
      address: { "@type": "PostalAddress", addressLocality: "New York", addressRegion: "NY", addressCountry: "US" },
      areaServed: [
        { "@type": "City", name: "New York" },
        { "@type": "AdministrativeArea", name: "Manhattan" },
        { "@type": "AdministrativeArea", name: "Brooklyn" },
        { "@type": "AdministrativeArea", name: "Queens" },
        { "@type": "AdministrativeArea", name: "The Bronx" },
        { "@type": "AdministrativeArea", name: "Staten Island" }
      ],
      priceRange: "$$",
      logo: "https://littlefightnyc.com/apple-touch-icon.png",
      image: "https://littlefightnyc.com/images/og-image.jpg"
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      datePublished: today,
      dateModified: today,
      author: { "@type": "Person", name: "David Marsh", url: "https://littlefightnyc.com/about/" },
      publisher: { "@id": "https://littlefightnyc.com/#org" }
    },
    ...extra
  ]
});

const faqSchema = (items) => ({
  "@type": "FAQPage",
  mainEntity: items.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a }
  }))
});

const serviceSchema = (name, serviceType, areaServed) => ({
  "@type": "Service",
  name,
  serviceType,
  provider: { "@id": "https://littlefightnyc.com/#business" },
  areaServed,
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    priceSpecification: { "@type": "PriceSpecification", priceCurrency: "USD" }
  }
});

function faqMarkup(items) {
  return `<section class="overhaul-section tight"><div class="container"><p class="overhaul-kicker">Fast answers</p><h2 class="overhaul-title sm">Questions owners ask first.</h2><div class="faq-list">${items.map(({ q, a }) => `<div class="faq-item"><button class="faq-question" aria-expanded="false">${q} <span class="faq-icon" aria-hidden="true"><i class="mdi mdi-chevron-down"></i></span></button><div class="faq-answer"><div class="faq-answer-content">${a}</div></div></div>`).join("")}</div></div></section>`;
}

function pageShell(page, body) {
  return `${sharedHead(page)}
<body>
${nav}
<main id="main-content">
${body}
</main>
${footer}
<script src="/js/main.min.js?v=20260505d" defer></script>
<script src="/js/reveal.js" defer></script>
</body>
</html>`;
}

const hubFaqs = [
  {
    q: "Does Little Fight NYC build websites and also fix IT problems?",
    a: "Yes. Little Fight NYC helps NYC small businesses with websites, on-site IT support, Google visibility, software cleanup, lead capture, and the daily tools behind the business."
  },
  {
    q: "Can you help if we do not know whether this is a website issue or an IT issue?",
    a: "Yes. That is exactly what the Fit Check is for. We look at what is broken, expensive, confusing, or disconnected, then point you toward the smallest useful next step."
  },
  {
    q: "Do you work outside Manhattan?",
    a: "Yes. Little Fight NYC supports businesses across New York City, including Manhattan, Brooklyn, Queens, the Bronx, and Staten Island."
  },
  {
    q: "Can you help reduce monthly software costs?",
    a: "Yes. We review the tools you already pay for, identify what is worth keeping, and look for cleaner ways to connect, replace, or build around the pieces that drain money."
  }
];

const hubPage = {
  title: "NYC Websites & IT Support Guide | Little Fight",
  description: "Citywide guide to Little Fight NYC website design, IT support, Google visibility, and software cleanup for local small businesses.",
  url: "https://littlefightnyc.com/nyc-websites-it-support/",
  schema: orgGraph(
    "https://littlefightnyc.com/nyc-websites-it-support/",
    "NYC Websites & IT Support Guide | Little Fight",
    "Citywide guide to Little Fight NYC website design, IT support, Google visibility, and software cleanup for local small businesses.",
    [
      serviceSchema("NYC websites and IT support", "Small business websites and IT support", { "@type": "City", name: "New York" }),
      faqSchema(hubFaqs),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://littlefightnyc.com/" },
          { "@type": "ListItem", position: 2, name: "NYC Websites and IT Support", item: "https://littlefightnyc.com/nyc-websites-it-support/" }
        ]
      }
    ]
  )
};

const hubBody = `<section class="page-hero overhaul-page-hero"><div class="container"><p class="overhaul-kicker">New York City</p><h1 class="overhaul-title">Websites and IT support for NYC businesses that cannot waste money.</h1><p class="overhaul-deck">Clear websites. Reliable IT support. Better Google visibility. Fewer monthly bills.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="tel:+16463600318">Call if something is broken</a></div><div class="page-updated content-meta" itemscope itemtype="https://schema.org/Person">By <span class="author" itemprop="name">David Marsh</span> · Updated <time datetime="${today}">May 5, 2026</time></div></div></section>
<section class="overhaul-section tight"><div class="container"><div class="pain-strip"><div><p class="overhaul-kicker">Direct answer</p><h2 class="overhaul-title sm">If customers cannot find, trust, pay, or reach you, it is costing you.</h2><p class="overhaul-deck">One customer path should not need five vendors. Website, Google, Wi-Fi, payments, booking, forms, and follow-up all decide whether the sale happens.</p></div><ul class="mess-list"><li>Need a better website? Start with the customer action.</li><li>Need IT support? Start with what is broken or slowing the day.</li><li>Need more local customers? Start with Google, Maps, reviews, and service pages.</li><li>Need lower costs? Start with the tools you pay for but barely use.</li></ul></div></div></section>
<section class="overhaul-section"><div class="container"><p class="overhaul-kicker">Choose the door</p><h2 class="overhaul-title sm">Same local business, connected problems.</h2><div class="overhaul-grid"><article class="system-card"><h3>Small business websites</h3><p>Service pages, mobile design, trust, booking, forms, e-commerce, and local search.</p><p><a href="/websites/">Open websites &rarr;</a></p></article><article class="system-card"><h3>IT support</h3><p>On-site help for Wi-Fi, printers, POS, computers, devices, email, and workday blockers.</p><p><a href="/it-support/">Open IT support &rarr;</a></p></article><article class="system-card"><h3>Google visibility</h3><p>Google profile cleanup, Maps, reviews, service pages, and answers customers need.</p><p><a href="/local-search/">Open local search &rarr;</a></p></article><article class="system-card"><h3>Software savings</h3><p>Subscription cleanup, simple dashboards, lead tracking, and follow-up that replaces bloat when it makes sense.</p><p><a href="/business-systems/">Open savings &rarr;</a></p></article></div></div></section>
<section class="overhaul-section method-band"><div class="container"><p class="overhaul-kicker">All five boroughs</p><h2 class="overhaul-title sm">NYC businesses do not all need the same setup.</h2><p class="overhaul-deck">A Midtown practice, Queens pharmacy, Brooklyn studio, Bronx service business, and Staten Island shop do not need the same setup.</p><div class="overhaul-grid three"><article class="system-card"><h3><a href="/areas/manhattan">Manhattan</a></h3><p>High-rent, fast-decision businesses that need polished trust and fewer operational leaks.</p></article><article class="system-card"><h3><a href="/areas/brooklyn">Brooklyn</a></h3><p>Local brands, hospitality, retail, studios, and services that need search, booking, and follow-up to line up.</p></article><article class="system-card"><h3><a href="/areas/queens">Queens</a></h3><p>Community businesses, clinics, restaurants, pharmacies, and shops that need clear sites and reliable day-to-day tech.</p></article><article class="system-card"><h3><a href="/areas/bronx">Bronx</a></h3><p>Neighborhood-serving businesses where phone calls, Maps visibility, payments, and follow-up have to work.</p></article><article class="system-card"><h3><a href="/areas/staten-island">Staten Island</a></h3><p>Local service, retail, wellness, and professional businesses that need practical support without agency fog.</p></article><article class="system-card"><h3><a href="/fit-check/">Not sure?</a></h3><p>Tell us what feels expensive, broken, slow, or disconnected. We will sort the path.</p></article></div></div></section>
${faqMarkup(hubFaqs)}
<section class="overhaul-section tight"><div class="container"><div class="fit-check-band"><p class="overhaul-kicker">Next move</p><h2 class="overhaul-title sm">Bring us the messy setup.</h2><p class="overhaul-deck">Tell us what is draining money, losing customers, or breaking the day. We will point to the next useful move.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/pricing/">See starting points</a></div></div></div></section>`;

const itFaqs = [
  {
    q: "What counts as small business IT support?",
    a: "IT support means practical help with the tools that keep the day moving: Wi-Fi, printers, computers, POS, email, domains, forms, accounts, and staff access."
  },
  {
    q: "Do you offer on-site IT support in NYC?",
    a: "Yes. Little Fight provides on-site help when a location, device, network, printer, POS setup, or staff access problem needs hands-on support."
  },
  {
    q: "Can you help if something is actively broken?",
    a: "Yes. If the issue is affecting customers, payments, booking, email, website access, or staff access right now, call Little Fight and start with urgent support."
  },
  {
    q: "Do you only fix emergencies?",
    a: "No. We fix immediate issues, then help prevent repeat problems with cleaner setup, better tools, and ongoing support when useful."
  }
];

const itPage = {
  title: "NYC IT Support for Small Business | Little Fight NYC",
  description: "Friendly NYC IT support for small businesses with Wi-Fi, POS, printers, devices, email, websites, and tools that need to work.",
  url: "https://littlefightnyc.com/it-support/",
  schema: orgGraph(
    "https://littlefightnyc.com/it-support/",
    "NYC IT Support for Small Business | Little Fight NYC",
    "Friendly NYC IT support for small businesses with Wi-Fi, POS, printers, devices, email, websites, and tools that need to work.",
    [
      serviceSchema("NYC small business IT support", "On-site and remote IT support", { "@type": "City", name: "New York" }),
      faqSchema(itFaqs),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://littlefightnyc.com/" },
          { "@type": "ListItem", position: 2, name: "IT Support", item: "https://littlefightnyc.com/it-support/" }
        ]
      }
    ]
  )
};

const itBody = `<section class="page-hero overhaul-page-hero"><div class="container"><p class="overhaul-kicker">IT support</p><h1 class="overhaul-title">IT support that keeps the day moving.</h1><p class="overhaul-deck">Wi-Fi drops. POS freezes. Email breaks. We fix the thing blocking customers or staff, then help keep it from coming back.</p><div class="overhaul-actions"><a class="btn-fit" href="tel:+16463600318">Call if it is broken</a><a class="btn-ghost" href="/fit-check/">Start a Fit Check</a></div><div class="page-updated content-meta" itemscope itemtype="https://schema.org/Person">By <span class="author" itemprop="name">David Marsh</span> · Updated <time datetime="${today}">May 5, 2026</time></div></div></section>
<section class="overhaul-section tight"><div class="container"><div class="pain-strip"><div><p class="overhaul-kicker">Plain English</p><h2 class="overhaul-title sm">IT support is not the goal. A working day is.</h2><p class="overhaul-deck">Owners want the register to work, the team online, the printer quiet, the email sending, and the customer unaware anything went wrong.</p></div><ul class="mess-list"><li>Something is broken right now.</li><li>The same tech problem keeps coming back.</li><li>Staff waste time on workarounds.</li><li>One person knows how everything is connected.</li><li>The monthly support bill is bigger than the actual help.</li></ul></div></div></section>
<section class="overhaul-section"><div class="container"><p class="overhaul-kicker">What we fix</p><h2 class="overhaul-title sm">Fix what blocks customers, staff, or money.</h2><div class="overhaul-grid"><article class="system-card"><h3>Wi-Fi and networks</h3><p>Coverage problems, unstable networks, guest Wi-Fi, routers, and gear that needs to behave.</p></article><article class="system-card"><h3>POS and payments</h3><p>Square, iPad registers, printers, card readers, networks, and payment paths that need to hold up.</p></article><article class="system-card"><h3>Devices and accounts</h3><p>Mac, PC, iPad, iPhone, Google Workspace, Microsoft 365, access, onboarding, and ownership cleanup.</p></article><article class="system-card"><h3>Web, email, and forms</h3><p>Domains, email, website forms, booking links, notifications, and the quiet pieces that lose leads when they fail.</p></article></div></div></section>
<section class="overhaul-section method-band"><div class="container"><p class="overhaul-kicker">How we route it</p><h2 class="overhaul-title sm">Fix the fire. Prevent the repeat.</h2><div class="method-grid"><article class="method-step"><strong>01</strong><h3>Confirm impact</h3><p>Is it affecting customers, payments, booking, email, access, or staff right now?</p></article><article class="method-step"><strong>02</strong><h3>Stabilize</h3><p>Get the business moving again.</p></article><article class="method-step"><strong>03</strong><h3>Trace the cause</h3><p>See whether it is one break or a larger pattern.</p></article><article class="method-step"><strong>04</strong><h3>Prevent repeat pain</h3><p>Simplify the piece that keeps wasting time.</p></article></div></div></section>
<section class="overhaul-section"><div class="container"><p class="overhaul-kicker">Where we help</p><h2 class="overhaul-title sm">NYC IT support by borough.</h2><div class="overhaul-grid three"><article class="system-card"><h3><a href="/areas/manhattan">Manhattan IT support</a></h3><p>Offices, shops, galleries, restaurants, salons, practices, and teams with high cost per hour of downtime.</p></article><article class="system-card"><h3><a href="/areas/brooklyn">Brooklyn IT support</a></h3><p>Retail, hospitality, studios, and service teams that need payments, Wi-Fi, booking, and staff tools to behave.</p></article><article class="system-card"><h3><a href="/areas/queens">Queens IT support</a></h3><p>Community businesses, clinics, restaurants, and shops that need practical help without corporate IT.</p></article><article class="system-card"><h3><a href="/areas/bronx">Bronx IT support</a></h3><p>Neighborhood businesses where calls, Maps, payments, and daily tools have to work without expensive overhead.</p></article><article class="system-card"><h3><a href="/areas/staten-island">Staten Island IT support</a></h3><p>Local service, wellness, retail, and professional businesses that need dependable setup and clear support.</p></article><article class="system-card"><h3><a href="/services/on-site-it-support-nyc/">On-site support details</a></h3><p>See the original service page for on-site troubleshooting, device, printer, and network support.</p></article></div></div></section>
${faqMarkup(itFaqs)}
<section class="overhaul-section tight"><div class="container"><div class="fit-check-band"><p class="overhaul-kicker">Next move</p><h2 class="overhaul-title sm">If it is broken, call. If it is messy, start here.</h2><p class="overhaul-deck">If it is broken now, call. If it keeps coming back, start with a Fit Check.</p><div class="overhaul-actions"><a class="btn-fit" href="tel:+16463600318">Call Little Fight</a><a class="btn-ghost" href="/fit-check/">Start Here</a></div></div></div></section>`;

const boroughs = [
  {
    slug: "manhattan",
    name: "Manhattan",
    title: "Manhattan Websites & IT Support | Little Fight NYC",
    description: "Websites, IT support, Google visibility, and software cleanup for Manhattan small businesses that need local trust and less drag.",
    hero: "Websites and IT support for Manhattan businesses under pressure.",
    intro: "Manhattan businesses pay for every minute of confusion. The site has to earn trust fast, the booking path has to work, the Wi-Fi and payment setup cannot get cute during rush hour, and the follow-up cannot live in one person's memory.",
    businesses: "restaurants, bars, salons, galleries, studios, pharmacies, practices, retail shops, showrooms, and service firms",
    pain: ["High rent makes weak conversion expensive.", "Customers compare nearby options fast.", "Payment, booking, and email problems turn into lost revenue quickly."],
    first: "Check the website, Google profile, lead path, and daily tools before buying another tool."
  },
  {
    slug: "brooklyn",
    name: "Brooklyn",
    title: "Brooklyn Websites & IT Support | Little Fight NYC",
    description: "Brooklyn website design, IT support, Google visibility, and software cleanup for local shops, studios, restaurants, and service teams.",
    hero: "Brooklyn websites and tech support for businesses with real customers, not spare time.",
    intro: "Brooklyn businesses often run on reputation, repeat customers, neighborhood search, and a lot of owner improvisation. That works until the website is unclear, the booking flow leaks, or the tool pile turns into another rent bill.",
    businesses: "restaurants, cafes, salons, boutiques, creative studios, wellness spaces, event teams, repair shops, and local service businesses",
    pain: ["Neighborhood search matters, but service pages are often thin.", "Booking, payments, and DMs can scatter customer interest.", "Software subscriptions pile up while staff still use spreadsheets."],
    first: "Make the customer path visible: search, site, booking, payment, follow-up, and owner visibility."
  },
  {
    slug: "queens",
    name: "Queens",
    title: "Queens Websites & IT Support | Little Fight NYC",
    description: "Queens website and IT support for small businesses that need clearer pages, reliable tools, local search, and lower software costs.",
    hero: "Queens business support for the places communities actually depend on.",
    intro: "Queens has pharmacies, clinics, restaurants, retailers, beauty businesses, professional services, and family-run shops where trust is earned in person and online. The digital setup has to be clear, practical, multilingual-aware when needed, and easy for staff to use.",
    businesses: "pharmacies, clinics, restaurants, salons, retail shops, local services, professional practices, and community businesses",
    pain: ["Customers need accurate hours, services, calls, and directions.", "Staff tools need to be simple enough for busy counters and front desks.", "Local Google visibility can matter more than broad advertising."],
    first: "Tighten the essentials: website clarity, Google profile, phone/contact path, Wi-Fi/POS reliability, and follow-up."
  },
  {
    slug: "bronx",
    name: "The Bronx",
    title: "Bronx Websites & IT Support | Little Fight NYC",
    description: "Bronx website and IT support for local businesses that need clearer customer paths, reliable tech, Google visibility, and fewer wasted fees.",
    hero: "Bronx websites and IT support for businesses that serve real neighborhoods.",
    intro: "Bronx businesses need practical technology that helps customers reach them, pay them, book them, and trust them. A fancy system is useless if the phone path, Google listing, Wi-Fi, payment setup, or follow-up breaks the day.",
    businesses: "retail shops, service businesses, restaurants, clinics, wellness practices, salons, contractors, and community organizations",
    pain: ["Phone calls and Maps visibility can drive real foot traffic.", "A simple website often needs better proof and clearer next steps.", "Tech support has to fix the day, not create a larger monthly burden."],
    first: "Start with what blocks money or trust: Google, website, calls, payments, Wi-Fi, forms, or follow-up."
  },
  {
    slug: "staten-island",
    name: "Staten Island",
    title: "Staten Island Websites & IT Support | Little Fight NYC",
    description: "Staten Island website design, IT support, local search, and software cleanup for small businesses that need practical help and fewer fees.",
    hero: "Staten Island websites and IT support without agency fog.",
    intro: "Staten Island businesses often win through local reputation, direct calls, referrals, service quality, and trust. The digital setup should support that: clear pages, reliable contact paths, useful Google visibility, and tech that does not interrupt the day.",
    businesses: "medical and wellness practices, salons, contractors, local shops, professional services, restaurants, and family businesses",
    pain: ["Referrals still check the website before calling.", "Local service searches need accurate pages and Google details.", "Recurring IT problems waste staff time and owner attention."],
    first: "Make sure the basics hold: website, Google, phone, forms, email, booking, payments, and the tools staff use every day."
  }
];

function boroughFaqs(borough) {
  const businessName = borough.name === "The Bronx" ? "Bronx" : borough.name;
  return [
    {
      q: `Does Little Fight NYC help ${businessName} businesses with websites?`,
      a: `Yes. Little Fight NYC helps ${businessName} businesses build and clean up websites that explain the offer, earn trust, support local search, and turn visits into calls, bookings, purchases, or inquiries.`
    },
    {
      q: `Does Little Fight provide IT support in ${businessName}?`,
      a: `Yes. Little Fight supports practical IT needs for ${businessName} businesses, including Wi-Fi, devices, printers, POS, email, domains, forms, and recurring tech problems that slow the day down.`
    },
    {
      q: `Can you help if we are paying too much for software?`,
      a: "Yes. We review what you use now, what is worth keeping, what should be connected, what may need replacing, and whether a smaller setup could reduce monthly waste."
    },
    {
      q: "What is the best first step?",
      a: "Start with a Fit Check if the issue is messy or unclear. Call if something is actively affecting customers, payments, bookings, email, website access, or staff access right now."
    }
  ];
}

function boroughPage(borough) {
  const url = `https://littlefightnyc.com/areas/${borough.slug}`;
  const faqs = boroughFaqs(borough);
  const businessName = borough.name === "The Bronx" ? "Bronx" : borough.name;
  const page = {
    title: borough.title,
    description: borough.description,
    url,
    schema: orgGraph(url, borough.title, borough.description, [
      serviceSchema(`${borough.name} websites and IT support`, "Websites, IT support, local search, and business systems", { "@type": "AdministrativeArea", name: borough.name }),
      faqSchema(faqs),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://littlefightnyc.com/" },
          { "@type": "ListItem", position: 2, name: borough.name, item: url }
        ]
      }
    ])
  };

  const body = `<section class="page-hero overhaul-page-hero"><div class="container"><p class="overhaul-kicker">${borough.name}, NYC</p><h1 class="overhaul-title">${borough.hero}</h1><p class="overhaul-deck">${borough.intro}</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="tel:+16463600318">Call if it is broken</a></div><div class="page-updated content-meta" itemscope itemtype="https://schema.org/Person">By <span class="author" itemprop="name">David Marsh</span> · Updated <time datetime="${today}">May 5, 2026</time></div></div></section>
<section class="overhaul-section tight"><div class="container"><div class="pain-strip"><div><p class="overhaul-kicker">Local fit</p><h2 class="overhaul-title sm">For ${borough.businesses}.</h2><p class="overhaul-deck">${borough.first}</p></div><ul class="mess-list">${borough.pain.map((item) => `<li>${item}</li>`).join("")}<li>Keep what helps. Cut what drains. Build what pays.</li></ul></div></div></section>
<section class="overhaul-section"><div class="container"><p class="overhaul-kicker">What we help with</p><h2 class="overhaul-title sm">One sale. Four moving parts.</h2><div class="overhaul-grid"><article class="system-card"><h3>${businessName} website help</h3><p>Clear pages, proof, forms, booking, shops, and local search.</p><p><a href="/websites/">Website help &rarr;</a></p></article><article class="system-card"><h3>${businessName} IT support</h3><p>Wi-Fi, printers, POS, email, devices, and workday blockers.</p><p><a href="/it-support/">IT support &rarr;</a></p></article><article class="system-card"><h3>Google and Maps visibility</h3><p>Google profile cleanup, reviews, service pages, FAQs, and local answers that match how customers search.</p><p><a href="/local-search/">Get found &rarr;</a></p></article><article class="system-card"><h3>Software cost cleanup</h3><p>Subscription cleanup, lead tracking, booking/payment cleanup, and smaller tools when big tools cost too much.</p><p><a href="/business-systems/">Save money &rarr;</a></p></article></div></div></section>
<section class="overhaul-section method-band"><div class="container"><p class="overhaul-kicker">Fast answer</p><h2 class="overhaul-title sm">Who should ${businessName} businesses call for website or IT help?</h2><p class="overhaul-deck">Call Little Fight when the site, Google, IT, payments, or follow-up is costing customers or staff time. The first step may be a repair, a clearer page, or cutting software that stopped helping.</p></div></section>
${faqMarkup(faqs)}
<section class="overhaul-section tight"><div class="container"><div class="fit-check-band"><p class="overhaul-kicker">Next move</p><h2 class="overhaul-title sm">Tell us what is broken, expensive, slow, or hard to explain.</h2><p class="overhaul-deck">We will help sort whether this needs urgent support, website cleanup, Google help, software savings, or a simple system.</p><div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/nyc-websites-it-support/">Open the NYC hub</a></div></div></div></section>`;

  return pageShell(page, body);
}

const pages = [
  ["nyc-websites-it-support/index.html", pageShell(hubPage, hubBody)],
  ["it-support/index.html", pageShell(itPage, itBody)],
  ...boroughs.map((borough) => [`areas/${borough.slug}.html`, boroughPage(borough)])
];

for (const [file, html] of pages) {
  const absolute = path.join(root, file);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, html, "utf8");
}

async function listHtmlFiles(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if ([".git", "backup", "dist", "docs", "node_modules", "tmp"].includes(entry.name) || /^dist(?:-.+)?$/.test(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await listHtmlFiles(absolute, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(absolute);
    }
  }
  return files;
}

const slashPaths = [
  "about",
  "blog",
  "business-systems",
  "contact",
  "fit-check",
  "industries",
  "it-support",
  "local-search",
  "nyc-websites-it-support",
  "pricing",
  "privacy",
  "services",
  "software-cost-calculator",
  "software-guides",
  "solutions",
  "terms",
  "websites",
  "work"
];

const htmlFiles = await listHtmlFiles(root);
for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  const before = html;

  html = html.replaceAll(
    '<a href="/business-systems/">Save Money</a><a href="/websites/">Websites</a><a href="/local-search/">Get Found</a>',
    '<a href="/business-systems/">Save Money</a><a href="/websites/">Websites</a><a href="/it-support/">IT Support</a><a href="/local-search/">Get Found</a>'
  );

  html = html.replaceAll(
    '<h3>How We Help</h3><ul><li><a href="/business-systems/">Save Money</a></li><li><a href="/websites/">Websites</a></li><li><a href="/local-search/">Get Found</a></li>',
    '<h3>How We Help</h3><ul><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/local-search/">Get Found</a></li>'
  );

  html = html.replaceAll(
    '<ul class="nav-links"><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li>',
    '<ul class="nav-links">'
  );

  html = html.replaceAll(
    '<a tabindex="-1" href="/websites/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">02</span><span class="drawer-link-text">Websites</span></a><a tabindex="-1" href="/local-search/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">03</span><span class="drawer-link-text">Get Found</span></a><a tabindex="-1" href="/software-guides/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">04</span><span class="drawer-link-text">Guides</span></a><a tabindex="-1" href="/work/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">05</span><span class="drawer-link-text">Work</span></a><a tabindex="-1" href="/fit-check/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">06</span><span class="drawer-link-text">Start Here</span></a>',
    '<a tabindex="-1" href="/websites/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">02</span><span class="drawer-link-text">Websites</span></a><a tabindex="-1" href="/it-support/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">03</span><span class="drawer-link-text">IT Support</span></a><a tabindex="-1" href="/local-search/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">04</span><span class="drawer-link-text">Get Found</span></a><a tabindex="-1" href="/software-guides/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">05</span><span class="drawer-link-text">Guides</span></a><a tabindex="-1" href="/work/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">06</span><span class="drawer-link-text">Work</span></a><a tabindex="-1" href="/fit-check/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">07</span><span class="drawer-link-text">Start Here</span></a>'
  );

  for (const p of slashPaths) {
    html = html.replace(new RegExp(`href="/${p}(#[^"]*)?"`, "g"), (match) => match.replace(`/${p}`, `/${p}/`));
    html = html.replace(new RegExp(`href="https://littlefightnyc.com/${p}(#[^"]*)?"`, "g"), (match) => match.replace(`/${p}`, `/${p}/`));
    html = html.replace(new RegExp(`href="https://littlefightnyc.com/${p}"`, "g"), `href="https://littlefightnyc.com/${p}/"`);
    html = html.replace(new RegExp(`href="https://littlefightnyc.com/${p}#`, "g"), `href="https://littlefightnyc.com/${p}/#`);
  }

  if (file === path.join(root, "index.html")) {
    html = html
      .replace("<title>Little Fight NYC | Local Business Advantage for NYC</title>", "<title>NYC Websites & IT Support | Little Fight NYC</title>")
      .replace("<title>NYC Websites & IT Support | Little Fight NYC</title>", "<title>NYC Small Business Websites & IT Support | Little Fight</title>")
      .replace(
        '<meta name="description" content="Little Fight NYC helps neighborhood businesses save money, get found, catch every lead, and compete with bigger companies without bigger monthly bills.">',
        '<meta name="description" content="Websites, IT support, Google visibility, and software cleanup for NYC small businesses that need fewer monthly bills and more customers.">'
      )
      .replace(
        '<meta name="description" content="Websites, IT support, Google visibility, and software cleanup for NYC small businesses that need fewer monthly bills and more customers.">',
        '<meta name="description" content="Little Fight NYC helps local businesses save money, get found, catch leads, and fix the tech that blocks customers or staff.">'
      )
      .replace(
        '<meta property="og:title" content="Little Fight NYC | Local Business Advantage for NYC">',
        '<meta property="og:title" content="NYC Websites & IT Support | Little Fight NYC">'
      )
      .replace(
        '<meta property="og:title" content="NYC Websites & IT Support | Little Fight NYC">',
        '<meta property="og:title" content="NYC Small Business Websites & IT Support | Little Fight">'
      )
      .replace(
        '<meta property="og:description" content="Helping neighborhood businesses save money, get found, catch every lead, and compete without bigger monthly bills.">',
        '<meta property="og:description" content="Websites, IT support, Google visibility, and software cleanup for NYC small businesses that need fewer monthly bills and more customers.">'
      )
      .replace(
        '<meta property="og:description" content="Websites, IT support, Google visibility, and software cleanup for NYC small businesses that need fewer monthly bills and more customers.">',
        '<meta property="og:description" content="Helping NYC local businesses save money, get found, catch leads, and fix the tech that blocks customers or staff.">'
      )
      .replace(
        '<meta name="twitter:title" content="Little Fight NYC | Local Business Advantage for NYC">',
        '<meta name="twitter:title" content="NYC Websites & IT Support | Little Fight NYC">'
      )
      .replace(
        '<meta name="twitter:title" content="NYC Websites & IT Support | Little Fight NYC">',
        '<meta name="twitter:title" content="NYC Small Business Websites & IT Support | Little Fight">'
      )
      .replace(
        '<meta name="twitter:description" content="Helping neighborhood businesses save money, get found, catch every lead, and compete without bigger monthly bills.">',
        '<meta name="twitter:description" content="Websites, IT support, Google visibility, and software cleanup for NYC small businesses that need fewer monthly bills and more customers.">'
      )
      .replace(
        '<meta name="twitter:description" content="Websites, IT support, Google visibility, and software cleanup for NYC small businesses that need fewer monthly bills and more customers.">',
        '<meta name="twitter:description" content="Helping NYC local businesses save money, get found, catch leads, and fix the tech that blocks customers or staff.">'
      )
      .replaceAll(' aria-label="Website help"', "")
      .replaceAll(' aria-label="Website looks weak"', "")
      .replaceAll(' aria-label="Software cost and business systems help"', "")
      .replaceAll(' aria-label="Fees cost too much"', "")
      .replaceAll(' aria-label="Google and local search help"', "")
      .replaceAll(' aria-label="Google hard to find"', "")
      .replaceAll(' aria-label="Lead capture and Fit Check help"', "")
      .replaceAll(' aria-label="Leads customers vanish"', "");
    if (!html.includes('href="/it-support/" class="btn btn-outline">IT Support</a>')) {
      html = html.replace(
        '<a href="/business-systems/" class="btn btn-outline">Find the Money Leak</a>',
        '<a href="/business-systems/" class="btn btn-outline">Find the Money Leak</a><a href="/it-support/" class="btn btn-outline">IT Support</a>'
      );
    }
  }

  if (file.endsWith(path.join("websites", "index.html"))) {
    html = html
      .replace("<title>Small Business Websites in New York | Little Fight NYC</title>", "<title>NYC Website Design for Small Business | Little Fight</title>")
      .replace(
        'content="Small business websites in New York built for clear services, local trust, booking paths, forms, e-commerce, and follow-up that actually works."',
        'content="NYC website design for small businesses that need clearer pages, stronger local trust, better Google visibility, and leads that get caught."'
      )
      .replaceAll("Small Business Websites in New York | Little Fight NYC", "NYC Website Design for Small Business | Little Fight")
    if (html.includes("For exact NYC website and IT support coverage")) {
      html = html.replace(
        '<p class="overhaul-deck">For exact NYC website and IT support coverage across Manhattan, Brooklyn, Queens, the Bronx, and Staten Island, start with the <a href="/nyc-websites-it-support/">NYC websites and IT support hub</a>.</p>',
        '<p class="overhaul-deck">Need borough coverage? Open the <a href="/nyc-websites-it-support/">NYC websites and IT support hub</a>.</p>'
      );
    } else if (!html.includes("Need borough coverage?")) {
      html = html.replace(
        '<h2 class="overhaul-title sm">Different local businesses need different proof.</h2>',
        '<h2 class="overhaul-title sm">Different local businesses need different proof.</h2><p class="overhaul-deck">Need borough coverage? Open the <a href="/nyc-websites-it-support/">NYC websites and IT support hub</a>.</p>'
      );
    }
  }

  if (file.endsWith(path.join("software-guides", "index.html"))) {
    html = html
      .replace("<title>Software Cost Guides for NYC Small Business | Little Fight NYC</title>", "<title>NYC Software Cost Guides | Little Fight NYC</title>")
      .replace(
        'content="Plain-English software cost guides for NYC small businesses deciding what to keep, connect, replace, or build around tools like Square, Toast, Shopify, and Airtable."',
        'content="Plain-English software cost guides for NYC businesses choosing what to keep, connect, replace, or build around Square, Toast, Shopify, and Airtable."'
      )
      .replace(
        "Plain-English software cost guides for NYC small businesses comparing POS, booking, website, customer list, and monthly tools before buying another subscription.",
        "Plain-English software cost guides for NYC businesses comparing POS, booking, websites, customer lists, and monthly tools."
      )
      .replaceAll(
        "Software Cost Guides for NYC Small Business | Little Fight NYC",
        "NYC Software Cost Guides | Little Fight NYC"
      );
  }

  if (file.endsWith(path.join("services", "index.html")) && !html.includes("Need the citywide version?")) {
    html = html.replace(
      '<section class="overhaul-section method-band">',
      '<section class="overhaul-section tight"><div class="container"><div class="fit-check-band"><p class="overhaul-kicker">NYC websites and IT support</p><h2 class="overhaul-title sm">Need the citywide version?</h2><p class="overhaul-deck">Open the NYC hub for websites, IT support, Google help, and software cleanup.</p><div class="overhaul-actions"><a class="btn-fit" href="/nyc-websites-it-support/">Open the NYC hub</a><a class="btn-ghost" href="/it-support/">Open IT support</a></div></div></div></section><section class="overhaul-section method-band">'
    );
  }

  if (before !== html) {
    await writeFile(file, html, "utf8");
  }
}

const areaDescriptions = new Map([
  ["areas/chelsea.html", "Websites, Google visibility, software savings, and lead follow-up help for Chelsea businesses that need cleaner local operations."],
  ["areas/east-village.html", "Websites, Google visibility, software savings, and lead follow-up help for East Village businesses with local customer pressure."],
  ["areas/lower-east-side.html", "Websites, Google visibility, software savings, and lead follow-up help for Lower East Side shops, bars, studios, and services."],
  ["areas/meatpacking-district.html", "Websites, Google visibility, software savings, and lead follow-up help for Meatpacking businesses that need clean customer paths."],
  ["areas/midtown.html", "Websites, Google visibility, software savings, and lead follow-up help for Midtown firms, practices, shops, and service teams."],
  ["areas/soho.html", "Websites, Google visibility, software savings, and lead follow-up help for SoHo shops, galleries, studios, and local brands."],
  ["areas/upper-east-side.html", "Websites, Google visibility, software savings, and lead follow-up help for Upper East Side practices, shops, and services."],
  ["areas/upper-west-side.html", "Websites, Google visibility, software savings, and lead follow-up help for Upper West Side shops, salons, practices, and services."],
  ["areas/west-village.html", "Websites, Google visibility, software savings, and lead follow-up help for West Village restaurants, shops, studios, and services."]
]);

for (const [relative, description] of areaDescriptions) {
  const file = path.join(root, relative);
  let html = await readFile(file, "utf8");
  html = html.replace(/<meta name="description" content="[^"]+">/, `<meta name="description" content="${description}">`);
  html = html.replace(/<meta property="og:description" content="[^"]+">/, `<meta property="og:description" content="${description}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]+">/, `<meta name="twitter:description" content="${description}">`);
  await writeFile(file, html, "utf8");
}

const sitemapPath = path.join(root, "sitemap.xml");
let sitemap = await readFile(sitemapPath, "utf8");
const newUrls = [
  ["https://littlefightnyc.com/nyc-websites-it-support/", "0.9"],
  ["https://littlefightnyc.com/it-support/", "0.9"],
  ["https://littlefightnyc.com/areas/manhattan", "0.5"],
  ["https://littlefightnyc.com/areas/brooklyn", "0.5"],
  ["https://littlefightnyc.com/areas/queens", "0.5"],
  ["https://littlefightnyc.com/areas/bronx", "0.5"],
  ["https://littlefightnyc.com/areas/staten-island", "0.5"]
];
for (const [loc, priority] of newUrls) {
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    sitemap = sitemap.replace(
      "  <url><loc>https://littlefightnyc.com/services/</loc>",
      `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>\n  <url><loc>https://littlefightnyc.com/services/</loc>`
    );
  }
}
sitemap = sitemap.replaceAll("<lastmod>2026-05-04</lastmod>", `<lastmod>${today}</lastmod>`);
await writeFile(sitemapPath, sitemap, "utf8");

const robotsPath = path.join(root, "robots.txt");
let robots = await readFile(robotsPath, "utf8");
for (const bot of ["OAI-SearchBot", "ClaudeBot", "Applebot", "Applebot-Extended", "CCBot"]) {
  if (!robots.includes(`User-agent: ${bot}`)) {
    robots += `\nUser-agent: ${bot}\nAllow: /\n`;
  }
}
await writeFile(robotsPath, robots, "utf8");

const llmsPath = path.join(root, "llms.txt");
let llms = await readFile(llmsPath, "utf8");
const llmsBlock = `## NYC Website and IT Support Coverage

- NYC websites and IT support hub: https://littlefightnyc.com/nyc-websites-it-support/
- NYC IT support: https://littlefightnyc.com/it-support/
- Manhattan websites and IT support: https://littlefightnyc.com/areas/manhattan
- Brooklyn websites and IT support: https://littlefightnyc.com/areas/brooklyn
- Queens websites and IT support: https://littlefightnyc.com/areas/queens
- Bronx websites and IT support: https://littlefightnyc.com/areas/bronx
- Staten Island websites and IT support: https://littlefightnyc.com/areas/staten-island

Direct answer: Little Fight NYC helps New York City small businesses with websites, on-site IT support, Google visibility, software savings, lead capture, and simple systems. The first step is a Fit Check unless the issue is actively affecting customers, payments, bookings, email, website access, or staff access.

`;
if (!llms.includes("## NYC Website and IT Support Coverage")) {
  llms = llms.replace("## Contact", `${llmsBlock}## Contact`);
}
await writeFile(llmsPath, llms, "utf8");

console.log(`Generated ${pages.length} SEO/AEO pages and updated metadata helpers.`);
