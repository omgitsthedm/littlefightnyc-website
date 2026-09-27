import assert from "node:assert/strict";

const functionModule = await import(
  new URL("../../netlify/functions/retired-host.mts", import.meta.url)
);
const handleRetiredHost = functionModule.default;

const response = await handleRetiredHost(new Request("https://dakota.littlefightnyc.com/any/path"));

assert.equal(response.status, 410);
assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive, nosnippet");
assert.equal(response.headers.get("Content-Security-Policy"), "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'");
assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
const body = await response.text();
assert.match(body, /permanently retired/);
assert.match(body, /noindex, nofollow, noarchive, nosnippet/);

const headResponse = await handleRetiredHost(new Request("https://dakota.littlefightnyc.com/any/path", { method: "HEAD" }));
assert.equal(headResponse.status, 410);
assert.equal(headResponse.headers.get("Cache-Control"), response.headers.get("Cache-Control"));
assert.equal(headResponse.headers.get("X-Robots-Tag"), response.headers.get("X-Robots-Tag"));
assert.equal(headResponse.headers.get("Content-Security-Policy"), response.headers.get("Content-Security-Policy"));
assert.equal(await headResponse.text(), "");

console.log("Retired-host function returns the same retirement policy for GET and HEAD.");
