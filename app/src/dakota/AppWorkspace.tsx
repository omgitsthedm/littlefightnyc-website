import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Check,
  CircleAlert,
  Clock3,
  FileSearch,
  ListFilter,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
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
import {
  API_OPERATOR_STATE,
  candidateFromOperatorRecord,
  candidateKey,
  countsTowardWeeklyNorthStar,
  getSourceHealth,
  operatorRecordFor,
  sourceCoverage,
} from "./revenue";
import { formatTimestamp } from "./presentation";
import {
  DashboardStats,
  DoNextView,
  MoneyView,
  PipelineView,
  ResearchView,
} from "./WorkspaceViews";
import type {
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
type DashboardView = "do-next" | "research" | "pipeline" | "money";

const VIEW_ALIASES: Record<string, DashboardView> = {
  "do-next": "do-next",
  today: "do-next",
  inbound: "do-next",
  research: "research",
  queue: "research",
  pipeline: "pipeline",
  money: "money",
  revenue: "money",
};

function initialDashboardView(): DashboardView {
  const requested = new URLSearchParams(window.location.search).get("view");
  return requested ? VIEW_ALIASES[requested] ?? "do-next" : "do-next";
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
  return <div className={`dakota-glyph${compact ? " dakota-glyph--compact" : ""}`} aria-hidden="true"><span>D</span><i /></div>;
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
        <div className="brand-lockup"><DakotaGlyph /><div><p>Dakota</p><span>Little Fight NYC</span></div></div>
        <div className="access-copy">
          <p className="eyebrow"><span /> Private conversion cockpit</p>
          <h1>Find the signal.<br /><em>Earn the client.</em></h1>
          <p className="access-lede">One calm operating view from consented inquiry or verified evidence to a deliberate next action and cleared cash.</p>
        </div>
        <div className="contract-strip" aria-label="Dakota operating contract">
          <div><SearchCheck size={20} /><span><strong>Public evidence</strong>Research, never spam</span></div>
          <div><ListFilter size={20} /><span><strong>Three actions</strong>Only what is ready</span></div>
          <div><ShieldCheck size={20} /><span><strong>Human control</strong>No automatic outreach</span></div>
        </div>
      </section>
      <section className="access-panel" aria-labelledby="access-title">
        <div className="access-card">
          <div className="access-card__topline"><span className="status-light" /><span>Restricted system</span><LockKeyhole size={16} /></div>
          {isLoading ? <div className="auth-loading" role="status"><LoaderCircle className="spin" size={26} /><p>Verifying your session…</p><span>Secure connection in progress…</span></div> : (
            <>
              <div className="access-card__icon">{isDenied ? <X size={24} /> : <LockKeyhole size={24} />}</div>
              <p className="eyebrow">Operator access</p>
              <h2 id="access-title">{isDenied ? "Access not authorized" : "Enter Dakota"}</h2>
              <p className="access-card__body">{isDenied ? state.message : "This workspace is available only to the authorized Little Fight NYC operator."}</p>
              {isDenied ? <button className="login-button login-button--quiet" type="button" onClick={() => void endSession().then(() => window.location.assign("/app/"))}><LogOut size={18} /> Clear this session</button> : <button className="login-button" type="button" onClick={() => { setSubmitting(true); beginGoogleLogin(); }} disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={20} /> : <GoogleMark />}Continue with Google <ArrowUpRight size={18} /></button>}
              <div className="authorized-account"><Check size={16} /><span>Authorized account</span><strong>{OPERATOR_EMAIL}</strong></div>
            </>
          )}
        </div>
        <p className="access-footnote"><ShieldCheck size={16} /> Private records load only after server-side authorization.</p>
      </section>
    </main>
  );
}

const VIEW_COPY: Record<DashboardView, { eyebrow: string; title: string; emphasis: string; body: string }> = {
  "do-next": { eyebrow: "Revenue command", title: "One move.", emphasis: "Toward paid.", body: "Dakota shows only consented, qualified, or due work. Everything else stays in research." },
  research: { eyebrow: "Evidence backlog", title: "Ten signals.", emphasis: "Earn the next step.", body: "A public record is not a lead. Verify the business, contact route, pain, and offer before pursuit." },
  pipeline: { eyebrow: "Relationship desk", title: "Every promise.", emphasis: "One next move.", body: "Track explicit outreach, replies, discovery, proposals, signatures, and follow-ups without inventing activity." },
  money: { eyebrow: "Commercial truth", title: "Revenue recorded.", emphasis: "Cash that cleared.", body: "Estimated, proposed, signed, invoiced, paid, and outstanding stay separate." },
};

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
      if (response.status === 204 || response.status === 404) return setQueueState({ status: "empty" });
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the private research queue."));
      const queue = (await response.json()) as QueueEnvelope;
      if (queue.schema_version !== "dakota.queue.v1" || !Array.isArray(queue.records)) throw new Error("The private queue response did not match Dakota’s expected schema.");
      if (queue.records.length > 10) throw new Error("The private queue exceeded Dakota’s ten-record safety cap and was not displayed.");
      setQueueState(queue.records.length ? { status: "ready", queue } : { status: "empty" });
    } catch (error) {
      setQueueState({ status: "error", message: error instanceof Error ? error.message : "Dakota could not load the private research queue." });
    }
  }, [onLogout]);

  const loadOperatorState = useCallback(async (showLoading = true) => {
    if (showLoading) setOperatorState({ status: "loading" });
    try {
      const response = await fetch(API_OPERATOR_STATE, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the private operator notebook."));
      const envelope = (await response.json()) as OperatorStateEnvelope;
      if (envelope.schema_version !== "dakota.operator-state.v2" || !envelope.records || typeof envelope.records !== "object" || Array.isArray(envelope.records)) throw new Error("The operator-state response did not match Dakota’s expected v2 schema.");
      setOperatorState({ status: "ready", envelope });
    } catch (error) {
      setOperatorState({ status: "error", message: error instanceof Error ? error.message : "Dakota could not load the private operator notebook." });
    }
  }, [onLogout]);

  useEffect(() => {
    queueMicrotask(() => void Promise.allSettled([loadQueue(false), loadOperatorState(false)]));
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
    if (response.status === 401 || response.status === 403) {
      await onLogout();
      throw new Error("Your secure session expired. Sign in again before saving operator state.");
    }
    if (!response.ok) throw new Error(await responseError(response, "Dakota could not save the private operator record."));
    const result = (await response.json()) as OperatorStateSaveResponse;
    if (result.schema_version !== "dakota.operator-state.v2" || result.candidate_key !== key || !result.record?.updated_at) throw new Error("Dakota saved an unexpected operator-state response.");
    setOperatorState((current) => {
      const records = current.status === "ready" ? current.envelope.records : {};
      return { status: "ready", envelope: { schema_version: "dakota.operator-state.v2", updated_at: result.updated_at, records: { ...records, [key]: result.record } } };
    });
  }, [onLogout]);

  const queue = queueState.status === "ready" ? queueState.queue : null;
  const operatorRecords: Record<string, OperatorRecord> = operatorState.status === "ready" ? operatorState.envelope.records : {};
  const currentRecords = useMemo(() => queue?.records ?? [], [queue]);
  const selectedRecord = operatorRecords[selectedKey];
  const selectedQueueCandidate = currentRecords.find((candidate) => candidateKey(candidate) === selectedKey) ?? null;
  const selectedSavedCandidate = selectedRecord ? candidateFromOperatorRecord(selectedKey, selectedRecord) : null;
  const selectedCandidate = selectedQueueCandidate ?? selectedSavedCandidate;
  const selectedSavedOnly = !selectedQueueCandidate && Boolean(selectedSavedCandidate);
  const selectedQueue: QueueEnvelope | null = selectedQueueCandidate && queue ? queue : selectedSavedCandidate && selectedRecord ? { schema_version: "dakota.queue.v1", generated_at: selectedRecord.updated_at, published_at: selectedRecord.updated_at, records: [selectedSavedCandidate] } : null;
  const sourceHealth = queue ? getSourceHealth(queue.generated_at) : null;
  const weeklyApprovedCount = Object.values(operatorRecords).filter((record) => countsTowardWeeklyNorthStar(record)).length;
  const notebookAvailable = operatorState.status === "ready";
  const copy = VIEW_COPY[view];

  const views: { id: DashboardView; label: string; icon: typeof Target }[] = [
    { id: "do-next", label: "Do Next", icon: Target },
    { id: "research", label: "Research", icon: FileSearch },
    { id: "pipeline", label: "Pipeline", icon: TrendingUp },
    { id: "money", label: "Money", icon: BadgeDollarSign },
  ];

  const changeView = (nextView: DashboardView) => {
    setView(nextView);
    const nextUrl = new URL(window.location.href);
    if (nextView === "do-next") nextUrl.searchParams.delete("view");
    else nextUrl.searchParams.set("view", nextView);
    window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  };

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#dakota-main">Skip to Dakota workspace</a>
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/app/" aria-label="Dakota home"><DakotaGlyph compact /><span><strong>Dakota</strong><small>Conversion cockpit</small></span></a>
        <nav className="dashboard-nav" aria-label="Dakota workspace">{views.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={view === id ? "is-active" : ""} aria-current={view === id ? "page" : undefined} onClick={() => changeView(id)}><Icon size={17} />{label}</button>)}</nav>
        <div className="operator-menu"><span><small>Signed in</small><strong>{email}</strong></span><button type="button" onClick={() => void onLogout()} aria-label="Sign out"><LogOut size={18} /></button></div>
      </header>
      <main className="dashboard-main" id="dakota-main">
        <section className="dashboard-intro dashboard-intro--compact">
          <div><p className="eyebrow"><span /> {copy.eyebrow}</p><h1>{copy.title}<br /><em>{copy.emphasis}</em></h1><p>{copy.body}</p></div>
          <div className="queue-meta"><p><Clock3 size={16} /> Evidence refreshed</p><strong>{queue ? formatTimestamp(queue.generated_at) : "Waiting for public queue"}</strong>{queue?.published_at ? <span>Private snapshot {formatTimestamp(queue.published_at)}</span> : null}<button type="button" onClick={() => void refreshAll()} disabled={refreshing}><RefreshCw className={refreshing ? "spin" : ""} size={17} /> Refresh</button></div>
        </section>
        {queue && sourceHealth ? <section className={`source-health source-health--${sourceHealth.level}`} aria-label="Source health"><div><span className="status-light" /><p><strong>{sourceHealth.title}</strong><span>{sourceHealth.message}</span></p></div><p>{sourceCoverage(queue.records)} · {sourceHealth.ageHours === null ? "Age unknown" : `${Math.round(sourceHealth.ageHours)}h old`}</p></section> : null}
        {operatorState.status === "error" ? <div className="notebook-warning" role="status"><CircleAlert size={18} /><span><strong>Operator notebook unavailable.</strong> Research remains visible, but conversion controls are read-only.</span></div> : null}
        <DashboardStats queueCount={currentRecords.length} approvedCount={weeklyApprovedCount} operatorRecords={operatorRecords} />
        {view === "do-next" ? <DoNextView queueRecords={currentRecords} operatorRecords={operatorRecords} onOpen={setSelectedKey} /> : null}
        {view === "research" ? <ResearchView queueState={queueState} queueRecords={currentRecords} operatorRecords={operatorRecords} retry={() => void loadQueue()} onOpen={setSelectedKey} /> : null}
        {view === "pipeline" ? <PipelineView state={operatorState} onCapture={() => setCaptureOpen(true)} onOpen={setSelectedKey} /> : null}
        {view === "money" ? <MoneyView state={operatorState} onOpen={setSelectedKey} /> : null}
        <section className="operating-contract"><div><ShieldCheck size={22} /><span><strong>Dakota operating contract</strong>Public evidence. Private judgment. Manual outreach. Explicit outcomes.</span></div><p>Queue capped at 10 · Exact operator access · No automatic calls, texts, email, forms, or CRM writes</p></section>
      </main>
      {selectedCandidate && selectedQueue ? <OpportunityDrawer key={selectedKey} candidate={selectedCandidate} queue={selectedQueue} record={operatorRecordFor(operatorRecords, selectedCandidate)} recordUpdatedAt={operatorRecords[selectedKey]?.updated_at} milestones={operatorRecords[selectedKey]?.milestones} savedOnly={selectedSavedOnly} notebookAvailable={notebookAvailable} onClose={() => setSelectedKey("")} onSave={saveOperatorRecord} /> : null}
      {captureOpen ? <CaptureOpportunity notebookAvailable={notebookAvailable} onClose={() => setCaptureOpen(false)} onSave={saveOperatorRecord} /> : null}
    </div>
  );
}

export default function AppWorkspace() {
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const resolveSession = useCallback(async () => {
    try {
      const callbackUser = await completeAuthCallback();
      const user = callbackUser ?? await getCurrentUser();
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

  const logout = useCallback(async () => {
    try { await endSession(); } catch { /* The local UI gate still clears after an expired session. */ }
    finally {
      window.history.replaceState({}, "", "/app/");
      setSession({ status: "anonymous" });
    }
  }, []);

  if (session.status !== "authorized") return <AccessScreen state={session} />;
  return <Dashboard email={session.email} onLogout={logout} />;
}
