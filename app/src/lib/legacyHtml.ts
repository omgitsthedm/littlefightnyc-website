/* The implementation lives in legacy-html-core.mjs (plain ESM) so the
 * prerender script renders journal/industry bodies through the exact same
 * pipeline as the app — no crawler-vs-hydrated drift. */
import {
  prepareLegacyHtml as corePrepareLegacyHtml,
  prepareIndustryHtml as corePrepareIndustryHtml,
} from "./legacy-html-core.mjs";

export type PrepareOptions = { title?: string };

export function prepareLegacyHtml(html: string, options?: PrepareOptions): string {
  return corePrepareLegacyHtml(html, options ?? {});
}

export function prepareIndustryHtml(html: string): { headline: string; body: string } {
  return corePrepareIndustryHtml(html);
}
