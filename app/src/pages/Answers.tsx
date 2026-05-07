import CallToAction from "@/components/CallToAction";
import { ownerAnswers } from "@/data/site";

export default function Answers() {
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

      <CallToAction compact />
    </>
  );
}
