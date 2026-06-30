#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve("../..");
const app = path.join(root, "app");
const siteLab = process.cwd();
const generatedAt = new Date().toISOString();

const checks = [
  {
    name: "App lint",
    command: "npm",
    args: ["run", "lint"],
    cwd: app,
    category: "Code quality",
  },
  {
    name: "App production build + prerender",
    command: "npm",
    args: ["run", "build"],
    cwd: app,
    category: "Build",
  },
  {
    name: "Full visual/DOM/accessibility scan",
    command: "npm",
    args: ["run", "scan:live"],
    cwd: siteLab,
    category: "Visual + accessibility",
  },
  {
    name: "Link integrity crawl",
    command: "npm",
    args: ["run", "links"],
    cwd: siteLab,
    category: "Links",
  },
  {
    name: "Lighthouse CI priority routes",
    command: "npm",
    args: ["run", "lhci"],
    cwd: siteLab,
    category: "Performance",
  },
  {
    name: "Unlighthouse priority routes",
    command: "npm",
    args: ["run", "unlighthouse"],
    cwd: siteLab,
    category: "Performance",
  },
  {
    name: "Squirrelscan full website audit",
    command: "squirrel",
    args: ["audit", "https://littlefightnyc.com", "--format", "llm"],
    cwd: root,
    category: "SEO + security + content",
  },
  {
    name: "Backstop visual regression",
    command: "npm",
    args: ["run", "backstop:test"],
    cwd: siteLab,
    category: "Visual regression",
  },
  {
    name: "App dependency security audit",
    command: "npm",
    args: ["audit", "--audit-level=high"],
    cwd: app,
    category: "Security",
  },
  {
    name: "Site-lab dependency security audit",
    command: "npm",
    args: ["audit", "--audit-level=high"],
    cwd: siteLab,
    category: "Security",
  },
];

function run(check) {
  const started = Date.now();
  console.log(`\n[ultraship] ${check.name}`);
  console.log(`[ultraship] ${check.cwd}$ ${check.command} ${check.args.join(" ")}`);

  const result = spawnSync(check.command, check.args, {
    cwd: check.cwd,
    env: process.env,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 40,
  });

  const durationSeconds = Math.round((Date.now() - started) / 100) / 10;
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();

  if (output) {
    console.log(output);
  }

  return {
    ...check,
    status: result.status === 0 ? "pass" : "fail",
    exitCode: result.status ?? 1,
    durationSeconds,
    outputTail: output.split("\n").slice(-80).join("\n"),
  };
}

const results = checks.map(run);
const passCount = results.filter((result) => result.status === "pass").length;
const failCount = results.length - passCount;
const outDir = path.join(siteLab, "reports", "ultraship");
mkdirSync(outDir, { recursive: true });

const lines = [
  "# Ultraship Suite",
  "",
  `Generated: ${generatedAt}`,
  `Checks: ${results.length}`,
  `Passed: ${passCount}`,
  `Failed: ${failCount}`,
  "",
  "| Status | Category | Check | Seconds | Exit |",
  "| --- | --- | --- | ---: | ---: |",
  ...results.map(
    (result) =>
      `| ${result.status === "pass" ? "PASS" : "FAIL"} | ${result.category} | ${result.name} | ${result.durationSeconds} | ${result.exitCode} |`,
  ),
  "",
  "## Failure Tails",
  "",
  ...results
    .filter((result) => result.status !== "pass")
    .flatMap((result) => [
      `### ${result.name}`,
      "",
      "```",
      result.outputTail || "(no output)",
      "```",
      "",
    ]),
];

writeFileSync(path.join(outDir, "summary.md"), `${lines.join("\n")}\n`);
writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify({ generatedAt, results }, null, 2)}\n`);

console.log(`\n[ultraship] Summary: ${path.join(outDir, "summary.md")}`);
process.exitCode = failCount > 0 ? 1 : 0;
