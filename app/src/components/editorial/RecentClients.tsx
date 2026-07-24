import { Link } from "react-router-dom";
import { ArrowUpRight, ScanSearch } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "./useScrollReveal";
import { caseStudies } from "@/data/site";
import type { CaseStudy } from "@/data/site";
import { ProofStatus } from "./ProofPassport";
import "./RecentClients.css";

/**
 * Recent work - public, checkable proof before any sales claim.
 */
const FEATURED_SLUGS = [
  "hair-by-rachel-charles",
  "cc-films",
  "venuecircuit",
] as const;

function DeferredProofImage({ study, featured }: { study: CaseStudy; featured: boolean }) {
  const frameRef = useRef<HTMLSpanElement | null>(null);
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={frameRef}
      className={`lf-clients__preview${ready ? " lf-clients__preview--ready" : ""}`}
      aria-busy={!ready}
    >
      {ready ? (
        <img
          src={`/assets/case-${study.slug}-explore${featured ? "" : "-mobile"}.webp`}
          alt={`${study.client} live website captured at ${featured ? "desktop" : "phone"} size`}
          width={featured ? 1200 : 390}
          height={featured ? 2000 : 2400}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      ) : (
        <span className="lf-clients__preview-placeholder" aria-hidden="true">
          Live proof
        </span>
      )}
    </span>
  );
}

export default function RecentClients() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.12 });

  const featured = FEATURED_SLUGS
    .map((slug) => caseStudies.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="lf-clients" aria-label="Recent work">
      <div className="lf-clients__inner">
        <div className="lf-clients__head">
          <div>
            <p className="lf-mono lf-clients__label">Live work</p>
            <h2 className="lf-clients__heading">Tap through the proof.</h2>
            <p className="lf-clients__lede">
              A booking site, an official film source, and our own venue product.
              Open each case, then open the live work.
            </p>
          </div>
          <Link to="/examples/" className="lf-clients__all">
            See every result <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <div ref={ref} className="lf-clients__grid">
          {featured.map((study, i) => (
            <Link
              key={study.slug}
              to={`/case-studies/${study.slug}/`}
              className={`lf-clients__card${i === 0 ? " lf-clients__card--feature" : ""}`}
              style={{ ["--lf-i" as string]: i }}
            >
              <DeferredProofImage study={study} featured={i === 0} />
              <span className="lf-clients__meta">
                <ProofStatus study={study} className="lf-clients__status" />
                <span className="lf-mono lf-clients__type">{study.showcase.context}</span>
                <span className="lf-clients__client">{study.showcase.label}</span>
                <span className="lf-clients__title">{study.title}</span>
                {study.metrics && (
                  <span
                    className="lf-clients__facts"
                    aria-label={`${study.showcase.label} build facts and delivered results`}
                  >
                    {study.metrics.slice(0, 3).map((metric) => (
                      <span className="lf-clients__fact" key={metric.label}>
                        <strong>{metric.value}</strong>
                        <span>{metric.label}</span>
                      </span>
                    ))}
                  </span>
                )}
              </span>
              <ArrowUpRight className="lf-clients__go" size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
          ))}
        </div>

        <aside className="lf-clients__scan" aria-label="Free website scan">
          <span className="lf-clients__scan-icon" aria-hidden="true">
            <ScanSearch size={24} strokeWidth={1.75} />
          </span>
          <div className="lf-clients__scan-copy">
            <p className="lf-mono lf-clients__scan-label">Start with the free read</p>
            <h3>Get a practical website plan before you spend.</h3>
            <p>Send the current site and the goal. A real person reviews it and replies with the clearest next move. No meeting required.</p>
          </div>
          <a
            className="lf-clients__scan-cta"
            href="/tech-audit/?intent=website&source=home_proof_band"
            data-lf-event="tech_audit_started"
            data-lf-label="home_proof_band"
          >
            Plan my website
            <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
}
