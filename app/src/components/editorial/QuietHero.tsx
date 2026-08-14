import {
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  HELLO_EMAIL,
  PHONE_HREF,
  SMS_HREF,
} from "@/data/contact";
import "./QuietHero.css";

/**
 * Homepage acquisition surface: one promise, one real business scene, and two
 * obvious decisions. The full Website Check owns its form and scan state; the
 * homepage gets a faster, privacy-safe handoff instead of asking an owner to
 * type before they understand the offer.
 */
export default function QuietHero() {
  return (
    <section className="lf-hero" aria-labelledby="lf-home-title">
      <div className="lf-hero__main">
        <figure
          className="lf-hero__scene"
          role="img"
          aria-label="Illustrative neighborhood shop counter with a register, printer, and everyday business technology"
        >
          <img
            src="/brand-kit/assets/imagery/shop-systems-hero.webp"
            width="1440"
            height="901"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="lf-hero__handoff" aria-hidden="true">
            <div className="lf-hero__handoff-sources">
              <span>Search</span>
              <span>Website</span>
              <span>Booking</span>
              <span>Support</span>
            </div>
            <span className="lf-hero__handoff-path">One working path</span>
          </div>
          <figcaption>Illustrative shop scene — not client work</figcaption>
        </figure>

        <div className="lf-hero__promise">
          <p className="lf-hero__eyebrow">
            <span aria-hidden="true">LF / 01</span>
            Websites · Tech · Software
          </p>

          <h1 id="lf-home-title" className="lf-hero__claim">
            Make it easier for{" "}<br />
            the next customer to{" "}<br />
            <span>choose you.</span>
          </h1>

          <p className="lf-hero__brief">
            We plan the website, connect the useful parts, and stay when
            something breaks.
          </p>

          <div className="lf-hero__quick" aria-label="Start here">
            <Link
              className="lf-hero__quick-action lf-hero__quick-action--website"
              to="/website-check/"
              aria-label="Need a website? Get a better website"
              data-lf-event="website_check_started"
              data-lf-label="home_hero"
              data-lf-source="home"
            >
              <span>Need a website?</span>
              <strong>Get a better website</strong>
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
            <a
              className="lf-hero__quick-action lf-hero__quick-action--urgent"
              href={PHONE_HREF}
              aria-label="Something broke? Call now"
              data-lf-label="home_mobile_urgent_phone"
            >
              <span>Something broke?</span>
              <strong>Call now</strong>
              <Phone size={18} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>

          <div className="lf-hero__quick-reach" aria-label="More ways to reach Little Fight NYC">
            <div className="lf-hero__quick-channels">
              <a href={SMS_HREF} data-lf-label="home_mobile_hero_sms">
                <MessageSquare size={14} strokeWidth={2} aria-hidden="true" />
                Text
              </a>
              <a href={`mailto:${HELLO_EMAIL}`} data-lf-label="home_mobile_hero_email">
                <Mail size={14} strokeWidth={2} aria-hidden="true" />
                Email
              </a>
              <Link to="/tech-audit/" data-lf-label="home_hero_form">
                <Send size={14} strokeWidth={2} aria-hidden="true" />
                Form
              </Link>
            </div>
            <div className="lf-hero__quick-hours">
              <span>9am–9pm Eastern: a human answers. After hours: leave a message.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
