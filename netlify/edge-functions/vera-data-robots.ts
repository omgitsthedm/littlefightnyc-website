import type { Config, Context } from "@netlify/edge-functions";

const VERA_DATA_PATHS = [
  "/vera/data/public.json",
  "/vera/data/archive.json",
  "/vera/data/meta.json",
] as const;

/**
 * Netlify custom response headers do not apply to externally proxied content.
 * Keep the sanitized engine feed first-party and add the crawler directive
 * after the proxy resolves. Do not forward browser conditional validators to
 * GitHub: an upstream 304 has no body, which is not a usable publication for
 * a new VERA session. The edge's shared cache stays fresh for five minutes,
 * then can serve the last known-good daily publication while it revalidates
 * for the same 36-hour health horizon the product reports to visitors.
 */
export default async (_request: Request, context: Context): Promise<Response> => {
  const response = await context.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  const contentType = response.headers.get("Content-Type") ?? "";
  const isCompletePublication =
    response.status === 200 && contentType.toLowerCase().includes("json");

  /* Manual caching must never preserve a rate-limit page, upstream failure,
     or HTML error under a public JSON URL. Successful JSON gets a five-minute
     freshness window plus the same 36-hour stale safety horizon VERA monitors. */
  response.headers.set(
    "Netlify-CDN-Cache-Control",
    isCompletePublication
      ? "public, max-age=300, stale-while-revalidate=129600"
      : "no-store",
  );
  return response;
};

export const config: Config = {
  path: [...VERA_DATA_PATHS],
  cache: "manual",
};
