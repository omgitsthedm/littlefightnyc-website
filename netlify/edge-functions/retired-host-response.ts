import type { Config, Context } from "@netlify/edge-functions";

const RETIREMENT_CACHE_CONTROL = "no-store, max-age=0";
const RETIREMENT_ROBOTS = "noindex, nofollow, noarchive, nosnippet";

/**
 * The forced 410 redirects below resolve to a static file. Netlify applies
 * static header rules before that host-level redirect, so add the retirement
 * response headers after the static response resolves.
 */
export default async (_request: Request, context: Context): Promise<Response> => {
  const response = await context.next();
  response.headers.set("Cache-Control", RETIREMENT_CACHE_CONTROL);
  response.headers.set("X-Robots-Tag", RETIREMENT_ROBOTS);
  return response;
};

export const config: Config = {
  path: "/*",
  header: {
    host: "^(?:www\\.)?dakota\\.littlefightnyc\\.com$",
  },
};
