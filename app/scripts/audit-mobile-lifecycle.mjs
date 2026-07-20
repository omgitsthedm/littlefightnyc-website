import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registerSource = await readFile(new URL("../public/register-sw.js", import.meta.url), "utf8");
const workerSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const boundarySource = await readFile(new URL("../src/components/ErrorBoundary.tsx", import.meta.url), "utf8");
const noticeSource = await readFile(new URL("../src/components/SiteNotices.tsx", import.meta.url), "utf8");

for (const [label, source, forbidden] of [
  ["service-worker registration", registerSource, ["controllerchange", "visibilitychange", "location.reload", "SKIP_WAITING"]],
  ["service worker", workerSource, ["clients.claim", "SKIP_WAITING"]],
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
  workerSource,
  /event\.data\?\.type === "ACTIVATE_UPDATE"[\s\S]*self\.skipWaiting\(\)/,
  "service-worker activation must stay behind the explicit ACTIVATE_UPDATE message",
);
assert.match(
  noticeSource,
  /onClick=\{activateUpdate\}/,
  "the update takeover must be initiated by a visible user action",
);
assert.doesNotMatch(
  registerSource,
  /postMessage\s*\(/,
  "registration must never activate an update automatically",
);

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

console.log("mobile lifecycle ratchet OK — updates wait for a user click; error reloads stay guarded.");
