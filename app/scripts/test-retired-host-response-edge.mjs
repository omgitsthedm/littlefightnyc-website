import assert from "node:assert/strict";

const edgeModule = await import(
  new URL("../../netlify/edge-functions/retired-host-response.ts", import.meta.url)
);
const handleRetiredHost = edgeModule.default;

assert.equal(edgeModule.config.path, "/*");
assert.equal(edgeModule.config.header.host, "^(?:www\\.)?dakota\\.littlefightnyc\\.com$");

const hostPattern = new RegExp(edgeModule.config.header.host);
assert.ok(hostPattern.test("dakota.littlefightnyc.com"));
assert.ok(hostPattern.test("www.dakota.littlefightnyc.com"));
assert.ok(!hostPattern.test("littlefightnyc.com"));
assert.ok(!hostPattern.test("www.littlefightnyc.com"));

const upstream = new Response("retired response", {
  status: 410,
  headers: {
    "Cache-Control": "public, max-age=31536000",
    "X-Robots-Tag": "index, follow",
  },
});
const response = await handleRetiredHost(
  new Request("https://dakota.littlefightnyc.com/any/path"),
  { next: async () => upstream },
);

assert.equal(response.status, 410);
assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive, nosnippet");
assert.equal(await response.text(), "retired response");

console.log("Retired-host edge response preserves the 410 body and applies no-store/noindex headers.");
