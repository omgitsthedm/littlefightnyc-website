import { createHash } from "node:crypto";

import type { Store } from "@netlify/blobs";

import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  DAKOTA_OPERATOR_RECORD_LIMIT,
  DAKOTA_OPERATOR_STATE_MAX_BYTES,
  DAKOTA_OPERATOR_STATE_SCHEMA,
  type DakotaOperatorRecord,
  type DakotaOperatorRecordInput,
  type DakotaOperatorStateEnvelope,
  validateDakotaOperatorRecordInput,
  validateDakotaOperatorPutPayload,
  validateDakotaOperatorStateEnvelope,
} from "./operator-state-schema.ts";
import {
  DAKOTA_OPERATOR_BLOB_KEY,
  DAKOTA_OPERATOR_BLOB_STORE,
} from "./operator-state-constants.ts";

export const DAKOTA_TECH_AUDIT_FORM = "tech-audit-scratch" as const;
export const DAKOTA_TECH_AUDIT_SOURCE = "inbound:tech-audit" as const;
export const DAKOTA_WEBSITE_AUDIT_SOURCE = "inbound:website-audit" as const;

const TECH_AUDIT_FORM_URL = "https://littlefightnyc.com/tech-audit/";
const WEBSITE_AUDIT_FORM_URL = "https://littlefightnyc.com/examples/audit/";
const MAX_WRITE_ATTEMPTS = 5;
const ISO_TIMESTAMP = /(?:Z|[+-]\d{2}:\d{2})$/u;
const SAFE_SOURCE_ID = /^[a-z0-9][a-z0-9._-]{7,127}$/u;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}$/u;
const PHONE = /^\+?[0-9().\s-]{7,32}$/u;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu;
const HTML_ENTITIES = /&(?:lt|gt|amp|quot|apos|#(?:x[0-9a-f]+|[0-9]+));/giu;
const URL_TOKEN = /(?:\b(?:https?|ftp|file|data|javascript|mailto):\S*|\bwww\.\S+|\S+:\/\/\S*)/giu;

type FollowUpPreference = "text" | "phone" | "email" | "fastest";

export interface DakotaInboundCandidate {
  candidateKey: string;
  record: DakotaOperatorRecordInput;
}

export interface WebsiteAuditInboundInput {
  email: string;
  domain: string;
  company?: string;
  reportId?: string;
  jobId?: string;
  submittedAt: string;
  source: string;
}

export type DakotaInboundStore = Pick<Store, "getWithMetadata" | "setJSON">;

export interface DakotaInboundDependencies {
  getStore: () => DakotaInboundStore;
  now?: () => Date;
}

export type DakotaInboundPersistResult =
  | { outcome: "stored"; candidateKey: string }
  | { outcome: "duplicate"; candidateKey: string }
  | { outcome: "capacity"; candidateKey: string }
  | { outcome: "conflict"; candidateKey: string };

interface LoadedState {
  envelope: DakotaOperatorStateEnvelope | null;
  etag: string | null;
}

class InvalidInboundStateError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rawField(data: Record<string, unknown>, key: string, maximumLength: number): string {
  const value = data[key];
  if (typeof value !== "string") return "";
  return value.slice(0, maximumLength).trim();
}

/**
 * Dakota's private schema intentionally rejects HTML and URL-like prose.
 * Keep user language readable while moving a submitted website into the
 * dedicated URL field and discarding executable or provider-shaped content.
 */
function boundedPlainText(value: string, maximumLength: number): string {
  return value
    .replace(CONTROL_CHARACTERS, " ")
    .replace(HTML_ENTITIES, " ")
    .replace(/[<>]/gu, " ")
    .replace(URL_TOKEN, "[link omitted]")
    .replace(/[\t ]+/gu, " ")
    .replace(/\n{3,}/gu, "\n\n")
    .trim()
    .slice(0, maximumLength)
    .trim();
}

function validTimestamp(value: string): string | null {
  if (!value || value.length > 64 || !ISO_TIMESTAMP.test(value)) return null;
  return Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}

function normalizedTimestamp(value: string, now: Date): string {
  const parsed = validTimestamp(value);
  if (!parsed) return now.toISOString();
  const distance = Math.abs(Date.parse(parsed) - now.getTime());
  return distance <= 7 * 24 * 60 * 60 * 1_000 ? parsed : now.toISOString();
}

function normalizedSourceId(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return SAFE_SOURCE_ID.test(normalized) ? normalized : null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function deterministicUuid(seed: string): string {
  const digest = sha256(seed);
  return [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `5${digest.slice(13, 16)}`,
    `a${digest.slice(17, 20)}`,
    digest.slice(20, 32),
  ].join("-");
}

function fallbackId(source: string, fields: readonly string[]): string {
  return `fallback-${sha256(JSON.stringify([source, ...fields])).slice(0, 32)}`;
}

function emptyCommercialClose(): DakotaOperatorRecordInput["commercialClose"] {
  return {
    proposalRef: "",
    proposalAmount: null,
    proposalSentDate: "",
    signedDate: "",
    invoiceRef: "",
    amountDue: null,
    amountPaid: null,
    paidDate: "",
    balance: null,
    onboardingNextAction: "",
  };
}

function validPublicHttpsUrl(value: string): string | null {
  if (!value || value.length > 2_048 || /[\s<>]/u.test(value)) return null;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/u, "");
    const blocked =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".test") ||
      hostname.endsWith(".invalid") ||
      hostname.endsWith(".example");
    const ipLiteral = /^(?:\d{1,3}\.){3}\d{1,3}$/u.test(hostname) || hostname.includes(":");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !hostname.includes(".") ||
      blocked ||
      ipLiteral ||
      (url.port && url.port !== "443")
    ) {
      return null;
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function parseContact(value: string): { channel: "email" | "phone"; value: string } | null {
  const contact = value.trim();
  if (EMAIL.test(contact)) return { channel: "email", value: contact.toLowerCase() };
  if (PHONE.test(contact)) return { channel: "phone", value: contact };
  return null;
}

function followUpPreference(value: string): FollowUpPreference {
  if (value === "text" || value === "phone" || value === "email" || value === "fastest") {
    return value;
  }
  return "fastest";
}

function followUpLabel(value: FollowUpPreference): string {
  switch (value) {
    case "text": return "text message";
    case "phone": return "phone call";
    case "email": return "email";
    case "fastest": return "fastest available channel";
  }
}

function intentOfferFit(intent: string): string {
  switch (intent) {
    case "website": return "Website rebuild or conversion improvement.";
    case "support": return "Website support and repair.";
    case "consulting": return "Digital consulting.";
    case "systems": return "Business systems integration.";
    default: return "Needs a human offer-fit review.";
  }
}

function createValidatedCandidate(
  source: typeof DAKOTA_TECH_AUDIT_SOURCE | typeof DAKOTA_WEBSITE_AUDIT_SOURCE,
  sourceId: string,
  record: DakotaOperatorRecordInput,
): DakotaInboundCandidate | null {
  const validation = validateDakotaOperatorRecordInput(record);
  if (!validation.valid) return null;
  return {
    candidateKey: `${source}:${sourceId}`,
    record: validation.value,
  };
}

export function createTechAuditInboundCandidate(
  data: unknown,
  now = new Date(),
): DakotaInboundCandidate | null {
  if (!isRecord(data) || rawField(data, "form-name", 64) !== DAKOTA_TECH_AUDIT_FORM) {
    return null;
  }
  if (rawField(data, "bot-field", 256)) return null;

  const name = boundedPlainText(rawField(data, "name", 512), 160);
  const businessName = boundedPlainText(rawField(data, "business", 512), 240);
  const contact = parseContact(rawField(data, "contact", 512));
  const message = boundedPlainText(rawField(data, "message", 8_192), 1_900);
  if (!name || !businessName || !contact || !message) return null;

  const preference = followUpPreference(rawField(data, "follow_up", 32));
  const intent = boundedPlainText(rawField(data, "intent", 64).toLowerCase(), 32);
  const symptom = boundedPlainText(rawField(data, "symptom", 512), 160);
  const urgency = boundedPlainText(rawField(data, "urgency", 256), 120);
  const leadOrigin = boundedPlainText(rawField(data, "lead_origin", 512), 160);
  const reportId = boundedPlainText(rawField(data, "report_id", 512), 200);
  const rawSubmittedAt = rawField(data, "dakota_submitted_at", 128);
  const submittedAt = normalizedTimestamp(rawSubmittedAt, now);
  const suppliedCaptureId = normalizedSourceId(rawField(data, "dakota_capture_id", 256));
  const sourceId = suppliedCaptureId ?? fallbackId(DAKOTA_TECH_AUDIT_SOURCE, [
    name,
    businessName,
    contact.value,
    message,
    validTimestamp(rawSubmittedAt) ?? "timestamp-not-supplied",
  ]);
  const candidateKey = `${DAKOTA_TECH_AUDIT_SOURCE}:${sourceId}`;
  const activityId = deterministicUuid(`${candidateKey}:received`);
  const contactId = deterministicUuid(`${candidateKey}:contact:${contact.channel}:${contact.value}`);

  const attribution: string[] = [];
  if (intent) attribution.push(`Intent: ${intent}.`);
  if (leadOrigin) attribution.push(`Lead origin: ${leadOrigin}.`);
  for (const [field, label] of [
    ["utm_source", "UTM source"],
    ["utm_medium", "UTM medium"],
    ["utm_campaign", "UTM campaign"],
    ["utm_term", "UTM term"],
    ["utm_content", "UTM content"],
  ] as const) {
    const value = boundedPlainText(rawField(data, field, 512), 160);
    if (value) attribution.push(`${label}: ${value}.`);
  }
  if (["gclid", "gbraid", "wbraid"].some((field) => rawField(data, field, 512))) {
    attribution.push("Paid-click marker supplied; raw provider token was not retained.");
  }

  const painParts = [`Self-reported: ${message}`];
  if (symptom) painParts.push(`Reported symptom: ${symptom}.`);
  if (urgency) painParts.push(`Reported timing: ${urgency}.`);
  const websiteUrl = validPublicHttpsUrl(rawField(data, "website_url", 2_048));
  const proof = boundedPlainText([
    "Verified Netlify Tech Audit form submission.",
    `Capture ID: ${sourceId}.`,
    `Submitted: ${submittedAt}.`,
    `Requested follow-up: ${followUpLabel(preference)}.`,
    reportId ? `Related report: ${reportId}.` : "",
    ...attribution,
  ].filter(Boolean).join(" "), 4_000);

  const record: DakotaOperatorRecordInput = {
    identity: {
      businessName,
      category: "Consented Tech Audit inquiry",
      source: DAKOTA_TECH_AUDIT_SOURCE,
      sourceId,
      publicSourceUrl: websiteUrl ?? TECH_AUDIT_FORM_URL,
    },
    status: "research_ready",
    notes: `Inbound Tech Audit request from ${name}. Requested follow-up: ${followUpLabel(preference)}.`,
    verifiedPain: boundedPlainText(painParts.join(" "), 2_000),
    offerFit: intentOfferFit(intent),
    nextAction: "Review this consented inquiry and reply manually through the requested channel.",
    dueDate: submittedAt.slice(0, 10),
    estimatedValue: null,
    actualRevenue: null,
    winLossReason: "",
    proof,
    draft: "",
    contacts: [{
      contactId,
      name,
      role: "Inquiry submitter",
      channel: contact.channel,
      value: contact.value,
      sourceUrl: TECH_AUDIT_FORM_URL,
      verifiedAt: submittedAt.slice(0, 10),
      consentClassification: "explicit_inquiry",
    }],
    activities: [{
      activityId,
      channel: "internal",
      type: "note",
      outcome: "recorded",
      note: `Consented Tech Audit request received. Follow-up preference: ${followUpLabel(preference)}. No outreach was sent.`,
      occurredAt: submittedAt,
      followUpAt: null,
    }],
    commercialClose: emptyCommercialClose(),
  };

  return createValidatedCandidate(DAKOTA_TECH_AUDIT_SOURCE, sourceId, record);
}

function normalizedDomain(value: string): string | null {
  const candidate = value.trim().toLowerCase().replace(/^https?:\/\//u, "").split(/[/?#]/u, 1)[0] ?? "";
  const hostname = candidate.replace(/^www\./u, "").replace(/\.$/u, "");
  if (
    hostname.length === 0 ||
    hostname.length > 253 ||
    !hostname.includes(".") ||
    !/^[a-z0-9.-]+$/u.test(hostname) ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid") ||
    hostname.endsWith(".example") ||
    /^(?:\d{1,3}\.){3}\d{1,3}$/u.test(hostname) ||
    hostname.split(".").some((label) => !label || label.length > 63 || label.startsWith("-") || label.endsWith("-"))
  ) {
    return null;
  }
  return hostname;
}

export function createWebsiteAuditInboundCandidate(
  input: WebsiteAuditInboundInput,
  now = new Date(),
): DakotaInboundCandidate | null {
  if (!isRecord(input)) return null;
  const contact = parseContact(typeof input.email === "string" ? input.email.slice(0, 512) : "");
  if (!contact || contact.channel !== "email") return null;
  const domain = normalizedDomain(typeof input.domain === "string" ? input.domain.slice(0, 512) : "");
  if (!domain) return null;

  const submittedAt = normalizedTimestamp(
    typeof input.submittedAt === "string" ? input.submittedAt.slice(0, 128) : "",
    now,
  );
  const company = boundedPlainText(
    typeof input.company === "string" ? input.company.slice(0, 512) : "",
    240,
  );
  const reportId = normalizedSourceId(
    typeof input.reportId === "string" ? input.reportId.slice(0, 256) : "",
  );
  const jobId = normalizedSourceId(
    typeof input.jobId === "string" ? input.jobId.slice(0, 256) : "",
  );
  const source = boundedPlainText(
    typeof input.source === "string" ? input.source.slice(0, 512) : "",
    160,
  );
  const sourceId = reportId ?? jobId ?? fallbackId(DAKOTA_WEBSITE_AUDIT_SOURCE, [
    contact.value,
    domain,
    submittedAt,
    source,
  ]);
  const candidateKey = `${DAKOTA_WEBSITE_AUDIT_SOURCE}:${sourceId}`;
  const name = company || "Website Audit requester";

  const record: DakotaOperatorRecordInput = {
    identity: {
      businessName: company || domain,
      category: "Website Audit request",
      source: DAKOTA_WEBSITE_AUDIT_SOURCE,
      sourceId,
      publicSourceUrl: WEBSITE_AUDIT_FORM_URL,
    },
    status: "research_ready",
    notes: `Consented Website Audit request for ${domain}. Consent is limited to report delivery and direct follow-up about this request.`,
    verifiedPain: `Self-reported need: requested a Website Audit for ${domain}.`,
    offerFit: "Website Audit delivery and human review.",
    nextAction: "Review the generated report, then manually deliver only the requested audit follow-up.",
    dueDate: submittedAt.slice(0, 10),
    estimatedValue: null,
    actualRevenue: null,
    winLossReason: "",
    proof: boundedPlainText([
      "Verified Website Audit request.",
      `Capture ID: ${sourceId}.`,
      `Submitted: ${submittedAt}.`,
      reportId ? `Report ID: ${reportId}.` : "",
      jobId ? `Job ID: ${jobId}.` : "",
      source ? `Request source: ${source}.` : "",
      "Raw request metadata and network identifiers were not retained.",
    ].filter(Boolean).join(" "), 4_000),
    draft: "",
    contacts: [{
      contactId: deterministicUuid(`${candidateKey}:contact:email:${contact.value}`),
      name,
      role: "Audit requester",
      channel: "email",
      value: contact.value,
      sourceUrl: WEBSITE_AUDIT_FORM_URL,
      verifiedAt: submittedAt.slice(0, 10),
      consentClassification: "explicit_inquiry",
    }],
    activities: [{
      activityId: deterministicUuid(`${candidateKey}:received`),
      channel: "internal",
      type: "note",
      outcome: "recorded",
      note: "Website Audit request received. Consent covers report delivery and direct follow-up about this request only. No outreach was sent.",
      occurredAt: submittedAt,
      followUpAt: null,
    }],
    commercialClose: emptyCommercialClose(),
  };

  return createValidatedCandidate(DAKOTA_WEBSITE_AUDIT_SOURCE, sourceId, record);
}

async function loadState(store: DakotaInboundStore): Promise<LoadedState> {
  const result = await store.getWithMetadata(DAKOTA_OPERATOR_BLOB_KEY, { type: "json" });
  if (!result) return { envelope: null, etag: null };
  if (!result.etag) throw new InvalidInboundStateError("Stored Dakota state has no ETag.");
  const validation = validateDakotaOperatorStateEnvelope(result.data);
  if (!validation.valid) throw new InvalidInboundStateError("Stored Dakota state is invalid.");
  return { envelope: validation.value, etag: result.etag };
}

function emptyRecords(): Record<string, DakotaOperatorRecord> {
  return Object.create(null) as Record<string, DakotaOperatorRecord>;
}

export async function persistDakotaInboundCandidate(
  candidate: DakotaInboundCandidate,
  dependencies: DakotaInboundDependencies,
): Promise<DakotaInboundPersistResult> {
  const candidateValidation = validateDakotaOperatorPutPayload({
    candidate_key: candidate.candidateKey,
    record: candidate.record,
  });
  if (!candidateValidation.valid) {
    throw new InvalidInboundStateError("Generated Dakota inbound candidate is invalid.");
  }
  const safeCandidate: DakotaInboundCandidate = {
    candidateKey: candidateValidation.value.candidate_key,
    record: candidateValidation.value.record,
  };
  const store = dependencies.getStore();
  const updatedAt = (dependencies.now ?? (() => new Date()))().toISOString();

  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const current = await loadState(store);
    const existingRecords = current.envelope?.records ?? emptyRecords();
    if (Object.hasOwn(existingRecords, safeCandidate.candidateKey)) {
      return { outcome: "duplicate", candidateKey: safeCandidate.candidateKey };
    }
    if (Object.keys(existingRecords).length >= DAKOTA_OPERATOR_RECORD_LIMIT) {
      return { outcome: "capacity", candidateKey: safeCandidate.candidateKey };
    }

    const record = createDakotaOperatorRecord(safeCandidate.record, updatedAt);
    const records = { ...existingRecords, [safeCandidate.candidateKey]: record };
    const envelope = createDakotaOperatorStateEnvelope(records, updatedAt);
    if (new TextEncoder().encode(JSON.stringify(envelope)).byteLength > DAKOTA_OPERATOR_STATE_MAX_BYTES) {
      return { outcome: "capacity", candidateKey: safeCandidate.candidateKey };
    }
    const validation = validateDakotaOperatorStateEnvelope(envelope);
    if (!validation.valid) throw new InvalidInboundStateError("Generated Dakota state is invalid.");

    const metadata = {
      schemaVersion: DAKOTA_OPERATOR_STATE_SCHEMA,
      recordCount: Object.keys(records).length,
      updatedAt,
      lastWrite: "consented-inbound",
    };
    const result = await store.setJSON(
      DAKOTA_OPERATOR_BLOB_KEY,
      validation.value,
      current.etag
        ? { metadata, onlyIfMatch: current.etag }
        : { metadata, onlyIfNew: true },
    );
    if (result.modified) {
      return { outcome: "stored", candidateKey: safeCandidate.candidateKey };
    }
  }

  return { outcome: "conflict", candidateKey: safeCandidate.candidateKey };
}

export async function captureTechAuditInbound(
  data: unknown,
  dependencies: DakotaInboundDependencies,
): Promise<DakotaInboundPersistResult | null> {
  const receivedAt = (dependencies.now ?? (() => new Date()))();
  const candidate = createTechAuditInboundCandidate(data, receivedAt);
  if (!candidate) return null;
  return persistDakotaInboundCandidate(candidate, { ...dependencies, now: () => receivedAt });
}

export async function captureWebsiteAuditInbound(
  input: WebsiteAuditInboundInput,
  dependencies: DakotaInboundDependencies,
): Promise<DakotaInboundPersistResult | null> {
  const receivedAt = (dependencies.now ?? (() => new Date()))();
  const candidate = createWebsiteAuditInboundCandidate(input, receivedAt);
  if (!candidate) return null;
  return persistDakotaInboundCandidate(candidate, { ...dependencies, now: () => receivedAt });
}

export function isSuccessfulInboundResult(
  result: DakotaInboundPersistResult | null,
): boolean {
  return result === null || result.outcome === "stored" || result.outcome === "duplicate";
}

export { DAKOTA_OPERATOR_BLOB_STORE };
