import type { Config, Context } from "@netlify/edge-functions";

const VERA_DATA_PATHS = [
  "/vera/data/public.json",
  "/vera/data/archive.json",
  "/vera/data/meta.json",
] as const;

const hasValidTimestamp = (value: unknown): boolean =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const matchesPublicationContract = (pathname: string, publication: unknown): boolean => {
  if (pathname.endsWith("/archive.json")) {
    return Array.isArray(publication) && publication.every((entry: unknown) => {
      if (entry === null || typeof entry !== "object") return false;
      const record = entry as Record<string, unknown>;
      return hasValidTimestamp(record.date) && Array.isArray(record.listings);
    });
  }
  if (publication === null || typeof publication !== "object") return false;
  const record = publication as Record<string, unknown>;
  if (!hasValidTimestamp(record.generated_at)) return false;
  if (pathname.endsWith("/public.json")) {
    return Array.isArray(record.pool) &&
      Array.isArray(record.shortlist);
  }
  return pathname.endsWith("/meta.json") &&
    typeof record.pool === "number" &&
    Number.isFinite(record.pool) &&
    typeof record.shortlist === "number" &&
    Number.isFinite(record.shortlist);
};

const isCompletePublication = async (
  request: Request,
  response: Response,
): Promise<boolean> => {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (
    request.method !== "GET" ||
    response.status !== 200 ||
    !contentType.toLowerCase().includes("json")
  ) {
    return false;
  }
  try {
    const publication: unknown = await response.clone().json();
    return matchesPublicationContract(new URL(request.url).pathname, publication);
  } catch {
    return false;
  }
};

/**
 * Netlify custom response headers do not apply to externally proxied content.
 * Keep the sanitized engine feed first-party and add the crawler directive
 * after the proxy resolves. Do not forward browser conditional validators to
 * GitHub: an upstream 304 has no body, which is not a usable publication for
 * a new VERA session. The edge's shared cache stays fresh for five minutes,
 * then can serve the last known-good daily publication while it revalidates
 * for the same 36-hour health horizon the product reports to visitors.
 */
export default async (request: Request, context: Context): Promise<Response> => {
  const response = await context.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  const cacheable = await isCompletePublication(request, response);

  /* Manual caching must never preserve a rate-limit page, upstream failure,
     or HTML error under a public JSON URL. Successful JSON gets a five-minute
     freshness window plus the same 36-hour stale safety horizon VERA monitors. */
  response.headers.set(
    "Netlify-CDN-Cache-Control",
    cacheable
      ? "public, max-age=300, stale-while-revalidate=129600"
      : "no-store",
  );
  return response;
};

export const config: Config = {
  path: [...VERA_DATA_PATHS],
  cache: "manual",
};
