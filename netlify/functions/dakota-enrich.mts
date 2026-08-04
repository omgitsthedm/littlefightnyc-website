import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { createHash } from "node:crypto";

import { getDakotaAuthorization } from "./_shared/dakota/auth";
import {
  DAKOTA_BLOB_STORE,
  DAKOTA_QUEUE_KEY,
} from "./_shared/dakota/constants";
import { enrichDakotaCandidate } from "./_shared/dakota/enrichment";
import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import {
  DAKOTA_OPERATOR_BLOB_KEY,
  DAKOTA_OPERATOR_BLOB_STORE,
} from "./_shared/dakota/operator-state-constants";
import {
  isDakotaCandidateKey,
  type DakotaOperatorRecord,
  validateDakotaOperatorStateEnvelope,
} from "./_shared/dakota/operator-state-schema";
import {
  type DakotaCandidate,
  validateQueuePayload,
} from "./_shared/dakota/queue-schema";
import {
  DAKOTA_REVENUE_BRIDGE_STORE,
  type DakotaRevenueBridgeServerMutation,
} from "./_shared/dakota/revenue-bridge-schema";
import {
  applyDakotaRevenueBridgeServerMutations,
  loadDakotaRevenueBridgeState,
} from "./_shared/dakota/revenue-bridge-store";

const MAX_BODY_BYTES = 4 * 1024;

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function keyForCandidate(candidate: DakotaCandidate): string {
  return `${candidate.source}:${candidate.source_id}`.trim().toLowerCase();
}

function candidateFromOperator(record: DakotaOperatorRecord, candidateKey: string): DakotaCandidate {
  const separator = candidateKey.lastIndexOf(":");
  return {
    rank: 1,
    score: 0,
    business_name: record.identity.businessName,
    dba: record.identity.dba ?? "",
    source: record.identity.source || candidateKey.slice(0, separator),
    source_id: record.identity.sourceId || candidateKey.slice(separator + 1),
    filed_at: "",
    category: record.identity.category ?? "",
    phone: record.contacts.find((contact) => contact.channel === "phone")?.value ?? "",
    address: "",
    city: record.identity.city ?? "",
    state: "NY",
    postal_code: "",
    county_or_borough: record.identity.borough ?? "",
    verified_url: record.identity.verifiedUrl ?? "",
    domain_status: "",
    psi_status: "not_run",
    psi_mobile_performance: null,
    missing_pieces: "",
    diagnosis: "",
    score_version: "operator-state-v3",
    score_reasons: "",
  };
}

async function resolveCandidate(candidateKey: string): Promise<DakotaCandidate | null> {
  const [queueResult, operatorResult] = await Promise.all([
    getStore({ name: DAKOTA_BLOB_STORE, consistency: "strong" }).getWithMetadata(
      DAKOTA_QUEUE_KEY,
      { type: "json", consistency: "strong" },
    ),
    getStore({ name: DAKOTA_OPERATOR_BLOB_STORE, consistency: "strong" }).getWithMetadata(
      DAKOTA_OPERATOR_BLOB_KEY,
      { type: "json", consistency: "strong" },
    ),
  ]);

  if (queueResult) {
    const queue = validateQueuePayload(queueResult.data);
    if (!queue.valid) throw new Error("invalid_queue");
    const candidate = queue.payload.records.find((item) => keyForCandidate(item) === candidateKey);
    if (candidate) return candidate;
  }

  if (operatorResult) {
    const operator = validateDakotaOperatorStateEnvelope(operatorResult.data);
    if (!operator.valid) throw new Error("invalid_operator_state");
    const record = operator.value.records[candidateKey];
    if (record) return candidateFromOperator(record, candidateKey);
  }
  return null;
}

function bridgePublicUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const hadQuery = Boolean(url.search);
    url.search = "";
    url.hash = "";
    if (hadQuery && ["/", "/maps", "/maps/"].includes(url.pathname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function evidenceId(providerId: string, fact: string): string {
  return createHash("sha256").update(`${providerId}\u0000${fact}`).digest("hex").slice(0, 32);
}

function healthForStatus(status: "connected" | "not_configured" | "unavailable") {
  if (status === "connected") return "healthy" as const;
  if (status === "not_configured") return "blocked" as const;
  return "degraded" as const;
}

export default async function dakotaEnrich(
  request: Request,
  _context: Context,
): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);
  if (new URL(request.url).search !== "") {
    return privateJson({ error: "Dakota enrichment does not accept query parameters." }, 400);
  }

  let authorization;
  try {
    authorization = await getDakotaAuthorization();
  } catch {
    return privateJson({ error: "Dakota authorization is temporarily unavailable." }, 503);
  }
  if (!authorization.allowed) {
    return privateJson(
      { error: authorization.status === 401 ? "Authentication required." : "Forbidden." },
      authorization.status,
    );
  }
  if (!sameOrigin(request)) return privateJson({ error: "A same-origin request is required." }, 403);
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return privateJson({ error: "Content-Type must be application/json." }, 415);
  }

  try {
    const raw = new Uint8Array(await request.arrayBuffer());
    if (raw.byteLength === 0 || raw.byteLength > MAX_BODY_BYTES) {
      return privateJson({ error: "Dakota enrichment request has an invalid size." }, 413);
    }
    const body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)) as unknown;
    if (
      !isRecord(body) ||
      Object.keys(body).length !== 1 ||
      !isDakotaCandidateKey(body.candidate_key)
    ) {
      return privateJson({ error: "Dakota enrichment request has an invalid shape." }, 422);
    }
    const candidateKey = body.candidate_key;
    const candidate = await resolveCandidate(candidateKey);
    if (!candidate) return privateJson({ error: "Dakota candidate was not found." }, 404);

    const result = await enrichDakotaCandidate(candidate);
    const bridgeStore = getStore({ name: DAKOTA_REVENUE_BRIDGE_STORE, consistency: "strong" });
    const current = await loadDakotaRevenueBridgeState(bridgeStore);
    const existingEvidenceIds = new Set(
      current.envelope?.records[candidateKey]?.evidence.map((item) => item.evidence_id) ?? [],
    );
    const mutations: DakotaRevenueBridgeServerMutation[] = result.providers.map((provider) => ({
      type: "update_provider",
      provider_state: {
        provider: provider.provider,
        health: healthForStatus(provider.status),
        detail: provider.status === "connected"
          ? `${provider.matchCount} provider match${provider.matchCount === 1 ? "" : "es"} returned for operator review.`
          : provider.status === "not_configured"
            ? `${provider.provider === "google_places" ? "Google Places" : "Yelp"} API access is not configured.`
            : `${provider.provider === "google_places" ? "Google Places" : "Yelp"} is temporarily unavailable.`,
        cursor: null,
        checked_at: provider.checkedAt,
        consecutive_failures: provider.status === "unavailable" ? 1 : 0,
      },
    }));
    let evidenceAdded = 0;
    for (const evidence of result.evidence) {
      const id = evidenceId(evidence.evidenceId, evidence.fact);
      if (existingEvidenceIds.has(id)) continue;
      evidenceAdded += 1;
      mutations.push({
        type: "append_evidence",
        candidate_key: candidateKey,
        evidence: {
          evidence_id: id,
          provider: evidence.source,
          kind: "public_profile",
          summary: evidence.fact.slice(0, 1_000),
          public_url: bridgePublicUrl(evidence.sourceUrl),
          external_ref: evidence.evidenceId,
          observed_at: evidence.capturedAt,
        },
      });
    }

    const persisted = await applyDakotaRevenueBridgeServerMutations(mutations, {
      getStore: () => bridgeStore,
    });
    if (persisted.outcome !== "stored" && persisted.outcome !== "unchanged") {
      const status = persisted.outcome === "capacity"
        ? 507
        : persisted.outcome === "conflict" || persisted.outcome === "version_conflict"
          ? 409
          : 422;
      return privateJson({ error: persisted.error }, status);
    }

    return privateJson({
      schema_version: "dakota.enrichment.v1",
      candidate_key: candidateKey,
      checked_at: result.checkedAt,
      providers: result.providers.map((provider) => ({
        provider: provider.provider,
        status: provider.status,
        match_count: provider.matchCount,
      })),
      evidence_added: evidenceAdded,
      record: persisted.envelope.records[candidateKey] ?? null,
    });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return privateJson({ error: "Dakota enrichment request must be valid UTF-8 JSON." }, 400);
    }
    return privateJson({ error: "Dakota enrichment is temporarily unavailable." }, 503);
  }
}

export const config: Config = {
  path: "/api/dakota/enrich",
};
