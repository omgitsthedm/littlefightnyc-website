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
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} — VERA</title>
<meta name="description" content="${esc(lede)}">
<meta name="theme-color" content="#0c0e0d">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="https://littlefightnyc.com/vera/${title === 'Field manual' ? 'manual' : 'archive'}/">
<link rel="stylesheet" href="../assets/css/doc.css?v=1">
</head>
<body>
<header class="docbar"><a class="docbar__brand" href="../"><b>VERA</b></a></header>
<main class="doc">
<h1>${esc(title)}</h1>
<p class="doc__lede">${esc(lede)}</p>
${body}
<p class="doc__foot"><a href="../">← the live app</a> · every number here is computed from a cited public record or marked ≈</p>
</main>
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
<li>Application fee: capped at $${C.LAW.appFeeMax} or the actual screening cost — waivable with your own report from the last 30 days.</li>
<li>Broker fee: whoever hires the broker pays (FARE Act, in effect since ${esc(C.LAW.fareActFrom)}).</li>
<li>Income convention: ${C.LAW.incomeRuleX}× monthly rent annually; guarantors are asked for ${C.LAW.guarantorRuleX}×.</li>
</ul>`;
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
    const r = await fetch('https://vera-pipeline.netlify.app/data/archive.json');
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
