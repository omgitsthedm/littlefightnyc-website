/* answersArt — the /answers/ template’s structural map.
 *
 * Two derived layers, all keyed off the authored guides in site.ts:
 *  1. slug → archetype: which of the 6 branded art pieces a guide carries
 *     (public/assets/answers-<archetype>.webp, generated in the journal-art
 *     language; scripts/prerender-seo.mjs mirrors this for og:image).
 *  2. clusters: the hub’s symptom grouping — every slug appears exactly once.
 */

type AnswerArchetype =
  | "urgent"
  | "versus"
  | "pin"
  | "bill"
  | "envelope"
  | "question";

const ARCHETYPE_BY_SLUG: Record<string, AnswerArchetype> = {
  // Urgent — warning/triage motif
  "website-down-emergency-nyc": "urgent",
  "pos-system-down-restaurant-nyc": "urgent",
  "google-business-profile-suspended": "urgent",
  // Email & forms — envelope motif
  "website-form-not-working-small-business": "envelope",
  "business-email-going-to-spam": "envelope",
  // Google & maps — pin motif
  "business-not-showing-on-google-maps": "pin",
  "google-reviews-not-showing-up": "pin",
  "is-local-seo-worth-it-reddit": "pin",
  "google-business-profile-tips-reddit": "pin",
  // Money-saving — bill/scissors motif
  "reduce-monthly-software-costs-small-business": "bill",
  "hair-salon-save-money-software": "bill",
  // Comparisons and choosing help — versus motif
  "when-custom-business-system-beats-saas": "versus",
  "best-web-designer-nyc-reddit": "versus",
  "best-web-design-agency-nyc-reddit": "versus",
  "small-business-it-support-nyc-reddit-recommendations": "versus",
  "how-to-find-good-it-guy-reddit": "versus",
  "squarespace-vs-hiring-web-designer-reddit": "versus",
  "wix-vs-custom-website-reddit": "versus",
  "web-developer-ghosted-me-reddit": "versus",
  "best-pos-system-small-business-reddit": "versus",
  "square-vs-toast-reddit": "versus",
  "glossgenius-vs-square-appointments-reddit": "versus",
  "shopify-vs-squarespace-reddit": "versus",
  "does-my-small-business-need-a-website-reddit": "versus",
  "airtable-vs-notion-reddit-small-business": "versus",
  "nyc-small-business-tech-help-reddit": "versus",
  "instagram-instead-of-a-website-nyc-shop": "versus",
  "wordpress-vs-custom-website-small-business": "versus",
  // Default — question motif
  "local-pharmacy-website-community-support": "question",
};

export function answerArchetype(slug: string): AnswerArchetype {
  return ARCHETYPE_BY_SLUG[slug] ?? "question";
}

/** Base webp path; -480/-640/-900 variants exist for responsiveImageProps. */
export function answerArt(slug: string): string {
  return `/assets/answers-${answerArchetype(slug)}.webp`;
}

/**
 * Each owner answer gets one compact visual read before the full explanation.
 *
 * The three diagram guides have a concrete customer-path shape already stated
 * in their authored copy. Existing side-by-side comparisons use their
 * source-derived diagrams. Every other guide uses its own four authored
 * sections as a numbered readout, so a newly added guide can never silently
 * ship without a visual explanation.
 */
export type AnswerVisualKind = "diagram" | "stepper";

const DIAGRAM_GUIDES = new Set([
  "website-form-not-working-small-business",
  "reduce-monthly-software-costs-small-business",
  "business-not-showing-on-google-maps",
]);

export function answerVisualKind(slug: string): AnswerVisualKind {
  if (DIAGRAM_GUIDES.has(slug)) return "diagram";
  return "stepper";
}

/* ---- Hub clusters — symptom-first grouping ------------------------------ */

export type AnswerCluster = {
  key: string;
  /** Mono section label. */
  label: string;
  /** The symptom, in the owner’s words. */
  title: string;
  slugs: string[];
};

export const ANSWER_CLUSTERS: AnswerCluster[] = [
  {
    key: "urgent",
    label: "Fix it right now",
    title: "Something is broken and it is costing you today.",
    slugs: [
      "website-down-emergency-nyc",
      "pos-system-down-restaurant-nyc",
      "google-business-profile-suspended",
      "computer-security-for-small-business-ny",
    ],
  },
  {
    key: "email",
    label: "Email & forms",
    title: "Messages are getting lost on the way to you.",
    slugs: [
      "website-form-not-working-small-business",
      "business-email-going-to-spam",
    ],
  },
  {
    key: "google",
    label: "Google & maps",
    title: "People search nearby and find someone else.",
    slugs: [
      "business-not-showing-on-google-maps",
      "google-reviews-not-showing-up",
      "is-local-seo-worth-it-reddit",
      "google-business-profile-tips-reddit",
    ],
  },
  {
    key: "costs",
    label: "Costs & fit",
    title: "The monthly bill hurts, or the tool no longer fits.",
    slugs: [
      "reduce-monthly-software-costs-small-business",
      "hair-salon-save-money-software",
      "local-pharmacy-website-community-support",
      "website-design-for-small-business-nyc",
    ],
  },
  {
    key: "compare",
    label: "Compare before you buy",
    title: "Two roads, weighed honestly — bias named.",
    slugs: [
      "wix-vs-custom-website-reddit",
      "squarespace-vs-hiring-web-designer-reddit",
      "shopify-vs-squarespace-reddit",
      "square-vs-toast-reddit",
      "glossgenius-vs-square-appointments-reddit",
      "airtable-vs-notion-reddit-small-business",
      "best-pos-system-small-business-reddit",
      "when-custom-business-system-beats-saas",
      "does-my-small-business-need-a-website-reddit",
      "instagram-instead-of-a-website-nyc-shop",
      "wordpress-vs-custom-website-small-business",
    ],
  },
  {
    key: "help",
    label: "Finding good help",
    title: "Who actually does the work — and can you trust them?",
    slugs: [
      "best-web-designer-nyc-reddit",
      "best-web-design-agency-nyc-reddit",
      "small-business-it-support-nyc-reddit-recommendations",
      "how-to-find-good-it-guy-reddit",
      "web-developer-ghosted-me-reddit",
      "nyc-small-business-tech-help-reddit",
      "it-consultants-for-small-business-nyc",
    ],
  },
];

// Kept as a shared component contract while comparison pages use the authored
// stepper. A future verdict needs source-linked fields before it may render.
type AnswerVerdictColumn = {
  name: string;
  goodIf: string[];
  skipIf: string[];
};

export type AnswerVerdict = {
  kicker: string;
  columns: [AnswerVerdictColumn, AnswerVerdictColumn];
  note?: string;
};
