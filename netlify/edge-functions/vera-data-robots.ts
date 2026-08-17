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
  response.headers.set(
    "Netlify-CDN-Cache-Control",
    "public, max-age=300, stale-while-revalidate=129600",
  );
  return response;
};

export const config: Config = {
  path: [...VERA_DATA_PATHS],
  cache: "manual",
};
