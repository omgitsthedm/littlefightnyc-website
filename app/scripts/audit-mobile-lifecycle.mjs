import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registerSource = await readFile(new URL("../public/register-sw.js", import.meta.url), "utf8");
const workerSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const boundarySource = await readFile(new URL("../src/components/ErrorBoundary.tsx", import.meta.url), "utf8");

for (const [label, source, forbidden] of [
  ["service-worker registration", registerSource, ["controllerchange", "visibilitychange", "location.reload", "SKIP_WAITING"]],
  ["service worker", workerSource, ["skipWaiting", "clients.claim", "SKIP_WAITING"]],
]) {
  for (const token of forbidden) {
    assert.equal(
      source.includes(token),
      false,
      `${label} must not force mobile tabs to update or reload via ${token}`,
    );
  }
}

assert.match(
  boundarySource,
  /Importing a module script failed/i,
  "ErrorBoundary must recognize WebKit's dynamic-import error",
);
assert.match(
  boundarySource,
  /storageAvailable &&/,
  "ErrorBoundary must require a durable reload guard before refreshing",
);

console.log("mobile lifecycle ratchet OK — updates wait, reloads stay guarded.");
