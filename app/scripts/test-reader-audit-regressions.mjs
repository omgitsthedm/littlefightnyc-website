#!/usr/bin/env node
/*
 * Focused source contract for the reader remedies. Browser coverage belongs in
 * the existing local candidate gates; this keeps their essential mechanics
 * from silently being replaced while a later visual change is in progress.
 */
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { safeTechAuditLeadOrigin } from "../src/lib/techAuditOrigin.ts";

const app = new URL("../", import.meta.url);
const source = async (relativePath) => readFile(new URL(relativePath, app), "utf8");

const [site, story, readerCss, auditCss, origin, techAudit] = await Promise.all([
  source("preview-ui/site.js"),
  source("preview-ui/website-story.js"),
  source("preview-ui/reader.css"),
  source("src/styles/editorial/tech-audit.css"),
  source("src/lib/techAuditOrigin.ts"),
  source("src/pages/TechAudit.tsx"),
]);

assert.match(site, /detailBody\.scrollTo\(\{[\s\S]*?top: Math\.max\(0, detailBody\.scrollTop \+ targetRect\.top - bodyRect\.top - detailBody\.clientTop\)/u,
  "same-reader fragments must scroll only the reader body");
assert.doesNotMatch(site, /target\.scrollIntoView\(/u,
  "same-reader fragments must not scroll-chain through the fixed dialog");
assert.match(site, /target\.focus\(\{ preventScroll: true \}\)/u,
  "fragment targets retain keyboard focus without a second scroll");

assert.match(story, /requestAnimationFrame\(\(\) => update\(\)\)/u,
  "ordinary animation frames must not pass rAF timestamps as the force flag");

assert.match(readerCss, /#detail\[data-reader-rail=true\][\s\S]*?\.lf-audit-intro__channels/u,
  "only a reader with the persistent rail may hide duplicate intro channels");
assert.match(site, /detail\.dataset\.readerRail = 'true'/u,
  "the reader rail state is explicit before duplicate channels can hide");
assert.match(readerCss, /\.rw-client-project__plus\{display:inline-block;white-space:nowrap\}/u,
  "gallery plus signs stay with their project labels");

assert.match(auditCss, /\.lf-audit__example a \{[\s\S]*?color: var\(--lf-fight\);/u,
  "example proof links use the opaque brand color");
assert.match(auditCss, /\.lf-audit-intro__proof-links a \{[\s\S]*?color: var\(--lf-fight\);/u,
  "intro proof links use the opaque brand color");

assert.match(origin, /CANONICAL_PUBLIC_PATHS/u,
  "reader origins must use a known public route allowlist");
assert.match(origin, /url\.search \|\|[\s\S]*?url\.hash/u,
  "origins with query or fragment context are rejected");
assert.match(techAudit, /safeTechAuditLeadOrigin\(searchParams\.get\("source"\)\)/u,
  "the actual Tech Audit form uses the bounded origin parser");
assert.match(techAudit, /name="lead_origin" value=\{leadOrigin\}/u,
  "the accepted origin remains in the native form payload");
assert.equal(safeTechAuditLeadOrigin("website_service_proof"), "website_service_proof");
assert.equal(safeTechAuditLeadOrigin("/services/custom-local-websites/"), "/services/custom-local-websites/");
assert.equal(safeTechAuditLeadOrigin("/services/custom-local-websites/?business=private"), "");
assert.equal(safeTechAuditLeadOrigin("https://elsewhere.example/"), "");

// Test the built public handoffs too: a source-only allowlist check can miss
// newly generated answer cards added by the tile content library.
const generatedOrigins = new Set();
const dist = new URL("dist/", app);
for (const file of await readdir(dist, { recursive: true })) {
  if (!file.endsWith(".html") || /^(?:vera|brand-kit)\//u.test(file)) continue;
  const html = await readFile(new URL(file, dist), "utf8");
  for (const match of html.matchAll(/href=["']([^"']+)["']/gu)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"), "https://littlefightnyc.com");
    if (url.origin !== "https://littlefightnyc.com" || url.pathname !== "/tech-audit/") continue;
    const origin = url.searchParams.get("source");
    if (origin) generatedOrigins.add(origin);
  }
}
assert.ok(generatedOrigins.size > 300, "audit every generated reader handoff");
for (const origin of generatedOrigins) {
  assert.equal(safeTechAuditLeadOrigin(origin), origin, `generated inquiry origin must be accepted: ${origin}`);
}
for (const privateOrUnknown of ["//elsewhere.example/", "/not-a-public-page/", "/contact/#private", "/contact/?email=person@example.test", "/contact/../contact/", "x".repeat(161)]) {
  assert.equal(safeTechAuditLeadOrigin(privateOrUnknown), "", "unknown or private attribution must be rejected");
}

console.log("PASS reader-audit-regressions — scroll, motion, contrast, responsive actions, and bounded origin contracts remain intact.");
