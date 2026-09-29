import { clientCaptureRoot } from "@/lib/clientCaptureRoot";
import { ArrowRight, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_WALL } from "@/data/home-wall";
import CustomerPath from "./CustomerPath";
import LivePreview from "./LivePreview";
import { HELLO_EMAIL, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import { acquisitionCtaForIntent } from "@/lib/acquisitionIntent";
import "./HomeWall.css";

/**
 * The first screen states the offer, opens an inclusive free first look and
 * keeps urgent phone help directly available. The real client paths show the
 * work. HOME_WALL stays small so the full portfolio catalog
 * does not enter the eager homepage bundle.
 */

/**
 * A tile that plays its site: LivePreview swaps the still for the full-page
 * capture on hover/focus and scrolls it. These are gallery proof, not the
 * homepage LCP: the avenue behind the first decision paints first at every
 * viewport, while the tiles keep normal lazy image behavior.
 */
function WallTile({ study }: { study: (typeof HOME_WALL)[number] }) {
  const base = `${clientCaptureRoot(study.slug)}/case-${study.slug}`;
  const isOwnedProduct = study.slug === "after-hours-agenda";
  const isRachel = study.slug === "hair-by-rachel-charles";
  return (
    <li className="lf-wall__tile">
      <Link to={`/case-studies/${study.slug}/`}>
        <LivePreview slug={study.slug} className={`lf-wall__shot${isRachel ? " lf-wall__shot--rachel" : ""}`}>
          <img
            src={isRachel ? "/assets/cases/2026-09-29/case-hair-by-rachel-charles-desktop-1440.webp" : `${base}-900.webp`}
            srcSet={isRachel ? undefined : `${base}-480.webp 480w, ${base}-640.webp 640w, ${base}-900.webp 900w`}
            sizes="(min-width: 64rem) 16vw, (min-width: 48rem) 30vw, 45vw"
            width={isRachel ? 1440 : 900}
            height={isRachel ? 900 : 640}
            alt={`${study.client} — ${isOwnedProduct ? "a Little Fight owned product" : "a live client site"}`}
            loading="lazy"
            decoding="async"
          />
        </LivePreview>
        <span className="lf-wall__trade">{isOwnedProduct ? "Our clothing label" : study.trade}</span>
        <span className="lf-wall__client">{study.client}</span>
      </Link>
    </li>
  );
}

export default function HomeWall() {
  const firstLook = acquisitionCtaForIntent("website", "home");
  return (
    <section className="lf-wall" aria-labelledby="lf-home-title" data-lf-owner-intro="true">
      {/* The city behind the promise: an Upper East Side avenue at dusk, the
          towers straight down the avenue, streetlights just on. Shot at 6000px
          (Brand/New York Neighborhoods), served up to 2000w — unmistakably New
          York, no season, no readable business names (the imagery rule).
          Decorative (alt=""), but route-preloaded with the same responsive
          sources below and fetched high: it is the largest paint behind the
          first decision at every viewport. The scrim in CSS keeps the copy AA
          on top of it. */}
      <div className="lf-wall__backdrop" aria-hidden="true">
        <picture>
          {/* Phones take ≤900w (30–94KB); desktop takes 1280–2000w (178–442KB),
              which is 1.4× on a 1440 screen — sharp, no upscale, no blur. */}
          <source
            media="(min-width: 64rem)"
            srcSet="/assets/hero-home-avenue-1280.webp 1280w, /assets/hero-home-avenue-1600.webp 1600w, /assets/hero-home-avenue-2000.webp 2000w"
            sizes="100vw"
          />
          <img
            src="/assets/hero-home-avenue-900.webp"
            srcSet="/assets/hero-home-avenue-480.webp 480w, /assets/hero-home-avenue-640.webp 640w, /assets/hero-home-avenue-900.webp 900w"
            /* 50vw is deliberate: on a 3× phone it can select 640w rather
               than the 900w source. Under the phone scrim that preserves the
               intended image treatment while avoiding an oversized request. */
            sizes="50vw"
            width={2000}
            height={1333}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="lf-wall__inner">
        <div className="lf-wall__copy">
        <p className="lf-wall__kicker">
          <span aria-hidden="true">LF / 01</span>
          New York City
        </p>

        <h1 id="lf-home-title" className="lf-wall__claim">
          We handle the tech.
          <br />
          <span>You run the shop.</span>
        </h1>

        <p className="lf-wall__dek">
          A first website. A better one. Less tech trouble.
        </p>

        <ul className="lf-wall__pillars" aria-label="Three reasons">
          <li className="lf-wall__pillar">Websites nationwide, built around your business</li>
          <li className="lf-wall__pillar">On-site timing confirmed after we know the issue and location</li>
          <li className="lf-wall__pillar">Software you own — code, data, and accounts</li>
        </ul>

        <div className="lf-wall__act">
          <Link
            className="lf-wall__check"
            to={firstLook.href}
            data-lf-event={firstLook.event}
            data-lf-label="home_hero"
            data-lf-source="home"
            data-lf-primary-action="true"
          >
            Get a free first look
            <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
          <a className="lf-wall__call" href={PHONE_HREF} data-lf-label="home_wall_phone">
            <Phone size={20} strokeWidth={2.5} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
        </div>

        <p className="lf-wall__first-look-note">Keep what works. Know what to fix.</p>

        <div className="lf-wall__reach" data-lf-contact-rail="true">
          <div className="lf-wall__channels">
            <a href={SMS_HREF} data-lf-label="home_wall_sms">
              <MessageSquare size={15} strokeWidth={2} aria-hidden="true" />
              Text
            </a>
            <a href={`mailto:${HELLO_EMAIL}`} data-lf-label="home_wall_email">
              <Mail size={15} strokeWidth={2} aria-hidden="true" />
              Email
            </a>
            <Link to="/tech-audit/" data-lf-label="home_wall_form">
              <Send size={15} strokeWidth={2} aria-hidden="true" />
              Form
            </Link>
          </div>
          <p className="lf-wall__hours">
            9am–9pm Eastern: a human answers. After hours: leave a message.
          </p>
        </div>
        </div>

        <Link
          className="lf-wall__hero-proof"
          to="/case-studies/hair-by-rachel-charles/"
          aria-label="See the Hair By Rachel Charles customer path case study"
        >
          <span className="lf-wall__hero-proof-label">A website we built</span>
          <span className="lf-wall__hero-proof-title">Hair By Rachel Charles</span>
          <span className="lf-wall__hero-proof-summary">Clear services. Direct handoff to Square booking.</span>
          <span className="lf-wall__hero-proof-frame">
            <picture>
              <source media="(min-width: 64rem)" srcSet="/assets/cases/2026-09-29/case-hair-by-rachel-charles-desktop-1440.webp" />
              <source media="(min-width: 48rem)" srcSet="/assets/cases/2026-09-29/case-hair-by-rachel-charles-tablet-1024.webp" />
              <img
                src="/assets/cases/2026-09-29/case-hair-by-rachel-charles-mobile-390.webp"
                width={780}
                height={1688}
                alt="The Hair By Rachel Charles booking website with Rachel’s name and portrait visible"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </span>
          <span className="lf-wall__hero-proof-link">
            See the customer path <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        </Link>

        <div className="lf-wall__scene">
          <CustomerPath />
        </div>

        <p className="lf-wall__proof">Shops like yours, already working.</p>

        <ul className="lf-wall__grid" aria-label="Client work and our own clothing label">
          {HOME_WALL.map((study) => (
            <WallTile key={study.slug} study={study} />
          ))}
        </ul>
      </div>
    </section>
  );
}
