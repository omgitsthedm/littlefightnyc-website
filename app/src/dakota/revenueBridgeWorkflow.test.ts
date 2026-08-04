import { describe, expect, it } from "vitest";
import {
  ingressReceiptNeedsAttention,
  nextUnreviewedResearchKey,
  unreviewedResearchKeys,
} from "./revenueBridgeWorkflow";
import type { Candidate, DakotaRevenueBridgeRecord } from "./types";

function candidate(sourceId: string, rank: number): Candidate {
  return {
    rank,
    score: 50,
    business_name: `Business ${sourceId}`,
    dba: "",
    source: "nys_dos",
    source_id: sourceId,
    filed_at: "",
    category: "",
    phone: "",
    address: "",
    city: "New York",
    state: "NY",
    postal_code: "",
    county_or_borough: "",
    verified_url: "",
    domain_status: "",
    psi_status: "",
    psi_mobile_performance: null,
    missing_pieces: "",
    diagnosis: "",
    score_version: "v1",
    score_reasons: "",
  };
}

function reviewedRecord(disposition: DakotaRevenueBridgeRecord["research_review"]["disposition"]): DakotaRevenueBridgeRecord {
  return {
    research_review: { disposition, reason: "Reviewed from public evidence.", reviewed_at: "2026-08-03T12:00:00.000Z" },
    evidence: [],
    external_events: [],
    website_audit: null,
    selected_offer: null,
    alerts: [],
    archive: null,
    updated_at: "2026-08-03T12:00:00.000Z",
  };
}

describe("Revenue Bridge research progression", () => {
  it("keeps successful duplicate ingress receipts out of the recovery lane", () => {
    expect(ingressReceiptNeedsAttention({ status: "stored" })).toBe(false);
    expect(ingressReceiptNeedsAttention({ status: "duplicate" })).toBe(false);
    expect(ingressReceiptNeedsAttention({ status: "pending" })).toBe(true);
    expect(ingressReceiptNeedsAttention({ status: "capacity" })).toBe(true);
    expect(ingressReceiptNeedsAttention({ status: "conflict" })).toBe(true);
    expect(ingressReceiptNeedsAttention({ status: "failed" })).toBe(true);
  });

  it("preserves queue order and treats missing bridge records as unreviewed", () => {
    const queue = [candidate("1", 1), candidate("2", 2), candidate("3", 3)];
    const records = { "nys_dos:2": reviewedRecord("not_fit") };
    expect(unreviewedResearchKeys(queue, records)).toEqual(["nys_dos:1", "nys_dos:3"]);
  });

  it("opens only a different unreviewed signal after a successful save", () => {
    const queue = [candidate("1", 1), candidate("2", 2), candidate("3", 3)];
    const records = { "nys_dos:2": reviewedRecord("pursue") };
    expect(nextUnreviewedResearchKey(queue, records, "nys_dos:1")).toBe("nys_dos:3");
    expect(nextUnreviewedResearchKey([candidate("1", 1)], {}, "nys_dos:1")).toBeNull();
  });
});
