import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRODUCTION_ORIGIN,
  changedUrlManifest,
  ownershipKeyMatches,
  releaseMatchesCandidate,
  sitemapUrls,
  submitIndexNow,
} from "./indexnow-lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const distRoot = path.join(appRoot, "dist");
const INDEXNOW_KEY = "e843c203-fad3-442c-80a6-2b08d8aa916f";
const KEY_LOCATION = `${PRODUCTION_ORIGIN}/${INDEXNOW_KEY}.txt`;

function usage() {
  return [
    "Usage: node scripts/indexnow-release.mjs [--dry-run | --submit --confirm-production] [--changed /path/] [--removed /path/]",
    "",
    "The default is a read-only dry run. It compares app/dist/sitemap.xml with the live production sitemap.",
    "Use --changed for a revised page that keeps the same canonical URL. --removed must still appear in the previous live sitemap.",
    "--submit requires the live /release.json revision to match app/dist/release.json and posts only the bounded manifest to IndexNow.",
  ].join("\n");
}

function parseArguments(argv) {
  const options = { mode: "dry-run", changed: [], removed: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") options.mode = "dry-run";
    else if (argument === "--submit") options.mode = "submit";
    else if (argument === "--confirm-production") options.confirmed = true;
    else if (argument === "--changed" || argument === "--removed") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} needs one canonical path or URL.`);
      options[argument.slice(2)].push(value);
      index += 1;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

async function getText(url) {
  const response = await fetch(url, { headers: { accept: "application/xml, application/json;q=0.9, text/plain;q=0.8" } });
  if (!response.ok) throw new Error(`Could not read ${url}: HTTP ${response.status}`);
  return response.text();
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  if (options.mode === "submit" && !options.confirmed) {
    throw new Error("Refusing IndexNow submission without --confirm-production.");
  }

  const [candidateSitemap, previousSitemap] = await Promise.all([
    readFile(path.join(distRoot, "sitemap.xml"), "utf8"),
    getText(`${PRODUCTION_ORIGIN}/sitemap.xml`),
  ]);
  const manifest = changedUrlManifest({
    previousUrls: sitemapUrls(previousSitemap),
    candidateUrls: sitemapUrls(candidateSitemap),
    changed: options.changed,
    removed: options.removed,
  });

  console.log(JSON.stringify({ mode: options.mode, origin: PRODUCTION_ORIGIN, ...manifest }, null, 2));
  if (options.mode === "dry-run") return;
  if (!manifest.urls.length) throw new Error("No added, changed, or removed public URLs to submit.");

  const [candidateReleaseText, liveReleaseText] = await Promise.all([
    readFile(path.join(distRoot, "release.json"), "utf8"),
    getText(`${PRODUCTION_ORIGIN}/release.json`),
  ]);
  const candidateRelease = JSON.parse(candidateReleaseText);
  const liveRelease = JSON.parse(liveReleaseText);
  if (!releaseMatchesCandidate(candidateRelease, liveRelease)) {
    throw new Error("Refusing IndexNow submission: app/dist release metadata does not match the ready, clean production release on littlefightnyc.com.");
  }
  const publicKey = await getText(KEY_LOCATION);
  if (!ownershipKeyMatches(publicKey, INDEXNOW_KEY)) {
    throw new Error("Refusing IndexNow submission: the public production ownership key is missing or does not match this release helper.");
  }

  const result = await submitIndexNow({ urls: manifest.urls, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION });
  const status = result.state === "accepted_pending_key"
    ? "IndexNow accepted the manifest pending ownership-key validation."
    : "IndexNow accepted the manifest for crawl notification.";
  console.log(`${status} ${result.submitted.length} changed public URL(s); acceptance does not guarantee crawl, indexing, or ranking.`);
}

main().catch((error) => {
  console.error(`IndexNow release helper failed: ${error.message}`);
  process.exitCode = 1;
});
