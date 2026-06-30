#!/usr/bin/env node

const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const codexNode = "/Applications/Codex.app/Contents/Resources/node";
const nodeBin = process.env.BACKSTOP_NODE || (existsSync(codexNode) ? codexNode : process.execPath);
const cli = path.resolve(__dirname, "../node_modules/backstopjs/cli/index.js");
const result = spawnSync(nodeBin, [cli, ...process.argv.slice(2)], {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  env: process.env,
});

process.exitCode = result.status ?? 1;
