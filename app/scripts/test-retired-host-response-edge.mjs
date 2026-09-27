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

const response = await handleRetiredHost(
  new Request("https://dakota.littlefightnyc.com/any/path"),
  { next: async () => { throw new Error("retired-host edge response must end the request chain"); } },
);

assert.equal(response.status, 410);
assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive, nosnippet");
assert.equal(response.headers.get("Content-Security-Policy"), "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'");
assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
const body = await response.text();
assert.match(body, /permanently retired/);
assert.match(body, /noindex, nofollow, noarchive, nosnippet/);

const wwwResponse = await handleRetiredHost(
  new Request("https://www.dakota.littlefightnyc.com/any/path"),
  { next: async () => { throw new Error("www retired-host edge response must end the request chain"); } },
);
assert.equal(wwwResponse.status, 410);

const marketingResponse = new Response("marketing page", { status: 200 });
assert.strictEqual(
  await handleRetiredHost(
    new Request("https://littlefightnyc.com/"),
    { next: async () => marketingResponse },
  ),
  marketingResponse,
);

console.log("Retired-host edge response ends only the retired hosts with a 410 and passes marketing through.");
