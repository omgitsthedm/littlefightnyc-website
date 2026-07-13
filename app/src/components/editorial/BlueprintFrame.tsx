import type { ReactNode } from "react";
import "./BlueprintFrame.css";

/**
 * Blueprint marginalia — an opt-in drafting layer for major section
 * boundaries: faint crosshair ticks at the four corners plus a tiny mono
 * section-index annotation running up the outer left margin.
 *
 * Utility-layer rules: decorative only (aria-hidden), wide viewports only
 * (≥1280px — hidden entirely below), hairline color at low opacity, and
 * everything lives inside the section's own margins so it can never touch
 * text or create overflow. Pure CSS; this component just hosts the layer.
 */

type Props = {
  /** Section index for the margin annotation ("SEC. 01"). */
  index: number;
  /** Short drafting label — set in mono caps by the CSS. */
  label: string;
  children: ReactNode;
};

export default function BlueprintFrame({ index, label, children }: Props) {
  return (
    <div className="lf-blueprint">
      {children}
      <span className="lf-blueprint__layer" aria-hidden="true">
        <i className="lf-blueprint__tick lf-blueprint__tick--tl" />
        <i className="lf-blueprint__tick lf-blueprint__tick--tr" />
        <i className="lf-blueprint__tick lf-blueprint__tick--bl" />
        <i className="lf-blueprint__tick lf-blueprint__tick--br" />
        <span className="lf-blueprint__sec">
          {`SEC. ${String(index).padStart(2, "0")} — ${label}`}
        </span>
      </span>
    </div>
  );
}
