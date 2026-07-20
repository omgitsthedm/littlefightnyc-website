import { Link, Navigate, useParams } from "react-router-dom";
import { BookOpen, Waypoints } from "lucide-react";
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
        icon={BookOpen}
        title={<>{term.term}</>}
        dek={term.plain}
        image={{
          src: GLOSSARY_IMAGE[term.slug] ?? "/assets/sign-groceries-snacks.webp",
          alt: "",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-content-section">
        <div className="lf-content-grid">
          <article className="lf-content-tile lf-content-tile--half">
            <EditorialBody dropcap>
              <h2>What it means</h2>
              <p>{term.definition}</p>
            </EditorialBody>
          </article>

          <article className="lf-content-tile lf-content-tile--half lf-content-tile--quiet">
            <EditorialBody>
              <h2>How it actually works</h2>
              <p>{term.howItWorks}</p>
            </EditorialBody>
          </article>

          <aside className="lf-content-tile lf-content-tile--full lf-content-tile--signal">
            <PullQuote>{term.example}</PullQuote>
          </aside>

          <article
            className={`lf-content-tile ${
              related.length > 0 ? "lf-content-tile--wide" : "lf-content-tile--full"
            }`}
          >
            <EditorialBody>
              <h2>When it starts costing money</h2>
              <p>{term.whenItMatters}</p>
              <p>{term.costOfIgnoring}</p>
            </EditorialBody>
          </article>

          {related.length > 0 && (
            <nav className="lf-content-tile lf-content-tile--narrow lf-content-tile--tablet-full lf-content-tile--quiet" aria-label="Related terms">
              <p className="lf-content-tile__label">
                <Waypoints size={14} strokeWidth={2} aria-hidden="true" />
                Related terms
              </p>
              <ul className="lf-chip-list">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link to={`/glossary/${r.slug}/`}>
                      {r.term} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <section className="lf-content-tile lf-content-tile--full">
            <FaqList title="Common questions" items={term.faq} />
          </section>
        </div>
      </section>

      <QuietContact />
    </>
  );
}
