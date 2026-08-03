import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Activity,
  BookOpen,
  CalendarClock,
  Check,
  ChevronDown,
  CircleCheckBig,
  CircleAlert,
  Copy,
  ExternalLink,
  FileCheck2,
  FileSearch,
  ListTodo,
  LoaderCircle,
  Mail,
  MessageSquareText,
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
  HUMAN_APPROVED_STATUSES,
  isHumanApprovedRecord,
  isPursuitContact,
  isValidCandidateKey,
  isVerifiedContactRoute,
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
  ACTIVITY_TYPES,
  CONSENT_CLASSIFICATIONS,
  CONTACT_CHANNELS,
  OPERATOR_STATUSES,
  TASK_TYPES,
  type Candidate,
  type DakotaActivity,
  type DakotaActivityChannel,
  type DakotaActivityOutcome,
  type DakotaActivityType,
  type DakotaCommercialClose,
  type DakotaConsentClassification,
  type DakotaContactChannel,
  type DakotaTask,
  type DakotaTaskChannel,
  type DakotaTaskStatus,
  type DakotaTaskType,
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
import {
  BOOKING_HREF,
  FUTURE_COMMERCIAL_DATE_ERROR,
  GOOGLE_VOICE_CALLS_HREF,
  GOOGLE_VOICE_MESSAGES_HREF,
  NEW_TASK_FIRST_SAVE_ERROR,
  PAID_ONBOARDING_TASK_ERROR,
  TASK_TYPE_LABELS,
  buildGmailComposeHref,
  buildValueBrief,
  canUseGmailCompose,
  canUseGoogleVoice,
  hasAlignedPaidOnboardingTask,
  isCommercialDateBeyondUtcTomorrow,
  isPersistedOpenTask,
  selectedPersistedContact,
  taskContactMatchesChannel,
  validateAppendedTaskStates,
} from "./workflow";

const MAX_MONEY = 100_000_000;
const ACTIVE_PURSUIT_STATUSES = new Set<OperatorStatus>(["pursuit_ready", "pursuing", "replied", "meeting", "proposal", "won", "paid"]);
const OPEN_TASK_REQUIRED_STATUSES = new Set<OperatorStatus>(["research_ready", "pursuit_ready", "pursuing", "replied", "meeting", "proposal", "won", "paid", "snoozed"]);
const NO_OPEN_TASK_STATUSES = new Set<OperatorStatus>(["early_signal", "lost", "not_fit", "do_not_contact"]);
const HTML_LIKE_CONTENT = /(?:[<>]|<!--|--!?>|&(?:lt|gt|amp|quot|apos|#(?:x[0-9a-f]+|[0-9]+));)/iu;
const URL_LIKE_CONTENT = /(?:\b(?:https?|ftp|file|data|javascript|mailto):|:\/\/|\bwww\.)/iu;

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
  website_form: "Website form — evidence only",
  linkedin: "LinkedIn — evidence only",
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

const ACTIVITY_RULES: Record<DakotaActivityType, Partial<Record<DakotaActivityChannel, readonly DakotaActivityOutcome[]>>> = {
  note: { internal: ["recorded"] },
  outreach: {
    email: ["sent", "delivered", "no_response"],
    phone: ["sent", "connected", "voicemail", "no_response"],
    sms: ["sent", "delivered", "no_response"],
    website_form: ["sent", "delivered", "no_response"],
    linkedin: ["sent", "delivered", "no_response"],
  },
  reply: {
    email: ["replied", "completed", "declined"],
    phone: ["replied", "connected", "completed", "declined"],
    sms: ["replied", "completed", "declined"],
    website_form: ["replied", "completed", "declined"],
    linkedin: ["replied", "completed", "declined"],
  },
  call: { phone: ["connected", "voicemail", "completed", "declined", "no_response"] },
  meeting: { meeting: ["scheduled", "completed", "declined", "no_response"] },
  proposal_sent: { proposal: ["sent", "delivered", "completed", "declined", "no_response"] },
  contract_signed: { contract: ["completed", "won"] },
  invoice_sent: { invoice: ["sent", "delivered", "completed", "no_response"] },
  payment_received: { payment: ["paid"] },
  follow_up: {
    internal: ["recorded", "scheduled", "completed"],
    email: ["sent", "delivered", "completed", "no_response"],
    phone: ["connected", "voicemail", "completed", "no_response"],
    sms: ["sent", "delivered", "completed", "no_response"],
  },
};

const TASK_CHANNEL_LABELS: Record<DakotaTaskChannel, string> = {
  internal: "Inside Dakota",
  email: "Email",
  phone: "Phone call",
  sms: "Google Voice text",
  meeting: "Meeting",
  proposal: "Proposal",
  invoice: "Invoice",
  payment: "Payment",
};

const TASK_CHANNEL_RULES: Record<DakotaTaskType, readonly DakotaTaskChannel[]> = {
  research: ["internal"],
  qualify: ["internal"],
  value_brief: ["internal"],
  outreach: ["email", "phone", "sms"],
  follow_up: ["internal", "email", "phone", "sms"],
  meeting: ["meeting"],
  proposal: ["proposal"],
  invoice: ["invoice"],
  payment: ["payment"],
  onboarding: ["internal"],
};

const ACTIVITY_TASK_TYPES: Partial<Record<DakotaActivityType, readonly DakotaTaskType[]>> = {
  outreach: ["outreach"],
  reply: ["outreach", "follow_up"],
  call: ["outreach", "follow_up"],
  meeting: ["meeting"],
  proposal_sent: ["proposal"],
  contract_signed: ["proposal"],
  invoice_sent: ["invoice"],
  payment_received: ["payment"],
  follow_up: ["follow_up"],
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
}

interface TaskDraft {
  type: DakotaTaskType;
  title: string;
  dueAt: string;
  contactId: string;
  channel: DakotaTaskChannel;
}

function localDateTimeValue(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function makeActivityDraft(): ActivityDraft {
  return { channel: "internal", type: "note", outcome: "recorded", note: "", occurredAt: localDateTimeValue() };
}

function activityOutcomes(type: DakotaActivityType, channel: DakotaActivityChannel): readonly DakotaActivityOutcome[] {
  return ACTIVITY_RULES[type][channel] ?? [];
}

function linkedActivityChannels(type: DakotaActivityType, task: DakotaTask | null): DakotaActivityChannel[] {
  if (type === "note") return ["internal"];
  if (!task) return [];
  if (!ACTIVITY_TASK_TYPES[type]?.includes(task.type)) return [];
  const channel: DakotaActivityChannel = type === "contract_signed" && task.type === "proposal"
    ? "contract"
    : task.channel;
  return ACTIVITY_RULES[type][channel] ? [channel] : [];
}

function nextTaskType(status: OperatorStatus): DakotaTaskType {
  if (status === "early_signal" || status === "research_ready" || status === "snoozed") return "research";
  if (status === "pursuit_ready") return "value_brief";
  if (status === "pursuing") return "follow_up";
  if (status === "replied") return "meeting";
  if (status === "meeting") return "proposal";
  if (status === "proposal") return "follow_up";
  if (status === "won") return "invoice";
  if (status === "paid") return "onboarding";
  return "qualify";
}

function taskChannels(type: DakotaTaskType): readonly DakotaTaskChannel[] {
  return TASK_CHANNEL_RULES[type];
}

function makeTaskDraft(status: OperatorStatus, contactId: string | null): TaskDraft {
  const type = nextTaskType(status);
  const channel = taskChannels(type)[0] ?? "internal";
  return {
    type,
    title: "",
    dueAt: "",
    contactId: channel === "internal" ? "" : contactId ?? "",
    channel,
  };
}

function dueAtForInput(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
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
  return containsUnsupportedControlCharacter(value) || HTML_LIKE_CONTENT.test(value) || URL_LIKE_CONTENT.test(value);
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

function sameTaskCore(left: DakotaTask, right: DakotaTask): boolean {
  return (
    left.taskId === right.taskId &&
    left.type === right.type &&
    left.title === right.title &&
    left.dueAt === right.dueAt &&
    left.contactId === right.contactId &&
    left.channel === right.channel &&
    left.createdAt === right.createdAt
  );
}

function hasLinkedActivityEvidence(
  record: OperatorRecordInput,
  type: DakotaActivityType,
  outcomes: DakotaActivityOutcome[],
): boolean {
  return record.activities.some((activity) => {
    if (activity.type !== type || !outcomes.includes(activity.outcome) || !activity.taskId) return false;
    const task = record.tasks.find((candidate) => candidate.taskId === activity.taskId);
    if (!task) return false;
    if (activity.channel === "internal") return activity.contactId === null;
    if (!activity.contactId) return false;
    const contact = record.contacts.find((candidate) => candidate.contactId === activity.contactId);
    if (!contact || !isPursuitContact(contact)) return false;
    if (["email", "phone", "sms"].includes(activity.channel) && contact.channel !== activity.channel) return false;
    return task.contactId === activity.contactId;
  });
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
    if (hasUnsafeText(value)) return `${field} must remain plain text without links, HTML, or unsupported control characters.`;
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
    if ([contact.name, contact.role].some(hasUnsafeText)) return "Contact names and roles must remain plain text.";
    if (["email", "phone", "sms"].includes(contact.channel) && hasUnsafeText(contact.value)) return "Email and phone contact values must remain plain text.";
    if (!contact.sourceUrl || !isSafePublicHttps(contact.sourceUrl)) return "Every contact needs a safe public HTTPS source URL.";
    if (!contact.verifiedAt || !isRealDateOnly(contact.verifiedAt)) return "Every saved contact needs a real verification date.";
    if (!isVerifiedContactRoute(contact)) return "Every saved contact needs a valid channel value, a name or role, and server-grade verification evidence.";
  }
  if (record.selectedContactId && !record.contacts.some((contact) => contact.contactId === record.selectedContactId && isPursuitContact(contact))) return "The selected contact must match one usable verified contact route.";

  if (record.activities.length > 100) return "Dakota stores at most 100 append-only activity events per opportunity.";
  const evidenceTaskIds = new Set<string>();
  const previousOpenTask = originalRecord.tasks.find((task) => task.status === "open");
  if (previousOpenTask) evidenceTaskIds.add(previousOpenTask.taskId);
  record.tasks.slice(originalRecord.tasks.length).forEach((task) => evidenceTaskIds.add(task.taskId));
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
    if (!ACTIVITY_RULES[activity.type][activity.channel]?.includes(activity.outcome)) return "Activity type, channel, and outcome must describe one possible real-world event.";
    if (!originalActivityIdSet.has(activity.activityId)) {
      if (activity.type === "note") {
        if (activity.channel !== "internal" || activity.taskId !== null || activity.contactId !== null) return "New notes must remain internal and unlinked to an external contact.";
      } else {
        const activityTask = activity.taskId ? record.tasks.find((task) => task.taskId === activity.taskId) ?? null : null;
        if (!activityTask || !evidenceTaskIds.has(activityTask.taskId) || !linkedActivityChannels(activity.type, activityTask).includes(activity.channel)) return "New activity evidence must reference the previously open task or one newly created task with a matching purpose.";
        const activityTime = Date.parse(activity.occurredAt);
        if (activityTime < Date.parse(activityTask.createdAt) - 5 * 60_000) return "Activity evidence cannot predate its linked task.";
        if (activityTask.resolvedAt && activityTime > Date.parse(activityTask.resolvedAt) + 5 * 60_000) return "Activity evidence cannot occur after its linked task was resolved.";
        if (activity.channel === "internal") {
          if (activity.contactId !== null) return "Internal activity evidence cannot reference an external contact.";
        } else {
          const activityContact = activity.contactId ? record.contacts.find((contact) => contact.contactId === activity.contactId) ?? null : null;
          if (!activityContact || !isPursuitContact(activityContact) || activity.contactId !== record.selectedContactId) return "External activity evidence must reference the exact selected usable contact.";
          if (["email", "phone", "sms"].includes(activity.channel) && activityContact.channel !== activity.channel) return "Direct activity evidence must match its selected contact channel.";
          if (activityTask.contactId && activityTask.contactId !== activity.contactId) return "Activity evidence must match the contact locked to its durable task.";
        }
      }
    }
  }

  if (record.tasks.length > 100) return "Dakota stores at most 100 durable tasks per opportunity.";
  const taskIds = new Set<string>();
  const originalTasks = new Map(originalRecord.tasks.map((task) => [task.taskId, task]));
  const originalTaskOrder = originalRecord.tasks.map((task) => task.taskId);
  const persistedSelectedRoute = selectedPersistedContact(
    record,
    originalRecord.contacts,
    originalRecord.selectedContactId,
  );
  if (record.tasks.slice(0, originalTaskOrder.length).some((task, index) => task.taskId !== originalTaskOrder[index])) return "Task history is durable. Earlier tasks cannot be removed or reordered.";
  const appendedTaskStateError = validateAppendedTaskStates(record.tasks, originalRecord.tasks);
  if (appendedTaskStateError) return appendedTaskStateError;
  for (const task of record.tasks) {
    if (!task.taskId || taskIds.has(task.taskId)) return "Every task needs a unique stable ID.";
    taskIds.add(task.taskId);
    const originalTask = originalTasks.get(task.taskId);
    if (!task.title.trim() || task.title !== task.title.trim() || task.title.length > 240 || hasUnsafeText(task.title)) return "Every task needs a plain-text title of 240 characters or fewer.";
    if (!task.createdAt || Number.isNaN(Date.parse(task.createdAt))) return "Every task needs a valid creation time.";
    if (task.dueAt && Number.isNaN(Date.parse(task.dueAt))) return "Task due time must be valid.";
    const taskContact = task.contactId ? record.contacts.find((contact) => contact.contactId === task.contactId) ?? null : null;
    if (!taskChannels(task.type).includes(task.channel)) return "Task type and channel must describe one possible next action.";
    if (task.channel === "internal" && task.contactId) return "Internal tasks cannot reference an external contact route.";
    if (task.channel !== "internal" && (!taskContact || !taskContactMatchesChannel(taskContact, task.channel))) return "Every non-internal task requires one matching usable verified contact route.";
    if (task.channel !== "internal" && task.contactId !== record.selectedContactId) return "Every non-internal task must use the opportunity’s exact selected contact route.";
    if (!originalTask && task.channel !== "internal" && task.contactId !== persistedSelectedRoute?.contactId) return "Save the exact selected contact route before creating a non-internal task.";
    if (task.status === "open" && (task.resolvedAt || task.resolutionNote)) return "An open task cannot contain resolution evidence.";
    if (task.status !== "open" && (!task.resolvedAt || Number.isNaN(Date.parse(task.resolvedAt)) || !task.resolutionNote.trim())) return "A completed or skipped task needs its resolution time and factual note.";
    if (task.resolutionNote.length > 1000 || hasUnsafeText(task.resolutionNote)) return "Task resolution notes must be 1,000 plain-text characters or fewer.";
    if (originalTask && !sameTaskCore(originalTask, task)) return "Existing task instructions are immutable. Resolve the task and create the next one instead.";
    if (originalTask && originalTask.status !== "open" && JSON.stringify(originalTask) !== JSON.stringify(task)) return "Resolved task evidence is immutable.";
    if (originalTask?.status === "open" && task.status === "open" && JSON.stringify(originalTask) !== JSON.stringify(task)) return "An open saved task cannot be edited. Resolve it and create the next one.";
  }
  const openTasks = record.tasks.filter((task) => task.status === "open");
  if (openTasks.length > 1) return "Each opportunity can have only one open next task.";
  if (OPEN_TASK_REQUIRED_STATUSES.has(record.status) && openTasks.length !== 1) return "This stage requires exactly one open next task.";
  if (NO_OPEN_TASK_STATUSES.has(record.status) && openTasks.length) return "This stage cannot keep an open task. Complete or skip it with a factual note.";

  const close = record.commercialClose;
  const priorClose = originalRecord.commercialClose;
  if (![close.proposalSentDate, close.signedDate, close.paidDate].every(isRealDateOnly)) return "Commercial dates must be real calendar dates.";
  for (const field of ["proposalSentDate", "signedDate", "paidDate"] as const) {
    if (close[field] !== priorClose[field] && isCommercialDateBeyondUtcTomorrow(close[field])) return FUTURE_COMMERCIAL_DATE_ERROR;
  }
  if (![close.proposalAmount, close.amountDue, close.amountPaid].every(isValidMoney)) return "Commercial amounts must be between 0 and 100,000,000 with at most two decimal places.";
  if ([close.proposalRef, close.invoiceRef, close.onboardingNextAction].some((value) => hasUnsafeText(value) || value !== value.trim())) return "Commercial evidence must remain trimmed plain text.";
  if ((priorClose.proposalRef && !close.proposalRef) || (priorClose.proposalAmount !== null && close.proposalAmount === null) || (priorClose.proposalSentDate && !close.proposalSentDate)) return "Recorded proposal truth cannot be erased. Append matching evidence for a factual correction.";
  if (priorClose.signedDate && !close.signedDate) return "A recorded signed date cannot be erased. Append matching evidence for a factual correction.";
  if ((priorClose.invoiceRef && !close.invoiceRef) || (priorClose.amountDue !== null && close.amountDue === null)) return "Recorded invoice truth cannot be erased. Append matching evidence for a factual correction.";
  const contacted = Boolean(milestones?.firstContactedAt) ||
    hasLinkedActivityEvidence(record, "outreach", ["sent", "delivered", "connected", "voicemail", "no_response"]) ||
    hasLinkedActivityEvidence(record, "call", ["connected", "voicemail", "completed", "no_response"]);
  const replied = Boolean(milestones?.repliedAt) || hasLinkedActivityEvidence(record, "reply", ["replied", "connected", "completed"]);
  const met = Boolean(milestones?.meetingAt) || hasLinkedActivityEvidence(record, "meeting", ["scheduled", "completed"]);
  const proposalSent = Boolean(milestones?.proposalAt) || hasLinkedActivityEvidence(record, "proposal_sent", ["sent", "delivered", "completed"]);
  const signed = Boolean(milestones?.wonAt) || hasLinkedActivityEvidence(record, "contract_signed", ["completed", "won"]);
  const preservedInvoiceTruth = Boolean(
    originalRecord.commercialClose.invoiceRef &&
    close.invoiceRef === originalRecord.commercialClose.invoiceRef &&
    close.amountDue === originalRecord.commercialClose.amountDue
  );
  const invoiceSent = preservedInvoiceTruth || hasLinkedActivityEvidence(record, "invoice_sent", ["sent", "delivered", "completed"]);
  const paid = Boolean(milestones?.paidAt) || hasLinkedActivityEvidence(record, "payment_received", ["paid"]);
  const hasProposalData = Boolean(close.proposalRef || close.proposalSentDate || close.proposalAmount !== null);
  if (hasProposalData && (!close.proposalRef || !close.proposalSentDate || close.proposalAmount === null || !proposalSent)) return "Any proposal value requires its reference, amount, sent date, and explicit proposal-sent activity.";
  const hasInvoiceData = Boolean(close.invoiceRef || close.amountDue !== null);
  if (hasInvoiceData && (!close.invoiceRef || close.amountDue === null || !invoiceSent)) return "Any invoiced amount requires its invoice reference, amount due, and explicit invoice-sent activity.";
  if (close.signedDate && !signed) return "A signed date requires explicit completed contract-signed evidence.";
  const hasPaymentData = Boolean(close.paidDate || (close.amountPaid ?? 0) > 0);
  if (hasPaymentData && (!close.paidDate || close.amountPaid === null || close.amountPaid <= 0 || !paid)) return "Paid cash requires its positive cleared amount, paid date, and explicit payment-received activity with a paid outcome.";
  const appendedActivities = record.activities.filter((activity) => !originalActivityIdSet.has(activity.activityId));
  const hasNewEvidence = (type: DakotaActivityType) => appendedActivities.some((activity) => activity.type === type && activity.taskId !== null);
  const proposalChanged = ["proposalRef", "proposalAmount", "proposalSentDate"].some((field) => close[field as keyof DakotaCommercialClose] !== priorClose[field as keyof DakotaCommercialClose]);
  const invoiceChanged = ["invoiceRef", "amountDue"].some((field) => close[field as keyof DakotaCommercialClose] !== priorClose[field as keyof DakotaCommercialClose]);
  const paymentChanged = close.amountPaid !== priorClose.amountPaid || close.paidDate !== priorClose.paidDate;
  if (proposalChanged && !hasNewEvidence("proposal_sent")) return "Changing proposal truth requires a newly appended proposal-sent event linked to the current task and exact contact.";
  if (close.signedDate !== originalRecord.commercialClose.signedDate && !hasNewEvidence("contract_signed")) return "Changing the signed date requires a newly appended contract-signed event linked to the current task and exact contact.";
  if (invoiceChanged && !hasNewEvidence("invoice_sent")) return "Changing invoice truth requires a newly appended invoice-sent event linked to the current task and exact contact.";
  if ((close.amountPaid ?? 0) < (priorClose.amountPaid ?? 0)) return "Cleared cash cannot be reduced. Record any correction through the financial source of truth before changing Dakota.";
  if (paymentChanged && !hasNewEvidence("payment_received")) return "Changing cleared cash requires a newly appended payment-received event linked to the current task and exact contact.";
  if (originalRecord.status === "do_not_contact" && record.status !== "do_not_contact" && !dncConsentChanged(originalRecord, record)) return "Leave do-not-contact only after intentionally changing an existing consent classification or adding a newly verified allowed contact.";
  if (ACTIVE_PURSUIT_STATUSES.has(record.status) && !record.contacts.some(isPursuitContact)) return "Active pursuit requires a verified contact classified explicit inquiry, existing relationship, or public business.";
  if (ACTIVE_PURSUIT_STATUSES.has(record.status) && !record.contacts.some((contact) => contact.contactId === record.selectedContactId && isPursuitContact(contact))) return "Active pursuit requires one exact verified contact selected for the next human action.";
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
  if (record.status === "snoozed" && (!openTasks[0]?.dueAt || openTasks[0].dueAt.slice(0, 10) !== record.dueDate)) return "Snoozed requires one timed open task whose date matches the wake date.";
  if (record.status === "paid" && !hasAlignedPaidOnboardingTask(record)) {
    const previousOpenTask = originalRecord.tasks.find((task) => task.status === "open");
    const unchangedLegacyPaidTask = (
      originalRecord.status === "paid" &&
      !hasAlignedPaidOnboardingTask(originalRecord) &&
      previousOpenTask?.taskId === openTasks[0]?.taskId &&
      close.onboardingNextAction === priorClose.onboardingNextAction
    );
    if (!unchangedLegacyPaidTask) return PAID_ONBOARDING_TASK_ERROR;
  }
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
  onSave: (key: string, record: OperatorRecordInput, expectedUpdatedAt: string | null) => Promise<string>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const initialActivityIds = useRef(record.activities.map((activity) => activity.activityId));
  const initialRecord = useMemo<OperatorRecordInput>(() => ({
    ...record,
    identity: { ...record.identity },
    contacts: record.contacts.map((contact) => ({ ...contact })),
    activities: record.activities.map((activity) => ({ ...activity })),
    tasks: record.tasks.map((task) => ({ ...task })),
    commercialClose: derivedCommercialClose({ ...record.commercialClose }),
  }), [record]);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialRecord));
  const [baselineUpdatedAt, setBaselineUpdatedAt] = useState<string | null>(recordUpdatedAt ?? null);
  const [baselineMilestones, setBaselineMilestones] = useState<OperatorMilestones | undefined>(milestones);
  const [form, setForm] = useState<OperatorRecordInput>(initialRecord);
  const [approvalConfirmed, setApprovalConfirmed] = useState(HUMAN_APPROVED_STATUSES.has(record.status));
  const [activityDraft, setActivityDraft] = useState<ActivityDraft>(makeActivityDraft);
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(() => makeTaskDraft(record.status, record.selectedContactId));
  const [taskResolution, setTaskResolution] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "draft" | "brief" | "booking" | "phone" | "error">("idle");
  const dirty = useMemo(() => JSON.stringify(form) !== baseline, [baseline, form]);
  const externalConflict = (recordUpdatedAt ?? null) !== baselineUpdatedAt;
  const baselineRecord = useMemo<OperatorRecordInput>(() => {
    try { return JSON.parse(baseline) as OperatorRecordInput; }
    catch { return initialRecord; }
  }, [baseline, initialRecord]);
  const persistedContacts = baselineRecord.contacts;
  const persistedContactIds = useMemo(() => new Set(persistedContacts.map((contact) => contact.contactId)), [persistedContacts]);
  const persistedSelectedContactId = baselineRecord.selectedContactId;

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

  const loadLatestRecord = () => {
    if (dirty && !window.confirm("Discard these unsaved edits and load the newer saved record?")) return;
    const nextBaseline = JSON.stringify(initialRecord);
    setForm(initialRecord);
    setBaseline(nextBaseline);
    setBaselineUpdatedAt(recordUpdatedAt ?? null);
    setBaselineMilestones(milestones);
    initialActivityIds.current = initialRecord.activities.map((activity) => activity.activityId);
    setError("");
    setSaved(false);
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
    setTaskDraft((current) => {
      const type = nextTaskType(status);
      const channel = taskChannels(type)[0] ?? "internal";
      return { ...current, type, channel, contactId: channel === "internal" ? "" : current.contactId };
    });
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
  const selectContact = (contactId: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, selectedContactId: contactId }));
    setTaskDraft((current) => current.channel === "internal" ? current : { ...current, contactId: "" });
  };
  const addContact = () => {
    if (form.contacts.length >= 8) return setError("Dakota stores at most 8 verified contact routes per opportunity.");
    setSaved(false);
    setForm((current) => ({ ...current, contacts: [...current.contacts, { contactId: crypto.randomUUID().toLowerCase(), name: "", role: "", channel: "phone", value: "", sourceUrl: "", verifiedAt: "", consentClassification: "unknown" }] }));
  };

  const addTask = () => {
    setError("");
    if (form.tasks.length >= 100) return setError("Dakota’s 100-task limit is reached. Resolve the opportunity before adding more work.");
    if (form.tasks.some((task) => task.status === "open")) return setError("Complete or skip the current task before setting another one.");
    if (!taskDraft.title.trim()) return setError("Name the exact next task before adding it.");
    if (taskDraft.title.trim().length > 240 || hasUnsafeText(taskDraft.title)) return setError("Task titles must be 240 plain-text characters or fewer.");
    if (!taskChannels(taskDraft.type).includes(taskDraft.channel)) return setError("Choose a work channel that matches the task type.");
    const dueAt = dueAtForInput(taskDraft.dueAt);
    if (taskDraft.dueAt && !dueAt) return setError("Choose a valid task due time.");
    if (form.status === "snoozed" && !dueAt) return setError("A snoozed record needs an exact wake time on its open task.");
    const contactId = taskDraft.contactId || null;
    const taskContact = contactId ? form.contacts.find((contact) => contact.contactId === contactId) ?? null : null;
    const persistedTaskContact = selectedPersistedContact(form, persistedContacts, persistedSelectedContactId);
    if (taskDraft.channel === "internal" && contactId) return setError("Internal work cannot name an external contact route.");
    if (taskDraft.channel !== "internal" && (!taskContact || !persistedTaskContact || contactId !== persistedTaskContact.contactId || !taskContactMatchesChannel(taskContact, taskDraft.channel))) return setError("Save and choose the exact selected contact route before creating this non-internal task.");
    const task: DakotaTask = {
      taskId: crypto.randomUUID().toLowerCase(),
      type: taskDraft.type,
      status: "open",
      title: taskDraft.title.trim(),
      dueAt,
      contactId,
      channel: taskDraft.channel,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      resolutionNote: "",
    };
    setSaved(false);
    setForm((current) => ({
      ...current,
      tasks: [...current.tasks, task],
      nextAction: task.title,
      dueDate: task.dueAt?.slice(0, 10) ?? "",
      commercialClose: task.type === "onboarding"
        ? { ...current.commercialClose, onboardingNextAction: task.title }
        : current.commercialClose,
    }));
    setTaskDraft(makeTaskDraft(form.status, form.selectedContactId));
  };

  const resolveTask = (status: Exclude<DakotaTaskStatus, "open">) => {
    setError("");
    const openTask = form.tasks.find((task) => task.status === "open");
    if (!openTask) return setError("There is no open task to resolve.");
    if (!isPersistedOpenTask(openTask.taskId, baselineRecord.tasks)) return setError(NEW_TASK_FIRST_SAVE_ERROR);
    if (!taskResolution.trim()) return setError("Add a factual resolution note before closing the task.");
    const resolvedAt = new Date().toISOString();
    setSaved(false);
    setForm((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.taskId === openTask.taskId ? { ...task, status, resolvedAt, resolutionNote: taskResolution.trim() } : task),
    }));
    setTaskResolution("");
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
  const activeTask = form.tasks.find((task) => task.status === "open") ?? null;
  const activeTaskIsPersisted = activeTask
    ? isPersistedOpenTask(activeTask.taskId, baselineRecord.tasks)
    : false;
  const recordableActivityTypes = useMemo(() => ACTIVITY_TYPES.filter((type) => linkedActivityChannels(type, activeTask).length > 0), [activeTask]);
  const effectiveActivityType = recordableActivityTypes.includes(activityDraft.type) ? activityDraft.type : recordableActivityTypes[0] ?? "note";
  const recordableActivityChannels = useMemo(() => linkedActivityChannels(effectiveActivityType, activeTask), [activeTask, effectiveActivityType]);
  const effectiveActivityChannel = recordableActivityChannels.includes(activityDraft.channel) ? activityDraft.channel : recordableActivityChannels[0] ?? "internal";
  const recordableActivityOutcomes = activityOutcomes(effectiveActivityType, effectiveActivityChannel);
  const effectiveActivityOutcome = recordableActivityOutcomes.includes(activityDraft.outcome) ? activityDraft.outcome : recordableActivityOutcomes[0] ?? "recorded";
  const activeTaskContact = activeTask?.contactId ? form.contacts.find((contact) => contact.contactId === activeTask.contactId) ?? null : null;
  const selectedRoute = selectedPersistedContact(form, persistedContacts, persistedSelectedContactId);
  const routedTask = activeTask?.channel !== "internal" ? activeTask : null;
  const directTask = activeTask && ["email", "phone", "sms"].includes(activeTask.channel) ? activeTask : null;
  const exactTaskRoute = directTask?.contactId && directTask.contactId === selectedRoute?.contactId ? selectedRoute : null;
  const usableContact = exactTaskRoute && (
    directTask?.channel === "email" ? canUseGmailCompose(exactTaskRoute) :
    directTask?.channel === "sms" ? canUseGoogleVoice(exactTaskRoute) : true
  ) ? exactTaskRoute : null;
  const voiceContact = directTask?.channel === "sms" && canUseGoogleVoice(usableContact) ? usableContact : null;
  const phoneContact = directTask?.channel === "phone" && usableContact?.channel === "phone" ? usableContact : null;
  const meetingContact = activeTask?.channel === "meeting" && selectedRoute && (!activeTask.contactId || activeTask.contactId === selectedRoute.contactId) ? selectedRoute : null;
  const valueBrief = buildValueBrief(classifiedCandidate, form);
  const gmailBody = valueBrief && form.draft === valueBrief.plainText ? valueBrief.outboundText : form.draft;
  const canShareValueBrief = Boolean(valueBrief && usableContact && approved && directTask?.channel === "email");
  const gmailHref = usableContact && directTask?.channel === "email" && approved && form.draft.trim()
    ? buildGmailComposeHref(usableContact, valueBrief?.title ?? `${candidateLabel(classifiedCandidate)}: one focused next move`, gmailBody)
    : null;
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
    const outboundDraft = directTask?.channel === "email" ? gmailBody : form.draft;
    try { await navigator.clipboard.writeText(outboundDraft); setCopyState("draft"); }
    catch { setCopyState("error"); }
  };

  const prepareValueBrief = () => {
    if (!valueBrief) return;
    setSaved(false);
    setForm((current) => ({ ...current, draft: valueBrief.plainText }));
  };

  const copyValueBrief = async () => {
    if (!canShareValueBrief || !valueBrief) return;
    setCopyState("idle");
    try { await navigator.clipboard.writeText(valueBrief.outboundText); setCopyState("brief"); }
    catch { setCopyState("error"); }
  };

  const copyBookingLink = async () => {
    if (!approved || !meetingContact) return;
    setCopyState("idle");
    try { await navigator.clipboard.writeText(BOOKING_HREF); setCopyState("booking"); }
    catch { setCopyState("error"); }
  };

  const copyPhoneNumber = async () => {
    if (!approved || !phoneContact) return;
    setCopyState("idle");
    try { await navigator.clipboard.writeText(phoneContact.value); setCopyState("phone"); }
    catch { setCopyState("error"); }
  };

  const appendActivity = () => {
    setError("");
    if (form.activities.length >= 100) return setError("Dakota’s 100-event activity limit is reached. Preserve the existing evidence and close or complete this record.");
    if (!activityDraft.note.trim()) return setError("Add a factual activity note before recording evidence.");
    const isInternalNote = effectiveActivityType === "note" && effectiveActivityChannel === "internal";
    if (!isInternalNote && !activeTask) return setError("Set one durable next task before recording non-note activity evidence.");
    if (!linkedActivityChannels(effectiveActivityType, activeTask).includes(effectiveActivityChannel)) return setError("This activity must match the exact open task channel.");
    const activityContact = isInternalNote || effectiveActivityChannel === "internal" ? null : selectedRoute;
    if (!isInternalNote && effectiveActivityChannel !== "internal" && !activityContact) return setError("External evidence must use the exact saved contact selected for this task.");
    if (activityContact && ["email", "phone", "sms"].includes(effectiveActivityChannel) && activityContact.channel !== effectiveActivityChannel) return setError("Email, phone, and SMS evidence must match the exact selected route channel.");
    if (!isInternalNote && effectiveActivityChannel !== "internal" && activeTask?.contactId !== activityContact?.contactId) return setError("Activity evidence must match the exact contact locked to the open task.");
    const occurredDate = new Date(activityDraft.occurredAt);
    if (Number.isNaN(occurredDate.getTime())) return setError("Activity time must be valid.");
    if (!isInternalNote && activeTask && occurredDate.getTime() < Date.parse(activeTask.createdAt) - 5 * 60_000) return setError("Activity evidence cannot predate its linked task.");
    const occurredAt = occurredDate.toISOString();
    const activity: DakotaActivity = {
      activityId: crypto.randomUUID().toLowerCase(),
      taskId: isInternalNote ? null : activeTask?.taskId ?? null,
      contactId: activityContact?.contactId ?? null,
      channel: effectiveActivityChannel,
      type: effectiveActivityType,
      outcome: effectiveActivityOutcome,
      note: activityDraft.note.trim(),
      occurredAt,
      followUpAt: null,
    };
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
    const validationError = validateRecord(payload, initialActivityIds.current, baselineRecord, baselineMilestones);
    if (validationError) return setError(validationError);

    setSaving(true);
    try {
      const savedVersion = await onSave(key, payload, baselineUpdatedAt);
      setForm(payload);
      setBaseline(JSON.stringify(payload));
      setBaselineUpdatedAt(savedVersion);
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

        <form className="operator-form progressive-form" name="dakota-opportunity-v3" autoComplete="off" onSubmit={save} noValidate>
          <section className="revenue-workbench" aria-labelledby="revenue-workbench-title">
            <header>
              <div className="revenue-workbench__icon"><ListTodo size={22} /></div>
              <div><p className="eyebrow">One open loop</p><h3 id="revenue-workbench-title">The next revenue move</h3><p>Every live opportunity keeps one exact task, one route, and one owner. Nothing disappears inside the dossier.</p></div>
              <span className={activeTask ? "task-state task-state--open" : NO_OPEN_TASK_STATUSES.has(form.status) ? "task-state task-state--quiet" : "task-state"}>{activeTask ? "Open" : NO_OPEN_TASK_STATUSES.has(form.status) ? "No open task" : "Needs a task"}</span>
            </header>
            {activeTask ? (
              <div className="active-task-card">
                <div className="active-task-card__main">
                  <span>{TASK_TYPE_LABELS[activeTask.type]}</span>
                  <h4>{activeTask.title}</h4>
                  <dl>
                    <div><dt>Channel</dt><dd>{TASK_CHANNEL_LABELS[activeTask.channel]}</dd></div>
                    <div><dt>Due</dt><dd>{activeTask.dueAt ? formatTimestamp(activeTask.dueAt) : "Ready now"}</dd></div>
                    <div><dt>Exact route</dt><dd>{activeTaskContact ? `${activeTaskContact.name || activeTaskContact.role} · ${activeTaskContact.value}` : "Internal task"}</dd></div>
                  </dl>
                </div>
                <div className="task-resolution">
                  <label><FieldLabel hint="Required to close the loop">What actually happened?</FieldLabel><textarea name="task_resolution" rows={3} maxLength={1000} value={taskResolution} onChange={(event) => setTaskResolution(event.target.value)} placeholder="Record the factual result, then set the next task…" disabled={!activeTaskIsPersisted} aria-describedby={!activeTaskIsPersisted ? "task-first-save-note" : undefined} /></label>
                  <div><button type="button" className="primary-button" onClick={() => resolveTask("completed")} disabled={!activeTaskIsPersisted}><CircleCheckBig size={17} /> Complete task</button><button type="button" className="secondary-button" onClick={() => resolveTask("skipped")} disabled={!activeTaskIsPersisted}>Skip with reason</button></div>
                  {!activeTaskIsPersisted ? <p id="task-first-save-note"><ShieldCheck size={15} /> Save this new task open once before completing or skipping it.</p> : OPEN_TASK_REQUIRED_STATUSES.has(form.status) ? <p><ShieldCheck size={15} /> After resolving, set the next task before saving this stage.</p> : null}
                </div>
              </div>
            ) : NO_OPEN_TASK_STATUSES.has(form.status) ? (
              <div className="no-task-by-design"><Check size={22} /><div><strong>No open task by design.</strong><span>{form.status === "early_signal" ? "Move this signal to Research ready only when it deserves a real next step." : "This record is closed. Reopen it only with new evidence and a new exact task."}</span></div></div>
            ) : (
              <div className="task-composer">
                <div className="task-composer__intro"><CalendarClock size={20} /><div><strong>Set the next task before this record leaves your hands.</strong><span>Use a real deadline only when timing matters. “Ready now” stays at the top of the queue.</span></div></div>
                <div className="form-grid progressive-fields">
                  <label><FieldLabel>Task type</FieldLabel><select name="task_type" value={taskDraft.type} onChange={(event) => { const type = event.target.value as DakotaTaskType; const channel = taskChannels(type)[0] ?? "internal"; setTaskDraft((current) => ({ ...current, type, channel, contactId: channel !== "internal" && selectedRoute && taskContactMatchesChannel(selectedRoute, channel) ? selectedRoute.contactId : "" })); }}>{TASK_TYPES.map((type) => <option key={type} value={type}>{TASK_TYPE_LABELS[type]}</option>)}</select></label>
                  <label><FieldLabel>Work channel</FieldLabel><select name="task_channel" value={taskDraft.channel} onChange={(event) => { const channel = event.target.value as DakotaTaskChannel; setTaskDraft((current) => ({ ...current, channel, contactId: channel !== "internal" && selectedRoute && taskContactMatchesChannel(selectedRoute, channel) ? selectedRoute.contactId : "" })); }}>{taskChannels(taskDraft.type).map((channel) => <option key={channel} value={channel}>{TASK_CHANNEL_LABELS[channel]}</option>)}</select></label>
                  <label className="form-span"><FieldLabel hint="One concrete verb and outcome">Exact next task</FieldLabel><input name="task_title" maxLength={240} value={taskDraft.title} onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Review the requested website plan and prepare one useful reply…" /></label>
                  <label><FieldLabel>Exact contact</FieldLabel><select name="task_contact" value={taskDraft.contactId} required={taskDraft.channel !== "internal"} disabled={taskDraft.channel === "internal" || !selectedRoute || !taskContactMatchesChannel(selectedRoute, taskDraft.channel)} onChange={(event) => setTaskDraft((current) => ({ ...current, contactId: event.target.value }))}><option value="" disabled={taskDraft.channel !== "internal"}>{taskDraft.channel === "internal" ? "Internal—no contact" : selectedRoute ? "Choose the saved selected route" : "Save one selected route first"}</option>{selectedRoute && taskContactMatchesChannel(selectedRoute, taskDraft.channel) ? <option value={selectedRoute.contactId}>{selectedRoute.name || selectedRoute.role || "Unnamed contact"} · {selectedRoute.channel}</option> : null}</select></label>
                  <label><FieldLabel hint={form.status === "snoozed" ? "Required wake time" : "Optional"}>Due time</FieldLabel><input name="task_due_at" type="datetime-local" required={form.status === "snoozed"} value={taskDraft.dueAt} onChange={(event) => setTaskDraft((current) => ({ ...current, dueAt: event.target.value }))} /></label>
                </div>
                <button type="button" className="primary-button task-composer__add" onClick={addTask}><Plus size={17} /> Set next task</button>
              </div>
            )}
            {form.tasks.length ? <footer><span>{form.tasks.filter((task) => task.status === "completed").length} completed</span><span>{form.tasks.filter((task) => task.status === "skipped").length} skipped</span><span>{form.tasks.length} total durable tasks</span></footer> : null}
          </section>
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
              {form.contacts.length ? <div className="contact-list">{form.contacts.map((contact, index) => <fieldset key={contact.contactId} className={form.selectedContactId === contact.contactId ? "contact-card contact-card--selected" : "contact-card"}><legend>Contact {String(index + 1).padStart(2, "0")}</legend><div className="contact-card__status"><span className={`consent-dot consent-dot--${contact.consentClassification}`} />{CONSENT_LABELS[contact.consentClassification]}</div><label className="contact-card__selector"><input type="radio" name="selected_contact" checked={form.selectedContactId === contact.contactId} disabled={!isPursuitContact(contact) || Boolean(routedTask && routedTask.contactId !== contact.contactId)} onChange={() => selectContact(contact.contactId)} /><span><strong>Use this exact route</strong>{routedTask && routedTask.contactId !== contact.contactId ? "Resolve the current routed task before changing its exact contact." : contact.channel === "website_form" || contact.channel === "linkedin" ? "This route is research evidence only. Add a verified email, phone, or SMS route before direct outreach." : isPursuitContact(contact) ? "Tasks and manual handoffs will use only this contact after it is saved." : "Complete the route, source, date, and consent classification before selecting it."}</span></label>{persistedContactIds.has(contact.contactId) ? <p className="contact-card__durable"><ShieldCheck size={15} /> Saved route locked. If anything changed, add a newly verified route so old task evidence stays true.</p> : null}<div className="form-grid">
                <label><FieldLabel>Name</FieldLabel><input name={`contact_${index}_name`} value={contact.name} maxLength={160} disabled={persistedContactIds.has(contact.contactId)} onChange={(event) => setContact(contact.contactId, "name", event.target.value)} placeholder="Person or team…" /></label>
                <label><FieldLabel>Role</FieldLabel><input name={`contact_${index}_role`} value={contact.role} maxLength={160} disabled={persistedContactIds.has(contact.contactId)} onChange={(event) => setContact(contact.contactId, "role", event.target.value)} placeholder="Owner, manager, front desk…" /></label>
                <label><FieldLabel>Channel</FieldLabel><select name={`contact_${index}_channel`} value={contact.channel} disabled={persistedContactIds.has(contact.contactId)} onChange={(event) => setContact(contact.contactId, "channel", event.target.value)}>{CONTACT_CHANNELS.map((channel) => <option key={channel} value={channel}>{CONTACT_LABELS[channel]}</option>)}</select></label>
                <label><FieldLabel>Contact value</FieldLabel><input name={`contact_${index}_value`} type={contact.channel === "email" ? "email" : contact.channel === "phone" || contact.channel === "sms" ? "tel" : "url"} inputMode={contact.channel === "phone" || contact.channel === "sms" ? "tel" : contact.channel === "email" ? "email" : "url"} spellCheck={contact.channel !== "email"} value={contact.value} maxLength={contact.channel === "email" ? 254 : contact.channel === "phone" || contact.channel === "sms" ? 40 : 2048} disabled={persistedContactIds.has(contact.contactId)} onChange={(event) => setContact(contact.contactId, "value", event.target.value)} placeholder="Phone, email, or public route…" /></label>
                <label><FieldLabel hint="Required">Verified date</FieldLabel><input name={`contact_${index}_verified_at`} type="date" value={contact.verifiedAt} disabled={persistedContactIds.has(contact.contactId)} onChange={(event) => setContact(contact.contactId, "verifiedAt", event.target.value)} /></label>
                <label><FieldLabel>Consent classification</FieldLabel><select name={`contact_${index}_consent`} value={contact.consentClassification} disabled={persistedContactIds.has(contact.contactId)} onChange={(event) => setContact(contact.contactId, "consentClassification", event.target.value)}>{CONSENT_CLASSIFICATIONS.map((consent) => <option key={consent} value={consent}>{CONSENT_LABELS[consent]}</option>)}</select></label>
                <label className="form-span"><FieldLabel hint="Required">Public source URL</FieldLabel><input name={`contact_${index}_source_url`} type="url" inputMode="url" spellCheck={false} required value={contact.sourceUrl} maxLength={2048} disabled={persistedContactIds.has(contact.contactId)} onChange={(event) => setContact(contact.contactId, "sourceUrl", event.target.value)} placeholder="https://…" /></label>
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
              <label><FieldLabel hint="Potential, never cash">Estimated value</FieldLabel><input name="estimated_value" type="number" min="0" max={MAX_MONEY} step="0.01" inputMode="decimal" value={form.estimatedValue ?? ""} onChange={(event) => setMoney("estimatedValue", event.target.value)} /></label>
            </div>
            <div className="task-source-note"><ListTodo size={18} /><span><strong>One scheduling source.</strong>Task, deadline, route, and completion live in “The next revenue move” above. This stage cannot create a second hidden reminder.</span></div>
            {requiresApproval ? <label className="approval-gate"><input name="approval_confirmed" type="checkbox" checked={approvalConfirmed} onChange={(event) => { setSaved(false); setApprovalConfirmed(event.target.checked); }} /><span><strong>I verified the evidence and approve manual pursuit.</strong>This authorizes David’s judgment only. Dakota still cannot contact anyone.</span></label> : null}
          </ProgressiveSection>

          <ProgressiveSection number="04" eyebrow="Manual outreach and activity" title="Prepare, then record what actually happened" complete={Boolean(form.activities.length)} defaultOpen={requiresApproval}>
            <div className="manual-outreach">
              <div className="subsection-heading"><div><p className="eyebrow">Manual message</p><h4>One recipient. Useful first. Human sent.</h4></div><div className="subsection-actions"><button type="button" className="text-button" onClick={prepareDraft} disabled={!form.verifiedPain.trim() || !form.offerFit.trim()}>Prepare short note</button><button type="button" className="text-button" onClick={prepareValueBrief} disabled={!valueBrief}>Use value brief</button></div></div>
              {valueBrief ? <article className="value-brief"><header><div><p className="eyebrow">Prospect-ready value brief</p><h4>{valueBrief.title}</h4></div><button type="button" className="secondary-button" onClick={() => void copyValueBrief()} disabled={!canShareValueBrief}>{copyState === "brief" ? <Check size={17} /> : <Copy size={17} />}{copyState === "brief" ? "Brief copied" : "Copy email brief"}</button></header><div><section><span>Observed</span><p>{valueBrief.observedFact}</p></section><section><span>Why it may matter</span><p>{valueBrief.customerImpact}</p></section><section><span>Smallest useful move</span><p>{valueBrief.firstMove}</p></section><section><span>What Little Fight owns</span><p>{valueBrief.ownership}</p></section></div><footer><ShieldCheck size={16} /> The saved draft stays URL-free. The verified booking link is added only to an approved email handoff.</footer></article> : null}
              <label><FieldLabel>Private outreach draft</FieldLabel><textarea name="draft" maxLength={6000} rows={9} value={form.draft} onChange={(event) => setString("draft", event.target.value)} placeholder="Prepare a concise, evidence-specific message. Nothing sends from Dakota…" /></label>
              {usableContact && approved ? (
                <div className="voice-handoff">
                  <div>{usableContact.channel === "email" ? <Mail size={20} /> : usableContact.channel === "sms" ? <MessageSquareText size={20} /> : <Phone size={20} />}<span><strong>{usableContact.value}</strong>{usableContact.name || usableContact.role || "Verified contact"} · {CONSENT_LABELS[usableContact.consentClassification]} · exact selected route</span></div>
                  <div className="handoff-actions">
                    <button type="button" className="primary-button" onClick={() => void copyDraft()} disabled={!form.draft.trim()}>{copyState === "draft" ? <Check size={17} /> : <Copy size={17} />}{copyState === "draft" ? "Draft copied" : "Copy draft"}</button>
                    {gmailHref ? <a className="secondary-button" href={gmailHref} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open Gmail draft <ExternalLink size={16} /></a> : null}
                    {voiceContact ? <a className="secondary-button" href={GOOGLE_VOICE_MESSAGES_HREF} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open Google Voice <ExternalLink size={16} /></a> : null}
                    {phoneContact ? <button type="button" className="secondary-button" onClick={() => void copyPhoneNumber()}>{copyState === "phone" ? <Check size={16} /> : <Copy size={16} />}{copyState === "phone" ? "Number copied" : "Copy number"}</button> : null}
                    {phoneContact ? <a className="secondary-button" href={GOOGLE_VOICE_CALLS_HREF} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open Voice calls <ExternalLink size={16} /></a> : null}
                    <a className="secondary-button" href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open booking page <ExternalLink size={16} /></a>
                  </div>
                  <p><ShieldCheck size={16} /> Gmail and Voice open for review only. Verify the sender is hello@littlefightnyc.com and the recipient matches this exact route; then press Send yourself and record what happened.</p>
                  <span className="sr-only" role="status" aria-live="polite">{copyState === "draft" ? "Draft copied. No outreach was recorded." : copyState === "brief" ? "Value brief copied. No outreach was recorded." : copyState === "phone" ? "Phone number copied. No call was recorded." : ""}</span>
                </div>
              ) : meetingContact && approved ? null : <div className="voice-locked"><ShieldCheck size={20} /><span><strong>Manual handoff is locked.</strong>Approve pursuit, select one allowed route, save it, and set an email, phone, SMS, or meeting task first.</span></div>}
              {meetingContact && approved ? <div className="calendar-handoff"><CalendarClock size={20} /><div><strong>Turn the reply into a real meeting.</strong><span>{meetingContact.name || meetingContact.role || "Selected contact"} · exact saved route · Google Meet included</span></div><div><button type="button" className="primary-button" onClick={() => void copyBookingLink()}>{copyState === "booking" ? <Check size={17} /> : <Copy size={17} />}{copyState === "booking" ? "Booking link copied" : "Copy booking link"}</button><a className="secondary-button" href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open booking page <ExternalLink size={16} /></a></div><p><ShieldCheck size={16} /> Opens the verified Little Fight appointment schedule. Copying or opening it does not record a meeting.</p></div> : null}
              {directTask?.channel === "sms" && approved && !voiceContact ? <div className="voice-locked"><ShieldCheck size={20} /><span><strong>Google Voice text remains locked.</strong>It requires a verified SMS route classified explicit inquiry or existing relationship. A phone or public business number is not text consent.</span></div> : null}
              {copyState === "error" ? <p className="copy-error" role="status">Clipboard access failed. The draft remains in Dakota.</p> : null}
            </div>
            <div className="activity-composer">
              <div className="subsection-heading"><div><p className="eyebrow">Explicit evidence entry</p><h4>Record the real-world action</h4></div><Activity size={20} /></div>
              <p>Only use this after the action happened. Opening, copying, drafting, or planning is not outreach.</p>
              <div className="form-grid progressive-fields">
                <label><FieldLabel>Activity type</FieldLabel><select name="activity_type" value={effectiveActivityType} onChange={(event) => { const type = event.target.value as DakotaActivityType; const channel = linkedActivityChannels(type, activeTask)[0] ?? "internal"; const outcome = activityOutcomes(type, channel)[0] ?? "recorded"; setActivityDraft((current) => ({ ...current, type, channel, outcome })); }}>{recordableActivityTypes.map((type) => <option key={type} value={type}>{ACTIVITY_TYPE_LABELS[type]}</option>)}</select></label>
                <label><FieldLabel>Channel</FieldLabel><select name="activity_channel" value={effectiveActivityChannel} onChange={(event) => { const channel = event.target.value as DakotaActivityChannel; const outcome = activityOutcomes(effectiveActivityType, channel)[0] ?? "recorded"; setActivityDraft((current) => ({ ...current, type: effectiveActivityType, channel, outcome })); }}>{recordableActivityChannels.map((channel) => <option key={channel} value={channel}>{channel.replace(/_/gu, " ")}</option>)}</select></label>
                <label><FieldLabel>Outcome</FieldLabel><select name="activity_outcome" value={effectiveActivityOutcome} onChange={(event) => setActivityDraft((current) => ({ ...current, type: effectiveActivityType, channel: effectiveActivityChannel, outcome: event.target.value as DakotaActivityOutcome }))}>{recordableActivityOutcomes.map((outcome) => <option key={outcome} value={outcome}>{outcome.replace(/_/gu, " ")}</option>)}</select></label>
                <label><FieldLabel>Occurred at</FieldLabel><input name="activity_occurred_at" type="datetime-local" value={activityDraft.occurredAt} onChange={(event) => setActivityDraft((current) => ({ ...current, occurredAt: event.target.value }))} /></label>
                <label className="form-span"><FieldLabel hint="Factual evidence">Activity note</FieldLabel><textarea name="activity_note" rows={3} maxLength={2000} value={activityDraft.note} onChange={(event) => setActivityDraft((current) => ({ ...current, note: event.target.value }))} placeholder="What actually happened, including channel and result…" /></label>
              </div>
              {activeTask ? <p className="activity-link-contract"><ShieldCheck size={15} /> Evidence will link to task “{activeTask.title}”{selectedRoute ? ` and ${selectedRoute.value}` : ""}.</p> : <p className="activity-link-contract"><ShieldCheck size={15} /> Only internal notes are available until one durable task is open.</p>}
              <button type="button" className="text-button record-activity-button" onClick={appendActivity} disabled={form.activities.length >= 100}><Plus size={17} /> {form.activities.length >= 100 ? "Activity limit reached" : effectiveActivityType === "outreach" && effectiveActivityOutcome === "sent" ? "Record sent activity" : "Append activity evidence"}</button>
            </div>
            <div className="activity-timeline"><div className="subsection-heading"><div><p className="eyebrow">Append-only timeline</p><h4>{form.activities.length ? `${form.activities.length} explicit events` : "No activity recorded"}</h4></div></div>{form.activities.length ? <ol>{[...form.activities].reverse().map((activity) => {
              const linkedTask = activity.taskId ? form.tasks.find((task) => task.taskId === activity.taskId) ?? null : null;
              const linkedContact = activity.contactId ? form.contacts.find((contact) => contact.contactId === activity.contactId) ?? null : null;
              return <li key={activity.activityId}><span className="activity-marker" /><div><p><strong>{ACTIVITY_TYPE_LABELS[activity.type]}</strong><span>{activity.channel.replace(/_/gu, " ")} · {activity.outcome.replace(/_/gu, " ")}</span></p><time dateTime={activity.occurredAt}>{formatTimestamp(activity.occurredAt)}</time><blockquote>{activity.note}</blockquote>{linkedTask ? <small>Task: {linkedTask.title}{linkedContact ? ` · Route: ${linkedContact.value}` : ""}</small> : activity.type === "note" ? <small>Internal note · no external route</small> : <small>Legacy evidence · no durable task link</small>}{activity.followUpAt ? <small>Follow up {formatTimestamp(activity.followUpAt)}</small> : null}</div></li>;
            })}</ol> : <div className="inline-empty"><Activity size={22} /><p>Timeline starts only when David records something that actually happened.</p></div>}</div>
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
              <label className="form-span"><FieldLabel hint={form.status === "paid" && activeTask?.type === "onboarding" ? "Locked to the open onboarding task" : undefined}>Onboarding next action</FieldLabel><input name="onboarding_next_action" maxLength={1000} value={form.commercialClose.onboardingNextAction} onChange={(event) => setCommercial("onboardingNextAction", event.target.value)} placeholder="Send kickoff details after cleared deposit…" disabled={form.status === "paid" && activeTask?.type === "onboarding"} /></label>
              <label className="form-span"><FieldLabel>Win or loss reason</FieldLabel><input name="win_loss_reason" maxLength={1000} value={form.winLossReason} onChange={(event) => setString("winLossReason", event.target.value)} placeholder="Record only after a real outcome…" /></label>
            </div>
          </ProgressiveSection>

          {milestoneEntries.length ? <dl className="milestone-ledger" aria-label="Server-owned opportunity milestones">{milestoneEntries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatTimestamp(value)}</dd></div>)}</dl> : null}
          {externalConflict ? <div className="drawer-conflict" role="alert"><CircleAlert size={18} /><span><strong>A newer saved version exists.</strong>{dirty ? "Your unsaved work is still here. Load the latest record before saving so nothing gets overwritten." : "Load the latest record before continuing."}</span><button type="button" className="secondary-button" onClick={loadLatestRecord}>Load latest</button></div> : null}
          {error ? <div className="form-error" ref={errorRef} tabIndex={-1} role="alert"><CircleAlert size={18} />{error}</div> : null}
          {saved ? <div className="form-success" role="status"><Check size={18} />Private record saved. No unrecorded outreach occurred.</div> : null}
          <footer className="drawer-footer drawer-footer--sticky"><button type="button" className="secondary-button" onClick={requestClose} disabled={saving}>Close dossier</button><span>{externalConflict ? "Newer saved version available" : dirty ? "Unsaved private changes" : "Record is saved"}</span><button type="submit" className="primary-button" disabled={saving || !notebookAvailable || externalConflict}>{saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />} Save record</button></footer>
        </form>
      </div>
    </dialog>
  );
}
