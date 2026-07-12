import type { ReactNode } from "react";
import "./DeviceFrame.css";

/* DeviceFrame — a drawn device chrome around a screenshot.
 *
 * Screenshots of client work are evidence, not photography. Framing them in
 * a browser (or phone) shell says "this is a real, shipped product surface"
 * and keeps UI captures from visually competing with the graded photo set.
 *
 * Pure CSS chrome — tokens only, no imagery. The chrome is decorative
 * (aria-hidden); the child image carries the semantics.
 *
 *   <DeviceFrame domain="ccfilms.net">
 *     <img src="/assets/case-cc-films.webp" alt="" />
 *   </DeviceFrame>
 *
 *   <DeviceFrame variant="phone"> … </DeviceFrame>
 */

type DeviceFrameProps = {
  /** Real domain shown in the drawn URL bar (browser variant only). */
  domain?: string;
  variant?: "browser" | "phone";
  className?: string;
  children: ReactNode;
};

export default function DeviceFrame({
  domain,
  variant = "browser",
  className,
  children,
}: DeviceFrameProps) {
  const classes = ["lf-device", `lf-device--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {variant === "browser" ? (
        <div className="lf-device__chrome" aria-hidden="true">
          <span className="lf-device__dots">
            <span className="lf-device__dot" />
            <span className="lf-device__dot" />
            <span className="lf-device__dot" />
          </span>
          {domain && <span className="lf-device__url">{domain}</span>}
          <span className="lf-device__chrome-end" />
        </div>
      ) : (
        <div className="lf-device__chrome lf-device__chrome--phone" aria-hidden="true">
          <span className="lf-device__speaker" />
        </div>
      )}
      <div className="lf-device__screen">{children}</div>
    </div>
  );
}
