import { Link } from "react-router-dom";
import type { CaseStudy } from "@/data/site-cases";
import "./ClientCaseEditorial.css";

/** Real site captures, framed without altering or stretching their contents. */
export function ClientCaseHero({ study }: { study: CaseStudy }) {
  if (!study.editorial) return null;
  return (
    <figure className="lf-client-capture lf-client-capture--hero">
      <div className="lf-client-capture__bar">
        <span className="lf-client-capture__dots" aria-hidden="true"><i /><i /><i /></span>
        <span>{new URL(study.url).hostname.replace(/^www\./, "")}</span>
        <span className="lf-client-capture__kind">Website</span>
      </div>
      <picture>
        <source media="(min-width: 64rem)" srcSet={`/assets/case-${study.slug}-desktop-1440.webp`} width={2880} height={2000} />
        <source media="(min-width: 48rem)" srcSet={`/assets/case-${study.slug}-tablet-1024.webp`} width={2048} height={2000} />
        <img src={`/assets/case-${study.slug}-mobile-390.webp`} alt={study.editorial.imageAlt} width={780} height={1688} fetchPriority="high" decoding="async" />
      </picture>
      <figcaption>
        Website by Little Fight NYC for <a href={study.url} target="_blank" rel="noopener noreferrer">{study.client}</a>.
      </figcaption>
    </figure>
  );
}

export default function ClientCaseEditorial({ study }: { study: CaseStudy }) {
  const content = study.editorial;
  if (!content) return null;
  return (
    <div className="lf-client-editorial" data-client-case={study.slug}>
      <section className="lf-client-editorial__chapter" aria-labelledby={`design-${study.slug}`}>
        <header><span className="lf-client-editorial__label">The design</span><h2 id={`design-${study.slug}`}>Why it looks this way.</h2></header>
        <div className="lf-client-editorial__prose">{content.design.map(text => <p key={text}>{text}</p>)}</div>
      </section>
      <figure className="lf-client-capture lf-client-capture--detail">
        <div className="lf-client-capture__bar"><span className="lf-client-capture__dots" aria-hidden="true"><i /><i /><i /></span><span>{content.detailLabel}</span><span className="lf-client-capture__kind">Detail</span></div>
        <a href={`/assets/cases/2026-09-29/${study.slug}/detail-desktop.webp`} target="_blank" rel="noopener noreferrer" aria-label={`Open the full-size ${study.client} detail capture`}>
          <img src={`/assets/cases/2026-09-29/${study.slug}/detail-desktop.webp`} alt={content.detailAlt} width={2880} height={2000} loading="lazy" decoding="async" />
        </a>
        <figcaption>{content.detailAlt} <a href={content.detailUrl} target="_blank" rel="noopener noreferrer">{content.detailLabel}.</a></figcaption>
      </figure>
      <section className="lf-client-editorial__chapter" aria-labelledby={`detail-${study.slug}`}>
        <header><span className="lf-client-editorial__label">The useful detail</span><h2 id={`detail-${study.slug}`}>{content.detailTitle}</h2></header>
        <div className="lf-client-editorial__prose">{content.detail.map(text => <p key={text}>{text}</p>)}</div>
      </section>
      <section className="lf-client-editorial__chapter" aria-labelledby={`build-${study.slug}`}>
        <header><span className="lf-client-editorial__label">Under the surface</span><h2 id={`build-${study.slug}`}>How the parts connect.</h2></header>
        <div className="lf-client-editorial__prose">{content.technical.map(text => <p key={text}>{text}</p>)}<p>{content.closing}</p></div>
      </section>
      <section className="lf-client-editorial__questions" aria-labelledby={`questions-${study.slug}`}>
        <h2 id={`questions-${study.slug}`}>About this project.</h2>
        {content.questions.map((item, index) => <details key={item.question} data-lf-disclosure={`client-case:${study.slug}:${index}`}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
      </section>
      <footer className="lf-client-editorial__source">
        <p>By <Link to="/">Little Fight NYC</Link>. Website reviewed <time dateTime={study.updated}>September 29, 2026</time>.</p>
        <p>{content.imageNote}</p>
        <p>Source: <a href={study.url} target="_blank" rel="noopener noreferrer">{study.client}’s public website</a>. The review checked public pages and links; no forms, purchases, or appointments were submitted.</p>
      </footer>
    </div>
  );
}
