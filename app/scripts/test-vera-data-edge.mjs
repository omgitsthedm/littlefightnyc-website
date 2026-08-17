import assert from "node:assert/strict";

const edgeModule = await import(
  new URL("../../netlify/edge-functions/vera-data-robots.ts", import.meta.url)
);
const handleVeraData = edgeModule.default;
const CACHE_POLICY = "public, max-age=300, stale-while-revalidate=129600";

async function invoke(pathname, body, init = {}) {
  const nextCalls = [];
  const request = new Request(`https://littlefightnyc.com${pathname}`, {
    method: init.method ?? "GET",
  });
  const response = await handleVeraData(request, {
    next: async (...args) => {
      nextCalls.push(args);
      return new Response(body, {
        status: init.status ?? 200,
        headers: {
          "Content-Type": init.contentType ?? "application/json; charset=utf-8",
          ETag: '"vera-test"',
        },
      });
    },
  });
  return { nextCalls, response };
}

for (const [pathname, publication] of [
  ["/vera/data/public.json", { generated_at: "2026-08-17T00:00:00Z", pool: [], shortlist: [] }],
  ["/vera/data/archive.json", []],
  ["/vera/data/meta.json", { generated_at: "2026-08-17T00:00:00Z", pool: 0, shortlist: 0 }],
]) {
  const body = JSON.stringify(publication);
  const { nextCalls, response } = await invoke(pathname, body);
  assert.equal(nextCalls.length, 1);
  assert.equal(nextCalls[0].length, 0, "context.next must not forward conditional validators");
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(response.headers.get("Netlify-CDN-Cache-Control"), CACHE_POLICY);
  assert.equal(await response.text(), body, "edge validation must leave the response body usable");
}

for (const testCase of [
  ["schema-invalid public JSON", "/vera/data/public.json", "{}", {}],
  ["malformed public JSON", "/vera/data/public.json", "not JSON", {}],
  ["HTML masquerading as a publication", "/vera/data/public.json", "<h1>error</h1>", { contentType: "text/html" }],
  ["upstream failure", "/vera/data/public.json", '{"error":true}', { status: 503 }],
  ["bodyless HEAD", "/vera/data/public.json", null, { method: "HEAD" }],
]) {
  const [label, pathname, body, init] = testCase;
  const { response } = await invoke(pathname, body, init);
  assert.equal(
    response.headers.get("Netlify-CDN-Cache-Control"),
    "no-store",
    `${label} must never enter the shared edge cache`,
  );
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
}

assert.equal(edgeModule.config.cache, "manual");
assert.deepEqual(edgeModule.config.path, [
  "/vera/data/public.json",
  "/vera/data/archive.json",
  "/vera/data/meta.json",
]);

console.log("VERA data-edge checks passed: full-body delivery, schema validation, no-store failures, and crawler policy are covered.");
