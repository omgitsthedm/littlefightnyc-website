const PRIVATE_HEADERS: Readonly<Record<string, string>> = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Content-Type": "application/json; charset=utf-8",
  "Cross-Origin-Resource-Policy": "same-origin",
  Expires: "0",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
  Vary: "Cookie, Authorization",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, noarchive, nosnippet",
};

export function privateJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: PRIVATE_HEADERS,
  });
}

export function methodNotAllowed(allowed: readonly string[]): Response {
  const response = privateJson({ error: "Method not allowed." }, 405);
  response.headers.set("Allow", allowed.join(", "));
  return response;
}
