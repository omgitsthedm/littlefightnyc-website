// Public, bounded labels for approved organic campaigns. No recipient identifiers.
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

export const NEXT_SOCIAL_CAMPAIGN = "next_chapter_2026_09";
export const NEXT_SOCIAL_POSTS = new Set([
  "la01-seafood-markets",
  "g01-independent-bike-shops",
  "la02-rv-parks",
  "g02-tailors-and-alteration-shops",
  "la03-campgrounds",
  "g03-pilates-studios",
  "la04-fishing-charters",
  "g04-independent-jewelers",
  "la05-crawfish-stays-and-b-bs",
  "g05-landscaping-companies",
  "la06-marinas-and-rv-parks",
  "g06-music-schools",
  "la07-oyster-restaurants",
  "g07-nyc-laundromats",
  "la08-outdoor-guide-businesses",
  "g08-pottery-studios",
  "la09-meat-markets-and-grocers",
  "g09-independent-opticians",
  "la10-bed-and-breakfasts",
  "g10-plumbing-companies",
  "la11-food-producers-and-tours",
  "g11-photography-studios",
  "la12-fishing-lodges",
  "g12-dance-schools",
  "la13-cottage-stays",
  "g13-dog-walkers-and-pet-sitters",
  "la14-rv-resorts",
  "g14-independent-art-galleries",
  "la15-bakeries",
  "g15-home-organizing-businesses",
  "la16-event-venues",
  "g16-electrical-contractors",
  "la17-seafood-restaurants",
  "g17-nyc-specialty-grocers",
  "la18-farm-tours-and-local-experiences",
  "g18-sign-making-shops",
  "la19-beach-cottages",
  "g19-tutoring-centers",
  "la20-waterfront-restaurants",
  "g20-locksmith-businesses",
  "la21-specialty-food-markets",
  "g21-watch-repair-shops",
  "la22-coffee-businesses",
  "la23-vacation-rental-owners",
  "la24-celebration-venues",
  "la25-garden-attractions",
  "la26-independent-pizza-restaurants",
  "la27-outdoor-dining-businesses",
  "la28-guest-houses",
  "la29-neighborhood-food-markets",
  "la30-rv-parks",
]);

export const EMAIL_CAMPAIGN = "louisiana_business_2026_09";
const EMAIL_TOPICS = new Set([...NEXT_SOCIAL_POSTS].filter((label) => label.startsWith("la")));

export function socialCampaignParameters(search: URLSearchParams): URLSearchParams | null {
  const source = search.get("utm_source");
  const content = search.get("utm_content");
  const campaign = search.get("utm_campaign");
  const posts = campaign === SOCIAL_CAMPAIGN ? SOCIAL_POSTS
    : campaign === NEXT_SOCIAL_CAMPAIGN ? NEXT_SOCIAL_POSTS : null;
  if (!["facebook", "instagram"].includes(source ?? "") ||
      search.get("utm_medium") !== "organic_social" ||
      !campaign || !content || !posts?.has(content)) return null;
  return new URLSearchParams({ utm_source: source!, utm_medium: "organic_social",
    utm_campaign: campaign, utm_content: content });
}

export function publicCampaignParameters(search: URLSearchParams): URLSearchParams | null {
  const social = socialCampaignParameters(search);
  if (social) return social;
  const content = search.get("utm_content");
  if (search.get("utm_source") !== "outreach" || search.get("utm_medium") !== "email" ||
      search.get("utm_campaign") !== EMAIL_CAMPAIGN || !content || !EMAIL_TOPICS.has(content)) return null;
  return new URLSearchParams({ utm_source: "outreach", utm_medium: "email",
    utm_campaign: EMAIL_CAMPAIGN, utm_content: content });
}
