const RETRY_DELAY_MS = 650;

/**
 * Retry a lazy import once. This covers transient CDN/network failures without
 * adding a runtime dependency or forcing a full-page reload that could erase
 * form progress.
 */
export async function importWithRetry<T>(importer: () => Promise<T>): Promise<T> {
  try {
    return await importer();
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS));
    return importer();
  }
}
