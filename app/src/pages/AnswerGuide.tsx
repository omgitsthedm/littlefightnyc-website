import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import AnswerDiagram from "@/components/dataviz/AnswerDiagram";
import AnswerStepper from "@/components/dataviz/AnswerStepper";
import AnswerVerdict from "@/components/dataviz/AnswerVerdict";
import ShareButton from "@/components/ShareButton";
import { answerGuides, answerServiceBridge } from "@/data/site";
import {
  ANSWER_CLUSTERS,
  ANSWER_VERDICTS,
  answerArt,
  isTriageGuide,
} from "@/data/answersArt";
import "@/styles/editorial/answers.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function displayDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

/** Same-cluster guides first (same symptom family), then the rest. */


function relatedGuides(slug: string) {
  const cluster = ANSWER_CLUSTERS.find((c) => c.slugs.includes(slug));
  const siblings = cluster ? cluster.slugs.filter((s) => s !== slug) : [];
  const rank = (s: string) => (siblings.includes(s) ? 0 : 1);
  return answerGuides
    .filter((item) => item.slug !== slug)
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .slice(0, 3);
}

export default function AnswerGuide() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const guide = answerGuides.find((item) => item.slug === slug);

  if (!guide) return <Navigate to="/examples/#answers" replace />;

  const related = relatedGuides(guide.slug);
  const triage = isTriageGuide(guide.sections);
  const verdict = ANSWER_VERDICTS[guide.slug];

  return (
    <>
      <PageHero
        eyebrow="Owner Answer"
        icon={HelpCircle}
        title={<>{guide.question}</>}
        quickAnswer={guide.short.replace(/^Short answer:\s*/i, "")}
        image={{
          src: answerArt(guide.slug),
          alt: "",
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
            <time dateTime={guide.published}>{displayDate(guide.published)}</time>
            <span aria-hidden="true"> · </span>
            <span>Updated </span>
            <time dateTime={guide.updated}>{displayDate(guide.updated)}</time>
            <span aria-hidden="true"> · </span>
            <ShareButton
              title={guide.question}
              text={guide.short}
              url={`https://littlefightnyc.com${pathname}`}
              label="Share"
            />
          </p>

          {triage ? (
            <AnswerStepper sections={guide.sections} />
          ) : (
            guide.sections.map((section) => (
              <article key={section.heading} className="lf-answer-page__section">
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </article>
            ))
          )}

          {verdict && <AnswerVerdict verdict={verdict} />}

          <AnswerDiagram slug={guide.slug} />

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

          {answerServiceBridge[guide.slug] && (
            <aside className="lf-answer-page__bridge">
              <p className="lf-answer-page__bridge-eyebrow">Reading done. Want it handled?</p>
              <Link to={answerServiceBridge[guide.slug].to} className="lf-answer-page__bridge-link">
                <span className="lf-answer-page__bridge-name">{answerServiceBridge[guide.slug].name}</span>
                <span className="lf-answer-page__bridge-line">{answerServiceBridge[guide.slug].line}</span>
              </Link>
            </aside>
          )}

          {related.length > 0 && (
            <section className="lf-answer-page__related">
              <p className="lf-answer-page__related-title">Related reading</p>
              <ul className="lf-answers-index__list lf-answer-page__related-list">
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
