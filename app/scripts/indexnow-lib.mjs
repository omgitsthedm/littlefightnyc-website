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

export function canonicalPublicUrl(value, origin = PRODUCTION_ORIGIN) {
  const base = asOrigin(origin);
  const url = new URL(value, base);
  if (url.origin !== base.origin || url.protocol !== "https:" || url.search || url.hash || url.username || url.password) {
    throw new Error(`Not a canonical Little Fight public URL: ${value}`);
  }

  const pathname = url.pathname;
  if (PRIVATE_PATHS.has(pathname) || PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
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
  return [...new Set(matches.map((match) => canonicalPublicUrl(decodeXml(match[1]), origin)))].sort();
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

  const response = await fetchImpl("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: "littlefightnyc.com", key, keyLocation: safeKeyLocation, urlList: safeUrls }),
  });
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
