import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const publicRoot = path.join(appRoot, "public");
const outputRoot = path.join(publicRoot, "assets", "social");

const cards = [
  {
    file: "og-home.jpg",
    category: "WEBSITES / TECH SUPPORT / SOFTWARE",
    title: "Make it easier for the next customer to choose you.",
    note: "Bookings. Visits. Orders. Consultations. Inquiries.",
    image: "images/brand-scenes/storefronts-dawn-1200.webp",
    position: "58% center",
    size: 78,
  },
  {
    file: "og-services.jpg",
    category: "START WITH THE PROBLEM",
    title: "One partner for the technology your business depends on.",
    note: "Keep what works. Fix what gets in the way.",
    image: "assets/hero-services-crossing-900.webp",
    position: "62% center",
    size: 72,
  },
  {
    file: "og-websites.jpg",
    category: "CUSTOM LOCAL WEBSITES",
    title: "Make the next customer’s step obvious.",
    note: "Booking, directions, ordering, intake, or the right inquiry.",
    image: "assets/case-hair-by-rachel-charles-900.webp",
    position: "72% center",
    size: 88,
  },
  {
    file: "og-it-support.jpg",
    category: "PRACTICAL IT SUPPORT",
    title: "Fast help when the basics break.",
    note: "A person answers. The business keeps moving.",
    image: "images/brand-scenes/restaurant-counter-1200.webp",
    position: "64% center",
    size: 88,
  },
  {
    file: "og-tech-consulting.jpg",
    category: "FREE TECH CONSULTING",
    title: "Know what to keep, cut, fix, or build.",
    note: "A plain-English second opinion before you spend.",
    image: "images/brand-scenes/shop-back-office-1200.webp",
    position: "68% center",
    size: 82,
  },
  {
    file: "og-business-systems.jpg",
    category: "SOFTWARE YOU OWN",
    title: "Stop renting software that fights the way you work.",
    note: "Build the focused tool. Lose the bloated monthly bill.",
    image: "images/brand-scenes/salon-systems-1200.webp",
    position: "66% center",
    size: 72,
  },
  {
    file: "og-tech-audit.jpg",
    category: "FREE TECH AUDIT",
    title: "Show us what feels broken.",
    note: "One short form. A person reads it.",
    image: "images/brand-scenes/shop-back-office-1200.webp",
    position: "70% center",
    size: 92,
  },
  {
    file: "og-examples.jpg",
    category: "SHIPPED WORK / WORKING PROOFS",
    title: "See what changed.",
    note: "The business. The problem. The build. The result.",
    image: "assets/hero-examples-market-900.webp",
    position: "64% center",
    size: 104,
  },
  {
    file: "og-library.jpg",
    category: "THE OWNER LIBRARY",
    title: "Plain-English help for real business problems.",
    note: "Answers, field notes, and tools. Free.",
    image: "assets/hero-ind-bookshop-900.webp",
    position: "68% center",
    size: 78,
  },
  {
    file: "og-about.jpg",
    category: "LITTLE FIGHT NYC",
    title: "Small firm. Serious technology.",
    note: "Built for the businesses New York is made of.",
    image: "assets/about-empire-diner-900.webp",
    position: "67% center",
    size: 92,
  },
  {
    file: "og-contact.jpg",
    category: "TALK TO THE PERSON DOING THE WORK",
    title: "Tell us what is going on.",
    note: "No brief. No ticket number. No tech words required.",
    image: "assets/hero-contact-door.webp",
    position: "72% center",
    size: 96,
  },
  {
    // /vera/ is a hand-authored page outside the React app, so it never got a
    // card from the prerenderer. The 72nd Street IRT kiosk is deliberate: VERA
    // scores subway proximity, and the block behind it is the residential
    // Upper West Side the tool is actually searching.
    file: "og-vera-34d78811.jpg",
    category: "VERA / NYC RENTAL INTELLIGENCE",
    title: "Public records when the address resolves.",
    note: "Uncertainty stays visible. Verify before paying.",
    image: "assets/hero-uws-72nd.webp",
    position: "38% center",
    size: 82,
  },
  {
    file: "og-nationwide.jpg",
    category: "CUSTOM WEBSITES / ALL 50 STATES",
    title: "Built in New York. Works anywhere.",
    note: "The same direct process, wherever the business is.",
    image: "assets/hero-nationwide-wtc.webp",
    position: "72% center",
    size: 88,
  },
];

function asDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const [oswald, barlow, mono, mark] = await Promise.all([
  readFile(path.join(publicRoot, "assets", "fonts", "oswald-latin-wght-normal.woff2")),
  readFile(path.join(publicRoot, "assets", "fonts", "barlow-latin-400-normal.woff2")),
  readFile(path.join(publicRoot, "assets", "fonts", "jetbrains-mono-latin-700-normal.woff2")),
  readFile(path.join(publicRoot, "favicon.svg")),
]);

await mkdir(outputRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

for (const card of cards) {
  const image = await readFile(path.join(publicRoot, card.image));
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    @font-face { font-family: "Oswald"; src: url("${asDataUrl(oswald, "font/woff2")}") format("woff2"); font-weight: 700; }
    @font-face { font-family: "Barlow"; src: url("${asDataUrl(barlow, "font/woff2")}") format("woff2"); font-weight: 400; }
    @font-face { font-family: "JetBrains Mono"; src: url("${asDataUrl(mono, "font/woff2")}") format("woff2"); font-weight: 700; }
    * { box-sizing: border-box; }
    html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; background: #050507; }
    .card { position: relative; width: 1200px; height: 630px; overflow: hidden; color: #fff; background: #050507; }
    .photo { position: absolute; inset: 0 0 0 500px; width: 700px; height: 630px; object-fit: cover; object-position: ${card.position}; filter: saturate(.78) contrast(1.12) brightness(.72); }
    .photo-wash { position: absolute; inset: 0 0 0 500px; background: rgba(5, 5, 7, .24); }
    .collision { position: absolute; inset: 0 auto 0 0; width: 742px; background: #050507; clip-path: polygon(0 0, 84% 0, 100% 50%, 84% 100%, 0 100%); }
    .signal { position: absolute; left: 54px; top: 54px; width: 10px; height: 522px; background: #F97316; }
    .ambient { position: absolute; left: 92px; bottom: 51px; width: 74px; height: 9px; background: #3B82F6; }
    .brand { position: absolute; left: 94px; top: 50px; display: flex; align-items: center; gap: 14px; font: 700 33px/1 "Oswald", sans-serif; letter-spacing: .025em; text-transform: uppercase; white-space: nowrap; }
    .brand img { width: 38px; height: 38px; display: block; }
    .category { position: absolute; left: 96px; top: 115px; max-width: 560px; color: #F97316; font: 700 18px/1.2 "JetBrains Mono", monospace; letter-spacing: .08em; text-transform: uppercase; }
    h1 { position: absolute; left: 94px; top: 164px; width: 560px; margin: 0; font: 700 ${card.size}px/.94 "Oswald", sans-serif; letter-spacing: -.018em; text-wrap: balance; }
    .note { position: absolute; left: 96px; bottom: 84px; width: 530px; margin: 0; color: #D4D4D8; font: 400 24px/1.22 "Barlow", sans-serif; }
    .url { position: absolute; right: 42px; bottom: 34px; padding: 12px 15px; color: #fff; background: #050507; font: 700 17px/1 "JetBrains Mono", monospace; letter-spacing: .04em; }
    .corner { position: absolute; right: 0; top: 0; width: 18px; height: 130px; background: #F97316; }
  </style>
</head>
<body>
  <main class="card" aria-label="${escapeHtml(card.title)}">
    <img class="photo" src="${asDataUrl(image, "image/webp")}" alt="">
    <div class="photo-wash"></div>
    <div class="collision"></div>
    <div class="signal"></div>
    <div class="ambient"></div>
    <div class="brand"><img src="${asDataUrl(mark, "image/svg+xml")}" alt=""><span>LITTLE FIGHT NYC</span></div>
    <div class="category">${escapeHtml(card.category)}</div>
    <h1>${escapeHtml(card.title)}</h1>
    <p class="note">${escapeHtml(card.note)}</p>
    <div class="url">LITTLEFIGHTNYC.COM</div>
    <div class="corner"></div>
  </main>
</body>
</html>`;

  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(outputRoot, card.file),
    type: "jpeg",
    quality: 88,
  });
  console.log(`social card: assets/social/${card.file}`);
}

await context.close();
await browser.close();
