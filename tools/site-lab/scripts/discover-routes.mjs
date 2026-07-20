#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import path from "node:path";

const fallbackRoutes = [
  "/",
  "/services/",
  "/field-guide/",
  "/audit/",
  "/tech-audit/",
  "/about/",
  "/journal/",
];

export function parseArgs(argv = process.argv.slice(2)) {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) continue;

    const [rawKey, inlineValue] = token.slice(2).split("=");
    const next = argv[index + 1];
    const value = inlineValue ?? (next && !next.startsWith("--") ? next : "true");

    if (inlineValue === undefined && next && !next.startsWith("--")) {
      index += 1;
    }

    args.set(rawKey, value);
  }

  return args;
}

export function normalizeBase(rawBase) {
  const withProtocol = /^https?:\/\//.test(rawBase) ? rawBase : `https://${rawBase}`;
  const url = new URL(withProtocol);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function routeLabel(route) {
  if (route === "/") return "home";

  return route
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function routeToUrl(base, route) {
  return new URL(route, base).toString();
}

export async function discoverRoutes({
  base,
  max = 0,
  sitemapPath = "/sitemap.xml",
  includePattern = "",
  excludePattern = "",
} = {}) {
  const normalizedBase = normalizeBase(base ?? "https://littlefightnyc.com");
  const sitemapUrl = new URL(sitemapPath, normalizedBase).toString();
  const include = includePattern ? new RegExp(includePattern) : null;
  const exclude = excludePattern ? new RegExp(excludePattern) : null;
  let routes = [];

  try {
    const response = await fetch(sitemapUrl, {
      headers: {
        "user-agent": "LittleFightSiteLab/0.1 (+https://littlefightnyc.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`Sitemap request failed with ${response.status}`);
    }

    const xml = await response.text();
    const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());

    routes = locs
      .map((loc) => new URL(loc))
      .map((url) => `${url.pathname}${url.pathname.endsWith("/") ? "" : "/"}`);
  } catch (error) {
    console.warn(`[site-lab] Could not read ${sitemapUrl}: ${error.message}`);
    routes = [...fallbackRoutes];
  }

  routes = [...new Set(routes)]
    .filter((route) => !include || include.test(route))
    .filter((route) => !exclude || !exclude.test(route));

  if (Number(max) > 0) {
    routes = routes.slice(0, Number(max));
  }

  return routes;
}

async function main() {
  const args = parseArgs();
  const base = normalizeBase(args.get("base") ?? "https://littlefightnyc.com");
  const max = Number(args.get("max") ?? 0);
  const out = args.get("out");
  const routes = await discoverRoutes({
    base,
    max,
    sitemapPath: args.get("sitemap") ?? "/sitemap.xml",
    includePattern: args.get("include") ?? "",
    excludePattern: args.get("exclude") ?? "",
  });

  const payload = {
    base,
    generatedAt: new Date().toISOString(),
    count: routes.length,
    routes,
  };

  if (out) {
    await writeFile(path.resolve(out), `${JSON.stringify(payload, null, 2)}\n`);
  }

  console.log(JSON.stringify(payload, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
