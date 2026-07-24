import PageHero from "@/components/editorial/PageHero";
import { BadgeCheck, Users } from "lucide-react";
import EditorialBody from "@/components/editorial/EditorialBody";
import EditorialFigure from "@/components/editorial/EditorialFigure";
import PullQuote from "@/components/editorial/PullQuote";
import StatBlock from "@/components/editorial/StatBlock";
import FounderCard from "@/components/editorial/FounderCard";
import ProcessFlow from "@/components/editorial/ProcessFlow";
import QuietContact from "@/components/editorial/QuietContact";
import "@/styles/editorial/about.css";

const PROMISES = [
  { value: "Free", label: "Every consult, always" },
  { value: "14 days", label: "Typical website ship" },
  { value: "24 hrs", label: "On-site when it is urgent" },
  { value: "2 hrs", label: "Callback, 9am-9pm ET" },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        icon={Users}
        title={
          <>
            Built for <span className="lf-em">small business fights.</span>
          </>
        }
        dek="Practical websites, reliable support, and owned tools for NYC small businesses. Honest scope. Free consulting."
        image={{
          src: "/assets/about-empire-diner.webp",
          alt: "The chrome-clad Empire Diner glowing on a Manhattan corner at night",
          width: 1200,
          height: 900,
        }}
      />

      <section className="lf-about-story" aria-labelledby="lf-about-story-title">
        <div className="lf-about-story__inner">
          <div className="lf-about-story__lead">
            <article className="lf-about-story__copy">
              <h2 id="lf-about-story-title">Why Little Fight exists.</h2>
              <EditorialBody dropcap>
                <p>
                  Most of the businesses that keep a neighborhood worth living in
                  are the ones with the least time and the smallest tech budget.
                  The bodega open at 11pm. The salon between the dry cleaner and
                  the bagel shop. The pharmacy that knows the patient by name.
                  They are the places people rely on. They are also the ones
                  getting outspent on tools by chains with full tech teams.
                </p>
                <p>
                  Little Fight closes that gap. Not by selling more software. Not
                  by pitching a giant overhaul. By doing the practical work:
                  sites that explain the business plainly, support that picks up
                  when something breaks, search visibility that tells the truth,
                  and small systems that make the day move.
                </p>
              </EditorialBody>
            </article>

            <div className="lf-about-story__figure">
              <EditorialFigure
                src="/assets/figure-bagel-counter.webp"
                alt="A bagel shop counterman mid-shift, racks of plain, whole wheat, and cinnamon raisin behind him"
                number="01"
                caption="The places that make a block worth living on usually have the least time and the smallest tech budget."
                width={1600}
                height={1200}
              />
            </div>
          </div>

          <aside className="lf-about-story__quote">
            <PullQuote cite="How the work usually starts">
              Most owners assume the answer is a rebuild. It almost never is.
            </PullQuote>
          </aside>

          <section className="lf-about-story__promises">
            <StatBlock
              eyebrow="What you can count on"
              icon={BadgeCheck}
              items={PROMISES}
              note="After hours, leave a message and Little Fight NYC will follow up."
            />
          </section>

          <FounderCard photoSrc="/assets/founder-david-marsh.webp" />

          <section
            className="lf-about-story__direct"
            aria-labelledby="lf-about-direct-title"
          >
            <h2 id="lf-about-direct-title">Start with the real problem.</h2>
            <div>
              <p>
                Wi-Fi, email, booking, point-of-sale, and website problems are
                business problems. None are too small or too basic to bring up.
              </p>
              <p>
                Call <a href="tel:+16463600318">(646) 360-0318</a> or{" "}
                <a href="mailto:hello@littlefightnyc.com">
                  hello@littlefightnyc.com
                </a>
                . Use the <a href="/tech-audit/">Tech Audit</a> when there are
                several moving parts. Never send passwords, recovery codes, or
                private customer data.
              </p>
            </div>
          </section>
        </div>
      </section>

      <ProcessFlow />

      <QuietContact />
    </>
  );
}
