/* Lead attribution: capture ad/campaign params once per session so the Fit
 * Check submission carries where the lead actually came from. The old static
 * site did this; the React migration dropped it. sessionStorage only — no
 * cookies, nothing sent anywhere except inside the form the visitor submits. */

const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
] as const;

const STORAGE_KEY = "lf-attribution";

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const search = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const key of PARAMS) {
      const value = search.get(key);
      if (value) found[key] = value.slice(0, 200);
    }
    if (Object.keys(found).length === 0) return;
    const existing = readAttribution();
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...existing, ...found })
    );
  } catch {
    // Storage unavailable (private mode etc.) — attribution is best-effort.
  }
}

export function readAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string> = {};
    for (const key of PARAMS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}
