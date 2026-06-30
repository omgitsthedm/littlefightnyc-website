#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { discoverRoutes, normalizeBase, parseArgs, routeLabel, routeToUrl } from "./discover-routes.mjs";

const viewports = [
  { label: "desktop", width: 1440, height: 1200 },
  { label: "tablet", width: 820, height: 1180 },
  { label: "mobile", width: 390, height: 844 },
];

async function main() {
  const args = parseArgs();
  const base = normalizeBase(args.get("base") ?? "https://littlefightnyc.com");
  const max = Number(args.get("max") ?? 40);
  const routes = await discoverRoutes({
    base,
    max,
    includePattern: args.get("include") ?? "",
    excludePattern: args.get("exclude") ?? "",
  });

  const config = {
    id: "littlefightnyc",
    viewports,
    scenarios: routes.map((route) => ({
      label: routeLabel(route),
      url: routeToUrl(base, route),
      readySelector: "body",
      delay: 2400,
      misMatchThreshold: 0.8,
      requireSameDimensions: false,
      onReadyScript: "disable-dynamics.cjs",
    })),
    paths: {
      bitmaps_reference: "backstop_data/bitmaps_reference",
      bitmaps_test: "backstop_data/bitmaps_test",
      engine_scripts: "scripts/backstop",
      html_report: "backstop_data/html_report",
      ci_report: "backstop_data/ci_report",
    },
    report: ["browser", "json"],
    engine: "playwright",
    engineOptions: {
      args: ["--no-sandbox"],
    },
    asyncCaptureLimit: 4,
    asyncCompareLimit: 20,
    debug: false,
    debugWindow: false,
  };

  await writeFile("backstop.config.cjs", `module.exports = ${JSON.stringify(config, null, 2)};\n`);
  console.log(`[site-lab] Wrote backstop.config.cjs with ${routes.length} scenarios x ${viewports.length} viewports.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
