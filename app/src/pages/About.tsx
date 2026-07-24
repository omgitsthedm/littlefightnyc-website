import PageHero from "@/components/editorial/PageHero";
import { BadgeCheck, Users } from "lucide-react";
import EditorialBody from "@/components/editorial/EditorialBody";
import EditorialFigure from "@/components/editorial/EditorialFigure";
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
            Small firm. <span className="lf-em">Heavy pull.</span>
          </>
        }
        dek="Custom websites, practical support, and owned tools from a team that stays close to the work."
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
              <h2 id="lf-about-story-title">Small businesses have enough to fight.</h2>
              <EditorialBody>
                <p>
                  The shops, salons, restaurants, clinics, and offices that keep
                  a block alive rarely have an internal tech team. They still
                  need a website people can find and tools the staff can trust.
                </p>
                <p>
                  Little Fight closes that gap. We keep what works, fix what
                  drags, and build only when the better tool earns its place.
                </p>
              </EditorialBody>
            </article>

            <div className="lf-about-story__figure">
              <EditorialFigure
                src="/assets/interior-spice-shop.webp"
                alt="A narrow neighborhood spice shop lined with stocked shelves and baskets by the front door"
                caption="The technology should fit the business behind the front door."
                width={1600}
                height={1200}
              />
            </div>
          </div>

          <section className="lf-about-story__promises">
            <StatBlock
              eyebrow="What you can count on"
              icon={BadgeCheck}
              items={PROMISES}
              note="After hours, leave a message and Little Fight NYC will follow up."
            />
          </section>

          <FounderCard sceneSrc="/images/brand-scenes/restaurant-counter.webp" />

          <section
            className="lf-about-story__direct"
            aria-labelledby="lf-about-direct-title"
          >
            <h2 id="lf-about-direct-title">Bring us the real problem.</h2>
            <div>
              <p>
                Website, Wi-Fi, email, booking, payment, and device problems
                become business problems fast. None are too basic to bring up.
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
