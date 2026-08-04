import { BOOKING_HREF } from "../data/contact";
import {
  isConsentedInboundRecord,
  isHumanApprovedRecord,
  isPursuitContact,
  isVoiceTextContact,
  storefrontMoneyPath,
} from "./revenue";
import type {
  Candidate,
  DakotaPrivateOffer,
  DakotaTask,
  DakotaTaskChannel,
  DakotaTaskType,
  DakotaVerifiedContact,
  OperatorRecord,
  OperatorRecordInput,
} from "./types";

export { BOOKING_HREF };

export const GOOGLE_WORKSPACE_EMAIL = "hello@littlefightnyc.com";
export const GOOGLE_VOICE_MESSAGES_HREF = "https://voice.google.com/u/0/messages";
export const GOOGLE_VOICE_CALLS_HREF = "https://voice.google.com/u/0/calls";
export const NEW_TASK_FIRST_SAVE_ERROR = "Save this new task open before completing or skipping it.";
export const FUTURE_COMMERCIAL_DATE_ERROR = "Commercial dates cannot be later than the next UTC calendar day.";
export const PAID_ONBOARDING_TASK_ERROR = "Paid requires the aligned onboarding task until kickoff is complete, then one open client-growth task.";

export const CLIENT_GROWTH_TASK_TYPES = [
  "client_success",
  "proof_request",
  "review_request",
  "referral_request",
  "renewal",
  "expansion",
] as const satisfies readonly DakotaTaskType[];

const CLIENT_GROWTH_TASK_TYPE_SET = new Set<DakotaTaskType>(CLIENT_GROWTH_TASK_TYPES);

const CLOSED_STATUSES = new Set(["lost", "not_fit", "do_not_contact"]);
const OPERATIONAL_STATUSES = new Set([
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "paid",
]);
const OPEN_TASK_REQUIRED_STATUSES = new Set([
  "research_ready",
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "paid",
  "snoozed",
]);
const DO_NEXT_TASK_TYPES = new Set<DakotaTaskType>([
  "qualify",
  "value_brief",
  "outreach",
  "follow_up",
  "meeting",
  "proposal",
  "invoice",
  "payment",
  "onboarding",
  ...CLIENT_GROWTH_TASK_TYPES,
]);

export const TASK_TYPE_LABELS: Record<DakotaTaskType, string> = {
  research: "Research",
  qualify: "Qualify",
  value_brief: "Prepare value brief",
  outreach: "Human outreach",
  follow_up: "Follow up",
  meeting: "Meeting",
  proposal: "Proposal",
  invoice: "Invoice",
  payment: "Payment",
  onboarding: "Onboarding",
  client_success: "Client success",
  proof_request: "Proof permission",
  review_request: "Review request",
  referral_request: "Referral request",
  renewal: "Renewal",
  expansion: "Expansion",
};

export function isPersistedOpenTask(
  taskId: string,
  persistedTasks: readonly DakotaTask[],
): boolean {
  return persistedTasks.some((task) => task.taskId === taskId && task.status === "open");
}

export function validateAppendedTaskStates(
  tasks: readonly DakotaTask[],
  persistedTasks: readonly DakotaTask[],
): string | null {
  const persistedTaskIds = new Set(persistedTasks.map((task) => task.taskId));
  return tasks.some((task) => !persistedTaskIds.has(task.taskId) && task.status !== "open")
    ? NEW_TASK_FIRST_SAVE_ERROR
    : null;
}

export function taskContactMatchesChannel(
  contact: DakotaVerifiedContact,
  channel: DakotaTaskChannel,
): boolean {
  if (channel === "email") return canUseGmailCompose(contact);
  if (channel === "phone") return contact.channel === "phone" && isPursuitContact(contact);
  if (channel === "sms") return canUseGoogleVoice(contact);
  return channel !== "internal" && isPursuitContact(contact);
}

export function isCommercialDateBeyondUtcTomorrow(value: string, now = new Date()): boolean {
  if (!value) return false;
  const latestAllowed = new Date(now.getTime() + 24 * 60 * 60_000).toISOString().slice(0, 10);
  return value > latestAllowed;
}

export function hasAlignedPaidOnboardingTask(
  record: { tasks: readonly DakotaTask[]; commercialClose: OperatorRecordInput["commercialClose"] },
): boolean {
  const openTasks = record.tasks.filter((task) => task.status === "open");
  const task = openTasks[0];
  const instruction = record.commercialClose.onboardingNextAction.trim();
  return Boolean(
    openTasks.length === 1 &&
    task?.type === "onboarding" &&
    task.channel === "internal" &&
    task.contactId === null &&
    instruction &&
    task.title === instruction
  );
}

export function hasCompletedPaidOnboarding(
  record: { tasks: readonly DakotaTask[] },
): boolean {
  return record.tasks.some((task) => task.type === "onboarding" && task.status === "completed");
}

export function hasAlignedPaidLifecycleTask(
  record: { tasks: readonly DakotaTask[]; commercialClose: OperatorRecordInput["commercialClose"] },
): boolean {
  if (!hasCompletedPaidOnboarding(record)) return hasAlignedPaidOnboardingTask(record);
  const openTasks = record.tasks.filter((task) => task.status === "open");
  return openTasks.length === 1 && CLIENT_GROWTH_TASK_TYPE_SET.has(openTasks[0]!.type);
}

export function selectedContact(record: Pick<OperatorRecordInput, "contacts" | "selectedContactId">): DakotaVerifiedContact | null {
  if (!record.selectedContactId) return null;
  return record.contacts.find((contact) => contact.contactId === record.selectedContactId) ?? null;
}

export function selectedPersistedContact(
  record: Pick<OperatorRecordInput, "contacts" | "selectedContactId">,
  persistedContacts: DakotaVerifiedContact[],
  persistedSelectedContactId: string | null,
): DakotaVerifiedContact | null {
  if (!record.selectedContactId || record.selectedContactId !== persistedSelectedContactId) return null;
  const selected = selectedContact(record);
  if (!selected || !isPursuitContact(selected)) return null;
  const persisted = persistedContacts.find((contact) => contact.contactId === selected.contactId);
  return persisted && JSON.stringify(persisted) === JSON.stringify(selected) ? selected : null;
}

export function buildGmailComposeHref(contact: DakotaVerifiedContact, subject: string, body: string): string | null {
  if (!canUseGmailCompose(contact) || !subject.trim() || !body.trim()) return null;
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: contact.value,
    su: subject.trim(),
    body: body.trim(),
  });
  return `https://mail.google.com/mail/u/hello%40littlefightnyc.com/?${params.toString()}`;
}

export function canUseGmailCompose(contact: DakotaVerifiedContact | null): boolean {
  return Boolean(
    contact &&
    contact.channel === "email" &&
    isPursuitContact(contact) &&
    (contact.consentClassification === "explicit_inquiry" || contact.consentClassification === "existing_relationship")
  );
}

export function canUseGoogleVoice(contact: DakotaVerifiedContact | null): boolean {
  return Boolean(contact && isVoiceTextContact(contact));
}

export interface DakotaValueBrief {
  title: string;
  observedFact: string;
  customerImpact: string;
  firstMove: string;
  proof: string;
  ownership: string;
  callToAction: string;
  plainText: string;
  outboundText: string;
}

export interface DakotaProposalBrief {
  title: string;
  offerName: string;
  investment: string;
  scope: string;
  milestones: string[];
  plainText: string;
}

function proposalInvestment(record: OperatorRecordInput, offer: DakotaPrivateOffer): string {
  const amount = record.commercialClose.proposalAmount;
  if (amount !== null) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  }
  if (offer.minAmount !== null && offer.maxAmount !== null) {
    const currency = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    const range = `${currency.format(offer.minAmount)}–${currency.format(offer.maxAmount)}`;
    return offer.cadence === "monthly" ? `${range} per month` : range;
  }
  if (offer.minAmount !== null) {
    const amountLabel = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(offer.minAmount);
    return offer.cadence === "monthly" ? `${amountLabel} per month` : amountLabel;
  }
  return "Price after scope review";
}

export function buildProposalBrief(
  candidate: Candidate,
  record: OperatorRecordInput,
  offer: DakotaPrivateOffer | null,
): DakotaProposalBrief | null {
  if (!offer || !offer.active || !record.verifiedPain.trim() || !record.offerFit.trim()) return null;
  const businessName = record.identity.dba?.trim()
    || record.identity.businessName.trim()
    || candidate.dba.trim()
    || candidate.business_name.trim();
  const investment = proposalInvestment(record, offer);
  const milestones = offer.stagePlaybook.filter((item) => item.trim()).slice(0, 8);
  const proof = record.proof.trim() || "Approved Little Fight NYC proof will be selected before this is sent.";
  const title = `${businessName} — ${offer.name}`;
  const numberedMilestones = milestones.length
    ? milestones.map((item, index) => `${index + 1}. ${item}`)
    : ["1. Confirm the smallest useful scope and success check before work begins."];
  const plainText = [
    "WORKING SCOPE — REVIEW BEFORE SENDING",
    title,
    "",
    "Client need",
    record.verifiedPain.trim(),
    "",
    "Recommended engagement",
    `${offer.name}: ${offer.scopeSummary}`,
    "",
    "Why this fits",
    record.offerFit.trim(),
    "",
    "Working milestones",
    ...numberedMilestones,
    "",
    "Relevant proof",
    proof,
    "",
    "Working investment",
    investment,
    "",
    "Before sending",
    "Confirm deliverables, exclusions, timing, ownership, payment schedule, and approval terms with the client. This brief is not a signed agreement or invoice.",
  ].join("\n");
  return { title, offerName: offer.name, investment, scope: offer.scopeSummary, milestones, plainText };
}

export function buildValueBrief(candidate: Candidate, record: OperatorRecordInput): DakotaValueBrief | null {
  const observedFact = record.verifiedPain.trim();
  const firstMove = record.offerFit.trim();
  if (!observedFact || !firstMove || !isHumanApprovedRecord(record)) return null;

  const businessName = record.identity.dba?.trim() || record.identity.businessName.trim() || candidate.dba.trim() || candidate.business_name.trim();
  const moneyPath = storefrontMoneyPath(record.identity.category?.trim() || candidate.category.trim());
  const title = `${businessName}: one focused next move`;
  const customerImpact = `For this storefront, the customer path to verify is ${moneyPath.toLowerCase()}. This is a working hypothesis, not a measured loss claim.`;
  const proof = record.proof.trim();
  const ownership = "Little Fight NYC can scope, build, connect, test, launch, and support the agreed fix. You keep approval of every customer-facing change.";
  const callToAction = `If this is the right problem, book a free 30-minute second opinion: ${BOOKING_HREF}`;
  const plainTextSections = [
    title,
    "",
    "What we observed",
    observedFact,
    "",
    "Why it may matter",
    customerImpact,
    "",
    "Smallest useful move",
    firstMove,
  ];
  if (proof) plainTextSections.push("", "Relevant proof", proof);
  const plainText = [
    ...plainTextSections,
    "",
    "What Little Fight owns",
    ownership,
    "",
    "— David, Little Fight NYC",
  ].join("\n");
  const outboundText = `${plainText}\n\n${callToAction}`;

  return { title, observedFact, customerImpact, firstMove, proof, ownership, callToAction, plainText, outboundText };
}

export type ReadyActionLane = "repair" | "inbound" | "pursuit" | "due";

export interface ReadyAction {
  key: string;
  record: OperatorRecord;
  task: DakotaTask | null;
  lane: ReadyActionLane;
  urgency: number;
}

function dueMillis(record: OperatorRecord, task: DakotaTask): number {
  if (task.dueAt) return Date.parse(task.dueAt);
  if (record.status === "snoozed" && record.dueDate) return Date.parse(`${record.dueDate}T00:00:00`);
  return Number.NaN;
}

function isDue(record: OperatorRecord, task: DakotaTask, now: Date): boolean {
  const due = dueMillis(record, task);
  return Number.isFinite(due) && due <= now.getTime();
}

function isUntouchedInbound(record: OperatorRecord, task: DakotaTask | undefined): boolean {
  return (
    isConsentedInboundRecord(record) &&
    record.status === "research_ready" &&
    record.tasks.length === 1 &&
    task?.status === "open" &&
    task.type === "research" &&
    !record.milestones?.humanApprovedAt &&
    !record.milestones?.firstContactedAt
  );
}

function urgencyFor(action: Omit<ReadyAction, "urgency">, now: Date): number {
  if (!action.task || action.lane === "repair") return -1;
  if (isDue(action.record, action.task, now)) return 0;
  if (action.lane === "inbound") return 1;
  if (action.lane === "pursuit") return 2;
  return 3;
}

export function collectReadyActions(
  records: Record<string, OperatorRecord>,
  now = new Date(),
): ReadyAction[] {
  const actions: ReadyAction[] = [];

  for (const [key, record] of Object.entries(records)) {
    if (CLOSED_STATUSES.has(record.status)) continue;
    const task = record.tasks.find((candidate) => candidate.status === "open");
    const inbound = isUntouchedInbound(record, task);
    if (!task) {
      if (inbound || OPEN_TASK_REQUIRED_STATUSES.has(record.status)) {
        const partial = { key, record, task: null, lane: "repair" as const };
        actions.push({ ...partial, urgency: urgencyFor(partial, now) });
      }
      continue;
    }

    const due = isDue(record, task, now);
    const operational = OPERATIONAL_STATUSES.has(record.status);
    const routedTaskNeedsRepair = task.channel !== "internal" && (
      task.contactId === null ||
      task.contactId !== record.selectedContactId ||
      !record.contacts.some((contact) => contact.contactId === task.contactId && isPursuitContact(contact))
    );
    const staleOperationalTask = (
      operational && !DO_NEXT_TASK_TYPES.has(task.type)
    ) || (
      record.status === "paid" && !hasAlignedPaidLifecycleTask(record)
    ) || routedTaskNeedsRepair;
    const pursuit = operational && DO_NEXT_TASK_TYPES.has(task.type);
    const taskDue = dueMillis(record, task);
    const scheduledFuture = Number.isFinite(taskDue) && taskDue > now.getTime();
    if (scheduledFuture && !staleOperationalTask) continue;
    if (!inbound && !due && (!pursuit || scheduledFuture) && !staleOperationalTask) continue;

    const lane: ReadyActionLane = staleOperationalTask ? "repair" : inbound ? "inbound" : due ? "due" : "pursuit";
    const partial = { key, record, task, lane };
    actions.push({ ...partial, urgency: urgencyFor(partial, now) });
  }

  return actions.sort((left, right) => {
    const urgency = left.urgency - right.urgency;
    if (urgency) return urgency;
    const leftDue = left.task ? dueMillis(left.record, left.task) : Number.NEGATIVE_INFINITY;
    const rightDue = right.task ? dueMillis(right.record, right.task) : Number.NEGATIVE_INFINITY;
    if (leftDue !== rightDue) return leftDue - rightDue;
    return right.record.updated_at.localeCompare(left.record.updated_at) || left.key.localeCompare(right.key);
  });
}
