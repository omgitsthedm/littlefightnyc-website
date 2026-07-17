/**
 * A one-shot signal that the real page content has mounted — used to hold the
 * tugboat splash until the app is composed, not merely until React's first
 * render() call returns. The shell (QuietFooter effect) and the standalone Home
 * both call markAppReady() from an effect, which React fires only after their
 * subtree (including the current route) has committed to the DOM.
 */
let resolve: (() => void) | null = null;
let resolved = false;

export const appReady: Promise<void> = new Promise<void>((r) => {
  resolve = r;
});

export function markAppReady(): void {
  if (resolved) return;
  resolved = true;
  resolve?.();
}
