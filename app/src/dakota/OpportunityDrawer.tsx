import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  BookOpen,
  Check,
  CircleAlert,
  Copy,
  ExternalLink,
  FileSearch,
  Globe2,
  LoaderCircle,
  Save,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { ScoreTriptych } from "./ScoreTriptych";
import {
  assessCandidate,
  candidateKey,
  HUMAN_APPROVED_STATUSES,
  isValidCandidateKey,
  offerSuggestions,
  proofReference,
  STATUS_LABELS,
  storefrontMoneyPath,
} from "./revenue";
import {
  candidateLabel,
  compactSource,
  formatDate,
  formatTimestamp,
  normalizedList,
  placeLine,
} from "./presentation";
import {
  OPERATOR_STATUSES,
  type Candidate,
  type OperatorMilestones,
  type OperatorRecordInput,
  type OperatorStatus,
  type QueueEnvelope,
} from "./types";
import {
  containsUnsupportedControlCharacter,
  isRealDateOnly,
  validateOperatorIdentity,
} from "./operatorValidation";

const FIELD_LIMITS: Partial<Record<keyof OperatorRecordInput, number>> = {
  notes: 4000,
  verifiedPain: 2000,
  offerFit: 1000,
  nextAction: 1000,
  winLossReason: 1000,
  proof: 4000,
  draft: 6000,
};

const HTML_LIKE_CONTENT = /(?:[<>]|<!--|-->|&(?:lt|gt|amp|quot|apos|#(?:x[0-9a-f]+|[0-9]+));)/iu;
const URL_LIKE_CONTENT = /(?:\b(?:https?|ftp|file|data|javascript|mailto):|:\/\/|\bwww\.)/iu;

function validateRecord(record: OperatorRecordInput): string | null {
  const identityError = validateOperatorIdentity(record.identity);
  if (identityError) return identityError;
  if (!record.identity.source || !record.identity.sourceId) return "Private identity must retain its source and source ID.";
  for (const [field, limit] of Object.entries(FIELD_LIMITS) as [keyof OperatorRecordInput, number][]) {
    const value = record[field];
    if (typeof value !== "string") continue;
    if (value.length > limit) return `${field} is longer than the private operator-state limit.`;
    if (containsUnsupportedControlCharacter(value)) return `${field} contains an unsupported control character.`;
    if (HTML_LIKE_CONTENT.test(value)) return `${field} must be plain text without HTML or encoded HTML.`;
    if (URL_LIKE_CONTENT.test(value)) return `${field} must stay plain text; public URLs belong in the dedicated URL fields.`;
  }
  if (!isRealDateOnly(record.dueDate)) return "Due date must be a real calendar date in YYYY-MM-DD format.";
  for (const [label, value] of [
    ["Estimated value", record.estimatedValue],
    ["Actual revenue", record.actualRevenue],
  ] as const) {
    if (value === null) continue;
    if (!Number.isFinite(value) || value < 0 || value > 100_000_000) return `${label} must be between 0 and 100,000,000.`;
    if (Math.abs(value * 100 - Math.round(value * 100)) >= 1e-7) return `${label} can have at most two decimal places.`;
  }
  return null;
}

function parseMoney(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function EvidenceRow({ label, value, quiet = false }: { label: string; value: string; quiet?: boolean }) {
  return (
    <div className={`evidence-row${quiet ? " evidence-row--quiet" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function OpportunityDrawer({
  candidate,
  queue,
  record,
  recordUpdatedAt,
  milestones,
  savedOnly = false,
  notebookAvailable,
  onClose,
  onSave,
}: {
  candidate: Candidate;
  queue: QueueEnvelope;
  record: OperatorRecordInput;
  recordUpdatedAt?: string;
  milestones?: OperatorMilestones;
  savedOnly?: boolean;
  notebookAvailable: boolean;
  onClose: () => void;
  onSave: (key: string, record: OperatorRecordInput) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [baseline, setBaseline] = useState(() => JSON.stringify(record));
  const [form, setForm] = useState<OperatorRecordInput>(() => ({
    ...record,
    identity: { ...record.identity },
  }));
  const [approvalConfirmed, setApprovalConfirmed] = useState(
    HUMAN_APPROVED_STATUSES.has(record.status),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const dirty = useMemo(() => JSON.stringify(form) !== baseline, [baseline, form]);

  const requestClose = () => {
    if (saving) return;
    if (dirty && !window.confirm("Discard unsaved Dakota changes?")) return;
    onClose();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const preventAccidentalExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventAccidentalExit);
    return () => window.removeEventListener("beforeunload", preventAccidentalExit);
  }, [dirty]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const classifiedCandidate = useMemo<Candidate>(() => ({
    ...candidate,
    category: form.identity.category || candidate.category,
    city: form.identity.city || candidate.city,
    county_or_borough: form.identity.borough || candidate.county_or_borough,
    verified_url: candidate.verified_url || form.identity.verifiedUrl || "",
  }), [candidate, form.identity]);
  const assessment = useMemo(() => assessCandidate(classifiedCandidate, form), [classifiedCandidate, form]);
  const suggestions = useMemo(() => offerSuggestions(classifiedCandidate), [classifiedCandidate]);
  const proofLink = useMemo(() => proofReference(classifiedCandidate), [classifiedCandidate]);
  const reasons = normalizedList(candidate.score_reasons);
  const gaps = normalizedList(candidate.missing_pieces);
  const key = candidateKey(candidate);
  const requiresApproval = HUMAN_APPROVED_STATUSES.has(form.status);
  const researchQuery = [candidateLabel(classifiedCandidate), placeLine(classifiedCandidate)].filter(Boolean).join(" ");
  const researchLocation = placeLine(classifiedCandidate) || "New York, NY";
  const researchLinks = [
    {
      label: "Google Maps search",
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(researchQuery)}`,
    },
    {
      label: "Yelp search",
      url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(candidateLabel(classifiedCandidate))}&find_loc=${encodeURIComponent(researchLocation)}`,
    },
    {
      label: "Google web search",
      url: `https://www.google.com/search?q=${encodeURIComponent(researchQuery)}`,
    },
  ];
  const operatorReferences = [
    { label: "PageSpeed Insights", url: "https://pagespeed.web.dev/", note: "Manual public-site measurement; record the time and recheck before citing it." },
    { label: "New Business Launch", url: "https://www.littlefightnyc.com/services/new-business-launch/", note: "Use when the launch gap is verified." },
    { label: "Ongoing Care", url: "https://www.littlefightnyc.com/services/ongoing-care/", note: "Use only after a real fit or completed build exists." },
    proofLink,
  ];
  const milestoneEntries = [
    ["Human approved", milestones?.humanApprovedAt],
    ["Reply recorded", milestones?.repliedAt],
    ["Meeting recorded", milestones?.meetingAt],
    ["Proposal recorded", milestones?.proposalAt],
    ["Win recorded", milestones?.wonAt],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const setString = (field: keyof OperatorRecordInput, value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setIdentity = (field: "category" | "city" | "borough" | "verifiedUrl" | "publicSourceUrl", value: string) => {
    setSaved(false);
    setForm((current) => ({
      ...current,
      identity: { ...current.identity, [field]: value },
    }));
  };

  const setStatus = (status: OperatorStatus) => {
    setSaved(false);
    if (HUMAN_APPROVED_STATUSES.has(status) && !HUMAN_APPROVED_STATUSES.has(record.status)) {
      setApprovalConfirmed(false);
    }
    setForm((current) => ({ ...current, status }));
  };

  const prepareDraft = () => {
    if (!form.verifiedPain.trim() || !form.offerFit.trim()) return;
    const name = candidateLabel(candidate);
    setString(
      "draft",
      `PRIVATE PURSUIT PACKET — NOT SENT\n\nBusiness: ${name}\nEvidence: ${form.verifiedPain.trim()}\nOffer: ${form.offerFit.trim()}\nFirst move: ${form.nextAction.trim() || "Decide after human review"}\nProof: ${form.proof.trim() || "No proof selected"}\nStatus: ${STATUS_LABELS[form.status]}`,
    );
  };

  const copyPacket = async () => {
    if (!requiresApproval || !approvalConfirmed || !form.draft.trim()) return;
    setCopyState("idle");
    try {
      await navigator.clipboard.writeText(form.draft);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    if (!notebookAvailable) {
      setError("The private operator notebook is unavailable. This dossier remains review-only.");
      return;
    }
    if (!isValidCandidateKey(key)) {
      setError("This source record cannot be saved because its stable candidate key is not valid.");
      return;
    }
    if (`${form.identity.source}:${form.identity.sourceId}`.toLowerCase() !== key) {
      setError("The private identity source must reproduce this stable candidate key exactly.");
      return;
    }
    if (requiresApproval && !approvalConfirmed) {
      setError("Confirm the human approval statement before moving this record into pursuit.");
      return;
    }
    if (requiresApproval && (!form.verifiedPain.trim() || !form.offerFit.trim())) {
      setError("Pursuit-ready records require verified pain and a specific offer fit.");
      return;
    }
    const validationError = validateRecord(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      await onSave(key, form);
      setBaseline(JSON.stringify(form));
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The private operator record could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      className="opportunity-dialog"
      ref={dialogRef}
      aria-labelledby="opportunity-title"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className="opportunity-drawer">
        <header className="drawer-header">
          <div>
            <p className="eyebrow"><span /> Private opportunity dossier</p>
            <h2 id="opportunity-title">{candidateLabel(candidate)}</h2>
            {candidate.dba && candidate.dba !== candidate.business_name ? <p>{candidate.business_name}</p> : null}
            {savedOnly ? <span className="saved-record-tag">Saved record · not in current queue</span> : null}
          </div>
          <button className="icon-button" type="button" onClick={requestClose} disabled={saving} aria-label="Close opportunity dossier">
            <X size={20} />
          </button>
        </header>

        <div className="drawer-safety">
          <ShieldCheck size={17} />
          <p><strong>Research and preparation only.</strong> Dakota stores private operator judgment; it cannot send, call, text, or submit a form.</p>
        </div>

        <section className="drawer-section" aria-labelledby="score-heading">
          <div className="drawer-section__heading">
            <p className="eyebrow" id="score-heading">Three-layer read</p>
            <span>{assessment.qualified ? "Human-approved pursuit" : "Not qualified"}</span>
          </div>
          <ScoreTriptych assessment={assessment} />
        </section>

        <section className="drawer-section evidence-section" aria-labelledby="evidence-heading">
          <div className="drawer-section__heading">
            <div>
              <p className="eyebrow" id="evidence-heading">Evidence and provenance</p>
              <h3>{savedOnly ? "What the private snapshot actually knows" : "What the queue actually knows"}</h3>
            </div>
            <FileSearch size={18} />
          </div>

          <dl className="evidence-ledger">
            <EvidenceRow label="Public source" value={compactSource(candidate.source)} />
            <EvidenceRow label="Source record" value={candidate.source_id || "Not provided"} />
            <EvidenceRow label={savedOnly ? "Current queue rank" : "Filed / observed"} value={savedOnly ? "Not present" : formatDate(candidate.filed_at)} />
            <EvidenceRow label={savedOnly ? "Saved record" : "Queue measured"} value={formatTimestamp(queue.generated_at)} />
            {!savedOnly ? <EvidenceRow label="Private snapshot" value={queue.published_at ? formatTimestamp(queue.published_at) : "Not recorded"} /> : null}
            <EvidenceRow label="Location on record" value={placeLine(candidate) || "Not provided"} />
            <EvidenceRow label={savedOnly ? "Saved operator category" : "Raw queue category / filing type"} value={candidate.category || "Not provided"} />
            {!savedOnly ? <EvidenceRow label="Public filing address" value={candidate.address || "Not provided"} quiet /> : null}
            {!savedOnly ? (
              <>
                <EvidenceRow
                  label="Mobile performance"
                  value={candidate.psi_mobile_performance === null ? "Not measured" : `${Math.round(candidate.psi_mobile_performance)} / 100`}
                />
                <EvidenceRow label="Performance measured at" value="Not provided by the current queue schema" quiet />
              </>
            ) : null}
          </dl>

          <div className="evidence-columns">
            <div>
              <p><Sparkles size={14} /> Why it surfaced</p>
              {reasons.length ? <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <span>No score reasons were provided.</span>}
            </div>
            <div>
              <p><CircleAlert size={14} /> Evidence gaps</p>
              {gaps.length ? <ul>{gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : <span>No gaps were listed; independent verification is still required.</span>}
            </div>
          </div>
        </section>

        <section className="drawer-section" aria-labelledby="contact-heading">
          <div className="drawer-section__heading">
            <div>
              <p className="eyebrow" id="contact-heading">Contact evidence</p>
              <h3>Public routes, never guesses</h3>
            </div>
            <Globe2 size={18} />
          </div>
          <div className="contact-evidence">
            <div>
              <span>Website</span>
              {candidate.verified_url ? (
                <a href={candidate.verified_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  {savedOnly ? "Operator-verified snapshot" : "Verified by queue"} <ExternalLink size={13} />
                </a>
              ) : <strong>None verified</strong>}
            </div>
            <div><span>Phone on queue record</span><strong>{candidate.phone || "None provided"}</strong></div>
            <div><span>Email</span><strong>None collected by this queue</strong></div>
            <div>
              <span>Private identity website</span>
              <strong>{form.identity.verifiedUrl ? (form.identity.verifiedUrl === candidate.verified_url ? "Copied from engine evidence" : "Operator verified") : "None recorded"}</strong>
            </div>
          </div>
          <p className="evidence-caution"><CircleAlert size={14} /> Do not infer an owner, guess an email, or treat a filing address as a storefront.</p>
          <div className="research-links">
            <p><SearchCheck size={14} /> Manual public research links</p>
            <div>
              {researchLinks.map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  {link.label} <ExternalLink size={12} />
                </a>
              ))}
              {candidate.verified_url ? (
                <a href={candidate.verified_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  Verified site <ExternalLink size={12} />
                </a>
              ) : null}
              {form.identity.verifiedUrl && form.identity.verifiedUrl !== candidate.verified_url ? (
                <a href={form.identity.verifiedUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  Operator-verified site <ExternalLink size={12} />
                </a>
              ) : null}
              {form.identity.publicSourceUrl ? (
                <a href={form.identity.publicSourceUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  Saved public source <ExternalLink size={12} />
                </a>
              ) : null}
            </div>
            <span>Links open only when the operator chooses. Dakota performs no API lookup or contact action.</span>
          </div>
        </section>

        <section className="drawer-section" aria-labelledby="fit-heading">
          <div className="drawer-section__heading">
            <div>
              <p className="eyebrow" id="fit-heading">Money path and offer fit</p>
              <h3>Specific to this storefront</h3>
            </div>
            <Target size={18} />
          </div>
          <div className="money-path">
            <span>Customer action to verify</span>
            <strong>{storefrontMoneyPath(classifiedCandidate.category)}</strong>
            <p>This is a category-based research prompt, not a measured conversion claim.</p>
          </div>
          <div className="offer-suggestions" aria-label="Offer-fit research prompts">
            {suggestions.map((suggestion) => (
              <button key={suggestion.name} type="button" onClick={() => setString("offerFit", `${suggestion.name}: ${suggestion.reason}`)}>
                <strong>{suggestion.name}</strong>
                <span>{suggestion.reason}</span>
              </button>
            ))}
          </div>
          <div className="operator-references">
            <p><BookOpen size={14} /> Little Fight operator references</p>
            <div>
              {operatorReferences.map((reference) => (
                <a key={reference.label} href={reference.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  <strong>{reference.label}</strong>
                  <span>{reference.note}</span>
                  <ExternalLink size={13} />
                </a>
              ))}
            </div>
            <span className="inbound-only-warning">Never submit an unconsenting prospect to Little Fight’s Website Check or Tech Audit. Those are inbound-only lead flows.</span>
          </div>
        </section>

        <form className="operator-form" name="dakota-opportunity" autoComplete="off" onSubmit={save} noValidate>
          <section className="drawer-section" aria-labelledby="judgment-heading">
            <div className="drawer-section__heading">
              <div>
                <p className="eyebrow" id="judgment-heading">Private operator state</p>
                <h3>Turn evidence into one next decision</h3>
              </div>
              {recordUpdatedAt ? <span>Saved {formatTimestamp(recordUpdatedAt)}</span> : null}
            </div>

            {!notebookAvailable ? (
              <div className="inline-warning" role="status"><CircleAlert size={16} /> Operator notebook unavailable. Review remains read-only.</div>
            ) : null}

            {milestoneEntries.length ? (
              <dl className="milestone-ledger" aria-label="Write-once opportunity milestones">
                {milestoneEntries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatTimestamp(value)}</dd></div>)}
              </dl>
            ) : null}

            <div className="form-grid">
              <fieldset className="identity-editor form-span">
                <legend>Private identity refinement</legend>
                <p>{savedOnly ? "Private saved identity. Re-verify time-sensitive public facts before pursuit." : "Operator classification only. Raw queue facts remain unchanged above."}</p>
                <div>
                  <label>
                    <span>Storefront category</span>
                    <input name="identity_category" autoComplete="off" maxLength={160} value={form.identity.category ?? ""} onChange={(event) => setIdentity("category", event.target.value)} placeholder="Refine a generic filing type…" />
                  </label>
                  <label>
                    <span>City</span>
                    <input name="identity_city" autoComplete="off" maxLength={160} value={form.identity.city ?? ""} onChange={(event) => setIdentity("city", event.target.value)} />
                  </label>
                  <label>
                    <span>Borough / area</span>
                    <input name="identity_borough" autoComplete="off" maxLength={160} value={form.identity.borough ?? ""} onChange={(event) => setIdentity("borough", event.target.value)} />
                  </label>
                  <label>
                    <span>Operator-verified website <small>Private snapshot</small></span>
                    <input name="identity_verified_url" autoComplete="off" spellCheck={false} maxLength={2048} type="url" inputMode="url" value={form.identity.verifiedUrl ?? ""} onChange={(event) => setIdentity("verifiedUrl", event.target.value)} placeholder="https://…" />
                  </label>
                  <label className="form-span">
                    <span>Public research source <small>Not a contact route</small></span>
                    <input name="identity_public_source_url" autoComplete="off" spellCheck={false} maxLength={2048} type="url" inputMode="url" value={form.identity.publicSourceUrl ?? ""} onChange={(event) => setIdentity("publicSourceUrl", event.target.value)} placeholder="https://…" />
                  </label>
                </div>
              </fieldset>
              <label>
                <span>Status</span>
                <select name="status" autoComplete="off" value={form.status} onChange={(event) => setStatus(event.target.value as OperatorStatus)}>
                  {OPERATOR_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                </select>
              </label>
              <label>
                <span>Due date</span>
                <input name="due_date" autoComplete="off" type="date" value={form.dueDate} onChange={(event) => setString("dueDate", event.target.value)} />
              </label>
              <label className="form-span">
                <span>Verified pain <small>Observed fact only</small></span>
                <textarea name="verified_pain" autoComplete="off" maxLength={2000} rows={3} value={form.verifiedPain} onChange={(event) => setString("verifiedPain", event.target.value)} placeholder="Record what was personally checked, where, and when…" />
              </label>
              <label className="form-span">
                <span>Offer fit <small>One specific Little Fight service</small></span>
                <textarea name="offer_fit" autoComplete="off" maxLength={1000} rows={3} value={form.offerFit} onChange={(event) => setString("offerFit", event.target.value)} placeholder="Explain why this offer follows from the verified evidence…" />
              </label>
              <label className="form-span">
                <span>Next action <small>For the operator, not the prospect</small></span>
                <input name="next_action" autoComplete="off" maxLength={1000} value={form.nextAction} onChange={(event) => setString("nextAction", event.target.value)} placeholder="Verify the booking path and capture one screenshot…" />
              </label>
              <label>
                <span>Estimated value</span>
                <input name="estimated_value" autoComplete="off" type="number" min="0" max="100000000" step="0.01" value={form.estimatedValue ?? ""} onChange={(event) => { setSaved(false); setForm((current) => ({ ...current, estimatedValue: parseMoney(event.target.value) })); }} inputMode="decimal" />
              </label>
              <label>
                <span>Actual revenue</span>
                <input name="actual_revenue" autoComplete="off" type="number" min="0" max="100000000" step="0.01" value={form.actualRevenue ?? ""} onChange={(event) => { setSaved(false); setForm((current) => ({ ...current, actualRevenue: parseMoney(event.target.value) })); }} inputMode="decimal" />
              </label>
              <label className="form-span">
                <span>Proof to use <small>Owner-approved, real work only</small></span>
                <textarea name="proof" autoComplete="off" maxLength={4000} rows={3} value={form.proof} onChange={(event) => setString("proof", event.target.value)} placeholder="Record the relevant case or verified result—never links or invented outcomes…" />
              </label>
              <label className="form-span">
                <span>Notes</span>
                <textarea name="notes" autoComplete="off" maxLength={4000} rows={4} value={form.notes} onChange={(event) => setString("notes", event.target.value)} placeholder="Private research notes and open questions…" />
              </label>
              <label className="form-span">
                <span>Win / loss reason</span>
                <input name="win_loss_reason" autoComplete="off" maxLength={1000} value={form.winLossReason} onChange={(event) => setString("winLossReason", event.target.value)} placeholder="Record only after a real outcome…" />
              </label>
            </div>
          </section>

          <section className="drawer-section draft-studio" aria-labelledby="draft-heading">
            <div className="drawer-section__heading">
              <div>
                <p className="eyebrow" id="draft-heading">Human-approved pursuit packet</p>
                <h3>Private draft, no send path</h3>
              </div>
              <div className="draft-actions">
                <button type="button" className="text-button" onClick={prepareDraft} disabled={!form.verifiedPain.trim() || !form.offerFit.trim()}>
                  Prepare evidence packet
                </button>
                <button type="button" className="text-button" onClick={() => void copyPacket()} disabled={!requiresApproval || !approvalConfirmed || !form.draft.trim()} title={!requiresApproval || !approvalConfirmed ? "Move to a pursuit status and confirm human approval before copying." : undefined}>
                  {copyState === "copied" ? <Check size={14} /> : <Copy size={14} />}
                  {copyState === "copied" ? "Approved packet copied" : "Copy approved packet"}
                </button>
              </div>
            </div>
            <label>
              <span className="sr-only">Private pursuit draft</span>
              <textarea name="draft" autoComplete="off" maxLength={6000} rows={10} value={form.draft} onChange={(event) => setString("draft", event.target.value)} placeholder="Write or prepare a private draft after verifying the pain and offer fit—Dakota cannot send it…" />
            </label>
            <div className="no-send-contract"><ShieldCheck size={16} /><span><strong>Nothing leaves Dakota.</strong> Saving records judgment and draft text only. It does not contact anyone.</span></div>
            {copyState === "error" ? <p className="copy-error" role="status">Clipboard access failed. The packet remains only in the editor.</p> : null}
          </section>

          {requiresApproval ? (
            <label className="approval-gate">
              <input name="approval_confirmed" autoComplete="off" type="checkbox" checked={approvalConfirmed} onChange={(event) => { setSaved(false); setApprovalConfirmed(event.target.checked); }} />
              <span><strong>I verified the evidence and approve this packet for manual pursuit.</strong>This is an operator decision, not permission for Dakota to send anything.</span>
            </label>
          ) : null}

          {error ? <div className="form-error" ref={errorRef} tabIndex={-1} role="alert"><CircleAlert size={16} />{error}</div> : null}
          {saved ? <div className="form-success" role="status"><Check size={16} />Private operator record saved. No outreach occurred.</div> : null}

          <footer className="drawer-footer">
            <button type="button" className="secondary-button" onClick={requestClose} disabled={saving}>Close dossier</button>
            <button type="submit" className="primary-button" disabled={saving || !notebookAvailable}>
              {saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
              Save private record
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
