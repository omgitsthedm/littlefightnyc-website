import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import FaqList from "@/components/editorial/FaqList";
import QuietContact from "@/components/editorial/QuietContact";
import { glossaryTerms } from "@/data/site";

const GLOSSARY_IMAGE: Record<string, string> = {
  "business-system": "/assets/coworking-laptops.webp",
  crm: "/assets/owner.webp",
  "google-business-profile": "/assets/sign-more-shops.webp",
  "local-search": "/assets/nyc-street.webp",
  "software-stack": "/assets/pos.webp",
  "workflow-automation": "/assets/typing.webp",
};

export default function GlossaryTerm() {
  const { slug } = useParams();
  const term = glossaryTerms.find((item) => item.slug === slug);

  if (!term) return <Navigate to="/glossary/" replace />;

  const related = term.related
    .map((s) => glossaryTerms.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      <PageHero
        eyebrow="Plain-English term"
        title={<>{term.term}</>}
        dek={term.plain}
        image={{
          src: GLOSSARY_IMAGE[term.slug] ?? "/assets/sign-groceries-snacks.webp",
          alt: "",
          width: 1600,
          height: 1200,
        }}
      />

      <section style={{ padding: "var(--lf-space-7) var(--lf-margin-mobile) var(--lf-space-9)" }}>
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
          <EditorialBody dropcap>
            <h2>What it means</h2>
            <p>{term.definition}</p>
            <h2>How it actually works</h2>
            <p>{term.howItWorks}</p>
          </EditorialBody>

          <PullQuote>{term.example}</PullQuote>

          <EditorialBody>
            <h2>When it starts costing money</h2>
            <p>{term.whenItMatters}</p>
            <p>{term.costOfIgnoring}</p>
          </EditorialBody>

          <FaqList title="Common questions" items={term.faq} />

          {related.length > 0 && (
            <nav
              aria-label="Related terms"
              style={{
                marginTop: "var(--lf-space-8)",
                paddingTop: "var(--lf-space-6)",
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
                  margin: "0 0 var(--lf-space-4)",
                }}
              >
                Related terms
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "var(--lf-space-3)" }}>
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to={`/glossary/${r.slug}/`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4em",
                        padding: "10px 16px",
                        minHeight: "44px",
                        borderRadius: "var(--lf-radius-pill)",
                        border: "1px solid var(--lf-hairline)",
                        color: "var(--lf-bone)",
                        textDecoration: "none",
                        fontSize: "var(--lf-text-sm)",
                      }}
                    >
                      {r.term} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <QuietContact />
    </>
  );
}
