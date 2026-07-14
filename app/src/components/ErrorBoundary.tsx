import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

const RELOAD_FLAG = "lf-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 12_000;

/**
 * A failed dynamic `import()` (the common cause: a returning visitor holding a
 * stale index.html requests a chunk hash that a newer deploy has removed) throws
 * during render. <Suspense> does NOT catch render errors, so without a boundary
 * the whole tree unmounts to a blank white page. This boundary catches it and:
 *
 *  - On a chunk/module load error, force ONE full reload so the client picks up
 *    the current index.html + hashes and self-heals. A sessionStorage timestamp
 *    guards against a reload loop when the failure is NOT a stale hash.
 *  - Otherwise (or after the cooldown), render a branded "reload" fallback
 *    instead of a blank screen.
 */
function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const name = (error as { name?: string }).name ?? "";
  const message = (error as { message?: string }).message ?? "";
  return (
    name === "ChunkLoadError" ||
    /Loading( CSS)? chunk .* failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /'?text\/html'? is not a valid JavaScript MIME type/i.test(message)
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error) && typeof window !== "undefined") {
      let last = 0;
      try {
        last = Number(window.sessionStorage.getItem(RELOAD_FLAG)) || 0;
      } catch {
        /* storage blocked (private mode) — fall through to a single reload */
      }
      const now = Date.now();
      if (now - last > RELOAD_COOLDOWN_MS) {
        try {
          window.sessionStorage.setItem(RELOAD_FLAG, String(now));
        } catch {
          /* ignore */
        }
        window.location.reload();
        return;
      }
    }
    // Non-chunk error, or we already reloaded once and it did not help.
    if (import.meta.env.DEV) console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="route-error" role="alert">
        <p className="route-error__title">This page hit a snag.</p>
        <p className="route-error__line">
          A refresh usually clears it — the site may have just updated.
        </p>
        <button
          type="button"
          className="route-error__button"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }
}
