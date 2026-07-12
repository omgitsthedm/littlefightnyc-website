/**
 * Command palette opener — a tiny event bridge so any chrome (the ⌘K chip in
 * QuietNav) can open CommandPalette without prop-drilling. The palette
 * subscribes to CMDK_OPEN_EVENT; if it isn't mounted yet (Home defers it),
 * the pending flag lets it open on mount instead of dropping the click.
 */

export const CMDK_OPEN_EVENT = "lf:cmdk-open";

let pendingAt = 0;

export function openCommandPalette(): void {
  if (typeof window === "undefined") return;
  pendingAt = Date.now();
  window.dispatchEvent(new CustomEvent(CMDK_OPEN_EVENT));
}

/** Called by CommandPalette when the event listener attaches — returns true
 * if a recent open request happened before it was listening. */
export function consumePendingPaletteOpen(maxAgeMs = 3000): boolean {
  const hit = pendingAt > 0 && Date.now() - pendingAt <= maxAgeMs;
  pendingAt = 0;
  return hit;
}
