import type { ReactNode } from "react";
import { CURRENCY_CHOICES, type CurrencyChoice } from "./currency";
import "./EvidenceFoundation.css";

export type ScenarioKind = "your-numbers" | "measured" | "example" | "public-benchmark" | "not-measured";

const SCENARIO_LABELS: Record<ScenarioKind, string> = {
  "your-numbers": "Your numbers",
  measured: "Measured",
  example: "Example",
  "public-benchmark": "Outside benchmark",
  "not-measured": "Not measured",
};

export function CurrencySelect({
  value,
  onChange,
  name,
}: {
  value: CurrencyChoice;
  onChange: (choice: CurrencyChoice) => void;
  name: string;
}) {
  return (
    <label className="lf-currency-select">
      <span>Currency &amp; number style</span>
      <select
        name={name}
        autoComplete="off"
        value={value.code}
        onChange={(event) => {
          const next = CURRENCY_CHOICES.find((choice) => choice.code === event.target.value);
          if (next) onChange(next);
        }}
      >
        {CURRENCY_CHOICES.map((choice) => <option key={choice.code} value={choice.code}>{choice.label}</option>)}
      </select>
    </label>
  );
}

export function ScenarioBadge({ kind }: { kind: ScenarioKind }) {
  return <span className={`lf-scenario-badge lf-scenario-badge--${kind}`}>{SCENARIO_LABELS[kind]}</span>;
}

export function EvidenceSource({
  href,
  source,
  checked,
  scope,
  limits,
}: {
  href: string;
  source: string;
  checked: string;
  scope: string;
  limits: string;
}) {
  return (
    <aside className="lf-evidence-source" aria-label={`Source: ${source}`}>
      <p className="lf-evidence-source__label">Source and limits</p>
      <p><a href={href} target="_blank" rel="noreferrer">{source}</a> <span>· checked {checked}</span></p>
      <dl>
        <div><dt>Scope</dt><dd>{scope}</dd></div>
        <div><dt>Limit</dt><dd>{limits}</dd></div>
      </dl>
    </aside>
  );
}

export function MethodologyDisclosure({ title = "Show the math and limits", children }: { title?: string; children: ReactNode }) {
  return <details className="lf-methodology-disclosure"><summary>{title}</summary><div>{children}</div></details>;
}

export function OwnerMath({
  eyebrow = "Owner math",
  title,
  intro,
  children,
  className = "",
  titleId,
  visualProof = true,
}: {
  eyebrow?: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
  className?: string;
  titleId?: string;
  visualProof?: boolean;
}) {
  return (
    <section className={`lf-owner-math ${className}`.trim()} data-lf-visual-proof={visualProof ? "owner-calculator" : undefined}>
      <header className="lf-owner-math__head">
        <p>{eyebrow}</p><h2 id={titleId}>{title}</h2><div className="lf-owner-math__intro">{intro}</div>
      </header>
      {children}
    </section>
  );
}

export function OwnerResult({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="lf-owner-result">
      <span>{label}</span>
      <output aria-label={label} aria-live="polite" aria-atomic="true">{children}</output>
    </div>
  );
}

export function AccessibleDataTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Array<{ label: string; value: ReactNode; note?: ReactNode }>;
}) {
  return (
    <div className="lf-data-table-wrap">
      <table className="lf-data-table"><caption>{caption}</caption>
        <thead><tr><th scope="col">What this is</th><th scope="col">Value</th><th scope="col">Note</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td><td>{row.note ?? "—"}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
