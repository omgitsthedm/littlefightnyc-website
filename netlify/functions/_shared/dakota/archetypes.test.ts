import { describe, expect, it } from "vitest";

import { recommendArchetype } from "./archetypes";
import { DAKOTA_OFFER_CATALOG } from "./offers";

describe("recommendArchetype", () => {
  it("maps a Tier A appointment business to a booking-first shape", () => {
    for (const category of ["Nail Salon", "Day Spa", "Dental Clinic", "Barber Shop"]) {
      expect(recommendArchetype({ category }).archetypeId).toBe("booking-first");
    }
  });

  it("maps a Tier B trade to a call-first professional services shape", () => {
    for (const category of ["Plumbing", "Locksmith", "HVAC Heating", "Towing"]) {
      expect(recommendArchetype({ category }).archetypeId).toBe(
        "professional-services-call-first",
      );
    }
  });

  it("maps a restaurant to restaurant-first", () => {
    expect(recommendArchetype({ category: "Restaurant" }).archetypeId).toBe("restaurant-first");
    expect(recommendArchetype({ category: "Coffee Shop" }).archetypeId).toBe("restaurant-first");
  });

  it("maps a visual business to gallery-first", () => {
    expect(recommendArchetype({ category: "Photography Studio" }).archetypeId).toBe(
      "portfolio-gallery-first",
    );
    expect(recommendArchetype({ category: "Florist" }).archetypeId).toBe(
      "portfolio-gallery-first",
    );
  });

  it("returns exactly one primary archetype even when categories overlap", () => {
    // "Photography Studio" hits both the gallery terms and the Tier A "studio"
    // term. Order decides, and only one id ever comes back.
    const result = recommendArchetype({ category: "Photography Studio and Spa" });
    expect(typeof result.archetypeId).toBe("string");
    expect(result.archetypeId).toBe("portfolio-gallery-first");
  });

  it("never invents an offer - every mapping resolves in the catalog", () => {
    const ids = new Set(DAKOTA_OFFER_CATALOG.map((offer) => offer.offerId));
    for (const category of ["Nail Salon", "Plumbing", "Restaurant", "Florist", "Retail", ""]) {
      const result = recommendArchetype({ category });
      if (result.offerId !== null) expect(ids.has(result.offerId)).toBe(true);
      expect(result.offer?.offerId ?? null).toBe(result.offerId);
    }
  });

  it("falls back to a modular shape rather than guessing", () => {
    const result = recommendArchetype({ category: "", businessName: "Northline Holdings" });
    expect(result.archetypeId).toBe("modular-one-page");
    expect(result.limitations.join(" ")).toContain("starting shape");
  });

  it("always carries a reason and at least one limitation", () => {
    const result = recommendArchetype({ category: "Nail Salon" });
    expect(result.reason.length).toBeGreaterThan(20);
    expect(result.limitations.length).toBeGreaterThan(0);
  });

  it("downgrades to research-first when evidence confidence is low", () => {
    const weak = recommendArchetype({ category: "Nail Salon", confidenceScore: 25 });
    expect(weak.confidenceGate).toBe("research_first");
    expect(weak.limitations.join(" ")).toContain("Evidence confidence is low");

    const strong = recommendArchetype({
      category: "Nail Salon",
      confidenceScore: 95,
      domainStatus: "verified",
      verifiedUrl: "https://example.com",
    });
    expect(strong.confidenceGate).toBe("recommend");
  });

  it("never proposes a module the evidence does not support", () => {
    const result = recommendArchetype({ category: "Plumbing" });
    // Booking modules belong to appointment businesses, not emergency trades.
    expect(result.modules.join(" ").toLowerCase()).not.toContain("booking");
    expect(result.modules.join(" ")).toContain("Tap-to-call");
  });

  it("is deterministic", () => {
    const a = recommendArchetype({ category: "Day Spa", confidenceScore: 70 });
    const b = recommendArchetype({ category: "Day Spa", confidenceScore: 70 });
    expect(a).toEqual(b);
  });
});
