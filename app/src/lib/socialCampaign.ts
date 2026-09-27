// Public, bounded campaign labels. No recipient or ad-click identifiers.
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

// Public creative labels for the bounded RV-owner test. These identify an ad,
// never an individual recipient, and do not enable any vendor without consent.
export const PAID_CAMPAIGN = "rv_first_look_2026_09";
const PAID_CREATIVES = new Set(["rv_guest_path", "rv_owner_control", "rv_mobile_demo"]);

// The Search preparation uses fixed creative names, never search terms or
// customer data. Recognizing these labels does not load a tag or grant consent.
export const GOOGLE_SEARCH_CAMPAIGN = "gulf_websites_search_2026_09";
const GOOGLE_SEARCH_CREATIVES = new Set([
  "search_human_help", "search_owner_control", "search_sitelink",
]);

// Fixed labels for the NYC paid-search hypothesis. These identify the public
// creative only, never a search query, recipient, or click identifier.
export const NYC_GOOGLE_SEARCH_CAMPAIGN = "nyc_websites_search_2026_09";
const NYC_GOOGLE_SEARCH_CREATIVES = new Set([
  "search_owner_control", "search_salon_booking", "search_sitelink",
]);

// Fixed labels for the NYC paid-social hypothesis. Consent still controls
// vendor loading; recognizing these labels only keeps public attribution.
export const NYC_PAID_CAMPAIGN = "nyc_first_look_2026_09";
const NYC_PAID_CREATIVES = new Set(["nyc_owner_control", "salon_booking_path"]);

// Fixed labels for the research sprint. These describe the public creative
// and route only; a person, business, search query, or click ID never belongs
// in campaign attribution.
export const LFNYC_FIRST_LOOK_CAMPAIGN = "lfnyc_first_look_2026_09";
const LFNYC_FIRST_LOOK_CREATIVES = new Set([
  "maps_clarity", "salon_booking_path", "owner_control",
]);

const BUSINESS_PROFILE_CAMPAIGN = "business_profile";
const BUSINESS_PROFILE_BOOKING_CONTENT = "booking";
const INSTAGRAM_BIO_SOURCE = "ig";
const INSTAGRAM_BIO_MEDIUM = "social";
const INSTAGRAM_BIO_CONTENT = "link_in_bio";

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
  const source = search.get("utm_source");
  const medium = search.get("utm_medium");
  const campaign = search.get("utm_campaign");
  // This exact label is already present on Little Fight's native Instagram
  // profile. It has no campaign by design; a supplied campaign is rejected.
  if (source === INSTAGRAM_BIO_SOURCE && medium === INSTAGRAM_BIO_MEDIUM &&
      content === INSTAGRAM_BIO_CONTENT && !search.has("utm_campaign")) {
    return new URLSearchParams({ utm_source: INSTAGRAM_BIO_SOURCE,
      utm_medium: INSTAGRAM_BIO_MEDIUM, utm_content: INSTAGRAM_BIO_CONTENT });
  }
  if (campaign === LFNYC_FIRST_LOOK_CAMPAIGN && content && LFNYC_FIRST_LOOK_CREATIVES.has(content) &&
      ((["facebook", "instagram"].includes(source ?? "") && medium === "organic_social") ||
       (["partner", "client"].includes(source ?? "") && medium === "referral"))) {
    return new URLSearchParams({ utm_source: source!, utm_medium: medium!,
      utm_campaign: LFNYC_FIRST_LOOK_CAMPAIGN, utm_content: content });
  }
  if (search.get("utm_source") === "google" && search.get("utm_medium") === "cpc" &&
      search.get("utm_campaign") === GOOGLE_SEARCH_CAMPAIGN && content &&
      GOOGLE_SEARCH_CREATIVES.has(content)) {
    return new URLSearchParams({ utm_source: "google", utm_medium: "cpc",
      utm_campaign: GOOGLE_SEARCH_CAMPAIGN, utm_content: content });
  }
  if (search.get("utm_source") === "google" && search.get("utm_medium") === "cpc" &&
      search.get("utm_campaign") === NYC_GOOGLE_SEARCH_CAMPAIGN && content &&
      NYC_GOOGLE_SEARCH_CREATIVES.has(content)) {
    return new URLSearchParams({ utm_source: "google", utm_medium: "cpc",
      utm_campaign: NYC_GOOGLE_SEARCH_CAMPAIGN, utm_content: content });
  }
  if (["facebook", "instagram"].includes(search.get("utm_source") ?? "") &&
      search.get("utm_medium") === "paid_social" &&
      search.get("utm_campaign") === PAID_CAMPAIGN && content && PAID_CREATIVES.has(content)) {
    return new URLSearchParams({ utm_source: search.get("utm_source")!, utm_medium: "paid_social",
      utm_campaign: PAID_CAMPAIGN, utm_content: content });
  }
  if (["facebook", "instagram"].includes(search.get("utm_source") ?? "") &&
      search.get("utm_medium") === "paid_social" &&
      search.get("utm_campaign") === NYC_PAID_CAMPAIGN && content && NYC_PAID_CREATIVES.has(content)) {
    return new URLSearchParams({ utm_source: search.get("utm_source")!, utm_medium: "paid_social",
      utm_campaign: NYC_PAID_CAMPAIGN, utm_content: content });
  }
  if (search.get("utm_source") !== "outreach" || search.get("utm_medium") !== "email" ||
      search.get("utm_campaign") !== EMAIL_CAMPAIGN || !content || !EMAIL_TOPICS.has(content)) return null;
  return new URLSearchParams({ utm_source: "outreach", utm_medium: "email",
    utm_campaign: EMAIL_CAMPAIGN, utm_content: content });
}

// Form attribution accepts the same bounded public campaign labels as
// consented measurement, plus the established Business Profile booking link.
// It intentionally never carries search terms, click IDs, or arbitrary UTMs.
export function leadCampaignParameters(search: URLSearchParams): URLSearchParams | null {
  const publicCampaign = publicCampaignParameters(search);
  if (publicCampaign) return publicCampaign;
  if (search.get("utm_source") === "google" && search.get("utm_medium") === "organic" &&
      search.get("utm_campaign") === BUSINESS_PROFILE_CAMPAIGN) {
    const content = search.get("utm_content");
    if (content !== null && content !== BUSINESS_PROFILE_BOOKING_CONTENT) return null;
    const params = new URLSearchParams({ utm_source: "google", utm_medium: "organic",
      utm_campaign: BUSINESS_PROFILE_CAMPAIGN });
    if (content === BUSINESS_PROFILE_BOOKING_CONTENT) params.set("utm_content", BUSINESS_PROFILE_BOOKING_CONTENT);
    return params;
  }
  return null;
}
