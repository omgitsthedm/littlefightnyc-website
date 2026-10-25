import { execFileSync } from "node:child_process";

const PRODUCTION_ORIGIN = "https://littlefightnyc.com";
const PRIVATE_PATHS = new Set(["/app", "/dakota.html"]);
const PRIVATE_PREFIXES = ["/app/", "/api/", "/dakota/", "/_", "/examples/audit/"];

function asOrigin(origin) {
  const parsed = new URL(origin);
  if (parsed.origin !== PRODUCTION_ORIGIN || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(`IndexNow only supports the production origin ${PRODUCTION_ORIGIN}.`);
  }
  return parsed;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isPrivatePath(pathname) {
  return PRIVATE_PATHS.has(pathname) || PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function canonicalPublicUrl(value, origin = PRODUCTION_ORIGIN) {
  const base = asOrigin(origin);
  const url = new URL(value, base);
  if (url.origin !== base.origin || url.protocol !== "https:" || url.search || url.hash || url.username || url.password) {
    throw new Error(`Not a canonical Little Fight public URL: ${value}`);
  }

  const pathname = url.pathname;
  if (isPrivatePath(pathname)) {
    throw new Error(`Private or non-discovery URL cannot be submitted to IndexNow: ${pathname}`);
  }
  if (pathname.endsWith(".json") || pathname.endsWith(".xml") || pathname.endsWith(".txt")) {
    throw new Error(`Discovery artifact cannot be submitted to IndexNow: ${pathname}`);
  }
  return `${base.origin}${pathname}`;
}

export function sitemapUrls(xml, origin = PRODUCTION_ORIGIN) {
  if (typeof xml !== "string") throw new TypeError("Sitemap content must be text.");
  const matches = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
  if (!matches.length) throw new Error("Sitemap has no <loc> URLs.");
  // A crawlable page can still be excluded from IndexNow pushes (the sample
  // audit site). Skip those here; explicit --changed/--removed stay strict.
  const locations = matches.map((match) => decodeXml(match[1]));
  const discoverable = locations.filter((value) => !isPrivatePath(new URL(value, asOrigin(origin)).pathname));
  return [...new Set(discoverable.map((value) => canonicalPublicUrl(value, origin)))].sort();
}

export function changedUrlManifest({ previousUrls, candidateUrls, changed = [], removed = [], origin = PRODUCTION_ORIGIN }) {
  const previous = new Set(previousUrls.map((url) => canonicalPublicUrl(url, origin)));
  const candidate = new Set(candidateUrls.map((url) => canonicalPublicUrl(url, origin)));
  const changedUrls = new Set(changed.map((url) => canonicalPublicUrl(url, origin)));
  const removedUrls = new Set(removed.map((url) => canonicalPublicUrl(url, origin)));

  for (const url of changedUrls) {
    if (!candidate.has(url)) throw new Error(`Changed URL is not in the candidate public sitemap: ${url}`);
  }
  for (const url of removedUrls) {
    if (!previous.has(url)) throw new Error(`Removed URL is not in the previous public sitemap: ${url}`);
  }

  const added = [...candidate].filter((url) => !previous.has(url));
  const inferredRemoved = [...previous].filter((url) => !candidate.has(url));
  const urls = [...new Set([...added, ...changedUrls, ...inferredRemoved, ...removedUrls])].sort();

  return {
    added: added.sort(),
    changed: [...changedUrls].sort(),
    removed: [...new Set([...inferredRemoved, ...removedUrls])].sort(),
    urls,
  };
}

// A post-deploy run cannot see what the release added or removed: by then the
// live sitemap already is the candidate sitemap. The dry run records the
// outgoing production URL set (keyed to the candidate revision) before the
// push, and the submission compares against that record.
//
// A GitHub merge, squash, or rebase gives main a new commit ID for the same
// source, so the plan also records the candidate's Git tree ID, which names
// the source itself. A plan applies to the deployed commit when either its
// commit or its tree matches.
export const RELEASE_PLAN_SCHEMA = "lfnyc.indexnow-plan.v1";
const GIT_OBJECT_ID = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;

function isTreeId(value) {
  return typeof value === "string" && GIT_OBJECT_ID.test(value);
}

// The live revision comes from the public /release.json, so only a plain hex
// commit ID reaches Git. A commit that is not in this clone has no known tree.
export function gitTreeId(revision, cwd) {
  if (typeof revision !== "string" || !/^[0-9a-f]{12,64}$/i.test(revision)) return null;
  try {
    const tree = execFileSync("git", ["rev-parse", "--verify", "--quiet", `${revision}^{tree}`], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return isTreeId(tree) ? tree : null;
  } catch {
    return null;
  }
}

export function createReleasePlan({ candidateRelease, liveRelease, previousUrls, candidateTree, liveTree = null, createdAt = new Date().toISOString() }) {
  const revision = candidateRelease?.revision;
  if (typeof revision !== "string" || revision.length < 12 || candidateRelease.source_dirty !== false) {
    throw new Error("Record an IndexNow plan only from a clean, committed candidate build.");
  }
  if (revision === liveRelease?.revision) {
    throw new Error("Production already serves this candidate; record the IndexNow plan before pushing it.");
  }
  if (!isTreeId(candidateTree)) {
    throw new Error("Record an IndexNow plan only where Git can resolve the candidate's source tree.");
  }
  if (candidateTree === liveTree) {
    throw new Error("Production already serves this candidate's source under another commit; record the IndexNow plan before pushing it.");
  }
  return {
    schema: RELEASE_PLAN_SCHEMA,
    candidate_revision: revision,
    candidate_tree: candidateTree,
    previous_revision: typeof liveRelease?.revision === "string" ? liveRelease.revision : null,
    created_at: createdAt,
    previous_urls: [...new Set(previousUrls.map((url) => canonicalPublicUrl(url)))].sort(),
  };
}

export function previousUrlsFromPlan(plan, candidateRevision, candidateTree = null) {
  if (!plan || plan.schema !== RELEASE_PLAN_SCHEMA || !Array.isArray(plan.previous_urls)) return null;
  const revisionMatches = typeof candidateRevision === "string" && plan.candidate_revision === candidateRevision;
  const treeMatches = isTreeId(candidateTree) && plan.candidate_tree === candidateTree;
  if (!revisionMatches && !treeMatches) return null;
  return plan.previous_urls.map((url) => canonicalPublicUrl(url));
}

// An exact commit match wins. Otherwise the newest plan for the same tree was
// recorded against the most recent outgoing production release.
export function selectReleasePlan(plans, { revision, tree = null }) {
  const matching = plans
    .map((plan) => ({ plan, previousUrls: previousUrlsFromPlan(plan, revision, tree) }))
    .filter((entry) => entry.previousUrls);
  if (!matching.length) return null;
  const exact = matching.filter((entry) => entry.plan.candidate_revision === revision);
  const pool = exact.length ? exact : matching;
  const [chosen] = pool.toSorted((a, b) => String(b.plan.created_at).localeCompare(String(a.plan.created_at)));
  return { ...chosen, match: exact.length ? "commit" : "tree" };
}

export function releaseMatchesCandidate(candidateRelease, liveRelease) {
  if (!candidateRelease || !liveRelease) return false;
  return (
    typeof candidateRelease.revision === "string" &&
    candidateRelease.revision.length >= 12 &&
    candidateRelease.revision === liveRelease.revision &&
    candidateRelease.source_dirty === false &&
    liveRelease.branch === "main" &&
    liveRelease.source_dirty === false
  );
}

export function ownershipKeyMatches(body, key) {
  return typeof body === "string" && body.trim() === key;
}

export async function submitIndexNow({ urls, key, keyLocation, fetchImpl = fetch }) {
  if (!Array.isArray(urls) || !urls.length) throw new Error("IndexNow needs at least one changed public URL.");
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) throw new Error("IndexNow key must be 8–128 letters, numbers, or dashes.");
  const safeUrls = urls.map((url) => canonicalPublicUrl(url));
  const keyUrl = new URL(keyLocation);
  if (keyUrl.origin !== PRODUCTION_ORIGIN || keyUrl.search || keyUrl.hash || keyUrl.pathname !== `/${key}.txt`) {
    throw new Error("IndexNow key location must match the public ownership key.");
  }
  const safeKeyLocation = keyUrl.href;

  let response;
  try {
    response = await fetchImpl("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({ host: "littlefightnyc.com", key, keyLocation: safeKeyLocation, urlList: safeUrls }),
    });
  } catch (error) {
    throw new Error(`IndexNow request failed before a response was received (${error?.name ?? "error"}). Nothing is known to be submitted.`);
  }
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow rejected the manifest with HTTP ${response.status}. No indexing result is implied by a successful submission.`);
  }
  return {
    submitted: safeUrls,
    status: response.status,
    state: response.status === 202 ? "accepted_pending_key" : "accepted",
  };
}

export { PRODUCTION_ORIGIN };
