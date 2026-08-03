import type { Candidate } from "./types";

export function formatDate(value?: string, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "Not recorded";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(parsed);
}

export function formatTimestamp(value?: string): string {
  return formatDate(value, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function normalizedList(value: string): string[] {
  return value
    .split(/[|;,]/)
    .map((item) => item.trim().replace(/^'(?=[+\-=@])/, ""))
    .filter(Boolean)
    .slice(0, 5);
}

export function compactSource(source: string): string {
  const knownLabels: Record<string, string> = {
    nys_dos: "NYS DOS",
    nyc_dcwp: "NYC DCWP",
    manual: "Manual public-source intake",
  };
  if (knownLabels[source.toLowerCase()]) return knownLabels[source.toLowerCase()];
  return source
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function placeLine(candidate: Candidate): string {
  return [candidate.city, candidate.county_or_borough, candidate.state]
    .filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(", ");
}

export function candidateLabel(candidate: Candidate): string {
  return candidate.dba || candidate.business_name;
}
