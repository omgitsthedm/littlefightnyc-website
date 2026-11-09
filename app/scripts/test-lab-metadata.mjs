#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(app, "public", "examples", "lab");
const origin = "https://littlefightnyc.com";

const directConcepts = [
  "goliath",
  "growth-street",
  "micro-animations",
  "pill-scroll",
  "studio-engine",
  "terminal-3d",
  "walkup-3d",
];
// Cabinet Lab and Farm House are separately generated protected engines.
// Their public reader policy is owned by those generator contracts, so this
// test deliberately covers only the eight standalone Lab pages audited here.
const suiteMetadata = {
  "brand-campaign": {
    image: "/examples/lab/assets/goliath-poster.webp?v=1",
    alt: "A colossal LITTLE FIGHT poster in orange pasted over a stack of street posters",
  },
  "business-systems": {
    image: "/examples/lab/assets/studio-engine-poster.webp?v=1",
    alt: "A generated barbershop website inside a browser frame with visual-direction controls",
  },
  cinema: {
    image: "/examples/lab/assets/pool-room-poster.webp?v=1",
    alt: "A dive-bar pool table with fifteen balls racked under a warm three-shade fixture",
  },
  "motion-playground": {
    image: "/examples/lab/assets/pill-film-poster.webp?v=1",
    alt: "A capsule-shaped frame revealing commuters inside Grand Central",
  },
  "spatial-nyc": {
    image: "/examples/lab/assets/brownstone-poster.webp?v=5",
    alt: "A six-story New York walk-up night diorama",
  },
};

const attr = (html, name, value) => new RegExp(`<${name}[^>]+(?:name|property)=["']${value}["'][^>]+content=["']([^"']+)["']`, "i").exec(html)?.[1];
const canonical = (html) => /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i.exec(html)?.[1];
const conceptFile = (slug) => path.join(publicRoot, "concepts", slug, "index.html");

for (const slug of directConcepts) {
  const source = await readFile(conceptFile(slug), "utf8");
  assert.equal(canonical(source), `${origin}/examples/lab/concepts/${slug}/`, `${slug} must self-canonicalize`);
  assert.equal(attr(source, "meta", "robots"), "index,follow,max-image-preview:large", `${slug} must be intentionally indexable`);
}

const aha = await readFile(conceptFile("aha-laser"), "utf8");
assert.equal(canonical(aha), `${origin}/examples/lab/concepts/aha-laser/`, "AHA needs a stable identity even while excluded");
assert.equal(attr(aha, "meta", "robots"), "noindex, nofollow", "AHA must preserve its existing exclusion policy");

for (const [slug, expected] of Object.entries(suiteMetadata)) {
  const source = await readFile(path.join(publicRoot, "suites", slug, "index.html"), "utf8");
  const canonicalUrl = `${origin}/examples/lab/suites/${slug}/`;
  assert.equal(attr(source, "meta", "og:url"), canonicalUrl, `${slug} must publish its canonical Open Graph URL`);
  assert.equal(attr(source, "meta", "og:type"), "website", `${slug} must identify its share document`);
  assert.equal(attr(source, "meta", "og:image"), `${origin}${expected.image}`, `${slug} needs an approved absolute Open Graph image`);
  assert.equal(attr(source, "meta", "og:image:alt"), expected.alt, `${slug} needs the matching image alternative`);
  assert.equal(attr(source, "meta", "twitter:card"), "summary_large_image", `${slug} needs a large Twitter card`);
  assert.equal(attr(source, "meta", "twitter:image"), `${origin}${expected.image}`, `${slug} needs its matching Twitter image`);
  assert.equal(attr(source, "meta", "twitter:image:alt"), expected.alt, `${slug} needs matching Twitter image alternative`);
}

console.log(`PASS Lab metadata policy: ${directConcepts.length} indexable concepts, AHA excluded, ${Object.keys(suiteMetadata).length} share-ready suites.`);
