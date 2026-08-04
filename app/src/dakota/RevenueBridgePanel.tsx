import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleAlert,
  ExternalLink,
  FileSearch,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { formatTimestamp } from "./presentation";
import type {
  DakotaPrivateOffer,
  DakotaResearchDisposition,
  DakotaRevenueBridgeMutation,
  DakotaRevenueBridgeRecord,
} from "./types";

const REVIEW_DISPOSITIONS: ReadonlyArray<{
  value: Exclude<DakotaResearchDisposition, "unreviewed">;
  label: string;
}> = [
  { value: "pursue", label: "Pursue — evidence supports a human next step" },
  { value: "hold", label: "Hold — potentially useful, not ready" },
  { value: "needs_evidence", label: "Needs evidence — verify another fact" },
  { value: "blocked", label: "Blocked — a named gate prevents review" },
  { value: "duplicate", label: "Duplicate — already represented elsewhere" },
  { value: "not_fit", label: "Not a fit — close the research signal" },
  { value: "do_not_contact", label: "Do not contact — preserve the boundary" },
];

function providerLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/gu, (letter) => letter.toUpperCase());
}

function privatePrice(offer: DakotaPrivateOffer): string {
  const money = (value: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
  if (offer.minAmount === null || offer.maxAmount === null) return "Scoped privately";
  const amount = offer.minAmount === offer.maxAmount
    ? money(offer.minAmount)
    : `${money(offer.minAmount)}–${money(offer.maxAmount)}`;
  return offer.cadence === "monthly" ? `${amount} / month` : amount;
}

function ReviewActions({
  id,
  note,
  busy,
  onNote,
  onDecision,
}: {
  id: string;
  note: string;
  busy: boolean;
  onNote: (value: string) => void;
  onDecision: (decision: "confirmed" | "rejected") => Promise<void>;
}) {
  return (
    <div className="bridge-review-actions">
      <label htmlFor={`bridge-review-${id}`}><span>Review reason</span><input id={`bridge-review-${id}`} value={note} maxLength={1000} onChange={(event) => onNote(event.target.value)} placeholder="What did you verify?" /></label>
      <div>
        <button type="button" className="secondary-button" disabled={busy || !note.trim()} onClick={() => void onDecision("rejected")}><X size={16} /> Reject</button>
        <button type="button" className="primary-button" disabled={busy || !note.trim()} onClick={() => void onDecision("confirmed")}>{busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />} Confirm</button>
      </div>
    </div>
  );
}

export function RevenueBridgePanel({
  record,
  loading,
  unavailableMessage,
  offers,
  offerError,
  hasNextUnreviewed,
  onMutate,
  onReviewResearch,
  onEnrich,
}: {
  record?: DakotaRevenueBridgeRecord;
  loading: boolean;
  unavailableMessage?: string;
  offers: DakotaPrivateOffer[];
  offerError?: string;
  hasNextUnreviewed: boolean;
  onMutate: (mutation: DakotaRevenueBridgeMutation) => Promise<void>;
  onReviewResearch: (disposition: Exclude<DakotaResearchDisposition, "unreviewed">, reason: string, openNext: boolean) => Promise<void>;
  onEnrich: () => Promise<void>;
}) {
  const [disposition, setDisposition] = useState<Exclude<DakotaResearchDisposition, "unreviewed"> | "">(
    record?.research_review.disposition && record.research_review.disposition !== "unreviewed"
      ? record.research_review.disposition
      : "",
  );
  const [researchReason, setResearchReason] = useState(record?.research_review.reason ?? "");
  const [researchTouched, setResearchTouched] = useState(Boolean(record));
  const [offerId, setOfferId] = useState("");
  const [offerRationale, setOfferRationale] = useState(record?.selected_offer?.rationale ?? "");
  const [offerTouched, setOfferTouched] = useState(Boolean(record));
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentOffer = useMemo(
    () => offers.find((offer) => offer.offerId === offerId)
      ?? offers.find((offer) => offer.bridgeOfferCode === record?.selected_offer?.offer_code && offer.bridgePriceBand === record?.selected_offer?.price_band)
      ?? null,
    [offerId, offers, record?.selected_offer?.offer_code, record?.selected_offer?.price_band],
  );
  const effectiveDisposition = disposition || (record?.research_review.disposition !== "unreviewed" ? record?.research_review.disposition : "") || "";
  const effectiveResearchReason = researchTouched ? researchReason : record?.research_review.reason ?? "";
  const effectiveOfferId = offerId || currentOffer?.offerId || "";
  const effectiveOfferRationale = offerTouched ? offerRationale : record?.selected_offer?.rationale ?? "";

  const run = async (name: string, action: () => Promise<void>, success: string) => {
    setBusy(name);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dakota could not save this Revenue Bridge review.");
    } finally {
      setBusy("");
    }
  };

  const reviewItem = async (kind: "evidence" | "event", id: string, decision: "confirmed" | "rejected") => {
    const reason = notes[id]?.trim() ?? "";
    if (!reason) return;
    await run(`${kind}:${id}`, () => onMutate(kind === "evidence"
      ? { type: "review_evidence", evidence_id: id, decision, reason }
      : { type: "review_external_event", event_id: id, decision, reason }), `${kind === "evidence" ? "Evidence" : "External event"} ${decision}. Core stage unchanged.`);
  };

  const saveResearch = (openNext: boolean) => {
    const reason = effectiveResearchReason.trim();
    if (!effectiveDisposition || !reason) return;
    void run(openNext ? "research-next" : "research", () => onReviewResearch(effectiveDisposition, reason, openNext), openNext ? "Review saved. Opening the next unreviewed signal." : "Research review saved. Core stage unchanged.");
  };

  if (loading && !record) return <section className="revenue-bridge-panel revenue-bridge-panel--loading" aria-label="Revenue Bridge"><LoaderCircle className="spin" size={22} /><span>Loading Revenue Bridge…</span></section>;
  if (unavailableMessage && !record) return <section className="revenue-bridge-panel revenue-bridge-panel--unavailable" aria-label="Revenue Bridge"><CircleAlert size={20} /><div><strong>Revenue Bridge unavailable</strong><p>{unavailableMessage} The core dossier remains available and unchanged.</p></div></section>;

  const audit = record?.website_audit;
  const openAlerts = record?.alerts.filter((alert) => alert.status !== "resolved") ?? [];
  const suggestedEvidence = record?.evidence.filter((item) => item.review_state === "suggested") ?? [];
  const pendingEvents = record?.external_events.filter((event) => event.review_state === "needs_review") ?? [];

  return (
    <section className="revenue-bridge-panel" aria-labelledby="revenue-bridge-title">
      <header className="revenue-bridge-panel__header">
        <div><p className="eyebrow"><span /> Revenue Bridge</p><h3 id="revenue-bridge-title">Turn outside signals into reviewed next steps</h3><p>Google, Yelp, inbox, calendar, and audit facts land here as evidence. Nothing here contacts a prospect or advances the core stage.</p></div>
        <div className="bridge-live-state"><span className="status-light" /><strong>{record ? "Private record connected" : "Ready for first review"}</strong><small>{record ? `Reconciled ${formatTimestamp(record.updated_at)}` : "No bridge facts saved yet"}</small></div>
      </header>

      {openAlerts.length ? <section className="bridge-alerts" aria-labelledby="bridge-alerts-title"><div className="bridge-section-title"><AlertTriangle size={18} /><div><p className="eyebrow">Wake-up queue</p><h4 id="bridge-alerts-title">{openAlerts.length} alert{openAlerts.length === 1 ? "" : "s"} needs an operator</h4></div></div>{openAlerts.map((alert) => <article key={alert.alert_id} className={`bridge-alert bridge-alert--${alert.severity}`}><div><span>{providerLabel(alert.provider)} · {alert.severity}</span><strong>{alert.message}</strong><small>{formatTimestamp(alert.created_at)} · {alert.status}</small></div>{alert.status !== "resolved" ? <div className="bridge-inline-review"><input aria-label={`Note for ${alert.message}`} maxLength={1000} value={notes[alert.alert_id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [alert.alert_id]: event.target.value }))} placeholder="What did you verify or resolve?" /><button type="button" className="secondary-button" disabled={busy === `alert:${alert.alert_id}` || !(notes[alert.alert_id] ?? "").trim()} onClick={() => void run(`alert:${alert.alert_id}`, () => onMutate({ type: alert.status === "open" ? "acknowledge_alert" : "resolve_alert", alert_id: alert.alert_id, note: notes[alert.alert_id].trim() }), alert.status === "open" ? "Alert acknowledged." : "Alert resolved.")}>{busy === `alert:${alert.alert_id}` ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}{alert.status === "open" ? "Acknowledge" : "Resolve"}</button></div> : null}</article>)}</section> : null}

      <div className="bridge-panel-grid">
        <section className="bridge-card bridge-card--decision" aria-labelledby="bridge-decision-title">
          <div className="bridge-section-title"><ShieldCheck size={18} /><div><p className="eyebrow">Durable disposition</p><h4 id="bridge-decision-title">Review this signal once, with a reason</h4></div></div>
          <label><span>Research decision</span><select value={effectiveDisposition} onChange={(event) => setDisposition(event.target.value as typeof disposition)}><option value="" disabled>Choose a disposition…</option>{REVIEW_DISPOSITIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span>Required reason</span><textarea value={effectiveResearchReason} maxLength={1000} rows={3} onChange={(event) => { setResearchTouched(true); setResearchReason(event.target.value); }} placeholder="Name the evidence, duplicate, fit issue, or blocking gate…" /></label>
          <div className="bridge-action-row"><button type="button" className="secondary-button" disabled={Boolean(busy) || !effectiveDisposition || !effectiveResearchReason.trim()} onClick={() => saveResearch(false)}>{busy === "research" ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />} Save review</button><button type="button" className="primary-button" disabled={Boolean(busy) || !effectiveDisposition || !effectiveResearchReason.trim() || !hasNextUnreviewed} onClick={() => saveResearch(true)}>{busy === "research-next" ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />} Save &amp; open next</button></div>
          {!hasNextUnreviewed ? <p className="bridge-fine-print">This is the final unreviewed signal in the current queue.</p> : null}
        </section>

        <section className="bridge-card" aria-labelledby="bridge-enrichment-title">
          <div className="bridge-section-title"><FileSearch size={18} /><div><p className="eyebrow">Structured enrichment</p><h4 id="bridge-enrichment-title">Google Places + Yelp suggestions</h4></div></div>
          <p>Refresh matched public profiles as review-only suggestions. A provider match is never buyer intent, contact consent, or qualification.</p>
          <button type="button" className="secondary-button" disabled={Boolean(busy)} onClick={() => void run("enrich", onEnrich, "Provider refresh complete. Review every new suggestion below.")}>{busy === "enrich" ? <LoaderCircle className="spin" size={16} /> : <RefreshCw size={16} />} Refresh public evidence</button>
          <dl className="bridge-compact-stats"><div><dt>Suggested</dt><dd>{suggestedEvidence.length}</dd></div><div><dt>Confirmed</dt><dd>{record?.evidence.filter((item) => item.review_state === "confirmed").length ?? 0}</dd></div><div><dt>Rejected</dt><dd>{record?.evidence.filter((item) => item.review_state === "rejected").length ?? 0}</dd></div></dl>
        </section>
      </div>

      {record?.evidence.length ? <details className="bridge-review-list" open={suggestedEvidence.length > 0}><summary><span>Provider evidence</span><strong>{suggestedEvidence.length} needs review</strong></summary><div>{record.evidence.map((item) => <article key={item.evidence_id}><header><span className={`bridge-review-state bridge-review-state--${item.review_state}`}>{item.review_state}</span><strong>{providerLabel(item.provider)} · {providerLabel(item.kind)}</strong><time>{formatTimestamp(item.observed_at)}</time></header><p>{item.summary}</p>{item.public_url ? <a href={item.public_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open public source <ExternalLink size={15} /></a> : null}{item.review_state === "suggested" ? <ReviewActions id={item.evidence_id} note={notes[item.evidence_id] ?? ""} busy={busy === `evidence:${item.evidence_id}`} onNote={(value) => setNotes((current) => ({ ...current, [item.evidence_id]: value }))} onDecision={(decision) => reviewItem("evidence", item.evidence_id, decision)} /> : <small>Final review · {item.review_reason}</small>}</article>)}</div></details> : null}

      {record?.external_events.length ? <details className="bridge-review-list" open={pendingEvents.length > 0}><summary><span>Inbox + booking evidence</span><strong>{pendingEvents.length} needs review</strong></summary><div>{record.external_events.map((event) => <article key={event.event_id}><header><span className={`bridge-review-state bridge-review-state--${event.review_state}`}>{event.review_state.replace("_", " ")}</span><strong>{providerLabel(event.provider)} · {providerLabel(event.kind)}</strong><time>{formatTimestamp(event.occurred_at)}</time></header><p>{event.summary}</p>{event.review_state === "needs_review" ? <ReviewActions id={event.event_id} note={notes[event.event_id] ?? ""} busy={busy === `event:${event.event_id}`} onNote={(value) => setNotes((current) => ({ ...current, [event.event_id]: value }))} onDecision={(decision) => reviewItem("event", event.event_id, decision)} /> : <small>Final review · {event.review_reason}</small>}</article>)}</div></details> : null}

      {audit ? <section className="bridge-audit" aria-labelledby="bridge-audit-title"><div className="bridge-section-title"><Gauge size={18} /><div><p className="eyebrow">Website Audit return path</p><h4 id="bridge-audit-title">{audit.domain}</h4></div><span className={`bridge-review-state bridge-review-state--${audit.status === "generated" ? "confirmed" : audit.status === "failed" ? "rejected" : "suggested"}`}>{audit.status}</span></div><div className="bridge-audit-grid"><div><small>Grade</small><strong>{audit.grade ?? "—"}</strong><span>{audit.overall_score ?? "No score"}</span></div><div><small>Delivery</small><strong>{providerLabel(audit.email_delivery.status)}</strong><span>{audit.email_delivery.sent_at ? formatTimestamp(audit.email_delivery.sent_at) : "No sent evidence"}</span></div><div><small>URL fetches</small><strong>{audit.engagement.total_views}</strong><span>{audit.engagement.last_view_at ? `Unverified · last ${formatTimestamp(audit.engagement.last_view_at)}` : "No fetch recorded"}</span></div><div><small>Sustained engagement</small><strong>{audit.engagement.max_scroll_depth}%</strong><span>{audit.engagement.max_time_on_page_seconds}s · observed, not verified intent</span></div></div>{audit.summary ? <p>{audit.summary}</p> : null}{audit.report_url ? <a className="secondary-button" href={audit.report_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open private report <ExternalLink size={16} /></a> : null}</section> : null}

      <section className="bridge-offer" aria-labelledby="bridge-offer-title">
        <div className="bridge-section-title"><Sparkles size={18} /><div><p className="eyebrow">Approved private offer</p><h4 id="bridge-offer-title">Move from fit to scope faster</h4></div></div>
        {offerError && !offers.length ? <div className="bridge-inline-error"><CircleAlert size={17} />{offerError}</div> : <><label><span>Offer playbook</span><select value={effectiveOfferId} onChange={(event) => setOfferId(event.target.value)}><option value="">Choose an approved offer…</option>{offers.map((offer) => <option key={offer.offerId} value={offer.offerId}>{offer.name} · {privatePrice(offer)}</option>)}</select></label>{currentOffer ? <div className="bridge-offer-detail"><div><span>{currentOffer.audience} · {privatePrice(currentOffer)}</span><strong>{currentOffer.name}</strong><p>{currentOffer.scopeSummary}</p></div><div><section><small>Proof required</small><ol>{currentOffer.proofPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol></section><section><small>Stage playbook</small><ol>{currentOffer.stagePlaybook.map((step) => <li key={step}>{step}</li>)}</ol></section></div></div> : null}<label><span>Required fit rationale</span><textarea value={effectiveOfferRationale} maxLength={1000} rows={3} onChange={(event) => { setOfferTouched(true); setOfferRationale(event.target.value); }} placeholder="Why this offer is the smallest useful match for verified pain…" /></label><button type="button" className="primary-button" disabled={Boolean(busy) || !currentOffer || !effectiveOfferRationale.trim()} onClick={() => currentOffer && void run("offer", () => onMutate({ type: "select_offer", offer_code: currentOffer.bridgeOfferCode, price_band: currentOffer.bridgePriceBand, rationale: effectiveOfferRationale.trim() }), "Private offer playbook selected. No proposal was created or sent.")}>{busy === "offer" ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />} Save offer playbook</button></>}
        <p className="bridge-fine-print"><ShieldCheck size={15} /> Pricing arrives only from the authenticated server catalog. Nothing is published to the Little Fight marketing bundle or sent to a prospect.</p>
      </section>

      {error ? <div className="bridge-inline-error" role="alert"><CircleAlert size={17} />{error}</div> : null}
      {message ? <div className="bridge-inline-success" role="status"><Check size={17} />{message}</div> : null}
    </section>
  );
}
