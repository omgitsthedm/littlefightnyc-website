import { useState, type ReactNode } from "react";
import "./LivePreview.css";

/**
 * A still that plays its site. Wrap any client-site thumbnail: on a pointer
 * device, hovering (or focusing a link inside) fades in that site's full-page
 * desktop capture — /assets/case-{slug}-explore.webp, 1200×2000, 72–142KB,
 * fetched on first hover only — and scrolls it top to bottom inside the same
 * frame. The picture of a website becomes the website.
 *
 * Touch devices keep the still (no hover; the tap is whatever link the still
 * sits in). Reduced motion shows the capture without the scroll. Nothing is
 * rendered until the first hover, so LCP candidates and image counts are
 * unchanged for tests and audits.
 *
 * Only cases with a capture (showcase.proof.captureDate in site-cases.ts)
 * should be wrapped; pass `slug={undefined}` to render the children plainly.
 */
export default function LivePreview({
  slug,
  className,
  children,
}: {
  slug?: string;
  className?: string;
  children: ReactNode;
}) {
  const [live, setLive] = useState(false);
  if (!slug) return <>{children}</>;
  return (
    <span
      className={`lf-live-preview${className ? ` ${className}` : ""}`}
      data-live={live || undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setLive(true);
      }}
      onFocus={() => setLive(true)}
    >
      {children}
      {live && (
        <img
          className="lf-live-preview__scroll"
          src={`/assets/case-${slug}-explore.webp`}
          width={1200}
          height={2000}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      )}
    </span>
  );
}
