import { Navigate, useParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { glossaryTerms } from "@/data/site";

export default function GlossaryTerm() {
  const { slug } = useParams();
  const term = glossaryTerms.find((item) => item.slug === slug);

  if (!term) return <Navigate to="/glossary/" replace />;

  return (
    <>
      <PageHero
        eyebrow="Defined Term"
        title={<>{term.term}</>}
        dek={term.plain}
        image={{
          src: "/assets/sign-groceries-snacks.webp",
          alt: "Hand-painted shop signage",
          width: 1600,
          height: 1200,
        }}
      />

      <section style={{ padding: "var(--lf-space-7) var(--lf-margin-mobile) var(--lf-space-9)" }}>
        <div style={{ maxWidth: "var(--lf-max-w)", marginInline: "auto" }}>
          <EditorialBody>
            <h2>What it means</h2>
            <p>{term.definition}</p>
            <h2>When it starts costing money</h2>
            <p>{term.whenItMatters}</p>
          </EditorialBody>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
