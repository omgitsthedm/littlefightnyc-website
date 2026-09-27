import assert from "node:assert/strict";
import {
  canonicalPublicUrl,
  changedUrlManifest,
  ownershipKeyMatches,
  releaseMatchesCandidate,
  sitemapUrls,
  submitIndexNow,
} from "./indexnow-lib.mjs";

const sitemap = `<?xml version="1.0"?><urlset><url><loc>https://littlefightnyc.com/</loc></url><url><loc>https://littlefightnyc.com/soho/</loc></url></urlset>`;
assert.deepEqual(sitemapUrls(sitemap), ["https://littlefightnyc.com/", "https://littlefightnyc.com/soho/"]);
assert.equal(canonicalPublicUrl("/soho/"), "https://littlefightnyc.com/soho/");
assert.throws(() => canonicalPublicUrl("https://example.com/soho/"), /Not a canonical/);
assert.throws(() => canonicalPublicUrl("/app/"), /Private or non-discovery/);
assert.throws(() => canonicalPublicUrl("/tech-audit/?utm_source=test"), /Not a canonical/);

const manifest = changedUrlManifest({
  previousUrls: ["https://littlefightnyc.com/", "https://littlefightnyc.com/old-page/"],
  candidateUrls: ["https://littlefightnyc.com/", "https://littlefightnyc.com/new-page/", "https://littlefightnyc.com/soho/"],
  changed: ["/soho/"],
});
assert.deepEqual(manifest.added, ["https://littlefightnyc.com/new-page/", "https://littlefightnyc.com/soho/"]);
assert.deepEqual(manifest.changed, ["https://littlefightnyc.com/soho/"]);
assert.deepEqual(manifest.removed, ["https://littlefightnyc.com/old-page/"]);
assert.deepEqual(manifest.urls, ["https://littlefightnyc.com/new-page/", "https://littlefightnyc.com/old-page/", "https://littlefightnyc.com/soho/"]);
assert.throws(
  () => changedUrlManifest({ previousUrls: ["https://littlefightnyc.com/"], candidateUrls: ["https://littlefightnyc.com/"], changed: ["/app/"] }),
  /Private or non-discovery/,
);

assert.equal(
  releaseMatchesCandidate(
    { revision: "1234567890abcdef", branch: "codex/lfnyc-growth-20260926", source_dirty: false },
    { revision: "1234567890abcdef", branch: "main", source_dirty: false },
  ),
  true,
);
assert.equal(ownershipKeyMatches("e843c203-fad3-442c-80a6-2b08d8aa916f\n", "e843c203-fad3-442c-80a6-2b08d8aa916f"), true);
assert.equal(ownershipKeyMatches("another-key", "e843c203-fad3-442c-80a6-2b08d8aa916f"), false);
assert.equal(
  releaseMatchesCandidate(
    { revision: "1234567890abcdef", branch: "main", source_dirty: false },
    { revision: "abcdef1234567890", branch: "main", source_dirty: false },
  ),
  false,
);

let request;
const accepted = await submitIndexNow({
  urls: ["https://littlefightnyc.com/soho/"],
  key: "e843c203-fad3-442c-80a6-2b08d8aa916f",
  keyLocation: "https://littlefightnyc.com/e843c203-fad3-442c-80a6-2b08d8aa916f.txt",
  fetchImpl: async (url, options) => {
    request = { url, options };
    return { status: 200 };
  },
});
assert.equal(accepted.status, 200);
assert.equal(accepted.state, "accepted");
assert.equal(request.url, "https://api.indexnow.org/IndexNow");
assert.deepEqual(JSON.parse(request.options.body).urlList, ["https://littlefightnyc.com/soho/"]);
const pendingKey = await submitIndexNow({
  urls: ["https://littlefightnyc.com/soho/"],
  key: "e843c203-fad3-442c-80a6-2b08d8aa916f",
  keyLocation: "https://littlefightnyc.com/e843c203-fad3-442c-80a6-2b08d8aa916f.txt",
  fetchImpl: async () => ({ status: 202 }),
});
assert.equal(pendingKey.state, "accepted_pending_key");
await assert.rejects(
  submitIndexNow({
    urls: ["https://littlefightnyc.com/soho/"],
    key: "e843c203-fad3-442c-80a6-2b08d8aa916f",
    keyLocation: "https://littlefightnyc.com/e843c203-fad3-442c-80a6-2b08d8aa916f.txt",
    fetchImpl: async () => ({ status: 403 }),
  }),
  /HTTP 403/,
);

console.log("IndexNow release helper validates bounded public manifests and HTTP receipt without live submission.");
