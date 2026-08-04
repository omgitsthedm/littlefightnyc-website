import { describe, expect, it, vi } from "vitest";

import { enrichDakotaCandidate } from "./enrichment";
import type { DakotaCandidate } from "./queue-schema";

const NOW = new Date("2026-08-03T12:00:00.000Z");

function candidate(): DakotaCandidate {
  return {
    rank: 1,
    score: 50,
    business_name: "Corner Market LLC",
    dba: "Corner Market",
    source: "nys_dos",
    source_id: "123",
    filed_at: "2026-08-01",
    category: "Retail",
    phone: "+12125550199",
    address: "12 Orchard Street",
    city: "New York",
    state: "NY",
    postal_code: "10002",
    county_or_borough: "Manhattan",
    verified_url: "",
    domain_status: "not_verified",
    psi_status: "not_run",
    psi_mobile_performance: null,
    missing_pieces: "",
    diagnosis: "",
    score_version: "v1",
    score_reasons: "",
  };
}

describe("Dakota structured enrichment", () => {
  it("reports explicit connection gates without making network calls", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await enrichDakotaCandidate(candidate(), {
      getEnv: () => undefined,
      fetch: fetcher,
      now: () => NOW,
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.providers).toEqual([
      expect.objectContaining({ provider: "google_places", status: "not_configured" }),
      expect.objectContaining({ provider: "yelp", status: "not_configured" }),
    ]);
    expect(result.evidence).toEqual([]);
  });

  it("requests bounded provider fields and returns suggestions, never qualification", async () => {
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);
      if (url.includes("places.googleapis.com")) {
        expect(init?.headers).toMatchObject({
          "X-Goog-Api-Key": "google-key",
        });
        expect(JSON.parse(String(init?.body))).toMatchObject({ pageSize: 3, regionCode: "US" });
        return new Response(JSON.stringify({ places: [{
          id: "google-1",
          displayName: { text: "Corner Market" },
          formattedAddress: "12 Orchard St, New York, NY 10002",
          businessStatus: "OPERATIONAL",
          googleMapsUri: "https://maps.google.com/?cid=1",
          websiteUri: "https://corner.example/",
          nationalPhoneNumber: "(212) 555-0199",
          rating: 4.7,
          userRatingCount: 31,
        }] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      expect(url).toContain("businesses%2Fmatches".replace("%2F", "/"));
      expect(init?.headers).toMatchObject({ Authorization: "Bearer yelp-key" });
      return new Response(JSON.stringify({ businesses: [{
        id: "yelp-1",
        name: "Corner Market",
        url: "https://www.yelp.com/biz/corner-market",
        display_phone: "(212) 555-0199",
        rating: 4.5,
        review_count: 18,
        is_closed: false,
        location: { display_address: ["12 Orchard St", "New York, NY 10002"] },
      }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const result = await enrichDakotaCandidate(candidate(), {
      getEnv: (name) => name === "GOOGLE_PLACES_API_KEY" ? "google-key" : name === "YELP_API_KEY" ? "yelp-key" : undefined,
      fetch: fetcher,
      now: () => NOW,
    });
    expect(result.evidence).toHaveLength(2);
    expect(result.evidence.every((item) => item.reviewState === "suggested" && item.stance === "context")).toBe(true);
    expect(JSON.stringify(result)).not.toContain("google-key");
    expect(JSON.stringify(result)).not.toContain("yelp-key");
  });
});
