import { Link } from "react-router-dom";
import CallToAction from "@/components/CallToAction";
import { glossaryTerms } from "@/data/site";

export default function Glossary() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Plain-English glossary</p>
        <h1>Useful words. No vendor fog.</h1>
        <p className="short-answer">
          Short answer: these are the terms New York business owners run into when websites, tools, Google, and workflow
          start costing real money.
        </p>
      </section>

      <section className="section">
        <div className="answer-list term-list">
          {glossaryTerms.map((term) => (
            <Link key={term.slug} to={`/glossary/${term.slug}/`}>
              <p className="eyebrow">Defined term</p>
              <h3>{term.term}</h3>
              <p>{term.plain}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallToAction compact />
    </>
  );
}
