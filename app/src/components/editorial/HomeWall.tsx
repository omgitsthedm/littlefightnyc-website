import { ArrowRight, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_WALL } from "@/data/home-wall";
import CustomerPath from "./CustomerPath";
import LivePreview from "./LivePreview";
import { HELLO_EMAIL, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import "./HomeWall.css";

/**
 * The first screen is a pyramid: the answer, then the three reasons, then
 * the proof. H1 = what we do for the owner ("We handle the tech. You run the
 * shop."). Dek = the three things that means. Pillars = the three reasons an
 * owner would pick us, one per service line. Actions and channels. Then the
 * six-trade wall, now labelled as what it is — proof: "Shops like yours,
 * already working." That line used to be the H1, which led with evidence
 * before saying what the evidence was for.
 *
 * The screen still answers "is this for someone like me?" — the six trades
 * do that — it just answers "what do you do for me?" first.
 *
 * On desktop the phone playing one customer's four-beat path (found →
 * understood → trusted → booked, on a real client site) sits to the right of
 * the copy — the "slideshow" from the old hero, back as the hero's visual.
 * On phones it is the stacked version — under the reach block, ahead of the
 * proof — so the two decisions and the hours line still lead the first
 * screen; the smallest phones (≤360px) skip it for the 15-screen budget.
 *
 * It used to answer a different one. The hero was three columns — a promise, a
 * phone playing a four-beat customer path, and the beat list beside it — all
 * built around a single salon. On a phone that reads as a story. On a desktop
 * it reads as a dense control panel, and the one client's yellow owns the
 * frame, so a painting contractor sees a hair salon and leaves.
 *
 * So the promise is one line, the call is one button, and underneath it are six
 * real businesses that look nothing like each other: a painting contractor, a
 * lender, a film company, a help service, a clothing label, a salon. Six
 * industries in the first screen is the argument. No single client anchors it.
 *
 * The row reads from a small homepage-sized module rather than the full case
 * catalog: site-cases.ts is 52KB and lazily chunked, and importing it here
 * dragged the entire portfolio into the eager marketing entry. The
 * case-study audit compares every field — including that each slug is still
 * public — so this cannot drift, and a case going private fails the build.
 */

// The first tile is the desktop LCP candidate and the one route preload; on
// a phone the six tiles start below the first screen, where the backdrop is
// the LCP element, so the tile must not outrank it. Client-only module, so
// matchMedia is safe here; the prerendered shell keeps its own high-priority
// tile for the integrity audit.
const TILES_IN_FIRST_SCREEN =
  typeof window !== "undefined" && window.matchMedia("(min-width: 64rem)").matches;

/**
 * A tile that plays its site: LivePreview swaps the still for the full-page
 * capture on hover/focus and scrolls it. The first tile's still stays the
 * pinned LCP candidate (the capture only exists after a hover).
 */
function WallTile({ study, index }: { study: (typeof HOME_WALL)[number]; index: number }) {
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
            /* The first tile is the largest thing in the first screen on
               desktop, so it is the LCP candidate and the one route preload.
               audit-site-integrity pins this pair. */
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 && TILES_IN_FIRST_SCREEN ? "high" : undefined}
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
          York, no season, no readable business names (the imagery rule). Decorative (alt="") and never route-preloaded
          (the wall's first tile keeps that pin), but fetched high: it is the
          largest paint in the first screen, so it is what LCP measures. The
          scrim in CSS keeps the copy AA on top of it. */}
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
            sizes="100vw"
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
          Websites, on-site tech help, and software you own.
        </p>

        <ul className="lf-wall__pillars" aria-label="Three reasons">
          <li className="lf-wall__pillar">A website customers can find and book from</li>
          {/* The 24-hour figure rides with its hedge, and the 9am–9pm line is on
              this same screen — the evidence ledger's condition for publishing it. */}
          <li className="lf-wall__pillar">Urgent NYC jobs, usually on-site within 24 hours</li>
          <li className="lf-wall__pillar">Software you own — code, data, and accounts</li>
        </ul>

        <div className="lf-wall__act">
          <a className="lf-wall__call" href={PHONE_HREF} data-lf-label="home_wall_phone" data-lf-primary-action="true">
            <Phone size={20} strokeWidth={2.5} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <Link
            className="lf-wall__check"
            to="/website-check/#website-check-url"
            data-lf-event="website_check_started"
            data-lf-label="home_hero"
            data-lf-source="home"
          >
            Check my website
            <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

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
          {HOME_WALL.map((study, index) => (
            <WallTile key={study.slug} study={study} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
