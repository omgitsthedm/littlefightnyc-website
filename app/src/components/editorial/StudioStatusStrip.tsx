import { useEffect, useState } from "react";
import { useOpenNow } from "@/lib/openNow";
import { useNycClock } from "./useNycClock";
import "./StudioStatusStrip.css";

/**
 * Studio status strip — one thin mono instrument line at the top of the
 * footer, sitewide. Three honest readings: live New York time (ticking),
 * the callback-window state from lib/openNow.ts (orange dot = open,
 * dim = closed), and the current NYC temperature from the National Weather
 * Service (keyless, fetched after idle, sessionStorage-cached 30 min,
 * silently absent when unreachable — the strip never blocks paint and
 * never logs).
 */

const TEMP_CACHE_KEY = "lf-nws-temp-v1";
const TEMP_TTL_MS = 30 * 60 * 1000;
/** KNYC = Central Park observation station. Free, keyless, CORS-open. */
const NWS_LATEST_URL =
  "https://api.weather.gov/stations/KNYC/observations/latest";

function readCachedTempF(): number | null {
  try {
    const raw = window.sessionStorage.getItem(TEMP_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { f?: unknown; at?: unknown };
    if (typeof parsed.f !== "number" || !Number.isFinite(parsed.f)) return null;
    if (typeof parsed.at !== "number" || Date.now() - parsed.at > TEMP_TTL_MS) {
      return null;
    }
    return parsed.f;
  } catch {
    return null;
  }
}

function useNycTemperatureF(): number | null {
  // Session cache read is a lazy initializer (client-only app, no
  // hydration) so the effect never calls setState synchronously.
  const [tempF, setTempF] = useState<number | null>(() =>
    typeof window === "undefined" ? null : readCachedTempF(),
  );

  useEffect(() => {
    if (typeof window === "undefined" || tempF !== null) return;

    let cancelled = false;

    const load = async () => {
      // FAIL SILENTLY by design: any miss (offline, API down, null reading)
      // simply leaves the temperature off the strip. No errors, no retries.
      try {
        const res = await fetch(NWS_LATEST_URL);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          properties?: { temperature?: { value?: unknown } };
        };
        const celsius = data?.properties?.temperature?.value;
        if (typeof celsius !== "number" || !Number.isFinite(celsius)) return;
        const f = Math.round((celsius * 9) / 5 + 32);
        if (cancelled) return;
        setTempF(f);
        try {
          window.sessionStorage.setItem(
            TEMP_CACHE_KEY,
            JSON.stringify({ f, at: Date.now() }),
          );
        } catch {
          /* storage full/blocked — the reading still shows this visit */
        }
      } catch {
        /* unreachable — show nothing */
      }
    };

    // Fetch only after the main thread goes idle — never in the paint path.
    let idleId = 0;
    let timerId = 0;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => void load(), { timeout: 4000 });
    } else {
      timerId = window.setTimeout(() => void load(), 1200);
    }

    return () => {
      cancelled = true;
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, [tempF]);

  return tempF;
}

export default function StudioStatusStrip() {
  const clock = useNycClock();
  const openNow = useOpenNow();
  const tempF = useNycTemperatureF();

  return (
    <div className="lf-status" data-open={openNow.open ? "true" : "false"}>
      <span className="lf-status__site">Little Fight · NYC</span>
      <span className="lf-status__sep" aria-hidden="true" />
      <span className="lf-status__clock">
        {clock ? `${clock.hms} ${clock.zone}` : "--:--:-- ET"}
      </span>
      <span className="lf-status__sep" aria-hidden="true" />
      {/* aria-label is prohibited on a generic span (axe: aria-prohibited-attr)
          — screen readers get the full sentence via visually-hidden text. */}
      <span className="lf-status__state">
        <span className="lf-status__dot" aria-hidden="true" />
        <span aria-hidden="true">{openNow.open ? "Open now" : "Closed"}</span>
        <span className="lf-status__sr">{openNow.sentence}</span>
      </span>
      {tempF !== null && (
        <>
          <span className="lf-status__sep" aria-hidden="true" />
          <span className="lf-status__temp">{tempF}°F</span>
        </>
      )}
    </div>
  );
}
