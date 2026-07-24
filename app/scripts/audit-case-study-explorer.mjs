/**
 * Post-build contract for every public case-study explorer.
 *
 * The explorer's capture paths are assembled at runtime, so the general HTML
 * integrity audit cannot see them. This gate reads the canonical case data,
 * checks both capture variants, and proves the component-owned CSS and runtime
 * code made it into the production build.
 */

import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuildBundle } from "esbuild";
import postcss from "postcss";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicAssetsRoot = path.join(appRoot, "public", "assets");
const distRoot = path.join(appRoot, "dist");
const distAssetsRoot = path.join(distRoot, "assets");
const explorerSourcePath = path.join(
  appRoot,
  "src",
  "components",
  "editorial",
  "LiveSiteExplorer.tsx",
);
const explorerCssPath = path.join(
  appRoot,
  "src",
  "components",
  "editorial",
  "LiveSiteExplorer.css",
);
const caseDetailPath = path.join(appRoot, "src", "pages", "CaseStudyDetail.tsx");
const failures = [];

function fail(message) {
  failures.push(message);
}

async function exists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function sha256(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

function webpDimensions(buffer) {
  if (
    buffer.length < 30 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    throw new Error("not a RIFF/WebP file");
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + size > buffer.length) throw new Error(`truncated ${type} chunk`);

    if (type === "VP8X" && size >= 10) {
      return {
        width: 1 + buffer.readUIntLE(data + 4, 3),
        height: 1 + buffer.readUIntLE(data + 7, 3),
      };
    }

    if (type === "VP8L" && size >= 5 && buffer[data] === 0x2f) {
      const b1 = buffer[data + 1];
      const b2 = buffer[data + 2];
      const b3 = buffer[data + 3];
      const b4 = buffer[data + 4];
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + ((b2 & 0xc0) >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
      };
    }

    if (type === "VP8 " && size >= 10) {
      for (let index = data; index <= data + size - 7; index += 1) {
        if (
          buffer[index] === 0x9d &&
          buffer[index + 1] === 0x01 &&
          buffer[index + 2] === 0x2a
        ) {
          return {
            width: buffer.readUInt16LE(index + 3) & 0x3fff,
            height: buffer.readUInt16LE(index + 5) & 0x3fff,
          };
        }
      }
    }

    offset = data + size + (size % 2);
  }

  throw new Error("WebP dimensions were not found");
}

function rulesFor(root, selector) {
  const rules = [];
  root.walkRules((rule) => {
    if (rule.selectors?.includes(selector)) rules.push(rule);
  });
  return rules;
}

function valuesFor(root, selector, property) {
  const values = [];
  for (const rule of rulesFor(root, selector)) {
    rule.walkDecls(property, (declaration) => values.push(declaration.value));
  }
  return values;
}

function hasValue(root, selector, property, predicate) {
  return valuesFor(root, selector, property).some(predicate);
}

function requireCss(root, label, selector, property, predicate, expectation) {
  if (!hasValue(root, selector, property, predicate)) {
    fail(`${label}: ${selector} must set ${property} to ${expectation}`);
  }
}

function assertCssContract(root, label) {
  const exact = (expected) => (value) => value.replaceAll(" ", "") === expected;
  const includes = (expected) => (value) => value.includes(expected);

  requireCss(root, label, ".lf-live-explorer", "min-width", exact("0"), "0");
  requireCss(
    root,
    label,
    ".lf-live-explorer__toolbar",
    "display",
    exact("grid"),
    "grid",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__devices",
    "display",
    exact("inline-grid"),
    "inline-grid",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__devices button",
    "min-height",
    exact("44px"),
    "44px",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport",
    "position",
    exact("relative"),
    "relative",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport",
    "height",
    (value) => value.includes("clamp(") && value.includes("660px"),
    "a bounded clamp ending at 660px",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport",
    "overflow",
    (value) => /^(?:auto|scroll)$/.test(value),
    "auto or scroll",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport img",
    "display",
    exact("block"),
    "block",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport img",
    "width",
    exact("100%"),
    "100%",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport img",
    "height",
    exact("auto"),
    "auto",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport--mobile img",
    "width",
    (value) => value.replaceAll(" ", "").includes("min(100%,390px)"),
    "a 390px maximum",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__devices",
    "grid-column",
    (value) => value.replaceAll(" ", "") === "1/-1",
    "the full narrow toolbar row",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__viewport",
    "height",
    includes("580px"),
    "a narrow-screen clamp ending at 580px",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__loading",
    "position",
    exact("absolute"),
    "absolute",
  );
  requireCss(
    root,
    label,
    ".lf-live-explorer__loading",
    "display",
    exact("grid"),
    "grid",
  );
}

const bundle = await esbuildBundle({
  entryPoints: [path.join(appRoot, "src", "data", "site-cases.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  logLevel: "silent",
});
const caseModule = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);
const publicCases = caseModule.caseStudies.filter(
  (study) => study.showcase?.availability === "public" && Boolean(study.url),
);

if (publicCases.length === 0) {
  fail("canonical case data contains no public case-study explorers");
}

for (const study of publicCases) {
  const captureDate = study.showcase?.proof?.captureDate;
  if (
    typeof captureDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(captureDate) ||
    Number.isNaN(Date.parse(`${captureDate}T00:00:00Z`))
  ) {
    fail(`${study.slug}: public case is missing a valid ISO captureDate`);
  }
  if (!["public-live", "owned-live"].includes(study.showcase?.proof?.status)) {
    fail(`${study.slug}: public case has an incompatible proof status`);
  }

  const routePath = path.join(
    distRoot,
    "case-studies",
    study.slug,
    "index.html",
  );
  if (!(await exists(routePath))) {
    fail(`${study.slug}: generated case-study route is missing`);
  }

  const captures = [
    {
      device: "desktop",
      filename: `case-${study.slug}-explore.webp`,
      width: 1200,
      minimumHeight: 1000,
      maximumHeight: 2400,
      minimumBytes: 50_000,
    },
    {
      device: "mobile",
      filename: `case-${study.slug}-explore-mobile.webp`,
      width: 390,
      minimumHeight: 1200,
      maximumHeight: 3000,
      minimumBytes: 40_000,
    },
  ];
  const deviceHashes = [];

  for (const capture of captures) {
    const sourcePath = path.join(publicAssetsRoot, capture.filename);
    const builtPath = path.join(distAssetsRoot, capture.filename);
    if (!(await exists(sourcePath))) {
      fail(`${study.slug}: source ${capture.device} capture is missing`);
      continue;
    }
    if (!(await exists(builtPath))) {
      fail(`${study.slug}: built ${capture.device} capture is missing`);
      continue;
    }

    const sourceStat = await stat(sourcePath);
    if (sourceStat.size < capture.minimumBytes) {
      fail(
        `${study.slug}: ${capture.device} capture is unexpectedly small (${sourceStat.size} bytes)`,
      );
    }

    try {
      const dimensions = webpDimensions(await readFile(sourcePath));
      if (
        dimensions.width !== capture.width ||
        dimensions.height < capture.minimumHeight ||
        dimensions.height > capture.maximumHeight
      ) {
        fail(
          `${study.slug}: ${capture.device} capture is ${dimensions.width}x${dimensions.height}; expected ${capture.width}px wide and ${capture.minimumHeight}-${capture.maximumHeight}px tall`,
        );
      }
    } catch (error) {
      fail(`${study.slug}: ${capture.device} capture is invalid (${error.message})`);
    }

    const sourceHash = await sha256(sourcePath);
    const builtHash = await sha256(builtPath);
    deviceHashes.push(sourceHash);
    if (sourceHash !== builtHash) {
      fail(`${study.slug}: built ${capture.device} capture differs from source`);
    }
  }

  if (deviceHashes.length === 2 && deviceHashes[0] === deviceHashes[1]) {
    fail(`${study.slug}: desktop and mobile captures are identical`);
  }
}

const [explorerSource, explorerCss, caseDetailSource] = await Promise.all([
  readFile(explorerSourcePath, "utf8"),
  readFile(explorerCssPath, "utf8"),
  readFile(caseDetailPath, "utf8"),
]);

if (!/import\s+["']\.\/LiveSiteExplorer\.css["']/.test(explorerSource)) {
  fail("LiveSiteExplorer.tsx must import its component-owned stylesheet");
}
if (/WorkShowcase\.css/.test(explorerSource)) {
  fail("LiveSiteExplorer.tsx must not depend on WorkShowcase.css");
}
if (!/\bdata-live-site-explorer\b/.test(explorerSource)) {
  fail("LiveSiteExplorer.tsx is missing its stable explorer marker");
}
if (!/<LiveSiteExplorer\b/.test(caseDetailSource)) {
  fail("CaseStudyDetail.tsx no longer renders LiveSiteExplorer");
}
if (
  !/onError=/.test(explorerSource) ||
  !/role="alert"/.test(explorerSource) ||
  !/aria-busy=/.test(explorerSource) ||
  !/aria-pressed=/.test(explorerSource)
) {
  fail("LiveSiteExplorer.tsx is missing loading, failure, or control semantics");
}

assertCssContract(postcss.parse(explorerCss), "source explorer CSS");

const builtAssetNames = await readdir(distAssetsRoot);
const builtCssNames = builtAssetNames.filter((name) => name.endsWith(".css"));
const builtJsNames = builtAssetNames.filter((name) => name.endsWith(".js"));
const builtCss = (
  await Promise.all(
    builtCssNames.map((name) => readFile(path.join(distAssetsRoot, name), "utf8")),
  )
).join("\n");
const builtJs = (
  await Promise.all(
    builtJsNames.map((name) => readFile(path.join(distAssetsRoot, name), "utf8")),
  )
).join("\n");

assertCssContract(postcss.parse(builtCss), "built explorer CSS");
if (
  !builtJs.includes("data-live-site-explorer") ||
  !builtJs.includes("/assets/case-") ||
  !builtJs.includes("-explore") ||
  !builtJs.includes("-mobile")
) {
  fail("built JavaScript is missing the connected case-study explorer");
}

if (failures.length > 0) {
  console.error(`Case-study explorer audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Case-study explorer: ${publicCases.length} public cases, ${publicCases.length * 2} captures, component CSS, routes, and built runtime passed.`,
);
