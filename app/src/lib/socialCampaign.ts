// Public, bounded labels for the approved September organic campaign.
export const SOCIAL_CAMPAIGN = "new_chapter_2026_09";
export const SOCIAL_POSTS = new Set([
  "01-interior-design-studios",
  "02-home-remodelers",
  "03-real-estate-agencies",
  "04-upholstery-shops",
  "05-accounting-firms",
  "06-independent-bookshops",
  "07-cabin-rental-businesses",
  "08-coffee-shops",
  "09-event-venues",
  "10-boutique-hotels",
  "11-restaurants",
  "12-barbershops",
  "13-pet-groomers",
  "14-auto-repair-shops",
  "15-dental-practices",
  "16-med-spas",
  "17-florists",
  "18-vintage-shops",
  "19-furniture-makers",
  "20-neighborhood-bakeries",
  "21-roofing-companies"
]);

export function socialCampaignParameters(search: URLSearchParams): URLSearchParams | null {
  const source = search.get("utm_source");
  const content = search.get("utm_content");
  if (!["facebook", "instagram"].includes(source ?? "") ||
      search.get("utm_medium") !== "organic_social" ||
      search.get("utm_campaign") !== SOCIAL_CAMPAIGN ||
      !content || !SOCIAL_POSTS.has(content)) return null;
  return new URLSearchParams({ utm_source: source!, utm_medium: "organic_social",
    utm_campaign: SOCIAL_CAMPAIGN, utm_content: content });
}
