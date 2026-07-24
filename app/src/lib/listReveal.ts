/**
 * Compatibility shim for the former list/image reveal observer.
 *
 * Routes still call this while they migrate, but static-first presentation no
 * longer writes reveal attributes or keeps a document-wide MutationObserver
 * alive. Keeping the tiny cleanup contract avoids route-markup churn.
 */
export function watchListReveals(_root: Element): () => void {
  void _root;
  return () => undefined;
}
