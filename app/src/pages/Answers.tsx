import { Link, useSearchParams } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { answerGuides, ownerAnswers } from "@/data/site";

export default function Answers() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const visibleGuides = query
    ? answerGuides.filter((guide) => `${guide.question} ${guide.short}`.toLowerCase().includes(query))
    : answerGuides;

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Owner answers</p>
        <h1>Fast answers before another bill.</h1>
        <p>
          Plain-English decisions for local owners comparing websites, software,
          Google visibility, IT support, and custom systems.
        </p>
      </section>

      <section className="section answer-list">
        {ownerAnswers.map((answer) => (
          <article key={answer.question}>
            <h2>{answer.question}</h2>
            <p>{answer.short}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Field guides</p>
          <h2>Search questions local owners actually ask.</h2>
        </div>
        <div className="answer-list">
          {visibleGuides.map((guide) => (
            <Link key={guide.slug} to={`/answers/${guide.slug}/`}>
              <h2>{guide.question}</h2>
              <p>{guide.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
