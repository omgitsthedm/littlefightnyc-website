import { describe, expect, it } from "vitest";

import type { Candidate } from "./types";

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    rank: 1, score: 57, business_name: "Serenity Day Spa", dba: "",
    source: "nyc_dcwp", source_id: "abc-1", filed_at: "2026-07-30",
    category: "Day Spa", phone: "2125550101", address: "1 Test St",
    city: "Brooklyn", state: "NY", postal_code: "11201",
    county_or_borough: "Kings", verified_url: "", domain_status: "unverified",
    psi_status: "not_applicable", psi_mobile_performance: null,
    missing_pieces: "verified website", diagnosis: "No verified website found.",
    score_version: "dakota-3.0-score-v1", score_reasons: "+30 tier A",
    ...overrides,
  };
}

describe("engine assessment fields", () => {
  it("are optional so a pre-v3 queue still types and renders", () => {
    const older = candidate();
    expect(older.opportunity_score).toBeUndefined();
    expect(older.confidence_score).toBeUndefined();
    expect(older.queue_band).toBeUndefined();
  });

  it("carry the two-score model when the engine supplies it", () => {
    const scored = candidate({
      opportunity_score: 75,
      confidence_score: 95,
      category_tier: "A",
      queue_band: "priority_review",
    });
    expect(scored.opportunity_score).toBe(75);
    expect(scored.confidence_score).toBe(95);
    expect(scored.queue_band).toBe("priority_review");
  });

  it("keeps `score` as the opportunity score for pre-v3 consumers", () => {
    // The engine writes the opportunity score into the legacy column so the
    // queue_v1 CSV, the publisher and this desk keep working unchanged.
    const scored = candidate({ score: 75, opportunity_score: 75 });
    expect(scored.score).toBe(scored.opportunity_score);
  });
});
