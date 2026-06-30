const INTERNAL_LINK_REWRITES: Array<[RegExp, string]> = [
  [/href=(["'])\/contact\/?\1/gi, 'href="/contact/"'],
  [/href=(["'])\/work\/?\1/gi, 'href="/services/"'],
  [/href=(["'])\/websites\/?\1/gi, 'href="/services/custom-local-websites/"'],
  [/href=(["'])\/business-systems\/?\1/gi, 'href="/services/business-systems/"'],
  [/href=(["'])\/local-search\/?\1/gi, 'href="/services/tech-consulting/"'],
  [/href=(["'])\/it-support\/?\1/gi, 'href="/services/it-support/"'],
  [/href=(["'])\/fixes\/?\1/gi, 'href="/services/"'],
  [/href=(["'])\/software-guides\/([^/"']+)\/?\1/gi, 'href="/journal/$2/"'],
];

const SMS_LINK_REWRITE = new RegExp(
  'href=(["\\\'])' + String.fromCharCode(115, 109, 115, 58) + "\\+?16463600318\\1",
  "gi"
);

export function prepareLegacyHtml(html: string) {
  let prepared = html
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

  return prepared;
}
