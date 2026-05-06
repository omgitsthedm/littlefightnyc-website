#!/usr/bin/env node
/**
 * Replace emoji icons in buttons with modern industrial line SVGs.
 *
 * Modern industrial = Lucide/Heroicons style:
 *   - 24x24 viewBox, currentColor stroke
 *   - stroke-width 1.8, rounded caps/joins
 *   - clean line work, no fills, no shading
 *
 * Targets the visible emoji that show up in CTAs across the site:
 *   📞 (phone) → handset SVG
 *   💬 (text)  → chat bubble SVG
 *   ✉️ (email) → envelope SVG
 *   📝 (form)  → document SVG
 *   🧮 (calc)  → calculator SVG
 *
 * The replacements are token-exact (full button text in the pattern)
 * so we don't accidentally match emojis in body copy.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIP_DIRS = new Set(["dist", "backup", "tmp", "node_modules", ".netlify", ".git"]);

// Inline SVGs — Lucide-style industrial line icons
const ICO = {
  phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  text:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  email: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
  form:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  calc:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h.01M12 18h.01"/></svg>',
};

// Targeted button-text replacements. Patterns are conservative — they include
// the full button label so we never replace emojis in body copy.
const REPLACEMENTS = [
  // Hero & final-CTA contact rows (Call / Text / Email / Form)
  ['>📞 Call (646) 360-0318</a>', `>${ICO.phone}Call (646) 360-0318</a>`],
  ['>💬 Text us</a>',              `>${ICO.text}Text us</a>`],
  ['>✉️ Email us</a>',             `>${ICO.email}Email us</a>`],
  ['>📝 Contact form</a>',         `>${ICO.form}Contact form</a>`],
  // Older variant we still might find
  ['>📝 Send a message</a>',       `>${ICO.form}Send a message</a>`],
  // Calculator promo CTAs
  ['>🧮 Open the lifetime cost calculator &rarr;</a>', `>${ICO.calc}Open the lifetime cost calculator &rarr;</a>`],
  ['>🧮 Open the calculator</a>',                       `>${ICO.calc}Open the calculator</a>`],
  ['>🧮 Open the calculator &rarr;</a>',                `>${ICO.calc}Open the calculator &rarr;</a>`],
];

async function* walk(dir, rel = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walk(join(dir, e.name), rel ? `${rel}/${e.name}` : e.name);
    } else if (e.isFile() && e.name.endsWith(".html")) {
      yield { abs: join(dir, e.name), rel: rel ? `${rel}/${e.name}` : e.name };
    }
  }
}

let touched = 0,
  swaps = 0;
for await (const { abs, rel } of walk(ROOT)) {
  let html = await readFile(abs, "utf8");
  let didSwap = false;
  for (const [from, to] of REPLACEMENTS) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      swaps++;
      didSwap = true;
    }
  }
  if (didSwap) {
    await writeFile(abs, html, "utf8");
    touched++;
    console.log("✓", rel);
  }
}

console.log(`\nDone — pages touched: ${touched}, total emoji-to-SVG swaps: ${swaps}`);
