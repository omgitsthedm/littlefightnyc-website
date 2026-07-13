import PageHero from "@/components/editorial/PageHero";
import { BadgeCheck, Users } from "lucide-react";
import EditorialBody from "@/components/editorial/EditorialBody";
import EditorialFigure from "@/components/editorial/EditorialFigure";
import PullQuote from "@/components/editorial/PullQuote";
import StatBlock from "@/components/editorial/StatBlock";
import FounderCard from "@/components/editorial/FounderCard";
import ProcessFlow from "@/components/editorial/ProcessFlow";
import BlueprintFrame from "@/components/editorial/BlueprintFrame";
import SiteCensus from "@/components/editorial/SiteCensus";
import QuietContact from "@/components/editorial/QuietContact";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";

const PROMISES = [
  { value: "Free", label: "Every consult — always" },
  { value: "14 days", label: "Typical website ship" },
  { value: "24 hrs", label: "On-site when it's urgent" },
  { value: "2 hrs", label: "Callback, 9am–9pm ET" },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        icon={Users}
        title={
          <>
            Built for small<br />
            {" "}
            <span className="lf-em">business fights.</span>
          </>
        }
        dek="Little Fight NYC helps NYC small businesses outwork billion-dollar competitors. The work is practical, the scope is honest, and the consult is always free."
        image={{
          src: "/assets/about-empire-diner.webp",
          alt: "The chrome-clad Empire Diner glowing on a Manhattan corner at night",
          width: 1200,
          height: 900,
        }}
      />

      <section style={{ padding: "var(--lf-space-8) var(--lf-margin-mobile)" }}>
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
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
              by pitching a giant overhaul. By doing the practical work - sites
              that explain the business plainly, support that picks up when
              something breaks, search visibility that tells the truth, and
              small systems that make the day move.
            </p>
          </EditorialBody>

          <EditorialFigure
            src="/assets/interior-spice-shop.webp"
            alt="Inside an owner-run specialty shop in New York"
            number="01"
            caption="The places that make a block worth living on — usually the ones with the least time and the smallest tech budget."
            width={1600}
            height={1067}
          />

          <EditorialBody>
            <p>
              The order is always the same. Keep what works. Connect what
              matters. Replace what drags. Build only what fits.
            </p>
          </EditorialBody>

          <PullQuote cite="How the work usually starts">
            Most owners assume the answer is a rebuild. It almost never is.
          </PullQuote>

          <StatBlock eyebrow="The promises" icon={BadgeCheck} items={PROMISES} />
          <EditorialBody>
            <p style={{ color: "var(--lf-bone-dim)", fontSize: "var(--lf-text-sm)" }}>
              After hours, leave a message and Little Fight NYC will follow up.
            </p>
          </EditorialBody>

          <FounderCard photoSrc="/assets/founder-david-marsh.webp" />

          <MiniMapNYC compact />

          <EditorialFigure
            src="/assets/owner.webp"
            alt="A small-business owner at the counter"
            number="02"
            caption="Most calls start with “I don't know if this is a stupid question.” It almost never is — it's the business."
            width={1600}
            height={1067}
          />

          <EditorialBody>
            <p>
              The Wi-Fi being weird, the email going to a stranger, the booking
              link that hasn't worked in three months — none of that is stupid.
              It is the business. Call when you need the path fixed.
            </p>
            <p>
              The direct line is (646) 360-0318. Email is
              hello@littlefightnyc.com. If the problem has moving parts, the
              Tech Audit is the cleanest way to send context without sending
              passwords, private customer data, or recovery codes.
            </p>
          </EditorialBody>
        </div>
      </section>

      {/* Site census — honest build-derived counts (see SiteCensus.tsx). */}
      <BlueprintFrame index={3} label="Site census">
        <SiteCensus />
      </BlueprintFrame>

      <ProcessFlow />

      <QuietContact />
    </>
  );
}
