#!/usr/bin/env node
/**
 * audit-signal.mjs — the signal-law ratchet (Small Craft doctrine §9 governance).
 *
 * "Orange is sacred": orange means exactly one thing — live / act here / this is
 * the point — and it must never creep in as decoration. Rather than risk a bulk
 * purge of the intentional orange atmosphere already tuned into the brand, this
 * enforces a RATCHET: it snapshots the current raw-orange footprint per file and
 * fails if any file grows its count or a new file introduces raw orange. Drift is
 * blocked; new orange in a component must go through the token / <Signal>.
 *
 *   node scripts/audit-signal.mjs            # check against baseline (CI gate)
 *   node scripts/audit-signal.mjs --update   # re-snapshot the baseline (deliberate)
 *
 * Allowed everywhere (not counted): the design token, the kernel force channels,
 * and CSS var() references — those ARE the sanctioned path to the signal color.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "src");
const BASELINE = join(HERE, "signal-baseline.json");

// Raw orange, in any form. var(--lf-fight ...) is the SANCTIONED reference and is
// deliberately excluded — that's the whole point of the token.
const RAW_ORANGE = /#f97316\b|#ff6f1f\b|rgba?\(\s*249\s*,\s*115\s*,\s*22\b/gi;
// Files where raw orange is exempt because they DEFINE or ARE the signal system.
const EXEMPT = [/\/styles\/editorial\/tokens\.css$/, /\/kernel\//];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(css|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

function countFile(p) {
  let n = 0;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    // a var(--lf-fight …) reference is sanctioned; strip those before counting.
    const stripped = line.replace(/var\(\s*--lf-fight[^)]*\)/gi, "");
    const m = stripped.match(RAW_ORANGE);
    if (m) n += m.length;
  }
  return n;
}

function scan() {
  const map = {};
  for (const p of walk(SRC)) {
    if (EXEMPT.some((re) => re.test(p.replace(/\\/g, "/")))) continue;
    const n = countFile(p);
    if (n > 0) map[relative(join(HERE, ".."), p).replace(/\\/g, "/")] = n;
  }
  return map;
}

const current = scan();
const update = process.argv.includes("--update");

if (update) {
  writeFileSync(BASELINE, JSON.stringify(current, null, 2) + "\n");
  const total = Object.values(current).reduce((a, b) => a + b, 0);
  console.log(`signal baseline written: ${Object.keys(current).length} files, ${total} raw-orange occurrences.`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error("No signal-baseline.json. Run: node scripts/audit-signal.mjs --update");
  process.exit(1);
}
const base = JSON.parse(readFileSync(BASELINE, "utf8"));

const problems = [];
for (const [file, n] of Object.entries(current)) {
  const b = base[file] ?? 0;
  if (n > b) problems.push(`  ${file}: raw orange ${b} → ${n} (+${n - b}) — use var(--lf-fight) / <Signal>, not a raw value`);
}

if (problems.length) {
  console.error("Signal-law ratchet FAILED — decorative/raw orange grew:\n" + problems.join("\n"));
  console.error("\nIf this new orange is a genuine signal, route it through var(--lf-fight); if it's intentional atmosphere, re-baseline deliberately with --update.");
  process.exit(1);
}
console.log(`signal-law ratchet OK — ${Object.keys(current).length} files at/under baseline. Orange stays sacred.`);
