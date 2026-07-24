import { Link, Navigate, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import AuditMapDiagram from "@/components/dataviz/AuditMapDiagram";
import industries from "@/data/industries.json";
import { prepareIndustryHtml } from "@/lib/legacyHtml";
import "@/styles/editorial/journal.css";
import "@/styles/editorial/industry.css";

type Industry = {
  slug: string;
  title: string;
  description: string;
  html: string;
  image?: string;
};

type AuditMapPieces = {
  heading: string;
  paragraphs: string[];
  links: { href: string; label: string }[];
};

type IndustryStart = {
  eyebrow: string;
  title: string;
  detail: string;
  to: string;
};

const DEFAULT_STARTS: IndustryStart[] = [
  {
    eyebrow: "Public front door",
    title: "People cannot quickly verify, trust, or act.",
    detail: "Clarify the site, local visibility, and customer next step.",
    to: "/services/custom-local-websites/",
  },
  {
    eyebrow: "Daily handoff",
    title: "Booking, intake, or follow-up keeps breaking.",
    detail: "Connect the work behind the website without adding bloat.",
    to: "/services/business-systems/",
  },
  {
    eyebrow: "Not sure yet",
    title: "Map the whole setup first.",
    detail: "Leave with a ranked list of what to keep, fix, or stop paying for.",
    to: "/tech-audit/",
  },
];

const INDUSTRY_STARTS: Record<string, IndustryStart[]> = {
  "galleries-creative-studios": [
    {
      eyebrow: "Show the work",
      title: "The portfolio has taste, but the inquiry path is unclear.",
      detail: "Give buyers, press, visitors, and event leads an obvious next step.",
      to: "/services/custom-local-websites/",
    },
    {
      eyebrow: "Sort the interest",
      title: "Inquiries arrive, but nobody can see what happened next.",
      detail: "Create a light follow-up system without flattening how the studio works.",
      to: "/services/business-systems/",
    },
    DEFAULT_STARTS[2],
  ],
  "law-firms": [
    {
      eyebrow: "Earn trust",
      title: "The site no longer reflects the practice.",
      detail: "Clarify services, credibility, and the consult request path.",
      to: "/services/custom-local-websites/",
    },
    {
      eyebrow: "Move new matters",
      title: "Consults, conflict checks, or referrals rely on memory.",
      detail: "Create a visible intake and follow-up path for the team.",
      to: "/services/business-systems/",
    },
    DEFAULT_STARTS[2],
  ],
  "medical-wellness-practices": [
    {
      eyebrow: "Build confidence",
      title: "Patients cannot quickly see fit, trust, or how to start.",
      detail: "Strengthen service pages and the appointment request path.",
      to: "/services/custom-local-websites/",
    },
    {
      eyebrow: "Clean up intake",
      title: "Booking, forms, and staff handoffs do not agree.",
      detail: "Trace the request from first contact to the right next person.",
      to: "/services/business-systems/",
    },
    DEFAULT_STARTS[2],
  ],
  "professional-services": [
    {
      eyebrow: "Clarify expertise",
      title: "The right client cannot quickly tell what the firm does.",
      detail: "Bring services, proof, fit, and the inquiry path into focus.",
      to: "/services/custom-local-websites/",
    },
    {
      eyebrow: "Protect follow-up",
      title: "Leads and proposals live across inboxes and memory.",
      detail: "Create one light path from inquiry to accountable next step.",
      to: "/services/business-systems/",
    },
    DEFAULT_STARTS[2],
  ],
  "restaurants-bars": [
    {
      eyebrow: "Win the decision",
      title: "Menus, hours, or booking are hard to use on a phone.",
      detail: "Make the path from local search to table or order immediate.",
      to: "/services/custom-local-websites/",
    },
    {
      eyebrow: "Connect the shift",
      title: "Orders, reservations, reviews, or event leads split apart.",
      detail: "Join the handoffs the owner currently reconciles by hand.",
      to: "/services/business-systems/",
    },
    DEFAULT_STARTS[2],
  ],
  "retail-ecommerce": [
    {
      eyebrow: "Match the shelf",
      title: "Products, pickup, or store information disagree online.",
      detail: "Give customers one clear path from search to the right item.",
      to: "/services/custom-local-websites/",
    },
    {
      eyebrow: "Connect the sale",
      title: "Inventory, POS, pickup, and email do not share one truth.",
      detail: "Remove the manual handoffs that create missed orders and stale data.",
      to: "/services/business-systems/",
    },
    DEFAULT_STARTS[2],
  ],
  "salons-wellness": [
    {
      eyebrow: "Make booking clear",
      title: "Services, pricing context, and availability are hard to compare.",
      detail: "Turn local discovery into a confident booking path.",
      to: "/services/custom-local-websites/",
    },
    {
      eyebrow: "Close the loop",
      title: "Schedules, reminders, reviews, and rebooking drift apart.",
      detail: "Connect the customer path without making the owner referee it.",
      to: "/services/business-systems/",
    },
    DEFAULT_STARTS[2],
  ],
};

/**
 * Lift the authored "Audit map" section out of the legacy body so it can render
 * as a real customer-path diagram (AuditMapDiagram) instead of borderless prose.
 * Splits at the section boundary, so both remaining chunks stay balanced.
 * Returns null when the section is missing — the body then renders untouched.
 */
function extractAuditMap(
  body: string,
): { before: string; after: string; pieces: AuditMapPieces } | null {
  const match = body.match(/<section>\s*<p>\s*Audit map\s*<\/p>([\s\S]*?)<\/section>/i);
  if (!match || match.index === undefined) return null;

  const inner = match[1];
  const heading = inner.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]?.trim() ?? "";
  if (!heading) return null;

  const paragraphs = Array.from(inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map((m) =>
    m[1].trim(),
  );
  const links = Array.from(
    inner.matchAll(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi),
  ).map((m) => ({ href: m[1], label: m[2].replace(/<[^>]+>/g, "").trim() }));

  return {
    before: body.slice(0, match.index),
    after: body.slice(match.index + match[0].length),
    pieces: { heading, paragraphs, links },
  };
}

/* Drop closers that no longer match an opener (after husk removal) so a stray
 * `</article>` can never end a wrapping element early. Mirrors balanceTag in
 * legacy-html-core.mjs, minus the appending. */
function dropOrphanClosers(html: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>|</${tag}>`, "gi");
  let depth = 0;
  let out = "";
  let last = 0;
  for (const m of html.matchAll(re)) {
    if (m[0][1] === "/") {
      if (depth === 0) {
        out += html.slice(last, m.index);
        last = (m.index as number) + m[0].length;
        continue;
      }
      depth--;
    } else {
      depth++;
    }
  }
  out += html.slice(last);
  return out;
}

/* The legacy source leaves whitespace-only <li>/<article> husks behind (they
 * render as an empty bullet and an empty bordered card — the parser closes a
 * bare `<article>` opener the moment `</section>` arrives), and each section's
 * short leading <p> is an eyebrow, not prose. Tidy both — markup only, no
 * authored words touched. */
function tidyLegacyBody(body: string): string {
  let tidied = body
    .replace(/<li>\s*<\/li>/gi, "")
    .replace(/<li>\s*(?=<\/ul>)/gi, "")
    .replace(/<article>\s*<\/article>/gi, "")
    .replace(/<article>\s*(?=<\/section>)/gi, "")
    .replace(
      /<section>\s*<p>([^<]{2,40})<\/p>\s*(?=<h2)/gi,
      '<section><p class="lf-post__kicker">$1</p>',
    );
  tidied = dropOrphanClosers(tidied, "article");
  tidied = dropOrphanClosers(tidied, "li");
  return tidied;
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&mdash;|&ndash;/gi, " ")
    .replace(/&#(?:x27|39);|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keep the opening and primary audit map visible, then turn supporting
 * sections into semantic disclosures so phone users can scan before reading.
 * The full authored HTML remains in the document.
 */
function addProgressiveDisclosure(body: string, keepFirstContactRow = false): string {
  let keptContactRow = false;

  return body.replace(
    /<section(?:\s[^>]*)?>([\s\S]*?)<\/section>/gi,
    (section, inner: string) => {
      if (/lf-post__cta-row/i.test(inner) && keepFirstContactRow && !keptContactRow) {
        keptContactRow = true;
        return section;
      }

      const visibleText = plainText(inner);
      if (/^On this page$/i.test(visibleText)) return "";

      const hasNumberedCards = /<article(?:\s[^>]*)?>\s*<span>\s*0?1\s*<\/span>/i.test(inner);
      const firstParagraph = inner.match(/^\s*<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i);
      const heading = inner.match(/<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/i);
      const kicker = hasNumberedCards
        ? "Owner checklist"
        : plainText(firstParagraph?.[1] ?? "") || "Industry guide";
      const title = hasNumberedCards
        ? "The three parts to check first"
        : plainText(heading?.[1] ?? "") || "Read the next part";

      let content = inner;
      if (!hasNumberedCards) {
        if (firstParagraph) content = content.replace(firstParagraph[0], "");
        if (heading) content = content.replace(heading[0], "");
      }

      return `<section class="lf-industry-disclosure"><header><span>${kicker}</span><h2>${title}</h2></header><details><summary><strong>Open this section</strong><i aria-hidden="true"></i></summary><div class="lf-industry-disclosure__body">${content}</div></details></section>`;
    },
  );
}

export default function IndustryDetail() {
  const { slug } = useParams();
  const list = industries as unknown as Industry[];
  const entry = list.find((p) => p.slug === slug);

  if (!entry) return <Navigate to="/examples/#industries" replace />;

  const { headline, body } = prepareIndustryHtml(entry.html);
  const heroTitle = headline || entry.title.replace(" Help", "");
  // Extract FIRST — tidyLegacyBody rewrites the <p>Audit map</p> marker into a
  // kicker, which would hide the section from the extractor.
  const rawAudit = extractAuditMap(body);
  const audit = rawAudit && {
    ...rawAudit,
    before: addProgressiveDisclosure(tidyLegacyBody(rawAudit.before), true),
    after: addProgressiveDisclosure(tidyLegacyBody(rawAudit.after)),
  };
  const tidied = addProgressiveDisclosure(tidyLegacyBody(body), true);
  const industryName = entry.title.replace(" Help", "");
  const startingPoints = INDUSTRY_STARTS[entry.slug] ?? DEFAULT_STARTS;

  return (
    <>
      <PageHero
        eyebrow="Industry"
        icon={Building2}
        title={<>{heroTitle}</>}
        dek={entry.description}
        image={entry.image ? {
          src: entry.image,
          alt: entry.title.replace(" Help", ""),
          width: 1800,
          height: 1200,
        } : undefined}
      />

      <section className="lf-industry-start" aria-labelledby="lf-industry-start-title">
        <div className="lf-industry-start__inner">
          <header>
            <p>Start with the pressure point</p>
            <h2 id="lf-industry-start-title">What is getting in the way?</h2>
            <span>Three practical starting points for {industryName.toLowerCase()}.</span>
          </header>

          <nav className="lf-industry-start__routes" aria-label={`Starting points for ${industryName}`}>
            {startingPoints.map((point) => (
              <Link key={`${point.eyebrow}-${point.to}`} to={point.to}>
                <span>{point.eyebrow}</span>
                <strong>{point.title}</strong>
                <small>{point.detail}</small>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <article className="lf-post lf-post--industry">
        <div className="lf-post__inner">
          {audit ? (
            <>
              <div
                className="lf-post__body"
                dangerouslySetInnerHTML={{ __html: audit.before }}
              />
              <AuditMapDiagram
                slug={entry.slug}
                heading={audit.pieces.heading}
                paragraphs={audit.pieces.paragraphs}
                links={audit.pieces.links}
              />
              <div
                className="lf-post__body"
                dangerouslySetInnerHTML={{ __html: audit.after }}
              />
            </>
          ) : (
            <div
              className="lf-post__body"
              dangerouslySetInnerHTML={{ __html: tidied }}
            />
          )}
        </div>
      </article>

      <QuietContact />
    </>
  );
}
