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
    title: "Six-Story Walk-Up",
    type: "Capability build",
    description: "A living NYC block corner in real-time 3D. One asset that sells real estate, games, and cinema.",
    href: "/examples/lab/concepts/walkup-3d/",
    poster: "/images/lab-showcase/brownstone-walkup",
    alt: "Night view of the Six-Story Walk-Up diorama",
  },
  {
    title: "Neon District",
    type: "Capability build",
    description: "A living Tron-style district with a day-night cycle, simulated traffic, and beacons wired to live numbers.",
    href: "/examples/lab/concepts/terminal-3d/",
    poster: "/images/lab-showcase/cinematic-3d",
    alt: "Vibrant neon 3D business district at dusk",
  },
  {
    title: "Scroll Into Motion",
    type: "Motion study",
    description: "A pill blooms into a sixteen-moment New York film. Your scroll is the editor — forward, back, freeze anywhere.",
    href: "/examples/lab/concepts/pill-scroll/",
    poster: "/images/lab-showcase/scroll-motion",
    alt: "A capsule-shaped frame revealing commuters inside Grand Central",
  },
  {
    title: "Micro-Animations",
    type: "Interaction study",
    description: "A tiny bodega app running on real spring physics — press, throw, hold, undo. Feedback you can feel.",
    href: "/examples/lab/concepts/micro-animations/",
    poster: "/images/lab-showcase/micro-animations",
    alt: "A small ordering app beside a checklist of seven interaction moments",
  },
  {
    title: "Studio Engine",
    type: "Design system",
    description: "Describe a business — or tap one — and a finished-looking site assembles itself. Change the vibe; it re-skins live.",
    href: "/examples/lab/concepts/studio-engine/",
    poster: "/images/lab-showcase/studio-engine",
    alt: "A generated barbershop website inside a browser frame with vibe switcher chips",
  },
  {
    title: "Growth Street",
    type: "Generative study",
    description: "One flower shop, five chapters, every number wearing a costume — people are dots, orders are tickets, months are buildings.",
    href: "/examples/lab/concepts/growth-street/",
    poster: "/images/lab-showcase/growth-street",
    alt: "An illustrated flower shop with a striped awning and a crowd of colorful dot-people walking past",
  },
  {
    title: "Goliath",
    type: "Brand campaign",
    description: "Ten typographic street posters wheatpasted one over the last — Little Fight versus the default stack, scrubbed by your scroll.",
    href: "/examples/lab/concepts/goliath/",
    poster: "/images/lab-showcase/goliath",
    alt: "A colossal LITTLE FIGHT poster in orange pasted over a stack of street posters",
  },
  {
    title: "Hero Prototype",
    type: "Brand study",
    description: "A homepage built around one clear promise, with a signal field you can touch.",
    href: "/examples/lab/concepts/hero/",
    poster: "/images/lab-showcase/hero-prototype",
    alt: "Tables and service areas at a New York outdoor bar",
  },
  {
    title: "AHA Laser Poster",
    type: "Client poster",
    description: "A laser draws AHA's real letterforms, the tubes catch like neon, and the sign hangs on a pull-chain you can pull.",
    href: "/examples/lab/concepts/aha-laser/",
    poster: "/images/lab-showcase/aha-laser",
    alt: "The After Hours Agenda lockup lit in pink neon inside a double-tube frame",
  },
  {
    title: "I Am Cooking",
    type: "Client concept",
    description: "Chef Drew's catering world. Appetite, motion, and a booking path that works.",
    href: "/examples/lab/concepts/chef-drew/",
    poster: "/images/lab-showcase/chef-drew",
    alt: "Chef Drew hospitality concept homepage with bold headline",
  },
] as const;

export default function FieldGuide() {
  return (
    <>
      <PageHero
        eyebrow="Examples"
        icon={LayoutGrid}
        title={
          <>
            See what works.<br />{" "}
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

      <WorkShowcase mode="featured" />

      <section className="lf-ex-tools" aria-labelledby="lf-ex-tools-title">
        <div className="lf-ex-tools__inner">
          <header className="lf-ex-tools__head">
            <p className="lf-ex-tools__kind">Illustrative Lab work</p>
            <h2 id="lf-ex-tools-title">Open it. Try it. No maze.</h2>
            <p>
              The client proof is above. The Lab is where we test new visual
              ideas. Every build below opens the real experience in one click.
            </p>
          </header>

          <section className="lf-ex-lab-direct" aria-labelledby="lf-ex-lab-title">
            <div className="lf-ex-lab-direct__head">
              <div>
                <p>10 working builds</p>
                <h3 id="lf-ex-lab-title">Choose a direction and step inside.</h3>
                <span>
                  Most are experiments, two are client builds we can show. Each
                  one previews what a website can feel like before a business
                  chooses its direction.
                </span>
              </div>
              <a href="/examples/lab/" data-no-vt>
                See all Lab builds
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
            <div className="lf-ex-lab-direct__grid">
              {LAB_BUILDS.map((build) => (
                <a key={build.href} href={build.href} data-no-vt>
                  <span className="lf-ex-lab-card__media">
                    <img
                      src={`${build.poster}-800.webp`}
                      srcSet={`${build.poster}-480.webp 480w, ${build.poster}-800.webp 800w`}
                      sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw"
                      alt={build.alt}
                      width="800"
                      height="500"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="lf-ex-lab-card__copy">
                    <span className="lf-ex-lab-card__type">{build.type}</span>
                    <strong>{build.title}</strong>
                    <span className="lf-ex-lab-card__description">
                      {build.description}
                    </span>
                    <span className="lf-ex-lab-card__open">
                      Try it
                      <ArrowUpRight
                        size={17}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </section>

          <header className="lf-ex-tools__product-head">
            <h3>Working tools you can use now.</h3>
            <p>
              These are live products and public experiments, separate from
              client proof and ready to open.
            </p>
          </header>

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

      <WorkShowcase mode="archive" />

      <section id="industries" className="lf-ex-industries" aria-labelledby="lf-ex-ind-title">
        <div className="lf-ex-industries__inner">
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
