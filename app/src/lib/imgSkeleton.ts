import type { SyntheticEvent } from "react";

/**
 * Image loading skeleton. An `<img>` with these props shows a subtle shimmer in
 * its (already CLS-reserved) box until the bitmap paints, then the opaque webp
 * covers it — no layout shift, no hidden-image risk (the image is never
 * opacity:0, so it can't be stuck invisible before hydration). Styles live in
 * base.css under `img[data-img-skel]`.
 *
 * `onLoad` handles a fresh fetch; the `ref` covers an image already complete
 * from cache (or prerender) before React attaches the handler. Both just flip
 * `data-loaded`, which stops the shimmer animation.
 */
function markLoaded(el: HTMLImageElement | null) {
  if (el && el.complete && el.naturalWidth > 0) el.setAttribute("data-loaded", "");
}

function onImgLoad(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.setAttribute("data-loaded", "");
}

/** Spread onto an `<img>` to give it a load-in skeleton. Stable references. */
export const skelImg = {
  "data-img-skel": "",
  onLoad: onImgLoad,
  ref: markLoaded,
} as const;
