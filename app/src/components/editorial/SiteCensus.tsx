import { useState } from "react";
import { useCountUp } from "@/components/dataviz/useCountUp";
import { useScrollReveal } from "./useScrollReveal";
import journal from "@/data/journal-index.json";
import industries from "@/data/industries.json";
import {
  answerGuides,
  areaPages,
  caseStudies,
  glossaryTerms,
  services,
  studioProjects,
} from "@/data/site";
import "./SiteCensus.css";

/**
 * Site census — honest build-derived counts on /about/.
 *
 * Every number is computed AT MODULE SCOPE from the same data files the site
 * renders from (site.ts arrays + the journal/industries indexes), so nothing
 * here can rot: add a journal entry and the census updates on the next build.
 * The full prerendered-route count lives only in scripts/prerender-seo.mjs
 * (a build script the app can't cleanly import), so the headline number is
 * the sum of the content records in site data — and the readout says exactly
 * what was counted.
 */

const CONTENT_PAGE_COUNT =
  services.length +
  caseStudies.length +
  studioProjects.length +
  glossaryTerms.length +
  industries.length +
  areaPages.length +
  answerGuides.length +
  journal.length;

type CensusItem = {
  value: number;
  label: string;
  source: string;
};

const CENSUS: CensusItem[] = [
  {
    value: CONTENT_PAGE_COUNT,
    label: "Content pages",
    source:
      `${services.length} services + ${caseStudies.length} case studies + ` +
      `${studioProjects.length} studio + ${glossaryTerms.length} glossary + ` +
      `${industries.length} industries + ${areaPages.length} neighborhoods + ` +
      `${answerGuides.length} answers + ${journal.length} journal — site data`,
  },
  {
    value: answerGuides.length,
    label: "Answer guides",
    source: `${answerGuides.length} guides — answerGuides, site data`,
  },
  {
    value: areaPages.length,
    label: "Neighborhoods",
    source: `${areaPages.length} area pages — areaPages, site data`,
  },
  {
    value: journal.length,
    label: "Journal entries",
    source: `${journal.length} entries — journal index`,
  },
];

const DEFAULT_READOUT =
  "Counted from the site's own data files at build — nothing hand-typed.";

function CensusChip({
  item,
  index,
  onFocus,
  onBlur,
}: {
  item: CensusItem;
  index: number;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const { ref, value: shown } = useCountUp<HTMLSpanElement>(item.value, {
    duration: 900,
    delay: index * 90,
  });

  return (
    <button
      type="button"
      className="lf-census__chip"
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <span ref={ref} className="lf-census__value" aria-hidden="true">
        {shown}
      </span>
      <span className="lf-census__label" aria-hidden="true">
        {item.label}
      </span>
      {/* Full reading for assistive tech: count, label, and source. */}
      <span className="lf-census__vh">
        {`${item.value} ${item.label.toLowerCase()} — ${item.source}`}
      </span>
    </button>
  );
}

export default function SiteCensus() {
  const revealRef = useScrollReveal<HTMLDivElement>({ threshold: 0.25 });
  const [readout, setReadout] = useState<string | null>(null);

  return (
    <section className="lf-census" aria-label="Site census">
      <div ref={revealRef} className="lf-census__inner" data-reveal>
        <p className="lf-census__eyebrow">Site census</p>
        <div className="lf-census__grid">
          {CENSUS.map((item, index) => (
            <CensusChip
              key={item.label}
              item={item}
              index={index}
              onFocus={() => setReadout(item.source)}
              onBlur={() => setReadout(null)}
            />
          ))}
        </div>
        {/* Instrument readout: hover/tap a counter for its exact source.
            Fixed lane so the band never shifts; hidden from AT (each chip
            already carries its own full reading). */}
        <p className="lf-census__readout" aria-hidden="true">
          {readout ?? DEFAULT_READOUT}
        </p>
      </div>
    </section>
  );
}
