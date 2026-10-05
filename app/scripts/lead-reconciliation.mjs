#!/usr/bin/env node
/**
 * Private operating ledger for received Little Fight inquiries. It is never
 * bundled or deployed. The local store contains contact details; its commands
 * deliberately print counts and opaque IDs only.
 */
import { chmod, lstat, mkdir, readFile, realpath, rename, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEAD_STAGES,
  clearLeadExclusion,
  createManualLead,
  emptyLedger,
  ledgerCsv,
  leadList,
  leadSummary,
  mergeNetlifySubmissions,
  setLeadExclusion,
  updateLeadStage,
  validateLedger,
} from "./lead-reconciliation-lib.mjs";

const SITE_ID = "0907d8fe-7018-48db-a6be-1f906e4b2619";

function usage() {
  return `Usage:
  node app/scripts/lead-reconciliation.mjs import-netlify [--pages 20]
  node app/scripts/lead-reconciliation.mjs import-file --file /absolute/export.json
  node app/scripts/lead-reconciliation.mjs add --channel call|text|email [--file /absolute/private/lead.json] [--intent website] [--source referral] [--discovery referral] [--tile id] [--at ISO] [--value amount]
  node app/scripts/lead-reconciliation.mjs stage --id opaque-id --stage ${LEAD_STAGES.join("|")} [--at ISO] [--value amount]
  node app/scripts/lead-reconciliation.mjs exclude --id opaque-id --reason qa|spam [--at ISO]
  node app/scripts/lead-reconciliation.mjs include --id opaque-id [--at ISO]
  node app/scripts/lead-reconciliation.mjs export-csv --file /absolute/private/leads.csv [--overwrite]
  node app/scripts/lead-reconciliation.mjs list
  node app/scripts/lead-reconciliation.mjs summary

Set LFNYC_LEAD_STORE_DIR to an absolute directory outside this repository to
override the default private store. import-netlify requires NETLIFY_AUTH_TOKEN.
The token and contact details are never printed.`;
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    if (key === "overwrite") {
      options.overwrite = true;
      continue;
    }
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}.`);
    options[key] = value;
    index += 1;
  }
  return { command, options };
}

async function nearestExistingPath(path) {
  let candidate = resolve(path);
  while (true) {
    try {
      await lstat(candidate);
      return candidate;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      const parent = dirname(candidate);
      if (parent === candidate) throw new Error("No existing parent is available for this path.");
      candidate = parent;
    }
  }
}

async function assertOutsideGit(path) {
  const existing = await nearestExistingPath(path);
  const canonical = await realpath(existing);
  const canonicalStat = await lstat(canonical);
  let candidate = canonicalStat.isDirectory() ? canonical : dirname(canonical);
  while (true) {
    try {
      await lstat(join(candidate, ".git"));
      throw new Error("Private lead data must not be stored inside a Git checkout.");
    } catch (error) {
      if (error?.message === "Private lead data must not be stored inside a Git checkout.") throw error;
      if (error?.code && error.code !== "ENOENT") throw error;
    }
    const parent = dirname(candidate);
    if (parent === candidate) return;
    candidate = parent;
  }
}

async function storePath() {
  const configured = process.env.LFNYC_LEAD_STORE_DIR;
  const directory = configured || join(homedir(), ".local", "share", "littlefightnyc", "operations");
  if (!isAbsolute(directory)) throw new Error("LFNYC_LEAD_STORE_DIR must be an absolute path.");
  const resolvedDirectory = resolve(directory);
  await assertOutsideGit(resolvedDirectory);
  return join(resolvedDirectory, "lead-reconciliation.json");
}

async function loadLedger(path) {
  try {
    return validateLedger(JSON.parse(await readFile(path, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") return emptyLedger();
    throw error;
  }
}

async function saveLedger(path, ledger) {
  const folder = dirname(path);
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const temporary = join(folder, `.lead-reconciliation-${process.pid}-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    await chmod(temporary, 0o600);
    await rename(temporary, path);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
  await chmod(path, 0o600);
}

async function writePrivateExport(path, contents, overwrite = false) {
  if (!isAbsolute(path)) throw new Error("--file must be an absolute path.");
  const target = resolve(path);
  await assertOutsideGit(target);
  try {
    await lstat(target);
    if (!overwrite) throw new Error("CSV export already exists; use --overwrite only for the intended private file.");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const folder = dirname(target);
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const temporary = join(folder, `.lead-export-${process.pid}-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, contents, { mode: 0o600, flag: "wx" });
    await chmod(temporary, 0o600);
    await rename(temporary, target);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
  await chmod(target, 0o600);
}

function privateResult(message) {
  process.stdout.write(`${message}\n`);
}

async function providerQueue(token, pages, state, request) {
  const limit = Number(pages || 20);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("--pages must be an integer from 1 through 100.");
  const collected = [];
  for (let page = 1; page <= limit; page += 1) {
    const query = new URLSearchParams({ per_page: "100", page: String(page) });
    if (state === "spam") query.set("state", "spam");
    const response = await request(`https://api.netlify.com/api/v1/sites/${SITE_ID}/submissions?${query}`, {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Netlify ${state} submissions request failed with HTTP ${response.status}.`);
    const payload = await response.json();
    if (!Array.isArray(payload)) throw new Error("Netlify submissions response was not an array.");
    collected.push(...payload.map((submission) => ({ ...submission, provider_state: state })));
    const links = response.headers.get("link") || "";
    const hasNext = /rel="?next"?/i.test(links);
    if (!hasNext || payload.length === 0) break;
    if (page === limit) throw new Error("Netlify returned another submissions page; rerun with a higher --pages value. Nothing was imported.");
  }
  return collected;
}

export async function providerSubmissions(token, pages, request = fetch) {
  // Import both queues before writing so a transient provider failure never
  // creates a partial private ledger update. Spam is a provider quarantine,
  // not a sales lead or a certainty about the sender.
  const [verified, quarantined] = await Promise.all([
    providerQueue(token, pages, "verified", request),
    providerQueue(token, pages, "spam", request),
  ]);
  const byProviderId = new Map();
  for (const submission of [...verified, ...quarantined]) {
    const key = typeof submission.id === "string" && submission.id ? submission.id : JSON.stringify(submission);
    // A state race may return the same receipt from both queues. Prefer the
    // quarantined view until the next complete import resolves it.
    byProviderId.set(key, submission);
  }
  return [...byProviderId.values()];
}

async function submissionsFromFile(path) {
  if (!isAbsolute(path)) throw new Error("--file must be an absolute path.");
  await assertOutsideGit(path);
  const payload = JSON.parse(await readFile(path, "utf8"));
  if (!Array.isArray(payload)) throw new Error("Import file must contain a Netlify submissions array.");
  return payload;
}

async function manualLeadFromFile(path) {
  if (!isAbsolute(path)) throw new Error("--file must be an absolute path.");
  await assertOutsideGit(path);
  const payload = JSON.parse(await readFile(path, "utf8"));
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Manual lead file must contain one JSON object.");
  return createManualLead(payload);
}

function valueOrUndefined(value) {
  return value === undefined ? undefined : value;
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === "help" || command === "--help") {
    privateResult(usage());
    return;
  }
  const path = await storePath();
  const ledger = await loadLedger(path);
  if (command === "import-netlify" || command === "import-file") {
    const submissions = command === "import-netlify"
      ? await providerSubmissions(process.env.NETLIFY_AUTH_TOKEN || (() => { throw new Error("NETLIFY_AUTH_TOKEN is required for import-netlify."); })(), options.pages)
      : await submissionsFromFile(options.file || (() => { throw new Error("--file is required for import-file."); })());
    const result = mergeNetlifySubmissions(ledger, submissions);
    await saveLedger(path, result.ledger);
    privateResult(JSON.stringify({ imported: { added: result.added, updated: result.updated }, funnel: leadSummary(result.ledger) }, null, 2));
    return;
  }
  if (command === "add") {
    const lead = options.file ? await manualLeadFromFile(options.file) : createManualLead({
      channel: options.channel,
      receivedAt: options.at,
      knownValue: valueOrUndefined(options.value),
      context: { intent: options.intent, source: options.source, discovery_source: options.discovery, tile: options.tile },
    });
    ledger.leads.push(lead);
    ledger.updatedAt = new Date().toISOString();
    await saveLedger(path, ledger);
    privateResult(`Manual lead recorded: ${lead.id}.`);
    return;
  }
  if (command === "stage") {
    const lead = updateLeadStage(ledger, options.id, options.stage, options.at, valueOrUndefined(options.value));
    await saveLedger(path, ledger);
    privateResult(`Lead stage recorded: ${lead.id} is ${lead.stage}.`);
    return;
  }
  if (command === "exclude") {
    const lead = setLeadExclusion(ledger, options.id, options.reason, options.at);
    await saveLedger(path, ledger);
    privateResult(`Lead excluded from funnel totals: ${lead.id}.`);
    return;
  }
  if (command === "include") {
    const lead = clearLeadExclusion(ledger, options.id, options.at);
    await saveLedger(path, ledger);
    privateResult(`Lead included in funnel totals: ${lead.id}.`);
    return;
  }
  if (command === "summary") {
    const summary = leadSummary(ledger);
    privateResult(JSON.stringify(summary, null, 2));
    return;
  }
  if (command === "list") {
    privateResult(JSON.stringify(leadList(ledger), null, 2));
    return;
  }
  if (command === "export-csv") {
    if (!options.file) throw new Error("--file is required for export-csv.");
    await writePrivateExport(options.file, ledgerCsv(ledger), options.overwrite === true);
    privateResult(`Private spreadsheet export written: ${ledger.leads.length} lead record(s).`);
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${usage()}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Lead reconciliation failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
