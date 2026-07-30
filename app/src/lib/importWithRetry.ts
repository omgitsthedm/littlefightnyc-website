const RETRY_DELAY_MS = 650;

/**
 * A stalled request never rejects. It is not a failure the browser reports —
 * the socket is open, bytes are simply not arriving — so `await importer()`
 * waits indefinitely, the route never resolves, and the retry below never fires
 * because nothing threw. The visitor sits on a loading animation with no
 * message, no timeout and nothing to act on.
 *
 * That is the signature failure of flaky mobile data and captive-portal wifi,
 * which is most of how this audience browses. A rejection at least reaches the
 * ErrorBoundary, which can say what happened and offer a way forward.
 */
const STALL_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Chunk request stalled after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/**
 * Retry a lazy import once. This covers transient CDN/network failures without
 * adding a runtime dependency or forcing a full-page reload that could erase
 * form progress.
 *
 * Both attempts are bounded, so a stall becomes the rejection path the
 * ErrorBoundary already handles rather than an indefinite spinner. The second
 * attempt gets the same budget on purpose: the first may have stalled on a
 * connection that has since come back, and cutting its replacement short would
 * defeat the recovery this exists for.
 */
export async function importWithRetry<T>(importer: () => Promise<T>): Promise<T> {
  try {
    return await withTimeout(importer(), STALL_TIMEOUT_MS);
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS));
    return withTimeout(importer(), STALL_TIMEOUT_MS);
  }
}
