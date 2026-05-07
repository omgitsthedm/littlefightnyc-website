import { Link, Navigate, useParams } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { answerGuides } from "@/data/site";

export default function AnswerGuide() {
  const { slug } = useParams();
  const guide = answerGuides.find((item) => item.slug === slug);
  const related = answerGuides.filter((item) => item.slug !== guide?.slug).slice(0, 3);

  if (!guide) return <Navigate to="/answers/" replace />;

  return (
    <>
      <article className="page-hero article-hero">
        <p className="eyebrow">Owner answer · David Marsh · Updated May 7, 2026</p>
        <h1>{guide.question}</h1>
        <p className="short-answer">{guide.short}</p>
      </article>

      <section className="section article-body">
        {guide.sections.map((section) => (
          <article key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}
        <article>
          <h2>Useful outside references.</h2>
          <p>
            For local visibility questions, start with{" "}
            <a href="https://support.google.com/business/" rel="noreferrer" target="_blank">
              Google Business Profile Help
            </a>
            . For website search data, use{" "}
            <a href="https://search.google.com/search-console/about" rel="noreferrer" target="_blank">
              Google Search Console
            </a>
            .
          </p>
        </article>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2>Quick answers.</h2>
        </div>
        <div className="faq-list">
          {guide.faq.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Related reading</p>
          <h2>Keep sorting the mess.</h2>
        </div>
        <div className="answer-list">
          {related.map((item) => (
            <Link key={item.slug} to={`/answers/${item.slug}/`}>
              <h3>{item.question}</h3>
              <p>{item.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
