import measurementPaths from "../data/measurement-paths.json" with { type: "json" };

/*
 * A Tech Audit origin is useful only when it identifies one of our public
 * entry surfaces. It must never become a free-form query field: URLs can
 * contain an owner's business, a shared report, or a recipient identifier.
 */
const CANONICAL_PUBLIC_PATHS = new Set<string>(measurementPaths);

const LEGACY_ENTRY_SOURCES = new Set([
  "ads_review",
  "audit-lab",
  "chatgpt",
  "contact",
  "contact_block",
  "es",
  "es_hero_form",
  "google_ad",
  "home",
  "industry_law_firms",
  "industry_luxury_home_services",
  "industry_roofing",
  "lab",
  "lab_brand_campaign",
  "lab_business_systems",
  "lab_cinema",
  "lab_construction",
  "lab_motion_playground",
  "lab_pool-room",
  "lab_spatial_nyc",
  "lab_terminal-3d",
  "lab_walkup-3d",
  "mobile_menu_form",
  "myspace_archive_note",
  "myspace_contact",
  "myspace_footer",
  "myspace_sticky",
  "myspace_url_box",
  "navigation",
  "no_website_check",
  "owner_stories",
  "page_hero",
  "page_hero_form",
  "sticky_help",
  "website_check_page",
  "website_first_look_scope",
  "website_service_proof",
  "zh",
  "zh_hero_form",
]);

for (const path of CANONICAL_PUBLIC_PATHS) {
  const caseStudy = path.match(/^\/case-studies\/([a-z0-9-]+)\/$/u)?.[1];
  if (!caseStudy) continue;
  LEGACY_ENTRY_SOURCES.add(`case_${caseStudy}`);
  LEGACY_ENTRY_SOURCES.add(`case_${caseStudy}_hero`);
}

/**
 * Returns an established short entry label or an exact, canonical first-party
 * reader path. Query strings, fragments, unlisted routes, and any remote URL
 * are rejected so form attribution stays public and non-sensitive.
 */
export function safeTechAuditLeadOrigin(value: unknown): string {
  const source = typeof value === "string" ? value.trim() : "";
  if (!source || source.length > 160) return "";
  if (LEGACY_ENTRY_SOURCES.has(source)) return source;
  if (!source.startsWith("/") || source.startsWith("//")) return "";

  let url: URL;
  try {
    url = new URL(source, "https://littlefightnyc.com");
  } catch {
    return "";
  }
  if (
    url.origin !== "https://littlefightnyc.com" ||
    url.search ||
    url.hash ||
    url.pathname !== source ||
    !CANONICAL_PUBLIC_PATHS.has(url.pathname)
  ) {
    return "";
  }
  return url.pathname;
}
