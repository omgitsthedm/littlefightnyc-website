import {
  LayoutGrid,
  ArrowUpRight,
  BriefcaseBusiness,
  HeartPulse,
  MessagesSquare,
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
import CoverageMatrix from "@/components/dataviz/CoverageMatrix";
import { useCountUp } from "@/components/dataviz/useCountUp";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import { answerGuides, caseStudies } from "@/data/site";
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

/* Record-wall chip value. Purely numeric values ("100") count up on reveal;
 * string values ("3 tools → 1", "Next.js 14") render static. The hook is
 * called unconditionally (rules of hooks); non-numeric targets never animate. */
function RecordValue({ value, delay }: { value: string; delay: number }) {
  const numeric = /^\d+$/.test(value.trim());
  const target = numeric ? Number(value.trim()) : 0;
  const { ref, value: shown } = useCountUp<HTMLSpanElement>(target, {
    duration: 900,
    delay,
  });
  if (!numeric) return <span className="lf-ex-record__value">{value}</span>;
  return (
    <span ref={ref} className="lf-ex-record__value">
      {shown}
    </span>
  );
}

export default function FieldGuide() {
  const featured = caseStudies[0];
  const rest = caseStudies.slice(1);

  // The record wall — every vetted metric chip across all case studies,
  // flattened straight from site.ts. No new claims, no rewording.
  const record = caseStudies.flatMap((study) =>
    (study.metrics ?? []).map((m) => ({
      ...m,
      client: study.client,
      slug: study.slug,
    })),
  );

  const featuredRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const rowsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });
  const recordRef = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });
  const industriesRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const answersRef = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  return (
    <>
      <PageHero
        eyebrow="Examples"
        icon={LayoutGrid}
        title={
          <>
            Proof, maps,{" "}
            <br />
            <span className="lf-em">and plain answers.</span>
          </>
        }
        dek="Real work with real names on it. Look before you talk to anyone. See the builds, find your business type, and get straight answers."
        image={{
          src: "/assets/hero-examples-market.webp",
          alt: "A Manhattan Chinatown restaurant storefront lit up at night near the Manhattan Bridge",
          width: 1600,
          height: 1200,
          mobileWidths: [480, 640],
        }}
      />

      {/* ONE featured study, full width — the proof leads. */}
      <section id="studies" className="lf-ex-feature" aria-labelledby="lf-ex-feature-title">
        <div ref={featuredRef} className="lf-ex-feature__inner" data-reveal>
          <header className="lf-ex-head">
            <p className="lf-ex-head__eyebrow">Case Studies</p>
            <h2 id="lf-ex-feature-title" className="lf-ex-head__title">
              What actually shipped.
            </h2>
            <p className="lf-ex-head__dek">
              Real projects, published with permission. Each one shows what we
              kept, what we changed, and what the owner got back.
            </p>
          </header>

          {featured && (
            <Link
              to={`/case-studies/${featured.slug}/`}
              className="lf-ex-feature__card"
            >
              <span className="lf-ex-feature__media" aria-hidden="true">
                <picture>
                  <source
                    media="(max-width: 767px)"
                    {...responsiveImageProps(featured.image, "100vw", [480, 640])}
                  />
                  <img {...skelImg}
                    src={featured.image}
                    alt=""
                    {...responsiveImageProps(
                      featured.image,
                      "(min-width: 1024px) 58vw, 100vw",
                      [640, 900],
                    )}
                    width={1800}
                    height={1200}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
              </span>
              <span className="lf-ex-feature__copy">
                <span className="lf-ex-feature__flag">Featured build</span>
                <span className="lf-ex-feature__client">{featured.client}</span>
                <span className="lf-ex-feature__outcome">{featured.result}</span>
                {featured.metrics && featured.metrics.length > 0 && (
                  <span className="lf-ex-feature__metrics">
                    {featured.metrics.map((m) => (
                      <span key={m.label} className="lf-ex-feature__metric">
                        <strong>{m.value}</strong> {m.label}
                      </span>
                    ))}
                  </span>
                )}
                <span className="lf-ex-feature__cta">
                  See the full story
                  <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* The rest — three equal case-study columns. */}
      <section className="lf-ex-rows" aria-label="More case studies">
        <div ref={rowsRef} className="lf-ex-rows__inner" data-reveal>
          <ul className="lf-ex-rows__grid" data-count={rest.length}>
            {rest.map((study, i) => (
              <li
                key={study.slug}
                className="lf-ex-rows__cell"
                style={{ ["--lf-i" as string]: i }}
              >
                <Link
                  to={`/case-studies/${study.slug}/`}
                  className="lf-ex-rows__card"
                >
                  <span className="lf-ex-rows__media" aria-hidden="true">
                    <picture>
                      <source
                        media="(max-width: 767px)"
                        {...responsiveImageProps(study.image, "100vw", [480, 640])}
                      />
                      <img {...skelImg}
                        src={study.image}
                        alt=""
                        {...responsiveImageProps(
                          study.image,
                          "(min-width: 1024px) 33vw, 100vw",
                          [480, 640, 900],
                        )}
                        width={1800}
                        height={1200}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </span>
                  <span className="lf-ex-rows__copy">
                    <span className="lf-ex-rows__type">{study.type}</span>
                    <span className="lf-ex-rows__client">{study.client}</span>
                    <span className="lf-ex-rows__title">{study.title}</span>
                    <span className="lf-ex-rows__open">
                      See the study <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The record wall — every published metric, one dense proof grid. */}
      {record.length > 0 && (
        <section id="record" className="lf-ex-record" aria-labelledby="lf-ex-record-title">
          <div
            ref={recordRef}
            className="lf-ex-record__inner"
            data-reveal
            data-revealed="true"
          >
            <header className="lf-ex-head">
              <p className="lf-ex-head__eyebrow">The record</p>
              <h2 id="lf-ex-record-title" className="lf-ex-head__title">
                Every claim, on the wall.
              </h2>
              <p className="lf-ex-head__dek">
                Each fact below comes straight from a shipped build — nothing
                projected, nothing rounded up. Tap a name to read where it
                came from.
              </p>
            </header>
            <ul className="lf-ex-record__grid">
              {record.map((entry, i) => (
                <li
                  key={`${entry.slug}-${entry.label}`}
                  className="lf-ex-record__cell"
                  style={{ ["--lf-i" as string]: i }}
                >
                  <RecordValue value={entry.value} delay={Math.min(i * 40, 560)} />
                  <span className="lf-ex-record__label">{entry.label}</span>
                  <Link
                    to={`/case-studies/${entry.slug}/`}
                    className="lf-ex-record__client"
                  >
                    {entry.client}
                    <span aria-hidden="true"> →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* The Lab — the demo-build showcase on its own subdomain. */}
      <section className="lf-ex-lab" aria-label="The Lab demo builds">
        <div className="lf-ex-lab__inner">
          <div>
            <p className="lf-ex-head__eyebrow">The Lab</p>
            <h2 className="lf-ex-lab__title">Fifteen sites we built to prove it.</h2>
            <p className="lf-ex-head__dek">
              Demo builds for barbershops, diners, gyms, florists — real working
              sites, not mockups. Poke around. Break nothing.
            </p>
          </div>
          <a className="lf-ex-lab__link" href="https://lab.littlefightnyc.com" rel="external">
            Visit The Lab
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
      </section>

      {/* Industries — a compact icon band, not six photo cards. */}
      <section id="industries" className="lf-ex-industries" aria-labelledby="lf-ex-ind-title">
        <div ref={industriesRef} className="lf-ex-industries__inner" data-reveal>
          <header className="lf-ex-head">
            <p className="lf-ex-head__eyebrow">Industries</p>
            <h2 id="lf-ex-ind-title" className="lf-ex-head__title">
              Find your business type.
            </h2>
            <p className="lf-ex-head__dek">
              Law office, bar, clothing brand, salon, restaurant, clinic, gym,
              gallery — pick the one that looks like yours.
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

      {/* Answers — big-type questions, no photos. They should look like answers. */}
      <section id="answers" className="lf-ex-answers" aria-labelledby="lf-ex-ans-title">
        <div ref={answersRef} className="lf-ex-answers__inner" data-reveal>
          <header className="lf-ex-head">
            <p className="lf-ex-head__eyebrow">Answers</p>
            <h2 id="lf-ex-ans-title" className="lf-ex-head__title">
              Jump to your question.
            </h2>
            <p className="lf-ex-head__dek">
              Owners ask us these all the time. Short answers, plain words, no
              sales talk.
            </p>
          </header>
          <ul className="lf-ex-answers__grid">
            {answerGuides.slice(0, 6).map((guide, i) => (
              <li
                key={guide.slug}
                className="lf-ex-answers__cell"
                style={{ ["--lf-i" as string]: i }}
              >
                <Link
                  to={`/answers/${guide.slug}/`}
                  className="lf-ex-answers__card"
                >
                  <span className="lf-ex-answers__label" aria-hidden="true">
                    <MessagesSquare size={16} strokeWidth={2} />
                    Owner answer
                  </span>
                  <span className="lf-ex-answers__q">{guide.question}</span>
                  <span className="lf-ex-answers__a">
                    {guide.short.replace(/^Short answer:\s*/i, "")}
                  </span>
                  <span className="lf-ex-answers__open">
                    Read the answer <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="lf-ex-answers__more">
            <Link to="/library/">
              See all the answers <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
