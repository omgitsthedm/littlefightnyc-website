import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { answerGuides } from "@/data/site";
import "@/styles/editorial/answers.css";

export default function AnswerGuide() {
  const { slug } = useParams();
  const guide = answerGuides.find((item) => item.slug === slug);
  const related = answerGuides.filter((item) => item.slug !== guide?.slug).slice(0, 3);

  if (!guide) return <Navigate to="/field-guide/#answers" replace />;

  return (
    <>
      <PageHero
        eyebrow="Owner Answer"
        title={<>{guide.question}</>}
        dek={guide.short.replace(/^Short answer:\s*/i, "")}
        image={{
          src: "/assets/local-business.webp",
          alt: "An NYC owner-operated business at street level",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-answer-page">
        <div className="lf-answer-page__inner">
          <p className="lf-answer-page__byline">
            <span>Little Fight NYC</span>
            <span aria-hidden="true"> · </span>
            <span>Published </span>
            <time dateTime="2026-05-07">May 7, 2026</time>
            <span aria-hidden="true"> · </span>
            <span>Updated </span>
            <time dateTime="2026-05-12">May 12, 2026</time>
          </p>

          {guide.sections.map((section) => (
            <article key={section.heading} className="lf-answer-page__section">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </article>
          ))}

          {guide.faq.length > 0 && (
            <section className="lf-answer-page__faq">
              <p className="lf-answer-page__faq-title">Quick answers</p>
              <div className="lf-answer-page__faq-list">
                {guide.faq.map((item) => (
                  <div key={item.question}>
                    <h3 className="lf-answer-page__faq-q">{item.question}</h3>
                    <p className="lf-answer-page__faq-a">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section
              style={{
                marginTop: "var(--lf-space-9)",
                paddingTop: "var(--lf-space-7)",
                borderTop: "1px solid var(--lf-hairline)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--lf-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--lf-bone-dim)",
                  margin: "0 0 var(--lf-space-5)",
                }}
              >
                Related reading
              </p>
              <ul className="lf-answers-index__list" style={{ borderTop: "1px solid var(--lf-hairline)" }}>
                {related.map((item, i) => (
                  <li key={item.slug} className="lf-answers-index__item">
                    <Link to={`/answers/${item.slug}/`} className="lf-answers-index__link">
                      <span className="lf-answers-index__num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="lf-answers-index__body">
                        <span className="lf-answers-index__q">{item.question}</span>
                        <span className="lf-answers-index__short">{item.short}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>

      <QuietContact />
    </>
  );
}
