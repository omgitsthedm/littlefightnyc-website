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

      <section
        style={{
          paddingBlock: "var(--lf-space-7) var(--lf-space-9)",
        }}
      >
        <div className="lf-container">
          <TermMap />
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              borderTop: "1px solid var(--lf-hairline)",
            }}
          >
            {glossaryTerms.map((term) => (
              <li
                key={term.slug}
                style={{ borderBottom: "1px solid var(--lf-hairline)" }}
              >
                <Link
                  to={`/glossary/${term.slug}/`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "var(--lf-space-2)",
                    padding: "var(--lf-space-5) 0",
                    textDecoration: "none",
                    color: "var(--lf-bone)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--lf-serif)",
                      fontWeight: 600,
                      fontSize: "var(--lf-text-lg)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {term.term}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--lf-serif)",
                      fontStyle: "italic",
                      fontSize: "var(--lf-text-base)",
                      color: "var(--lf-bone-soft)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {term.plain}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
