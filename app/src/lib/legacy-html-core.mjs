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

export function prepareLegacyHtml(html) {
  let prepared = html
    // The legacy source writes CLOSERS as OPENERS: table ends appear as
    // "<tr><tbody><table>" and sections "close" by opening the next one.
    // Browsers visually recover but the DOM nests 30+ levels deep and AI
    // extractors mangle it. Repair structurally before anything else.
    .replace(/<tr>\s*<tbody>\s*<table>/gi, "</tr></tbody></table>")
    .replace(/<section>/gi, "</section><section>")
    .replace(/<section>\s*<\/section>/gi, "")
    .replace(/<h1(\s[^>]*)?>/gi, '<h2 class="lf-post__legacy-title">')
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/\s*<svg\b[^>]*>[\s\S]*?<svg>/gi, " ")
    .replace(/\s*<svg\b[^>]*\/?>/gi, " ")
    .replace(/<li>\s*<li>/gi, "<li>")
    .replace(/<ul>\s*(?=<article\b|<section\b|<p\b|<h[1-6]\b|<a\b)/gi, "</ul>")
    .replace(/<ol>\s*(?=<article\b|<section\b|<p\b|<h[1-6]\b|<a\b)/gi, "</ol>")
    .replace(SMS_LINK_REWRITE, 'href="/contact/"');

  for (const [pattern, replacement] of INTERNAL_LINK_REWRITES) {
    prepared = prepared.replace(pattern, replacement);
  }

  if (!/<h2\b/i.test(prepared) && /<h3\b/i.test(prepared)) {
    prepared = prepared.replace(/<h3(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h3>/gi, "</h2>");
  }

  // Balance the section repair: drop the leading orphan closer the separator
  // transform creates, and close whatever the source left open at the end.
  prepared = prepared.replace(/^(\s*)<\/section>/, "$1");
  const opens = (prepared.match(/<section\b/gi) || []).length;
  const closes = (prepared.match(/<\/section>/gi) || []).length;
  if (opens > closes) prepared += "</section>".repeat(opens - closes);

  return prepared;
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
  let body = prepareLegacyHtml(html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, ""));

  // The legacy source opens <article> per card but never closes them, so the
  // browser nests each card inside the previous one. Close the prior article
  // before every new one (orphan leading </article> tags are ignored), leaving
  // the cards as flat siblings the grid can lay out. Then drop the empty
  // articles this leaves where the source used <article> as a pseudo-close.
  body = body
    .replace(/<article>/gi, "</article><article>")
    .replace(/<article>\s*<\/article>/gi, "");

  // The Call/Text/Email/Contact anchors + "Published <time>" render as a flat
  // run of siblings ("Contact formPublished May 4, 2026"). Wrap them so CSS can
  // lay out a real button row and a separate meta line.
  body = body.replace(
    /(<a href="tel:[\s\S]*?Contact form<\/a>)\s*Published\s*(<time[\s\S]*?<\/time>)/i,
    '<div class="lf-post__cta-row">$1</div><p class="lf-post__meta">Published $2</p>'
  );

  // "Page sections" is a scaffolding TOC label, not a headline.
  body = body.replace(
    /<h2[^>]*>\s*Page sections\s*<\/h2>/i,
    '<p class="lf-post__kicker">On this page</p>'
  );

  return { headline, body };
}
