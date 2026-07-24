import { Phone, Users } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import OwnerStories from "@/components/editorial/OwnerStories";
import QuietContact from "@/components/editorial/QuietContact";
import { agencyProcess } from "@/data/site";
import "@/styles/editorial/about.css";

const STANDARDS = [
  { label: "Consulting", value: "Free, always" },
  { label: "Typical website ship", value: "14 days" },
  { label: "Urgent on-site help", value: "Within 24 hours" },
  { label: "Missed-call callback", value: "Within 2 hours, 9am-9pm ET" },
] as const;

export default function About() {
  return (
    <div className="lf-about-page">
      <PageHero
        eyebrow="About"
        icon={Users}
        title={
          <>
            Small firm. <span className="lf-em">Serious pull.</span>
          </>
        }
        dek="We make websites and business technology easier to trust, own, and use."
        image={{
          src: "/assets/about-empire-diner.webp",
          alt: "The chrome-clad Empire Diner glowing on a Manhattan corner at night",
          width: 1200,
          height: 900,
        }}
      />

      <section className="lf-about-belief" aria-labelledby="lf-about-belief-title">
        <div className="lf-about-belief__inner">
          <header className="lf-about-belief__head">
            <p>What we believe</p>
            <h2 id="lf-about-belief-title">
              The business should not have to bend around the technology.
            </h2>
          </header>

          <div className="lf-about-belief__copy">
            <p>
              You already know how to run the shop, serve the table, advise the
              client, or manage the office. Nobody should make you feel behind
              because a website, booking tool, or monthly software bill is hard
              to explain.
            </p>
            <p>
              Little Fight starts with the way the day really works. We keep the
              useful parts, repair the places where work gets lost, and build
              something new only when it earns its place.
            </p>
            <p>
              The goal is not more technology. It is fewer missed calls, fewer
              dead ends, clearer ownership, and a setup your people can trust.
            </p>
          </div>

          <dl className="lf-about-standards" aria-label="Little Fight operating standards">
            {STANDARDS.map((standard) => (
              <div key={standard.label}>
                <dt>{standard.label}</dt>
                <dd>{standard.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <OwnerStories />

      <section className="lf-about-operating" aria-labelledby="lf-about-operating-title">
        <div className="lf-about-operating__inner">
          <header className="lf-about-operating__head">
            <p>Small on purpose</p>
            <h2 id="lf-about-operating-title">
              Close enough to understand the business. Strong enough to build
              what it needs.
            </h2>
            <div>
              <p>
                Small means you speak to fewer people and one person stays
                responsible. The person who learns how your business works
                stays close to the decisions, the build, and the final files
                and instructions.
              </p>
              <p>
                That same firm can ship a focused website, stabilize the tools
                behind the counter, or build software around work that no
                off-the-shelf product understands.
              </p>
            </div>
          </header>

          <aside className="lf-about-founder" aria-label="Founder of Little Fight NYC">
            <div className="lf-about-founder__identity">
              <span>Founder</span>
              <strong>David Marsh</strong>
            </div>
            <p>
              Little Fight NYC has worked this way since 2021. David stays
              accountable for the scope, the decisions, and the final files
              and instructions. You should never have to explain the business
              from the beginning every time the work moves.
            </p>
            <div className="lf-about-founder__meta">
              <span>New York City</span>
              <a href="tel:+16463600318">
                <Phone size={18} strokeWidth={1.9} aria-hidden="true" />
                (646) 360-0318
              </a>
            </div>
          </aside>

          <section className="lf-about-method" aria-labelledby="lf-about-method-title">
            <header>
              <p>How the work moves</p>
              <h2 id="lf-about-method-title">
                Understand first. Change only what helps.
              </h2>
            </header>

            <ol className="lf-about-method__steps">
              {agencyProcess.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.label}>
                    <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                    <h3>{step.label}</h3>
                    <p>{step.copy}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </section>

      <QuietContact
        heading="Bring us the part you have been putting off."
        lede="You do not need a plan or the right words. Call, text, email, or send the website address. We will help name the next move."
      />
    </div>
  );
}
