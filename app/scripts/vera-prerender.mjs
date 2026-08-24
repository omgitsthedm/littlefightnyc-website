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
const VERA_ENGINE_REPOSITORY = 'omgitsthedm/vera-apartment-search';
const FEED_REVISION_OVERRIDE = process.env.VERA_FEED_REVISION || '';

function validFeedRevision(value) {
  return /^[0-9a-f]{40}$/i.test(String(value || ''));
}

async function resolveFeedRevision() {
  if (FEED_REVISION_OVERRIDE) {
    if (!validFeedRevision(FEED_REVISION_OVERRIDE)) {
      throw new Error('VERA_FEED_REVISION must be one 40-character Git commit SHA');
    }
    return FEED_REVISION_OVERRIDE.toLowerCase();
  }

  const response = await fetch(`https://api.github.com/repos/${VERA_ENGINE_REPOSITORY}/commits/feed`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!response.ok) throw new Error(`could not resolve feed revision (HTTP ${response.status})`);
  const body = await response.json();
  if (!validFeedRevision(body && body.sha)) throw new Error('feed revision response did not contain a commit SHA');
  return body.sha.toLowerCase();
}

function pinnedFeedURL(revision, file) {
  if (!validFeedRevision(revision) || !/^(?:archive|public|meta)\.json$/.test(file)) {
    throw new Error('refusing an invalid VERA feed pin');
  }
  return `https://raw.githubusercontent.com/${VERA_ENGINE_REPOSITORY}/${revision}/${file}`;
}

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
<style>.lfc{display:inline-flex;align-items:center;gap:0.7em;min-height:44px;padding:0.25em 0.15em;color:inherit;font-size:var(--lfc-size,1em);font-weight:400;line-height:1;text-decoration:none;-webkit-tap-highlight-color:transparent}.lfc-boat{position:relative;display:block;flex:none;width:3.1em;height:2.2em}.lfc-hull{position:absolute;bottom:0.28em;left:50%;width:2.2em;transform:translateX(-50%);transform-origin:50% 92%;animation:lfc-bob 5.2s ease-in-out infinite}.lfc-mark{display:block;width:100%;height:auto;fill:currentColor}.lfc-beacon{position:absolute;top:-0.16em;left:0.64em;width:0.3em;height:0.3em;border-radius:50%;background:var(--lfc-signal,#f97316);box-shadow:0 0 0.5em 0.06em rgb(249 115 22 / 0.55);animation:lfc-beacon 2.6s ease-in-out infinite}.lfc-sea{position:absolute;inset:auto 0 0;display:block;overflow:hidden;width:100%;height:0.8em;opacity:0.75}.lfc-wave{display:block;width:100%;height:100%;overflow:visible}.lfc-wave path{fill:none;stroke:currentColor;stroke-width:1.1;stroke-linecap:round;animation:lfc-drift 3.6s linear infinite}.lfc-wave--back path{stroke-width:0.9;opacity:0.42;animation-duration:6s;animation-direction:reverse}.lfc-text{white-space:nowrap}.lfc-name{font-weight:600}.lfc:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:4px}@keyframes lfc-bob{0%,100%{transform:translateX(-50%) translateY(0) rotate(-2.2deg)}50%{transform:translateX(-50%) translateY(-0.09em) rotate(2.2deg)}}@keyframes lfc-beacon{0%,100%{opacity:0.35;transform:scale(1)}50%{opacity:1;transform:scale(1.35)}}@keyframes lfc-drift{from{transform:translateX(0)}to{transform:translateX(-16px)}}@media (hover:hover) and (pointer:fine){.lfc:hover .lfc-hull{animation-duration:2.6s}.lfc:hover .lfc-wave path{animation-duration:1.8s}.lfc:hover .lfc-wave--back path{animation-duration:3s}.lfc:hover .lfc-name{text-decoration:underline;text-underline-offset:0.25em}}@media (prefers-reduced-motion:reduce){.lfc-hull,.lfc-beacon,.lfc-wave path,.lfc:hover .lfc-hull,.lfc:hover .lfc-wave path{animation:none}.lfc-hull{transform:translateX(-50%) rotate(-1.5deg)}.lfc-beacon{opacity:1}}.lfc-embed{--lfc-size:11px;display:flex;align-items:center;flex-basis:100%;margin-top:8px;color:inherit;opacity:.8}.lfc-embed:hover{opacity:1}</style>
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
<footer class="docfoot"><span>VERA is a <a href="/">Little Fight NYC</a> system.</span><a href="../">Console</a><a href="../brand/">Brand</a><a href="../terms/">Terms</a><a href="../privacy/">Privacy</a><a href="../corrections/">Corrections</a><span class="lfc-embed"><a class="lfc" href="https://littlefightnyc.com" target="_blank" rel="noopener noreferrer"><span class="lfc-boat" aria-hidden="true"><span class="lfc-hull"><svg class="lfc-mark" viewBox="0 0 838.016418 562.406218" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g transform="translate(-297.159815,611.589160) scale(0.1,-0.1)"><path d="M6050 6114 c-317 -39 -527 -140 -620 -299 -42 -70 -38 -357 6 -506 17 -57 20 -58 111 -24 189 70 312 107 448 136 128 27 475 30 623 5 51 -8 99 -13 107 -9 18 6 20 85 5 195 -5 40 -14 105 -19 145 -30 230 -198 349 -506 358 -66 2 -136 1 -155 -1z"/><path d="M8860 5354 c-152 -16 -582 -54 -908 -79 -326 -25 -534 -168 -639 -439 -32 -82 -44 -234 -41 -541 4 -311 -2 -337 -84 -409 -50 -43 -86 -59 -165 -72 -39 -6 -43 -4 -61 26 -11 17 -22 48 -26 68 -20 126 -56 422 -61 507 -4 55 -13 143 -20 195 -7 52 -16 129 -20 170 -9 103 -32 235 -45 259 -42 80 -614 120 -811 57 -24 -8 -91 -29 -149 -47 -134 -41 -282 -112 -315 -150 -29 -35 -33 -95 -14 -208 5 -35 16 -132 24 -215 17 -180 51 -493 65 -591 16 -115 13 -189 -8 -208 -27 -24 -99 -35 -281 -42 -343 -12 -525 -91 -693 -297 -135 -166 -174 -337 -158 -685 9 -192 11 -198 52 -212 67 -24 1232 -9 1543 19 61 5 184 14 275 20 150 10 459 46 585 69 28 5 79 12 115 16 65 6 161 23 295 52 39 8 90 19 115 24 97 20 147 56 337 243 222 219 296 271 461 331 72 26 224 60 312 69 30 4 87 13 125 21 146 30 243 47 330 61 50 7 144 25 210 39 66 14 149 30 185 36 36 5 117 21 180 36 63 14 150 34 192 43 42 9 84 22 92 30 20 16 21 104 2 260 -8 63 -17 178 -21 255 -3 77 -10 176 -15 220 -5 44 -14 145 -20 225 -16 204 -41 324 -90 422 -97 193 -244 318 -461 394 -73 25 -281 40 -389 28z m420 -582 c59 -26 108 -75 136 -137 26 -58 59 -299 70 -510 10 -189 2 -200 -141 -215 -44 -4 -125 -13 -180 -19 -55 -6 -149 -15 -210 -21 -60 -5 -155 -15 -210 -21 -154 -16 -212 -3 -275 63 -41 45 -59 109 -71 267 -17 213 -9 347 23 396 83 127 183 168 478 195 69 6 152 15 185 20 80 11 140 6 195 -18z"/><path d="M10910 3414 c-30 -7 -118 -25 -195 -39 -77 -14 -174 -32 -215 -40 -173 -34 -250 -48 -340 -60 -52 -8 -149 -25 -215 -40 -66 -14 -149 -30 -185 -36 -36 -5 -94 -16 -130 -24 -177 -40 -249 -55 -290 -60 -25 -3 -74 -12 -110 -20 -116 -25 -223 -46 -310 -60 -47 -7 -107 -18 -135 -24 -105 -22 -213 -42 -300 -56 -219 -34 -315 -90 -490 -286 -107 -119 -155 -162 -249 -223 -74 -49 -231 -113 -316 -131 -206 -42 -369 -72 -450 -80 -30 -3 -100 -12 -155 -20 -153 -22 -452 -53 -625 -65 -85 -6 -202 -15 -259 -20 -506 -45 -1428 -36 -2266 22 -479 33 -451 32 -522 13 -190 -52 -231 -306 -122 -761 16 -66 36 -138 44 -160 9 -21 22 -52 28 -69 53 -134 166 -309 251 -389 158 -147 285 -213 506 -262 122 -27 888 -35 3235 -31 2488 3 2311 -1 2575 61 176 41 267 74 427 155 376 187 669 473 900 876 78 137 179 375 198 465 4 19 22 87 40 150 103 364 149 896 92 1058 -27 76 -65 126 -117 152 -47 24 -210 27 -300 4z m-515 -678 c32 -14 72 -46 107 -85 51 -57 58 -69 69 -132 26 -144 -23 -264 -136 -333 -47 -29 -55 -31 -155 -31 -100 0 -108 2 -155 31 -209 128 -187 444 38 549 71 33 163 34 232 1z"/></g></svg><span class="lfc-beacon"></span></span><span class="lfc-sea"><svg class="lfc-wave lfc-wave--back" viewBox="0 0 48 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path vector-effect="non-scaling-stroke" d="M-20 5.6q4-1.8 8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0"/></svg><svg class="lfc-wave" viewBox="0 0 48 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path vector-effect="non-scaling-stroke" d="M-16 4q4-2.5 8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0"/></svg></span></span><span class="lfc-text">Made by <span class="lfc-name">Little Fight NYC</span></span></a></span></footer>
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
<li>Extra fees: for a standard residential rental, a landlord cannot demand an extra holding, reservation, or key fee before or at the beginning of the tenancy. Lawful rent and up to one month of security may still be due under the lease.</li>
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
    /* Resolve `feed` once, then fetch an immutable Git object. A moving branch
       cannot make two parts of one build disagree. CI may set
       VERA_FEED_REVISION to replay an exact public-feed revision. */
    const revision = await resolveFeedRevision();
    const r = await fetch(pinnedFeedURL(revision, 'archive.json'));
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
    console.log('[vera-prerender] pinned archive feed at ' + revision);
  } catch (error) {
    /* Offline or GitHub-unavailable builds stay honest rather than consuming a
       floating feed. The live app still reads its first-party data contract. */
    console.log('[vera-prerender] archive skipped:', error.message);
  }

  mkdirSync(join(DIST_VERA, 'archive'), { recursive: true });
  writeFileSync(join(DIST_VERA, 'archive', 'index.html'), page(
    'Receipts',
    'Every VERA drop, on the record: what was shown and what happened to it. Nothing backfilled, nothing edited.',
    archBody + '<p>Live outcomes — still listed, price dropped, gone — render in <a href="../#/archive">the app’s Receipts view</a>.</p>'
  ));

  console.log('[vera-prerender] wrote /vera/manual/ and /vera/archive/');
}

main().catch((e) => { console.log('[vera-prerender] non-fatal:', e.message); });
