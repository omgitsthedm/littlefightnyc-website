/* The implementation lives in legacy-html-core.mjs (plain ESM) so the
 * prerender script renders journal/industry bodies through the exact same
 * pipeline as the app — no crawler-vs-hydrated drift. */
export { prepareLegacyHtml, prepareIndustryHtml } from "./legacy-html-core.mjs";
