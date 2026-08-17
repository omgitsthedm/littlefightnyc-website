/**
 * Homepage-sized portfolio proof. The case-study audit compares every field
 * (including the lead story beats and case types) with site-cases.ts so this
 * small initial chunk cannot drift from the full canonical portfolio catalog.
 */
export const HOME_FEATURED_WORK = [
  {
    slug: "hair-by-rachel-charles",
    name: "Hair By Rachel Charles",
    type: "Solo stylist salon",
    label: "The booking handoff",
    outcome:
      "A new client can book without a DM detour. The site explains Rachel’s work. Then it hands off to the booking tool they already know.",
    image: "/assets/case-hair-by-rachel-charles.webp",
    imageWidth: 1600,
    imageHeight: 1200,
    source: "https://hairbyrachelcharles.com",
    sourceLabel: "hairbyrachelcharles.com",
    verifiedAt: "2026-08-13",
    story: {
      title: "A new client can find the salon, see the work, and book. No Instagram DM needed.",
      problem:
        "A solo stylist ran her whole business through Instagram and word of mouth. No website. No Google profile. No clear way to book.",
      kept: "Rachel’s point of view, the work itself, and the Square Appointments setup her clients already knew.",
      changed:
        "Built a bold phone-first site that explains services, location, and what a new client should do next. The booking habit stayed the same: the site leads clearly into Square. We also set up the studio’s Google Business Profile.",
    },
  },
  {
    slug: "cc-films",
    name: "CC Films",
    type: "Film production company",
    label: "The official film path",
    outcome:
      "Press, festival audiences, and viewers have one official place to watch, read, and find the next step.",
    image: "/assets/case-cc-films.webp",
    imageWidth: 1600,
    imageHeight: 1200,
    source: "https://ccfilms.net",
    sourceLabel: "ccfilms.net",
    verifiedAt: "2026-08-13",
  },
  {
    slug: "clearhelp",
    name: "ClearHelp",
    type: "Help service",
    label: "One intake, a clear handoff",
    outcome:
      "Someone asking for help gets a clear public starting point while the team receives the request in the protected system built to handle it.",
    image: "/assets/case-clearhelp.webp",
    imageWidth: 1440,
    imageHeight: 1080,
    source: "https://clearhelp.org",
    sourceLabel: "clearhelp.org",
    verifiedAt: "2026-08-13",
  },
] as const;
