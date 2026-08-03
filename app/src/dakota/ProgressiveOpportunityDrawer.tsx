import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Activity,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  Copy,
  ExternalLink,
  FileCheck2,
  FileSearch,
  LoaderCircle,
  Phone,
  Plus,
  ReceiptText,
  Save,
  SearchCheck,
  ShieldCheck,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { ScoreTriptych } from "./ScoreTriptych";
import {
  assessCandidate,
  candidateKey,
  derivedBalance,
  hasOperatorActivity,
  HUMAN_APPROVED_STATUSES,
  isHumanApprovedRecord,
  isPursuitContact,
  isValidCandidateKey,
  isVerifiedContactRoute,
  isVoiceTextContact,
  offerSuggestions,
  proofReference,
  STATUS_LABELS,
  storefrontMoneyPath,
} from "./revenue";
import {
  candidateLabel,
  compactSource,
  formatTimestamp,
  normalizedList,
  placeLine,
} from "./presentation";
import {
  ACTIVITY_CHANNELS,
  ACTIVITY_OUTCOMES,
  ACTIVITY_TYPES,
  CONSENT_CLASSIFICATIONS,
  CONTACT_CHANNELS,
  OPERATOR_STATUSES,
  type Candidate,
  type DakotaActivity,
  type DakotaActivityChannel,
  type DakotaActivityOutcome,
  type DakotaActivityType,
  type DakotaCommercialClose,
  type DakotaConsentClassification,
  type DakotaContactChannel,
  type OperatorMilestones,
  type OperatorRecordInput,
  type OperatorStatus,
  type QueueEnvelope,
} from "./types";
import {
  containsUnsupportedControlCharacter,
  isRealDateOnly,
  isSafePublicHttps,
  validateOperatorIdentity,
} from "./operatorValidation";

const MAX_MONEY = 100_000_000;
const ACTIVE_PURSUIT_STATUSES = new Set<OperatorStatus>(["pursuit_ready", "pursuing", "replied", "meeting", "proposal", "won", "paid"]);
const HTML_LIKE_CONTENT = /(?:[<>]|<!--|--!?>|&(?:lt|gt|amp|quot|apos|#(?:x[0-9a-f]+|[0-9]+));)/iu;

const TEXT_LIMITS = {
  notes: 4000,
  verifiedPain: 2000,
  offerFit: 1000,
  nextAction: 1000,
  winLossReason: 1000,
  proof: 4000,
  draft: 6000,
} as const;

const CONSENT_LABELS: Record<DakotaConsentClassification, string> = {
  unknown: "Unknown — research only",
  explicit_inquiry: "Explicit inquiry — reply permitted",
  existing_relationship: "Existing relationship",
  public_business: "Public business contact — not text consent",
  do_not_contact: "Do not contact",
};

const CONTACT_LABELS: Record<DakotaContactChannel, string> = {
  email: "Email",
  phone: "Phone",
  sms: "SMS number",
  website_form: "Website form",
  linkedin: "LinkedIn",
};

const ACTIVITY_TYPE_LABELS: Record<DakotaActivityType, string> = {
  note: "Internal note",
  outreach: "Outreach",
  reply: "Reply",
  call: "Call",
  meeting: "Discovery meeting",
  proposal_sent: "Proposal sent",
  contract_signed: "Contract signed",
  invoice_sent: "Invoice sent",
  payment_received: "Payment received",
  follow_up: "Follow-up",
};

const STAGE_EXPLANATIONS: Record<OperatorStatus, string> = {
  early_signal: "A public event worth a look. No buyer intent or outreach permission is implied.",
  research_ready: "Identity or consented intake exists. Verify the problem, contact route, and offer before pursuit.",
  pursuit_ready: "David explicitly approved one specific manual pursuit. Nothing has been sent yet.",
  pursuing: "A human explicitly recorded real outreach. Copying or opening an app cannot create this stage.",
  replied: "A real response was recorded. Use the reply to qualify the discovery step.",
  meeting: "A discovery conversation is scheduled or completed and recorded as evidence.",
  proposal: "A real proposal was sent and its reference, amount, and date are recorded.",
  won: "A signed agreement is recorded. This is not paid revenue.",
  paid: "Cleared cash and its payment date are recorded. This is the only paid stage.",
  lost: "A real loss outcome and reason are recorded.",
  snoozed: "No action until the saved due date or follow-up evidence says otherwise.",
  not_fit: "Research found no credible offer fit. Close it without outreach.",
  do_not_contact: "Do not pursue this record. Contacts remain visible so the restriction is not lost.",
};

interface ActivityDraft {
  channel: DakotaActivityChannel;
  type: DakotaActivityType;
  outcome: DakotaActivityOutcome;
  note: string;
  occurredAt: string;
  followUpAt: string;
}

function localDateTimeValue(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function makeActivityDraft(): ActivityDraft {
  return { channel: "internal", type: "note", outcome: "recorded", note: "", occurredAt: localDateTimeValue(), followUpAt: "" };
}

function parseMoney(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidMoney(value: number | null): boolean {
  return value === null || (Number.isFinite(value) && value >= 0 && value <= MAX_MONEY && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7);
}

function hasUnsafeText(value: string): boolean {
  return containsUnsupportedControlCharacter(value) || HTML_LIKE_CONTENT.test(value);
}

function derivedCommercialClose(close: DakotaCommercialClose): DakotaCommercialClose {
  return { ...close, balance: derivedBalance(close) };
}

function dncConsentChanged(original: OperatorRecordInput, current: OperatorRecordInput): boolean {
  return current.contacts.some((contact) => {
    if (!["explicit_inquiry", "existing_relationship", "public_business"].includes(contact.consentClassification)) return false;
    const previous = original.contacts.find((candidate) => candidate.contactId === contact.contactId);
    return !previous || previous.consentClassification !== contact.consentClassification;
  });
}

function sameContact(left: OperatorRecordInput["contacts"][number], right: OperatorRecordInput["contacts"][number]): boolean {
  return (
    left.contactId === right.contactId &&
    left.name === right.name &&
    left.role === right.role &&
    left.channel === right.channel &&
    left.value === right.value &&
    left.sourceUrl === right.sourceUrl &&
    left.verifiedAt === right.verifiedAt &&
    left.consentClassification === right.consentClassification
  );
}

function validateRecord(
  record: OperatorRecordInput,
  originalActivityIds: string[],
  originalRecord: OperatorRecordInput,
  milestones?: OperatorMilestones,
): string | null {
  const identityError = validateOperatorIdentity(record.identity);
  if (identityError) return identityError;
  if (!record.identity.source || !record.identity.sourceId) return "Private identity must retain its source and source ID.";
  for (const [field, limit] of Object.entries(TEXT_LIMITS) as [keyof typeof TEXT_LIMITS, number][]) {
    const value = record[field];
    if (value.length > limit) return `${field} is longer than the private operator-state limit.`;
    if (hasUnsafeText(value)) return `${field} must remain plain text without HTML or unsupported control characters.`;
  }
  if (!isRealDateOnly(record.dueDate)) return "Due date must be a real calendar date.";
  if (!isValidMoney(record.estimatedValue)) return "Estimated value must be between 0 and 100,000,000 with at most two decimal places.";

  if (record.contacts.length > 8) return "Dakota stores at most 8 verified contact routes per opportunity.";
  const contactIds = new Set<string>();
  for (const contact of record.contacts) {
    if (!contact.contactId || contact.contactId.length > 100) return "Every contact needs a stable private contact ID.";
    if (contactIds.has(contact.contactId)) return "Every verified contact needs a unique stable ID.";
    contactIds.add(contact.contactId);
    if (!contact.value.trim()) return "Every saved contact needs a contact route value.";
    if (contact.name.length > 160 || contact.role.length > 160) return "Contact name and role must each be 160 characters or fewer.";
    if ([contact.name, contact.role, contact.value].some(hasUnsafeText)) return "Contact details must remain plain text.";
    if (!contact.sourceUrl || !isSafePublicHttps(contact.sourceUrl)) return "Every contact needs a safe public HTTPS source URL.";
    if (!contact.verifiedAt || !isRealDateOnly(contact.verifiedAt)) return "Every saved contact needs a real verification date.";
    if (!isVerifiedContactRoute(contact)) return "Every saved contact needs a valid channel value, a name or role, and server-grade verification evidence.";
  }

  if (record.activities.length > 100) return "Dakota stores at most 100 append-only activity events per opportunity.";
  const currentPrefix = record.activities.slice(0, originalActivityIds.length).map((activity) => activity.activityId);
  if (currentPrefix.some((id, index) => id !== originalActivityIds[index])) return "Activity history is append-only. Earlier evidence cannot be removed or reordered.";
  const activityIds = new Set<string>();
  const originalActivityIdSet = new Set(originalActivityIds);
  for (const activity of record.activities) {
    if (!activity.activityId || !activity.occurredAt || Number.isNaN(Date.parse(activity.occurredAt))) return "Every activity needs a stable ID and valid occurrence time.";
    if (activityIds.has(activity.activityId)) return "Every activity needs a unique stable ID.";
    activityIds.add(activity.activityId);
    if (activity.followUpAt && Number.isNaN(Date.parse(activity.followUpAt))) return "Activity follow-up time must be valid.";
    if (activity.note.length > 2000 || hasUnsafeText(activity.note)) return "Activity notes must be 2,000 plain-text characters or fewer.";
    if (!originalActivityIdSet.has(activity.activityId) && Date.parse(activity.occurredAt) > Date.now() + 5 * 60_000) return "New activity evidence cannot be dated in the future.";
  }

  const close = record.commercialClose;
  if (![close.proposalSentDate, close.signedDate, close.paidDate].every(isRealDateOnly)) return "Commercial dates must be real calendar dates.";
  if (![close.proposalAmount, close.amountDue, close.amountPaid].every(isValidMoney)) return "Commercial amounts must be between 0 and 100,000,000 with at most two decimal places.";
  if ([close.proposalRef, close.invoiceRef, close.onboardingNextAction].some((value) => hasUnsafeText(value) || value !== value.trim())) return "Commercial evidence must remain trimmed plain text.";
  const contacted =
    hasOperatorActivity(record, "outreach", ["sent", "delivered", "connected", "voicemail", "no_response"]) ||
    hasOperatorActivity(record, "call", ["connected", "voicemail", "completed", "no_response"]);
  const replied = hasOperatorActivity(record, "reply", ["replied", "connected", "completed"]);
  const met = hasOperatorActivity(record, "meeting", ["scheduled", "completed"]);
  const proposalSent = hasOperatorActivity(record, "proposal_sent", ["sent", "delivered", "completed"]);
  const signed = hasOperatorActivity(record, "contract_signed", ["completed", "won"]);
  const invoiceSent = hasOperatorActivity(record, "invoice_sent", ["sent", "delivered", "completed"]);
  const paid = hasOperatorActivity(record, "payment_received", ["paid"]);
  const hasProposalData = Boolean(close.proposalRef || close.proposalSentDate || close.proposalAmount !== null);
  if (hasProposalData && (!close.proposalRef || !close.proposalSentDate || close.proposalAmount === null || !proposalSent)) return "Any proposal value requires its reference, amount, sent date, and explicit proposal-sent activity.";
  const hasInvoiceData = Boolean(close.invoiceRef || close.amountDue !== null);
  if (hasInvoiceData && (!close.invoiceRef || close.amountDue === null || !invoiceSent)) return "Any invoiced amount requires its invoice reference, amount due, and explicit invoice-sent activity.";
  if (close.signedDate && !signed) return "A signed date requires explicit completed contract-signed evidence.";
  const hasPaymentData = Boolean(close.paidDate || (close.amountPaid ?? 0) > 0);
  if (hasPaymentData && (!close.paidDate || close.amountPaid === null || close.amountPaid <= 0 || !paid)) return "Paid cash requires its positive cleared amount, paid date, and explicit payment-received activity with a paid outcome.";
  if (originalRecord.status === "do_not_contact" && record.status !== "do_not_contact" && !dncConsentChanged(originalRecord, record)) return "Leave do-not-contact only after intentionally changing an existing consent classification or adding a newly verified allowed contact.";
  if (ACTIVE_PURSUIT_STATUSES.has(record.status) && !record.contacts.some(isPursuitContact)) return "Active pursuit requires a verified contact classified explicit inquiry, existing relationship, or public business.";
  if (["pursuing", "replied", "meeting", "proposal", "won", "paid"].includes(record.status) && !contacted) return "Contacted and later stages require explicit qualifying outreach or call evidence.";
  if (["replied", "meeting", "proposal", "won", "paid"].includes(record.status) && !replied) return "Replied and later stages require explicit reply evidence.";
  if (["meeting", "proposal", "won", "paid"].includes(record.status) && !met) return "Discovery and later stages require a scheduled or completed meeting activity.";
  if (["proposal", "won", "paid"].includes(record.status) && !proposalSent) return "Proposal and later stages require explicit proposal-sent evidence.";
  if (["proposal", "won", "paid"].includes(record.status) && (!close.proposalRef || !close.proposalSentDate || close.proposalAmount === null)) return "Proposal and later stages require the proposal reference, sent date, and amount.";
  if ((record.status === "won" || record.status === "paid") && (!close.signedDate || !signed)) return "Signed and paid stages require a signed date and completed contract-signed activity.";
  if (
    record.status === "paid" &&
    (
      !close.invoiceRef ||
      close.amountDue === null ||
      !invoiceSent ||
      !close.paidDate ||
      close.amountPaid === null ||
      close.amountPaid <= 0 ||
      derivedBalance(close) !== 0 ||
      !close.onboardingNextAction.trim() ||
      !paid
    )
  ) return "Paid requires an evidenced invoice, zero remaining balance, cleared payment evidence and date, plus one onboarding next action.";
  if (record.status === "lost" && !record.winLossReason.trim()) return "Lost requires a factual loss reason.";
  if (record.status === "lost" && !milestones?.humanApprovedAt && !contacted) return "Lost is reserved for pursued opportunities; close unpursued research as not a fit.";
  if (record.status === "snoozed" && !record.dueDate) return "Snoozed requires an explicit due date.";
  return null;
}

function ProgressiveSection({
  number,
  eyebrow,
  title,
  complete,
  defaultOpen,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  complete: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(Boolean(defaultOpen));
  return (
    <details className="progressive-section" open={isOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary>
        <span className="progressive-section__number">{number}</span>
        <span><small>{eyebrow}</small><strong>{title}</strong></span>
        <span className={complete ? "section-state section-state--complete" : "section-state"}>{complete ? <Check size={16} /> : null}{complete ? "Ready" : "Needs evidence"}</span>
        <ChevronDown size={20} />
      </summary>
      <div className="progressive-section__body">{children}</div>
    </details>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return <span>{children}{hint ? <small>{hint}</small> : null}</span>;
}

export function ProgressiveOpportunityDrawer({
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
  const initialActivityIds = useRef(record.activities.map((activity) => activity.activityId));
  const initialRecord = useMemo<OperatorRecordInput>(() => ({
    ...record,
    identity: { ...record.identity },
    contacts: record.contacts.map((contact) => ({ ...contact })),
    activities: record.activities.map((activity) => ({ ...activity })),
    commercialClose: derivedCommercialClose({ ...record.commercialClose }),
  }), [record]);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialRecord));
  const [form, setForm] = useState<OperatorRecordInput>(initialRecord);
  const [approvalConfirmed, setApprovalConfirmed] = useState(HUMAN_APPROVED_STATUSES.has(record.status));
  const [activityDraft, setActivityDraft] = useState<ActivityDraft>(makeActivityDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const dirty = useMemo(() => JSON.stringify(form) !== baseline, [baseline, form]);
  const persistedContacts = useMemo<OperatorRecordInput["contacts"]>(() => {
    try { return (JSON.parse(baseline) as OperatorRecordInput).contacts; }
    catch { return []; }
  }, [baseline]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const preventAccidentalExit = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventAccidentalExit);
    return () => window.removeEventListener("beforeunload", preventAccidentalExit);
  }, [dirty]);

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  const requestClose = () => {
    if (saving) return;
    if (dirty && !window.confirm("Discard unsaved Dakota changes?")) return;
    onClose();
  };

  const setString = (field: keyof OperatorRecordInput, value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };
  const setIdentity = (field: "category" | "city" | "borough" | "verifiedUrl" | "publicSourceUrl", value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, identity: { ...current.identity, [field]: value } }));
  };
  const setStatus = (status: OperatorStatus) => {
    setSaved(false);
    if (HUMAN_APPROVED_STATUSES.has(status) && !HUMAN_APPROVED_STATUSES.has(record.status)) setApprovalConfirmed(false);
    setForm((current) => ({ ...current, status }));
  };
  const setMoney = (field: "estimatedValue", value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: parseMoney(value) }));
  };
  const setCommercial = <K extends keyof DakotaCommercialClose>(field: K, value: DakotaCommercialClose[K]) => {
    setSaved(false);
    setForm((current) => ({
      ...current,
      ...(field === "amountPaid" ? { actualRevenue: value as number | null } : {}),
      commercialClose: derivedCommercialClose({ ...current.commercialClose, [field]: value }),
    }));
  };
  const setContact = (contactId: string, field: keyof OperatorRecordInput["contacts"][number], value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, contacts: current.contacts.map((contact) => contact.contactId === contactId ? { ...contact, [field]: value } : contact) }));
  };
  const addContact = () => {
    if (form.contacts.length >= 8) return setError("Dakota stores at most 8 verified contact routes per opportunity.");
    setSaved(false);
    setForm((current) => ({ ...current, contacts: [...current.contacts, { contactId: crypto.randomUUID().toLowerCase(), name: "", role: "", channel: "phone", value: "", sourceUrl: "", verifiedAt: "", consentClassification: "unknown" }] }));
  };

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
  const approved = approvalConfirmed && isHumanApprovedRecord(form);
  const usableContact = form.contacts.find((contact) =>
    isPursuitContact(contact) && persistedContacts.some((savedContact) => sameContact(contact, savedContact))
  );
  const voiceContact = form.contacts.find((contact) =>
    isVoiceTextContact(contact) && persistedContacts.some((savedContact) => sameContact(contact, savedContact))
  );
  const balance = derivedBalance(form.commercialClose);
  const researchQuery = [candidateLabel(classifiedCandidate), placeLine(classifiedCandidate)].filter(Boolean).join(" ");
  const researchLocation = placeLine(classifiedCandidate) || "New York, NY";
  const researchLinks = [
    { label: "Google Maps", url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(researchQuery)}` },
    { label: "Yelp", url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(candidateLabel(classifiedCandidate))}&find_loc=${encodeURIComponent(researchLocation)}` },
    { label: "Google search", url: `https://www.google.com/search?q=${encodeURIComponent(researchQuery)}` },
  ];
  const milestoneEntries = [
    ["Approved", milestones?.humanApprovedAt],
    ["First contact", milestones?.firstContactedAt],
    ["Replied", milestones?.repliedAt],
    ["Meeting", milestones?.meetingAt],
    ["Proposal", milestones?.proposalAt],
    ["Signed", milestones?.wonAt],
    ["Lost", milestones?.lostAt],
    ["Paid", milestones?.paidAt],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const prepareDraft = () => {
    if (!form.verifiedPain.trim() || !form.offerFit.trim()) return;
    const contactName = usableContact?.name.trim() || "there";
    setString("draft", `Hi ${contactName} — I took a look at ${candidateLabel(candidate)} and noticed ${form.verifiedPain.trim()}\n\nLittle Fight NYC may be able to help with one focused move: ${form.offerFit.trim()}\n\nWould it be useful if I sent a brief outline?\n\n— David, Little Fight NYC`);
  };

  const copyDraft = async () => {
    if (!approved || !usableContact || !form.draft.trim()) return;
    setCopyState("idle");
    try { await navigator.clipboard.writeText(form.draft); setCopyState("copied"); }
    catch { setCopyState("error"); }
  };

  const appendActivity = () => {
    setError("");
    if (form.activities.length >= 100) return setError("Dakota’s 100-event activity limit is reached. Preserve the existing evidence and close or complete this record.");
    if (!activityDraft.note.trim()) return setError("Add a factual activity note before recording evidence.");
    const occurredAt = new Date(activityDraft.occurredAt).toISOString();
    const followUpAt = activityDraft.followUpAt ? new Date(activityDraft.followUpAt).toISOString() : null;
    if (Number.isNaN(Date.parse(occurredAt)) || (followUpAt && Number.isNaN(Date.parse(followUpAt)))) return setError("Activity and follow-up times must be valid.");
    const activity: DakotaActivity = { activityId: crypto.randomUUID().toLowerCase(), channel: activityDraft.channel, type: activityDraft.type, outcome: activityDraft.outcome, note: activityDraft.note.trim(), occurredAt, followUpAt };
    setSaved(false);
    setForm((current) => ({ ...current, activities: [...current.activities, activity] }));
    setActivityDraft(makeActivityDraft());
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    if (!notebookAvailable) return setError("The private operator notebook is unavailable. This dossier remains review-only.");
    if (!isValidCandidateKey(key)) return setError("This source record cannot be saved because its stable candidate key is invalid.");
    if (`${form.identity.source}:${form.identity.sourceId}`.toLowerCase() !== key) return setError("The private identity source must reproduce this candidate key exactly.");
    if (requiresApproval && !approvalConfirmed) return setError("Confirm the human approval statement before moving this record into pursuit.");
    if (requiresApproval && (!form.verifiedPain.trim() || !form.offerFit.trim())) return setError("Active pursuit requires verified pain and one specific offer fit.");
    const commercialClose = derivedCommercialClose(form.commercialClose);
    const payload = { ...form, actualRevenue: commercialClose.amountPaid, commercialClose };
    const validationError = validateRecord(payload, initialActivityIds.current, record, milestones);
    if (validationError) return setError(validationError);

    setSaving(true);
    try {
      await onSave(key, payload);
      setForm(payload);
      setBaseline(JSON.stringify(payload));
      initialActivityIds.current = payload.activities.map((activity) => activity.activityId);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The private operator record could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog className="opportunity-dialog" ref={dialogRef} aria-labelledby="opportunity-title" onCancel={(event) => { event.preventDefault(); requestClose(); }} onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <div className="opportunity-drawer opportunity-drawer--progressive">
        <header className="drawer-header">
          <div><p className="eyebrow"><span /> Conversion dossier</p><h2 id="opportunity-title">{candidateLabel(candidate)}</h2>{candidate.dba && candidate.dba !== candidate.business_name ? <p>{candidate.business_name}</p> : null}{savedOnly ? <span className="saved-record-tag">Saved record · reverify public facts</span> : null}</div>
          <button className="icon-button" type="button" onClick={requestClose} disabled={saving} aria-label="Close opportunity dossier"><X size={22} /></button>
        </header>
        <div className="drawer-command-bar">
          <span className={`stage-pill stage-pill--${form.status}`}>{STATUS_LABELS[form.status]}</span>
          <p>{STAGE_EXPLANATIONS[form.status]}</p>
          {recordUpdatedAt ? <small>Saved {formatTimestamp(recordUpdatedAt)}</small> : null}
        </div>
        <div className="drawer-safety"><ShieldCheck size={19} /><p><strong>Dakota prepares and records; David decides and sends.</strong> Copying text or opening Google Voice never records outreach, changes stage, or creates revenue.</p></div>
        <section className="drawer-score" aria-label="Signal, identity, and pursuit scores"><ScoreTriptych assessment={assessment} /></section>

        <form className="operator-form progressive-form" name="dakota-opportunity-v2" autoComplete="off" onSubmit={save} noValidate>
          <ProgressiveSection number="01" eyebrow="Identity and contact" title="Know exactly who and how" complete={form.contacts.some(isPursuitContact)} defaultOpen>
            <div className="evidence-summary">
              <dl><div><dt>Public source</dt><dd>{compactSource(candidate.source)}</dd></div><div><dt>Source record</dt><dd>{candidate.source_id || "Not provided"}</dd></div><div><dt>{savedOnly ? "Saved evidence" : "Queue measured"}</dt><dd>{formatTimestamp(queue.generated_at)}</dd></div><div><dt>Location</dt><dd>{placeLine(candidate) || "Not provided"}</dd></div></dl>
              <div className="evidence-columns"><div><p><FileSearch size={16} /> Why it surfaced</p>{reasons.length ? <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <span>No reasons provided.</span>}</div><div><p><CircleAlert size={16} /> Evidence gaps</p>{gaps.length ? <ul>{gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : <span>Independent verification still required.</span>}</div></div>
            </div>
            <fieldset className="identity-editor form-span"><legend>Private identity refinement</legend><p>Operator classification does not change the raw queue evidence above.</p><div>
              <label><FieldLabel>Storefront category</FieldLabel><input name="identity_category" maxLength={160} value={form.identity.category ?? ""} onChange={(event) => setIdentity("category", event.target.value)} /></label>
              <label><FieldLabel>City</FieldLabel><input name="identity_city" maxLength={160} value={form.identity.city ?? ""} onChange={(event) => setIdentity("city", event.target.value)} /></label>
              <label><FieldLabel>Borough or area</FieldLabel><input name="identity_borough" maxLength={160} value={form.identity.borough ?? ""} onChange={(event) => setIdentity("borough", event.target.value)} /></label>
              <label><FieldLabel hint="Private snapshot">Verified website</FieldLabel><input name="identity_verified_url" maxLength={2048} type="url" inputMode="url" value={form.identity.verifiedUrl ?? ""} onChange={(event) => setIdentity("verifiedUrl", event.target.value)} placeholder="https://…" /></label>
              <label className="form-span"><FieldLabel hint="Not a contact route">Public research source</FieldLabel><input name="identity_public_source_url" maxLength={2048} type="url" inputMode="url" value={form.identity.publicSourceUrl ?? ""} onChange={(event) => setIdentity("publicSourceUrl", event.target.value)} placeholder="https://…" /></label>
            </div></fieldset>
            <div className="contact-editor">
              <div className="subsection-heading"><div><p className="eyebrow">Verified contact routes</p><h4>Contact evidence is durable</h4></div><button type="button" className="text-button" onClick={addContact} disabled={form.contacts.length >= 8}><Plus size={17} /> {form.contacts.length >= 8 ? "8-contact limit" : "Add contact"}</button></div>
              {form.contacts.length ? <div className="contact-list">{form.contacts.map((contact, index) => <fieldset key={contact.contactId} className="contact-card"><legend>Contact {String(index + 1).padStart(2, "0")}</legend><div className="contact-card__status"><span className={`consent-dot consent-dot--${contact.consentClassification}`} />{CONSENT_LABELS[contact.consentClassification]}</div><div className="form-grid">
                <label><FieldLabel>Name</FieldLabel><input name={`contact_${index}_name`} value={contact.name} maxLength={160} onChange={(event) => setContact(contact.contactId, "name", event.target.value)} placeholder="Person or team…" /></label>
                <label><FieldLabel>Role</FieldLabel><input name={`contact_${index}_role`} value={contact.role} maxLength={160} onChange={(event) => setContact(contact.contactId, "role", event.target.value)} placeholder="Owner, manager, front desk…" /></label>
                <label><FieldLabel>Channel</FieldLabel><select name={`contact_${index}_channel`} value={contact.channel} onChange={(event) => setContact(contact.contactId, "channel", event.target.value)}>{CONTACT_CHANNELS.map((channel) => <option key={channel} value={channel}>{CONTACT_LABELS[channel]}</option>)}</select></label>
                <label><FieldLabel>Contact value</FieldLabel><input name={`contact_${index}_value`} type={contact.channel === "email" ? "email" : contact.channel === "phone" || contact.channel === "sms" ? "tel" : "url"} inputMode={contact.channel === "phone" || contact.channel === "sms" ? "tel" : contact.channel === "email" ? "email" : "url"} spellCheck={contact.channel !== "email"} value={contact.value} maxLength={contact.channel === "email" ? 254 : contact.channel === "phone" || contact.channel === "sms" ? 40 : 2048} onChange={(event) => setContact(contact.contactId, "value", event.target.value)} placeholder="Phone, email, or public route…" /></label>
                <label><FieldLabel hint="Required">Verified date</FieldLabel><input name={`contact_${index}_verified_at`} type="date" value={contact.verifiedAt} onChange={(event) => setContact(contact.contactId, "verifiedAt", event.target.value)} /></label>
                <label><FieldLabel>Consent classification</FieldLabel><select name={`contact_${index}_consent`} value={contact.consentClassification} onChange={(event) => setContact(contact.contactId, "consentClassification", event.target.value)}>{CONSENT_CLASSIFICATIONS.map((consent) => <option key={consent} value={consent}>{CONSENT_LABELS[consent]}</option>)}</select></label>
                <label className="form-span"><FieldLabel hint="Required">Public source URL</FieldLabel><input name={`contact_${index}_source_url`} type="url" inputMode="url" spellCheck={false} required value={contact.sourceUrl} maxLength={2048} onChange={(event) => setContact(contact.contactId, "sourceUrl", event.target.value)} placeholder="https://…" /></label>
              </div></fieldset>)}</div> : <div className="inline-empty"><UserRound size={22} /><p>No verified contact route is recorded. A public filing address is not a contact.</p></div>}
            </div>
            <div className="research-links"><p><SearchCheck size={16} /> Manual public research</p><div>{researchLinks.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{link.label} <ExternalLink size={15} /></a>)}{candidate.verified_url ? <a href={candidate.verified_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Verified site <ExternalLink size={15} /></a> : null}</div><span>Opening a public page records no activity.</span></div>
          </ProgressiveSection>

          <ProgressiveSection number="02" eyebrow="Pain and offer" title="Prove one revenue problem" complete={Boolean(form.verifiedPain.trim() && form.offerFit.trim())} defaultOpen={Boolean(form.contacts.length)}>
            <div className="money-path"><span>Customer action to verify</span><strong>{storefrontMoneyPath(classifiedCandidate.category)}</strong><p>A category prompt, not a measured conversion claim.</p></div>
            <div className="offer-suggestions">{suggestions.map((suggestion) => <button key={suggestion.name} type="button" onClick={() => setString("offerFit", `${suggestion.name}: ${suggestion.reason}`)}><strong>{suggestion.name}</strong><span>{suggestion.reason}</span></button>)}</div>
            <div className="form-grid progressive-fields">
              <label className="form-span"><FieldLabel hint="Observed fact only">Verified pain</FieldLabel><textarea name="verified_pain" maxLength={2000} rows={4} value={form.verifiedPain} onChange={(event) => setString("verifiedPain", event.target.value)} placeholder="What was checked, where, and when…" /></label>
              <label className="form-span"><FieldLabel hint="One specific Little Fight service">Offer fit</FieldLabel><textarea name="offer_fit" maxLength={1000} rows={4} value={form.offerFit} onChange={(event) => setString("offerFit", event.target.value)} placeholder="Why this exact offer follows from the evidence…" /></label>
              <label className="form-span"><FieldLabel hint="Real, approved work only">Proof to use</FieldLabel><textarea name="proof" maxLength={4000} rows={3} value={form.proof} onChange={(event) => setString("proof", event.target.value)} placeholder={`${proofLink.label}: ${proofLink.note}`} /></label>
              <label className="form-span"><FieldLabel>Private research notes</FieldLabel><textarea name="notes" maxLength={4000} rows={4} value={form.notes} onChange={(event) => setString("notes", event.target.value)} /></label>
            </div>
            <div className="operator-reference"><BookOpen size={18} /><span><strong>{proofLink.label}</strong>{proofLink.note}</span><a href={proofLink.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Review proof <ExternalLink size={15} /></a></div>
          </ProgressiveSection>

          <ProgressiveSection number="03" eyebrow="Approve pursuit" title="Make one human decision" complete={approved} defaultOpen={Boolean(form.verifiedPain.trim() && form.offerFit.trim())}>
            <div className="stage-explanation"><Target size={20} /><span><strong>{STATUS_LABELS[form.status]}</strong>{STAGE_EXPLANATIONS[form.status]}</span></div>
            <div className="form-grid progressive-fields">
              <label><FieldLabel>Status</FieldLabel><select name="status" value={form.status} onChange={(event) => setStatus(event.target.value as OperatorStatus)}>{OPERATOR_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label>
              <label><FieldLabel>Due date</FieldLabel><input name="due_date" type="date" value={form.dueDate} onChange={(event) => setString("dueDate", event.target.value)} /></label>
              <label className="form-span"><FieldLabel hint="For David, not the prospect">Next action</FieldLabel><input name="next_action" maxLength={1000} value={form.nextAction} onChange={(event) => setString("nextAction", event.target.value)} placeholder="Verify the booking path, then decide whether pursuit is justified…" /></label>
              <label><FieldLabel hint="Potential, never cash">Estimated value</FieldLabel><input name="estimated_value" type="number" min="0" max={MAX_MONEY} step="0.01" inputMode="decimal" value={form.estimatedValue ?? ""} onChange={(event) => setMoney("estimatedValue", event.target.value)} /></label>
            </div>
            {requiresApproval ? <label className="approval-gate"><input name="approval_confirmed" type="checkbox" checked={approvalConfirmed} onChange={(event) => { setSaved(false); setApprovalConfirmed(event.target.checked); }} /><span><strong>I verified the evidence and approve manual pursuit.</strong>This authorizes David’s judgment only. Dakota still cannot contact anyone.</span></label> : null}
          </ProgressiveSection>

          <ProgressiveSection number="04" eyebrow="Manual outreach and activity" title="Prepare, then record what actually happened" complete={Boolean(form.activities.length)} defaultOpen={requiresApproval}>
            <div className="manual-outreach">
              <div className="subsection-heading"><div><p className="eyebrow">Manual message</p><h4>Copy and open—never send</h4></div><button type="button" className="text-button" onClick={prepareDraft} disabled={!form.verifiedPain.trim() || !form.offerFit.trim()}>Prepare draft</button></div>
              <label><FieldLabel>Private outreach draft</FieldLabel><textarea name="draft" maxLength={6000} rows={9} value={form.draft} onChange={(event) => setString("draft", event.target.value)} placeholder="Prepare a concise, evidence-specific message. Nothing sends from Dakota…" /></label>
              {usableContact && approved ? (
                <div className="voice-handoff">
                  <div><Phone size={20} /><span><strong>{usableContact.value}</strong>{usableContact.name || "Verified contact"} · {CONSENT_LABELS[usableContact.consentClassification]}</span></div>
                  <div>
                    <button type="button" className="primary-button" onClick={() => void copyDraft()} disabled={!form.draft.trim()}>{copyState === "copied" ? <Check size={17} /> : <Copy size={17} />}{copyState === "copied" ? "Draft copied" : "Copy draft"}</button>
                    {voiceContact ? <a className="secondary-button" href="https://voice.google.com/u/0/messages" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open Google Voice <ExternalLink size={16} /></a> : null}
                  </div>
                  <p><ShieldCheck size={16} /> Copying never records contact. {voiceContact ? "Paste, verify the recipient, and press Send yourself in Google Voice." : "Choose the correct external channel and send manually."}</p>
                  <span className="sr-only" role="status" aria-live="polite">{copyState === "copied" ? "Draft copied. No outreach was recorded." : ""}</span>
                </div>
              ) : <div className="voice-locked"><ShieldCheck size={20} /><span><strong>Manual handoff is locked.</strong>Approve pursuit, verify an allowed contact route, and save that evidence before copying a draft.</span></div>}
              {usableContact && approved && !voiceContact ? <div className="voice-locked"><ShieldCheck size={20} /><span><strong>Google Voice text remains locked.</strong>It requires a verified phone or SMS contact classified explicit inquiry or existing relationship. A public business number is not text consent.</span></div> : null}
              {copyState === "error" ? <p className="copy-error" role="status">Clipboard access failed. The draft remains in Dakota.</p> : null}
            </div>
            <div className="activity-composer">
              <div className="subsection-heading"><div><p className="eyebrow">Explicit evidence entry</p><h4>Record the real-world action</h4></div><Activity size={20} /></div>
              <p>Only use this after the action happened. Opening, copying, drafting, or planning is not outreach.</p>
              <div className="form-grid progressive-fields">
                <label><FieldLabel>Activity type</FieldLabel><select name="activity_type" value={activityDraft.type} onChange={(event) => setActivityDraft((current) => ({ ...current, type: event.target.value as DakotaActivityType }))}>{ACTIVITY_TYPES.map((type) => <option key={type} value={type}>{ACTIVITY_TYPE_LABELS[type]}</option>)}</select></label>
                <label><FieldLabel>Channel</FieldLabel><select name="activity_channel" value={activityDraft.channel} onChange={(event) => setActivityDraft((current) => ({ ...current, channel: event.target.value as DakotaActivityChannel }))}>{ACTIVITY_CHANNELS.map((channel) => <option key={channel} value={channel}>{channel.replace(/_/gu, " ")}</option>)}</select></label>
                <label><FieldLabel>Outcome</FieldLabel><select name="activity_outcome" value={activityDraft.outcome} onChange={(event) => setActivityDraft((current) => ({ ...current, outcome: event.target.value as DakotaActivityOutcome }))}>{ACTIVITY_OUTCOMES.map((outcome) => <option key={outcome} value={outcome}>{outcome.replace(/_/gu, " ")}</option>)}</select></label>
                <label><FieldLabel>Occurred at</FieldLabel><input name="activity_occurred_at" type="datetime-local" value={activityDraft.occurredAt} onChange={(event) => setActivityDraft((current) => ({ ...current, occurredAt: event.target.value }))} /></label>
                <label className="form-span"><FieldLabel hint="Factual evidence">Activity note</FieldLabel><textarea name="activity_note" rows={3} maxLength={2000} value={activityDraft.note} onChange={(event) => setActivityDraft((current) => ({ ...current, note: event.target.value }))} placeholder="What actually happened, including channel and result…" /></label>
                <label><FieldLabel>Next follow-up</FieldLabel><input name="activity_follow_up_at" type="datetime-local" value={activityDraft.followUpAt} onChange={(event) => setActivityDraft((current) => ({ ...current, followUpAt: event.target.value }))} /></label>
              </div>
              <button type="button" className="text-button record-activity-button" onClick={appendActivity} disabled={form.activities.length >= 100}><Plus size={17} /> {form.activities.length >= 100 ? "Activity limit reached" : activityDraft.type === "outreach" && activityDraft.outcome === "sent" ? "Record sent activity" : "Append activity evidence"}</button>
            </div>
            <div className="activity-timeline"><div className="subsection-heading"><div><p className="eyebrow">Append-only timeline</p><h4>{form.activities.length ? `${form.activities.length} explicit events` : "No activity recorded"}</h4></div></div>{form.activities.length ? <ol>{[...form.activities].reverse().map((activity) => <li key={activity.activityId}><span className="activity-marker" /><div><p><strong>{ACTIVITY_TYPE_LABELS[activity.type]}</strong><span>{activity.channel.replace(/_/gu, " ")} · {activity.outcome.replace(/_/gu, " ")}</span></p><time dateTime={activity.occurredAt}>{formatTimestamp(activity.occurredAt)}</time><blockquote>{activity.note}</blockquote>{activity.followUpAt ? <small>Follow up {formatTimestamp(activity.followUpAt)}</small> : null}</div></li>)}</ol> : <div className="inline-empty"><Activity size={22} /><p>Timeline starts only when David records something that actually happened.</p></div>}</div>
          </ProgressiveSection>

          <ProgressiveSection number="05" eyebrow="Discovery and proposal" title="Turn a real need into a priced decision" complete={Boolean(form.commercialClose.proposalRef && form.commercialClose.proposalSentDate && form.commercialClose.proposalAmount !== null)} defaultOpen={["meeting", "proposal", "won", "paid"].includes(form.status)}>
            <div className="stage-explanation"><FileCheck2 size={20} /><span><strong>Proposal evidence</strong>Record the real document reference, sent date, and amount. Preparing a document is not sending it.</span></div>
            <div className="form-grid progressive-fields">
              <label><FieldLabel>Proposal reference</FieldLabel><input name="proposal_ref" maxLength={240} value={form.commercialClose.proposalRef} onChange={(event) => setCommercial("proposalRef", event.target.value)} placeholder="Proposal number or private title…" /></label>
              <label><FieldLabel>Proposal amount</FieldLabel><input name="proposal_amount" type="number" min="0" max={MAX_MONEY} step="0.01" inputMode="decimal" value={form.commercialClose.proposalAmount ?? ""} onChange={(event) => setCommercial("proposalAmount", parseMoney(event.target.value))} /></label>
              <label><FieldLabel>Proposal sent date</FieldLabel><input name="proposal_sent_date" type="date" value={form.commercialClose.proposalSentDate} onChange={(event) => setCommercial("proposalSentDate", event.target.value)} /></label>
            </div>
          </ProgressiveSection>

          <ProgressiveSection number="06" eyebrow="Signed and paid" title="Separate commitment from cleared cash" complete={form.status === "paid" && Boolean(form.commercialClose.paidDate)} defaultOpen={["won", "paid"].includes(form.status)}>
            <div className="cash-truth"><ReceiptText size={22} /><div><span>Balance due</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(balance)}</strong><p>Derived from amount due minus amount paid. It is never entered twice.</p></div></div>
            <div className="form-grid progressive-fields">
              <label><FieldLabel>Signed date</FieldLabel><input name="signed_date" type="date" value={form.commercialClose.signedDate} onChange={(event) => setCommercial("signedDate", event.target.value)} /></label>
              <label><FieldLabel>Invoice reference</FieldLabel><input name="invoice_ref" maxLength={240} value={form.commercialClose.invoiceRef} onChange={(event) => setCommercial("invoiceRef", event.target.value)} /></label>
              <label><FieldLabel>Amount due</FieldLabel><input name="amount_due" type="number" min="0" max={MAX_MONEY} step="0.01" inputMode="decimal" value={form.commercialClose.amountDue ?? ""} onChange={(event) => setCommercial("amountDue", parseMoney(event.target.value))} /></label>
              <label><FieldLabel hint="Cleared cash only">Amount paid</FieldLabel><input name="amount_paid" type="number" min="0" max={MAX_MONEY} step="0.01" inputMode="decimal" value={form.commercialClose.amountPaid ?? ""} onChange={(event) => setCommercial("amountPaid", parseMoney(event.target.value))} /></label>
              <label><FieldLabel>Paid date</FieldLabel><input name="paid_date" type="date" value={form.commercialClose.paidDate} onChange={(event) => setCommercial("paidDate", event.target.value)} /></label>
              <label className="form-span"><FieldLabel>Onboarding next action</FieldLabel><input name="onboarding_next_action" maxLength={1000} value={form.commercialClose.onboardingNextAction} onChange={(event) => setCommercial("onboardingNextAction", event.target.value)} placeholder="Send kickoff details after cleared deposit…" /></label>
              <label className="form-span"><FieldLabel>Win or loss reason</FieldLabel><input name="win_loss_reason" maxLength={1000} value={form.winLossReason} onChange={(event) => setString("winLossReason", event.target.value)} placeholder="Record only after a real outcome…" /></label>
            </div>
          </ProgressiveSection>

          {milestoneEntries.length ? <dl className="milestone-ledger" aria-label="Server-owned opportunity milestones">{milestoneEntries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatTimestamp(value)}</dd></div>)}</dl> : null}
          {error ? <div className="form-error" ref={errorRef} tabIndex={-1} role="alert"><CircleAlert size={18} />{error}</div> : null}
          {saved ? <div className="form-success" role="status"><Check size={18} />Private record saved. No unrecorded outreach occurred.</div> : null}
          <footer className="drawer-footer drawer-footer--sticky"><button type="button" className="secondary-button" onClick={requestClose} disabled={saving}>Close dossier</button><span>{dirty ? "Unsaved private changes" : "Record is saved"}</span><button type="submit" className="primary-button" disabled={saving || !notebookAvailable}>{saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />} Save record</button></footer>
        </form>
      </div>
    </dialog>
  );
}
