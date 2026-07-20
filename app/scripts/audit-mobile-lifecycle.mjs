import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registerSource = await readFile(new URL("../public/register-sw.js", import.meta.url), "utf8");
const workerSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const boundarySource = await readFile(new URL("../src/components/ErrorBoundary.tsx", import.meta.url), "utf8");
const noticeSource = await readFile(new URL("../src/components/SiteNotices.tsx", import.meta.url), "utf8");

for (const [label, source, forbidden] of [
  ["service-worker registration", registerSource, ["controllerchange", "visibilitychange", "location.reload", "postMessage", "lf:sw-update-ready"]],
  ["service worker", workerSource, ["clients.claim", "skipWaiting", "ACTIVATE_UPDATE"]],
  ["site notices", noticeSource, ["Site update ready", "Refresh now", "lf:sw-update-ready"]],
]) {
  for (const token of forbidden) {
    assert.equal(
      source.includes(token),
      false,
      `${label} must not force mobile tabs to update or reload via ${token}`,
    );
  }
}

assert.match(registerSource, /\.register\("\/sw\.js"\)/, "service worker must remain registered");
assert.match(
  noticeSource,
  /const \[visible, setVisible\] = useState\(false\)/,
  "analytics preferences must stay closed until the visitor opens them from the footer",
);
assert.doesNotMatch(
  noticeSource,
  /getAnalyticsConsent\(\) === null/,
  "a first visit must not trigger an analytics overlay",
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

console.log("mobile lifecycle ratchet OK — updates wait for tab close; no public prompt or forced reload remains.");
