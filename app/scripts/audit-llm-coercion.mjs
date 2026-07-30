/**
 * audit-llm-coercion — every field of the model's JSON must be coerced before
 * it reaches report HTML.
 *
 * The audit pipeline asks a language model for JSON and renders it into a
 * document served from the apex origin and emailed to prospects. Anyone can
 * submit a hostile page to the public form and influence what the model
 * returns, so that JSON is untrusted input.
 *
 * coerceHaikuResult() sanitises it, but it does so with a `...src` spread
 * followed by per-field overrides, and closes with `as unknown as HaikuResult`.
 * That shape fails open: a field nobody overrides passes through raw, and the
 * double cast stops the compiler from ever mentioning it. revenueImpact.low
 * shipped that way — a string reached formatCurrency, whose `n: number`
 * annotation is unenforced at runtime because String.prototype.toLocaleString
 * returns the string verbatim. Stored XSS.
 *
 * So this gate does not check for that one field. It checks the invariant:
 * every property declared on HaikuResult is explicitly named in the return, and
 * the currency sink still guards its own input.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const failures = [];

const background = await readFile(
  path.join(repoRoot, "netlify", "functions", "run-audit-background.mts"),
  "utf8",
);
const templates = await readFile(
  path.join(repoRoot, "netlify", "functions", "lib", "templates.mts"),
  "utf8",
);

// ── 1. Every HaikuResult field is explicitly coerced ──────────────────────────
const iface = background.match(/interface HaikuResult \{([\s\S]*?)\n\}/)?.[1];
if (!iface) {
  failures.push("run-audit-background.mts: cannot find the HaikuResult interface");
} else {
  const declared = [...iface.matchAll(/^\s*(\w+)\s*[?:]/gm)].map((m) => m[1]);
  if (declared.length < 5) {
    failures.push(
      `HaikuResult parsed as only ${declared.length} fields — the regex has drifted from the source`,
    );
  }

  const body = background.match(
    /function coerceHaikuResult\(raw: unknown\): HaikuResult \{([\s\S]*?)\n\}/,
  )?.[1];
  if (!body) {
    failures.push("run-audit-background.mts: cannot find coerceHaikuResult");
  } else {
    const returned = body.slice(body.lastIndexOf("return {"));
    for (const field of declared) {
      // Either overridden in the return, or bound to a coerced local above it.
      const named = new RegExp(`(^|[\\s{,])${field}\\s*[,:]`, "m").test(returned);
      if (!named) {
        failures.push(
          `coerceHaikuResult does not explicitly coerce "${field}" — it rides the ...src ` +
            `spread straight from the model into the report`,
        );
      }
    }
  }
}

// ── 2. The currency sink guards its own input ─────────────────────────────────
const currency = templates.match(/function formatCurrency\([\s\S]*?\n\}/)?.[0];
if (!currency) {
  failures.push("templates.mts: cannot find formatCurrency");
} else if (!/Number\(/.test(currency) || !/isFinite/.test(currency)) {
  failures.push(
    "templates.mts: formatCurrency no longer coerces its argument. Its `n: number` " +
      "annotation is not enforced at runtime — a string would render verbatim into report HTML",
  );
}

// ── 3. Report HTML interpolates model prose only through the escaper ──────────
const unescaped = [...templates.matchAll(/\$\{data\.(\w+(?:\.\w+)*)\}/g)]
  .map((m) => m[1])
  .filter((expr) => /explanation|summary|title|description|name|text|niche|city|state/i.test(expr));
for (const expr of new Set(unescaped)) {
  failures.push(
    `templates.mts: \${data.${expr}} is interpolated without esc() — model prose must be escaped`,
  );
}

// ── 4. Every blob store is purged by something ────────────────────────────────
// Two stores accumulated forever because nothing listed them: rate-limits held
// a per-visitor record for a check that stopped mattering after 24h, and
// audit-engagement kept a reading profile of each recipient after the report
// itself was deleted and its URL started returning 410. Neither failed
// anything. A store nobody purges is invisible until it is a disclosure.
const fnDir = path.join(repoRoot, "netlify", "functions");
const fnFiles = (await readdir(fnDir, { withFileTypes: true }))
  .filter((e) => e.isFile() && e.name.endsWith(".mts"))
  .map((e) => path.join(fnDir, e.name));

const written = new Set();
for (const file of fnFiles) {
  const source = await readFile(file, "utf8");
  for (const m of source.matchAll(/getStore\(\s*(?:\{\s*name:\s*)?"([a-z-]+)"/g)) {
    written.add(m[1]);
  }
}

const cleanup = await readFile(path.join(fnDir, "cleanup-expired.mts"), "utf8");
for (const store of [...written].sort()) {
  if (!cleanup.includes(`"${store}"`)) {
    failures.push(
      `netlify/functions/cleanup-expired.mts never purges the "${store}" blob store — ` +
        `data written there is retained indefinitely`,
    );
  }
}

// ── 5. No function answers every origin ───────────────────────────────────────
// record-engagement returned Access-Control-Allow-Origin: * on an endpoint that
// writes a permanently-retained blob at a caller-chosen key, with no auth and
// no rate limit. Its only real caller is the report page, same-origin, so the
// wildcard bought nothing and let any page on the internet write to the store.
for (const file of fnFiles) {
  const source = await readFile(file, "utf8");
  if (/"Access-Control-Allow-Origin":\s*"\*"/.test(source)) {
    failures.push(
      `${path.relative(repoRoot, file)}: returns Access-Control-Allow-Origin: * — ` +
        "echo the site origin instead, or say here why any origin may call this",
    );
  }
}

if (failures.length > 0) {
  console.error("LLM coercion audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Function-safety audit passed: HaikuResult fully coerced, currency sink guarded, model prose escaped, every blob store is purged, and no function answers every origin.",
);
