import { Globe2 } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import FaqList from "@/components/editorial/FaqList";
import QuietContact from "@/components/editorial/QuietContact";
import SiteInFourteen from "@/components/dataviz/SiteInFourteen";
import "@/styles/editorial/base.css";

/**
 * /nationwide/ — the websites door for all 50 states (revenue doctrine
 * 2026-07-19: websites = the volume driver, and a website doesn't care about
 * zip codes). The NYC-neighbor brand stays primary everywhere else; this is
 * ONE door for national intent, not a rebrand. Door Doctrine arc: recognition
 * → hope → proof (SiteInFourteen) → the promises → the door out.
 */

const NATIONWIDE_FAQ = [
  {
    question: "Do you need to visit my business to build the site?",
    answer:
      "No. Photos, a phone call, and honest talk about how your business runs — that's everything we need. The work happens on calls and screens, wherever you are.",
  },
  {
    question: "I'm on the West Coast. How do time zones work?",
    answer:
      "We answer 9am to 9pm Eastern — that's 6am to 6pm Pacific. Text or email whenever you want, and we call back inside 2 hours during those windows. The 14 days doesn't change.",
  },
  {
    question: "Who takes care of the site after it launches?",
    answer:
      "You own it, so that's your call. Run it yourself — we hand over everything with plain instructions. Or keep us on call, like our New York clients do. Either way, nobody can hold your website over your head.",
  },
  {
    question: "Is a remote build different from a New York build?",
    answer:
      "Same build. Same 14 days. Same deal: if we're late, you don't pay. The only difference is we can't walk to your shop — so we'll ask for a few more photos.",
  },
];

export default function Nationwide() {
  return (
    <>
      <PageHero
        eyebrow="Websites · All 50 States"
        icon={Globe2}
        title={
          <>
            Built in New York.
            <br />
            {" "}
            <span className="lf-em">Works anywhere.</span>
          </>
        }
        dek="You don't have to be in New York to get the New York treatment. We build custom websites for small businesses in all 50 states. Live in 14 days. Yours forever."
        image={{
          src: "/assets/hero-nationwide-wtc.webp",
          alt: "Seventh Avenue running south toward One World Trade Center on a bright day",
          width: 1600,
          height: 1200,
        }}
      />

      <section style={{ paddingBlock: "var(--lf-space-7)" }}>
        <div className="lf-container">
          <EditorialBody dropcap>
            <p>
              Every main street in America has the same fight. The chains have
              tech teams. The corner shop has a template site from 2019 and a
              contact form nobody answers. We fix that for a living in New
              York — and a website doesn't care about zip codes.
            </p>
            <h2>How a remote build works</h2>
            <p>
              You call, text, or email. We talk about your business — free,
              like always. Then we build. You watch it come together and tell
              us what's right and what's wrong. In 14 days it's live. If it's
              not, you don't pay.
            </p>
          </EditorialBody>

          {/* The proof, drawn: a real site assembling on the 14-day clock. */}
          <SiteInFourteen />

          <EditorialBody>
            <h2>Every promise travels</h2>
            <p>
              The consult is free. A real person answers, 9am to 9pm Eastern.
              Callbacks in 2 hours. And when it's done, the code, the domain,
              the content — all of it is yours. No hostage fees. No monthly
              ransom.
            </p>
          </EditorialBody>

          <PullQuote cite="Why a New York shop, anywhere">
            The chains squeeze every main street in America. The fight is the
            same everywhere. So is the fix.
          </PullQuote>

          <FaqList title="Long-distance questions, answered plainly" items={NATIONWIDE_FAQ} />
        </div>
      </section>

      <QuietContact />
    </>
  );
}
