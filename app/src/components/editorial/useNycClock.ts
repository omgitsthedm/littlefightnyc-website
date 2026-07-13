import { useEffect, useState } from "react";

/**
 * useNycClock — one honest clock for the chrome instruments.
 * Ticks once a second in America/New_York; shared by the footer status strip
 * and the /contact/ time-promise instrument so every "now" on the site agrees.
 *
 * Returns null until mounted (prerender/no-JS shows a quiet placeholder —
 * a frozen build-time reading would be a lie).
 */

export type NycClock = {
  /** "21:14:52" — 24h, zero-padded. */
  hms: string;
  /** "EDT" | "EST" — whatever New York is actually observing. */
  zone: string;
  /** Fraction of the New York day elapsed, 0..1 (for 24h track markers). */
  dayFraction: number;
};

let formatter: Intl.DateTimeFormat | null = null;

function getFormatter(): Intl.DateTimeFormat {
  formatter ??= new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  });
  return formatter;
}

export function readNycClock(now: Date = new Date()): NycClock {
  const parts = getFormatter().formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");
  const zone = get("timeZoneName") || "ET";
  const h = Number(hour);
  const m = Number(minute);
  const s = Number(second);
  const dayFraction =
    Number.isFinite(h) && Number.isFinite(m) && Number.isFinite(s)
      ? (h + m / 60 + s / 3600) / 24
      : 0;
  return {
    hms: `${hour}:${minute}:${second}`,
    zone,
    dayFraction: Math.min(Math.max(dayFraction, 0), 1),
  };
}

export function useNycClock(): NycClock | null {
  // Lazy initializer, not a mount effect: the app is client-only
  // (createRoot, no hydration), so reading the clock during first render
  // is safe and satisfies react-hooks/set-state-in-effect.
  const [clock, setClock] = useState<NycClock | null>(() =>
    typeof window === "undefined" ? null : readNycClock(),
  );

  useEffect(() => {
    const id = window.setInterval(() => setClock(readNycClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return clock;
}
