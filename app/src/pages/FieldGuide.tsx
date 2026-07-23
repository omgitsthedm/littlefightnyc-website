import {
  ArrowUpRight,
  BriefcaseBusiness,
  HeartPulse,
  LayoutGrid,
  Palette,
  Scissors,
  ShoppingBag,
  Utensils,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import WorkShowcase from "@/components/editorial/WorkShowcase";
import CoverageMatrix from "@/components/dataviz/CoverageMatrix";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import industries from "@/data/industries.json";
import "@/styles/editorial/examples.css";

type Industry = {
  image: string;
  slug: string;
  title: string;
  description: string;
};

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "law-firms": Scale,
  "galleries-creative-studios": Palette,
  "medical-wellness-practices": HeartPulse,
  "professional-services": BriefcaseBusiness,
  "restaurants-bars": Utensils,
  "retail-ecommerce": ShoppingBag,
  "salons-wellness": Scissors,
};

export default function FieldGuide() {
  const toolsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const industriesRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <>
      <PageHero
        eyebrow="Examples"
        icon={LayoutGrid}
        title={
          <>
            Live work.<br />
            <span className="lf-accent">Working ideas.</span>
          </>
        }
        dek="See current client work, run the Audit, or open a Lab concept. Everything here works."
        image={{
          src: "/assets/hero-examples-market.webp",
          alt: "A Manhattan Chinatown market with handwritten price signs and fresh seafood",
          width: 1600,
          height: 1200,
          mobileWidths: [480, 640],
        }}
      />

      <WorkShowcase />

      <section className="lf-ex-tools" aria-labelledby="lf-ex-tools-title">
        <div ref={toolsRef} className="lf-ex-tools__inner" data-reveal>
          <header className="lf-ex-tools__head">
            <h2 id="lf-ex-tools-title">Try what we can build.</h2>
            <p>Working prototypes for new ideas, plus a real website diagnostic you can run now.</p>
          </header>

          <div className="lf-ex-tools__grid">
            <a className="lf-ex-tool lf-ex-tool--lab" href="/examples/lab/" data-no-vt>
              <span className="lf-ex-tool__media">
                <img
                  src="/examples/lab/assets/brownstone-poster.webp"
                  alt="The interactive 3D Brownstone Walk-Up at night"
                  width="1280"
                  height="800"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="lf-ex-tool__copy">
                <span className="lf-ex-tool__type">11 working prototypes</span>
                <strong>The Lab</strong>
                <span>3D spaces, motion systems, storefront ideas, brand concepts, and real interface experiments.</span>
                <span className="lf-ex-tool__open">
                  Open The Lab
                  <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </a>

            <a className="lf-ex-tool lf-ex-tool--audit" href="/examples/audit/" data-no-vt>
              <span className="lf-ex-tool__media">
                <img
                  src="/assets/examples-audit-preview.webp"
                  alt="The Website Audit Lab signal map and scan form"
                  width="1200"
                  height="675"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="lf-ex-tool__copy">
                <span className="lf-ex-tool__type">Free public-page scan</span>
                <strong>The Audit</strong>
                <span>Check speed, mobile use, search visibility, trust, and the path from visit to customer.</span>
                <span className="lf-ex-tool__open">
                  Run The Audit
                  <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </a>

            <a className="lf-ex-tool lf-ex-tool--vera" href="/vera/" data-no-vt>
              <span className="lf-ex-tool__media">
                <img
                  src="/assets/examples-vera-preview.webp"
                  alt="The VERA mission-control dashboard showing today's apartment shortlist"
                  width="1200"
                  height="675"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="lf-ex-tool__copy">
                <span className="lf-ex-tool__type">Live personal software</span>
                <strong>VERA</strong>
                <span>A robot that hunts NYC apartments every night — checks city records, finds the real landlord, skips the scams.</span>
                <span className="lf-ex-tool__open">
                  Ride along with VERA
                  <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </a>

            <a className="lf-ex-tool lf-ex-tool--myspace" href="/myspace-demo/" data-no-vt>
              <span className="lf-ex-tool__media">
                <img
                  src="/assets/examples-myspace-preview.webp"
                  alt="A client profile page styled like a 2006 MySpace profile, Top 8 included"
                  width="1200"
                  height="675"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="lf-ex-tool__copy">
                <span className="lf-ex-tool__type">Just for fun</span>
                <strong>The MySpace Demo</strong>
                <span>A client's profile rebuilt like it's 2006 — Top 8 and all. Custom means anything you can picture.</span>
                <span className="lf-ex-tool__open">
                  Open the throwback
                  <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section id="industries" className="lf-ex-industries" aria-labelledby="lf-ex-ind-title">
        <div ref={industriesRef} className="lf-ex-industries__inner" data-reveal>
          <header className="lf-ex-head">
            <h2 id="lf-ex-ind-title" className="lf-ex-head__title">
              Find a business like yours.
            </h2>
            <p className="lf-ex-head__dek">
              Restaurants, salons, law offices, shops, clinics, creative studios, and professional services.
            </p>
          </header>
          <ul className="lf-ex-industries__band">
            {(industries as unknown as Industry[]).map((entry) => {
              const Icon = INDUSTRY_ICONS[entry.slug] ?? BriefcaseBusiness;
              return (
                <li key={entry.slug}>
                  <Link
                    to={`/industries/${entry.slug}/`}
                    className="lf-ex-industries__pill"
                  >
                    <span className="lf-ex-industries__icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    {entry.title.replace(" Help", "")}
                    <ArrowUpRight
                      className="lf-ex-industries__go"
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          <CoverageMatrix />
        </div>
      </section>

      <QuietContact
        heading="See something you want for your business?"
        lede="Tell us what should work better. We will give you the clearest next move. Consulting is free."
      />
    </>
  );
}
