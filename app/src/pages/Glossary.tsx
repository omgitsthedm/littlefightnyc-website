import { Link } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { glossaryTerms } from "@/data/site";

export default function Glossary() {
  return (
    <>
      <PageHero
        eyebrow="Glossary"
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
          padding: "var(--lf-space-7) var(--lf-margin-mobile) var(--lf-space-9)",
        }}
      >
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
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
                      fontVariationSettings: '"opsz" 72',
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
                      fontVariationSettings: '"opsz" 14',
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
