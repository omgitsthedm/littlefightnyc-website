import { describe, expect, it } from "vitest";

import {
  createDakotaRevenueBridgeEnvelope,
  createEmptyDakotaRevenueBridgeRecord,
  DAKOTA_REVENUE_BRIDGE_EVIDENCE_LIMIT,
  DAKOTA_REVENUE_BRIDGE_SCHEMA,
  isCompatiblePrivateOffer,
  validateDakotaRevenueBridgeEnvelope,
  validateDakotaRevenueBridgePutPayload,
  validateDakotaRevenueBridgeRecord,
  validateDakotaRevenueBridgeServerMutation,
  type DakotaRevenueBridgeEnvelope,
  type DakotaRevenueBridgeRecord,
} from "./revenue-bridge-schema";

const CANDIDATE_KEY = "website_audit:report-12345678";
const OBSERVED_AT = "2026-08-03T10:00:00.000Z";
const GENERATED_AT = "2026-08-03T10:30:00.000Z";
const UPDATED_AT = "2026-08-03T12:00:00.000Z";

function completeRecord(): DakotaRevenueBridgeRecord {
  return {
    research_review: {
      disposition: "pursue",
      reason: "The measured need matches a bounded offer.",
      reviewed_at: UPDATED_AT,
    },
    evidence: [{
      evidence_id: "evidence:website-audit:123",
      provider: "website_audit",
      kind: "website_audit",
      summary: "The report measured a slow customer path.",
      public_url: "https://example.com/report/123",
      external_ref: "report-12345678",
      observed_at: OBSERVED_AT,
      received_at: GENERATED_AT,
      review_state: "confirmed",
      reviewed_at: UPDATED_AT,
      review_reason: "The report and public page agree.",
    }],
    external_events: [{
      event_id: "event:gmail:123",
      provider: "gmail",
      kind: "message_received",
      summary: "A reply needs human review.",
      external_ref: "gmail-message-123",
      occurred_at: GENERATED_AT,
      received_at: UPDATED_AT,
      review_state: "needs_review",
      reviewed_at: null,
      review_reason: "",
    }],
    website_audit: {
      report_id: "report-12345678",
      domain: "example.com",
      report_url: "https://example.com/report/123",
      status: "generated",
      status_updated_at: GENERATED_AT,
      requested_at: OBSERVED_AT,
      generated_at: GENERATED_AT,
      failed_at: null,
      failure_reason: "",
      measurement_state: "complete",
      scores: { performance: 62, seo: 91, accessibility: 88, best_practices: 96 },
      overall_score: 84,
      grade: "B",
      summary: "All four Lighthouse categories were measured.",
      findings: [{
        finding_id: "finding:performance:1",
        area: "performance",
        severity: "high",
        summary: "Largest content appears late on mobile.",
      }],
      email_delivery: {
        status: "sent",
        sent_at: GENERATED_AT,
        failed_at: null,
        failure_reason: "",
        updated_at: GENERATED_AT,
      },
      engagement: {
        first_view_at: GENERATED_AT,
        last_view_at: GENERATED_AT,
        total_views: 1,
        max_scroll_depth: 80,
        max_time_on_page_seconds: 45,
        updated_at: GENERATED_AT,
      },
      reconciled_at: UPDATED_AT,
    },
    selected_offer: {
      offer_code: "ai_friction_audit",
      price_band: "usd_500_2000",
      rationale: "Start with a bounded diagnostic before implementation.",
      selected_at: UPDATED_AT,
    },
    alerts: [{
      alert_id: "alert:reply:123",
      provider: "gmail",
      kind: "new_external_event",
      severity: "warning",
      message: "A reply is waiting for human review.",
      created_at: UPDATED_AT,
      status: "open",
      acknowledged_at: null,
      resolved_at: null,
      resolution_note: "",
    }],
    archive: null,
    updated_at: UPDATED_AT,
  };
}

function completeEnvelope(): DakotaRevenueBridgeEnvelope {
  return {
    schema_version: DAKOTA_REVENUE_BRIDGE_SCHEMA,
    updated_at: UPDATED_AT,
    records: { [CANDIDATE_KEY]: completeRecord() },
    providers: {
      gmail: {
        health: "healthy",
        detail: "Last bounded poll completed.",
        cursor: "history:12345",
        checked_at: GENERATED_AT,
        cursor_updated_at: UPDATED_AT,
        consecutive_failures: 0,
        updated_at: UPDATED_AT,
      },
    },
  };
}

describe("Dakota Revenue Bridge schema", () => {
  it("validates and reconstructs a complete strict envelope", () => {
    const result = validateDakotaRevenueBridgeEnvelope(completeEnvelope());
    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.value.records[CANDIDATE_KEY]?.website_audit?.scores.performance).toBe(62);
    expect(Object.getPrototypeOf(result.value.records)).toBeNull();
    expect(Object.getPrototypeOf(result.value.providers)).toBeNull();
  });

  it("creates a bounded empty record and validates the canonical envelope factory", () => {
    const record = createEmptyDakotaRevenueBridgeRecord(UPDATED_AT);
    expect(record).toMatchObject({
      research_review: { disposition: "unreviewed", reason: "", reviewed_at: null },
      evidence: [],
      external_events: [],
      alerts: [],
      archive: null,
    });
    expect(
      createDakotaRevenueBridgeEnvelope({ [CANDIDATE_KEY]: record }, {}, UPDATED_AT),
    ).toMatchObject({ schema_version: DAKOTA_REVENUE_BRIDGE_SCHEMA, updated_at: UPDATED_AT });
  });

  it("rejects unknown fields, invalid candidate keys, and unknown providers", () => {
    const extra = { ...completeEnvelope(), raw_payload: { token: "never" } };
    expect(validateDakotaRevenueBridgeEnvelope(extra)).toEqual({
      valid: false,
      error: "Revenue Bridge envelope has an invalid shape.",
    });

    const badCandidate = completeEnvelope();
    badCandidate.records = { "__proto__": completeRecord() };
    expect(validateDakotaRevenueBridgeEnvelope(badCandidate).valid).toBe(false);

    const badProvider = completeEnvelope() as unknown as Record<string, unknown>;
    (badProvider.providers as Record<string, unknown>).unknown_provider = completeEnvelope().providers.gmail;
    expect(validateDakotaRevenueBridgeEnvelope(badProvider)).toEqual({
      valid: false,
      error: "Revenue Bridge provider key is invalid.",
    });
  });

  it("enforces research review semantics and contained timestamp ordering", () => {
    const unreviewed = completeRecord();
    unreviewed.research_review = {
      disposition: "unreviewed",
      reason: "Already decided",
      reviewed_at: UPDATED_AT,
    };
    expect(validateDakotaRevenueBridgeRecord(unreviewed).valid).toBe(false);

    const oldRecord = completeRecord();
    oldRecord.updated_at = GENERATED_AT;
    expect(validateDakotaRevenueBridgeRecord(oldRecord)).toEqual({
      valid: false,
      error: "Revenue Bridge record updated_at predates contained evidence.",
    });

    for (const disposition of ["needs_evidence", "blocked", "duplicate"] as const) {
      const reviewed = createEmptyDakotaRevenueBridgeRecord(UPDATED_AT);
      reviewed.research_review = {
        disposition,
        reason: "This decision has an explicit human rationale.",
        reviewed_at: UPDATED_AT,
      };
      expect(validateDakotaRevenueBridgeRecord(reviewed).valid).toBe(true);
    }
  });

  it("keeps evidence bounded, append-addressable, secret-free, and public-URL safe", () => {
    const duplicate = completeRecord();
    duplicate.evidence.push({ ...duplicate.evidence[0] });
    expect(validateDakotaRevenueBridgeRecord(duplicate)).toEqual({
      valid: false,
      error: "Evidence IDs must be unique.",
    });

    const queriedUrl = completeRecord();
    queriedUrl.evidence[0] = {
      ...queriedUrl.evidence[0],
      public_url: "https://example.com/report?token=private",
    };
    expect(validateDakotaRevenueBridgeRecord(queriedUrl).valid).toBe(false);

    const secretText = completeRecord();
    secretText.evidence[0] = {
      ...secretText.evidence[0],
      summary: "authorization: Bearer hidden-value",
    };
    expect(validateDakotaRevenueBridgeRecord(secretText).valid).toBe(false);

    const overLimit = createEmptyDakotaRevenueBridgeRecord(UPDATED_AT);
    overLimit.evidence = Array.from({ length: DAKOTA_REVENUE_BRIDGE_EVIDENCE_LIMIT + 1 }, (_, index) => ({
      ...completeRecord().evidence[0],
      evidence_id: `evidence:${index}`,
    }));
    expect(validateDakotaRevenueBridgeRecord(overLimit)).toEqual({
      valid: false,
      error: "Revenue evidence exceeds the limit.",
    });
  });

  it("requires provider events to begin needs-review and makes reviewed states explicit", () => {
    const forgedReview = completeRecord();
    forgedReview.external_events[0] = {
      ...forgedReview.external_events[0],
      review_state: "confirmed",
      reviewed_at: null,
      review_reason: "",
    };
    expect(validateDakotaRevenueBridgeRecord(forgedReview).valid).toBe(false);

    const reviewed = completeRecord();
    reviewed.external_events[0] = {
      ...reviewed.external_events[0],
      review_state: "rejected",
      reviewed_at: UPDATED_AT,
      review_reason: "The provider notice was unrelated.",
    };
    expect(validateDakotaRevenueBridgeRecord(reviewed).valid).toBe(true);
  });

  it("enforces complete, partial, and unavailable Website Audit measurement truth", () => {
    const partial = completeRecord();
    partial.website_audit = {
      ...partial.website_audit!,
      measurement_state: "partial",
      scores: { performance: 62, seo: null, accessibility: null, best_practices: null },
      overall_score: null,
      grade: null,
    };
    expect(validateDakotaRevenueBridgeRecord(partial).valid).toBe(true);

    const inventedOverall = structuredClone(partial);
    inventedOverall.website_audit!.overall_score = 62;
    expect(validateDakotaRevenueBridgeRecord(inventedOverall)).toEqual({
      valid: false,
      error: "Incomplete Website Audit intelligence cannot claim an overall score or grade.",
    });

    const unavailable = structuredClone(partial);
    unavailable.website_audit!.measurement_state = "unavailable";
    expect(validateDakotaRevenueBridgeRecord(unavailable)).toEqual({
      valid: false,
      error: "Website Audit measurement state does not match its scores.",
    });
  });

  it("locks private offers to the approved internal price bands", () => {
    expect(isCompatiblePrivateOffer("white_label_overflow_retainer", "usd_1000_monthly")).toBe(true);
    expect(isCompatiblePrivateOffer("white_label_overflow_retainer", "usd_3000_5000_monthly")).toBe(false);

    const wrongBand = completeRecord();
    wrongBand.selected_offer = {
      ...wrongBand.selected_offer!,
      offer_code: "ai_workflow_build",
      price_band: "usd_500_2000",
    };
    expect(validateDakotaRevenueBridgeRecord(wrongBand)).toEqual({
      valid: false,
      error: "Private price band does not match the offer.",
    });
  });

  it("enforces durable alert, archive, and provider cursor invariants", () => {
    const badAlert = completeRecord();
    badAlert.alerts[0] = {
      ...badAlert.alerts[0],
      status: "resolved",
      resolved_at: null,
      resolution_note: "Resolved.",
    };
    expect(validateDakotaRevenueBridgeRecord(badAlert).valid).toBe(false);

    const badArchive = completeRecord();
    badArchive.archive = {
      archived_at: UPDATED_AT,
      reason: "Duplicate record.",
      retention_until: OBSERVED_AT,
      source: "operator",
    };
    expect(validateDakotaRevenueBridgeRecord(badArchive).valid).toBe(false);

    const badCursor = completeEnvelope();
    badCursor.providers.gmail!.cursor = "refresh_token=secret-value";
    expect(validateDakotaRevenueBridgeEnvelope(badCursor).valid).toBe(false);
  });

  it("accepts only strict trusted server mutation shapes", () => {
    const mutation = validateDakotaRevenueBridgeServerMutation({
      type: "append_external_event",
      candidate_key: CANDIDATE_KEY,
      event: {
        event_id: "event:gmail:456",
        provider: "gmail",
        kind: "message_received",
        summary: "A message needs human review.",
        external_ref: "gmail-message-456",
        occurred_at: OBSERVED_AT,
      },
    });
    expect(mutation.valid).toBe(true);

    expect(validateDakotaRevenueBridgeServerMutation({
      ...(mutation.valid ? mutation.value : {}),
      raw_payload: { authorization: "never" },
    }).valid).toBe(false);

    expect(validateDakotaRevenueBridgeServerMutation({
      type: "restore_candidate",
      candidate_key: CANDIDATE_KEY,
    }).valid).toBe(true);
    expect(validateDakotaRevenueBridgeServerMutation({
      type: "restore_candidate",
      candidate_key: CANDIDATE_KEY,
      reason: "browser supplied",
    }).valid).toBe(false);
  });

  it("accepts strict Website Audit lifecycle, delivery, and engagement patches", () => {
    const mutations = [
      {
        type: "reconcile_website_audit",
        candidate_key: CANDIDATE_KEY,
        patch: { patch_type: "requested", report_id: "report-12345678", domain: "example.com", requested_at: OBSERVED_AT },
      },
      {
        type: "reconcile_website_audit",
        candidate_key: CANDIDATE_KEY,
        patch: {
          patch_type: "delivery", report_id: "report-12345678", domain: "example.com",
          status: "sent", updated_at: GENERATED_AT, sent_at: GENERATED_AT, failed_at: null, failure_reason: "",
        },
      },
      {
        type: "reconcile_website_audit",
        candidate_key: CANDIDATE_KEY,
        patch: {
          patch_type: "engagement", report_id: "report-12345678", domain: "example.com",
          observed_at: UPDATED_AT, first_view_at: GENERATED_AT, last_view_at: UPDATED_AT,
          total_views: 2, max_scroll_depth: 90, max_time_on_page_seconds: 60,
        },
      },
      {
        type: "reconcile_website_audit",
        candidate_key: CANDIDATE_KEY,
        patch: {
          patch_type: "failed", report_id: "report-12345678", domain: "example.com",
          failed_at: UPDATED_AT, failure_reason: "The audit renderer timed out.",
        },
      },
    ];
    for (const mutation of mutations) {
      expect(validateDakotaRevenueBridgeServerMutation(mutation).valid).toBe(true);
    }
  });

  it("does not expose provider-event, audit, alert, or cursor creation to operator PUT", () => {
    for (const mutation of [
      { type: "append_external_event", event: {} },
      { type: "append_evidence", evidence: {} },
      { type: "reconcile_website_audit", patch: {} },
      { type: "append_alert", alert: {} },
      { type: "update_provider", provider_state: {} },
      { type: "archive_candidate", reason: "forged", retention_until: null },
      { type: "restore_candidate" },
    ]) {
      expect(validateDakotaRevenueBridgePutPayload({
        candidate_key: CANDIDATE_KEY,
        expected_updated_at: null,
        mutation,
      })).toEqual({ valid: false, error: "Revenue Bridge mutation type is invalid." });
    }
  });

  it("validates all operator commands with exact keys and server-owned timestamps", () => {
    expect(validateDakotaRevenueBridgePutPayload({
      candidate_key: CANDIDATE_KEY,
      expected_updated_at: null,
      mutation: {
        type: "review_research",
        disposition: "pursue",
        reason: "Public evidence supports a human follow-up.",
      },
    }).valid).toBe(true);

    expect(validateDakotaRevenueBridgePutPayload({
      candidate_key: CANDIDATE_KEY,
      expected_updated_at: null,
      mutation: {
        type: "review_research",
        disposition: "pursue",
        reason: "Public evidence supports a human follow-up.",
        reviewed_at: UPDATED_AT,
      },
    })).toEqual({ valid: false, error: "Research-review mutation has an invalid shape." });
  });
});
