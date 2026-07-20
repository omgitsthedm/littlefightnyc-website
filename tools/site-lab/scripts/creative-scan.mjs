#!/usr/bin/env node

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";
import { discoverRoutes, normalizeBase, parseArgs, routeLabel, routeToUrl } from "./discover-routes.mjs";

const viewports = [
  { label: "desktop", width: 1440, height: 1200 },
  { label: "tablet", width: 820, height: 1180 },
  { label: "mobile", width: 390, height: 844 },
];

const ctaPattern = /(fit check|call|text|start|audit|contact|book|email|get help|website audit)/i;

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function pct(value) {
  return `${Math.round(value * 100)}%`;
}

function hrefEscape(value) {
  return String(value).replace(/"/g, "&quot;");
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function fileExists(file) {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

function imageStatsFromPng(png) {
  const step = Math.max(1, Math.round(Math.min(png.width, png.height) / 360));
  let samples = 0;
  let dark = 0;
  let bright = 0;
  let saturated = 0;
  let orange = 0;
  let blue = 0;
  let satTotal = 0;
  let luminanceTotal = 0;
  let luminanceSqTotal = 0;
  let rgTotal = 0;
  let ybTotal = 0;
  let rgSqTotal = 0;
  let ybSqTotal = 0;
  let edgeSamples = 0;
  let edgeHits = 0;

  const luminanceAt = (x, y) => {
    const idx = (png.width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  for (let y = 0; y < png.height; y += step) {
    for (let x = 0; x < png.width; x += step) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const saturation = max === 0 ? 0 : (max - min) / max;
      const rg = Math.abs(r - g);
      const yb = Math.abs(0.5 * (r + g) - b);

      samples += 1;
      luminanceTotal += luminance;
      luminanceSqTotal += luminance * luminance;
      satTotal += saturation;
      rgTotal += rg;
      ybTotal += yb;
      rgSqTotal += rg * rg;
      ybSqTotal += yb * yb;

      if (luminance < 30) dark += 1;
      if (luminance > 220) bright += 1;
      if (saturation > 0.38 && luminance > 34) saturated += 1;
      if (r > 150 && g > 55 && g < 150 && b < 95) orange += 1;
      if (b > 120 && g > 90 && r < 130) blue += 1;

      if (x + step < png.width) {
        edgeSamples += 1;
        if (Math.abs(luminance - luminanceAt(x + step, y)) > 32) edgeHits += 1;
      }

      if (y + step < png.height) {
        edgeSamples += 1;
        if (Math.abs(luminance - luminanceAt(x, y + step)) > 32) edgeHits += 1;
      }
    }
  }

  const luminanceAvg = luminanceTotal / samples;
  const luminanceVariance = luminanceSqTotal / samples - luminanceAvg * luminanceAvg;
  const rgAvg = rgTotal / samples;
  const ybAvg = ybTotal / samples;
  const colorfulness = Math.sqrt(rgSqTotal / samples - rgAvg * rgAvg) + Math.sqrt(ybSqTotal / samples - ybAvg * ybAvg);
  const edgeDensity = edgeSamples ? edgeHits / edgeSamples : 0;
  const saturationAvg = satTotal / samples;
  const darkRatio = dark / samples;
  const saturatedRatio = saturated / samples;
  const brandAccentRatio = (orange + blue) / samples;

  const visualPower = clamp(
    Math.round(
      edgeDensity * 210 +
        colorfulness * 0.75 +
        saturationAvg * 36 +
        saturatedRatio * 50 +
        brandAccentRatio * 150 +
        Math.sqrt(Math.max(luminanceVariance, 0)) * 0.34 -
        Math.max(0, darkRatio - 0.78) * 45,
    ),
  );

  return {
    darkRatio,
    brightRatio: bright / samples,
    saturatedRatio,
    brandAccentRatio,
    edgeDensity,
    colorfulness,
    saturationAvg,
    luminanceAvg,
    visualPower,
    deadZoneRisk: darkRatio > 0.82 && edgeDensity < 0.045 && colorfulness < 22,
  };
}

async function analyzeScreenshot(file) {
  const buffer = await readFile(file);
  const png = PNG.sync.read(buffer);
  return {
    width: png.width,
    height: png.height,
    ...imageStatsFromPng(png),
  };
}

async function readDom(page) {
  return page.evaluate((sourceCtaPattern) => {
    const cta = new RegExp(sourceCtaPattern, "i");
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      return rect.width > 1 && rect.height > 1 && styles.visibility !== "hidden" && styles.display !== "none";
    };
    const inFold = (element) => {
      const rect = element.getBoundingClientRect();
      return visible(element) && rect.top < window.innerHeight && rect.bottom > 0;
    };
    const text = (element) => (element.textContent || "").replace(/\s+/g, " ").trim();
    const hero = document.querySelector(
      ".lf-pagehero, .press-masthead, .quiet-hero, .editorial-masthead, .home-hero, main > section, header",
    );
    const heroRect = hero?.getBoundingClientRect();
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const h1s = [...document.querySelectorAll("h1")].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        text: text(element),
        top: Math.round(rect.top),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
      };
    });
    const images = [...document.images].map((image) => {
      const rect = image.getBoundingClientRect();
      const hasAlt = image.hasAttribute("alt");
      const alt = image.getAttribute("alt") || "";
      const decorative =
        image.closest('[aria-hidden="true"], [role="presentation"], [role="none"]') !== null ||
        (hasAlt && alt.trim() === "");
      return {
        src: image.currentSrc || image.src || "",
        alt,
        hasAlt,
        decorative,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        inFold: inFold(image),
        visible: visible(image),
      };
    });
    const actions = [...document.querySelectorAll("a, button")].map((element) => {
      const rect = element.getBoundingClientRect();
      const label = text(element) || element.getAttribute("aria-label") || "";
      const href = element.getAttribute("href") || "";
      return {
        label,
        href,
        inFold: inFold(element),
        isCta: cta.test(`${label} ${href}`),
        top: Math.round(rect.top),
      };
    });
    const aboveFoldText = [...document.body.querySelectorAll("h1,h2,h3,p,li,a,button,figcaption")]
      .filter(inFold)
      .map(text)
      .filter(Boolean)
      .join(" ");
    const article = document.querySelector("article");
    const articleRect = article?.getBoundingClientRect();

    return {
      title: document.title,
      metaDescription,
      h1s,
      h1Count: h1s.length,
      images,
      imageCount: images.length,
      imagesInFold: images.filter((image) => image.inFold).length,
      missingAlt: images.filter((image) => image.visible && !image.decorative && !image.hasAlt).length,
      actions,
      ctasInFold: actions.filter((action) => action.inFold && action.isCta).slice(0, 8),
      telLinks: actions.filter((action) => /^tel:/i.test(action.href)).length,
      routeLoadingVisible: Boolean(document.querySelector(".route-loading")),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      aboveFoldTextChars: aboveFoldText.length,
      hero: heroRect
        ? {
            top: Math.round(heroRect.top),
            height: Math.round(heroRect.height),
            bottom: Math.round(heroRect.bottom),
          }
        : null,
      articleTop: articleRect ? Math.round(articleRect.top) : null,
      bodyTextChars: document.body.innerText.replace(/\s+/g, " ").trim().length,
    };
  }, ctaPattern.source);
}

function titleIssue(dom) {
  if (!dom.title) return "missing title";
  if (dom.title.length < 18) return "short title";
  if (dom.title.length > 68) return "long title";
  return "";
}

function descriptionIssue(dom) {
  if (!dom.metaDescription) return "missing description";
  if (dom.metaDescription.length < 80) return "thin description";
  if (dom.metaDescription.length > 180) return "long description";
  return "";
}

function routeScore(page) {
  let score = 100;
  const risks = new Set();
  const desktop = page.viewports.find((item) => item.viewport.label === "desktop");
  const mobile = page.viewports.find((item) => item.viewport.label === "mobile");
  const allDom = page.viewports.map((item) => item.dom);
  const allVisual = page.viewports.map((item) => item.visual);
  const dom = desktop?.dom ?? page.viewports[0]?.dom;

  if (!dom) return { score: 0, risks: ["render failed"] };

  const title = titleIssue(dom);
  const description = descriptionIssue(dom);

  if (title) {
    score -= 5;
    risks.add(title);
  }

  if (description) {
    score -= 5;
    risks.add(description);
  }

  if (dom.h1Count !== 1) {
    score -= 10;
    risks.add(`${dom.h1Count} h1s`);
  }

  const overflow = allDom.some((item) => item.horizontalOverflow);
  if (overflow) {
    score -= 12;
    risks.add("horizontal overflow");
  }

  const missingAlt = Math.max(...allDom.map((item) => item.missingAlt));
  if (missingAlt > 0) {
    score -= clamp(missingAlt * 3, 3, 15);
    risks.add(`${missingAlt} images missing alt`);
  }

  const desktopHero = desktop?.dom.hero;
  if (desktopHero && desktopHero.height > desktop.dom.viewportHeight * 0.82 && page.route !== "/") {
    score -= 9;
    risks.add("oversized desktop masthead");
  }

  const mobileHero = mobile?.dom.hero;
  if (mobileHero && mobileHero.height > mobile.dom.viewportHeight * 0.9 && page.route !== "/") {
    score -= 9;
    risks.add("oversized mobile masthead");
  }

  const noCtaInFold = !allDom.some((item) => item.ctasInFold.length > 0);
  if (noCtaInFold && !page.route.startsWith("/journal/") && !page.route.startsWith("/glossary/")) {
    score -= 8;
    risks.add("no CTA above fold");
  }

  const weakTextInFold = allDom.some((item) => item.aboveFoldTextChars < 70);
  if (weakTextInFold) {
    score -= 6;
    risks.add("thin first fold");
  }

  const deadZone = allVisual.some((item) => item.deadZoneRisk);
  if (deadZone) {
    score -= 14;
    risks.add("dark dead-zone risk");
  }

  const lowPower = Math.min(...allVisual.map((item) => item.visualPower)) < 34;
  if (lowPower) {
    score -= 8;
    risks.add("low visual power");
  }

  const axeViolations = page.axe?.violations?.length ?? 0;
  if (axeViolations > 0) {
    score -= clamp(axeViolations * 5, 5, 22);
    risks.add(`${axeViolations} axe violations`);
  }

  const consoleErrors = page.console.filter((entry) => entry.type === "error").length;
  if (consoleErrors > 0) {
    score -= clamp(consoleErrors * 4, 4, 20);
    risks.add(`${consoleErrors} console errors`);
  }

  return {
    score: clamp(Math.round(score)),
    risks: [...risks],
  };
}

async function scanViewport({ browser, base, route, viewport, outDir, timeout }) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleEntries = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleEntries.push({ type: message.type(), text: message.text().slice(0, 500) });
    }
  });
  page.on("pageerror", (error) => {
    consoleEntries.push({ type: "error", text: error.message.slice(0, 500) });
  });

  const url = routeToUrl(base, route);
  const label = routeLabel(route);
  const screenshotDir = path.join(outDir, "screenshots", viewport.label);
  await ensureDir(screenshotDir);
  const screenshotPath = path.join(screenshotDir, `${label}.png`);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout });
  await page.waitForLoadState("networkidle", { timeout: 9000 }).catch(() => {});
  await page.locator(".route-loading").first().waitFor({ state: "hidden", timeout: 9000 }).catch(() => {});
  await page.waitForTimeout(900);

  const dom = await readDom(page);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  const visual = await analyzeScreenshot(screenshotPath);

  let axe = null;
  if (viewport.label === "desktop") {
    try {
      axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    } catch (error) {
      consoleEntries.push({ type: "error", text: `axe failed: ${error.message}` });
    }
  }

  await context.close();

  return {
    viewport,
    url,
    screenshot: path.relative(outDir, screenshotPath),
    dom,
    visual,
    console: consoleEntries,
    axe,
  };
}

function routeFamily(route) {
  const [first] = route.split("/").filter(Boolean);
  return first || "home";
}

function summarizeImages(pages) {
  const counts = new Map();

  for (const page of pages) {
    const desktop = page.viewports.find((item) => item.viewport.label === "desktop");
    for (const image of desktop?.dom.images ?? []) {
      if (!image.visible || !image.src) continue;
      const key = image.src.replace(/^https?:\/\/[^/]+/, "");
      const current = counts.get(key) ?? { src: key, count: 0, routes: [] };
      current.count += 1;
      current.routes.push(page.route);
      counts.set(key, current);
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
}

function summarizeFamilies(pages) {
  const families = new Map();

  for (const page of pages) {
    const family = routeFamily(page.route);
    const current = families.get(family) ?? { family, count: 0, scoreTotal: 0, risks: new Map() };
    current.count += 1;
    current.scoreTotal += page.score;

    for (const risk of page.risks) {
      current.risks.set(risk, (current.risks.get(risk) ?? 0) + 1);
    }

    families.set(family, current);
  }

  return [...families.values()]
    .map((item) => ({
      ...item,
      averageScore: Math.round(item.scoreTotal / item.count),
      topRisks: [...item.risks.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
    }))
    .sort((a, b) => a.averageScore - b.averageScore);
}

function reportMarkdown({ base, pages, generatedAt, outDir }) {
  const lowest = [...pages].sort((a, b) => a.score - b.score).slice(0, 18);
  const families = summarizeFamilies(pages);
  const images = summarizeImages(pages).slice(0, 16);
  const avgScore = Math.round(pages.reduce((total, page) => total + page.score, 0) / pages.length);
  const axeCount = pages.reduce((total, page) => total + (page.axe?.violations?.length ?? 0), 0);
  const deadZones = pages.filter((page) => page.risks.includes("dark dead-zone risk")).length;
  const overflow = pages.filter((page) => page.risks.includes("horizontal overflow")).length;
  const lowPower = pages.filter((page) => page.risks.includes("low visual power")).length;

  const lines = [
    "# Little Fight Site Lab Report",
    "",
    `- Base: ${base}`,
    `- Generated: ${generatedAt}`,
    `- Routes scanned: ${pages.length}`,
    `- Average score: ${avgScore}/100`,
    `- Axe violations: ${axeCount}`,
    `- Dark dead-zone risks: ${deadZones}`,
    `- Horizontal overflow routes: ${overflow}`,
    `- Low visual power routes: ${lowPower}`,
    `- Contact sheet: ${path.join(outDir, "contact-sheet.html")}`,
    "",
    "## Highest-Leverage Fix Queue",
    "",
    "| Score | Route | Risks |",
    "| ---: | --- | --- |",
    ...lowest.map((page) => `| ${page.score} | ${page.route} | ${page.risks.join(", ") || "clean"} |`),
    "",
    "## Page Families",
    "",
    "| Family | Routes | Avg score | Top risks |",
    "| --- | ---: | ---: | --- |",
    ...families.map(
      (family) =>
        `| ${family.family} | ${family.count} | ${family.averageScore} | ${
          family.topRisks.map(([risk, count]) => `${risk} (${count})`).join(", ") || "clean"
        } |`,
    ),
    "",
    "## Image Reuse Watchlist",
    "",
    "| Uses | Image | Example routes |",
    "| ---: | --- | --- |",
    ...images.map((image) => `| ${image.count} | ${image.src} | ${image.routes.slice(0, 4).join(", ")} |`),
    "",
    "## Full Route Table",
    "",
    "| Score | Visual | Route | H1 | Title | Risks |",
    "| ---: | ---: | --- | --- | --- | --- |",
    ...pages
      .slice()
      .sort((a, b) => a.route.localeCompare(b.route))
      .map((page) => {
        const desktop = page.viewports.find((item) => item.viewport.label === "desktop");
        const h1 = desktop?.dom.h1s?.[0]?.text ?? "";
        const title = desktop?.dom.title ?? "";
        const visual = Math.round(
          page.viewports.reduce((total, item) => total + item.visual.visualPower, 0) / page.viewports.length,
        );
        return `| ${page.score} | ${visual} | ${page.route} | ${h1.replace(/\|/g, "\\|")} | ${title.replace(/\|/g, "\\|")} | ${
          page.risks.join(", ") || "clean"
        } |`;
      }),
    "",
    "## How To Use This",
    "",
    "Work by family. If ten area routes share one problem, fix the template once. If one journal route has a visual dead zone, fix the shared editorial pattern only if the contact sheet shows it repeating.",
    "",
    "A low score is a creative opening, not a verdict. Use the screenshots beside the route metrics and make the page more useful, more tactile, more specific, and more memorable.",
    "",
  ];

  return lines.join("\n");
}

function contactSheetHtml({ base, pages, generatedAt }) {
  const cards = pages
    .slice()
    .sort((a, b) => a.score - b.score)
    .map((page) => {
      const desktop = page.viewports.find((item) => item.viewport.label === "desktop");
      const h1 = desktop?.dom.h1s?.[0]?.text ?? page.route;
      const shots = page.viewports
        .map(
          (item) => `
            <figure>
              <img src="${hrefEscape(item.screenshot)}" alt="${hrefEscape(page.route)} ${item.viewport.label}" loading="lazy">
              <figcaption>${item.viewport.label} · visual ${item.visual.visualPower} · dark ${pct(item.visual.darkRatio)}</figcaption>
            </figure>`,
        )
        .join("");

      return `
        <article class="card ${page.score < 70 ? "danger" : page.score < 84 ? "warn" : ""}">
          <header>
            <div>
              <p class="route">${htmlEscape(page.route)}</p>
              <h2>${htmlEscape(h1)}</h2>
            </div>
            <strong>${page.score}</strong>
          </header>
          <p class="risks">${htmlEscape(page.risks.join(" · ") || "Clean foundation. Judge the craft.")}</p>
          <div class="shots">${shots}</div>
        </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Little Fight Site Lab</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #090a0a;
        --paper: #f8f2e8;
        --muted: #9a9184;
        --rule: rgba(248, 242, 232, 0.16);
        --orange: #ff6f1f;
        --warn: #f4b84a;
        --danger: #e76c6c;
      }

      body {
        margin: 0;
        background: #070807;
        color: var(--paper);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .mast {
        position: sticky;
        top: 0;
        z-index: 2;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 1rem;
        align-items: end;
        padding: 1rem clamp(1rem, 3vw, 2rem);
        border-bottom: 1px solid var(--rule);
        background: color-mix(in srgb, #070807 88%, transparent);
        backdrop-filter: blur(18px);
      }

      h1, h2, p { margin: 0; }
      h1 { font-size: clamp(1.7rem, 4vw, 4.5rem); letter-spacing: -0.035em; line-height: 0.95; }
      .mast p, .route, figcaption, .risks { color: var(--muted); }
      .grid { display: grid; gap: 1rem; padding: 1rem; }
      .card {
        border: 1px solid var(--rule);
        background: linear-gradient(135deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
        padding: 1rem;
      }

      .card.warn { border-color: color-mix(in srgb, var(--warn) 48%, var(--rule)); }
      .card.danger { border-color: color-mix(in srgb, var(--danger) 58%, var(--rule)); }

      .card header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 1rem;
        align-items: start;
        margin-bottom: 0.7rem;
      }

      .card strong {
        display: grid;
        place-items: center;
        min-width: 3.25rem;
        aspect-ratio: 1;
        border: 1px solid var(--rule);
        color: var(--orange);
        font-size: 1.35rem;
      }

      .route {
        font: 0.72rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 0.3rem;
      }

      h2 {
        max-width: 46rem;
        font-size: clamp(1.25rem, 2.6vw, 2.35rem);
        line-height: 1.02;
        letter-spacing: -0.025em;
      }

      .risks {
        min-height: 1.4rem;
        margin-bottom: 0.9rem;
        font-size: 0.9rem;
      }

      .shots {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.8fr) minmax(160px, 0.45fr);
        gap: 0.75rem;
        align-items: start;
      }

      figure { margin: 0; }
      img {
        display: block;
        width: 100%;
        height: auto;
        border: 1px solid var(--rule);
        background: #111;
      }

      figcaption {
        margin-top: 0.35rem;
        font: 0.68rem/1.3 ui-monospace, SFMono-Regular, Menlo, monospace;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      @media (max-width: 900px) {
        .shots { grid-template-columns: 1fr; }
        .mast { position: static; grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <header class="mast">
      <div>
        <p>Little Fight NYC · Site Lab · ${htmlEscape(base)}</p>
        <h1>Whole-site contact sheet</h1>
      </div>
      <p>${htmlEscape(generatedAt)} · ${pages.length} routes</p>
    </header>
    <main class="grid">
      ${cards}
    </main>
  </body>
</html>`;
}

async function main() {
  const args = parseArgs();
  const base = normalizeBase(args.get("base") ?? "https://littlefightnyc.com");
  const outDir = path.resolve(args.get("out") ?? "reports/live");
  const max = Number(args.get("max") ?? 0);
  const timeout = Number(args.get("timeout") ?? 45000);
  const generatedAt = new Date().toISOString();

  await ensureDir(outDir);

  const routes = await discoverRoutes({
    base,
    max,
    sitemapPath: args.get("sitemap") ?? "/sitemap.xml",
    includePattern: args.get("include") ?? "",
    excludePattern: args.get("exclude") ?? "",
  });

  const browser = await chromium.launch();
  const pages = [];

  console.log(`[site-lab] Scanning ${routes.length} routes from ${base}`);

  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    const page = {
      route,
      family: routeFamily(route),
      viewports: [],
      console: [],
      axe: null,
      score: 0,
      risks: [],
    };

    console.log(`[site-lab] ${index + 1}/${routes.length} ${route}`);

    for (const viewport of viewports) {
      try {
        const result = await scanViewport({ browser, base, route, viewport, outDir, timeout });
        page.viewports.push({
          viewport: result.viewport,
          url: result.url,
          screenshot: result.screenshot,
          dom: result.dom,
          visual: result.visual,
        });
        page.console.push(...result.console);

        if (result.axe) {
          page.axe = {
            violations: result.axe.violations.map((violation) => ({
              id: violation.id,
              impact: violation.impact,
              help: violation.help,
              nodes: violation.nodes.length,
            })),
          };
        }
      } catch (error) {
        page.console.push({ type: "error", text: `${viewport.label} failed: ${error.message}` });
      }
    }

    const scored = routeScore(page);
    page.score = scored.score;
    page.risks = scored.risks;
    pages.push(page);
  }

  await browser.close();

  const manifest = {
    base,
    generatedAt,
    routeCount: pages.length,
    viewports,
    pages,
  };

  const report = reportMarkdown({ base, pages, generatedAt, outDir });
  const contactSheet = contactSheetHtml({ base, pages, generatedAt });

  await writeFile(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outDir, "report.md"), report);
  await writeFile(path.join(outDir, "contact-sheet.html"), contactSheet);

  if (!(await fileExists(path.join(outDir, ".gitkeep")))) {
    await writeFile(path.join(outDir, ".gitkeep"), "");
  }

  const avgScore = Math.round(pages.reduce((total, page) => total + page.score, 0) / pages.length);
  console.log(`[site-lab] Done. Average score ${avgScore}/100.`);
  console.log(`[site-lab] Report: ${path.join(outDir, "report.md")}`);
  console.log(`[site-lab] Contact sheet: ${path.join(outDir, "contact-sheet.html")}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
