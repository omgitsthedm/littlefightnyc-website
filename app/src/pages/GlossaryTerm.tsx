import { Link, Navigate, useParams } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { glossaryTerms } from "@/data/site";

export default function GlossaryTerm() {
  const { slug } = useParams();
  const term = glossaryTerms.find((item) => item.slug === slug);
  const related = glossaryTerms.filter((item) => item.slug !== term?.slug).slice(0, 3);

  if (!term) return <Navigate to="/glossary/" replace />;

  return (
    <>
      <article className="page-hero article-hero">
        <p className="eyebrow">Defined term</p>
        <h1>{term.term}</h1>
        <p className="short-answer">Short answer: {term.plain}</p>
      </article>

      <section className="section split">
        <div>
          <p className="eyebrow">Meaning</p>
          <h2>What it means.</h2>
        </div>
        <article className="soft-card highlight-card">
          <h3>{term.term}</h3>
          <p>{term.definition}</p>
        </article>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Why owners care</p>
          <h2>When it starts costing money.</h2>
        </div>
        <article className="soft-card">
          <p>{term.whenItMatters}</p>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Related terms</p>
          <h2>Keep the language useful.</h2>
        </div>
        <div className="answer-list">
          {related.map((item) => (
            <Link key={item.slug} to={`/glossary/${item.slug}/`}>
              <h3>{item.term}</h3>
              <p>{item.plain}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
