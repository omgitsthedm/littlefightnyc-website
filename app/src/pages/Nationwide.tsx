import { Globe2 } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import FaqList from "@/components/editorial/FaqList";
import QuietContact from "@/components/editorial/QuietContact";
import "@/styles/editorial/base.css";
import "@/styles/editorial/nationwide.css";

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
      "No. Photos, a phone call, and honest talk about how your business runs are enough. The work happens on calls and screens, wherever you are.",
  },
  {
    question: "I'm on the West Coast. How do time zones work?",
    answer:
      "We answer 9am to 9pm Eastern. That is 6am to 6pm Pacific. Text or email whenever you want, and we call back inside 2 hours during those windows. The 14 days do not change.",
  },
  {
    question: "Who takes care of the site after it launches?",
    answer:
      "You own it, so that is your call. Run it yourself with the plain instructions we provide, or keep us on call like our New York clients do.",
  },
  {
    question: "Is a remote build different from a New York build?",
    answer:
      "Same build. Same 14 days. Same promise: if we are late, you do not pay. The only difference is that we ask for a few more photos.",
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
        dek="We build custom websites for small businesses in all 50 states. The process is clear, the 14-day promise travels, and the finished site belongs to you."
        image={{
          src: "/assets/hero-nationwide-wtc.webp",
          alt: "Seventh Avenue running south toward One World Trade Center on a bright day",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-content-section">
        <div className="lf-content-grid">
          <article className="lf-content-tile lf-content-tile--half">
            <EditorialBody dropcap>
              <p>
                Every main street has good businesses whose website no longer
                matches the care people get in person. We learn what customers
                need to know, then build the clear path to call, book, visit, or
                buy. A website does not care about ZIP codes.
              </p>
            </EditorialBody>
          </article>

          <article className="lf-content-tile lf-content-tile--half lf-content-tile--quiet">
            <EditorialBody>
              <h2>How a remote build works</h2>
              <p>
                You call, text, or email. We talk about your business for free,
                like always. Then we build. You watch it come together and tell
                us what feels right and what needs work. In 14 days it is live.
                If it is not, you do not pay.
              </p>
            </EditorialBody>
          </article>

          <div className="lf-content-tile lf-content-tile--wide lf-content-tile--quiet">
            <p className="lf-content-tile__label">One clear remote process</p>
            <ol className="lf-nationwide-steps">
              <li><span>01</span><strong>Show us the business</strong><p>A call, the current site, photos, hours, services, and the way customers reach you.</p></li>
              <li><span>02</span><strong>Watch it take shape</strong><p>You review a working site, not a pile of technical documents.</p></li>
              <li><span>03</span><strong>Launch with control</strong><p>You receive the site, ownership, and plain instructions for what comes next.</p></li>
            </ol>
          </div>

          <article className="lf-content-tile lf-content-tile--narrow lf-content-tile--tablet-full">
            <EditorialBody>
              <h2>Every promise travels</h2>
              <p>
                The consult is free. A real person answers, 9am to 9pm Eastern.
                Callbacks in 2 hours. And when it's done, the code, the domain,
                the content, and the written handoff are yours.
              </p>
            </EditorialBody>
          </article>

          <aside className="lf-content-tile lf-content-tile--full lf-content-tile--signal">
            <PullQuote cite="Why a New York shop, anywhere">
              Your place should feel as trustworthy online as it does when
              someone walks through the door.
            </PullQuote>
          </aside>

          <section className="lf-content-tile lf-content-tile--full">
            <FaqList title="Long-distance questions, answered plainly" items={NATIONWIDE_FAQ} />
          </section>
        </div>
      </section>

      <QuietContact
        heading="Show us the business from wherever you are."
        lede="Send the current site, a few photos, or simply tell us what customers need to do. We will explain the next move in plain English."
      />
    </>
  );
}
