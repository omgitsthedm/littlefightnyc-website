import { Link, useLocation } from "react-router-dom";
import PhoneAction from "./PhoneAction";
import "./StickyHelpBar.css";

export default function StickyHelpBar() {
  const { pathname } = useLocation();
  const trimmed = pathname.replace(/\/$/, "");
  const hide = trimmed === "/fit-check" || trimmed === "/thanks";

  if (hide) return null;

  return (
    <div className="lf-sticky-help" aria-label="Get help quickly">
      <PhoneAction
        className="lf-sticky-help__cell lf-sticky-help__cell--call"
        align="left"
        direction="up"
      >
        <span className="lf-mono lf-sticky-help__label">Call or text</span>
        <span className="lf-sticky-help__detail">(646) 360-0318</span>
      </PhoneAction>
      <Link className="lf-sticky-help__cell lf-sticky-help__cell--fit" to="/fit-check/">
        <span className="lf-mono lf-sticky-help__label">Start</span>
        <span className="lf-sticky-help__detail">Fit Check <span aria-hidden="true">→</span></span>
      </Link>
    </div>
  );
}
