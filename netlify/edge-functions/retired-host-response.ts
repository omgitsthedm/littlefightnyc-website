import type { Config, Context } from "@netlify/edge-functions";

const RETIREMENT_CACHE_CONTROL = "no-store, max-age=0";
const RETIREMENT_ROBOTS = "noindex, nofollow, noarchive, nosnippet";
const RETIREMENT_CSP = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'";
const RETIRED_HOSTNAMES = new Set(["dakota.littlefightnyc.com", "www.dakota.littlefightnyc.com"]);
const RETIREMENT_BODY = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="${RETIREMENT_ROBOTS}"><title>Gone</title><style>body{margin:0;background:#fff;color:#111;font:16px/1.5 system-ui,sans-serif}main{max-width:42rem;margin:14vh auto;padding:0 1.5rem}h1{font-size:1.5rem;margin:0 0 .5rem}p{margin:0}</style></head><body><main><h1>This page is no longer available.</h1><p>The service at this address has been permanently retired.</p></main></body></html>`;

/**
 * Edge functions run before redirects. End this legacy-host request here so a
 * forced redirect cannot replace the retirement cache, robots, or CSP policy.
 */
export default (request: Request, context: Context) => {
  if (!RETIRED_HOSTNAMES.has(new URL(request.url).hostname)) return context.next();

  return new Response(RETIREMENT_BODY, {
    status: 410,
    headers: {
      "Cache-Control": RETIREMENT_CACHE_CONTROL,
      "Content-Security-Policy": RETIREMENT_CSP,
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": RETIREMENT_ROBOTS,
    },
  });
};

export const config: Config = {
  path: "/*",
  header: {
    host: "^(?:www\\.)?dakota\\.littlefightnyc\\.com$",
  },
};
