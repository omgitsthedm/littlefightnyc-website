#!/usr/bin/env node
/**
 * Keep the public appointment route useful, optional, and safe.
 *
 * The Google Calendar URL has one authored source in data/contact.ts. Every
 * public surface consumes that constant, opens the third-party page in a new
 * tab without an opener, and keeps the Tech Audit / Website Check as the main
 * path. This catches the easy regressions: a copied calendar URL, a booking
 * link with unsafe attributes, or a generated report/email that loses its
 * plain-English handoff.
 */
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKING_HREF } from "../src/data/contact.ts";
import { generateAuditHTML } from "../../netlify/functions/lib/templates.mts";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = join(appRoot, "..");
const authoredRoots = [
  join(appRoot, "src"),
  join(appRoot, "public"),
  join(appRoot, "scripts"),
  join(repoRoot, "netlify", "functions"),
];
const textExtensions = new Set([".css", ".html", ".js", ".mjs", ".mts", ".ts", ".tsx"]);

async function textFiles(directory, output = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) await textFiles(fullPath, output);
    else if (textExtensions.has(extname(entry.name))) output.push(fullPath);
  }
  return output;
}

const authoredFiles = (await Promise.all(authoredRoots.map((root) => textFiles(root)))).flat();
let literalCount = 0;
for (const file of authoredFiles) {
  const source = await readFile(file, "utf8");
  literalCount += source.split(BOOKING_HREF).length - 1;
}
assert.equal(
  literalCount,
  1,
  "the Google Calendar URL must have exactly one authored source in app/src/data/contact.ts",
);

function anchorTags(source) {
  return [...source.matchAll(/<a\b[\s\S]*?>/g)].map((match) => match[0]);
}

for (const relativePath of [
  "src/pages/WebsiteCheck.tsx",
  "src/pages/Thanks.tsx",
  "src/pages/Clients.tsx",
  "src/components/editorial/QuietHero.tsx",
  "src/components/editorial/QuietContact.tsx",
  "src/components/editorial/ClientContinuity.tsx",
]) {
  const source = await readFile(join(appRoot, relativePath), "utf8");
  const bookingTags = anchorTags(source).filter((tag) => tag.includes("BOOKING_HREF"));
  assert.ok(bookingTags.length > 0, `${relativePath}: missing BOOKING_HREF anchor`);
  for (const tag of bookingTags) {
    assert.match(tag, /target="_blank"/, `${relativePath}: booking link must open a new tab`);
    assert.match(
      tag,
      /rel="noopener noreferrer"/,
      `${relativePath}: booking link must isolate the third-party tab`,
    );
  }
}

const growthPathSource = await readFile(
  join(appRoot, "src/components/editorial/GrowthPath.tsx"),
  "utf8",
);
assert.match(growthPathSource, /href:\s*BOOKING_HREF/);
assert.match(growthPathSource, /rel=\{stage\.href\.startsWith\("http"\) \? "noopener noreferrer"/);

const metric = {
  value: 92,
  source: "google_pagespeed_lighthouse",
  observedAt: "2026-08-03T12:00:00.000Z",
  availability: "measured",
};
const reportHTML = generateAuditHTML({
  companyName: "Test Business",
  domain: "example.com",
  city: "New York",
  state: "NY",
  niche: "Retail",
  email: "owner@example.com",
  slug: "example-com-test",
  overallScore: 92,
  grade: "A",
  metrics: {
    performance: metric,
    seo: metric,
    accessibility: metric,
    bestPractices: metric,
  },
  brandColors: {
    primary: "#f97316",
    accent: "#70a5ff",
    background: "#06080f",
  },
  findings: [{ severity: "info", title: "Measured", description: "Verified finding." }],
  ctaText: "Review this report with Little Fight NYC",
  auditDate: "August 3, 2026",
});
const reportBookingTags = anchorTags(reportHTML).filter((tag) => tag.includes(BOOKING_HREF));
assert.equal(reportBookingTags.length, 1, "generated Website Audit report must have one booking link");
assert.match(reportBookingTags[0], /target="_blank"/);
assert.match(reportBookingTags[0], /rel="noopener noreferrer"/);
assert.match(reportHTML, /Book a free 30-minute second opinion/);
assert.match(reportHTML, /Google Meet/);
assert.match(reportHTML, /\/tech-audit\/\?/u, "booking must not replace the report's Tech Audit route");

const emailSource = await readFile(
  join(repoRoot, "netlify/functions/run-audit-background.mts"),
  "utf8",
);
assert.match(emailSource, /href="\$\{escHtml\(BOOKING_HREF\)\}"/);
assert.match(emailSource, /target="_blank" rel="noopener noreferrer"/);
assert.match(emailSource, /Book a free 30-minute second opinion/);
assert.match(emailSource, /Google Meet/);

console.log(
  "PASS booking-bridge — one calendar source; public, report, and email handoffs remain optional and safe.",
);
