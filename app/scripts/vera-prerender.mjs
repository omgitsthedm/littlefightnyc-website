// VERA prerender — the public goods, crawlable.
// Scam School, the viewing checklist, and the money law are useful to every
// renter whether or not they use the live workspace; the receipts are its track
// record. Both currently render behind JS hash routes. This emits static
// HTML into dist at /vera/manual/ and /vera/archive/ after the vite build.
// Runs in the site build chain; never fails the build.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const APP = join(here, '..');
const DIST_VERA = join(APP, 'dist', 'vera');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function page(title, lede, body) {
  const slug = title === 'Field manual' ? 'manual' : 'archive';
  const canonical = `https://littlefightnyc.com/vera/${slug}/`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} — VERA</title>
<meta name="description" content="${esc(lede)}">
<meta name="theme-color" content="#0c0e0d">
<meta name="color-scheme" content="dark">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)} — VERA">
<meta property="og:description" content="${esc(lede)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="Little Fight NYC">
<meta property="og:image" content="https://littlefightnyc.com/assets/social/og-vera-34d78811.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="VERA rental-intelligence card highlighting public-record checks and honest uncertainty.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)} — VERA">
<meta name="twitter:description" content="${esc(lede)}">
<meta name="twitter:image" content="https://littlefightnyc.com/assets/social/og-vera-34d78811.jpg">
<meta name="twitter:image:alt" content="VERA rental-intelligence card highlighting public-record checks and honest uncertainty.">
<link rel="icon" href="../assets/icons/vera-icon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="../assets/icons/vera-icon-180.png" sizes="180x180">
<link rel="stylesheet" href="../assets/css/doc.css?v=2">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="docbar">
  <a class="docbar__brand" href="../"><img src="../assets/brand/vera-mark-96.png" width="26" height="26" alt="" aria-hidden="true" decoding="async"><b>VERA</b></a>
  <nav class="docbar__links" aria-label="VERA documents">
    <a href="../">Console</a><a href="../brand/">Brand</a><a href="../terms/">Terms</a><a href="../privacy/">Privacy</a><a href="../corrections/">Corrections</a>
  </nav>
</header>
<main class="doc" id="main">
<h1>${esc(title)}</h1>
<p class="doc__lede">${esc(lede)}</p>
${body}
<p class="doc__foot"><a href="../">← the live app</a> · every number here is computed from a cited public record or marked ≈</p>
</main>
<footer class="docfoot"><span>VERA is a <a href="/">Little Fight NYC</a> system.</span><a href="../">Console</a><a href="../brand/">Brand</a><a href="../terms/">Terms</a><a href="../privacy/">Privacy</a><a href="../corrections/">Corrections</a></footer>
</body>
</html>
`;
}

async function main() {
  if (!existsSync(DIST_VERA)) {
    console.log('[vera-prerender] dist/vera missing — skipped (vite build must run first)');
    return;
  }

  // vera-core is a browser IIFE; give it the window it expects
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  const coreSrc = readFileSync(join(APP, 'public', 'vera', 'assets', 'js', 'vera-core.js'), 'utf8');
  (0, eval)(coreSrc);
  const C = globalThis.window.__VERAC;

  // --- the manual ---
  const law = `<h2>The money, by law</h2><ul>
<li>Security deposit: capped at ${C.LAW.depositMaxMonths} month (HSTPA 2019), returned within ${C.LAW.depositReturnDays} days of move-out, itemized.</li>
<li>Screening fee: the actual cost or $${C.LAW.appFeeMax}, whichever is less — waived with a qualifying credit or background report from the last 30 days.</li>
<li>Pre-lease money: do not pay a holding, reservation, or key fee before the lease is executed.</li>
<li>Broker fee: a broker representing the landlord, or publishing their listing with permission, cannot charge you; a broker you independently hire can (FARE Act, in effect since ${esc(C.LAW.fareActFrom)}).</li>
<li>Income convention: ${C.LAW.incomeRuleX}× monthly rent annually; guarantors are asked for ${C.LAW.guarantorRuleX}×.</li>
</ul><h2>Read the law itself</h2><ul>${C.LAW_SOURCES.map((source) => `<li><a href="${esc(source[1])}" rel="noopener">${esc(source[0])}</a> — ${esc(source[2])}</li>`).join('')}</ul>`;
  const tells = '<h2>Scam School — the sixteen tells</h2>' + C.TELLS.map((t) => `<h3>${esc(t.t)}</h3><p>${esc(t.d)}</p>`).join('');
  const checks = '<h2>The viewing checklist</h2>' + C.checkGroups().map((g) =>
    `<h3>${esc(g)}</h3><ul>` + C.CHECKS.filter((x) => x.group === g).map((x) => `<li><b>${esc(x.label)}</b> — ${esc(x.why)}</li>`).join('') + '</ul>'
  ).join('');
  const tools = '<h2>Verify it yourself</h2><ul>' + C.VERIFY_TOOLS.map((v) => `<li><a href="${esc(v[1])}" rel="noopener">${esc(v[0])}</a> — ${esc(v[2])}</li>`).join('') + '</ul>';

  mkdirSync(join(DIST_VERA, 'manual'), { recursive: true });
  writeFileSync(join(DIST_VERA, 'manual', 'index.html'), page(
    'Field manual',
    'New York rent law in hard numbers, sixteen scam tells, and the 26-point viewing checklist — free, no account, from the VERA apartment engine.',
    law + tells + checks + tools
  ));

  // --- the receipts ---
  let archBody = '<p>The archive begins with the next publish cycle; entries are never edited after the fact.</p>';
  try {
    const r = await fetch('https://raw.githubusercontent.com/omgitsthedm/vera-apartment-search/feed/archive.json');
    if (r.ok) {
      const arch = await r.json();
      if (Array.isArray(arch) && arch.length) {
        archBody = arch.map((e) =>
          `<h2>${esc(e.date)}</h2><ul>` +
          (e.listings || []).map((l) => `<li>${esc(l.title || l.address_normalized)} — $${Math.round(l.rent || 0).toLocaleString('en-US')} · ${esc(l.neighborhood || '')}</li>`).join('') +
          '</ul>'
        ).join('');
      }
    }
  } catch { /* offline build — the honest default stands */ }

  mkdirSync(join(DIST_VERA, 'archive'), { recursive: true });
  writeFileSync(join(DIST_VERA, 'archive', 'index.html'), page(
    'Receipts',
    'Every VERA drop, on the record: what was shown and what happened to it. Nothing backfilled, nothing edited.',
    archBody + '<p>Live outcomes — still listed, price dropped, gone — render in <a href="../#/archive">the app’s Receipts view</a>.</p>'
  ));

  console.log('[vera-prerender] wrote /vera/manual/ and /vera/archive/');
}

main().catch((e) => { console.log('[vera-prerender] non-fatal:', e.message); });
