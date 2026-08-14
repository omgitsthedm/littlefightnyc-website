/**
 * Homepage-sized portfolio proof. The case-study audit compares every field
 * with site-cases.ts so this small initial chunk cannot drift from the full
 * canonical portfolio catalog.
 */
export const HOME_FEATURED_WORK = [
  {
    slug: "hair-by-rachel-charles",
    name: "Hair By Rachel Charles",
    label: "The booking handoff",
    outcome:
      "A new client can understand Rachel's work and reach the booking tool they already know without a DM detour.",
    image: "/assets/case-hair-by-rachel-charles.webp",
    imageWidth: 1600,
    imageHeight: 1200,
    source: "https://hairbyrachelcharles.com",
    sourceLabel: "hairbyrachelcharles.com",
    verifiedAt: "2026-08-13",
  },
  {
    slug: "cc-films",
    name: "CC Films",
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
