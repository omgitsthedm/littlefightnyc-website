import { createHash, randomUUID } from "node:crypto";

export const LEAD_STAGES = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const ATTRIBUTION_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"];
const CONTEXT_FIELDS = ["intent", "lead_origin", "placement", "tile", "discovery_source", "follow_up", "source"];
const CONTACT_FIELDS = ["name", "business", "contact", "email", "phone", "website_url", "report_id", "symptom", "urgency", "message"];

function text(value, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeTimestamp(value, fallback = new Date().toISOString()) {
  const parsed = typeof value === "string" || typeof value === "number" ? new Date(value) : null;
  return parsed && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : fallback;
}

function pick(data, fields) {
  return Object.fromEntries(fields.map((field) => [field, text(data[field])]).filter(([, value]) => value));
}

function submissionData(submission) {
  if (!submission || typeof submission !== "object") return {};
  const candidate = submission.data;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate : {};
}

function normalizedContact(data) {
  const email = text(data.email, 320);
  const phone = text(data.phone, 120);
  const message = text(data.message || data.messy_now || data.messynow);
  return {
    ...pick(data, ["name", "report_id", "symptom", "urgency"]),
    ...(text(data.business || data.business_name) ? { business: text(data.business || data.business_name) } : {}),
    ...(text(data.contact) || email || phone ? { contact: text(data.contact) || email || phone } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(text(data.website_url || data.website) ? { website_url: text(data.website_url || data.website) } : {}),
    ...(message ? { message } : {}),
  };
}

function intentBucket(value) {
  const intent = text(value, 30).toLowerCase();
  return new Set(["website", "support", "consulting", "systems", "general"]).has(intent) ? intent : "unknown";
}

function sourceBucket(lead) {
  const values = [lead.context.discovery_source, lead.attribution.utm_source, lead.context.source]
    .map((value) => text(value, 100).toLowerCase());
  if (values.some((value) => value === "google")) return "google";
  if (values.some((value) => value === "bing")) return "bing";
  if (values.some((value) => value === "chatgpt" || value === "openai")) return "chatgpt";
  if (values.some((value) => value === "instagram" || value === "ig")) return "instagram";
  if (values.some((value) => value === "referral" || value === "partner" || value === "client")) return "referral";
  if (values.some((value) => value === "direct" || value === "(direct)")) return "direct";
  if (values.every((value) => !value)) return "unknown";
  return "other";
}

function submissionId(submission, data) {
  const providerId = text(submission?.id, 300);
  if (providerId) return `netlify:${providerId}`;
  const fingerprint = [
    text(submission?.created_at, 80),
    text(submission?.form_name || data["form-name"], 160),
    text(data.contact, 320),
    text(data.message, 4000),
  ].join("\u0000");
  return `netlify:fingerprint:${createHash("sha256").update(fingerprint).digest("hex")}`;
}

export function isExplicitlyExcludedSubmission(submission) {
  const data = submissionData(submission);
  if (submission?.spam === true || text(submission?.state).toLowerCase() === "spam") return "provider_spam";
  if (text(data["bot-field"])) return "honeypot";
  if (text(data.subject).toLowerCase() === "internal little fight nyc test — not a lead") return "internal_test";
  return null;
}

export function normalizeNetlifySubmission(submission, importedAt = new Date().toISOString()) {
  const data = submissionData(submission);
  const receivedAt = safeTimestamp(submission?.created_at, importedAt);
  const exclusionReason = isExplicitlyExcludedSubmission(submission);
  return {
    id: submissionId(submission, data),
    origin: {
      type: "netlify_form",
      providerSubmissionId: text(submission?.id, 300) || null,
      formName: text(submission?.form_name || data["form-name"], 160) || "unknown",
    },
    receivedAt,
    importedAt: safeTimestamp(importedAt),
    stage: "new",
    stageHistory: [{ stage: "new", at: receivedAt, source: "provider_receipt" }],
    context: pick(data, CONTEXT_FIELDS),
    attribution: pick(data, ATTRIBUTION_FIELDS),
    contact: normalizedContact(data),
    knownValue: null,
    exclusion: exclusionReason ? { reason: exclusionReason, at: safeTimestamp(importedAt) } : null,
  };
}

export function createManualLead({ channel, receivedAt, context = {}, attribution = {}, contact = {}, knownValue = null, id = randomUUID() }) {
  const method = text(channel, 40).toLowerCase();
  if (!new Set(["call", "text", "email"]).has(method)) throw new Error("Manual leads require channel call, text, or email.");
  const at = safeTimestamp(receivedAt);
  const numericValue = knownValue === null || knownValue === undefined || knownValue === "" ? null : Number(knownValue);
  if (numericValue !== null && (!Number.isFinite(numericValue) || numericValue < 0)) throw new Error("Known value must be a non-negative number.");
  return {
    id: `manual:${id}`,
    origin: { type: "manual", channel: method },
    receivedAt: at,
    importedAt: at,
    stage: "new",
    stageHistory: [{ stage: "new", at, source: "manual_entry" }],
    context: pick(context, CONTEXT_FIELDS),
    attribution: pick(attribution, ATTRIBUTION_FIELDS),
    contact: pick(contact, CONTACT_FIELDS),
    knownValue: numericValue,
    exclusion: null,
  };
}

export function emptyLedger(now = new Date().toISOString()) {
  return { schemaVersion: 1, createdAt: safeTimestamp(now), updatedAt: safeTimestamp(now), leads: [] };
}

export function validateLedger(ledger) {
  if (!ledger || ledger.schemaVersion !== 1 || !Array.isArray(ledger.leads)) throw new Error("Lead ledger is not a supported schema.");
  const ids = new Set();
  for (const lead of ledger.leads) {
    if (!lead || typeof lead.id !== "string" || !lead.id || ids.has(lead.id)) throw new Error("Lead ledger contains an invalid or duplicate lead id.");
    if (!LEAD_STAGES.includes(lead.stage)) throw new Error(`Lead ${lead.id} has an invalid stage.`);
    ids.add(lead.id);
  }
  return ledger;
}

export function mergeNetlifySubmissions(ledger, submissions, importedAt = new Date().toISOString()) {
  validateLedger(ledger);
  if (!Array.isArray(submissions)) throw new Error("Provider submissions must be an array.");
  const byId = new Map(ledger.leads.map((lead) => [lead.id, lead]));
  let added = 0;
  let updated = 0;
  for (const submission of submissions) {
    const imported = normalizeNetlifySubmission(submission, importedAt);
    const existing = byId.get(imported.id);
    if (!existing) {
      ledger.leads.push(imported);
      byId.set(imported.id, imported);
      added += 1;
      continue;
    }
    // A provider re-import may refresh intake fields, but never overwrites an
    // operator's sales stage, history, value, or manual exclusion decision.
    existing.importedAt = imported.importedAt;
    existing.context = imported.context;
    existing.attribution = imported.attribution;
    existing.contact = imported.contact;
    if (!existing.exclusion && imported.exclusion) existing.exclusion = imported.exclusion;
    updated += 1;
  }
  ledger.updatedAt = safeTimestamp(importedAt);
  return { ledger, added, updated };
}

export function updateLeadStage(ledger, id, stage, at = new Date().toISOString(), knownValue) {
  validateLedger(ledger);
  if (!LEAD_STAGES.includes(stage)) throw new Error(`Stage must be one of: ${LEAD_STAGES.join(", ")}.`);
  const lead = ledger.leads.find((candidate) => candidate.id === id);
  if (!lead) throw new Error("No lead exists with that id.");
  const timestamp = safeTimestamp(at);
  if (knownValue !== undefined) {
    const numericValue = knownValue === "" || knownValue === null ? null : Number(knownValue);
    if (numericValue !== null && (!Number.isFinite(numericValue) || numericValue < 0)) throw new Error("Known value must be a non-negative number.");
    lead.knownValue = numericValue;
  }
  if (lead.stage !== stage) {
    lead.stage = stage;
    lead.stageHistory.push({ stage, at: timestamp, source: "operator" });
  }
  ledger.updatedAt = timestamp;
  return lead;
}

export function setLeadExclusion(ledger, id, reason, at = new Date().toISOString()) {
  validateLedger(ledger);
  const lead = ledger.leads.find((candidate) => candidate.id === id);
  if (!lead) throw new Error("No lead exists with that id.");
  const normalizedReason = text(reason, 160);
  if (!normalizedReason) throw new Error("An exclusion reason is required.");
  lead.exclusion = { reason: normalizedReason, at: safeTimestamp(at) };
  ledger.updatedAt = safeTimestamp(at);
  return lead;
}

export function clearLeadExclusion(ledger, id, at = new Date().toISOString()) {
  validateLedger(ledger);
  const lead = ledger.leads.find((candidate) => candidate.id === id);
  if (!lead) throw new Error("No lead exists with that id.");
  lead.exclusion = null;
  ledger.updatedAt = safeTimestamp(at);
  return lead;
}

export function leadSummary(ledger) {
  validateLedger(ledger);
  const included = ledger.leads.filter((lead) => !lead.exclusion);
  const stages = Object.fromEntries(LEAD_STAGES.map((stage) => [stage, 0]));
  const origins = {};
  const sources = {};
  const intents = {};
  for (const lead of included) {
    stages[lead.stage] += 1;
    const origin = lead.origin.type === "manual" ? lead.origin.channel : "netlify_form";
    origins[origin] = (origins[origin] || 0) + 1;
    const source = sourceBucket(lead);
    const intent = intentBucket(lead.context.intent);
    sources[source] = (sources[source] || 0) + 1;
    intents[intent] = (intents[intent] || 0) + 1;
  }
  const wonValue = included.filter((lead) => lead.stage === "won").reduce((sum, lead) => sum + (lead.knownValue || 0), 0);
  return {
    received: included.length,
    excluded: ledger.leads.length - included.length,
    stages,
    origins,
    sources,
    intents,
    wonValue,
  };
}

export function leadList(ledger) {
  validateLedger(ledger);
  return ledger.leads
    .map((lead) => ({
      id: lead.id,
      receivedAt: lead.receivedAt,
      stage: lead.stage,
      excluded: Boolean(lead.exclusion),
      exclusionReason: lead.exclusion?.reason || null,
      origin: lead.origin.type === "manual" ? lead.origin.channel : "netlify_form",
      formName: lead.origin.formName || null,
    }))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

function csvCell(value) {
  const textValue = value === null || value === undefined ? "" : String(value);
  // Spreadsheet programs may evaluate a cell that starts with these characters
  // as a formula. Preserve the visible value while making it literal text.
  const literal = /^[=+\-@\t\r]/.test(textValue) ? `'${textValue}` : textValue;
  return `"${literal.replaceAll('"', '""')}"`;
}

export function ledgerCsv(ledger) {
  validateLedger(ledger);
  const columns = [
    "id", "received_at", "stage", "stage_updated_at", "excluded_reason", "excluded_at",
    "origin_type", "origin_channel", "form_name", "provider_submission_id", "known_value",
    "intent", "source", "lead_origin", "placement", "tile", "discovery_source", "follow_up",
    ...ATTRIBUTION_FIELDS,
    "name", "business", "contact", "email", "phone", "website_url", "report_id", "symptom", "urgency", "message",
  ];
  const rows = ledger.leads.map((lead) => {
    const latest = lead.stageHistory.at(-1);
    const values = {
      id: lead.id,
      received_at: lead.receivedAt,
      stage: lead.stage,
      stage_updated_at: latest?.at || "",
      excluded_reason: lead.exclusion?.reason || "",
      excluded_at: lead.exclusion?.at || "",
      origin_type: lead.origin.type,
      origin_channel: lead.origin.channel || "",
      form_name: lead.origin.formName || "",
      provider_submission_id: lead.origin.providerSubmissionId || "",
      known_value: lead.knownValue,
      ...lead.context,
      ...lead.attribution,
      ...lead.contact,
    };
    return columns.map((column) => csvCell(values[column])).join(",");
  });
  return `${columns.map(csvCell).join(",")}\n${rows.join("\n")}\n`;
}
