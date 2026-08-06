/**
 * Category and tier to one website archetype, plus the offer that fits it.
 *
 * DAKOTA's only job here is to *recommend* a shape. The build contract that
 * follows is the website delivery standard, not this file. Every rule is pure
 * local computation: no network, no model call, deterministic and testable.
 *
 * Hard rules, enforced by tests:
 *  - exactly one primary archetype is ever returned;
 *  - nothing is invented — every archetype id below exists in the catalogue and
 *    every offer id resolves in the offer catalog;
 *  - a recommendation always carries its reason and its limitations;
 *  - low evidence confidence downgrades the recommendation to research rather
 *    than producing a confident pitch.
 */

import { resolveDakotaOffer, type DakotaOffer } from "./offers";

export const DAKOTA_ARCHETYPE_MAP_VERSION = "2026-08-06" as const;

export type CategoryTier = "A" | "B" | "C" | "eligible" | "unknown";

export interface ArchetypeRecommendation {
  archetypeId: string;
  archetypeName: string;
  /** Why this shape, in the business's terms. Never a dollar figure. */
  reason: string;
  /** What we could not verify. Always populated when evidence is thin. */
  limitations: string[];
  /** Modules the evidence actually supports. Never speculative. */
  modules: string[];
  offerId: string | null;
  offer: DakotaOffer | null;
  confidenceGate: "recommend" | "research_first";
}

interface ArchetypeRule {
  id: string;
  name: string;
  /** Matched against the normalised category, most specific first. */
  terms: readonly string[];
  reason: string;
  modules: readonly string[];
  offerId: string;
}

/**
 * Ordered most specific first. The first match wins, which is what guarantees
 * exactly one primary archetype.
 */
const RULES: readonly ArchetypeRule[] = [
  {
    id: "restaurant-first",
    name: "Restaurant-First",
    terms: ["restaurant", "cafe", "coffee", "bakery", "tavern", "bar", "catering", "food", "deli", "pizzeria"],
    reason:
      "People check the menu, the hours and the location before they decide. Those three things have to be readable on a phone in seconds.",
    modules: ["Menu", "Hours and location", "Order or reserve path", "Photos of the room and the food"],
    offerId: "website-conversion-sprint",
  },
  {
    id: "portfolio-gallery-first",
    name: "Portfolio: Gallery-First",
    terms: ["photo", "photography", "florist", "jewelry", "jeweler", "art", "gallery", "tattoo", "design"],
    reason:
      "The work is the sales pitch. The site exists to show it at a size that does it justice, then make enquiring obvious.",
    modules: ["Gallery", "Enquiry path", "Pricing or process explanation", "Proof and testimonials"],
    offerId: "website-conversion-sprint",
  },
  {
    id: "booking-first",
    name: "Conversion-First One-Page (booking-led)",
    terms: [
      "spa", "salon", "nail", "barber", "hair", "beauty", "massage", "wellness",
      "clinic", "dental", "dentist", "therapy", "fitness", "gym", "studio", "yoga", "pilates",
    ],
    reason:
      "Customers find this kind of business by searching, then book. If booking is more than a tap or two away, they book somewhere else.",
    modules: ["Booking path", "Services and prices", "Hours and location", "Proof and reviews"],
    offerId: "website-conversion-sprint",
  },
  {
    id: "professional-services-call-first",
    name: "Straight-Ahead Professional Services (call-first)",
    terms: [
      "plumbing", "plumber", "electric", "electrical", "heating", "hvac", "locksmith", "towing",
      "repair", "moving", "movers", "cleaning", "landscaping", "painting", "construction",
      "roofing", "appliance", "contractor", "pest",
    ],
    reason:
      "This is urgent-intent work. Someone searches once, on a phone, at the moment it breaks. Tap-to-call and service area have to be the first things on screen.",
    modules: ["Tap-to-call", "Service area", "What to expect", "Proof and licensing"],
    offerId: "website-conversion-sprint",
  },
  {
    id: "small-business-brochure",
    name: "Small Business Brochure",
    terms: ["retail", "grocery", "market", "pharmacy", "laundry", "pet", "childcare", "auto", "shop", "store"],
    reason:
      "A clean, reliable presence that answers what you do, where you are and how to reach you. Nothing more is needed to start.",
    modules: ["Services", "Hours and location", "Contact path", "About"],
    offerId: "website-conversion-sprint",
  },
];

/** Fallback when a business is consumer-facing but no category term matched. */
const DEFAULT_RULE: ArchetypeRule = {
  id: "modular-one-page",
  name: "Modular One-Page Blocks",
  terms: [],
  reason:
    "The public record does not say enough about this business to commit to a shape. A modular one-pager can be rearranged once someone confirms what it actually does.",
  modules: ["Headline and offer", "Contact path", "Proof"],
  offerId: "website-conversion-sprint",
};

function normalise(value: string): string[] {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

export interface RecommendationInput {
  category: string;
  businessName?: string;
  categoryTier?: CategoryTier;
  confidenceScore?: number;
  domainStatus?: string;
  verifiedUrl?: string;
}

/**
 * One archetype, one offer, always with reasons and limits.
 *
 * `confidenceGate` is the honest half: when evidence confidence is low the
 * recommendation still returns, but flagged as research-first so the operator
 * verifies identity before pitching anything.
 */
export function recommendArchetype(input: RecommendationInput): ArchetypeRecommendation {
  const haystack = new Set([...normalise(input.category), ...normalise(input.businessName ?? "")]);
  const rule =
    RULES.find((candidate) => candidate.terms.some((term) => haystack.has(term))) ?? DEFAULT_RULE;

  const limitations: string[] = [];
  if (!input.category?.trim()) {
    limitations.push("No public category was available; the shape was inferred from the business name alone.");
  }
  if (rule === DEFAULT_RULE) {
    limitations.push("No category term matched, so this is a starting shape, not a diagnosis.");
  }
  if (input.domainStatus !== "verified" || !input.verifiedUrl) {
    limitations.push("No website has been verified for this business, so nothing is known about what already exists.");
  }
  if (input.categoryTier === "unknown") {
    limitations.push("The business was not confidently classified as consumer-facing.");
  }

  const confidence = input.confidenceScore;
  const researchFirst = typeof confidence === "number" && confidence < 60;
  if (researchFirst) {
    limitations.push("Evidence confidence is low. Confirm the business and its site before proposing anything.");
  }

  const offer = resolveDakotaOffer(rule.offerId);

  return {
    archetypeId: rule.id,
    archetypeName: rule.name,
    reason: rule.reason,
    limitations,
    modules: [...rule.modules],
    offerId: offer ? rule.offerId : null,
    offer,
    confidenceGate: researchFirst ? "research_first" : "recommend",
  };
}
