import type { DakotaPrivateOfferCode, DakotaPrivatePriceBand } from "./revenue-bridge-schema";

export const DAKOTA_OFFER_CATALOG_VERSION = "2026-08-03" as const;

export type DakotaOfferPricingModel = "custom" | "fixed" | "range" | "retainer";
export type DakotaOfferCadence = "one_time" | "monthly" | null;

export interface DakotaOffer {
  offerId: string;
  bridgeOfferCode: DakotaPrivateOfferCode;
  bridgePriceBand: DakotaPrivatePriceBand;
  catalogVersion: typeof DAKOTA_OFFER_CATALOG_VERSION;
  name: string;
  shortName: string;
  audience: "storefront" | "agency" | "any";
  pricingModel: DakotaOfferPricingModel;
  minAmount: number | null;
  maxAmount: number | null;
  cadence: DakotaOfferCadence;
  scopeSummary: string;
  proofPrompts: string[];
  stagePlaybook: string[];
  active: boolean;
}

/**
 * Private operator catalog. This module is server-only: approved internal price
 * truth must never be imported into a public Vite bundle or rendered on the
 * marketing site.
 */
export const DAKOTA_OFFER_CATALOG: readonly DakotaOffer[] = [
  {
    offerId: "website-conversion-sprint",
    bridgeOfferCode: "custom_scoped",
    bridgePriceBand: "private_custom",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "Website conversion sprint",
    shortName: "Website sprint",
    audience: "storefront",
    pricingModel: "custom",
    minAmount: null,
    maxAmount: null,
    cadence: "one_time",
    scopeSummary: "One evidence-backed website or customer-path problem, scoped to the smallest useful launchable fix.",
    proofPrompts: ["Verified customer-path friction", "Current site or system evidence", "One measurable completion signal"],
    stagePlaybook: ["Confirm the exact conversion path", "Write the smallest useful scope", "Match relevant proof", "Set owner, deadline, and acceptance test"],
    active: true,
  },
  {
    offerId: "new-business-launch",
    bridgeOfferCode: "new_business_launch",
    bridgePriceBand: "private_custom",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "Connected new-business launch",
    shortName: "Business launch",
    audience: "storefront",
    pricingModel: "custom",
    minAmount: null,
    maxAmount: null,
    cadence: "one_time",
    scopeSummary: "Domain, website, Google presence, business email, booking or inquiry path, follow-up, measurement, and ownership handoff.",
    proofPrompts: ["Launch date or opening window", "Missing customer path", "Decision maker and access owner"],
    stagePlaybook: ["Confirm launch facts", "Inventory accounts and access", "Scope the public customer path", "Define launch QA and ownership handoff"],
    active: true,
  },
  {
    offerId: "ongoing-care",
    bridgeOfferCode: "ongoing_care",
    bridgePriceBand: "private_custom",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "Ongoing website and systems care",
    shortName: "Ongoing care",
    audience: "storefront",
    pricingModel: "custom",
    minAmount: null,
    maxAmount: null,
    cadence: "monthly",
    scopeSummary: "A bounded recurring care plan for agreed website, account, measurement, and operational follow-through.",
    proofPrompts: ["Recurring maintenance burden", "Named systems in scope", "Response and approval owner"],
    stagePlaybook: ["List recurring failure points", "Define the monthly boundary", "Set response expectations", "Name the client-owned accounts and exit handoff"],
    active: true,
  },
  {
    offerId: "agency-scoped-test",
    bridgeOfferCode: "scoped_test_task",
    bridgePriceBand: "scoped_after_review",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "Small scoped agency test task",
    shortName: "Scoped test",
    audience: "agency",
    pricingModel: "custom",
    minAmount: null,
    maxAmount: null,
    cadence: "one_time",
    scopeSummary: "One annoying, bounded delivery task completed white-label with a clean QA and handoff summary.",
    proofPrompts: ["Exact URL, repository, or files", "Desired outcome and deadline", "Brand constraints and approval owner"],
    stagePlaybook: ["Confirm the six-point intake", "Fence the scope", "Deliver one useful result", "Ask whether the friction repeats"],
    active: true,
  },
  {
    offerId: "agency-white-label-overflow",
    bridgeOfferCode: "white_label_overflow_retainer",
    bridgePriceBand: "usd_1000_monthly",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "White-label overflow retainer",
    shortName: "Overflow retainer",
    audience: "agency",
    pricingModel: "retainer",
    minAmount: 1_000,
    maxAmount: 1_000,
    cadence: "monthly",
    scopeSummary: "One active request at a time, fast turnaround on small tasks, with larger work broken into separately approved scoped chunks.",
    proofPrompts: ["A successful test task", "Positive acknowledgement", "Recurring overflow at least monthly"],
    stagePlaybook: ["Complete the test cleanly", "Wait for positive acknowledgement", "Confirm recurring demand", "Propose the bounded monthly setup"],
    active: true,
  },
  {
    offerId: "ai-friction-audit",
    bridgeOfferCode: "ai_friction_audit",
    bridgePriceBand: "usd_500_2000",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "AI friction audit",
    shortName: "Friction audit",
    audience: "agency",
    pricingModel: "range",
    minAmount: 500,
    maxAmount: 2_000,
    cadence: "one_time",
    scopeSummary: "A one-page, five-point review of real intake, reporting, follow-up, audit, or asset-collection friction.",
    proofPrompts: ["Trust is established", "Observed repeatable admin drag", "A workflow owner can validate the current process"],
    stagePlaybook: ["Map the current handoff", "Name five evidence-backed friction points", "Estimate the smallest setup range", "Stop and scope if it becomes strategy"],
    active: true,
  },
  {
    offerId: "ai-workflow-build",
    bridgeOfferCode: "ai_workflow_build",
    bridgePriceBand: "usd_1500_10000_setup",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "AI workflow build",
    shortName: "Workflow build",
    audience: "agency",
    pricingModel: "range",
    minAmount: 1_500,
    maxAmount: 10_000,
    cadence: "one_time",
    scopeSummary: "A bounded workflow build tied to a proven operational bottleneck, with human approval and an explicit fallback path.",
    proofPrompts: ["Audit proves a bottleneck", "Human owner and approval point", "Input, output, and failure path are known"],
    stagePlaybook: ["Define the current manual path", "Choose one bounded workflow", "Specify approval and failure handling", "Pilot before expanding"],
    active: true,
  },
  {
    offerId: "automation-maintenance",
    bridgeOfferCode: "automation_maintenance",
    bridgePriceBand: "usd_3000_5000_monthly",
    catalogVersion: DAKOTA_OFFER_CATALOG_VERSION,
    name: "Automation maintenance",
    shortName: "Automation care",
    audience: "agency",
    pricingModel: "retainer",
    minAmount: 3_000,
    maxAmount: 5_000,
    cadence: "monthly",
    scopeSummary: "Ongoing monitoring, repair, QA, and controlled improvement for an automation already producing demonstrated value.",
    proofPrompts: ["Workflow is live", "Value is demonstrated", "Monitoring and escalation boundaries are agreed"],
    stagePlaybook: ["Confirm production value", "Inventory dependencies", "Set service and escalation boundaries", "Review value and failure data monthly"],
    active: true,
  },
] as const;

export function activeDakotaOffers(): DakotaOffer[] {
  return DAKOTA_OFFER_CATALOG.filter((offer) => offer.active).map((offer) => ({
    ...offer,
    proofPrompts: [...offer.proofPrompts],
    stagePlaybook: [...offer.stagePlaybook],
  }));
}

export function resolveDakotaOffer(offerId: string): DakotaOffer | null {
  const offer = DAKOTA_OFFER_CATALOG.find((candidate) => candidate.offerId === offerId);
  return offer
    ? { ...offer, proofPrompts: [...offer.proofPrompts], stagePlaybook: [...offer.stagePlaybook] }
    : null;
}
