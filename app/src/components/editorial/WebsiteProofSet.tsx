import { Link } from "react-router-dom";
import { caseStudies } from "@/data/site-cases";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import "./WebsiteProofSet.css";

const PUBLIC_LIVE_CASE_SLUGS = [
  "hair-by-rachel-charles",
  "chromatic-painting-design",
  "cc-films",
] as const;

const CUSTOMER_PATHS: Record<(typeof PUBLIC_LIVE_CASE_SLUGS)[number], string> = {
  "hair-by-rachel-charles": "Real work, clear services, and a direct handoff to Square booking.",
  "chromatic-painting-design": "Local painting services and project photos lead into an estimate conversation.",
  "cc-films": "An official home for the film, trailer, press, and audience.",
};

const proofStudies = PUBLIC_LIVE_CASE_SLUGS.flatMap((slug) => {
  const study = caseStudies.find((candidate) => candidate.slug === slug);
  if (
    !study
    || study.showcase.availability !== "public"
    || study.showcase.proof.status !== "public-live"
    || study.showcase.linkPolicy !== "custom-domain"
    || !study.url
  ) return [];
  return [study];
});

export default function WebsiteProofSet() {
  if (proofStudies.length !== PUBLIC_LIVE_CASE_SLUGS.length) return null;

  return (
    <section className="lf-website-proof-set" aria-labelledby="lf-website-proof-set-title" data-lf-website-proof-set="public-live">
      <header className="lf-website-proof-set__head">
        <p>Public work, live</p>
        <h2 id="lf-website-proof-set-title">Three live sites. Three customer paths.</h2>
        <span>A booking handoff, a local service path, and one official place for a visitor to watch, read, or act. Each is public and open to inspect.</span>
      </header>

      <ul className="lf-website-proof-set__list">
        {proofStudies.map((study) => {
          const datedMetric = study.metrics?.find((metric) => metric.label.includes("Dated"));
          return (
            <li key={study.slug}>
              <Link className="lf-website-proof-set__image" to={`/case-studies/${study.slug}/`}>
                <img
                  {...skelImg}
                  src={study.image}
                  {...responsiveImageProps(study.image, "(min-width: 768px) 30vw, 100vw", [480, 640, 900])}
                  alt={`The ${study.client} website as it shipped`}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="lf-website-proof-set__copy">
                <p className="lf-website-proof-set__type">{study.type}</p>
                <h3>{study.client}</h3>
                <p>{CUSTOMER_PATHS[study.slug as keyof typeof CUSTOMER_PATHS]}</p>
                {datedMetric && <p className="lf-website-proof-set__check">{datedMetric.value} · {datedMetric.label}</p>}
                <div className="lf-website-proof-set__links">
                  <Link to={`/case-studies/${study.slug}/`}>Read project proof</Link>
                  <a href={study.url} target="_blank" rel="noopener noreferrer" data-lf-event="portfolio_live_source" data-lf-label={study.slug}>Visit live site</a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
