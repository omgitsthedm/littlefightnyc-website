/**
 * Move focus, but only if nobody else has claimed it since the move was decided.
 *
 * Deferred focus — a `requestAnimationFrame`, a `setTimeout`, or a React passive effect — is a
 * promise about the future you cannot keep. Under load the callback lands *after* the visitor has
 * already tabbed or clicked somewhere else, and the page drags them back. It is intermittent by
 * nature, so it reads as flakiness rather than as a bug: in the decision workspace it failed roughly two runs in
 * five, and because the element it stole focus to was itself focusable, a subsequent Enter was
 * handled by the wrong control entirely.
 *
 * `from` is whoever held focus when the move was scheduled. The move proceeds only if focus is
 * still there, or has fallen to <body> / nothing — which is what happens when the source control
 * unmounts or disables itself, and is exactly the case a handoff exists to repair.
 */
export function focusWhenUnclaimed(target: HTMLElement | null | undefined, from: Element | null): void {
  if (!target) return;
  const now = document.activeElement;
  if (now !== from && now !== null && now !== document.body) return;
  // Never let the focus move drag the page — the mobile nav opening was yanking every
  // route back to scroll position 0. Callers that want scrolling can scroll deliberately.
  target.focus({ preventScroll: true });
}

/** Capture the current holder to compare against later. Call this at decision time. */
export function focusHolder(): Element | null {
  return document.activeElement;
}
