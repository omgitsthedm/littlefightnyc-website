import { ExternalLink, FileSearch, ShieldCheck } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import ScoreRing from "@/components/dataviz/ScoreRing";
import "@/styles/editorial/audit.css";

const AUDIT_URL = "https://audit.littlefightnyc.com/";

export default function Audit() {
  return (
    <>
      <PageHero
        eyebrow="Instant Website Scan"
        icon={FileSearch}
        title={
          <>
            See what your site{" "}
            <br />
            <span className="lf-em">is leaking.</span>
          </>
        }
        dek="A fast outside read of your website: whether people can find it, trust it, and load it quickly, and whether the structure and contact paths actually turn a visitor into a call."
        image={{
          src: "/assets/coworking-laptops.webp",
          alt: "Open laptops in a Brooklyn workspace",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-audit-page">
        <div className="lf-audit-page__inner">
          <EditorialBody>
            <p>
              The scan is the fastest way to get a first read on a business
              website before a consult. It checks whether the page structure,
              copy, local signals, performance, and contact paths are helping
              people understand the business or quietly adding friction.
            </p>
            <p>
              Use it when the site looks fine but leads are soft, Google feels
              unpredictable, or nobody can tell whether the next move should be
              a rebuild, a repair, or a smaller cleanup.
            </p>
          </EditorialBody>

          <div className="lf-audit-page__gauges">
            <p className="lf-audit-page__gauges-label">What the read covers</p>
            {/* Sample values are ILLUSTRATIVE only — a made-up mid-tier site,
                flagged as a sample in the badge, caption, and summary. */}
            <ScoreRing
              label="What the scan measures — sample read"
              summary="The scan scores five things out of 100: page structure, copy, local signals, performance, and contact paths. The gauges here show a made-up sample read for illustration only — running the scan replaces them with your site's real numbers."
              badge="Sample"
              caption="Sample read — your numbers will differ"
              items={[
                { label: "Structure", value: 74 },
                { label: "Copy", value: 58 },
                { label: "Local signals", value: 41 },
                { label: "Performance", value: 86 },
                { label: "Contact paths", value: 63 },
              ]}
            />
          </div>

          <div className="lf-audit-page__panel" aria-label="Open the website audit">
            <div className="lf-audit-page__marks" aria-hidden="true">
              <span><FileSearch size={24} strokeWidth={1.8} /></span>
              <span><ShieldCheck size={24} strokeWidth={1.8} /></span>
            </div>
            <div>
              <p className="lf-audit-page__eyebrow">Instant website scan</p>
              <h2 className="lf-audit-page__title">Run the free scan.</h2>
              <p className="lf-audit-page__copy">
                Opens the scan tool at audit.littlefightnyc.com. It runs on its own — no waiting for a person.
              </p>
            </div>
            <a
              className="lf-audit-page__button"
              href={AUDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Run my free scan
              <ExternalLink size={18} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
