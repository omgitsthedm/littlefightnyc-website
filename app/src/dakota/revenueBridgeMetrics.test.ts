import { describe, expect, it } from "vitest";
import { EMPTY_OPERATOR_RECORD } from "./revenue";
import {
  DAKOTA_INBOUND_RESPONSE_TARGET_MINUTES,
  buildDakotaRevenueMetrics,
} from "./revenueBridgeMetrics";
import type {
  DakotaActivity,
  DakotaActivityOutcome,
  DakotaActivityType,
  DakotaRevenueBridgeEnvelope,
  DakotaTask,
  OperatorRecord,
} from "./types";

const updatedAt = "2026-08-03T12:00:00.000Z";

function operator(overrides: Partial<OperatorRecord> = {}): OperatorRecord {
  return {
    ...EMPTY_OPERATOR_RECORD,
    identity: { businessName: "Signal Bakery", source: "nys_dos", sourceId: "1" },
    updated_at: updatedAt,
    ...overrides,
  };
}

function activity(
  activityId: string,
  type: DakotaActivityType,
  occurredAt: string,
  outcome: DakotaActivityOutcome = "recorded",
): DakotaActivity {
  const channel = type === "payment_received"
    ? "payment"
    : type === "invoice_sent"
      ? "invoice"
      : type === "proposal_sent"
        ? "proposal"
        : type === "contract_signed"
          ? "contract"
          : type === "call"
            ? "phone"
            : type === "outreach" || type === "reply"
              ? "email"
              : "internal";
  return {
    activityId,
    taskId: null,
    contactId: null,
    channel,
    type,
    outcome,
    note: type === "note"
      ? "Consented Tech Audit request received. Follow-up preference: email. No outreach was sent."
      : "Evidence recorded by the operator.",
    occurredAt,
    followUpAt: null,
  };
}

function task(taskId: string, overrides: Partial<DakotaTask> = {}): DakotaTask {
  return {
    taskId,
    type: "follow_up",
    status: "open",
    title: "Follow up",
    dueAt: null,
    contactId: null,
    channel: "internal",
    createdAt: updatedAt,
    resolvedAt: null,
    resolutionNote: "",
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
  it("counts each record once and carries every verified stage into source and offer provenance", () => {
    const record = operator({
      status: "paid",
      milestones: {
        humanApprovedAt: updatedAt,
        firstContactedAt: updatedAt,
        repliedAt: updatedAt,
        meetingAt: updatedAt,
        proposalAt: updatedAt,
        wonAt: updatedAt,
        lostAt: null,
        paidAt: updatedAt,
      },
      commercialClose: {
        ...EMPTY_OPERATOR_RECORD.commercialClose,
        proposalRef: "proposal-1",
        proposalAmount: 2_400,
        proposalSentDate: "2026-08-01",
        signedDate: "2026-08-02",
        invoiceRef: "invoice-1",
        amountDue: 2_400,
        amountPaid: 2_400,
        paidDate: "2026-08-03",
        balance: 0,
      },
      activities: [
        activity("proposal-1", "proposal_sent", "2026-08-01T12:00:00.000Z", "sent"),
        activity("contract-1", "contract_signed", "2026-08-02T12:00:00.000Z", "won"),
        activity("invoice-1", "invoice_sent", "2026-08-02T13:00:00.000Z", "sent"),
        activity("payment-1", "payment_received", updatedAt, "paid"),
      ],
    });

    const metrics = buildDakotaRevenueMetrics([], { "nys_dos:1": record }, bridge());

    expect(metrics.funnel).toMatchObject({
      signals: 1,
      reviewed: 1,
      pursue: 1,
      contacted: 1,
      replied: 1,
      meetings: 1,
      proposals: 1,
      signed: 1,
      paid: 1,
      pendingExternalReview: 1,
      suggestedEvidence: 1,
      criticalAlerts: 1,
      offersSelected: 1,
    });
    expect(metrics.sourceRows).toEqual([
      expect.objectContaining({
        label: "nys_dos",
        records: 1,
        contacted: 1,
        replied: 1,
        meetings: 1,
        proposals: 1,
        signed: 1,
        paid: 1,
        paidAmount: 2_400,
      }),
    ]);
    expect(metrics.offerRows[0]?.conversion.paid.percentage).toBe(100);
    expect(metrics.commercial).toEqual({
      proposalValue: 2_400,
      clearedRevenue: 2_400,
      outstandingBalance: 0,
      fullyPaidDeals: 1,
      averagePaidDeal: 2_400,
    });
  });

  it("calculates progressive conversion rates without treating research disposition as inbound eligibility", () => {
    const records = {
      "manual:1": operator({ identity: { businessName: "One", source: "manual", sourceId: "1" }, milestones: { humanApprovedAt: updatedAt, firstContactedAt: updatedAt, repliedAt: updatedAt, meetingAt: updatedAt, proposalAt: updatedAt, wonAt: updatedAt, lostAt: null, paidAt: updatedAt }, status: "paid", commercialClose: { ...EMPTY_OPERATOR_RECORD.commercialClose, proposalAmount: 100, proposalSentDate: "2026-08-01", signedDate: "2026-08-02", invoiceRef: "i1", amountDue: 100, amountPaid: 100, paidDate: "2026-08-03", balance: 0 }, activities: [activity("p1", "payment_received", updatedAt, "paid")] }),
      "manual:2": operator({ identity: { businessName: "Two", source: "manual", sourceId: "2" }, milestones: { humanApprovedAt: updatedAt, firstContactedAt: updatedAt, repliedAt: updatedAt, meetingAt: null, proposalAt: null, wonAt: null, lostAt: null, paidAt: null } }),
      "manual:3": operator({ identity: { businessName: "Three", source: "manual", sourceId: "3" }, milestones: { humanApprovedAt: updatedAt, firstContactedAt: updatedAt, repliedAt: null, meetingAt: null, proposalAt: null, wonAt: null, lostAt: null, paidAt: null } }),
      "manual:4": operator({ identity: { businessName: "Four", source: "manual", sourceId: "4" } }),
    };

    const metrics = buildDakotaRevenueMetrics([], records, null);

    expect(metrics.conversion).toEqual({
      contact: { numerator: 3, denominator: 4, percentage: 75 },
      reply: { numerator: 2, denominator: 3, percentage: 66.7 },
      meeting: { numerator: 1, denominator: 2, percentage: 50 },
      proposal: { numerator: 1, denominator: 1, percentage: 100 },
      signed: { numerator: 1, denominator: 1, percentage: 100 },
      paid: { numerator: 1, denominator: 1, percentage: 100 },
    });
    expect(metrics.sourceRows[0]).toMatchObject({ contacted: 3, replied: 2, meetings: 1 });
    expect(metrics.sourceRows[0]?.conversion.contact.percentage).toBe(75);
  });

  it("derives acquisition provenance only from exact immutable inbound proof labels", () => {
    const inboundRecord = operator({
      identity: { businessName: "Inbound", source: "inbound:tech-audit", sourceId: "attributed" },
      proof: "Verified Netlify Tech Audit form submission. Lead origin: homepage.hero. UTM source: google. UTM medium: cpc. UTM campaign: nyc-q3.",
    });
    const unrelatedRecord = operator({
      identity: { businessName: "Manual", source: "manual", sourceId: "untrusted" },
      proof: "Lead origin: should-not-parse. UTM source: should-not-parse.",
      notes: "UTM medium: notes-are-not-proof.",
    });

    const metrics = buildDakotaRevenueMetrics([], {
      "inbound:tech-audit:attributed": inboundRecord,
      "manual:untrusted": unrelatedRecord,
    }, null);

    expect(metrics.acquisitionRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        identitySource: "inbound:tech-audit",
        leadOrigin: "homepage.hero",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "nyc-q3",
      }),
      expect.objectContaining({
        identitySource: "manual",
        leadOrigin: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
      }),
    ]));
  });

  it("measures first human response from received inbound activity and ignores malformed or pre-receipt timestamps", () => {
    const inbound = (sourceId: string, activities: DakotaActivity[], milestone: string | null = null) => operator({
      identity: { businessName: `Inbound ${sourceId}`, source: "inbound:tech-audit", sourceId },
      milestones: { humanApprovedAt: null, firstContactedAt: milestone, repliedAt: null, meetingAt: null, proposalAt: null, wonAt: null, lostAt: null, paidAt: null },
      activities,
    });
    const records = {
      "inbound:tech-audit:a": inbound("a", [activity("received-a", "note", "2026-08-03T09:00:00-04:00"), activity("outreach-a", "outreach", "2026-08-03T09:30:00-04:00", "sent")]),
      "inbound:tech-audit:b": inbound("b", [activity("received-b", "note", "2026-08-03T09:00:00-04:00"), activity("call-b", "call", "2026-08-03T11:30:00-04:00", "connected")]),
      "inbound:tech-audit:c": inbound("c", [activity("received-c", "note", "2026-08-03T10:00:00-04:00")]),
      "inbound:tech-audit:d": inbound("d", [activity("received-d", "note", "not-a-date")]),
      "inbound:tech-audit:e": inbound("e", [activity("received-e", "note", "2026-08-03T09:00:00-04:00"), activity("outreach-before-e", "outreach", "2026-08-03T08:00:00-04:00", "sent"), activity("outreach-e", "outreach", "2026-08-03T09:45:00-04:00", "sent")]),
    };

    const metrics = buildDakotaRevenueMetrics([], records, null, new Date("2026-08-03T12:00:00-04:00"));

    expect(metrics.response).toEqual({
      targetMinutes: DAKOTA_INBOUND_RESPONSE_TARGET_MINUTES,
      timeZone: "America/New_York",
      windowStartHour: 9,
      windowEndHour: 21,
      inboundRecords: 5,
      measurableInboundRecords: 4,
      missingReceivedTimestamp: 1,
      responded: 3,
      pending: 1,
      withinTarget: 2,
      outsideTarget: 1,
      responseRate: { numerator: 3, denominator: 4, percentage: 75 },
      withinTargetRate: { numerator: 2, denominator: 3, percentage: 66.7 },
      averageFirstResponseMinutes: 75,
      medianFirstResponseMinutes: 45,
      oldestPendingResponseMinutes: 120,
    });
  });

  it("pauses the response clock outside 9am–9pm Eastern across boundaries and daylight-saving changes", () => {
    const inbound = (sourceId: string, receivedAt: string, respondedAt: string) => operator({
      identity: { businessName: `Inbound ${sourceId}`, source: "inbound:tech-audit", sourceId },
      activities: [
        activity(`received-${sourceId}`, "note", receivedAt),
        activity(`outreach-${sourceId}`, "outreach", respondedAt, "sent"),
      ],
    });
    const records = {
      "inbound:tech-audit:spring": inbound("spring", "2026-03-07T20:30:00-05:00", "2026-03-08T09:30:00-04:00"),
      "inbound:tech-audit:fall": inbound("fall", "2026-10-31T20:30:00-04:00", "2026-11-01T09:30:00-05:00"),
      "inbound:tech-audit:closed": inbound("closed", "2026-08-03T21:00:00-04:00", "2026-08-04T09:00:00-04:00"),
    };

    const metrics = buildDakotaRevenueMetrics([], records, null, new Date("2026-11-02T12:00:00-05:00"));

    expect(metrics.response).toMatchObject({
      responded: 3,
      withinTarget: 3,
      outsideTarget: 0,
      averageFirstResponseMinutes: 40,
      medianFirstResponseMinutes: 60,
    });
  });

  it("reports open-task pressure while safely skipping invalid and future task timestamps", () => {
    const record = operator({
      tasks: [
        task("overdue", { createdAt: "2026-08-03T08:00:00.000Z", dueAt: "2026-08-03T10:00:00.000Z" }),
        task("invalid", { createdAt: "invalid", dueAt: "invalid" }),
        task("completed", { status: "completed", createdAt: "2026-08-01T08:00:00.000Z", dueAt: "2026-08-01T10:00:00.000Z" }),
        task("future", { createdAt: "2026-08-03T13:00:00.000Z", dueAt: "2026-08-03T13:00:00.000Z" }),
        task("ready", { createdAt: "2026-08-03T11:00:00.000Z" }),
      ],
    });

    const metrics = buildDakotaRevenueMetrics([], { "nys_dos:1": record }, null, new Date(updatedAt));

    expect(metrics.actions).toEqual({ open: 4, overdue: 1, oldestActionableAgeMinutes: 240 });
  });

  it("does not invent funnel or money evidence from malformed dates, unconfirmed values, or provider suggestions", () => {
    const record = operator({
      status: "paid",
      milestones: { humanApprovedAt: null, firstContactedAt: "invalid", repliedAt: "invalid", meetingAt: "invalid", proposalAt: "invalid", wonAt: "invalid", lostAt: null, paidAt: "invalid" },
      commercialClose: { ...EMPTY_OPERATOR_RECORD.commercialClose, proposalAmount: Number.NaN, proposalSentDate: "invalid", signedDate: "invalid", invoiceRef: "invoice", amountDue: 800, amountPaid: 800, paidDate: "invalid", balance: 0 },
      activities: [activity("payment-invalid", "payment_received", "invalid", "paid"), activity("invoice-invalid", "invoice_sent", "invalid", "sent")],
    });

    const metrics = buildDakotaRevenueMetrics([], { "nys_dos:1": record }, bridge());

    expect(metrics.funnel).toMatchObject({ contacted: 0, replied: 0, meetings: 0, proposals: 0, signed: 0, paid: 0 });
    expect(metrics.commercial).toEqual({ proposalValue: 0, clearedRevenue: 0, outstandingBalance: 0, fullyPaidDeals: 0, averagePaidDeal: null });
    expect(metrics.funnel.pendingExternalReview).toBe(1);
    expect(metrics.funnel.suggestedEvidence).toBe(1);
  });
});
