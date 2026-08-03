import { useDeferredValue, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileSearch,
  Filter,
  Globe2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { ScoreTriptych } from "./ScoreTriptych";
import {
  assessCandidate,
  candidateKey,
  currency,
  derivedBalance,
  evidencedInvoiceAmount,
  isFullyPaidRecord,
  operatorRecordFor,
  STATUS_LABELS,
} from "./revenue";
import { collectReadyActions, TASK_TYPE_LABELS } from "./workflow";
import {
  candidateLabel,
  compactSource,
  formatDate,
  formatTimestamp,
  normalizedList,
  placeLine,
} from "./presentation";
import type {
  Candidate,
  OperatorRecord,
  OperatorRecordInput,
  OperatorState,
  OperatorStatus,
  QueueState,
} from "./types";

const CLOSED_STATUSES = new Set<OperatorStatus>(["lost", "not_fit", "do_not_contact"]);
const PIPELINE_STATUSES = new Set<OperatorStatus>([
  "research_ready",
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "paid",
  "lost",
  "snoozed",
  "not_fit",
  "do_not_contact",
]);

type OperatorEntry = [string, OperatorRecord];

function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function dueMillis(value: string): number {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime();
  return Date.parse(value);
}

function localDateKey(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : todayKey(parsed);
}

function operatorName(record: OperatorRecordInput): string {
  return record.identity.dba || record.identity.businessName;
}

function openTask(record: OperatorRecordInput) {
  return record.tasks.find((task) => task.status === "open") ?? null;
}

function nextTaskSummary(record: OperatorRecordInput): string {
  const task = openTask(record);
  if (task) return task.title;
  return record.tasks.length ? "No open task" : record.nextAction;
}

function earliestFollowUp(record: OperatorRecord): string {
  const task = openTask(record);
  if (task) return task.dueAt ?? (record.status === "snoozed" ? record.dueDate : "");
  if (record.tasks.length) return "";
  const latestActivity = record.activities.at(-1);
  const dates = [
    record.dueDate,
    latestActivity?.followUpAt?.slice(0, 10) ?? "",
  ].filter(Boolean).sort();
  return dates[0] ?? "";
}

function dueLabel(value: string, now = new Date()): string {
  if (!value) return "No due time";
  const due = dueMillis(value);
  if (!Number.isFinite(due)) return value;
  const display = value.includes("T") ? formatTimestamp(value) : formatDate(value);
  const dueDateKey = localDateKey(value);
  const today = todayKey(now);
  if (due <= now.getTime()) return `${dueDateKey < today ? "Overdue" : "Due now"} · ${display}`;
  if (dueDateKey === today) return `Due today · ${display}`;
  return display;
}

function pipelineStage(record: OperatorRecord): string {
  if (record.status === "early_signal" || record.status === "research_ready" || record.status === "snoozed") return "Research";
  if (record.status === "pursuit_ready") return "Approved";
  if (record.status === "pursuing") return "Contacted";
  if (record.status === "replied") return "Replied";
  if (record.status === "meeting") return "Discovery";
  if (record.status === "proposal") return "Proposal";
  if (record.status === "won") return "Signed";
  if (record.status === "paid") return "Paid";
  return "Closed";
}

function paidAmount(record: OperatorRecord): number {
  return record.commercialClose.amountPaid ?? 0;
}

function balance(record: OperatorRecord): number {
  return derivedBalance(record.commercialClose);
}

function compactOffer(record: OperatorRecord): string {
  const offer = record.offerFit.trim();
  if (!offer) return "Unassigned";
  const firstLine = offer.split(/\r?\n/u)[0] ?? offer;
  const label = firstLine.split(":")[0]?.trim() || firstLine.trim();
  return label.length > 72 ? `${label.slice(0, 69)}…` : label;
}

function Stat({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof FileSearch }) {
  return (
    <article className="stat-card">
      <div className="stat-card__icon"><Icon size={18} /></div>
      <div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>
    </article>
  );
}

function CandidateCard({
  candidate,
  record,
  tiedSignal,
  onOpen,
}: {
  candidate: Candidate;
  record: OperatorRecordInput;
  tiedSignal: boolean;
  onOpen: () => void;
}) {
  const assessment = assessCandidate(candidate, record);
  const reasons = normalizedList(candidate.score_reasons).slice(0, 3);
  const gaps = normalizedList(candidate.missing_pieces).slice(0, 3);
  const location = placeLine(candidate);

  return (
    <article className="candidate-card">
      <div className="candidate-card__rank" aria-label={`Queue order ${candidate.rank}`}><span>{String(candidate.rank).padStart(2, "0")}</span></div>
      <div className="candidate-card__main">
        <div className="candidate-card__heading">
          <div>
            <p className="candidate-source"><FileSearch size={16} /> {compactSource(candidate.source)}</p>
            <h3>{candidateLabel(candidate)}</h3>
            {candidate.dba && candidate.dba !== candidate.business_name ? <p className="legal-name">{candidate.business_name}</p> : null}
          </div>
          <span className={`stage-pill stage-pill--${record.status}`}>{STATUS_LABELS[record.status]}</span>
        </div>
        <p className="diagnosis">{candidate.diagnosis || "No diagnosis was provided. Verify the source record and storefront evidence."}</p>
        <div className="candidate-facts">
          {location ? <span><MapPin size={16} />{location}</span> : null}
          {candidate.category ? <span><Building2 size={16} />{candidate.category}</span> : null}
          {candidate.filed_at ? <span><CalendarDays size={16} />Filed {formatDate(candidate.filed_at)}</span> : null}
        </div>
        <ScoreTriptych assessment={assessment} compact />
        {tiedSignal && !assessment.qualified ? <p className="tie-note"><CircleAlert size={16} /> Tied signal. Queue order is not qualification.</p> : null}
        <div className="signal-grid">
          <div><p><Sparkles size={16} /> Why it surfaced</p>{reasons.length ? <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <span>No reasons supplied</span>}</div>
          <div><p><CircleAlert size={16} /> What blocks pursuit</p>{gaps.length ? <ul>{gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : <span>Independent verification is still required.</span>}</div>
        </div>
      </div>
      <div className="candidate-card__action">
        <div className={`site-state ${candidate.verified_url ? "site-state--found" : ""}`}>
          <Globe2 size={16} />
          <span><small>Website evidence</small><strong>{candidate.verified_url ? "Verified" : "Not verified"}</strong></span>
        </div>
        <button className="review-button" type="button" onClick={onOpen}>Make decision <ArrowUpRight size={16} /></button>
        {candidate.verified_url ? <a href={candidate.verified_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Review public site <ExternalLink size={16} /></a> : null}
      </div>
    </article>
  );
}

function QueueStateView({ state, retry }: { state: QueueState; retry: () => void }) {
  if (state.status === "loading" || state.status === "idle") return <div className="queue-loading" role="status"><Clock3 size={22} /><span>Loading private research…</span></div>;
  if (state.status === "empty") return <div className="lane-empty compact-empty"><FileSearch size={28} /><h3>No public research is ready</h3><p>Publish the current maximum-ten queue through Dakota’s signed private bridge.</p></div>;
  if (state.status === "error") return <div className="queue-error" role="alert"><CircleAlert size={22} /><div><strong>Research unavailable</strong><p>{state.message}</p></div><button type="button" onClick={retry}>Try again <ArrowUpRight size={16} /></button></div>;
  return null;
}

function ActionCard({
  lane,
  number,
  title,
  context,
  action,
  tone,
  onOpen,
}: {
  lane: string;
  number: string;
  title: string;
  context: string;
  action: string;
  tone: "inbound" | "public" | "followup";
  onOpen: () => void;
}) {
  return (
    <article className={`next-action-card next-action-card--${tone}`}>
      <div><span className="stage-pill">{lane}</span><small>{number}</small></div>
      <h3>{title}</h3>
      <p>{context}</p>
      <button type="button" onClick={onOpen}>{action} <ArrowUpRight size={16} /></button>
    </article>
  );
}

export function DoNextView({
  operatorRecords,
  now,
  onOpen,
}: {
  queueRecords: Candidate[];
  operatorRecords: Record<string, OperatorRecord>;
  now: Date;
  onOpen: (key: string) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(12);
  const actions = collectReadyActions(operatorRecords, now);
  const actionCount = actions.length;
  const visibleActions = actions.slice(0, visibleCount);
  const remainingCount = Math.max(0, actionCount - visibleActions.length);

  return (
    <section className="do-next-section" aria-labelledby="do-next-title">
      <div className="view-heading">
        <div><p className="eyebrow"><span /> Do Next</p><h2 id="do-next-title">Only the actions that can move revenue</h2><p>Consent first, qualification second, follow-up on time. Research stays off this screen until it clears the gate.</p></div>
        <div className="action-count"><strong>{String(actionCount).padStart(2, "0")}</strong><span>ready now</span></div>
      </div>
      {actionCount ? (
        <div className="next-action-grid">
          {visibleActions.map((ready, index) => <ActionCard
            key={`${ready.key}:${ready.task?.taskId ?? "repair"}`}
            lane={ready.lane === "repair" ? "Needs next task" : ready.lane === "inbound" ? "Consented inbound" : ready.lane === "due" ? "Due now" : "Active revenue work"}
            number={String(index + 1).padStart(2, "0")}
            title={operatorName(ready.record)}
            context={ready.lane === "repair" ? ready.task ? `Stage/task mismatch · ${TASK_TYPE_LABELS[ready.task.type]} · resolve it and set the correct next move.` : "This legacy or incomplete record needs one durable next task before work can continue." : ready.task ? `${TASK_TYPE_LABELS[ready.task.type]} · ${ready.task.title}${ready.task.dueAt ? ` · ${dueLabel(ready.task.dueAt)}` : ready.record.status === "snoozed" && ready.record.dueDate ? ` · ${dueLabel(ready.record.dueDate)}` : " · Ready now"}` : "Repair the missing task."}
            action={ready.lane === "repair" ? "Repair workflow" : "Open exact task"}
            tone={ready.lane === "inbound" ? "inbound" : ready.lane === "due" || ready.lane === "repair" ? "followup" : "public"}
            onOpen={() => onOpen(ready.key)}
          />)}
        </div>
      ) : (
        <div className="next-empty">
          <Check size={28} />
          <p className="eyebrow">No action is ready</p>
          <h3>Nothing deserves outreach right now</h3>
          <p>That is a valid outcome. Dakota will surface every consented inquiry, approved pursuit, due follow-up, close, payment, or onboarding task when it exists.</p>
        </div>
      )}
      {remainingCount ? <button type="button" className="load-more-actions" onClick={() => setVisibleCount((count) => count + 12)}>Show {Math.min(12, remainingCount)} more <span>{remainingCount} remaining</span></button> : null}
      <div className="conversion-contract"><ShieldCheck size={20} /><p><strong>Human gate stays intact.</strong> Copying a draft or opening another app never records contact, advances a stage, or creates revenue. Every result requires explicit evidence.</p></div>
    </section>
  );
}

export function ResearchView({
  queueState,
  queueRecords,
  operatorRecords,
  retry,
  onOpen,
}: {
  queueState: QueueState;
  queueRecords: Candidate[];
  operatorRecords: Record<string, OperatorRecord>;
  retry: () => void;
  onOpen: (key: string) => void;
}) {
  const queueKeys = useMemo(() => new Set(queueRecords.map(candidateKey)), [queueRecords]);
  const savedResearch = useMemo(
    () => Object.entries(operatorRecords)
      .filter(([key, record]) => !queueKeys.has(key) && ["early_signal", "research_ready", "snoozed"].includes(record.status))
      .sort(([, left], [, right]) => right.updated_at.localeCompare(left.updated_at)),
    [operatorRecords, queueKeys],
  );
  const scoreCounts = useMemo(() => {
    const counts = new Map<number, number>();
    queueRecords.forEach((candidate) => counts.set(candidate.score, (counts.get(candidate.score) ?? 0) + 1));
    return counts;
  }, [queueRecords]);

  return (
    <section className="queue-section workspace-view" aria-labelledby="research-title">
      <div className="view-heading">
        <div><p className="eyebrow"><span /> Research</p><h2 id="research-title">A maximum-ten evidence backlog</h2><p>These are public signals to verify, not a call list. Most should close without outreach.</p></div>
        <div className="deterministic-label"><ShieldCheck size={16} /> Human qualification required</div>
      </div>
      <div className="review-order-note"><CircleAlert size={18} /><p><strong>Queue order is not buyer intent.</strong> Verify identity, contact route, revenue pain, and one offer before approving pursuit.</p></div>
      {queueRecords.length ? <div className="candidate-list">{queueRecords.slice(0, 10).map((candidate) => <CandidateCard key={candidateKey(candidate)} candidate={candidate} record={operatorRecordFor(operatorRecords, candidate)} tiedSignal={(scoreCounts.get(candidate.score) ?? 0) > 1} onOpen={() => onOpen(candidateKey(candidate))} />)}</div> : <QueueStateView state={queueState} retry={retry} />}
      {savedResearch.length ? <section className="saved-research" aria-labelledby="saved-research-title"><div className="subsection-heading"><div><p className="eyebrow">Private saved research</p><h3 id="saved-research-title">Manual and inbound records outside the public queue</h3></div><span>{savedResearch.length} saved</span></div><div className="pipeline-list">{savedResearch.map(([key, record]) => <button key={key} type="button" className="pipeline-row saved-research-row" onClick={() => onOpen(key)}><span className={`stage-pill stage-pill--${record.status}`}>{STATUS_LABELS[record.status]}</span><span><strong>{operatorName(record)}</strong><small>{record.identity.category || "Unclassified"} · {compactSource(record.identity.source)}</small></span><span><small>Next task</small>{nextTaskSummary(record) || "Verify the private record and choose its next state."}</span><span><small>Due</small>{earliestFollowUp(record) ? dueLabel(earliestFollowUp(record)) : openTask(record) ? "Ready now" : "Not scheduled"}</span><ArrowUpRight size={18} /></button>)}</div></section> : null}
    </section>
  );
}

const PIPELINE_FILTERS = ["all", "Research", "Approved", "Contacted", "Replied", "Discovery", "Proposal", "Signed", "Paid", "Closed"] as const;

export function PipelineView({
  state,
  now,
  onCapture,
  onOpen,
}: {
  state: OperatorState;
  now: Date;
  onCapture: () => void;
  onOpen: (key: string) => void;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const [filter, setFilter] = useState<(typeof PIPELINE_FILTERS)[number]>("all");

  if (state.status === "loading" || state.status === "idle") return <div className="queue-loading" role="status"><Clock3 size={22} /><span>Loading private pipeline…</span></div>;
  if (state.status === "error") return <div className="queue-error" role="alert"><CircleAlert size={22} /><div><strong>Pipeline unavailable</strong><p>{state.message}</p></div></div>;

  const entries = Object.entries(state.envelope.records)
    .filter(([, record]) => PIPELINE_STATUSES.has(record.status))
    .sort(([, left], [, right]) => right.updated_at.localeCompare(left.updated_at));
  const filtered = entries.filter(([, record]) => {
    const matchesFilter = filter === "all" || pipelineStage(record) === filter;
    const haystack = [operatorName(record), record.identity.category, record.identity.source, record.offerFit, nextTaskSummary(record)].join(" ").toLowerCase();
    return matchesFilter && (!deferredQuery || haystack.includes(deferredQuery));
  });
  const due = entries
    .filter(([, record]) => !CLOSED_STATUSES.has(record.status) && Boolean(earliestFollowUp(record)) && dueMillis(earliestFollowUp(record)) <= now.getTime())
    .sort(([, left], [, right]) => dueMillis(earliestFollowUp(left)) - dueMillis(earliestFollowUp(right)));
  const stageCounts = PIPELINE_FILTERS.slice(1).map((stage) => [stage, entries.filter(([, record]) => pipelineStage(record) === stage).length] as const);

  return (
    <section className="workspace-view pipeline-section" aria-labelledby="pipeline-title">
      <div className="view-heading">
        <div><p className="eyebrow"><span /> Pipeline</p><h2 id="pipeline-title">Every relationship has a next move</h2><p>Search, filter, and act on explicit human evidence—never inferred activity.</p></div>
        <button className="capture-button" type="button" onClick={onCapture}><Plus size={18} /> Capture opportunity</button>
      </div>
      <div className="stage-overview" aria-label="Pipeline stage overview">
        {stageCounts.map(([stage, count]) => <button key={stage} type="button" className={filter === stage ? "is-active" : ""} onClick={() => setFilter(stage)}><span>{stage}</span><strong>{String(count).padStart(2, "0")}</strong></button>)}
      </div>
      <div className="pipeline-controls">
        <label><span className="sr-only">Search pipeline</span><Search size={18} /><input name="pipeline_search" autoComplete="off" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, source, offer, next action…" /></label>
        <label><Filter size={18} /><span className="sr-only">Filter by stage</span><select name="pipeline_stage" autoComplete="off" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>{PIPELINE_FILTERS.map((item) => <option key={item} value={item}>{item === "all" ? "All stages" : item}</option>)}</select></label>
      </div>
      <section className="due-strip" aria-labelledby="due-title">
        <div><p className="eyebrow" id="due-title">Due and overdue</p><strong>{String(due.length).padStart(2, "0")}</strong></div>
        {due.length ? <div className="due-list">{due.map(([key, record]) => <button key={key} type="button" onClick={() => onOpen(key)}><span className="stage-pill">{dueLabel(earliestFollowUp(record))}</span><strong>{operatorName(record)}</strong><p>{nextTaskSummary(record) || "Review the latest activity and record the next human step."}</p><ArrowUpRight size={18} /></button>)}</div> : <p>No follow-up is due. Future reminders remain in their records.</p>}
      </section>
      {filtered.length ? (
        <div className="pipeline-list" aria-live="polite">
          {filtered.map(([key, record]) => <button key={key} type="button" className="pipeline-row" onClick={() => onOpen(key)}><span className="stage-pill">{pipelineStage(record)}</span><span><strong>{operatorName(record)}</strong><small>{record.identity.category || "Unclassified"} · {compactSource(record.identity.source)}</small></span><span><small>Next task</small>{nextTaskSummary(record) || "Not recorded"}</span><span><small>Due</small>{earliestFollowUp(record) ? dueLabel(earliestFollowUp(record)) : openTask(record) ? "Ready now" : "Not scheduled"}</span><span><small>Value</small>{currency(record.estimatedValue)}</span><ArrowUpRight size={18} /></button>)}
        </div>
      ) : <div className="filtered-empty"><Search size={24} /><p>No pipeline record matches this search and stage.</p></div>}
    </section>
  );
}

interface ConversionRow {
  label: string;
  records: number;
  proposals: number;
  signed: number;
  paid: number;
  paidAmount: number;
}

function conversionRows(entries: OperatorEntry[], group: (record: OperatorRecord) => string): ConversionRow[] {
  const rows = new Map<string, ConversionRow>();
  for (const [, record] of entries) {
    const label = group(record) || "Unassigned";
    const row = rows.get(label) ?? { label, records: 0, proposals: 0, signed: 0, paid: 0, paidAmount: 0 };
    row.records += 1;
    if (record.commercialClose.proposalSentDate) row.proposals += 1;
    if (record.commercialClose.signedDate) row.signed += 1;
    if (isFullyPaidRecord(record)) row.paid += 1;
    row.paidAmount += paidAmount(record);
    rows.set(label, row);
  }
  return [...rows.values()].sort((left, right) => right.paidAmount - left.paidAmount || right.signed - left.signed || left.label.localeCompare(right.label));
}

export function MoneyView({ state, onOpen }: { state: OperatorState; onOpen: (key: string) => void }) {
  if (state.status === "loading" || state.status === "idle") return <div className="queue-loading" role="status"><Clock3 size={22} /><span>Loading money truth…</span></div>;
  if (state.status === "error") return <div className="queue-error" role="alert"><CircleAlert size={22} /><div><strong>Money view unavailable</strong><p>{state.message}</p></div></div>;

  const entries = Object.entries(state.envelope.records).sort(([, left], [, right]) => right.updated_at.localeCompare(left.updated_at));
  const activeEntries = entries.filter(([, record]) => !CLOSED_STATUSES.has(record.status) && record.status !== "paid");
  const collectibleEntries = entries.filter(([, record]) => !CLOSED_STATUSES.has(record.status));
  const estimated = activeEntries.reduce((sum, [, record]) => sum + (record.estimatedValue ?? 0), 0);
  const proposed = activeEntries.reduce((sum, [, record]) => sum + (record.commercialClose.proposalAmount ?? 0), 0);
  const signed = activeEntries.reduce((sum, [, record]) => sum + (record.commercialClose.signedDate ? record.commercialClose.proposalAmount ?? 0 : 0), 0);
  const invoiced = activeEntries.reduce((sum, [, record]) => sum + evidencedInvoiceAmount(record), 0);
  const paid = entries.reduce((sum, [, record]) => sum + paidAmount(record), 0);
  const outstanding = collectibleEntries.reduce((sum, [, record]) => sum + balance(record), 0);
  const sourceRows = conversionRows(entries, (record) => compactSource(record.identity.source));
  const categoryRows = conversionRows(entries, (record) => record.identity.category?.trim() || "Unclassified");
  const offerRows = conversionRows(entries, compactOffer);

  return (
    <section className="workspace-view money-section" aria-labelledby="money-title">
      <div className="view-heading">
        <div><p className="eyebrow"><span /> Money</p><h2 id="money-title">Cash truth, not pipeline theater</h2><p>Active potential, collectible balances, and lifetime cleared cash stay visibly separate.</p></div>
        <div className="deterministic-label"><ShieldCheck size={16} /> Paid means cleared cash</div>
      </div>
      <div className="money-metrics" aria-label="Commercial value summary">
        <Stat label="Estimated" value={currency(estimated)} detail="Active potential only" icon={Target} />
        <Stat label="Proposed" value={currency(proposed)} detail="Open proposal value" icon={TrendingUp} />
        <Stat label="Signed" value={currency(signed)} detail="Signed, not fully paid" icon={Check} />
        <Stat label="Invoiced" value={currency(invoiced)} detail="Current evidenced invoices" icon={BadgeDollarSign} />
        <Stat label="Paid" value={currency(paid)} detail="Lifetime cleared cash" icon={BarChart3} />
        <Stat label="Balance" value={currency(outstanding)} detail="Active collectible balance" icon={Clock3} />
      </div>
      {entries.length ? (
        <div className="money-ledger">
          {entries.map(([key, record]) => <button key={key} type="button" onClick={() => onOpen(key)}><span><strong>{operatorName(record)}</strong><small>{compactOffer(record)} · {compactSource(record.identity.source)}</small></span><span><small>Estimated</small>{currency(record.estimatedValue)}</span><span><small>Proposal</small>{currency(record.commercialClose.proposalAmount)}</span><span><small>Amount due</small>{currency(record.commercialClose.amountDue)}</span><span><small>Paid</small>{currency(record.commercialClose.amountPaid)}</span><span><small>Balance</small>{currency(balance(record))}</span><ArrowUpRight size={18} /></button>)}
        </div>
      ) : <div className="next-empty"><BadgeDollarSign size={28} /><h3>No commercial evidence yet</h3><p>Dakota will not turn research records into projected revenue.</p></div>}
      <div className="conversion-grid">
        <ConversionTable title="Source conversion" rows={sourceRows} />
        <ConversionTable title="Business category conversion" rows={categoryRows} />
        <ConversionTable title="Offer conversion" rows={offerRows} />
      </div>
    </section>
  );
}

function ConversionTable({ title, rows }: { title: string; rows: ConversionRow[] }) {
  return (
    <section className="conversion-table" aria-labelledby={`${title.toLowerCase().replace(/\s+/gu, "-")}-title`}>
      <div><p className="eyebrow" id={`${title.toLowerCase().replace(/\s+/gu, "-")}-title`}>{title}</p><span>Fully paid / records</span></div>
      {rows.length ? <ul>{rows.map((row) => <li key={row.label}><span><strong>{row.label}</strong><small>{row.proposals} proposed · {row.signed} signed · {row.paid} fully paid</small></span><span><strong>{row.records ? Math.round((row.paid / row.records) * 100) : 0}%</strong><small>{currency(row.paidAmount)} collected</small></span></li>)}</ul> : <p>No conversion evidence recorded.</p>}
    </section>
  );
}

export function DashboardStats({ queueCount, approvedCount, operatorRecords, now }: { queueCount: number; approvedCount: number; operatorRecords: Record<string, OperatorRecord>; now: Date }) {
  const records = Object.values(operatorRecords);
  const due = records.filter((record) => !CLOSED_STATUSES.has(record.status) && Boolean(earliestFollowUp(record)) && dueMillis(earliestFollowUp(record)) <= now.getTime()).length;
  const paid = records.reduce((sum, record) => sum + paidAmount(record), 0);
  return (
    <section className="stats-row" aria-label="Dakota summary">
      <Stat label="Public research" value={String(queueCount).padStart(2, "0")} detail="Maximum ten" icon={FileSearch} />
      <Stat label="Due now" value={String(due).padStart(2, "0")} detail="Explicit follow-ups" icon={Clock3} />
      <Stat label="Approved · 7d" value={String(approvedCount).padStart(2, "0")} detail="Human decisions" icon={ShieldCheck} />
      <Stat label="Paid" value={currency(paid)} detail="Cleared cash" icon={BadgeDollarSign} />
    </section>
  );
}
