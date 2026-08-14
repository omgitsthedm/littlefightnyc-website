import { Link, Navigate, useParams } from "react-router-dom";
import { BookOpen, Waypoints } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import PullQuote from "@/components/editorial/PullQuote";
import FaqList from "@/components/editorial/FaqList";
import QuietContact from "@/components/editorial/QuietContact";
import ConnectedPathDiagram from "@/components/dataviz/ConnectedPathDiagram";
import {
  createConnectedPath,
  type ConnectedPath,
} from "@/components/dataviz/connectedPath";
import { glossaryTerms } from "@/data/site";

const GLOSSARY_IMAGE: Record<string, string> = {
  "business-system": "/assets/coworking-laptops.webp",
  crm: "/assets/owner.webp",
  "google-business-profile": "/assets/sign-more-shops.webp",
  "local-search": "/assets/nyc-street.webp",
  "software-stack": "/assets/pos.webp",
  "workflow-automation": "/assets/typing.webp",
};

type TermSource = { label: string; href: string; note: string };

const TERM_SOURCES: Record<string, TermSource[]> = {
  "google-business-profile": [
    {
      label: "Google: Get started with a Business Profile",
      href: "https://support.google.com/business/answer/7039811?hl=en-en",
      note: "Google’s primary guide for profile details, verification, and managing how a business appears in Search and Maps.",
    },
    {
      label: "Google: Tips to get more reviews",
      href: "https://support.google.com/business/answer/3474122?hl=en-en",
      note: "Google’s current rules for review requests, including its ban on incentives for reviews.",
    },
  ],
  "local-search": [
    {
      label: "Google: Tips to improve local ranking",
      href: "https://support.google.com/business/answer/7091?hl=en-en",
      note: "Google’s primary guidance on the factors it says can affect regular local results; it does not promise a placement.",
    },
  ],
};

const GLOSSARY_PATHS: Record<string, ConnectedPath> = {
  "business-system": createConnectedPath({
    label: "A business-system path",
    summary:
      "A customer request enters one shared path, the team can see it, the next action is assigned, and the owner can check what happened.",
    caption: "A system is useful when the next step stays visible.",
    nodes: [
      { id: "one", label: "A customer asks", sub: "Call · form · walk-in", col: 0 },
      { id: "two", label: "The work has one path", sub: "Shared record · clear place", col: 1 },
      { id: "three", label: "The next step is visible", sub: "Quote · schedule · answer", tone: "hub", col: 2 },
      { id: "four", label: "The owner can check", sub: "No guessing · no loose thread", tone: "signal", col: 3 },
    ],
  }),
  crm: createConnectedPath({
    label: "A customer-record path",
    summary:
      "A customer question becomes one record with its context, a person sees the next step, and the business can follow up without recreating the story.",
    caption: "The point is context, not another dashboard.",
    nodes: [
      { id: "one", label: "A customer gets in touch", sub: "Question · visit · referral", col: 0 },
      { id: "two", label: "One record holds context", sub: "Name · need · prior note", col: 1 },
      { id: "three", label: "A person sees the next step", sub: "Reply · quote · schedule", tone: "hub", col: 2 },
      { id: "four", label: "The story stays findable", sub: "No starting over", tone: "signal", col: 3 },
    ],
  }),
  "google-business-profile": createConnectedPath({
    label: "A Google Business Profile path",
    summary:
      "The business verifies its profile, keeps its public facts accurate, appears consistently in Google Search and Maps, and gives a customer a clear way to decide or act.",
    caption: "Accurate public facts help a customer decide; they do not guarantee a rank.",
    nodes: [
      { id: "one", label: "The owner verifies the profile", sub: "Real business · real control", col: 0 },
      { id: "two", label: "Public facts stay accurate", sub: "Hours · phone · category", col: 1 },
      { id: "three", label: "Search and Maps agree", sub: "A clearer public listing", tone: "hub", col: 2 },
      { id: "four", label: "A customer can decide", sub: "Call · visit · learn more", tone: "signal", col: 3 },
    ],
  }),
  "local-search": createConnectedPath({
    label: "A local-search path",
    summary:
      "A business keeps its public facts true, gives its website clear pages, makes useful details easy to check, and gives a nearby customer a sensible next step.",
    caption: "Clear facts help people find and choose a business; no result is promised.",
    nodes: [
      { id: "one", label: "The facts are true", sub: "Offer · place · hours", col: 0 },
      { id: "two", label: "The website explains them", sub: "Useful pages · plain words", col: 1 },
      { id: "three", label: "Details are easy to check", sub: "Search · Maps · site", tone: "hub", col: 2 },
      { id: "four", label: "A nearby customer can act", sub: "Call · visit · ask", tone: "signal", col: 3 },
    ],
  }),
  "software-stack": createConnectedPath({
    label: "A software-stack path",
    summary:
      "The business lists the tools it pays for, names the job and owner for each, finds overlap or a loose handoff, and changes only the part that needs changing.",
    caption: "A stack should earn its place, one job at a time.",
    nodes: [
      { id: "one", label: "List the tools", sub: "Subscriptions · logins · bills", col: 0 },
      { id: "two", label: "Name each job and owner", sub: "What it does · who needs it", col: 1 },
      { id: "three", label: "Find overlap or a loose handoff", sub: "Less retyping · fewer surprises", tone: "hub", col: 2 },
      { id: "four", label: "Change carefully", sub: "Keep what works", tone: "signal", col: 3 },
    ],
  }),
  "workflow-automation": createConnectedPath({
    label: "A workflow-automation path",
    summary:
      "A repeatable business event starts an approved rule, the shared record updates, a person handles the exceptions, and the owner can still see what happened.",
    caption: "Automate the boring repeat, not the judgment call.",
    nodes: [
      { id: "one", label: "A repeatable event happens", sub: "Request · payment · booking", col: 0 },
      { id: "two", label: "An approved rule runs", sub: "One small repeatable job", col: 1 },
      { id: "three", label: "The shared record updates", sub: "Less copying · clear status", tone: "hub", col: 2 },
      { id: "four", label: "A person handles exceptions", sub: "Judgment stays human", tone: "signal", col: 3 },
    ],
  }),
};

export default function GlossaryTerm() {
  const { slug } = useParams();
  const term = glossaryTerms.find((item) => item.slug === slug);

  if (!term) return <Navigate to="/glossary/" replace />;

  const related = term.related
    .map((s) => glossaryTerms.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const source = TERM_SOURCES[term.slug];

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
              <h2>What happens in real life</h2>
              <p>{term.howItWorks}</p>
            </EditorialBody>
          </article>

          <aside className="lf-content-tile lf-content-tile--full lf-content-tile--signal">
            <PullQuote>{term.example}</PullQuote>
          </aside>

          <aside
            className="lf-content-tile lf-content-tile--full lf-content-tile--quiet"
          >
            <p className="lf-content-tile__label">See the steps</p>
            <ConnectedPathDiagram path={GLOSSARY_PATHS[term.slug]} proof="glossary" />
          </aside>

          <aside className="lf-content-tile lf-content-tile--full lf-content-tile--quiet">
            <EditorialBody>
              <h2>You may not need to buy anything</h2>
              <p>
                This word names a tool or a way of working. It is not an order. Keep the simple
                setup if it works. Change it when the same problem keeps wasting a customer's
                time or making staff repeat work.
              </p>
              {source?.map((item) => (
                <p key={item.href}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label} ↗
                  </a>{" "}
                  — {item.note}
                </p>
              ))}
            </EditorialBody>
          </aside>

          <article
            className={`lf-content-tile ${
              related.length > 0 ? "lf-content-tile--wide" : "lf-content-tile--full"
            }`}
          >
            <EditorialBody>
              <h2>When this becomes a real problem</h2>
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
