#!/usr/bin/env node
// inject-partials.mjs — single-source the site nav, footer, and GA4 snippet.
//
// Marker-based, OUTPUT-PRESERVING, IDEMPOTENT injector. No dependencies.
//
// For each block (nav / footer / analytics) it:
//   1. If a page already has the marker pair, replaces the marked region's
//      inner content with the current partial (re-source on every run).
//   2. Otherwise finds the raw block in the page. Only if that block equals the
//      partial (ignoring leading/trailing whitespace) does it wrap the EXACT
//      matched span with HTML-comment markers. A block that differs is left
//      untouched and reported as SKIPPED — never forced.
//
// Markers are HTML comments, so rendered output is byte-identical
// (whitespace-insignificant). Running twice produces no diff.
//
// Usage:  node build/inject-partials.mjs        (mutate pages)
//         node build/inject-partials.mjs --check (report only, no writes)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

// --- block definitions ----------------------------------------------------
// `find` locates the raw (un-marked) block on a page.
const BLOCKS = [
  { id: 'nav',       partial: 'partials/nav.html',       find: /<nav role="navigation"[\s\S]*?<\/nav>/ },
  { id: 'footer',    partial: 'partials/footer.html',    find: /<footer role="contentinfo"[\s\S]*?<\/footer>/ },
  { id: 'analytics', partial: 'partials/analytics.html', find: /<script src="\/js\/lifi-tracking\.min\.js"[^>]*data-ga4-id="G-[^"]*"><\/script>/ },
];

const startMarker = (id) => `<!-- @include:${id} start -->`;
const endMarker   = (id) => `<!-- @include:${id} end -->`;
const markerRe    = (id) =>
  new RegExp(`<!-- @include:${id} start -->[\\s\\S]*?<!-- @include:${id} end -->`);

// Load partials (verbatim).
for (const b of BLOCKS) {
  const p = join(ROOT, b.partial);
  if (!existsSync(p)) {
    console.error(`Missing partial: ${b.partial}`);
    process.exit(1);
  }
  b.content = readFileSync(p, 'utf8');
}

// Recursively collect *.html files, skipping .git, node_modules, partials.
function collectHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules' || name === 'partials' || name === 'build') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) collectHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = collectHtml(ROOT).sort();

const report = { migrated: {}, skipped: {}, alreadyMarked: {}, absent: {} };
for (const b of BLOCKS) {
  report.migrated[b.id] = [];
  report.skipped[b.id] = [];
  report.alreadyMarked[b.id] = [];
  report.absent[b.id] = [];
}

let changedFiles = 0;

for (const file of files) {
  const rel = relative(ROOT, file);
  let src = readFileSync(file, 'utf8');
  let mutated = false;

  for (const b of BLOCKS) {
    const wrapped = startMarker(b.id) + b.content + endMarker(b.id);
    const mre = markerRe(b.id);

    if (mre.test(src)) {
      // Already marked: re-source inner content (idempotent).
      const next = src.replace(mre, wrapped);
      if (next !== src) { src = next; mutated = true; }
      report.alreadyMarked[b.id].push(rel);
      continue;
    }

    const m = b.find.exec(src);
    if (!m) {
      report.absent[b.id].push(rel);
      continue;
    }

    const matched = m[0];
    // Output-preserving: only replace when the on-page block equals the
    // partial ignoring leading/trailing whitespace.
    if (matched.trim() !== b.content.trim()) {
      report.skipped[b.id].push(rel);
      continue;
    }

    // Replace the EXACT matched span with the marker-wrapped partial.
    // Using indices avoids regex-special-char issues in replacement.
    src = src.slice(0, m.index) + wrapped + src.slice(m.index + matched.length);
    mutated = true;
    report.migrated[b.id].push(rel);
  }

  if (mutated && !CHECK_ONLY) {
    writeFileSync(file, src);
    changedFiles++;
  } else if (mutated && CHECK_ONLY) {
    changedFiles++;
  }
}

// --- report ----------------------------------------------------------------
function line(label, arr) {
  console.log(`  ${label}: ${arr.length}`);
}
console.log(`inject-partials ${CHECK_ONLY ? '(check only)' : ''}`);
console.log(`Scanned ${files.length} HTML files.\n`);
for (const b of BLOCKS) {
  console.log(`[${b.id}]`);
  line('newly wrapped', report.migrated[b.id]);
  line('already marked (re-sourced)', report.alreadyMarked[b.id]);
  line('skipped (block differs from canonical)', report.skipped[b.id]);
  line('absent (no such block)', report.absent[b.id]);
  if (report.skipped[b.id].length) {
    for (const f of report.skipped[b.id]) console.log(`      SKIP ${f}`);
  }
  if (report.absent[b.id].length) {
    for (const f of report.absent[b.id]) console.log(`      ABSENT ${f}`);
  }
  console.log('');
}
console.log(`${CHECK_ONLY ? 'Would change' : 'Changed'} ${changedFiles} file(s).`);
