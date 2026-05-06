// Mass-updates the nav + footer across every HTML page in the repo
// to the new 4-quadrant structure. Idempotent — safe to run multiple times.
//
// Run: node scripts/mass-update-nav-footer.mjs

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ───────────────────────────────────────────────────────────────────────
// Replacements — old pattern → new pattern. Order matters for some.

const REPLACEMENTS = [
  // 1. Main nav links — used on ~87 pages.
  {
    name: "main-nav-links",
    old: '<a href="/business-systems/">Save Money</a><a href="/websites/">Websites</a><a href="/it-support/">IT Support</a><a href="/local-search/">Get Found</a><a href="/answers/">Answers</a><a href="/software-guides/">Guides</a><a href="/work/">Work</a><a href="/fit-check/">Start Here</a>',
    new: '<a href="/websites/">Websites</a><a href="/systems/">Custom Systems</a><a href="/consulting/">Consulting</a><a href="/it-support/">IT Support</a><a href="/fires/">Fires</a><a href="/case-studies/">Case Studies</a><a href="/fit-check/">Start Here</a>',
  },

  // 1b. Main nav links — `<ul>` variant used on homepage and answer pages
  {
    name: "main-nav-links-ul",
    old: '<ul class="nav-links"><li><a href="/business-systems/">Save Money</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/local-search/">Get Found</a></li><li><a href="/software-guides/">Guides</a></li><li><a href="/work/">Work</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/fit-check/">Start Here</a></li></ul>',
    new: '<ul class="nav-links"><li><a href="/websites/">Websites</a></li><li><a href="/systems/">Custom Systems</a></li><li><a href="/consulting/">Consulting</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/fires/">Fires</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/fit-check/">Start Here</a></li></ul>',
  },

  // 2. Mobile drawer nav — uses a different markup with drawer-icon spans.
  {
    name: "drawer-nav-links",
    old: '<a tabindex="-1" href="/business-systems/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">01</span><span class="drawer-link-text">Save Money</span></a><a tabindex="-1" href="/websites/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">02</span><span class="drawer-link-text">Websites</span></a><a tabindex="-1" href="/it-support/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">03</span><span class="drawer-link-text">IT Support</span></a><a tabindex="-1" href="/local-search/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">04</span><span class="drawer-link-text">Get Found</span></a><a tabindex="-1" href="/answers/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">05</span><span class="drawer-link-text">Answers</span></a><a tabindex="-1" href="/software-guides/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">06</span><span class="drawer-link-text">Guides</span></a><a tabindex="-1" href="/work/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">07</span><span class="drawer-link-text">Work</span></a><a tabindex="-1" href="/fit-check/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">08</span><span class="drawer-link-text">Start Here</span></a>',
    new: '<a tabindex="-1" href="/websites/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">01</span><span class="drawer-link-text">Websites</span></a><a tabindex="-1" href="/systems/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">02</span><span class="drawer-link-text">Custom Systems</span></a><a tabindex="-1" href="/consulting/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">03</span><span class="drawer-link-text">Consulting</span></a><a tabindex="-1" href="/it-support/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">04</span><span class="drawer-link-text">IT Support</span></a><a tabindex="-1" href="/fires/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">05</span><span class="drawer-link-text">Fires of the Week</span></a><a tabindex="-1" href="/case-studies/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">06</span><span class="drawer-link-text">Case Studies</span></a><a tabindex="-1" href="/about/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">07</span><span class="drawer-link-text">About David</span></a><a tabindex="-1" href="/fit-check/" onclick="toggleDrawer()"><span class="drawer-icon" aria-hidden="true">08</span><span class="drawer-link-text">Start Here</span></a>',
  },

  // 3. Footer "How We Help" column → "The Four Fights"
  {
    name: "footer-how-we-help",
    old: '<h3>How We Help</h3><ul><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/local-search/">Get Found</a></li><li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a></li><li><a href="/pricing/">Pricing</a></li><li><a href="/services/">Services</a></li></ul>',
    new: '<h3>The Four Fights</h3><ul><li><a href="/websites/">Websites &mdash; live in 14 days</a></li><li><a href="/systems/">Custom Systems &mdash; built in 30</a></li><li><a href="/consulting/">Consulting &mdash; 30-day fight plan</a></li><li><a href="/it-support/">IT Support &mdash; 2-hour response</a></li><li><a href="/fit-check/">Start a Fit Check</a></li></ul>',
  },

  // 3b. Footer "How We Help" — answers/ variant without /services/ link
  {
    name: "footer-how-we-help-no-services",
    old: '<h3>How We Help</h3><ul><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/local-search/">Get Found</a></li><li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a></li><li><a href="/pricing/">Pricing</a></li></ul>',
    new: '<h3>The Four Fights</h3><ul><li><a href="/websites/">Websites &mdash; live in 14 days</a></li><li><a href="/systems/">Custom Systems &mdash; built in 30</a></li><li><a href="/consulting/">Consulting &mdash; 30-day fight plan</a></li><li><a href="/it-support/">IT Support &mdash; 2-hour response</a></li><li><a href="/fit-check/">Start a Fit Check</a></li></ul>',
  },

  // 3c. Footer "How We Help" — areas/ variant with different ordering
  {
    name: "footer-how-we-help-areas",
    old: '<h3>How We Help</h3><ul><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/local-search/">Get Found</a></li><li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a></li><li><a href="/pricing/">Pricing</a></li></ul>',
    new: '<h3>The Four Fights</h3><ul><li><a href="/websites/">Websites &mdash; live in 14 days</a></li><li><a href="/systems/">Custom Systems &mdash; built in 30</a></li><li><a href="/consulting/">Consulting &mdash; 30-day fight plan</a></li><li><a href="/it-support/">IT Support &mdash; 2-hour response</a></li><li><a href="/fit-check/">Start a Fit Check</a></li></ul>',
  },

  // 3d. Footer "How We Help" — websites/ variant without /pricing/, with /services/
  {
    name: "footer-how-we-help-no-pricing",
    old: '<h3>How We Help</h3><ul><li><a href="/nyc-websites-it-support/">NYC Websites and IT</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/websites/">Websites</a></li><li><a href="/it-support/">IT Support</a></li><li><a href="/local-search/">Get Found</a></li><li><a href="/answers/">Owner Answers</a></li><li><a href="/software-guides/">Software Guides</a></li><li><a href="/software-cost-calculator/">Cost Calculator</a></li><li><a href="/services/">Services</a></li></ul>',
    new: '<h3>The Four Fights</h3><ul><li><a href="/websites/">Websites &mdash; live in 14 days</a></li><li><a href="/systems/">Custom Systems &mdash; built in 30</a></li><li><a href="/consulting/">Consulting &mdash; 30-day fight plan</a></li><li><a href="/it-support/">IT Support &mdash; 2-hour response</a></li><li><a href="/fit-check/">Start a Fit Check</a></li></ul>',
  },

  // 4. Footer Company column (full variant)
  {
    name: "footer-company-full",
    old: '<h3>Company</h3><ul><li><a href="/">Home</a></li><li><a href="/about/">About</a></li><li><a href="/work/">Our Work</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/software-guides/">Guides</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/industries/">Industries</a></li><li><a href="/fit-check/">Start Here</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms</a></li></ul>',
    new: '<h3>Company</h3><ul><li><a href="/about/">About David</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/fires/">Fires of the Week</a></li><li><a href="/ask/">Ask Little Fight</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms</a></li></ul>',
  },

  // 5. Footer Company column (about-page variant — without /work/, /software-guides/, /business-systems/, /industries/)
  {
    name: "footer-company-about",
    old: '<h3>Company</h3><ul><li><a href="/about/">About</a></li><li><a href="/work/">Our Work</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/software-guides/">Guides</a></li><li><a href="/business-systems/">Save Money</a></li><li><a href="/fit-check/">Start Here</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms</a></li></ul>',
    new: '<h3>Company</h3><ul><li><a href="/about/">About David</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/fires/">Fires of the Week</a></li><li><a href="/ask/">Ask Little Fight</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms</a></li></ul>',
  },

  // 6. Footer Company column (industries variant)
  {
    name: "footer-company-industries",
    old: '<h3>Company</h3><ul><li><a href="/about/">About</a></li><li><a href="/work/">Work</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/industries/">Industries</a></li><li><a href="/solutions/">Method</a></li><li><a href="/fit-check/">Start Here</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms</a></li></ul>',
    new: '<h3>Company</h3><ul><li><a href="/about/">About David</a></li><li><a href="/case-studies/">Case Studies</a></li><li><a href="/fires/">Fires of the Week</a></li><li><a href="/ask/">Ask Little Fight</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms</a></li></ul>',
  },

  // 7. Tagline normalization — every page
  {
    name: "tagline-normalize",
    old: '<span class="nav-brand-tagline">Local Business Advantage</span>',
    new: '<span class="nav-brand-tagline">NYC Small Business Tech</span>',
  },

  // 8. Common AI-tell scrubs from research (light touch — only most damaging)
  {
    name: "ai-tell-leverage",
    old: "leverage",
    new: "use",
    caseSensitive: false,
  },

  // 9. Industries pages: Hero CTA pattern
  {
    name: "industries-hero-cta",
    old: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/industries/">Open industries hub</a></div>',
    new: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start a 60-second Fit Check</a><a class="btn-ghost" href="/industries/">Open industries hub</a></div>',
  },

  // 10. Industries pages: Footer "Estimate software drag" CTA
  {
    name: "industries-footer-cta",
    old: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/software-cost-calculator/">Estimate software drag</a></div>',
    new: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start a 60-second Fit Check</a><a class="btn-ghost" href="tel:+16463600318">Call (646) 360-0318</a></div>',
  },

  // 11. Industries hub: Hero CTA pattern (links to /software-guides/)
  {
    name: "industries-hub-hero-cta",
    old: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/software-guides/">Read software guides</a></div>',
    new: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start a 60-second Fit Check</a><a class="btn-ghost" href="/consulting/">Book a Walkthrough audit</a></div>',
  },

  // 12. Industries hub: Footer "Estimate monthly waste" CTA
  {
    name: "industries-hub-footer-cta",
    old: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/software-cost-calculator/">Estimate monthly waste</a></div>',
    new: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start a 60-second Fit Check</a><a class="btn-ghost" href="tel:+16463600318">Call (646) 360-0318</a></div>',
  },

  // 13. Generic answer pages: hero with "Start Here" + tel CTA
  {
    name: "answer-page-hero-cta",
    old: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="tel:+16463600318">Call if it is broken</a></div>',
    new: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start a 60-second Fit Check</a><a class="btn-ghost" href="tel:+16463600318">Call (646) 360-0318</a></div>',
  },

  // 14. Generic answer pages: footer-CTA with "Back to answers"
  {
    name: "answer-page-footer-back",
    old: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start Here</a><a class="btn-ghost" href="/answers/">Back to answers</a></div>',
    new: '<div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">Start a 60-second Fit Check</a><a class="btn-ghost" href="/answers/">Back to answers</a></div>',
  },
];

const SKIP_DIRS = new Set([
  ".git",
  ".github",
  ".claude",
  ".playwright-mcp",
  ".superpowers",
  ".netlify",
  "backup",
  "dist",
  "dist-corrupt-20260503-1845",
  "dist-corrupt-20260503-1847",
  "node_modules",
  "scripts",
  "tmp",
  "vendor",
]);

function findHtmlFiles() {
  const out = execSync(
    `find . -name "*.html" -not -path "./dist/*" -not -path "./tmp/*" -not -path "./backup/*" -not -path "./node_modules/*" -not -path "./vendor/*" -not -path "./.git/*" -not -path "./dist-corrupt-*"`,
    { cwd: root, encoding: "utf8" }
  );
  return out.split("\n").filter(Boolean).map((p) => path.resolve(root, p));
}

async function processFile(filePath) {
  let content = await readFile(filePath, "utf8");
  let original = content;
  let totalReplacements = 0;
  const detail = [];

  for (const r of REPLACEMENTS) {
    if (r.caseSensitive === false) continue; // skip the AI-tell scrub for now — too risky for blanket apply
    if (content.includes(r.old)) {
      const before = content;
      content = content.split(r.old).join(r.new);
      const replacements = (before.length - content.length + (content.length - before.length + r.new.length * (before.split(r.old).length - 1))) / r.old.length;
      const count = before.split(r.old).length - 1;
      totalReplacements += count;
      detail.push(`${r.name}×${count}`);
    }
  }

  if (content !== original) {
    await writeFile(filePath, content, "utf8");
    return { changed: true, totalReplacements, detail };
  }
  return { changed: false, totalReplacements: 0, detail: [] };
}

async function main() {
  const files = findHtmlFiles();
  console.log(`Found ${files.length} HTML files`);

  let changed = 0;
  let totalReplacements = 0;
  const stats = new Map();

  for (const file of files) {
    const rel = path.relative(root, file);
    const result = await processFile(file);
    if (result.changed) {
      changed++;
      totalReplacements += result.totalReplacements;
      console.log(`✓ ${rel}: ${result.detail.join(", ")}`);
      for (const d of result.detail) {
        const [name] = d.split("×");
        stats.set(name, (stats.get(name) || 0) + 1);
      }
    }
  }

  console.log("");
  console.log(`Done. ${changed}/${files.length} files changed, ${totalReplacements} total replacements.`);
  console.log("");
  console.log("Replacements by type:");
  for (const [name, count] of stats) {
    console.log(`  ${name}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
