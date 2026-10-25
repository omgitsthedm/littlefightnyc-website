import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  canonicalPublicUrl,
  changedUrlManifest,
  createReleasePlan,
  gitTreeId,
  ownershipKeyMatches,
  previousUrlsFromPlan,
  releaseMatchesCandidate,
  selectReleasePlan,
  sitemapUrls,
  submitIndexNow,
} from "./indexnow-lib.mjs";

const sitemap = `<?xml version="1.0"?><urlset><url><loc>https://littlefightnyc.com/</loc></url><url><loc>https://littlefightnyc.com/soho/</loc></url></urlset>`;
assert.deepEqual(sitemapUrls(sitemap), ["https://littlefightnyc.com/", "https://littlefightnyc.com/soho/"]);
assert.deepEqual(
  sitemapUrls(sitemap.replace("</urlset>", "<url><loc>https://littlefightnyc.com/examples/audit/</loc></url></urlset>")),
  ["https://littlefightnyc.com/", "https://littlefightnyc.com/soho/"],
  "crawlable pages excluded from IndexNow are skipped, not fatal",
);
assert.throws(() => canonicalPublicUrl("/examples/audit/"), /Private or non-discovery/);
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

// The pre-push plan carries the outgoing URL set to the post-deploy submission,
// when the live sitemap already equals the candidate and can no longer show
// what was added or removed.
const outgoing = { revision: "aaaaaaaaaaaa1111", branch: "main", source_dirty: false };
const candidate = { revision: "bbbbbbbbbbbb2222", branch: "search/post-launch", source_dirty: false };
const candidateTree = "1".repeat(40);
const outgoingTree = "0".repeat(40);
const plan = createReleasePlan({
  candidateRelease: candidate,
  liveRelease: outgoing,
  previousUrls: ["https://littlefightnyc.com/old-page/", "https://littlefightnyc.com/", "/"],
  candidateTree,
  liveTree: outgoingTree,
  createdAt: "2026-10-24T00:00:00.000Z",
});
assert.deepEqual(plan, {
  schema: "lfnyc.indexnow-plan.v1",
  candidate_revision: "bbbbbbbbbbbb2222",
  candidate_tree: candidateTree,
  previous_revision: "aaaaaaaaaaaa1111",
  created_at: "2026-10-24T00:00:00.000Z",
  previous_urls: ["https://littlefightnyc.com/", "https://littlefightnyc.com/old-page/"],
});
assert.throws(
  () => createReleasePlan({ candidateRelease: { ...candidate, source_dirty: true }, liveRelease: outgoing, previousUrls: [] }),
  /clean, committed candidate/,
);
assert.throws(
  () => createReleasePlan({ candidateRelease: candidate, liveRelease: candidate, previousUrls: [], candidateTree }),
  /before pushing it/,
);
assert.throws(
  () => createReleasePlan({ candidateRelease: candidate, liveRelease: outgoing, previousUrls: [] }),
  /resolve the candidate's source tree/,
  "a plan without a tree could never match a merged or squashed commit",
);
assert.throws(
  () => createReleasePlan({ candidateRelease: candidate, liveRelease: outgoing, previousUrls: [], candidateTree, liveTree: candidateTree }),
  /under another commit/,
  "re-running the plan after a squash merge must not overwrite the pre-push baseline",
);
const postDeploy = changedUrlManifest({
  previousUrls: previousUrlsFromPlan(JSON.parse(JSON.stringify(plan)), candidate.revision),
  candidateUrls: ["https://littlefightnyc.com/", "https://littlefightnyc.com/new-page/"],
});
assert.deepEqual(postDeploy.urls, ["https://littlefightnyc.com/new-page/", "https://littlefightnyc.com/old-page/"]);
assert.equal(previousUrlsFromPlan(plan, "cccccccccccc3333"), null, "a plan never applies to another revision");
assert.equal(previousUrlsFromPlan({ ...plan, schema: "other" }, candidate.revision), null);
assert.equal(previousUrlsFromPlan(null, candidate.revision), null);

// A GitHub squash or merge deploys commit "dddd…", not the planned "bbbb…",
// with the same source tree. The plan still applies by tree, and only by tree.
const squashed = "dddddddddddd4444";
assert.deepEqual(
  previousUrlsFromPlan(plan, squashed, candidateTree),
  ["https://littlefightnyc.com/", "https://littlefightnyc.com/old-page/"],
);
assert.equal(previousUrlsFromPlan(plan, squashed, "2".repeat(40)), null, "different source never matches");
assert.equal(previousUrlsFromPlan(plan, squashed), null, "an unknown tree never matches");
assert.equal(previousUrlsFromPlan({ ...plan, candidate_tree: undefined }, squashed, candidateTree), null);
assert.equal(previousUrlsFromPlan({ ...plan, candidate_tree: "main" }, squashed, "main"), null, "only real tree IDs match");

const olderSameTree = { ...plan, candidate_revision: "eeeeeeeeeeee5555", created_at: "2026-10-20T00:00:00.000Z", previous_urls: ["https://littlefightnyc.com/"] };
const unrelated = { ...plan, candidate_revision: "ffffffffffff6666", candidate_tree: "3".repeat(40), created_at: "2026-10-25T00:00:00.000Z" };
const byTree = selectReleasePlan([olderSameTree, unrelated, plan], { revision: squashed, tree: candidateTree });
assert.equal(byTree.match, "tree");
assert.equal(byTree.plan.candidate_revision, "bbbbbbbbbbbb2222", "the newest plan for the tree wins");
assert.deepEqual(
  changedUrlManifest({ previousUrls: byTree.previousUrls, candidateUrls: ["https://littlefightnyc.com/", "https://littlefightnyc.com/new-page/"] }).urls,
  ["https://littlefightnyc.com/new-page/", "https://littlefightnyc.com/old-page/"],
  "a squash-merged release submits its planned additions and removals, not only --changed",
);
const byCommit = selectReleasePlan([plan, olderSameTree], { revision: "eeeeeeeeeeee5555", tree: candidateTree });
assert.equal(byCommit.match, "commit");
assert.equal(byCommit.plan.candidate_revision, "eeeeeeeeeeee5555", "an exact commit plan beats a newer tree match");
assert.equal(selectReleasePlan([plan, unrelated], { revision: squashed, tree: "4".repeat(40) }), null);
assert.equal(selectReleasePlan([], { revision: squashed, tree: candidateTree }), null);

// Real Git: a squash merge mints a new commit whose tree equals the candidate's.
const repo = mkdtempSync(path.join(tmpdir(), "lfnyc-indexnow-"));
try {
  const git = (...args) => execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", ...args], { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  git("init", "--quiet", "--initial-branch=main");
  writeFileSync(path.join(repo, "page.txt"), "outgoing\n");
  git("add", "page.txt");
  git("commit", "--quiet", "-m", "outgoing release");
  git("switch", "--quiet", "-c", "candidate");
  writeFileSync(path.join(repo, "page.txt"), "candidate\n");
  git("commit", "--quiet", "-am", "candidate");
  const planned = git("rev-parse", "HEAD");
  git("switch", "--quiet", "main");
  git("merge", "--quiet", "--squash", "candidate");
  git("commit", "--quiet", "-m", "Squash merge (#1)");
  const deployed = git("rev-parse", "HEAD");
  assert.notEqual(deployed, planned);
  assert.ok(gitTreeId(planned, repo));
  assert.equal(gitTreeId(deployed, repo), gitTreeId(planned, repo), "squash merge keeps the planned tree");
  assert.notEqual(gitTreeId(git("rev-parse", "HEAD~1"), repo), gitTreeId(planned, repo));
  assert.equal(gitTreeId("--output=/tmp/x", repo), null, "only hex revisions reach Git");
  assert.equal(gitTreeId("abcdefabcdef0000", repo), null, "a commit missing from the clone has no tree");
} finally {
  rmSync(repo, { recursive: true, force: true });
}
assert.throws(
  () => previousUrlsFromPlan({ ...plan, previous_urls: ["https://littlefightnyc.com/app/"] }, candidate.revision),
  /Private or non-discovery/,
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
assert.ok(request.options.signal instanceof AbortSignal, "the IndexNow request must time out");
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

await assert.rejects(
  submitIndexNow({
    urls: ["https://littlefightnyc.com/soho/"],
    key: "e843c203-fad3-442c-80a6-2b08d8aa916f",
    keyLocation: "https://littlefightnyc.com/e843c203-fad3-442c-80a6-2b08d8aa916f.txt",
    fetchImpl: async () => { throw Object.assign(new Error("timed out"), { name: "TimeoutError" }); },
  }),
  /failed before a response was received \(TimeoutError\)/,
);

console.log("IndexNow release helper validates bounded public manifests and HTTP receipt without live submission.");
