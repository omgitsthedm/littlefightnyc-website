/**
 * The six trades in the first screen.
 *
 * The homepage hero is a row of live client sites, and its whole job is range:
 * a painting contractor, a lender, a film company, a help service, a clothing
 * label, a salon. A visitor should recognise someone like themselves before
 * reading a word.
 *
 * This is deliberately a tiny module rather than an import of the full case
 * catalog. `site-cases.ts` is 52KB and lazily chunked; pulling it into the
 * hero dragged the whole portfolio into the eager marketing entry and blew the
 * bundle budget by 15KB. audit-case-study-explorer.mjs compares every field
 * here against site-cases.ts — including that each slug is still PUBLIC — so
 * this cannot drift from the canonical catalog, and a case that goes private
 * fails the build rather than quietly shipping.
 */
export const HOME_WALL = [
  {
    slug: "chromatic-painting-design",
    client: "Chromatic Painting & Design",
    /** Plain-English trade. A case `type` is written for the case page. */
    trade: "Painting contractor",
  },
  { slug: "grand-funding-llc", client: "Grand Funding LLC", trade: "Lender" },
  { slug: "cc-films", client: "CC Films", trade: "Film company" },
  { slug: "clearhelp", client: "ClearHelp", trade: "Help service" },
  { slug: "after-hours-agenda", client: "After Hours Agenda", trade: "Clothing label" },
  { slug: "hair-by-rachel-charles", client: "Hair By Rachel Charles", trade: "Salon" },
] as const;
