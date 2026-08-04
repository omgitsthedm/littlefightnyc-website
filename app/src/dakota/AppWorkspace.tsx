import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  dashboardHrefForRecord,
  dashboardHrefForView,
  dashboardRecordKey,
  resolveDashboardLocation,
  type DashboardView,
} from "./dashboardNavigation";
import { OpportunityDrawer } from "./OpportunityDrawer";
import {
  API_OPERATOR_STATE,
  candidateFromOperatorRecord,
  candidateKey,
  countsTowardWeeklyNorthStar,
  getSourceHealth,
  isValidCandidateKey,
  operatorRecordFor,
  sourceCoverage,
} from "./revenue";
import { formatTimestamp } from "./presentation";
import {
  ingressReceiptNeedsAttention,
  nextUnreviewedResearchKey,
  unreviewedResearchKeys,
} from "./revenueBridgeWorkflow";
import {
  assertResearchDispositionCompatible,
  commitResearchReview,
  planResearchPursuitActivation,
  type ResearchPursuitPlan,
} from "./researchActivation";
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
  ArchiveState,
  DakotaArchivePreview,
  DakotaIngressRedriveResponse,
  DakotaOfferCatalogEnvelope,
  DakotaOperationsEnvelope,
  DakotaResearchDisposition,
  DakotaRevenueBridgeEnvelope,
  DakotaRevenueBridgeMutation,
  DakotaRevenueBridgeSaveResponse,
  OfferCatalogState,
  OperationsState,
  QueueEnvelope,
  QueueState,
  RevenueBridgeState,
  SessionState,
} from "./types";

const API_QUEUE = "/api/dakota/queue";
const API_REVENUE_BRIDGE = "/api/dakota/revenue-bridge";
const API_OFFERS = "/api/dakota/offers";
const API_ARCHIVE = "/api/dakota/archive";
const API_OPERATIONS = "/api/dakota/operations";
const API_WEBSITE_AUDIT_OUTBOX = "/api/dakota/website-audit-outbox";
const API_ENRICH = "/api/dakota/enrich";
const CLOCK_TICK_MS = 30_000;
const BACKGROUND_REFRESH_MS = 120_000;

type RefreshScope = "queue" | "operator" | "bridge" | "offers" | "archive" | "operations";

const VIEW_HEADING_IDS: Record<DashboardView, string> = {
  "do-next": "do-next-title",
  research: "research-title",
  pipeline: "pipeline-title",
  money: "money-title",
};

const DASHBOARD_VIEW_ITEMS: ReadonlyArray<{ id: DashboardView; label: string; icon: typeof Target }> = [
  { id: "do-next", label: "Do Next", icon: Target },
  { id: "research", label: "Research", icon: FileSearch },
  { id: "pipeline", label: "Pipeline", icon: TrendingUp },
  { id: "money", label: "Money", icon: BadgeDollarSign },
];

async function responseError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
          <div><ListFilter size={20} /><span><strong>Every ready action</strong>Nothing hidden</span></div>
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

function OperationsBanner({ state, knownKeys, redrivingReceiptId, websiteAuditActionId, actionError, onOpen, onRedrive, onWebsiteAuditAction }: { state: OperationsState; knownKeys: ReadonlySet<string>; redrivingReceiptId: string; websiteAuditActionId: string; actionError: string; onOpen: (key: string) => void; onRedrive: (receiptId: string) => Promise<void>; onWebsiteAuditAction: (entryId: string, action: "redrive" | "acknowledge") => Promise<void> }) {
  if (state.status !== "ready") return null;
  const ingress = state.envelope.ingress;
  const operatorAlerts = state.envelope.operator_alerts;
  const websiteAuditOutbox = state.envelope.website_audit_outbox;
  const blockedReceipts = ingress.receipts.filter(ingressReceiptNeedsAttention);
  const blockedAuditEntries = websiteAuditOutbox.entries.filter((entry) =>
    entry.status === "failed" || entry.next_retry_at !== null
  );
  const capacity = websiteAuditOutbox.capacity;
  const capacityConcern = capacity.active_available <= 50 ||
    capacity.dead_letter_available <= 25 ||
    capacity.overdue_dead_letters > 0 ||
    capacity.state_bytes >= capacity.state_byte_limit * 0.8;
  if (
    !ingress.pending &&
    !ingress.failed &&
    !ingress.invalid &&
    !operatorAlerts.pending &&
    !operatorAlerts.failed &&
    !operatorAlerts.not_configured &&
    !operatorAlerts.invalid &&
    !websiteAuditOutbox.pending &&
    !websiteAuditOutbox.failed &&
    !websiteAuditOutbox.invalid &&
    !capacityConcern
  ) return null;
  return (
    <section className="operations-alert" aria-labelledby="operations-alert-title">
      <div><CircleAlert size={21} /><span><strong id="operations-alert-title">Revenue plumbing needs recovery</strong>Receipts: {ingress.failed} failed · {ingress.invalid} invalid · {ingress.pending} retrying{ingress.oldest_pending_at ? ` · oldest ${formatTimestamp(ingress.oldest_pending_at)}` : ""}<br />Operator wake-ups: {operatorAlerts.pending} retrying · {operatorAlerts.failed} failed · {operatorAlerts.not_configured} not configured · {operatorAlerts.invalid} invalid<br />Website Audit return path: {websiteAuditOutbox.pending} retrying · {websiteAuditOutbox.failed} dead letters · {websiteAuditOutbox.invalid} invalid{websiteAuditOutbox.oldest_pending_at ? ` · oldest ${formatTimestamp(websiteAuditOutbox.oldest_pending_at)}` : ""}<br />Audit capacity: {capacity.active_used}/{capacity.active_limit} active · {capacity.dead_letter_used}/{capacity.dead_letter_limit} retained failures · {Math.round(capacity.state_bytes / 1024)} KB/{Math.round(capacity.state_byte_limit / 1024)} KB{capacity.overdue_dead_letters ? ` · ${capacity.overdue_dead_letters} past the ${capacity.failed_retention_days}-day review deadline` : ""}</span></div>
      {blockedReceipts.length ? <div className="operations-receipts">{blockedReceipts.slice(0, 5).map((receipt) => {
        const canOpen = isValidCandidateKey(receipt.candidate_key) && knownKeys.has(receipt.candidate_key);
        const terminal = receipt.next_retry_at === null && !["stored", "duplicate"].includes(receipt.status);
        const redriving = redrivingReceiptId === receipt.receipt_id;
        return <button key={receipt.receipt_id} type="button" disabled={terminal ? redriving : !canOpen} onClick={() => terminal ? void onRedrive(receipt.receipt_id) : onOpen(receipt.candidate_key)}><span>{receipt.source.replaceAll("_", " ")} · {receipt.status}</span><strong>{redriving ? "Retrying retained receipt…" : receipt.last_error_code || "Awaiting retry"}</strong><small>{terminal ? "Retry the safely retained request now" : canOpen ? `${receipt.attempts} attempt${receipt.attempts === 1 ? "" : "s"} · ${formatTimestamp(receipt.updated_at)}` : "Receipt is not in the active notebook yet"}</small>{terminal ? <RefreshCw className={redriving ? "spin" : ""} size={16} /> : canOpen ? <ArrowUpRight size={16} /> : null}</button>;
      })}</div> : null}
      {blockedAuditEntries.length ? <div className="operations-receipts">{blockedAuditEntries.slice(0, 5).map((entry) => {
        const canOpen = isValidCandidateKey(entry.candidate_key) && knownKeys.has(entry.candidate_key);
        const busy = websiteAuditActionId.endsWith(`:${entry.entry_id}`);
        return <article className="operations-recovery-card" key={entry.entry_id}><button className="operations-recovery-card__open" type="button" disabled={!canOpen} onClick={() => onOpen(entry.candidate_key)}><span>Website Audit · {entry.patch_type.replaceAll("_", " ")}</span><strong>{busy ? "Applying operator action…" : entry.last_error_code || "Awaiting retry"}</strong><small>{entry.status === "failed" ? `Review deadline ${entry.retention_until ? formatTimestamp(entry.retention_until) : "not set"}` : canOpen ? `${entry.attempts} attempt${entry.attempts === 1 ? "" : "s"} · ${formatTimestamp(entry.updated_at)}` : "Audit record is not in the active notebook yet"}</small>{canOpen ? <ArrowUpRight size={16} /> : null}</button>{entry.status === "failed" ? <div className="operations-recovery-card__actions"><button type="button" disabled={busy || !entry.can_redrive} onClick={() => void onWebsiteAuditAction(entry.entry_id, "redrive")}><RefreshCw className={websiteAuditActionId === `redrive:${entry.entry_id}` ? "spin" : ""} size={15} /> Retry now</button><button type="button" disabled={busy || !entry.can_acknowledge} onClick={() => void onWebsiteAuditAction(entry.entry_id, "acknowledge")}><Check size={15} /> Acknowledge &amp; remove copy</button></div> : null}</article>;
      })}</div> : null}
      {actionError ? <p className="operations-action-error" role="alert"><CircleAlert size={15} />{actionError}</p> : null}
      <p><ShieldCheck size={15} /> Receipt, operator-alert, and Website Audit recovery are durable and retried automatically. No prospect message is sent.</p>
    </section>
  );
}

export function Dashboard({ email, onLogout }: { email: string; onLogout: () => Promise<void> }) {
  const [queueState, setQueueState] = useState<QueueState>({ status: "loading" });
  const [operatorState, setOperatorState] = useState<OperatorState>({ status: "loading" });
  const [revenueBridgeState, setRevenueBridgeState] = useState<RevenueBridgeState>({ status: "loading" });
  const [offerCatalogState, setOfferCatalogState] = useState<OfferCatalogState>({ status: "loading" });
  const [archiveState, setArchiveState] = useState<ArchiveState>({ status: "loading" });
  const [operationsState, setOperationsState] = useState<OperationsState>({ status: "loading" });
  const [redrivingReceiptId, setRedrivingReceiptId] = useState("");
  const [websiteAuditActionId, setWebsiteAuditActionId] = useState("");
  const [operationsActionError, setOperationsActionError] = useState("");
  const [view, setView] = useState<DashboardView>(() => resolveDashboardLocation(new URL(window.location.href)).view);
  const [selectedKey, setSelectedKey] = useState(() => {
    const key = dashboardRecordKey(new URL(window.location.href));
    return isValidCandidateKey(key) ? key : "";
  });
  const selectedKeyRef = useRef(selectedKey);
  const [selectedSnapshot, setSelectedSnapshot] = useState<{ key: string; candidate: ReturnType<typeof candidateFromOperatorRecord>; queue: QueueEnvelope } | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshWarning, setRefreshWarning] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const shouldMoveViewFocus = useRef(false);
  const refreshPromise = useRef<Promise<void> | null>(null);
  const hasQueueSnapshot = useRef(false);
  const hasOperatorSnapshot = useRef(false);
  const hasRevenueBridgeSnapshot = useRef(false);
  const hasOfferCatalogSnapshot = useRef(false);
  const hasArchiveSnapshot = useRef(false);
  const hasOperationsSnapshot = useRef(false);
  const refreshErrors = useRef<Partial<Record<RefreshScope, string>>>({});

  const updateRefreshError = useCallback((scope: RefreshScope, message?: string) => {
    if (message) refreshErrors.current[scope] = message;
    else delete refreshErrors.current[scope];
    const errors = Object.values(refreshErrors.current);
    setRefreshWarning(errors.length ? errors.join(" ") : "");
  }, []);

  const loadQueue = useCallback(async (showLoading = true) => {
    if (showLoading) setQueueState({ status: "loading" });
    try {
      const response = await fetch(API_QUEUE, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 204 || response.status === 404) {
        hasQueueSnapshot.current = true;
        updateRefreshError("queue");
        return setQueueState({ status: "empty" });
      }
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the private research queue."));
      const queue = (await response.json()) as QueueEnvelope;
      if (queue.schema_version !== "dakota.queue.v1" || !Array.isArray(queue.records)) throw new Error("The private queue response did not match Dakota’s expected schema.");
      if (queue.records.length > 10) throw new Error("The private queue exceeded Dakota’s ten-record safety cap and was not displayed.");
      hasQueueSnapshot.current = true;
      updateRefreshError("queue");
      const selectedCandidate = queue.records.find((candidate) => candidateKey(candidate) === selectedKeyRef.current);
      if (selectedCandidate) setSelectedSnapshot({ key: selectedKeyRef.current, candidate: selectedCandidate, queue });
      setQueueState(queue.records.length ? { status: "ready", queue } : { status: "empty" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dakota could not load the private research queue.";
      if (!showLoading && hasQueueSnapshot.current) updateRefreshError("queue", `Research refresh failed: ${message}`);
      else setQueueState({ status: "error", message });
    }
  }, [onLogout, updateRefreshError]);

  const loadOperatorState = useCallback(async (showLoading = true) => {
    if (showLoading) setOperatorState({ status: "loading" });
    try {
      const response = await fetch(API_OPERATOR_STATE, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the private operator notebook."));
      const envelope = (await response.json()) as OperatorStateEnvelope;
      if (envelope.schema_version !== "dakota.operator-state.v3" || !envelope.records || typeof envelope.records !== "object" || Array.isArray(envelope.records)) throw new Error("The operator-state response did not match Dakota’s expected v3 schema.");
      hasOperatorSnapshot.current = true;
      updateRefreshError("operator");
      setOperatorState({ status: "ready", envelope });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dakota could not load the private operator notebook.";
      if (!showLoading && hasOperatorSnapshot.current) updateRefreshError("operator", `Notebook refresh failed: ${message}`);
      else setOperatorState({ status: "error", message });
    }
  }, [onLogout, updateRefreshError]);

  const loadRevenueBridge = useCallback(async (showLoading = true) => {
    if (showLoading) setRevenueBridgeState({ status: "loading" });
    try {
      const response = await fetch(API_REVENUE_BRIDGE, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the Revenue Bridge."));
      const envelope = (await response.json()) as DakotaRevenueBridgeEnvelope;
      if (envelope.schema_version !== "dakota.revenue-bridge.v1" || !isObject(envelope.records) || !isObject(envelope.providers)) throw new Error("The Revenue Bridge response did not match Dakota’s expected schema.");
      hasRevenueBridgeSnapshot.current = true;
      updateRefreshError("bridge");
      setRevenueBridgeState({ status: "ready", envelope });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dakota could not load the Revenue Bridge.";
      if (!showLoading && hasRevenueBridgeSnapshot.current) updateRefreshError("bridge", `Revenue Bridge refresh failed: ${message}`);
      else setRevenueBridgeState({ status: "error", message });
    }
  }, [onLogout, updateRefreshError]);

  const loadOfferCatalog = useCallback(async (showLoading = true) => {
    if (showLoading) setOfferCatalogState({ status: "loading" });
    try {
      const response = await fetch(API_OFFERS, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load the private offer catalog."));
      const envelope = (await response.json()) as DakotaOfferCatalogEnvelope;
      if (envelope.schema_version !== "dakota.offer-catalog.v1" || !Array.isArray(envelope.offers)) throw new Error("The private offer catalog did not match Dakota’s expected schema.");
      hasOfferCatalogSnapshot.current = true;
      updateRefreshError("offers");
      setOfferCatalogState({ status: "ready", envelope });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dakota could not load the private offer catalog.";
      if (!showLoading && hasOfferCatalogSnapshot.current) updateRefreshError("offers", `Offer catalog refresh failed: ${message}`);
      else setOfferCatalogState({ status: "error", message });
    }
  }, [onLogout, updateRefreshError]);

  const loadArchivePreview = useCallback(async (showLoading = true) => {
    if (showLoading) setArchiveState({ status: "loading" });
    try {
      const response = await fetch(API_ARCHIVE, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load archive readiness."));
      const preview = (await response.json()) as DakotaArchivePreview;
      if (preview.schema_version !== "dakota.archive-preview.v1" || !Array.isArray(preview.eligible) || !Array.isArray(preview.recoverable)) throw new Error("The archive preview did not match Dakota’s expected schema.");
      hasArchiveSnapshot.current = true;
      updateRefreshError("archive");
      setArchiveState({ status: "ready", preview });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dakota could not load archive readiness.";
      if (!showLoading && hasArchiveSnapshot.current) updateRefreshError("archive", `Archive refresh failed: ${message}`);
      else setArchiveState({ status: "error", message });
    }
  }, [onLogout, updateRefreshError]);

  const loadOperations = useCallback(async (showLoading = true) => {
    if (showLoading) setOperationsState({ status: "loading" });
    try {
      const response = await fetch(API_OPERATIONS, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) return void await onLogout();
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not load inbound operations."));
      const envelope = (await response.json()) as DakotaOperationsEnvelope;
      if (envelope.schema_version !== "dakota.operations.v1" || !isObject(envelope.ingress) || !Array.isArray(envelope.ingress.receipts) || !isObject(envelope.operator_alerts) || !Array.isArray(envelope.operator_alerts.alerts) || !isObject(envelope.website_audit_outbox) || !Array.isArray(envelope.website_audit_outbox.entries)) throw new Error("The operations response did not match Dakota’s expected schema.");
      hasOperationsSnapshot.current = true;
      updateRefreshError("operations");
      setOperationsState({ status: "ready", envelope });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dakota could not load inbound operations.";
      if (!showLoading && hasOperationsSnapshot.current) updateRefreshError("operations", `Operations refresh failed: ${message}`);
      else setOperationsState({ status: "error", message });
    }
  }, [onLogout, updateRefreshError]);

  const redriveIngressReceipt = useCallback(async (receiptId: string) => {
    if (redrivingReceiptId) return;
    setRedrivingReceiptId(receiptId);
    setOperationsActionError("");
    try {
      const response = await fetch(API_OPERATIONS, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redrive_ingress_receipt", receipt_id: receiptId }),
        cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        await onLogout();
        throw new Error("Your secure session expired. Sign in again before retrying this receipt.");
      }
      if (!response.ok) throw new Error(await responseError(response, "Dakota could not retry that retained receipt."));
      const result = (await response.json()) as DakotaIngressRedriveResponse;
      if (result.schema_version !== "dakota.ingress-redrive.v1" || result.receipt_id !== receiptId) {
        throw new Error("Dakota returned an unexpected receipt-retry response.");
      }
      await Promise.allSettled([loadOperations(false), loadOperatorState(false)]);
    } catch (error) {
      setOperationsActionError(error instanceof Error ? error.message : "Dakota could not retry that retained receipt.");
    } finally {
      setRedrivingReceiptId("");
    }
  }, [loadOperations, loadOperatorState, onLogout, redrivingReceiptId]);

  const operateWebsiteAuditOutbox = useCallback(async (
    entryId: string,
    action: "redrive" | "acknowledge",
  ) => {
    if (websiteAuditActionId) return;
    if (
      action === "acknowledge" &&
      !window.confirm("Acknowledge this failed Website Audit fact and remove its retained recovery copy? This cannot be undone from Dakota.")
    ) return;
    setWebsiteAuditActionId(`${action}:${entryId}`);
    setOperationsActionError("");
    try {
      const response = await fetch(API_WEBSITE_AUDIT_OUTBOX, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ action, entry_id: entryId }),
        cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        await onLogout();
        throw new Error("Your secure session expired. Sign in again before recovering Website Audit facts.");
      }
      if (!response.ok) {
        throw new Error(await responseError(
          response,
          action === "redrive"
            ? "Dakota could not retry that Website Audit fact."
            : "Dakota could not acknowledge that Website Audit failure.",
        ));
      }
      const body = (await response.json()) as {
        schema_version?: string;
        result?: { entry_id?: string; outcome?: string };
      };
      if (
        body.schema_version !== "dakota.website-audit-outbox-operation.v1" ||
        body.result?.entry_id !== entryId
      ) {
        throw new Error("Dakota returned an unexpected Website Audit recovery response.");
      }
      await Promise.allSettled([loadOperations(false), loadRevenueBridge(false)]);
    } catch (error) {
      setOperationsActionError(error instanceof Error
        ? error.message
        : "Dakota could not complete that Website Audit recovery action.");
    } finally {
      setWebsiteAuditActionId("");
    }
  }, [loadOperations, loadRevenueBridge, onLogout, websiteAuditActionId]);

  useEffect(() => {
    queueMicrotask(() => void Promise.allSettled([
      loadQueue(false),
      loadOperatorState(false),
      loadRevenueBridge(false),
      loadOfferCatalog(false),
      loadArchivePreview(false),
      loadOperations(false),
    ]));
  }, [loadArchivePreview, loadOfferCatalog, loadOperations, loadOperatorState, loadQueue, loadRevenueBridge]);

  useEffect(() => {
    const currentLocation = resolveDashboardLocation(new URL(window.location.href));
    const currentRecordKey = dashboardRecordKey(new URL(window.location.href));
    if (currentLocation.shouldReplace || (currentRecordKey && !isValidCandidateKey(currentRecordKey))) {
      const canonicalUrl = new URL(currentLocation.href, window.location.origin);
      const canonicalHref = currentRecordKey && !isValidCandidateKey(currentRecordKey) ? dashboardHrefForRecord(canonicalUrl, null) : currentLocation.href;
      window.history.replaceState(window.history.state, "", canonicalHref);
    }

    const syncViewFromHistory = () => {
      const nextLocation = resolveDashboardLocation(new URL(window.location.href));
      if (nextLocation.shouldReplace) {
        window.history.replaceState(window.history.state, "", nextLocation.href);
      }
      const recordKey = dashboardRecordKey(new URL(window.location.href));
      const nextRecordKey = isValidCandidateKey(recordKey) ? recordKey : "";
      selectedKeyRef.current = nextRecordKey;
      setSelectedKey(nextRecordKey);
      if (nextLocation.view !== view) {
        shouldMoveViewFocus.current = true;
        setView(nextLocation.view);
      }
    };

    window.addEventListener("popstate", syncViewFromHistory);
    return () => window.removeEventListener("popstate", syncViewFromHistory);
  }, [view]);

  useEffect(() => {
    if (!shouldMoveViewFocus.current) return;

    const frame = window.requestAnimationFrame(() => {
      if (!shouldMoveViewFocus.current) return;
      shouldMoveViewFocus.current = false;
      const heading = document.getElementById(VIEW_HEADING_IDS[view]);
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true;
      heading.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [view]);

  const refreshAll = useCallback(async (showSpinner = true) => {
    if (refreshPromise.current) return refreshPromise.current;
    if (showSpinner) setRefreshing(true);
    const refresh = Promise.allSettled([
      loadQueue(false),
      loadOperatorState(false),
      loadRevenueBridge(false),
      loadOfferCatalog(false),
      loadArchivePreview(false),
      loadOperations(false),
    ]).then(() => undefined);
    refreshPromise.current = refresh;
    try {
      await refresh;
      setClock(Date.now());
    } finally {
      refreshPromise.current = null;
      if (showSpinner) setRefreshing(false);
    }
  }, [loadArchivePreview, loadOfferCatalog, loadOperations, loadOperatorState, loadQueue, loadRevenueBridge]);

  useEffect(() => {
    const tick = () => setClock(Date.now());
    const refreshWhenVisible = () => {
      if (document.visibilityState !== "visible") return;
      tick();
      void refreshAll(false);
    };
    const clockTimer = window.setInterval(tick, CLOCK_TICK_MS);
    const refreshTimer = window.setInterval(refreshWhenVisible, BACKGROUND_REFRESH_MS);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(clockTimer);
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshAll]);

  const saveOperatorRecord = useCallback(async (key: string, record: OperatorRecordInput, expectedUpdatedAt: string | null) => {
    const response = await fetch(API_OPERATOR_STATE, {
      method: "PUT",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_key: key, expected_updated_at: expectedUpdatedAt, record }),
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      await onLogout();
      throw new Error("Your secure session expired. Sign in again before saving operator state.");
    }
    if (!response.ok) throw new Error(await responseError(response, "Dakota could not save the private operator record."));
    const result = (await response.json()) as OperatorStateSaveResponse;
    if (result.schema_version !== "dakota.operator-state.v3" || result.candidate_key !== key || !result.record?.updated_at) throw new Error("Dakota saved an unexpected operator-state response.");
    setOperatorState((current) => {
      const records = current.status === "ready" ? current.envelope.records : {};
      return { status: "ready", envelope: { schema_version: "dakota.operator-state.v3", updated_at: result.updated_at, records: { ...records, [key]: result.record } } };
    });
    return result.record.updated_at;
  }, [onLogout]);

  const mutateRevenueBridge = useCallback(async (key: string, mutation: DakotaRevenueBridgeMutation) => {
    if (revenueBridgeState.status !== "ready") throw new Error("Revenue Bridge is unavailable. Refresh Dakota before saving this review.");
    const expectedUpdatedAt = revenueBridgeState.envelope.records[key]?.updated_at ?? null;
    const response = await fetch(API_REVENUE_BRIDGE, {
      method: "PUT",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_key: key, expected_updated_at: expectedUpdatedAt, mutation }),
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      await onLogout();
      throw new Error("Your secure session expired. Sign in again before saving Revenue Bridge state.");
    }
    if (!response.ok) throw new Error(await responseError(response, "Dakota could not save the Revenue Bridge review."));
    const result = (await response.json()) as DakotaRevenueBridgeSaveResponse;
    if (result.schema_version !== "dakota.revenue-bridge.v1" || result.candidate_key !== key || !result.record?.updated_at) throw new Error("Dakota saved an unexpected Revenue Bridge response.");
    setRevenueBridgeState((current) => {
      const envelope = current.status === "ready" ? current.envelope : revenueBridgeState.envelope;
      return { status: "ready", envelope: { ...envelope, updated_at: result.updated_at, records: { ...envelope.records, [key]: result.record } } };
    });
  }, [onLogout, revenueBridgeState]);

  const enrichCandidate = useCallback(async (key: string) => {
    const response = await fetch(API_ENRICH, {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_key: key }),
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      await onLogout();
      throw new Error("Your secure session expired. Sign in again before refreshing provider evidence.");
    }
    if (!response.ok) throw new Error(await responseError(response, "Dakota could not refresh Google Places and Yelp evidence."));
    const result = (await response.json()) as { schema_version?: string; candidate_key?: string };
    if (result.schema_version !== "dakota.enrichment.v1" || result.candidate_key !== key) throw new Error("Dakota received an unexpected enrichment response.");
    await loadRevenueBridge(false);
  }, [loadRevenueBridge, onLogout]);

  const queue = queueState.status === "ready" ? queueState.queue : null;
  const operatorRecords = useMemo<Record<string, OperatorRecord>>(() => operatorState.status === "ready" ? operatorState.envelope.records : {}, [operatorState]);
  const revenueBridge = revenueBridgeState.status === "ready" ? revenueBridgeState.envelope : null;
  const privateOffers = offerCatalogState.status === "ready" ? offerCatalogState.envelope.offers : [];
  const currentRecords = useMemo(() => queue?.records ?? [], [queue]);
  const knownRecordKeys = useMemo(() => new Set([...currentRecords.map(candidateKey), ...Object.keys(operatorRecords)]), [currentRecords, operatorRecords]);
  const selectedRecord = operatorRecords[selectedKey];
  const selectedQueueCandidate = useMemo(() => currentRecords.find((candidate) => candidateKey(candidate) === selectedKey) ?? null, [currentRecords, selectedKey]);
  const selectedSavedCandidate = useMemo(() => selectedRecord ? candidateFromOperatorRecord(selectedKey, selectedRecord) : null, [selectedKey, selectedRecord]);
  const selectedFallback = selectedSnapshot?.key === selectedKey ? selectedSnapshot : null;
  const selectedCandidate = selectedQueueCandidate ?? selectedSavedCandidate ?? selectedFallback?.candidate ?? null;
  const selectedSavedOnly = !selectedQueueCandidate && Boolean(selectedSavedCandidate);
  const selectedSavedQueue = useMemo<QueueEnvelope | null>(() => selectedSavedCandidate && selectedRecord ? { schema_version: "dakota.queue.v1", generated_at: selectedRecord.updated_at, published_at: selectedRecord.updated_at, records: [selectedSavedCandidate] } : null, [selectedRecord, selectedSavedCandidate]);
  const selectedQueue = selectedQueueCandidate && queue ? queue : selectedSavedQueue ?? selectedFallback?.queue ?? null;
  const selectedRevenueBridgeRecord = revenueBridge?.records[selectedKey];
  const unreviewedQueueKeys = useMemo(() => unreviewedResearchKeys(currentRecords, revenueBridge?.records), [currentRecords, revenueBridge]);
  const hasNextUnreviewed = unreviewedQueueKeys.some((key) => key !== selectedKey);
  const sourceHealth = queue ? getSourceHealth(queue.generated_at) : null;
  const weeklyApprovedCount = Object.values(operatorRecords).filter((record) => countsTowardWeeklyNorthStar(record)).length;
  const notebookAvailable = operatorState.status === "ready";
  const copy = VIEW_COPY[view];
  const now = useMemo(() => new Date(clock), [clock]);

  const changeView = (nextView: DashboardView) => {
    if (nextView === view) return;
    const nextHref = dashboardHrefForView(new URL(window.location.href), nextView);
    window.history.pushState(window.history.state, "", nextHref);
    shouldMoveViewFocus.current = true;
    setView(nextView);
  };

  const openRecord = (key: string) => {
    if (!isValidCandidateKey(key)) return;
    if (key !== selectedKey) window.history.pushState(window.history.state, "", dashboardHrefForRecord(new URL(window.location.href), key));
    selectedKeyRef.current = key;
    const candidate = currentRecords.find((current) => candidateKey(current) === key);
    if (candidate && queue) setSelectedSnapshot({ key, candidate, queue });
    setSelectedKey(key);
  };

  const reviewResearch = async (
    disposition: Exclude<DakotaResearchDisposition, "unreviewed">,
    reason: string,
    openNext: boolean,
  ) => {
    if (!selectedKey) throw new Error("Open a valid Dakota record before saving research review.");
    const reviewedKey = selectedKey;
    assertResearchDispositionCompatible(disposition, operatorRecords[reviewedKey]);
    let plan: ResearchPursuitPlan | null = null;
    if (disposition === "pursue") {
      if (!selectedCandidate || candidateKey(selectedCandidate) !== reviewedKey) throw new Error("The current research signal is unavailable. Refresh Dakota before marking it pursue.");
      plan = planResearchPursuitActivation(
        selectedCandidate,
        operatorRecords[reviewedKey],
        new Date(),
        crypto.randomUUID().toLowerCase(),
      );
    }
    await commitResearchReview(
      disposition,
      plan,
      async (record, expectedUpdatedAt) => { await saveOperatorRecord(reviewedKey, record, expectedUpdatedAt); },
      async () => { await mutateRevenueBridge(reviewedKey, { type: "review_research", disposition, reason }); },
    );
    if (!openNext) return;
    const nextKey = nextUnreviewedResearchKey(currentRecords, revenueBridge?.records, reviewedKey);
    if (nextKey) openRecord(nextKey);
  };

  const archiveRecord = async (key: string) => {
    const record = operatorRecords[key];
    if (!record) throw new Error("The active record was not found. Refresh Dakota before archiving.");
    if (!window.confirm(`Archive ${record.identity.dba || record.identity.businessName}? This removes it from the active notebook but keeps a recoverable verified copy.`)) return;
    const response = await fetch(API_ARCHIVE, {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive", candidate_key: key, expected_updated_at: record.updated_at }),
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      await onLogout();
      throw new Error("Your secure session expired. Sign in again before archiving.");
    }
    if (!response.ok) throw new Error(await responseError(response, "Dakota could not archive this record."));
    if (selectedKey === key) closeRecord();
    await Promise.allSettled([loadOperatorState(false), loadArchivePreview(false), loadRevenueBridge(false)]);
  };

  const restoreRecord = async (archiveId: string) => {
    const response = await fetch(API_ARCHIVE, {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", archive_id: archiveId }),
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      await onLogout();
      throw new Error("Your secure session expired. Sign in again before restoring this record.");
    }
    if (!response.ok) throw new Error(await responseError(response, "Dakota could not restore this archived record."));
    await Promise.allSettled([loadOperatorState(false), loadArchivePreview(false), loadRevenueBridge(false)]);
  };

  const closeRecord = () => {
    window.history.replaceState(window.history.state, "", dashboardHrefForRecord(new URL(window.location.href), null));
    selectedKeyRef.current = "";
    setSelectedKey("");
    setSelectedSnapshot(null);
  };

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#dakota-main">Skip to Dakota workspace</a>
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/app/" aria-label="Dakota home"><DakotaGlyph compact /><span><strong>Dakota</strong><small>Conversion cockpit</small></span></a>
        <nav className="dashboard-nav" aria-label="Dakota workspace">{DASHBOARD_VIEW_ITEMS.map(({ id, label, icon: Icon }) => <a key={id} href={dashboardHrefForView(new URL(window.location.href), id)} className={view === id ? "is-active" : ""} aria-current={view === id ? "page" : undefined} onClick={(event) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); changeView(id); }}><Icon size={17} />{label}</a>)}</nav>
        <div className="operator-menu"><span><small>Signed in</small><strong>{email}</strong></span><button type="button" onClick={() => void onLogout()} aria-label="Sign out"><LogOut size={18} /></button></div>
      </header>
      <main className="dashboard-main" id="dakota-main">
        <section className="dashboard-intro dashboard-intro--compact">
          <div><p className="eyebrow"><span /> {copy.eyebrow}</p><h1>{copy.title}<br /><em>{copy.emphasis}</em></h1><p>{copy.body}</p></div>
          <div className="queue-meta"><p><Clock3 size={16} /> Evidence refreshed</p><strong>{queue ? formatTimestamp(queue.generated_at) : "Waiting for public queue"}</strong>{queue?.published_at ? <span>Private snapshot {formatTimestamp(queue.published_at)}</span> : null}<button type="button" onClick={() => void refreshAll()} disabled={refreshing}><RefreshCw className={refreshing ? "spin" : ""} size={17} /> Refresh</button></div>
        </section>
        {queue && sourceHealth ? <section className={`source-health source-health--${sourceHealth.level}`} aria-label="Source health"><div><span className="status-light" /><p><strong>{sourceHealth.title}</strong><span>{sourceHealth.message}</span></p></div><p>{sourceCoverage(queue.records)} · {sourceHealth.ageHours === null ? "Age unknown" : `${Math.round(sourceHealth.ageHours)}h old`}</p></section> : null}
        <OperationsBanner state={operationsState} knownKeys={knownRecordKeys} redrivingReceiptId={redrivingReceiptId} websiteAuditActionId={websiteAuditActionId} actionError={operationsActionError} onOpen={openRecord} onRedrive={redriveIngressReceipt} onWebsiteAuditAction={operateWebsiteAuditOutbox} />
        {operatorState.status === "error" ? <div className="notebook-warning" role="status"><CircleAlert size={18} /><span><strong>Operator notebook unavailable.</strong> Research remains visible, but conversion controls are read-only.</span></div> : null}
        {refreshWarning ? <div className="notebook-warning" role="status"><CircleAlert size={18} /><span><strong>Latest refresh did not complete.</strong> Your last verified snapshot and any open edits remain in place. {refreshWarning}</span></div> : null}
        <DashboardStats queueCount={currentRecords.length} approvedCount={weeklyApprovedCount} operatorRecords={operatorRecords} now={now} />
        {view === "do-next" ? <DoNextView queueRecords={currentRecords} operatorRecords={operatorRecords} revenueBridge={revenueBridge} now={now} onOpen={openRecord} /> : null}
        {view === "research" ? <ResearchView queueState={queueState} queueRecords={currentRecords} operatorRecords={operatorRecords} revenueBridge={revenueBridge} retry={() => void loadQueue()} onOpen={openRecord} /> : null}
        {view === "pipeline" ? <PipelineView state={operatorState} now={now} onCapture={() => setCaptureOpen(true)} onOpen={openRecord} /> : null}
        {view === "money" ? <MoneyView state={operatorState} queueRecords={currentRecords} revenueBridgeState={revenueBridgeState} offerCatalogState={offerCatalogState} archiveState={archiveState} operationsState={operationsState} onOpen={openRecord} onArchive={archiveRecord} onRestore={restoreRecord} /> : null}
        <section className="operating-contract"><div><ShieldCheck size={22} /><span><strong>Dakota operating contract</strong>Public evidence. Private judgment. Manual outreach. Explicit outcomes.</span></div><p>Queue capped at 10 · Exact operator access · No automatic calls, texts, email, forms, or CRM writes</p></section>
      </main>
      {selectedCandidate && selectedQueue ? <OpportunityDrawer key={selectedKey} candidate={selectedCandidate} queue={selectedQueue} record={operatorRecordFor(operatorRecords, selectedCandidate)} recordUpdatedAt={operatorRecords[selectedKey]?.updated_at} milestones={operatorRecords[selectedKey]?.milestones} savedOnly={selectedSavedOnly} notebookAvailable={notebookAvailable} revenueBridgeRecord={selectedRevenueBridgeRecord} revenueBridgeLoading={revenueBridgeState.status === "loading"} revenueBridgeError={revenueBridgeState.status === "error" ? revenueBridgeState.message : undefined} privateOffers={privateOffers} privateOffersError={offerCatalogState.status === "error" ? offerCatalogState.message : undefined} hasNextUnreviewed={hasNextUnreviewed} onClose={closeRecord} onSave={saveOperatorRecord} onRevenueBridgeMutate={(mutation) => mutateRevenueBridge(selectedKey, mutation)} onReviewResearch={reviewResearch} onEnrich={() => enrichCandidate(selectedKey)} /> : null}
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
