/** Immutable image URLs change only when the underlying captures change. */
const CURRENT_CLIENTS = new Set(["hair-by-rachel-charles", "cc-films", "chromatic-painting-design", "clearhelp", "logan-loans", "grand-funding-llc", "the-break-room", "easy-tiger", "the-tarot-hotline"]);
export function clientCaptureRoot(slug: string): string {
  return CURRENT_CLIENTS.has(slug) ? "/assets/cases/2026-09-29" : "/assets";
}
