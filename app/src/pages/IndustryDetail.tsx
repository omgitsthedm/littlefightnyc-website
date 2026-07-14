import { Navigate, useParams } from "react-router-dom";
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
    before: tidyLegacyBody(rawAudit.before),
    after: tidyLegacyBody(rawAudit.after),
  };
  const tidied = tidyLegacyBody(body);

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
