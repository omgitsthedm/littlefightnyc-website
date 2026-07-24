import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import AuditMapDiagram from "@/components/dataviz/AuditMapDiagram";
import industries from "@/data/industries.json";
import { prepareIndustryHtml } from "@/lib/legacyHtml";
import { responsiveImageProps } from "@/lib/responsiveImages";
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

type IndustryRecognition = {
  situation: string;
  stays: string;
  easier: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    widths: number[];
  };
  proof?: {
    to: string;
    label: string;
  };
};

const INDUSTRY_RECOGNITION: Record<string, IndustryRecognition> = {
  "galleries-creative-studios": {
    situation:
      "The work has a point of view. The website should help people see it and know how to inquire.",
    stays:
      "The work, the voice, the curatorial choices, and the way you build relationships.",
    easier:
      "Current work is easy to browse. Visits and events are clear. Inquiries reach the right person.",
    image: {
      src: "/assets/hero-ind-bookshop.webp",
      alt: "Books and creative objects arranged inside a neighborhood shop",
      width: 1600,
      height: 1200,
      widths: [480, 640, 900],
    },
    proof: {
      to: "/case-studies/cc-films/",
      label: "See what changed",
    },
  },
  "law-firms": {
    situation:
      "The practice has decades of trust. The website and office accounts may still depend on one person who knows where everything is.",
    stays:
      "The firm name, its reputation, client relationships, legal judgment, and the tools that still work.",
    easier:
      "The site reflects the practice today. Consults reach the right person. The domain, email, and accounts are documented and owned by the firm.",
    image: {
      src: "/images/owner-stories/family-law-office.webp",
      alt: "A long-running law office with legal books, paper files, an older desktop, and a newer laptop",
      width: 1672,
      height: 941,
      widths: [480, 640, 900, 1200],
    },
  },
  "medical-wellness-practices": {
    situation:
      "Patients trust the care. They should not have to fight the website, phone, forms, and booking just to get started.",
    stays:
      "Clinical judgment, patient privacy, staff routines, and the systems that already meet the practice's needs.",
    easier:
      "Services are clear. The request path works on a phone. Staff can see the next handoff without exposing private patient information.",
    image: {
      src: "/assets/hero-ind-pharmacy-neon.webp",
      alt: "A neighborhood pharmacy counter seen through a glowing storefront",
      width: 1600,
      height: 1200,
      widths: [480, 640, 900],
    },
  },
  "professional-services": {
    situation:
      "Your expertise grew through referrals. New clients still check online first, and the next generation needs a setup it can own.",
    stays:
      "The firm name, expertise, relationships, working methods, and useful tools.",
    easier:
      "Services and proof are clear. Inquiries have an owner. Website, domain, email, and software access no longer live in one person's head.",
    image: {
      src: "/images/owner-stories/family-law-office.webp",
      alt: "A long-running professional office with books, paper files, an older desktop, and a newer laptop",
      width: 1672,
      height: 941,
      widths: [480, 640, 900, 1200],
    },
    proof: {
      to: "/case-studies/public-house-creative/",
      label: "See what changed",
    },
  },
  "restaurants-bars": {
    situation:
      "The food and the room already bring people back. Online, guests just need the right menu, hours, and reservation path.",
    stays:
      "The menu, the hospitality, the regulars, and the tools the staff already trusts.",
    easier:
      "Hours agree everywhere. The menu works on a phone. Reservations and event requests reach the right person.",
    image: {
      src: "/images/owner-stories/neighborhood-bistro.webp",
      alt: "An intimate neighborhood bistro with set tables, a handwritten reservation book, and a small booking screen",
      width: 1672,
      height: 941,
      widths: [480, 640, 900, 1200],
    },
    proof: {
      to: "/case-studies/brothers-pizzeria/",
      label: "See what changed",
    },
  },
  "retail-ecommerce": {
    situation:
      "The shelf and the register work. Trouble starts when the website, pickup, and inventory tell customers different things.",
    stays:
      "The products, the staff, the shop's character, the customer experience, and the POS when it still fits.",
    easier:
      "Product facts agree. Pickup is clear. Customers can find the right item without creating another manual check for staff.",
    image: {
      src: "/assets/interior-jeans-rack.webp",
      alt: "Clothing racks inside an independent neighborhood shop",
      width: 2400,
      height: 1600,
      widths: [480, 640, 900],
    },
    proof: {
      to: "/case-studies/army-navy-bags/",
      label: "See what changed",
    },
  },
  "salons-wellness": {
    situation:
      "Regulars know who to book. New clients need to see the services, the work, and the next open time without phone tag.",
    stays:
      "The chairs, the skill, the regulars, the phone number, and the booking tool when clients already know it.",
    easier:
      "Services are clear. Booking and reminders line up. Google shows the right facts. Rebooking does not depend on one person's memory.",
    image: {
      src: "/images/owner-stories/neighborhood-barber.webp",
      alt: "An empty neighborhood barbershop with familiar chairs, mirrors, an appointment book, and a small booking screen",
      width: 1672,
      height: 941,
      widths: [480, 640, 900, 1200],
    },
    proof: {
      to: "/case-studies/hair-by-rachel-charles/",
      label: "See what changed",
    },
  },
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
 * Lift the authored "Fit map" or "Audit map" section out of the legacy body so it can render
 * as a real customer-path diagram (AuditMapDiagram) instead of borderless prose.
 * Splits at the section boundary, so both remaining chunks stay balanced.
 * Returns null when the section is missing. The body then renders untouched.
 */
function extractAuditMap(
  body: string,
): { before: string; after: string; pieces: AuditMapPieces } | null {
  const match = body.match(
    /<section>\s*<p>\s*(?:Audit|Fit) map\s*<\/p>([\s\S]*?)<\/section>/i,
  );
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

/* The legacy source leaves whitespace-only list, article, and section husks
 * behind. It also includes an empty "On this page" scaffold. Remove those
 * structural leftovers while leaving the authored words and links intact. */
function tidyLegacyBody(body: string): string {
  let tidied = body
    .replace(/<li>\s*<\/li>/gi, "")
    .replace(/<li>\s*(?=<\/ul>)/gi, "")
    .replace(/<article>\s*<\/article>/gi, "")
    .replace(/<article>\s*(?=<\/section>)/gi, "")
    .replace(
      /<section>\s*<p class="lf-post__kicker">\s*On this page\s*<\/p>\s*<\/section>/gi,
      "",
    )
    .replace(
      /<section>\s*<p>([^<]{2,40})<\/p>\s*(?=<h2)/gi,
      '<section><p class="lf-post__kicker">$1</p>',
    );
  tidied = dropOrphanClosers(tidied, "article");
  tidied = dropOrphanClosers(tidied, "li");
  return tidied.replace(/<section>\s*<\/section>/gi, "");
}

export default function IndustryDetail() {
  const { slug } = useParams();
  const list = industries as unknown as Industry[];
  const entry = list.find((p) => p.slug === slug);

  if (!entry) return <Navigate to="/examples/#industries" replace />;

  const { headline, body } = prepareIndustryHtml(entry.html);
  const heroTitle = headline || entry.title.replace(" Help", "");
  // Extract first. tidyLegacyBody rewrites the map marker into a
  // kicker, which would hide the section from the extractor.
  const rawAudit = extractAuditMap(body);
  const audit = rawAudit && {
    ...rawAudit,
    before: tidyLegacyBody(rawAudit.before),
    after: tidyLegacyBody(rawAudit.after),
  };
  const tidied = tidyLegacyBody(body);
  const industryName = entry.title.replace(" Help", "");
  const startingPoints = INDUSTRY_STARTS[entry.slug] ?? DEFAULT_STARTS;
  const recognition = INDUSTRY_RECOGNITION[entry.slug] ?? {
    situation:
      "The business already works. The technology should support it without changing what customers and staff value.",
    stays: "The reputation, relationships, useful tools, and working habits.",
    easier:
      "People can find the right information, take the next step, and reach the right person.",
    image: {
      src: entry.image ?? "/assets/coworking-laptops.webp",
      alt: `A familiar working environment for ${industryName.toLowerCase()}`,
      width: 1800,
      height: 1200,
      widths: [480, 640, 900],
    },
  };

  return (
    <div className="lf-industry-page">
      <PageHero
        eyebrow={`For ${industryName}`}
        title={<>{heroTitle}</>}
        dek={entry.description}
      />

      <section
        className="lf-industry-recognition"
        aria-labelledby="lf-industry-recognition-title"
      >
        <div className="lf-industry-recognition__inner">
          <div className="lf-industry-recognition__copy">
            <p className="lf-industry-recognition__label">
              Does this feel familiar?
            </p>
            <h2 id="lf-industry-recognition-title">
              {recognition.situation}
            </h2>

            <dl className="lf-industry-recognition__outcomes">
              <div>
                <dt>What stays</dt>
                <dd>{recognition.stays}</dd>
              </div>
              <div>
                <dt>What gets easier</dt>
                <dd>{recognition.easier}</dd>
              </div>
            </dl>

            {recognition.proof && (
              <Link
                className="lf-industry-recognition__proof"
                to={recognition.proof.to}
                aria-label={`${recognition.proof.label} for ${industryName}`}
              >
                {recognition.proof.label}
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </Link>
            )}
          </div>

          <figure className="lf-industry-recognition__figure">
            <div className="lf-industry-recognition__media">
              <img
                src={recognition.image.src}
                {...responsiveImageProps(
                  recognition.image.src,
                  "(min-width: 1280px) 46vw, (min-width: 768px) 48vw, 100vw",
                  recognition.image.widths,
                )}
                alt={recognition.image.alt}
                width={recognition.image.width}
                height={recognition.image.height}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption>Illustrative scene. Not client evidence.</figcaption>
          </figure>
        </div>
      </section>

      <section className="lf-industry-start" aria-labelledby="lf-industry-start-title">
        <div className="lf-industry-start__inner">
          <header>
            <h2 id="lf-industry-start-title">Where should we start?</h2>
            <p>
              Pick the line that sounds closest. You do not need to diagnose the
              technology first.
            </p>
          </header>

          <nav className="lf-industry-start__routes" aria-label={`Starting points for ${industryName}`}>
            {startingPoints.map((point) => (
              <Link key={`${point.eyebrow}-${point.to}`} to={point.to}>
                <span className="lf-industry-start__kind">{point.eyebrow}</span>
                <span className="lf-industry-start__route-copy">
                  <strong>{point.title}</strong>
                  <small>{point.detail}</small>
                </span>
                <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
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
    </div>
  );
}
