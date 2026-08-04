import { describe, expect, it } from "vitest";
import { EMPTY_OPERATOR_RECORD } from "./revenue";
import { buildDakotaRevenueMetrics } from "./revenueBridgeMetrics";
import type { DakotaRevenueBridgeEnvelope, OperatorRecord } from "./types";

const updatedAt = "2026-08-03T12:00:00.000Z";

function operator(overrides: Partial<OperatorRecord> = {}): OperatorRecord {
  return {
    ...EMPTY_OPERATOR_RECORD,
    identity: { businessName: "Signal Bakery", source: "nys_dos", sourceId: "1" },
    updated_at: updatedAt,
    ...overrides,
  };
}

function bridge(): DakotaRevenueBridgeEnvelope {
  return {
    schema_version: "dakota.revenue-bridge.v1",
    updated_at: updatedAt,
    providers: {},
    records: {
      "nys_dos:1": {
        research_review: { disposition: "pursue", reason: "Verified storefront need.", reviewed_at: updatedAt },
        evidence: [{ evidence_id: "evidence-1", provider: "google_places", kind: "listing", summary: "Matched listing", public_url: null, external_ref: null, observed_at: updatedAt, received_at: updatedAt, review_state: "suggested", reviewed_at: null, review_reason: "" }],
        external_events: [{ event_id: "event-1", provider: "gmail", kind: "message_received", summary: "Reply metadata matched", external_ref: "message:1", occurred_at: updatedAt, received_at: updatedAt, review_state: "needs_review", reviewed_at: null, review_reason: "" }],
        website_audit: null,
        selected_offer: { offer_code: "custom_scoped", price_band: "private", rationale: "Smallest useful fix.", selected_at: updatedAt },
        alerts: [{ alert_id: "alert-1", provider: "gmail", kind: "new_external_event", severity: "critical", message: "Reply needs review.", created_at: updatedAt, status: "open", acknowledged_at: null, resolved_at: null, resolution_note: "" }],
        archive: null,
        updated_at: updatedAt,
      },
    },
  };
}

describe("Dakota Revenue Bridge metrics", () => {
  it("counts each record once across the evidence-backed funnel", () => {
    const record = operator({
      milestones: { humanApprovedAt: updatedAt, firstContactedAt: updatedAt, repliedAt: updatedAt, meetingAt: null, proposalAt: null, wonAt: null, lostAt: null, paidAt: null },
      activities: [{ activityId: "proposal-1", taskId: null, contactId: null, channel: "proposal", type: "proposal_sent", outcome: "sent", note: "Sent manually.", occurredAt: updatedAt, followUpAt: null }],
    });
    const metrics = buildDakotaRevenueMetrics([], { "nys_dos:1": record }, bridge());
    expect(metrics.funnel).toMatchObject({ signals: 1, reviewed: 1, pursue: 1, contacted: 1, replied: 1, proposals: 1, pendingExternalReview: 1, suggestedEvidence: 1, criticalAlerts: 1, offersSelected: 1 });
    expect(metrics.sourceRows).toEqual([expect.objectContaining({ label: "nys_dos", records: 1, reviewed: 1, proposals: 1 })]);
  });

  it("does not convert provider suggestions or needs-review events into sales stages", () => {
    const metrics = buildDakotaRevenueMetrics([], {}, bridge());
    expect(metrics.funnel).toMatchObject({ contacted: 0, replied: 0, meetings: 0, proposals: 0, signed: 0, paid: 0 });
    expect(metrics.funnel.pendingExternalReview).toBe(1);
    expect(metrics.funnel.suggestedEvidence).toBe(1);
  });
});
