import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const redirects = await readFile(path.join(appRoot, "public", "_redirects"), "utf8");
const rules = redirects
  .split(/\r?\n/)
  .map((line) => line.replace(/\s+#.*$/, "").trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/\s+/));

for (const source of ["/areas/brooklyn", "/areas/brooklyn/"]) {
  const rule = rules.find(([from]) => from === source);
  assert.deepEqual(rule, [source, "/areas/", "301"]);
  assert.ok(
    rules.indexOf(rule) < rules.findIndex(([from, destination, status]) =>
      from === "/*" && destination === "/404.html" && status === "404",
    ),
    `${source} must remain ahead of the 404 catch-all`,
  );
}

const blogWildcardIndex = rules.findIndex(([from]) => from === "/blog/*");
assert.deepEqual(rules[blogWildcardIndex], ["/blog/*", "/library/", "301"]);
for (const source of ["/blog", "/blog/"]) {
  const rule = rules.find(([from]) => from === source);
  assert.deepEqual(rule, [source, "/library/", "301"]);
  assert.ok(rules.indexOf(rule) < blogWildcardIndex, `${source} must precede the legacy blog wildcard`);
}

const blogArticleRedirects = [
  ["/blog/cybersecurity-for-small-business", "/journal/cybersecurity-for-small-business/", "301"],
  ["/blog/cybersecurity-for-small-business.html", "/journal/cybersecurity-for-small-business/", "301"],
  ["/blog/nyc-small-business-digital", "/journal/nyc-small-business-digital/", "301"],
  ["/blog/nyc-small-business-digital.html", "/journal/nyc-small-business-digital/", "301"],
  ["/blog/protecting-kids-from-ai", "/journal/protecting-kids-from-ai/", "301"],
  ["/blog/protecting-kids-from-ai.html", "/journal/protecting-kids-from-ai/", "301"],
];
for (const expected of blogArticleRedirects) {
  const rule = rules.find(([from]) => from === expected[0]);
  assert.deepEqual(rule, expected);
  assert.ok(rules.indexOf(rule) < blogWildcardIndex, `${expected[0]} must retain its article redirect`);
}

for (const source of ["/app", "/app/*", "/dakota.html", "/studio/dakota", "/studio/dakota/"]) {
  const rule = rules.find(([from]) => from === source);
  assert.deepEqual(rule, [source, "/product-retired.html", "410!"]);
  assert.ok(
    rules.indexOf(rule) < rules.findIndex(([from, destination, status]) =>
      from === "/*" && destination === "/404.html" && status === "404",
    ),
    `${source} must remain ahead of the 404 catch-all`,
  );
}

for (const host of ["https://dakota.littlefightnyc.com/*", "https://www.dakota.littlefightnyc.com/*"]) {
  const rule = rules.find(([from]) => from === host);
  assert.deepEqual(rule, [host, "/.netlify/functions/retired-host", "200!"]);
}

console.log("Brooklyn area URLs and the legacy blog hub redirect to their surviving hubs; retired product paths return a forced 410 and retired hosts rewrite to their 410 function.");
