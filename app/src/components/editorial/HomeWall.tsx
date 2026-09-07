import { ArrowRight, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_WALL } from "@/data/home-wall";
import CustomerPath from "./CustomerPath";
import LivePreview from "./LivePreview";
import { HELLO_EMAIL, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import "./HomeWall.css";

/**
 * The first screen states the offer, opens an inclusive free first look and
 * keeps urgent phone help directly available. The real client path and six
 * trades show the work. HOME_WALL stays small so the full portfolio catalog
 * does not enter the eager homepage bundle.
 */

/**
 * A tile that plays its site: LivePreview swaps the still for the full-page
 * capture on hover/focus and scrolls it. These are gallery proof, not the
 * homepage LCP: the avenue behind the first decision paints first at every
 * viewport, while the tiles keep normal lazy image behavior.
 */
function WallTile({ study }: { study: (typeof HOME_WALL)[number] }) {
  const base = `/assets/case-${study.slug}`;
  return (
    <li className="lf-wall__tile">
      <Link to={`/case-studies/${study.slug}/`}>
        <LivePreview slug={study.slug} className="lf-wall__shot">
          <img
            src={`${base}-900.webp`}
            srcSet={`${base}-480.webp 480w, ${base}-640.webp 640w, ${base}-900.webp 900w`}
            sizes="(min-width: 64rem) 16vw, (min-width: 48rem) 30vw, 45vw"
            width={900}
            height={640}
            alt={`${study.client} — a live client site`}
            loading="lazy"
            decoding="async"
          />
        </LivePreview>
        <span className="lf-wall__trade">{study.trade}</span>
        <span className="lf-wall__client">{study.client}</span>
      </Link>
    </li>
  );
}

export default function HomeWall() {
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
          {/* The 24-hour figure rides with its hedge, and the 9am–9pm line is on
              this same screen — the evidence ledger's condition for publishing it. */}
          <li className="lf-wall__pillar">Urgent NYC jobs, usually on-site within 24 hours</li>
          <li className="lf-wall__pillar">Software you own — code, data, and accounts</li>
        </ul>

        <div className="lf-wall__act">
          <Link
            className="lf-wall__check"
            to="/website-check/#website-check-start"
            data-lf-event="first_look_opened"
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

        <div className="lf-wall__scene">
          <CustomerPath />
        </div>

        <p className="lf-wall__proof">Shops like yours, already working.</p>

        <ul className="lf-wall__grid" aria-label="Six live client sites">
          {HOME_WALL.map((study) => (
            <WallTile key={study.slug} study={study} />
          ))}
        </ul>
      </div>
    </section>
  );
}
