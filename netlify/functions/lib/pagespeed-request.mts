/** Bound transient recovery without repeatedly spending quota on a rejected job. */
export async function requestPageSpeed(targetUrl: string, apiKey: string | undefined): Promise<Response> {
  if (!apiKey) throw new Error("pagespeed_not_configured");
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.search = new URLSearchParams({ url: targetUrl, strategy: "mobile" }).toString();
  for (const category of ["performance", "seo", "best-practices", "accessibility"]) {
    endpoint.searchParams.append("category", category);
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        headers: { "x-goog-api-key": apiKey },
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      if (attempt === 1) throw new Error("pagespeed_transport_unavailable");
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      continue;
    }
    if (response.ok) return response;
    // Authentication and quota errors need configuration or quota recovery;
    // repeatedly invoking the provider cannot repair them.
    if (response.status === 429) throw new Error("pagespeed_quota_exhausted");
    if (response.status < 500 || attempt === 1) throw new Error(`pagespeed_http_${response.status}`);
    await response.body?.cancel();
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("pagespeed_unavailable");
}
