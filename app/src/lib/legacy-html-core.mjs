/* Shared legacy-HTML preparation — plain ESM so BOTH the React app
 * (via src/lib/legacyHtml.ts) and scripts/prerender-seo.mjs render journal
 * and industry bodies through the exact same pipeline. One source of truth;
 * crawler-visible HTML can never drift from what the hydrated app shows. */

const INTERNAL_LINK_REWRITES = [
  [/href=(["'])\/contact\/?\1/gi, 'href="/contact/"'],
  [/href=(["'])\/work\/?\1/gi, 'href="/services/"'],
  [/href=(["'])\/websites\/?\1/gi, 'href="/services/custom-local-websites/"'],
  [/href=(["'])\/business-systems\/?\1/gi, 'href="/services/business-systems/"'],
  [/href=(["'])\/local-search\/?\1/gi, 'href="/services/tech-consulting/"'],
  [/href=(["'])\/it-support\/?\1/gi, 'href="/services/it-support/"'],
  [/href=(["'])\/fixes\/?\1/gi, 'href="/services/"'],
  [/href=(["'])\/software-guides\/([^/"']+)\/?\1/gi, 'href="/journal/$2/"'],
  [/href=(["'])\/ai-google-broke-the-internet-websites-survive\/?\1/gi, 'href="/journal/ai-google-broke-the-internet-websites-survive/"'],
  [/href=(["'])\/what-google-looks-for-business-website\/?\1/gi, 'href="/journal/what-google-looks-for-business-website/"'],
  [/href=(["'])\/why-business-websites-will-be-invisible\/?\1/gi, 'href="/journal/why-business-websites-will-be-invisible/"'],
  [/href=(["'])\/services\/website-design-small-business-nyc\/?\1/gi, 'href="/services/custom-local-websites/"'],
];

const SMS_LINK_REWRITE = new RegExp(
  'href=(["\\\'])' + String.fromCharCode(115, 109, 115, 58) + "\\+?16463600318\\1",
  "gi"
);

/* Drop orphan closers (they'd close the PAGE's wrapping <article>/<section>
 * in the prerendered document and spill the rest of the page out of it) and
 * append whatever closers the source left open at the end. */
function balanceTag(html, tag) {
  const re = new RegExp("<" + tag + "(?:\\s[^>]*)?>|</" + tag + ">", "gi");
  let depth = 0;
  let out = "";
  let last = 0;
  for (const m of html.matchAll(re)) {
    if (m[0][1] === "/") {
      if (depth === 0) {
        out += html.slice(last, m.index);
        last = m.index + m[0].length;
        continue;
      }
      depth--;
    } else {
      depth++;
    }
  }
  out += html.slice(last);
  if (depth > 0) out += ("</" + tag + ">").repeat(depth);
  return out;
}

export function prepareLegacyHtml(html) {
  const countOpens = (t) => (html.match(new RegExp("<" + t + "(?:\\s|>)", "gi")) || []).length;
  const countCloses = (t) => (html.match(new RegExp("</" + t + ">", "gi")) || []).length;
  // The legacy source writes CLOSERS as OPENERS: table ends appear as
  // "<tr><tbody><table>", header rows end "<tr><thead><tbody>", body rows
  // end "<tr><tr>", anchors close as a bare "<a>", and sections/articles
  // "close" by opening the next one. Browsers visually recover from most of
  // it, but articles NEST (each card renders inside the previous one — the
  // guide-post cards squeezed to a sliver on phones) and AI extractors
  // mangle it. Repair structurally before anything else.
  let prepared = html
    .replace(/<tr>\s*<tbody>\s*<table>/gi, "</tr></tbody></table>")
    .replace(/<tr>\s*<thead>\s*<tbody>/gi, "</tr></thead><tbody>")
    .replace(/<tr>\s*(?=<tr[\s>])/gi, "</tr>")
    // A bare attributeless <a> is always a mangled </a> — real links carry href.
    .replace(/<a>/gi, "</a>")
    .replace(/<h1(\s[^>]*)?>/gi, '<h2 class="lf-post__legacy-title">')
    .replace(/<\/h1>/gi, "</h2>")
    // Decorative legacy diagrams. Order matters: properly-closed <svg>…</svg>
    // first — stripping only the opener (the old behavior) left the diagram's
    // <text> nodes rendering as junk prose ("404 independent source not found").
    .replace(/\s*<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/\s*<svg\b[^>]*>[\s\S]*?<svg>/gi, " ")
    .replace(/\s*<svg\b[^>]*\/?>/gi, " ")
    .replace(/<li>\s*<li>/gi, "<li>")
    .replace(/<ul>\s*(?=<article\b|<section\b|<p\b|<h[1-6]\b|<a\b|<div\b|<\/|$)/gi, "</ul>")
    .replace(/<ol>\s*(?=<article\b|<section\b|<p\b|<h[1-6]\b|<a\b|<div\b|<\/|$)/gi, "</ol>")
    .replace(SMS_LINK_REWRITE, 'href="/contact/"');

  // ONLY treat "<section>"/"<article>" as separators when the source is
  // actually corrupted (it has openers but ZERO closers). Well-formed posts
  // must pass through untouched — this transform once ran unconditionally and
  // doubled every closer in already-balanced posts (stray </section> closers
  // that ended the page template's wrapper early in the prerendered HTML).
  if (countOpens("section") > 0 && countCloses("section") === 0) {
    prepared = prepared
      .replace(/<section>/gi, "</section><section>")
      .replace(/<section>\s*<\/section>/gi, "");
  }
  if (countOpens("article") > 0 && countCloses("article") === 0) {
    prepared = prepared
      .replace(/<article>/gi, "</article><article>")
      .replace(/<article>\s*<\/article>/gi, "");
  }

  for (const [pattern, replacement] of INTERNAL_LINK_REWRITES) {
    prepared = prepared.replace(pattern, replacement);
  }

  if (!/<h2\b/i.test(prepared) && /<h3\b/i.test(prepared)) {
    prepared = prepared.replace(/<h3(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h3>/gi, "</h2>");
  }

  // The Call/Text/Email/Contact anchors + byline render as one mashed run
  // ("…Contact formBy David Marsh · Published May 4, 2026") on industry pages
  // AND the software-guide journal posts. Wrap them so CSS can lay out a real
  // button row and a separate meta line. The optional "By <a>…</a> ·" group
  // covers the journal shape; industries go straight to "Published <time>".
  prepared = prepared.replace(
    /(<a href="tel:[\s\S]*?Contact form<\/a>)\s*((?:By\s*<a[\s\S]*?<\/a>\s*·\s*)?Published\s*<time[\s\S]*?<\/time>)/i,
    '<div class="lf-post__cta-row">$1</div><p class="lf-post__meta">$2</p>'
  );

  // The topic-tag rows are runs of bare <span>s — unwrapped they render as one
  // mashed line ("Parent guide AI literacy Calm, not panicAI"). Group each run
  // so journal.css can lay them out as chips.
  prepared = prepared.replace(
    /((?:<span>[^<]{1,60}<\/span>\s*){2,})/g,
    '<p class="lf-post__tags">$1</p>'
  );

  // Balance the repairs: drop orphan closers, close what's left open.
  for (const tag of ["a", "section", "article", "ul", "ol", "table", "thead", "tbody", "tr"]) {
    prepared = balanceTag(prepared, tag);
  }

  return closeDanglingParagraphs(prepared);
}

/* The legacy source leans on the parser auto-closing <p> before block
 * elements. Browsers recover identically, but the emitted HTML counts as
 * unbalanced to extractors/validators — make the auto-closes explicit. */
const P_AUTOCLOSERS = /^(?:p|div|ul|ol|li|table|section|article|h[1-6]|blockquote|figure|hr|pre)$/;
function closeDanglingParagraphs(html) {
  const re = /<(\/?)([a-z][a-z0-9]*)(?:\s[^>]*)?>/gi;
  let out = "";
  let last = 0;
  let pOpen = false;
  for (const m of html.matchAll(re)) {
    const isClose = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (tag === "p" && isClose && !pOpen) {
      // Orphan closer — drop it, mirroring balanceTag.
      out += html.slice(last, m.index);
      last = m.index + m[0].length;
      continue;
    }
    // A repeated <p> opener is the closers-as-openers corruption again —
    // close before it just like before any other block tag.
    if (pOpen && P_AUTOCLOSERS.test(tag) && !(tag === "p" && isClose)) {
      out += html.slice(last, m.index) + "</p>";
      last = m.index;
      pOpen = false;
    }
    if (tag === "p") pOpen = !isClose;
  }
  out += html.slice(last);
  if (pOpen) out += "</p>";
  return out;
}

function decodeEntities(text) {
  return text
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Industry pages share one legacy-HTML shape (intro + "Page sections" +
 * numbered <article> cards). This lifts the real headline out of the body (so
 * it isn't a second hero), wraps the run-on CTA/date cluster into structured
 * blocks, and relabels the scaffolding heading. The card grid + button styling
 * are handled in industry.css via the `.lf-post--industry` scope.
 */
export function prepareIndustryHtml(html) {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const headline = titleMatch ? decodeEntities(titleMatch[1]) : "";

  // Drop the duplicate title from the body before shared prep runs.
  // (The card-flattening <article> repair now lives in prepareLegacyHtml,
  // gated on the closers-as-openers corruption, so journal guide posts get
  // the same flat-sibling cards as industry pages.)
  let body = prepareLegacyHtml(html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, ""));

  // (The CTA button-row / meta-line wrap now lives in prepareLegacyHtml — the
  // journal guide posts share the same run-on Call/Text/Email/byline cluster.)

  // "Page sections" is a scaffolding TOC label, not a headline.
  body = body.replace(
    /<h2[^>]*>\s*Page sections\s*<\/h2>/i,
    '<p class="lf-post__kicker">On this page</p>'
  );

  return { headline, body };
}
