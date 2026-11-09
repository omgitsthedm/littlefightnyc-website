import { useEffect, useState } from "react";

/**
 * "Open now" — honest availability for the callback window.
 * Calls and texts are answered 9am–9pm America/New_York, every day.
 * This never claims more than that window; outside it we say when we're back.
 */

export const OPEN_HOUR = 9; // 9am ET
export const CLOSE_HOUR = 21; // 9pm ET

export type OpenNow = {
  open: boolean;
  /** Short mono chip text. */
  label: string;
  /** Full plain-English sentence for assistive tech. */
  sentence: string;
};

// The public route snapshot is generated at build time. A build-time clock is
// stale before the HTML reaches a visitor, so the server renderer names the
// reliable callback window rather than claiming the business is open or
// closed at the visitor's moment. The browser immediately replaces this with
// the live Eastern-time state and keeps it fresh each minute.
const SERVER_CALLBACK_WINDOW: OpenNow = {
  open: false,
  label: "9AM–9PM ET",
  sentence: "Calls and texts are answered 9am–9pm Eastern.",
};

function easternHour(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === "hour");
  return hour ? Number(hour.value) : Number.NaN;
}

function computeOpenNow(now: Date = new Date()): OpenNow {
  const hour = easternHour(now);
  const open =
    Number.isFinite(hour) && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
  return open
    ? {
        open: true,
        label: "OPEN NOW",
        sentence: "Open now — we answer calls and texts until 9pm Eastern.",
      }
    : {
        open: false,
        label: "REPLIES AT 9AM ET",
        sentence:
          "Closed right now. We answer calls and texts again at 9am Eastern.",
      };
}

/** Live open/closed state, re-checked every minute. */
export function useOpenNow(): OpenNow {
  const [state, setState] = useState<OpenNow>(() =>
    typeof window === "undefined" ? SERVER_CALLBACK_WINDOW : computeOpenNow(),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => {
        const next = computeOpenNow();
        return next.open === prev.open ? prev : next;
      });
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return state;
}
