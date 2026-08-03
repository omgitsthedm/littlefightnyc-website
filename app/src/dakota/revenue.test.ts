import { describe, expect, it } from "vitest";
import type { Candidate, OperatorRecordInput } from "./types";
import {
  assessCandidate,
  candidateFromOperatorRecord,
  candidateKey,
  countsTowardWeeklyNorthStar,
  currency,
  derivedBalance,
  EMPTY_OPERATOR_RECORD,
  evidencedInvoiceAmount,
  getSourceHealth,
  identityScore,
  isConsentedInboundRecord,
  isFullyPaidRecord,
  isPursuitContact,
  isVoiceTextContact,
  operatorRecordFor,
  storefrontMoneyPath,
} from "./revenue";

const candidate: Candidate = {
  rank: 1,
  score: 74,
  business_name: "Example Bakery LLC",
  dba: "Example Bakery",
  source: "nys_dos",
  source_id: "12345",
  filed_at: "2026-08-01",
  category: "Bakery",
  phone: "",
  address: "",
  city: "New York",
  state: "NY",
  postal_code: "10001",
  county_or_borough: "Manhattan",
  verified_url: "https://example.test",
  domain_status: "verified",
  psi_status: "not_run",
  psi_mobile_performance: null,
  missing_pieces: "phone; buyer intent",
  diagnosis: "A public filing and verified website warrant review.",
  score_version: "v2",
  score_reasons: "recent filing; verified website",
};

describe("Dakota revenue scoring", () => {
  it("keeps early pursuit scores below qualification", () => {
    const result = assessCandidate(candidate, EMPTY_OPERATOR_RECORD);
    expect(result.signal.value).toBe(74);
    expect(result.pursuit.value).toBeLessThan(50);
    expect(result.qualified).toBe(false);
  });

  it("requires verified pain, offer fit, and explicit pursuit status", () => {
    const record: OperatorRecordInput = {
      ...EMPTY_OPERATOR_RECORD,
      status: "pursuit_ready",
      verifiedPain: "The mobile booking path was checked and is blocked.",
      offerFit: "Website Check followed by a scoped conversion repair.",
      nextAction: "Review the captured evidence before manual contact.",
    };
    const result = assessCandidate(candidate, record);
    expect(result.qualified).toBe(true);
    expect(result.pursuit.value).toBeGreaterThanOrEqual(50);
  });

  it("scores identity completeness without calling it verification", () => {
    expect(identityScore(candidate)).toBe(90);
  });

  it("uses stable lowercase candidate keys", () => {
    expect(candidateKey({ ...candidate, source: "NYS_DOS", source_id: "ABC-123" })).toBe("nys_dos:abc-123");
  });

  it("reconstructs a strict saved-only candidate without inventing queue evidence", () => {
    const record = {
      ...EMPTY_OPERATOR_RECORD,
      identity: {
        businessName: "Saved Bakery",
        source: "manual",
        sourceId: "123e4567-e89b-12d3-a456-426614174000",
      },
      updated_at: "2026-08-03T08:00:00Z",
    };
    const saved = candidateFromOperatorRecord("manual:123e4567-e89b-12d3-a456-426614174000", record);
    expect(saved?.rank).toBe(0);
    expect(saved?.score).toBe(0);
    expect(saved?.phone).toBe("");
  });

  it("strips server-owned fields before a saved record is edited and sent back", () => {
    const saved = {
      ...EMPTY_OPERATOR_RECORD,
      identity: { businessName: "Example Bakery", source: "nys_dos", sourceId: "12345" },
      updated_at: "2026-08-03T12:00:00Z",
    };
    const editable = operatorRecordFor({ "nys_dos:12345": saved }, candidate);
    expect(Object.keys(editable).sort()).toEqual(Object.keys(EMPTY_OPERATOR_RECORD).sort());
    expect(Object.hasOwn(editable, "updated_at")).toBe(false);
    expect(editable.identity).not.toBe(saved.identity);
  });

  it("counts the immutable human-approval event in the weekly north star", () => {
    const base = {
      ...EMPTY_OPERATOR_RECORD,
      identity: { businessName: "Example Bakery", source: "manual", sourceId: "123e4567-e89b-12d3-a456-426614174000" },
      status: "research_ready" as const,
      verifiedPain: "Observed checkout failure.",
      offerFit: "Scoped conversion repair.",
      updated_at: "2026-07-01T12:00:00Z",
    };
    const now = new Date("2026-08-03T12:00:00Z");
    const milestones = {
      humanApprovedAt: "2026-08-02T12:00:00Z",
      firstContactedAt: null,
      repliedAt: null,
      meetingAt: null,
      proposalAt: null,
      wonAt: null,
      lostAt: null,
      paidAt: null,
    };
    expect(countsTowardWeeklyNorthStar({ ...base, milestones }, now)).toBe(true);
    expect(
      countsTowardWeeklyNorthStar(
        { ...base, updated_at: "2026-08-03T11:00:00Z", milestones: { ...milestones, humanApprovedAt: "2026-07-20T12:00:00Z" } },
        now,
      ),
    ).toBe(false);
    expect(countsTowardWeeklyNorthStar(base, now)).toBe(false);
  });
});

describe("source health and storefront language", () => {
  it("marks snapshots stale after 72 hours", () => {
    const health = getSourceHealth("2026-08-01T00:00:00Z", new Date("2026-08-04T01:00:00Z"));
    expect(health.level).toBe("stale");
  });

  it("uses storefront-specific customer paths", () => {
    expect(storefrontMoneyPath("Hair salon")).toBe("Bookings · repeat visits");
    expect(storefrontMoneyPath("Restaurant")).toBe("Visits · reservations · orders");
  });
});

describe("Dakota conversion gates", () => {
  const contact = {
    contactId: "550e8400-e29b-41d4-a716-446655440001",
    name: "Owner",
    role: "Owner",
    channel: "phone" as const,
    value: "+12125550100",
    sourceUrl: "https://example.com/contact",
    verifiedAt: "2026-08-03",
    consentClassification: "public_business" as const,
  };

  it("keeps public business phones out of the Google Voice text handoff", () => {
    expect(isPursuitContact(contact)).toBe(true);
    expect(isPursuitContact({ ...contact, channel: "website_form", value: "https://example.com/contact" })).toBe(false);
    expect(isVoiceTextContact(contact)).toBe(false);
    expect(isVoiceTextContact({ ...contact, consentClassification: "explicit_inquiry" })).toBe(false);
    expect(isVoiceTextContact({ ...contact, channel: "sms", consentClassification: "explicit_inquiry" })).toBe(true);
    expect(isPursuitContact({ ...contact, consentClassification: "unknown" })).toBe(false);
    expect(isVoiceTextContact({ ...contact, channel: "sms", value: "not-a-phone", consentClassification: "explicit_inquiry" })).toBe(false);
    expect(isVoiceTextContact({ ...contact, channel: "sms", sourceUrl: "http://localhost/contact", consentClassification: "explicit_inquiry" })).toBe(false);
    expect(isVoiceTextContact({ ...contact, channel: "sms", verifiedAt: "2026-02-30", consentClassification: "explicit_inquiry" })).toBe(false);
  });

  it("recognizes only explicitly consented inbound records", () => {
    const base = {
      ...EMPTY_OPERATOR_RECORD,
      identity: { businessName: "Inbound Bakery", source: "inbound:tech-audit", sourceId: "abc" },
      contacts: [{ ...contact, consentClassification: "explicit_inquiry" as const }],
    };
    expect(isConsentedInboundRecord(base)).toBe(true);
    expect(isConsentedInboundRecord({ ...base, contacts: [contact] })).toBe(false);
  });

  it("derives balance and counts invoices only after explicit sent evidence", () => {
    const commercialClose = { ...EMPTY_OPERATOR_RECORD.commercialClose, invoiceRef: "INV-1", amountDue: 2000, amountPaid: 500 };
    const base = { ...EMPTY_OPERATOR_RECORD, commercialClose };
    expect(derivedBalance(commercialClose)).toBe(1500);
    expect(evidencedInvoiceAmount(base)).toBe(0);
    expect(evidencedInvoiceAmount({
      ...base,
      activities: [{ activityId: "activity-1", taskId: null, contactId: null, channel: "invoice", type: "invoice_sent", outcome: "sent", note: "Invoice sent manually.", occurredAt: "2026-08-03T12:00:00.000Z", followUpAt: null }],
    })).toBe(2000);
    expect(evidencedInvoiceAmount({
      ...base,
      activities: [{ activityId: "activity-2", taskId: null, contactId: null, channel: "invoice", type: "invoice_sent", outcome: "completed", note: "Invoice delivery completed.", occurredAt: "2026-08-03T12:05:00.000Z", followUpAt: null }],
    })).toBe(2000);
  });

  it("keeps cents exact and counts only fully evidenced zero-balance records as fully paid", () => {
    expect(currency(1250.75)).toBe("$1,250.75");
    expect(currency(1250)).toBe("$1,250");
    const paymentActivity = {
      activityId: "activity-paid",
      taskId: null,
      contactId: null,
      channel: "invoice" as const,
      type: "payment_received" as const,
      outcome: "paid" as const,
      note: "Payment cleared.",
      occurredAt: "2026-08-03T12:00:00.000Z",
      followUpAt: null,
    };
    const partial = {
      ...EMPTY_OPERATOR_RECORD,
      status: "won" as const,
      activities: [paymentActivity],
      commercialClose: {
        ...EMPTY_OPERATOR_RECORD.commercialClose,
        amountDue: 2000,
        amountPaid: 500,
        paidDate: "2026-08-03",
        balance: 1500,
      },
    };
    expect(isFullyPaidRecord(partial)).toBe(false);
    expect(isFullyPaidRecord({
      ...partial,
      status: "paid",
      commercialClose: { ...partial.commercialClose, amountPaid: 2000, balance: 0 },
    })).toBe(true);
  });
});
