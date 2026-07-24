import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const brandRoot = path.join(appRoot, "public", "brand-kit");
const sceneRoot = path.join(appRoot, "public", "images", "brand-scenes");

const failures = [];
const fail = (message) => failures.push(message);

async function read(relativePath) {
  try {
    return await readFile(path.join(appRoot, relativePath), "utf8");
  } catch (error) {
    fail(`${relativePath}: ${error.code === "ENOENT" ? "missing" : error.message}`);
    return "";
  }
}

async function requireFile(absolutePath, label, minimumBytes = 1) {
  try {
    const info = await stat(absolutePath);
    if (!info.isFile() || info.size < minimumBytes) {
      fail(`${label}: expected a file of at least ${minimumBytes} bytes`);
    }
  } catch (error) {
    fail(`${label}: ${error.code === "ENOENT" ? "missing" : error.message}`);
  }
}

const tokenPath = path.join(brandRoot, "assets", "color", "tokens.json");
let tokens;
try {
  tokens = JSON.parse(await readFile(tokenPath, "utf8"));
} catch (error) {
  fail(`public/brand-kit/assets/color/tokens.json: ${error.message}`);
  tokens = {};
}

const canonicalColors = {
  background: ["--lf-ink", "#050507"],
  surface: ["--lf-paper", "#1A1C23"],
  surfaceRecessed: ["--lf-paper-2", "#12141A"],
  border: ["--lf-hairline", "#27272A"],
  textPrimary: ["--lf-bone", "#FFFFFF"],
  textSecondary: ["--lf-bone-soft", "#A1A1AA"],
  textTertiary: ["--lf-bone-dim", "#8A8A94"],
  signal: ["--lf-fight", "#F97316"],
  support: ["--lf-blue", "#3B82F6"],
};

const sourceTokens = await read("src/styles/editorial/tokens.css");
const downloadablePalette = await read("public/brand-kit/assets/color/palette.css");

for (const [name, [cssName, expectedValue]] of Object.entries(canonicalColors)) {
  const token = tokens?.color?.[name];
  if (!token) {
    fail(`tokens.json: missing color.${name}`);
    continue;
  }
  if (token.css !== cssName) {
    fail(`tokens.json: color.${name}.css must be ${cssName}, found ${token.css}`);
  }
  if (String(token.value).toUpperCase() !== expectedValue.toUpperCase()) {
    fail(
      `tokens.json: color.${name}.value must be ${expectedValue}, found ${token.value}`,
    );
  }

  const declaration = new RegExp(
    `${cssName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*${expectedValue}`,
    "i",
  );
  if (!declaration.test(sourceTokens)) {
    fail(`src/styles/editorial/tokens.css: ${cssName} must resolve to ${expectedValue}`);
  }
  if (!declaration.test(downloadablePalette)) {
    fail(`brand-kit palette.css: ${cssName} must resolve to ${expectedValue}`);
  }
}

const schemaUrl = String(tokens?.$schema || "");
const schemaPrefix = "https://littlefightnyc.com/brand-kit/";
if (!schemaUrl.startsWith(schemaPrefix)) {
  fail(`tokens.json: $schema must begin with ${schemaPrefix}`);
} else {
  const schemaRelativePath = schemaUrl.slice(schemaPrefix.length);
  await requireFile(
    path.join(brandRoot, schemaRelativePath),
    `public/brand-kit/${schemaRelativePath}`,
  );
}

const expectedType = {
  heading: "Oswald Variable",
  body: "Barlow",
  label: "JetBrains Mono",
};
for (const [role, family] of Object.entries(expectedType)) {
  if (tokens?.type?.[role]?.family !== family) {
    fail(`tokens.json: type.${role}.family must be ${family}`);
  }
}

if (tokens?.contact !== "hello@littlefightnyc.com") {
  fail("tokens.json: canonical contact must be hello@littlefightnyc.com");
}

const brandHtml = await read("public/brand-kit/index.html");
const standaloneHtml = await read("public/brand-kit/little-fight-nyc-brand.html");
const brandCss = await read("public/brand-kit/brand-kit.css");
const publicFooter = await read("src/components/editorial/QuietFooter.tsx");
const prerenderScript = await read("scripts/prerender-seo.mjs");
const canvaGuide = await readFile(
  path.join(repoRoot, "canva_brand_kit_little_fight_nyc.md"),
  "utf8",
).catch((error) => {
  fail(`canva_brand_kit_little_fight_nyc.md: ${error.message}`);
  return "";
});

const auditedText = [
  ["brand-kit/index.html", brandHtml],
  ["brand-kit/little-fight-nyc-brand.html", standaloneHtml],
  ["brand-kit/brand-kit.css", brandCss],
  ["canva_brand_kit_little_fight_nyc.md", canvaGuide],
];
const forbidden = [
  [/#06080F/gi, "retired background #06080F"],
  [/#0E1220/gi, "retired surface #0E1220"],
  [/#F0F2F8/gi, "retired text #F0F2F8"],
  [/#FE5800/gi, "retired orange #FE5800"],
  [/\bLexend\b/gi, "retired font Lexend"],
  [/\bCaveat\b/gi, "retired font Caveat"],
  [/\binfo@littlefightnyc\.com\b/gi, "retired contact address"],
];
for (const [label, text] of auditedText) {
  for (const [pattern, description] of forbidden) {
    if (pattern.test(text)) fail(`${label}: contains ${description}`);
    pattern.lastIndex = 0;
  }
}

for (const requiredText of [
  "hello@littlefightnyc.com",
  "Small crew.",
  "Heavy pull.",
  "Oswald",
  "Barlow",
  "JetBrains Mono",
]) {
  if (!brandHtml.includes(requiredText)) {
    fail(`brand-kit/index.html: missing ${JSON.stringify(requiredText)}`);
  }
}

for (const [label, text] of [
  ["brand-kit/index.html", brandHtml],
  ["brand-kit/little-fight-nyc-brand.html", standaloneHtml],
]) {
  if (!/<meta\s+name="robots"\s+content="noindex, nofollow, noarchive">/i.test(text)) {
    fail(`${label}: internal guide must carry noindex, nofollow, noarchive`);
  }
}
if (publicFooter.includes('to: "/brand-kit/"')) {
  fail("QuietFooter.tsx: internal Brand Kit must not be linked from public navigation");
}
if (/absoluteUrl\(\s*["']\/brand-kit\/["']\s*\)/.test(prerenderScript)) {
  fail("prerender-seo.mjs: internal Brand Kit must not be added to the sitemap");
}

for (const relativePath of [
  "brand-kit.css",
  "brand-kit.js",
  "assets/color/tokens.json",
  "assets/color/tokens.schema.json",
  "assets/color/palette.css",
  "assets/logo/mark-currentcolor.svg",
  "assets/downloads/BRAND-KIT.md",
  "assets/downloads/README.md",
  "assets/downloads/CHANGELOG.md",
  "assets/downloads/little-fight-nyc-brand-kit.zip",
]) {
  await requireFile(
    path.join(brandRoot, relativePath),
    `public/brand-kit/${relativePath}`,
    relativePath.endsWith(".zip") ? 100_000 : 1,
  );
}

for (const scene of [
  "restaurant-counter",
  "salon-systems",
  "shop-back-office",
  "storefronts-dawn",
]) {
  for (const suffix of ["", "-480", "-640", "-900", "-1200"]) {
    await requireFile(
      path.join(sceneRoot, `${scene}${suffix}.webp`),
      `public/images/brand-scenes/${scene}${suffix}.webp`,
      10_000,
    );
  }
}

if (failures.length) {
  console.error(`Brand system audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Brand system audit passed: canonical tokens, type, contact, downloads, schema, and 20 responsive scene assets.",
);
