import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRODUCTION_ORIGIN,
  changedUrlManifest,
  createReleasePlan,
  gitTreeId,
  ownershipKeyMatches,
  releaseMatchesCandidate,
  selectReleasePlan,
  sitemapUrls,
  submitIndexNow,
} from "./indexnow-lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const repoRoot = path.resolve(appRoot, "..");
const distRoot = path.join(appRoot, "dist");
// Root output/ is gitignored local working state, never deployed.
const planRoot = path.join(repoRoot, "output", "indexnow");
const planPath = (revision) => path.join(planRoot, `plan-${revision}.json`);
const INDEXNOW_KEY = "e843c203-fad3-442c-80a6-2b08d8aa916f";
const KEY_LOCATION = `${PRODUCTION_ORIGIN}/${INDEXNOW_KEY}.txt`;

function usage() {
  return [
    "Usage: node scripts/indexnow-release.mjs [--dry-run | --submit --confirm-production] [--changed /path/] [--removed /path/]",
    "",
    "Before pushing a release: the dry run compares app/dist/sitemap.xml with the live (outgoing) production sitemap",
    "and records that outgoing URL set in output/indexnow/ for the candidate commit and its Git tree. It never contacts IndexNow.",
    "Record it from the final candidate, after it is up to date with main: a PR merge or squash then deploys the same tree.",
    "After that release is live: --submit requires the live /release.json revision to match app/dist/release.json",
    "(rebuild app/dist at the deployed main commit), finds the plan by commit or by tree, and posts only the added,",
    "removed, and --changed URLs. No URLs is a no-op.",
    "Use --changed for a revised page that keeps the same canonical URL. --removed must appear in the outgoing sitemap.",
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
  const response = await fetch(url, {
    headers: { accept: "application/xml, application/json;q=0.9, text/plain;q=0.8" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Could not read ${url}: HTTP ${response.status}`);
  return response.text();
}

async function recordedPlans() {
  const names = await readdir(planRoot).catch(() => []);
  const plans = await Promise.all(
    names
      .filter((name) => /^plan-[0-9a-f]+\.json$/i.test(name))
      .map((name) => readFile(path.join(planRoot, name), "utf8").then((text) => JSON.parse(text)).catch(() => null)),
  );
  return plans.filter(Boolean);
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

  const [candidateSitemap, liveSitemap, candidateReleaseText, liveReleaseText] = await Promise.all([
    readFile(path.join(distRoot, "sitemap.xml"), "utf8"),
    getText(`${PRODUCTION_ORIGIN}/sitemap.xml`),
    readFile(path.join(distRoot, "release.json"), "utf8"),
    getText(`${PRODUCTION_ORIGIN}/release.json`),
  ]);
  const candidateRelease = JSON.parse(candidateReleaseText);
  const liveRelease = JSON.parse(liveReleaseText);
  const candidateTree = gitTreeId(candidateRelease.revision, repoRoot);
  const liveTree = gitTreeId(liveRelease.revision, repoRoot);
  const sameCommit = candidateRelease.revision === liveRelease.revision;
  const alreadyLive = sameCommit || Boolean(candidateTree && candidateTree === liveTree);

  let previousUrls = sitemapUrls(liveSitemap);
  let baseline = "live sitemap of the outgoing release";
  if (alreadyLive) {
    const recorded = selectReleasePlan(await recordedPlans(), { revision: candidateRelease.revision, tree: candidateTree });
    if (recorded) {
      previousUrls = recorded.previousUrls;
      const via = recorded.match === "tree" ? `, same source tree as ${candidateRelease.revision}` : "";
      baseline = `plan recorded ${recorded.plan.created_at} for ${recorded.plan.candidate_revision}${via}, against release ${recorded.plan.previous_revision}`;
    } else {
      baseline = "none: no plan for this commit or its source tree was recorded before it went live, so only --changed URLs can be found";
    }
  }

  const manifest = changedUrlManifest({
    previousUrls,
    candidateUrls: sitemapUrls(candidateSitemap),
    changed: options.changed,
    removed: options.removed,
  });

  console.log(JSON.stringify({
    mode: options.mode,
    origin: PRODUCTION_ORIGIN,
    candidate_revision: candidateRelease.revision,
    live_revision: liveRelease.revision,
    baseline,
    ...manifest,
  }, null, 2));

  if (options.mode === "dry-run") {
    if (alreadyLive) {
      console.log("Production already serves this candidate. Record a plan before the next push to capture added and removed URLs.");
    } else if (candidateRelease.source_dirty !== false) {
      console.log("No plan recorded: app/dist was built from uncommitted source. Commit and rebuild the exact candidate first.");
    } else if (!candidateTree) {
      console.log("No plan recorded: Git cannot resolve the candidate commit here. Run the plan in the checkout that built app/dist.");
    } else {
      const plan = createReleasePlan({ candidateRelease, liveRelease, previousUrls, candidateTree, liveTree });
      await mkdir(planRoot, { recursive: true });
      await writeFile(planPath(plan.candidate_revision), `${JSON.stringify(plan, null, 2)}\n`);
      console.log(`Recorded ${path.relative(repoRoot, planPath(plan.candidate_revision))}. After this revision is live, run npm run indexnow.`);
    }
    return;
  }

  if (alreadyLive && !sameCommit) {
    throw new Error(`Refusing IndexNow submission: production serves this source as commit ${liveRelease.revision}, not ${candidateRelease.revision}. Rebuild app/dist at that commit, then run npm run indexnow again.`);
  }
  if (!releaseMatchesCandidate(candidateRelease, liveRelease)) {
    throw new Error("Refusing IndexNow submission: app/dist release metadata does not match the ready, clean production release on littlefightnyc.com.");
  }
  if (!manifest.urls.length) {
    console.log("Nothing to submit: this release added, removed, or flagged no public URLs.");
    return;
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
