import type { Config, Context } from "@netlify/edge-functions";

const VERA_DATA_PATHS = [
  "/vera/data/public.json",
  "/vera/data/archive.json",
  "/vera/data/meta.json",
] as const;

/**
 * Netlify custom response headers do not apply to externally proxied content.
 * Keep the sanitized engine feed first-party, preserve the upstream response,
 * and add the crawler directive at the edge after the proxy resolves.
 */
export default async (_request: Request, context: Context): Promise<Response> => {
  const response = await context.next({ sendConditionalRequest: true });
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
};

export const config: Config = {
  path: [...VERA_DATA_PATHS],
};
