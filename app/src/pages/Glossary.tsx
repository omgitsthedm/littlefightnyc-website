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
            Useful words,{" "}
            <br />
            <span className="lf-em">no vendor fog.</span>
          </>
        }
        dek="The terms NYC owners hit when websites, tools, Google, and workflow start costing real money."
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
