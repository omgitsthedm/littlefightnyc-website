export type PrepareOptions = { title?: string };

export function prepareLegacyHtml(html: string, options?: PrepareOptions): string;
export function prepareIndustryHtml(html: string): { headline: string; body: string };
