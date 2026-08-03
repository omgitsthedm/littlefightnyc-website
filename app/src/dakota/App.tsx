import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileSearch,
  Globe2,
  Inbox,
  ListFilter,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import {
  beginGoogleLogin,
  completeAuthCallback,
  endSession,
  getCurrentUser,
  isDakotaOperator,
  onAuthChange,
  OPERATOR_EMAIL,
} from "./auth";
import { CaptureOpportunity } from "./CaptureOpportunity";
import { OpportunityDrawer } from "./OpportunityDrawer";
import { ScoreTriptych } from "./ScoreTriptych";
import {
  API_OPERATOR_STATE,
  assessCandidate,
  candidateFromOperatorRecord,
  candidateKey,
  countsTowardWeeklyNorthStar,
  currency,
  getSourceHealth,
  operatorRecordFor,
  sourceCoverage,
  STATUS_LABELS,
} from "./revenue";
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
  OperatorStateEnvelope,
  OperatorStateSaveResponse,
  QueueEnvelope,
  QueueState,
  SessionState,
} from "./types";

const API_QUEUE = "/api/dakota/queue";
type DashboardView = "today" | "queue" | "inbound" | "revenue";

const DASHBOARD_VIEWS = new Set<DashboardView>(["today", "queue", "inbound", "revenue"]);

function initialDashboardView(): DashboardView {
  const requested = new URLSearchParams(window.location.search).get("view") as DashboardView | null;
  return requested && DASHBOARD_VIEWS.has(requested) ? requested : "today";
}

async function responseError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="google-mark" viewBox="0 0 24 24">
      <path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34a853" d="M12 22c2.7 0 4.98-.9 6.63-2.37l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
      <path fill="#fbbc05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.53l3.35-2.61Z" />
      <path fill="#ea4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z" />
    </svg>
  );
}

function DakotaGlyph({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`dakota-glyph${compact ? " dakota-glyph--compact" : ""}`} aria-hidden="true">
      <span>D</span>
      <i />
    </div>
  );
}

function AccessScreen({ state }: { state: SessionState }) {
  const [submitting, setSubmitting] = useState(false);
  const isDenied = state.status === "denied";
  const isLoading = state.status === "loading";

  return (
    <main className="access-shell">
      <div className="access-grid" aria-hidden="true" />
      <div className="access-glow access-glow--orange" aria-hidden="true" />
      <div className="access-glow access-glow--blue" aria-hidden="true" />

      <section className="access-story">
        <div className="brand-lockup">
          <DakotaGlyph />
          <div><p>Dakota</p><span>Little Fight NYC</span></div>
        </div>
        <div className="access-copy">
          <p className="eyebrow"><span /> Private research desk</p>
          <h1>Find the signal.<br /><em>Keep the judgment.</em></h1>
          <p className="access-lede">A focused daily view of New York businesses worth a human look—ranked by evidence, never contacted automatically.</p>
        </div>
        <div className="contract-strip" aria-label="Dakota operating contract">
          <div><SearchCheck size={18} /><span><strong>Public sources</strong>Read-only research</span></div>
          <div><ListFilter size={18} /><span><strong>Ten at a time</strong>Deliberate review</span></div>
          <div><ShieldCheck size={18} /><span><strong>No outreach</strong>Humans stay in control</span></div>
        </div>
      </section>

      <section className="access-panel" aria-labelledby="access-title">
        <div className="access-card">
          <div className="access-card__topline"><span className="status-light" /><span>Restricted system</span><LockKeyhole size={14} /></div>
          {isLoading ? (
            <div className="auth-loading" role="status"><LoaderCircle className="spin" size={26} /><p>Verifying your session…</p><span>Secure connection in progress…</span></div>
          ) : (
            <>
              <div className="access-card__icon">{isDenied ? <X size={24} /> : <LockKeyhole size={24} />}</div>
              <p className="eyebrow">Operator access</p>
              <h2 id="access-title">{isDenied ? "Access not authorized" : "Enter Dakota"}</h2>
              <p className="access-card__body">{isDenied ? state.message : "This workspace is available only to the authorized Little Fight NYC operator."}</p>
              {isDenied ? (
                <button className="login-button login-button--quiet" type="button" onClick={() => void endSession().then(() => window.location.assign("/app/"))}><LogOut size={17} /> Clear this session</button>
              ) : (
                <button className="login-button" type="button" onClick={() => { setSubmitting(true); beginGoogleLogin(); }} disabled={submitting}>
                  {submitting ? <LoaderCircle className="spin" size={20} /> : <GoogleMark />}
                  Continue with Google <ArrowUpRight size={18} />
                </button>
              )}
              <div className="authorized-account"><Check size={14} /><span>Authorized account</span><strong>{OPERATOR_EMAIL}</strong></div>
            </>
          )}
        </div>
        <p className="access-footnote"><ShieldCheck size={14} /> Candidate data is requested only after server-side authorization.</p>
      </section>
    </main>
  );
}

function Stat({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof FileSearch }) {
  return (
    <article className="stat-card">
      <div className="stat-card__icon"><Icon size={17} /></div>
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
            <p className="candidate-source"><FileSearch size={13} /> {compactSource(candidate.source)}</p>
            <h3>{candidateLabel(candidate)}</h3>
            {candidate.dba && candidate.dba !== candidate.business_name ? <p className="legal-name">{candidate.business_name}</p> : null}
          </div>
          <span className={`stage-pill stage-pill--${record.status}`}>{STATUS_LABELS[record.status]}</span>
        </div>

        <p className="diagnosis">{candidate.diagnosis || "No diagnosis was provided. Verify the source record and storefront evidence."}</p>
        <div className="candidate-facts">
          {location ? <span><MapPin size={14} />{location}</span> : null}
          {candidate.category ? <span><Building2 size={14} />{candidate.category}</span> : null}
          {candidate.filed_at ? <span><CalendarDays size={14} />Filed {formatDate(candidate.filed_at)}</span> : null}
        </div>

        <ScoreTriptych assessment={assessment} compact />
        {tiedSignal && !assessment.qualified ? <p className="tie-note"><CircleAlert size={13} /> Tied early signal. Queue order is a review sequence, not qualification.</p> : null}

        {(reasons.length || gaps.length) ? (
          <div className="signal-grid">
            <div><p><Sparkles size={13} /> Why it surfaced</p>{reasons.length ? <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <span>No reasons supplied</span>}</div>
            <div><p><CircleAlert size={13} /> Evidence gaps</p>{gaps.length ? <ul>{gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : <span>Independent review still required</span>}</div>
          </div>
        ) : null}
      </div>

      <div className="candidate-card__action">
        <div className={`site-state ${candidate.verified_url ? "site-state--found" : ""}`}>
          <Globe2 size={15} />
          <span><small>Website evidence</small><strong>{candidate.verified_url ? "Engine verified" : compactSource(candidate.domain_status || "Not verified")}</strong></span>
        </div>
        <button className="review-button" type="button" onClick={onOpen}>Open dossier <ArrowUpRight size={14} /></button>
        {candidate.verified_url ? <a href={candidate.verified_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Review public site <ExternalLink size={13} /></a> : <span className="no-link">No verified site</span>}
        <p>{candidate.source_id ? `Source ${candidate.source_id}` : "Source ID not provided"}</p>
      </div>
    </article>
  );
}

function QueueEmpty() {
  return (
    <div className="queue-empty"><div><Clock3 size={24} /></div><h3>No queue has been published yet</h3><p>Run Dakota locally, then publish the current review queue through the signed private bridge.</p></div>
  );
}

function QueueStateView({ state, retry }: { state: QueueState; retry: () => void }) {
  if (state.status === "loading" || state.status === "idle") return <div className="queue-loading" role="status"><LoaderCircle className="spin" size={24} /><span>Loading private queue…</span></div>;
  if (state.status === "empty") return <QueueEmpty />;
  if (state.status === "error") {
    return (
      <div className="queue-error" role="alert"><CircleAlert size={22} /><div><strong>Queue unavailable</strong><p>{state.message}</p></div><button type="button" onClick={retry}>Try again <ArrowUpRight size={14} /></button></div>
    );
  }
  return null;
}

function InboundLane() {
  return (
    <section className="lane-section" aria-labelledby="inbound-title">
      <div className="section-heading"><div><p className="eyebrow">Inbound · opted in</p><h2 id="inbound-title">Consent comes first</h2></div><div className="deterministic-label"><ShieldCheck size={15} /> Separate from public research</div></div>
      <div className="lane-empty">
        <div><Inbox size={25} /></div>
        <p className="eyebrow">No connected inbound feed</p>
        <h3>No opted-in inquiries are available here</h3>
        <p>Dakota never reclassifies public filing records as inbound leads. This lane stays empty until a real, consented Little Fight intake source is deliberately connected.</p>
        <span>Website Check and Tech Audit are inbound-only flows. Never submit a prospect on their behalf.</span>
      </div>
    </section>
  );
}

type OperatorActionEntry = [string, OperatorRecord];

function prioritizedOperatorActions(records: Record<string, OperatorRecord>): OperatorActionEntry[] {
  const activeStatuses = new Set(["research_ready", "pursuit_ready", "pursuing", "replied", "meeting", "proposal", "snoozed"]);
  return Object.entries(records)
    .filter(([, record]) => activeStatuses.has(record.status) && Boolean(record.nextAction || record.dueDate))
    .sort(([, left], [, right]) => {
      if (left.dueDate && right.dueDate) return left.dueDate.localeCompare(right.dueDate);
      if (left.dueDate) return -1;
      if (right.dueDate) return 1;
      return right.updated_at.localeCompare(left.updated_at);
    });
}

function operatorDueLabel(record: OperatorRecord): string {
  if (!record.dueDate) return "No due date";
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (record.dueDate < todayKey) return "Overdue";
  if (record.dueDate === todayKey) return "Due today";
  return formatDate(record.dueDate);
}

function TodayDecisionBoard({
  publicCandidate,
  publicTied,
  followup,
  onOpen,
  onOpenInbound,
}: {
  publicCandidate: Candidate | null;
  publicTied: boolean;
  followup: OperatorActionEntry | null;
  onOpen: (key: string) => void;
  onOpenInbound: () => void;
}) {
  const [followupKey, followupRecord] = followup ?? ["", null];

  return (
    <section className="due-actions today-decisions" aria-labelledby="today-actions-title">
      <div className="section-heading">
        <div><p className="eyebrow">Today’s 3</p><h2 id="today-actions-title">One decision from each revenue lane</h2></div>
        <div className="deterministic-label"><ShieldCheck size={15} /> Empty lanes stay honest</div>
      </div>
      <div className="due-action-list today-decision-list">
        <article className="today-decision-card today-decision-card--inbound">
          <div><span className="stage-pill">Inbound · opted in</span><small>01</small></div>
          <h3>No consented lead connected</h3>
          <p>This slot is reserved for the hottest Website Check or Tech Audit inquiry. Public records can never fill it.</p>
          <button type="button" onClick={onOpenInbound}>View inbound lane <ArrowUpRight size={13} /></button>
        </article>
        <article className="today-decision-card today-decision-card--public">
          <div><span className="stage-pill">Public research</span><small>02</small></div>
          <h3>{publicCandidate ? candidateLabel(publicCandidate) : "No public record available"}</h3>
          <p>{publicCandidate ? `${compactSource(publicCandidate.source)} · ${publicTied ? "Tied review order; not qualified" : "Top deterministic review order"}` : "Publish a current Dakota queue to restore this review slot."}</p>
          <button type="button" disabled={!publicCandidate} onClick={() => publicCandidate && onOpen(candidateKey(publicCandidate))}>Open public dossier <ArrowUpRight size={13} /></button>
        </article>
        <article className="today-decision-card today-decision-card--followup">
          <div><span className={followupRecord ? `stage-pill stage-pill--${followupRecord.status}` : "stage-pill"}>{followupRecord ? STATUS_LABELS[followupRecord.status] : "Saved follow-up"}</span><small>03</small></div>
          <h3>{followupRecord ? followupRecord.identity.dba || followupRecord.identity.businessName : "No follow-up is due"}</h3>
          <p>{followupRecord ? `${operatorDueLabel(followupRecord)} · ${followupRecord.nextAction || "Review the saved evidence and set a next action."}` : "Save one real next action in a dossier; Dakota will place the most important one here."}</p>
          <button type="button" disabled={!followupRecord} onClick={() => followupRecord && onOpen(followupKey)}>Open follow-up <ArrowUpRight size={13} /></button>
        </article>
      </div>
      <div className="review-order-note"><CircleAlert size={16} /><p><strong>These are three lanes, not three invented leads.</strong> Inbound stays empty until consented intake is connected; public signals stay unqualified until verified; follow-up comes only from saved operator action.</p></div>
    </section>
  );
}

function RevenueView({
  state,
  onCapture,
  onOpen,
}: {
  state: OperatorState;
  onCapture: () => void;
  onOpen: (key: string) => void;
}) {
  if (state.status === "loading" || state.status === "idle") return <div className="queue-loading" role="status"><LoaderCircle className="spin" size={24} /><span>Loading private outcomes…</span></div>;
  if (state.status === "error") return <div className="queue-error" role="alert"><CircleAlert size={22} /><div><strong>Operator notebook unavailable</strong><p>{state.message}</p></div></div>;

  const entries = Object.entries(state.envelope.records).sort(([, left], [, right]) => right.updated_at.localeCompare(left.updated_at));
  const activeStatuses = new Set(["pursuit_ready", "pursuing", "replied", "meeting", "proposal"]);
  const active = entries.filter(([, record]) => activeStatuses.has(record.status));
  const won = entries.filter(([, record]) => record.status === "won");
  const actualRevenue = entries.reduce((sum, [, record]) => sum + (record.actualRevenue ?? 0), 0);
  const pipelineValue = active.reduce((sum, [, record]) => sum + (record.estimatedValue ?? 0), 0);
  const milestoneCounts = [
    ["Approved", entries.filter(([, record]) => Boolean(record.milestones?.humanApprovedAt)).length],
    ["Replied", entries.filter(([, record]) => Boolean(record.milestones?.repliedAt)).length],
    ["Meetings", entries.filter(([, record]) => Boolean(record.milestones?.meetingAt)).length],
    ["Proposals", entries.filter(([, record]) => Boolean(record.milestones?.proposalAt)).length],
    ["Won", entries.filter(([, record]) => Boolean(record.milestones?.wonAt)).length],
  ] as const;

  return (
    <section className="lane-section revenue-section" aria-labelledby="revenue-title">
      <div className="section-heading">
        <div><p className="eyebrow">Operator outcomes</p><h2 id="revenue-title">Evidence to revenue</h2></div>
        <button className="capture-button" type="button" onClick={onCapture}><Plus size={15} /> Capture opportunity</button>
      </div>

      <div className="revenue-metrics" aria-label="Private revenue summary">
        <Stat label="Private records" value={String(entries.length).padStart(2, "0")} detail="Current and historical" icon={Target} />
        <Stat label="Active pipeline" value={String(active.length).padStart(2, "0")} detail={currency(pipelineValue)} icon={TrendingUp} />
        <Stat label="Won outcomes" value={String(won.length).padStart(2, "0")} detail="Recorded, not projected" icon={Check} />
        <Stat label="Revenue recorded" value={currency(actualRevenue)} detail="Operator-entered outcomes" icon={BarChart3} />
      </div>

      <div className="revenue-funnel" aria-label="Recorded operator milestones">
        <p>Write-once milestones—not inferred activity</p>
        <dl>
          {milestoneCounts.map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{String(count).padStart(2, "0")}</dd></div>)}
        </dl>
      </div>

      {entries.length === 0 ? (
        <div className="lane-empty compact-empty"><div><BarChart3 size={25} /></div><h3>No operator outcomes recorded</h3><p>Research can continue without pretending the queue has produced a client. Capture a real opportunity or save evidence from a current dossier.</p></div>
      ) : (
        <div className="outcome-table-wrap">
          <table className="outcome-table">
            <caption>Private outcomes by business, category, source, and offer</caption>
            <thead><tr><th>Business / category</th><th>Source</th><th>Offer</th><th>State</th><th>Next action</th><th>Due</th><th>Estimate</th><th>Actual</th><th><span className="sr-only">Review</span></th></tr></thead>
            <tbody>
              {entries.map(([key, record]) => {
                return (
                  <tr key={key}>
                    <td><strong>{record.identity.dba || record.identity.businessName}</strong><span>{record.identity.category || "Unclassified"}</span></td>
                    <td>{compactSource(record.identity.source)}</td>
                    <td className="outcome-table__offer">{record.offerFit || "No offer recorded"}</td>
                    <td><span className={`stage-pill stage-pill--${record.status}`}>{STATUS_LABELS[record.status]}</span></td>
                    <td>{record.nextAction || "No next action recorded"}</td>
                    <td>{record.dueDate ? formatDate(record.dueDate) : "—"}</td>
                    <td>{currency(record.estimatedValue)}</td>
                    <td>{currency(record.actualRevenue)}</td>
                    <td><button type="button" onClick={() => onOpen(key)}>Open <ArrowUpRight size={13} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="revenue-footnote">Dakota reports only operator-entered outcomes. It does not infer replies, meetings, wins, or revenue from browsing activity.</p>
    </section>
  );
}

export function Dashboard({ email, onLogout }: { email: string; onLogout: () => Promise<void> }) {
  const [queueState, setQueueState] = useState<QueueState>({ status: "loading" });
  const [operatorState, setOperatorState] = useState<OperatorState>({ status: "loading" });
  const [view, setView] = useState<DashboardView>(initialDashboardView);
  const [selectedKey, setSelectedKey] = useState("");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueue = useCallback(async (showLoading = true) => {
    if (showLoading) setQueueState({ status: "loading" });
    try {
      const response = await fetch(API_QUEUE, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 204 || response.status === 404) {
        setQueueState({ status: "empty" });
        return;
      }
      if (response.status === 401 || response.status === 403) throw new Error("Your secure session is no longer authorized. Sign in again.");
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the private queue."));
      const queue = (await response.json()) as QueueEnvelope;
      if (queue.schema_version !== "dakota.queue.v1" || !Array.isArray(queue.records)) throw new Error("The private queue response did not match Dakota’s expected schema.");
      if (queue.records.length > 10) throw new Error("The private queue exceeded Dakota’s ten-record safety cap and was not displayed.");
      setQueueState(queue.records.length ? { status: "ready", queue } : { status: "empty" });
    } catch (error) {
      setQueueState({ status: "error", message: error instanceof Error ? error.message : "Dakota could not load the private queue." });
    }
  }, []);

  const loadOperatorState = useCallback(async (showLoading = true) => {
    if (showLoading) setOperatorState({ status: "loading" });
    try {
      const response = await fetch(API_OPERATOR_STATE, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) throw new Error("Your secure session is not authorized to read operator outcomes.");
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the private operator notebook."));
      const envelope = (await response.json()) as OperatorStateEnvelope;
      if (envelope.schema_version !== "dakota.operator-state.v1" || !envelope.records || typeof envelope.records !== "object" || Array.isArray(envelope.records)) throw new Error("The operator-state response did not match Dakota’s expected schema.");
      setOperatorState({ status: "ready", envelope });
    } catch (error) {
      setOperatorState({ status: "error", message: error instanceof Error ? error.message : "Dakota could not load the private operator notebook." });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void Promise.allSettled([loadQueue(false), loadOperatorState(false)]);
    });
  }, [loadOperatorState, loadQueue]);

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.allSettled([loadQueue(false), loadOperatorState(false)]);
    setRefreshing(false);
  };

  const saveOperatorRecord = useCallback(async (key: string, record: OperatorRecordInput) => {
    const response = await fetch(API_OPERATOR_STATE, {
      method: "PUT",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_key: key, record }),
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) throw new Error("Your secure session is not authorized to save operator state.");
    if (!response.ok) throw new Error(await responseError(response, "Dakota could not save the private operator record."));
    const result = (await response.json()) as OperatorStateSaveResponse;
    if (result.schema_version !== "dakota.operator-state.v1" || result.candidate_key !== key || !result.record?.updated_at) throw new Error("Dakota saved an unexpected operator-state response.");
    setOperatorState((current) => {
      const records = current.status === "ready" ? current.envelope.records : {};
      return {
        status: "ready",
        envelope: {
          schema_version: "dakota.operator-state.v1",
          updated_at: result.updated_at,
          records: { ...records, [key]: result.record },
        },
      };
    });
  }, []);

  const queue = queueState.status === "ready" ? queueState.queue : null;
  const operatorRecords: Record<string, OperatorRecord> = operatorState.status === "ready" ? operatorState.envelope.records : {};
  const currentRecords = useMemo(() => queue?.records ?? [], [queue]);
  const strongestPublicRecord = currentRecords[0] ?? null;
  const topFollowup = prioritizedOperatorActions(operatorRecords)[0] ?? null;
  const scoreCounts = useMemo(() => {
    const counts = new Map<number, number>();
    currentRecords.forEach((candidate) => counts.set(candidate.score, (counts.get(candidate.score) ?? 0) + 1));
    return counts;
  }, [currentRecords]);
  const selectedRecord = operatorRecords[selectedKey];
  const selectedQueueCandidate = currentRecords.find((candidate) => candidateKey(candidate) === selectedKey) ?? null;
  const selectedSavedCandidate = selectedRecord ? candidateFromOperatorRecord(selectedKey, selectedRecord) : null;
  const selectedCandidate = selectedQueueCandidate ?? selectedSavedCandidate;
  const selectedSavedOnly = !selectedQueueCandidate && Boolean(selectedSavedCandidate);
  const selectedQueue: QueueEnvelope | null = selectedQueueCandidate && queue
    ? queue
    : selectedSavedCandidate && selectedRecord
      ? {
          schema_version: "dakota.queue.v1",
          generated_at: selectedRecord.updated_at,
          published_at: selectedRecord.updated_at,
          records: [selectedSavedCandidate],
        }
      : null;
  const sourceHealth = queue ? getSourceHealth(queue.generated_at) : null;
  const weeklyApprovedCount = Object.values(operatorRecords).filter((record) => countsTowardWeeklyNorthStar(record)).length;
  const actualRevenue = Object.values(operatorRecords).reduce((sum, record) => sum + (record.actualRevenue ?? 0), 0);
  const notebookAvailable = operatorState.status === "ready";

  const views: { id: DashboardView; label: string; icon: typeof Target }[] = [
    { id: "today", label: "Today’s 3", icon: Target },
    { id: "queue", label: "Full queue", icon: ListFilter },
    { id: "inbound", label: "Inbound", icon: Inbox },
    { id: "revenue", label: "Revenue", icon: BarChart3 },
  ];

  const changeView = (nextView: DashboardView) => {
    setView(nextView);
    const nextUrl = new URL(window.location.href);
    if (nextView === "today") nextUrl.searchParams.delete("view");
    else nextUrl.searchParams.set("view", nextView);
    window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  };

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#dakota-main">Skip to Dakota workspace</a>
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/app/" aria-label="Dakota home"><DakotaGlyph compact /><span><strong>Dakota</strong><small>Research desk</small></span></a>
        <nav className="dashboard-nav" aria-label="Dakota workspace">
          {views.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={view === id ? "is-active" : ""} aria-current={view === id ? "page" : undefined} onClick={() => changeView(id)}><Icon size={14} />{label}</button>)}
        </nav>
        <div className="operator-menu"><span><small>Signed in</small><strong>{email}</strong></span><button type="button" onClick={() => void onLogout()} aria-label="Sign out"><LogOut size={17} /></button></div>
      </header>

      <main className="dashboard-main" id="dakota-main">
        <section className="dashboard-intro">
          <div>
            <p className="eyebrow"><span /> Evidence to action</p>
            <h1>Today’s signal.<br /><em>Human next move.</em></h1>
            <p>Signal says something happened. Identity says we know who it is. Pursuit stays unqualified until a human verifies the pain, matches one offer, and approves the next step.</p>
          </div>
          <div className="queue-meta">
            <p><Clock3 size={14} /> Queue generated</p>
            <strong>{queue ? formatTimestamp(queue.generated_at) : "Waiting for queue"}</strong>
            {queue?.published_at ? <span>Private snapshot published {formatTimestamp(queue.published_at)}</span> : null}
            <button type="button" onClick={() => void refreshAll()} disabled={refreshing}><RefreshCw className={refreshing ? "spin" : ""} size={15} /> Refresh evidence</button>
          </div>
        </section>

        {queue && sourceHealth ? (
          <section className={`source-health source-health--${sourceHealth.level}`} aria-label="Source health">
            <div><span className="status-light" /><p><strong>{sourceHealth.title}</strong><span>{sourceHealth.message}</span></p></div>
            <p>{sourceCoverage(queue.records)} · {sourceHealth.ageHours === null ? "Age unknown" : `${Math.round(sourceHealth.ageHours)}h old`}</p>
          </section>
        ) : null}

        {operatorState.status === "error" ? <div className="notebook-warning" role="status"><CircleAlert size={16} /><span><strong>Operator notebook unavailable.</strong> Queue research still works, but state controls are read-only until refresh succeeds.</span></div> : null}

        <section className="stats-row" aria-label="Dakota summary">
          <Stat label="Review queue" value={String(currentRecords.length).padStart(2, "0")} detail="Maximum ten" icon={FileSearch} />
          <Stat label="Today’s lanes" value="03" detail="Inbound · public · follow-up" icon={Target} />
          <Stat label="Approved actions · 7d" value={String(weeklyApprovedCount).padStart(2, "0")} detail="Immutable human decisions" icon={ShieldCheck} />
          <Stat label="Revenue recorded" value={currency(actualRevenue)} detail="Never projected" icon={TrendingUp} />
        </section>

        {view === "today" ? (
          <>
            <TodayDecisionBoard
              publicCandidate={strongestPublicRecord}
              publicTied={Boolean(strongestPublicRecord && (scoreCounts.get(strongestPublicRecord.score) ?? 0) > 1)}
              followup={topFollowup}
              onOpen={setSelectedKey}
              onOpenInbound={() => changeView("inbound")}
            />
            <section className="queue-section" aria-labelledby="today-heading">
              <div className="section-heading">
                <div><p className="eyebrow">Public focus detail</p><h2 id="today-heading">Verify the strongest public review</h2></div>
                <div className="deterministic-label"><ShieldCheck size={15} /> Ties stay ties</div>
              </div>
              <div className="review-order-note"><CircleAlert size={16} /><p><strong>Review order is not qualification.</strong> Tied source scores are shown honestly. A record becomes pursuit-ready only after verified pain, offer fit, and explicit human approval are saved.</p></div>
              {queue && strongestPublicRecord ? <div className="candidate-list"><CandidateCard candidate={strongestPublicRecord} record={operatorRecordFor(operatorRecords, strongestPublicRecord)} tiedSignal={(scoreCounts.get(strongestPublicRecord.score) ?? 0) > 1} onOpen={() => setSelectedKey(candidateKey(strongestPublicRecord))} /></div> : <QueueStateView state={queueState} retry={() => void loadQueue()} />}
            </section>
          </>
        ) : null}

        {view === "queue" ? (
          <section className="queue-section" aria-labelledby="queue-heading">
            <div className="section-heading"><div><p className="eyebrow">Current queue</p><h2 id="queue-heading">All public-source records</h2></div><div className="deterministic-label"><ShieldCheck size={15} /> Human review required</div></div>
            {queue ? <div className="candidate-list">{currentRecords.map((candidate) => <CandidateCard key={candidateKey(candidate)} candidate={candidate} record={operatorRecordFor(operatorRecords, candidate)} tiedSignal={(scoreCounts.get(candidate.score) ?? 0) > 1} onOpen={() => setSelectedKey(candidateKey(candidate))} />)}</div> : <QueueStateView state={queueState} retry={() => void loadQueue()} />}
          </section>
        ) : null}

        {view === "inbound" ? <InboundLane /> : null}
        {view === "revenue" ? <RevenueView state={operatorState} onCapture={() => setCaptureOpen(true)} onOpen={setSelectedKey} /> : null}

        <section className="operating-contract">
          <div><ShieldCheck size={20} /><span><strong>Dakota operating contract</strong>Public-source research. Deterministic scoring. Private human decisions. No automatic outreach.</span></div>
          <p>Queue capped at 10 · Exact operator access · No calls, texts, email, forms, or CRM writes</p>
        </section>
      </main>

      {selectedCandidate && selectedQueue ? (
        <OpportunityDrawer
          key={selectedKey}
          candidate={selectedCandidate}
          queue={selectedQueue}
          record={operatorRecordFor(operatorRecords, selectedCandidate)}
          recordUpdatedAt={operatorRecords[selectedKey]?.updated_at}
          milestones={operatorRecords[selectedKey]?.milestones}
          savedOnly={selectedSavedOnly}
          notebookAvailable={notebookAvailable}
          onClose={() => setSelectedKey("")}
          onSave={saveOperatorRecord}
        />
      ) : null}
      {captureOpen ? <CaptureOpportunity notebookAvailable={notebookAvailable} onClose={() => setCaptureOpen(false)} onSave={saveOperatorRecord} /> : null}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  const resolveSession = useCallback(async () => {
    try {
      const callbackUser = await completeAuthCallback();
      const user = callbackUser ?? (await getCurrentUser());
      if (!user) {
        if (!window.location.pathname.startsWith("/app")) window.history.replaceState({}, "", "/app/");
        setSession({ status: "anonymous" });
        return;
      }
      if (!isDakotaOperator(user)) {
        setSession({ status: "denied", message: `This Google identity is not approved for Dakota. Use ${OPERATOR_EMAIL}.` });
        return;
      }
      if (!window.location.pathname.startsWith("/app")) window.history.replaceState({}, "", "/app/");
      setSession({ status: "authorized", email: user.email });
    } catch {
      setSession({ status: "anonymous", message: "The sign-in could not be completed. Please try again." });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void resolveSession());
    return onAuthChange(() => void resolveSession());
  }, [resolveSession]);

  const logout = async () => {
    await endSession();
    window.history.replaceState({}, "", "/app/");
    setSession({ status: "anonymous" });
  };

  if (session.status !== "authorized") return <AccessScreen state={session} />;
  return <Dashboard email={session.email} onLogout={logout} />;
}
