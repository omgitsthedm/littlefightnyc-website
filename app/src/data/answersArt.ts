/* answersArt — the /answers/ template's structural map.
 *
 * Three derived layers, all keyed off the authored guides in site.ts:
 *  1. slug → archetype: which of the 6 branded art pieces a guide carries
 *     (public/assets/answers-<archetype>.webp, generated in the journal-art
 *     language; scripts/prerender-seo.mjs mirrors this for og:image).
 *  2. clusters: the hub's symptom grouping — every slug appears exactly once.
 *  3. verdicts: for guides whose authored copy contrasts two roads, the SAME
 *     contrast restated as a good-if / skip-if table. Every line is tightened
 *     from the guide's own sections in site.ts — nothing invented, nothing
 *     priced.
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
  // Comparisons + Reddit roundups — versus motif
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

/* ---- Hub clusters — symptom-first grouping ------------------------------ */

export type AnswerCluster = {
  key: string;
  /** Mono section label. */
  label: string;
  /** The symptom, in the owner's words. */
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
    ],
  },
];

/* ---- Triage detection ---------------------------------------------------- */

/**
 * A guide whose authored sections open with "What to check first" reads as an
 * ordered triage sequence — render those sections as a numbered stepper rail
 * instead of plain stacked prose. Purely structural: the authored order IS
 * the content.
 */
export function isTriageGuide(sections: Array<{ heading: string }>): boolean {
  return sections[0]?.heading === "What to check first";
}

/* ---- Verdict tables ------------------------------------------------------ */

type AnswerVerdictColumn = {
  name: string;
  goodIf: string[];
  skipIf: string[];
};

export type AnswerVerdict = {
  /** Mono kicker above the table. */
  kicker: string;
  columns: [AnswerVerdictColumn, AnswerVerdictColumn];
  /** The guide's own honesty line, quoted under the table. */
  note?: string;
};

export const ANSWER_VERDICTS: Record<string, AnswerVerdict> = {
  "squarespace-vs-hiring-web-designer-reddit": {
    kicker: "The honest split",
    columns: [
      {
        name: "Build it yourself",
        goodIf: [
          "The business is simple: hours, photos, and a contact path",
          "You have a decent eye — and you genuinely have the hours",
          "You need a clean site live fast",
        ],
        skipIf: [
          "The draft has sat half-finished for months",
          "The weekend the site was supposed to take does not exist",
        ],
      },
      {
        name: "Hire a designer",
        goodIf: [
          "The site must produce revenue from calls, bookings, or orders",
          "You need custom features, local search work, or booking and ordering integrations",
          "A half-built draft has been quietly stealing your Sundays",
        ],
        skipIf: [
          "A template already covers the actual need",
          "Deciding what to say is the only hard part left — the tool was never the problem",
        ],
      },
    ],
    note: "Either way, the consult is free and there is no pitch. Plenty of owners leave that call with a plan to finish it themselves.",
  },
  "wix-vs-custom-website-reddit": {
    kicker: "The honest split",
    columns: [
      {
        name: "Wix",
        goodIf: [
          "You need a presence this month and the budget is tight",
          "A template covers the actual need",
          "A clean Wix site beats no site — and beats an expensive site that takes six months",
        ],
        skipIf: [
          "You may need to leave later — a Wix site cannot be meaningfully exported",
          "The website is a revenue channel: bookings, orders, steady calls",
        ],
      },
      {
        name: "Custom build",
        goodIf: [
          "The website is a revenue channel: bookings, orders, steady calls",
          "You need speed, local search structure, and integrations a template fights you on",
        ],
        skipIf: [
          "A template covers the need — then custom is wasted money",
          "Nothing measurable is broken and you would only be rebuilding out of shame",
        ],
      },
    ],
    note: "Rebuild when something measurable is broken: speed, visibility, conversions, or your ability to leave.",
  },
  "square-vs-toast-reddit": {
    kicker: "The crowd verdict, checked",
    columns: [
      {
        name: "Square",
        goodIf: [
          "Counter service, cafes, retail hybrids, or a food truck",
          "You want simple, transparent fees and hardware you own outright",
        ],
        skipIf: [
          "Table service, coursing, and kitchen timing enter the picture — Square strains there",
        ],
      },
      {
        name: "Toast",
        goodIf: [
          "A full-service restaurant",
          "You need kitchen display, table and course management, and online ordering that understands food",
        ],
        skipIf: [
          "A counter-service spot where the hardware and contracts feel heavy",
          "Contract weight and add-on creep would sting",
        ],
      },
    ],
    note: "A well-configured second choice beats a sloppily configured first choice every week.",
  },
  "glossgenius-vs-square-appointments-reddit": {
    kicker: "The crowd verdict, checked",
    columns: [
      {
        name: "GlossGenius",
        goodIf: [
          "You are an independent stylist or chair renter",
          "You want polished booking pages and a flat, predictable subscription",
          "The whole experience should flatter a personal brand",
        ],
        skipIf: [
          "You run staff calendars, retail products, and higher volume under one roof",
        ],
      },
      {
        name: "Square Appointments",
        goodIf: [
          "A salon with employees, retail, and higher volume",
          "You want the free solo tier and cheap card hardware",
          "Payments, payroll, and inventory should live in one ecosystem",
        ],
        skipIf: [
          "You are solo and the booking page IS the brand",
        ],
      },
    ],
    note: "The unhappy owners we meet are rarely on the wrong app — they are on the right app configured wrong.",
  },
  "shopify-vs-squarespace-reddit": {
    kicker: "The honest sorting",
    columns: [
      {
        name: "Shopify",
        goodIf: [
          "The register and shelves must share truth with the website",
          "You need real inventory management and a POS that syncs with the online store",
        ],
        skipIf: [
          "Online selling is secondary — the app-fee creep is a toll you do not need",
        ],
      },
      {
        name: "Squarespace",
        goodIf: [
          "Online selling is secondary: a presence, a catalog, occasional orders",
          "You want beautiful templates and a simple, cheaper setup",
        ],
        skipIf: [
          "Selling online becomes the main event — you will feel the limits",
        ],
      },
    ],
    note: "The most common mistake we clean up is not the wrong platform — it is two disconnected systems reconciled by hand at midnight.",
  },
  "airtable-vs-notion-reddit-small-business": {
    kicker: "The docs-versus-records rule",
    columns: [
      {
        name: "Airtable",
        goodIf: [
          "Structured records: clients, orders, inventory",
          "Anything with fields you filter and count",
        ],
        skipIf: [
          "What you really need is documents, wikis, and written-down processes",
        ],
      },
      {
        name: "Notion",
        goodIf: [
          "Documents, wikis, notes, and processes — anything you would explain or write down",
        ],
        skipIf: [
          "You would force it to be a database — messy tables that hide errors",
          "Nobody owns the workspace's tidiness — it decays into a junk drawer within months",
        ],
      },
    ],
    note: "The system must survive the least technical employee on their busiest day.",
  },
  "when-custom-business-system-beats-saas": {
    kicker: "Weigh it honestly",
    columns: [
      {
        name: "Keep the subscription",
        goodIf: [
          "The tool handles most of the work, has good support, and the team uses it daily",
          "It mostly works and just needs connecting — the better and cheaper move",
        ],
        skipIf: [
          "The real numbers live in a spreadsheet next to the platform you pay for",
          "The same job gets typed into two systems",
          "Staff work around the tool instead of through it",
        ],
      },
      {
        name: "Build the missing piece",
        goodIf: [
          "The missing piece is specific: a right-sized dashboard, intake path, or follow-up flow",
          "The monthly bill is real, the lost staff time is real, and you will use it for years",
        ],
        skipIf: [
          "Custom is not always cheaper — a connected off-the-shelf tool covers it",
          "You would use the system for months, not years",
        ],
      },
    ],
    note: "We only suggest building when the numbers clearly beat one more subscription.",
  },
  "does-my-small-business-need-a-website-reddit": {
    kicker: "Where your next customer comes from",
    columns: [
      {
        name: "Skip it, for now",
        goodIf: [
          "Your books are full, your customers are loyal, and you have no growth ambitions",
          "Referrals forever is a real plan for you — and it is working",
        ],
        skipIf: [
          "Your next customer is a stranger searching — new residents, tourists, anyone outside your circle",
        ],
      },
      {
        name: "Own your ground",
        goodIf: [
          "Customers find you through Google or AI assistants — answers assembled from websites",
          "You are done building on rented land: suspended accounts, buried pages, overnight rule changes",
        ],
        skipIf: [
          "Word of mouth genuinely keeps you booked and you want nothing more",
        ],
      },
    ],
    note: "Both camps agree on one floor: keep your Google Business Profile complete and alive — that is where local customers actually look first.",
  },
  "best-web-design-agency-nyc-reddit": {
    kicker: "Match the help to the job",
    columns: [
      {
        name: "Big agency",
        goodIf: [
          "Big scopes: a brand overhaul, a national campaign, a complex build with many moving parts",
          "A rebrand across forty locations needs a real bench",
        ],
        skipIf: [
          "You get quoted like a startup: long discovery, retainers, deliverables you did not ask for",
          "The person you meet will not be the person who builds",
        ],
      },
      {
        name: "Small studio",
        goodIf: [
          "You need a site that gets your phone ringing",
          "You want one accountable person, a shorter timeline, and promises in writing",
        ],
        skipIf: [
          "The scope genuinely needs a big firm's bench",
        ],
      },
    ],
    note: "Ask every candidate exactly who will touch your project, by name and role. If the answer is vague, the work will be too.",
  },
};
