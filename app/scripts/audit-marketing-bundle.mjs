import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = path.join(appRoot, "dist", "assets");
const files = await readdir(assetsRoot);
const marketingFiles = files.filter((file) => /^marketing-[\w-]+\.js$/u.test(file));

assert.equal(
  marketingFiles.length,
  1,
  `Expected one built marketing entry, found ${marketingFiles.length}. Run the production build first.`,
);

const marketingPath = path.join(assetsRoot, marketingFiles[0]);
const [info, source] = await Promise.all([
  stat(marketingPath),
  readFile(marketingPath),
]);
const gzipBytes = gzipSync(source, { level: 9 }).byteLength;

// The 2026-08-04 direct-import repair established 234.85 KB raw / 58.63 KB
// gzip. Keep a small maintenance margin while making an accidental return to
// the 258 KB barrel-import graph fail loudly.
const MAX_RAW_BYTES = 240_000;
const MAX_GZIP_BYTES = 61_000;

assert.ok(
  info.size <= MAX_RAW_BYTES,
  `Marketing entry is ${info.size} bytes; budget is ${MAX_RAW_BYTES}. Check eager imports before raising the budget.`,
);
assert.ok(
  gzipBytes <= MAX_GZIP_BYTES,
  `Marketing entry is ${gzipBytes} gzip bytes; budget is ${MAX_GZIP_BYTES}. Check eager imports before raising the budget.`,
);

console.log(
  `Marketing bundle audit passed: ${info.size} raw bytes / ${gzipBytes} gzip bytes.`,
);
