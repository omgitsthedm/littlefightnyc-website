const CACHE_NAME = "littlefightnyc-20260729";
const OFFLINE_URL = "/offline.html";

const SHELL_URLS = [
  "/",
  OFFLINE_URL,
  "/favicon.svg",
  "/site.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-monochrome-192.png",
  "/icon-monochrome-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
});

// Updates wait until controlled tabs close, then activate on the next visit.
// Nothing takes over or reloads a page while somebody is using it.

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const privateDakotaRequest =
    url.pathname === "/dakota.html" ||
    url.pathname === "/app" ||
    url.pathname.startsWith("/app/") ||
    url.pathname.startsWith("/api/dakota/") ||
    url.pathname.startsWith("/.netlify/identity");

  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/.netlify/functions/") ||
    privateDakotaRequest
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(navigate(request));
    return;
  }

  if (url.pathname.startsWith("/assets/") || SHELL_URLS.includes(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Navigations: network, then this page's own cached copy, then an honest
 * offline page.
 *
 * This used to fall back to "/" — the cached homepage — for any navigation it
 * could not fetch. The result was worse than an error. The browser got a 200
 * and the homepage's HTML at, say, /services/it-support/; React then hydrated,
 * saw a route whose lazy chunk was not cached either, and emptied the root.
 * Measured offline on a real device profile: status 200, homepage <title>, no
 * <h1>, and a body of exactly 0 characters. A blank white page, reported as
 * success, with nothing to tell the visitor what happened.
 *
 * The audience for this site is small-business owners on phones — subways,
 * basements, back rooms. Losing signal mid-visit is a normal Tuesday, not an
 * edge case, so it should produce a page that says so and still offers the
 * phone number.
 */
async function navigate(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // This exact page, if it has been seen before.
    const cached = await cache.match(request);
    if (cached) return cached;

    // Otherwise say so, rather than serving a different page's HTML under this
    // URL. 503 is the truth: temporarily unavailable, do not cache, do not index.
    const offline = await cache.match(OFFLINE_URL);
    if (offline) {
      return new Response(await offline.blob(), {
        status: 503,
        statusText: "Offline",
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title>" +
        "<p>You are offline. Call (646) 360-0318 if you need a person.",
      {
        status: 503,
        statusText: "Offline",
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetched = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetched;
}
