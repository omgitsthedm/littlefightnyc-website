import { Phone, Users } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import OwnerStories from "@/components/editorial/OwnerStories";
import WorkWall from "@/components/editorial/WorkWall";
import QuietContact from "@/components/editorial/QuietContact";
import { agencyProcess } from "@/data/site";
import "@/styles/editorial/about.css";
import { PHONE_DISPLAY, PHONE_HREF } from "@/data/contact";

const STANDARDS = [
  { label: "Consulting", value: "Free, always" },
  {
    label: "Website timing",
    // COPY-CONTRACT: the 14-day promise may only appear with its eligibility,
    // timing, dependency, and remedy terms. Standing alone it read as an
    // unconditional guarantee.
    value: "A written 14-day promise on qualifying scopes. The scope names the timing, what each side provides, and the remedy.",
  },
  { label: "Urgent NYC on-site help", value: "Within 24 hours when the fix needs hands" },
  { label: "Missed-call callback", value: "We aim for 2 hours, 9am–9pm Eastern" },
] as const;

export default function About() {
  return (
    <div className="lf-about-page">
      <PageHero
        eyebrow="About"
        icon={Users}
        title={
          <>
            Less runaround. <span className="lf-em">More getting done.</span>
          </>
        }
        dek="We build websites, fix what breaks, and build software you own."
        pillars={[
          "Consulting is free, always",
          "One studio, start to finish",
          "9am–9pm Eastern, a human answers",
        ]}
        // The page that explains who we are now opens on what we shipped.
        // A different trio than the services hub, so the two do not repeat.
        visual={
          <WorkWall
            slugs={["clearhelp", "after-hours-agenda", "brothers-pizzeria"]}
            label="Recent shipped work"
          />
        }
      />

      {/* Answer first. This section used to open with a three-paragraph belief
          essay and put the four standards last — so the concrete, checkable
          facts an owner is actually shopping for sat below the philosophy.
          The standards now come directly under the claim; the beliefs became
          the supporting layer they always were. */}
      <section className="lf-about-belief" aria-labelledby="lf-about-belief-title">
        <div className="lf-about-belief__inner">
          <header className="lf-about-belief__head">
            <p>What you can count on</p>
            <h2 id="lf-about-belief-title">
              Your business should not have to bend around a tool.
            </h2>
          </header>

          <dl className="lf-about-standards" aria-label="Little Fight operating standards">
            {STANDARDS.map((standard) => (
              <div key={standard.label}>
                <dt>{standard.label}</dt>
                <dd>
                  {standard.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="lf-about-belief__copy">
            <p>
              We keep the useful parts, repair the places where work gets lost,
              and build something new only when it earns its place.
            </p>
            <p>
              You already know how to run the shop, serve the table, advise the
              client, or manage the office. Nobody should feel behind because a
              website, booking tool, or software bill is hard to explain.
            </p>
            <p>
              The goal is not more to learn. It is a clearer path for the
              customer, fewer dropped steps, and a setup your people can trust.
            </p>
          </div>
        </div>
      </section>

      <OwnerStories />

      <section className="lf-about-operating" aria-labelledby="lf-about-operating-title">
        <div className="lf-about-operating__inner">
          <header className="lf-about-operating__head">
            <p>Small on purpose</p>
            <h2 id="lf-about-operating-title">
              We learn the business. Then we build what it actually needs.
            </h2>
            <div>
              <p>
                You speak to fewer people. The person who learns how your
                business works stays close through the decisions, the build,
                and the final files and instructions.
              </p>
              <p>
                We can build a focused website, fix the tools behind the
                counter, or make a small tool when nothing you can buy fits the job.
              </p>
            </div>
          </header>

          <aside className="lf-about-founder" aria-label="The studio behind the work">
            <div className="lf-about-founder__identity">
              <span>The studio</span>
              <strong>Little Fight NYC</strong>
            </div>
            <p>
              We stay responsible for the plan, the decisions, and the final
              files and instructions. You should not have to explain the
              business from the beginning every time the work moves.
            </p>
            <div className="lf-about-founder__meta">
              <span>New York City</span>
              <a href={PHONE_HREF} data-lf-label="about_founder_phone">
                <Phone size={18} strokeWidth={1.9} aria-hidden="true" />
                {PHONE_DISPLAY}
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
