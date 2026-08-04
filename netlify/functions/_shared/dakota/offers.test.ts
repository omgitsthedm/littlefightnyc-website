import { describe, expect, it } from "vitest";

import {
  activeDakotaOffers,
  DAKOTA_OFFER_CATALOG_VERSION,
  resolveDakotaOffer,
} from "./offers";
import { isCompatiblePrivateOffer } from "./revenue-bridge-schema";

describe("Dakota private offer catalog", () => {
  it("has stable unique IDs and the approved internal price truth", () => {
    const offers = activeDakotaOffers();
    expect(new Set(offers.map((offer) => offer.offerId)).size).toBe(offers.length);
    expect(offers.every((offer) => offer.catalogVersion === DAKOTA_OFFER_CATALOG_VERSION)).toBe(true);
    expect(offers.every((offer) => isCompatiblePrivateOffer(offer.bridgeOfferCode, offer.bridgePriceBand))).toBe(true);
    expect(resolveDakotaOffer("agency-white-label-overflow")).toMatchObject({
      bridgeOfferCode: "white_label_overflow_retainer",
      bridgePriceBand: "usd_1000_monthly",
      pricingModel: "retainer",
      minAmount: 1_000,
      maxAmount: 1_000,
      cadence: "monthly",
    });
    expect(resolveDakotaOffer("ai-friction-audit")).toMatchObject({
      minAmount: 500,
      maxAmount: 2_000,
    });
    expect(resolveDakotaOffer("ai-workflow-build")).toMatchObject({
      minAmount: 1_500,
      maxAmount: 10_000,
    });
    expect(resolveDakotaOffer("automation-maintenance")).toMatchObject({
      minAmount: 3_000,
      maxAmount: 5_000,
      cadence: "monthly",
    });
  });

  it("returns defensive copies and no unknown offer", () => {
    const first = resolveDakotaOffer("agency-scoped-test");
    expect(first).not.toBeNull();
    first?.proofPrompts.push("mutation");
    expect(resolveDakotaOffer("agency-scoped-test")?.proofPrompts).not.toContain("mutation");
    expect(resolveDakotaOffer("unknown")).toBeNull();
  });
});
