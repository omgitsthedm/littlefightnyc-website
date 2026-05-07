import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";

type CallToActionProps = {
  compact?: boolean;
};

export default function CallToAction({ compact = false }: CallToActionProps) {
  return (
    <section className={compact ? "cta-band compact" : "cta-band"}>
      <div>
        <p className="eyebrow">Start simple</p>
        <h2>Bring the messy setup.</h2>
        <p>
          Tell us what feels broken, expensive, slow, invisible, or hard to explain.
          We will sort the next move before anyone sells you a giant project.
        </p>
      </div>
      <div className="cta-actions">
        <Link className="button primary" to="/fit-check/">
          Start a Fit Check <ArrowRight size={18} />
        </Link>
        <a className="button ghost" href="tel:+16463600318">
          <Phone size={18} /> Call now
        </a>
      </div>
    </section>
  );
}
