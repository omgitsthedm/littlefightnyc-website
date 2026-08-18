import { ArrowRight, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_WALL } from "@/data/home-wall";
import { HELLO_EMAIL, PHONE_DISPLAY, PHONE_HREF, SMS_HREF } from "@/data/contact";
import "./HomeWall.css";

/**
 * The first screen answers one question: is this for someone like me?
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

export default function HomeWall() {
  return (
    <section className="lf-wall" aria-labelledby="lf-home-title" data-lf-owner-intro="true">
      <div className="lf-wall__inner">
        <p className="lf-wall__kicker">
          <span aria-hidden="true">LF / 01</span>
          New York City
        </p>

        <h1 id="lf-home-title" className="lf-wall__claim">
          Shops like yours,
          <br />
          <span>already working.</span>
        </h1>

        <p className="lf-wall__dek">
          Websites, on-site tech help, and software you own.
        </p>

        <div className="lf-wall__act">
          <a className="lf-wall__call" href={PHONE_HREF} data-lf-label="home_wall_phone">
            <Phone size={20} strokeWidth={2.5} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <Link
            className="lf-wall__check"
            to="/website-check/"
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

        <ul className="lf-wall__grid" aria-label="Six live client sites">
          {HOME_WALL.map((study, index) => {
            const base = `/assets/case-${study.slug}`;
            return (
              <li key={study.slug} className="lf-wall__tile">
                <Link to={`/case-studies/${study.slug}/`}>
                  <span className="lf-wall__shot">
                    <img
                      src={`${base}-900.webp`}
                      srcSet={`${base}-480.webp 480w, ${base}-640.webp 640w, ${base}-900.webp 900w`}
                      sizes="(min-width: 64rem) 16vw, (min-width: 48rem) 30vw, 45vw"
                      width={900}
                      height={640}
                      alt={`${study.client} — a live client site`}
                      /* The first tile is the largest thing in the first screen,
                         so it is the LCP candidate and the one route preload.
                         audit-site-integrity pins this pair. */
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : undefined}
                      decoding="async"
                    />
                  </span>
                  <span className="lf-wall__trade">{study.trade}</span>
                  <span className="lf-wall__client">{study.client}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
