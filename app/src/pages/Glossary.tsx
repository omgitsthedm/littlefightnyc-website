import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import TermMap from "@/components/dataviz/TermMap";
import { glossaryTerms } from "@/data/site";

export default function Glossary() {
  return (
    <>
      <PageHero
        eyebrow="Glossary"
        icon={BookOpen}
        title={
          <>
            What does that word{" "}
            <br />
            <span className="lf-em">mean for your business?</span>
          </>
        }
        dek="Pick the word somebody used in a proposal, bill, or sales call. We will explain it without making you feel like you should already know."
        image={{
          src: "/assets/sign-more-shops.webp",
          alt: "Hand-painted shop signage",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-content-section">
        <div className="lf-content-grid">
          <section className="lf-content-tile lf-content-tile--full lf-content-tile--quiet">
            <TermMap />
          </section>

          <aside className="lf-content-tile lf-content-tile--full">
            <p className="lf-content-tile__label">Before you buy another app</p>
            <h2>Five logins. Three bills. The same customer typed twice.</h2>
            <p>
              A new tool may help. It may also add one more place to check. Read the plain
              definition, look at the real problem, and buy something only when it makes the
              day easier for customers or staff.
            </p>
          </aside>

          <section className="lf-content-tile lf-content-tile--full">
            <ul className="lf-content-list lf-content-list--links lf-content-list--three" data-count={glossaryTerms.length}>
              {glossaryTerms.map((term) => (
                <li key={term.slug}>
                  <Link to={`/glossary/${term.slug}/`}>
                    <span className="lf-content-link__title">{term.term}</span>
                    <span className="lf-content-link__copy">{term.plain}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
