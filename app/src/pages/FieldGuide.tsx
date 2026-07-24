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

const LAB_BUILDS = [
  {
    title: "Brownstone Walk-Up",
    type: "Spatial story",
    description: "Climb a New York walk-up from street level to the water tower.",
    href: "/examples/lab/concepts/walkup-3d/",
  },
  {
    title: "Cinematic 3D",
    type: "Spatial website",
    description: "Architecture, atmosphere, and scroll-driven story in a working site.",
    href: "/examples/lab/concepts/terminal-3d/",
  },
  {
    title: "Scroll Into Motion",
    type: "Motion study",
    description: "A single object changes meaning as the page moves through it.",
    href: "/examples/lab/concepts/pill-scroll/",
  },
  {
    title: "Micro-Animations",
    type: "Interaction study",
    description: "Service ideas translated into small, readable moments of motion.",
    href: "/examples/lab/concepts/micro-animations/",
  },
  {
    title: "Studio Engine",
    type: "Design system",
    description: "A live concept generator with controls, layouts, and export paths.",
    href: "/examples/lab/concepts/studio-engine/",
  },
  {
    title: "Growth Street",
    type: "Generative study",
    description: "A storefront row changes as the systems behind it improve.",
    href: "/examples/lab/concepts/growth-street/",
  },
  {
    title: "Goliath",
    type: "Brand campaign",
    description: "Sharp type, hard contrast, and direct action at full volume.",
    href: "/examples/lab/concepts/goliath/",
  },
  {
    title: "Hero Prototype",
    type: "Brand study",
    description: "A homepage direction built around one clear promise.",
    href: "/examples/lab/concepts/hero/",
  },
  {
    title: "Tech Support Site",
    type: "Full website",
    description: "An earlier complete service site preserved as a working branch.",
    href: "/examples/lab/concepts/tech-support/",
  },
] as const;

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
            See what works.<br />
            <span className="lf-accent">Try what is next.</span>
          </>
        }
        dek="Client work, working products, and Lab experiments. Open anything here in one click."
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
            <h2 id="lf-ex-tools-title">Open it. Try it. No maze.</h2>
            <p>Use a Lab build, run the Audit, or open a live product. No account and no preview gate.</p>
          </header>

          <section className="lf-ex-lab-direct" aria-labelledby="lf-ex-lab-title">
            <div className="lf-ex-lab-direct__head">
              <div>
                <p>9 working experiments</p>
                <h3 id="lf-ex-lab-title">The Lab is a playground.</h3>
                <span>Open a build and start exploring. Nothing technical to read first.</span>
              </div>
              <a href="/examples/lab/" data-no-vt>
                Open the Lab
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
            <div className="lf-ex-lab-direct__grid">
              {LAB_BUILDS.map((build) => (
                <a key={build.href} href={build.href} data-no-vt>
                  <span>{build.type}</span>
                  <strong>{build.title}</strong>
                  <p>{build.description}</p>
                  <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          <div className="lf-ex-tools__grid">
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
                <span>A robot that hunts NYC apartments every night, checks city records, finds the real landlord, and skips the scams.</span>
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
                <span>A client's profile rebuilt like it is 2006, Top 8 and all. Custom means anything you can picture.</span>
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
              See how the same principles work at a counter, in a chair, or behind an office door.
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
