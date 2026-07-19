import TugMark from "./TugMark";
import "./TugAvatar.css";

/**
 * TugAvatar — the Little Fight tugboat as a brand moment (not the nav logomark).
 *
 * Reuses the approved TugMark silhouette, rendered in a muted "adrift" steel and
 * set gently bobbing on a waterline, with a single pulsing ORANGE beacon — the
 * one signal (signal law holds: the boat is neutral, only the light is orange).
 * It reads as "knocked out / adrift, but the light's still on — call us," which
 * matches the 404 copy. Purely decorative (aria-hidden); no layout coupling.
 *
 * Fully reduced-motion-safe: the bob, wake, and beacon pulse all stop, leaving a
 * clean static mark with a steady light.
 */
export default function TugAvatar() {
  return (
    <div className="lf-tugavatar" aria-hidden="true">
      <div className="lf-tugavatar__sea">
        <div className="lf-tugavatar__boat">
          <span className="lf-tugavatar__beacon" />
          <TugMark className="lf-tugavatar__mark" />
        </div>
        <span className="lf-tugavatar__water" />
        <span className="lf-tugavatar__wake lf-tugavatar__wake--1" />
        <span className="lf-tugavatar__wake lf-tugavatar__wake--2" />
      </div>
    </div>
  );
}
