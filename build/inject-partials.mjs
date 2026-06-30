#!/usr/bin/env node
/**
 * inject-partials.mjs — Single-source-of-truth injector for shared HTML blocks.
 *
 * WHAT IT DOES
 *   The site's <nav>, site <footer role="contentinfo">, and GA4 analytics snippet
 *   were copy-pasted byte-for-byte into every content page. This script makes
 *   `partials/{nav,footer,analytics}.html` the ONE canonical source and injects
 *   them into each page between HTML-comment markers:
 *
 *     <!-- @include:nav start -->…canonical nav…<!-- @include:nav end -->
 *     <!-- @include:footer start -->…canonical footer…<!-- @include:footer end -->
 *     <!-- @include:analytics start -->…canonical GA4…<!-- @include:analytics end -->
 *
 *   First run = migration: it finds the existing block, verifies it is SAFE to
 *   replace, and wraps the canonical partial in markers. Later runs just refresh
 *   the content between the markers. Running it twice is a no-op (idempotent).
 *
 * OUTPUT PRESERVATION (the whole point)
 *   A page is only touched for a given block when the page's CURRENT block is
 *   byte-identical to the partial (so the rendered HTML does not change), OR the
 *   block is already wrapped in markers (re-inject). Any page whose block genuinely
 *   differs is SKIPPED and reported — never force-converged. Known skips today:
 *   index.html's nav and footer (it is a JS single-page app whose nav is wired to
 *   navigateTo()/toggleDrawer() — converging would change behaviour), and
 *   contact/index.html's analytics (a whitespace-only variant, functionally
 *   identical but not byte-identical).
 *
 * USAGE
 *   node build/inject-partials.mjs            # inject / refresh
 *   node build/inject-partials.mjs --check    # report only, write nothing (CI gate)
 *
 * No dependencies. Node 16+.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PARTIALS = join(ROOT, 'partials');
const CHECK_ONLY = process.argv.includes('--check');

// Directories we never walk into.
const IGNORE_DIRS = new Set(['partials', 'build', 'node_modules', 'vendor', '.netlify', '.git', 'assets']);

// --- load canonical partials -------------------------------------------------
const read = (f) => readFileSync(join(PARTIALS, f), 'utf8');
const NAV = read('nav.html');
const FOOTER = read('footer.html');
const ANALYTICS = read('analytics.html');

/**
 * Block definitions.
 *   id        marker id used in the HTML comments
 *   content   canonical partial content to inject
 *   find      regex that matches the RAW (un-marked) existing block on a page
 *   safe      (current) => boolean — is this raw block safe to replace?
 *             Byte-identical to `content` only, so injection never changes the
 *             rendered output. Anything else is skipped and reported.
 */
const BLOCKS = [
  {
    id: 'analytics',
    content: ANALYTICS,
    find: /<!-- GA4 -->\s*<script async[\s\S]*?G-0Q1TGWH0HL"\);<\/script>/,
    // Byte-identical only, to guarantee zero rendered-output change.
    // contact/index.html carries a whitespace-only variant (newlines vs inline).
    // It is functionally identical but NOT byte-identical, so it is left untouched
    // and reported for human review rather than silently rewritten.
    safe: (cur) => cur === ANALYTICS,
  },
  {
    id: 'nav',
    content: NAV,
    find: /<nav\b[\s\S]*?<\/nav>/,
    safe: (cur) => cur === NAV, // byte-identical only — never force-converge a forked nav
  },
  {
    id: 'footer',
    content: FOOTER,
    // Site footer only (role="contentinfo"); NOT the in-article
    // <footer class="content-meta"> byline that some pages carry inside <main>.
    find: /<footer role="contentinfo">[\s\S]*?<\/footer>/,
    safe: (cur) => cur === FOOTER, // byte-identical only
  },
];

const marker = (id, which) => `<!-- @include:${id} ${which} -->`;
const markerBlockRe = (id) =>
  new RegExp(`<!-- @include:${id} start -->[\\s\\S]*?<!-- @include:${id} end -->`);

// --- walk html files ---------------------------------------------------------
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (IGNORE_DIRS.has(name)) continue;
      yield* walk(full);
    } else if (name.endsWith('.html')) {
      yield full;
    }
  }
}

const summary = { wrapped: {}, refreshed: {}, skipped: [], unchanged: 0, files: 0 };
for (const id of ['nav', 'footer', 'analytics']) {
  summary.wrapped[id] = 0;
  summary.refreshed[id] = 0;
}

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).split(sep).join('/');
  let html = readFileSync(file, 'utf8');
  const before = html;

  for (const block of BLOCKS) {
    const wrapped = `${marker(block.id, 'start')}${block.content}${marker(block.id, 'end')}`;
    const markerRe = markerBlockRe(block.id);

    if (markerRe.test(html)) {
      // Already migrated: refresh content between markers (idempotent).
      const next = html.replace(markerRe, wrapped);
      if (next !== html) {
        html = next;
        summary.refreshed[block.id]++;
      }
      continue;
    }

    const m = html.match(block.find);
    if (!m) continue; // block type not present on this page (fine)

    const current = m[0];
    if (current === wrapped) continue; // defensive: already exactly right

    if (!block.safe(current)) {
      summary.skipped.push({ rel, id: block.id });
      continue; // genuinely differs — leave it for human review
    }

    html = html.replace(block.find, wrapped);
    summary.wrapped[block.id]++;
  }

  if (html !== before) {
    summary.files++;
    if (!CHECK_ONLY) writeFileSync(file, html);
  } else {
    summary.unchanged++;
  }
}

// --- report ------------------------------------------------------------------
const lines = [];
lines.push(CHECK_ONLY ? '[inject-partials] CHECK (no writes)' : '[inject-partials] done');
lines.push(`  files changed:   ${summary.files}`);
lines.push(`  files unchanged: ${summary.unchanged}`);
for (const id of ['nav', 'footer', 'analytics']) {
  lines.push(`  ${id}: wrapped ${summary.wrapped[id]}, refreshed ${summary.refreshed[id]}`);
}
if (summary.skipped.length) {
  lines.push('  SKIPPED (block differs from canonical — left untouched, review by hand):');
  for (const s of summary.skipped) lines.push(`    - ${s.rel}  [${s.id}]`);
} else {
  lines.push('  skipped: none');
}
console.log(lines.join('\n'));
