import { Link } from "react-router-dom";
import PhoneAction from "./PhoneAction";
import "./QuietNav.css";

export default function QuietNav() {
  return (
    <header className="lf-nav">
      <div className="lf-nav__inner">
        <Link to="/" className="lf-nav__brand" aria-label="Little Fight NYC — home">
          Little Fight NYC
        </Link>
        <PhoneAction className="lf-nav__phone" align="right">
          <span className="lf-nav__phone-label">Call or text</span>
          <span className="lf-nav__phone-number">(646) 360-0318</span>
        </PhoneAction>
      </div>
    </header>
  );
}
