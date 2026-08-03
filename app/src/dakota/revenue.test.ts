import { describe, expect, it } from "vitest";
import type { Candidate, OperatorRecordInput } from "./types";
import {
  assessCandidate,
  candidateFromOperatorRecord,
  candidateKey,
  countsTowardWeeklyNorthStar,
  EMPTY_OPERATOR_RECORD,
  getSourceHealth,
  identityScore,
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
      repliedAt: null,
      meetingAt: null,
      proposalAt: null,
      wonAt: null,
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
