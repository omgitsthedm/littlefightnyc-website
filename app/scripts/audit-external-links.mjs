#!/usr/bin/env node
/**
 * Outbound links must still go somewhere.
 *
 * The MySpace demo linked twice to flipaswitchstudios.com, which returns 404 at
 * the domain — not a moved page, the whole site is gone. Nothing in the build
 * noticed, because a dead outbound link is invisible from inside the repo: the
 * href is well-formed, the markup is valid, and only a request finds out.
 *
 * This needs the network, so it is NOT in the fast tiers. It runs in
 * quality:maintenance, where being slow and occasionally wrong about a flaky
 * host is acceptable and being uninformed is not.
 *
 * 403 and 999 count as alive: Cloudflare and LinkedIn refuse robots, which says
 * nothing about whether a human can reach the page. Only connection failures
 * and 404/410 are treated as dead.
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const OWN = "littlefightnyc.com";
const TIMEOUT_MS = 12_000;
const DEAD = new Set([404, 410]);

async function htmlFiles(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

let files;
try {
  files = await htmlFiles(DIST);
} catch {
  console.log("PASS external-links — no dist/ yet, nothing to check.");
  process.exit(0);
}

// url -> the routes that link to it, so a failure names where to go and fix it.
const targets = new Map();
for (const file of files) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = m[1];
    if (url.includes(OWN)) continue;
    if (/fonts\.(googleapis|gstatic)\.com/.test(url)) continue;
    const route = `/${relative(DIST, file).replace(/index\.html$/, "")}`;
    if (!targets.has(url)) targets.set(url, new Set());
    targets.get(url).add(route);
  }
}

async function status(url) {
  const opts = {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      // A generic UA gets refused by more hosts than a browser one does, and a
      // refusal is indistinguishable from a dead page at this layer.
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
  };

  const get = async () => {
    try {
      return (await fetch(url, { ...opts, method: "GET" })).status;
    } catch {
      return 0;
    }
  };

  try {
    // HEAD first because it is cheap. But HEAD is only an optimisation, never
    // the verdict: support.google.com/business/ answers 404 to HEAD and 200 to
    // GET, and trusting HEAD reported 38 journal pages as linking somewhere
    // dead when the link was fine. Any HEAD result that looks like a failure
    // gets confirmed with a real GET before it is believed.
    const head = await fetch(url, { ...opts, method: "HEAD" });
    if (head.ok) return head.status;
    return await get();
  } catch {
    return await get();
  }
}

const entries = [...targets.entries()];
const results = await Promise.all(
  entries.map(async ([url, routes]) => ({ url, routes, code: await status(url) })),
);

const broken = results.filter((r) => r.code === 0 || DEAD.has(r.code));

if (broken.length) {
  console.error(`FAIL external-links — ${broken.length} dead outbound link(s):\n`);
  for (const b of broken) {
    console.error(`  ${b.code === 0 ? "unreachable" : b.code}  ${b.url}`);
    console.error(`    linked from: ${[...b.routes].join(", ")}`);
  }
  process.exit(1);
}

console.log(`PASS external-links — ${results.length} outbound links all reachable.`);
