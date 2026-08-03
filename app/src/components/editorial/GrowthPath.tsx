import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { BOOKING_HREF } from "@/data/contact";
import "./GrowthPath.css";

const STAGES = [
  {
    number: "01",
    signal: "Check",
    title: "Start with the public page.",
    detail:
      "The Website Check measures Lighthouse performance, SEO, accessibility, and best practices. If the provider fails, the report says unavailable instead of making up a score.",
    action: "Check my website",
    href: "/examples/audit/",
    external: true,
  },
  {
    number: "02",
    signal: "Read",
    title: "Put a person on the findings.",
    detail:
      "Book a free 30-minute second opinion. We separate what matters now from what can wait—and say when the current setup is already fine.",
    action: "Book a second opinion",
    href: BOOKING_HREF,
    external: true,
  },
  {
    number: "03",
    signal: "Move",
    title: "Fix, build, or leave it alone.",
    detail:
      "The next move may be a repair, a 14-day website, or focused software you own. The scope and responsibility are written down before paid work starts.",
    action: "See the four ways we help",
    href: "/services/",
    external: false,
  },
  {
    number: "04",
    signal: "Stay",
    title: "Keep the customer path working.",
    detail:
      "Hours change. Staff change. Booking links and forms break. Ongoing care keeps the front door current without holding the code, domain, or data hostage.",
    action: "See ongoing care",
    href: "/services/ongoing-care/",
    external: false,
  },
] as const;

export default function GrowthPath() {
  return (
    <section className="lf-growth" aria-labelledby="lf-growth-title">
      <header className="lf-growth__head">
        <p className="lf-growth__eyebrow">One useful path</p>
        <h2 id="lf-growth-title">From first look to a system that keeps earning its place.</h2>
        <p>
          No funnel theater. Each step should give the owner something useful,
          even if the right next move is not hiring us.
        </p>
      </header>

      <ol className="lf-growth__rail">
        {STAGES.map((stage) => (
          <li key={stage.number}>
            <div className="lf-growth__index" aria-hidden="true">
              <span>{stage.number}</span>
              <strong>{stage.signal}</strong>
            </div>
            <div className="lf-growth__copy">
              <h3>{stage.title}</h3>
              <p>{stage.detail}</p>
            </div>
            {stage.external ? (
              <a
                href={stage.href}
                className="lf-growth__action"
                target={stage.href.startsWith("http") ? "_blank" : undefined}
                rel={stage.href.startsWith("http") ? "noopener noreferrer" : undefined}
                data-lf-event={stage.href === BOOKING_HREF ? "booking_started" : undefined}
                data-lf-label={stage.href === BOOKING_HREF ? "home_process" : undefined}
              >
                {stage.action}
                {stage.href.startsWith("http") && <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />}
              </a>
            ) : (
              <Link to={stage.href} className="lf-growth__action">{stage.action}</Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
