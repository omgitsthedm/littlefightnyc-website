import { createHash } from "node:crypto";

import type { DakotaCandidate } from "./queue-schema";

const GOOGLE_PLACES_SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const YELP_BUSINESS_MATCH_ENDPOINT = "https://api.yelp.com/v3/businesses/matches";
const REQUEST_TIMEOUT_MS = 10_000;

export type DakotaEnrichmentProvider = "google_places" | "yelp";
export type DakotaProviderConnectionStatus = "connected" | "not_configured" | "unavailable";

export interface DakotaSuggestedEvidence {
  evidenceId: string;
  source: DakotaEnrichmentProvider;
  sourceLabel: string;
  sourceUrl: string;
  fact: string;
  stance: "context";
  reviewState: "suggested";
  capturedAt: string;
}

export interface DakotaProviderEnrichment {
  provider: DakotaEnrichmentProvider;
  status: DakotaProviderConnectionStatus;
  checkedAt: string;
  matchCount: number;
  evidence: DakotaSuggestedEvidence[];
}

export interface DakotaEnrichmentResult {
  checkedAt: string;
  providers: DakotaProviderEnrichment[];
  evidence: DakotaSuggestedEvidence[];
}

export interface DakotaEnrichmentDependencies {
  getEnv?: (name: string) => string | undefined;
  fetch?: typeof globalThis.fetch;
  now?: () => Date;
}

interface GooglePlace {
  id?: unknown;
  displayName?: { text?: unknown };
  formattedAddress?: unknown;
  businessStatus?: unknown;
  googleMapsUri?: unknown;
  websiteUri?: unknown;
  nationalPhoneNumber?: unknown;
  rating?: unknown;
  userRatingCount?: unknown;
}

interface YelpBusiness {
  id?: unknown;
  name?: unknown;
  url?: unknown;
  phone?: unknown;
  display_phone?: unknown;
  rating?: unknown;
  review_count?: unknown;
  is_closed?: unknown;
  location?: { display_address?: unknown };
}

function defaultGetEnv(name: string): string | undefined {
  return Netlify.env.get(name);
}

function plain(value: unknown, maximumLength = 300): string {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, maximumLength)
    : "";
}

function safePublicUrl(value: unknown): string {
  const candidate = plain(value, 2_048);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function numberInRange(value: unknown, minimum: number, maximum: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function integerInRange(value: unknown, minimum: number, maximum: number): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function evidenceId(provider: DakotaEnrichmentProvider, providerRef: string): string {
  const digest = createHash("sha256").update(`${provider}:${providerRef}`).digest("hex");
  return [digest.slice(0, 8), digest.slice(8, 12), `5${digest.slice(13, 16)}`, `a${digest.slice(17, 20)}`, digest.slice(20, 32)].join("-");
}

function candidateName(candidate: DakotaCandidate): string {
  return plain(candidate.dba || candidate.business_name, 240);
}

function candidateQuery(candidate: DakotaCandidate): string {
  return [candidateName(candidate), plain(candidate.address), plain(candidate.city), plain(candidate.state || "NY")]
    .filter(Boolean)
    .join(", ")
    .slice(0, 500);
}

function googleEvidence(place: GooglePlace, checkedAt: string): DakotaSuggestedEvidence | null {
  const id = plain(place.id, 240);
  const name = plain(place.displayName?.text, 240);
  const address = plain(place.formattedAddress, 300);
  if (!id || !name || !address) return null;
  const sourceUrl = safePublicUrl(place.googleMapsUri);
  if (!sourceUrl) return null;
  const details = [
    `${name} is listed at ${address}.`,
    plain(place.businessStatus, 80) ? `Business status: ${plain(place.businessStatus, 80)}.` : "",
    plain(place.nationalPhoneNumber, 64) ? `Published phone: ${plain(place.nationalPhoneNumber, 64)}.` : "",
    safePublicUrl(place.websiteUri) ? `Published website: ${safePublicUrl(place.websiteUri)}.` : "",
    numberInRange(place.rating, 0, 5) !== null && integerInRange(place.userRatingCount, 0, 10_000_000) !== null
      ? `Google rating: ${numberInRange(place.rating, 0, 5)} from ${integerInRange(place.userRatingCount, 0, 10_000_000)} ratings.`
      : "",
  ].filter(Boolean);
  return {
    evidenceId: evidenceId("google_places", id),
    source: "google_places",
    sourceLabel: "Google Places",
    sourceUrl,
    fact: details.join(" ").slice(0, 1_200),
    stance: "context",
    reviewState: "suggested",
    capturedAt: checkedAt,
  };
}

function yelpEvidence(business: YelpBusiness, checkedAt: string): DakotaSuggestedEvidence | null {
  const id = plain(business.id, 240);
  const name = plain(business.name, 240);
  const addressParts = Array.isArray(business.location?.display_address)
    ? business.location.display_address.map((part) => plain(part, 160)).filter(Boolean)
    : [];
  const sourceUrl = safePublicUrl(business.url);
  if (!id || !name || !addressParts.length || !sourceUrl) return null;
  const rating = numberInRange(business.rating, 0, 5);
  const reviews = integerInRange(business.review_count, 0, 10_000_000);
  const details = [
    `${name} is listed at ${addressParts.join(", ")}.`,
    typeof business.is_closed === "boolean" ? `Yelp status: ${business.is_closed ? "closed" : "open"}.` : "",
    plain(business.display_phone || business.phone, 64) ? `Published phone: ${plain(business.display_phone || business.phone, 64)}.` : "",
    rating !== null && reviews !== null ? `Yelp rating: ${rating} from ${reviews} reviews.` : "",
  ].filter(Boolean);
  return {
    evidenceId: evidenceId("yelp", id),
    source: "yelp",
    sourceLabel: "Yelp",
    sourceUrl,
    fact: details.join(" ").slice(0, 1_200),
    stance: "context",
    reviewState: "suggested",
    capturedAt: checkedAt,
  };
}

async function googlePlaces(
  candidate: DakotaCandidate,
  checkedAt: string,
  apiKey: string,
  fetcher: typeof globalThis.fetch,
): Promise<DakotaProviderEnrichment> {
  try {
    const response = await fetcher(GOOGLE_PLACES_SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.businessStatus",
          "places.googleMapsUri",
          "places.websiteUri",
          "places.nationalPhoneNumber",
          "places.rating",
          "places.userRatingCount",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery: candidateQuery(candidate),
        languageCode: "en",
        regionCode: "US",
        pageSize: 3,
        includePureServiceAreaBusinesses: true,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error("provider_error");
    const body = await response.json() as { places?: unknown };
    const places = Array.isArray(body.places) ? body.places.slice(0, 3) as GooglePlace[] : [];
    const evidence = places.map((place) => googleEvidence(place, checkedAt)).filter((item): item is DakotaSuggestedEvidence => Boolean(item));
    return { provider: "google_places", status: "connected", checkedAt, matchCount: evidence.length, evidence };
  } catch {
    return { provider: "google_places", status: "unavailable", checkedAt, matchCount: 0, evidence: [] };
  }
}

function yelpMatchParams(candidate: DakotaCandidate): URLSearchParams | null {
  const name = candidateName(candidate).slice(0, 64);
  const address = plain(candidate.address, 64);
  const city = plain(candidate.city, 64);
  const state = plain(candidate.state || "NY", 3).toUpperCase();
  if (!name || !city || !state) return null;
  const params = new URLSearchParams({
    name,
    address1: address,
    city,
    state,
    country: "US",
    limit: "3",
    match_threshold: address ? "strict" : "default",
  });
  if (candidate.postal_code) params.set("postal_code", plain(candidate.postal_code, 12));
  if (candidate.phone) params.set("phone", plain(candidate.phone, 32));
  return params;
}

async function yelp(
  candidate: DakotaCandidate,
  checkedAt: string,
  apiKey: string,
  fetcher: typeof globalThis.fetch,
): Promise<DakotaProviderEnrichment> {
  const params = yelpMatchParams(candidate);
  if (!params) return { provider: "yelp", status: "unavailable", checkedAt, matchCount: 0, evidence: [] };
  try {
    const response = await fetcher(`${YELP_BUSINESS_MATCH_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error("provider_error");
    const body = await response.json() as { businesses?: unknown };
    const businesses = Array.isArray(body.businesses) ? body.businesses.slice(0, 3) as YelpBusiness[] : [];
    const evidence = businesses.map((business) => yelpEvidence(business, checkedAt)).filter((item): item is DakotaSuggestedEvidence => Boolean(item));
    return { provider: "yelp", status: "connected", checkedAt, matchCount: evidence.length, evidence };
  } catch {
    return { provider: "yelp", status: "unavailable", checkedAt, matchCount: 0, evidence: [] };
  }
}

export async function enrichDakotaCandidate(
  candidate: DakotaCandidate,
  dependencies: DakotaEnrichmentDependencies = {},
): Promise<DakotaEnrichmentResult> {
  const checkedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const getEnv = dependencies.getEnv ?? defaultGetEnv;
  const fetcher = dependencies.fetch ?? globalThis.fetch;
  const googleKey = getEnv("GOOGLE_PLACES_API_KEY")?.trim() ?? "";
  const yelpKey = getEnv("YELP_API_KEY")?.trim() ?? "";

  const [googleResult, yelpResult] = await Promise.all([
    googleKey
      ? googlePlaces(candidate, checkedAt, googleKey, fetcher)
      : Promise.resolve<DakotaProviderEnrichment>({ provider: "google_places", status: "not_configured", checkedAt, matchCount: 0, evidence: [] }),
    yelpKey
      ? yelp(candidate, checkedAt, yelpKey, fetcher)
      : Promise.resolve<DakotaProviderEnrichment>({ provider: "yelp", status: "not_configured", checkedAt, matchCount: 0, evidence: [] }),
  ]);
  const providers = [googleResult, yelpResult];
  return {
    checkedAt,
    providers,
    evidence: providers.flatMap((provider) => provider.evidence),
  };
}
