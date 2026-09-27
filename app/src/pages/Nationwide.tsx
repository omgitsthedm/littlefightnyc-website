import { Globe2 } from "lucide-react";
import seoPages from "@/data/seo-pages.json";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import FaqList from "@/components/editorial/FaqList";
import QuietContact from "@/components/editorial/QuietContact";
import FirstLookScope from "@/components/editorial/FirstLookScope";
import WebsiteProofSet from "@/components/editorial/WebsiteProofSet";
import ConnectedPathDiagram from "@/components/dataviz/ConnectedPathDiagram";
import { createConnectedPath } from "@/components/dataviz/connectedPath";
import "@/styles/editorial/base.css";
import "@/styles/editorial/nationwide.css";

/**
 * /nationwide/ — the websites door for all 50 states (revenue doctrine
 * 2026-07-19: websites = the volume driver, and a website doesn’t care about
 * zip codes). The NYC-neighbor brand stays primary everywhere else; this is
 * ONE door for national intent, not a rebrand. Door Doctrine arc: recognition
 * → hope → proof (SiteInFourteen) → the promises → the door out.
 */

type SeoFaq = { question: string; answer: string };

const nationwideMetadata = seoPages.pages.find((page) => page.path === "/nationwide/");
const NATIONWIDE_FAQ: SeoFaq[] = nationwideMetadata?.faq ?? [];

const REMOTE_WEBSITE_PATH = createConnectedPath({
  label: "A remote website project path",
  summary:
    "A remote website project begins with accurate business information, moves to a working website review, gives customers one clear action, and ends with the business owning the site and its instructions.",
  caption: "The process is remote. Ownership and a clear customer path stay with the business.",
  nodes: [
    { id: "one", label: "Show us the real business", sub: "Services · photos · hours · questions", col: 0 },
    { id: "two", label: "Review a working site", sub: "Plain language · real revisions", col: 1 },
    { id: "three", label: "Customers get one clear action", sub: "Call · book · visit · buy", tone: "hub", col: 2 },
    { id: "four", label: "The business keeps control", sub: "Site · domain · instructions", tone: "signal", col: 3 },
  ],
});

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
        dek="You get a custom website, built remotely, wherever your business is in the United States. You own the finished site. On-site help stays a New York service."
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
                Good businesses everywhere get stuck with a website that no
                longer feels like the place customers visit in person. We learn
                what a customer needs to know. Then we make it easy to call,
                book, visit, or buy. That work happens well on a screen.
              </p>
            </EditorialBody>
          </article>

          <article className="lf-content-tile lf-content-tile--half lf-content-tile--quiet">
            <EditorialBody>
              <h2>How a remote build works</h2>
              <p>
                You call, text, or email. We talk through the business first.
                Then we build, show you the working site, and revise the parts
                that still feel unclear. The written plan says who does what,
                when, and what happens if either side needs more time.
              </p>
            </EditorialBody>
          </article>

          <div className="lf-content-tile lf-content-tile--wide lf-content-tile--quiet lf-nationwide-process">
            <p className="lf-content-tile__label">One clear remote process</p>
            <ol className="lf-nationwide-steps">
              <li><span>01</span><strong>Show us the business</strong><p>A call, the current site, photos, hours, services, and the way customers reach you.</p></li>
              <li><span>02</span><strong>Watch it take shape</strong><p>You review a working website, not a pile of paperwork.</p></li>
              <li><span>03</span><strong>Launch with control</strong><p>You receive the site and plain instructions for what comes next.</p></li>
            </ol>
            <ConnectedPathDiagram path={REMOTE_WEBSITE_PATH} proof="nationwide" />
          </div>

          <article className="lf-content-tile lf-content-tile--narrow lf-content-tile--tablet-full lf-nationwide-promise">
            <EditorialBody>
              <h2>Every promise travels</h2>
              <p>
                The first read is free. A real person answers 9am–9pm Eastern.
                The written notes say what you own, where it lives, and how to
                change it later.
              </p>
            </EditorialBody>
          </article>

          <section className="lf-content-tile lf-content-tile--full lf-content-tile--quiet">
            <WebsiteProofSet />
          </section>

          <section className="lf-content-tile lf-content-tile--full">
            <FirstLookScope />
          </section>

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
        lede="Send the current site, a few photos, or simply say what customers need to do. We will explain the next useful move in plain words."
        intent="website"
      />
    </>
  );
}
