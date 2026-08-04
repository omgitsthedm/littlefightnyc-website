import type {
  DakotaActivity,
  DakotaPursuitAttribution,
  DakotaPursuitSegment,
  DakotaPursuitTemplateId,
  DakotaTaskType,
  DakotaVerifiedContact,
} from "./types";

export const DAKOTA_PURSUIT_PACKET_VERSION = "1.0.0" as const;
export const DAKOTA_PURSUIT_TEMPLATE_VERSION = "1.0.0" as const;
export const DAKOTA_PURSUIT_TEMPLATE_IDS = [
  "restaurant_booking_fix_sop",
  "salon_google_profile_sop",
  "new_business_launch_checklist",
] as const satisfies readonly DakotaPursuitTemplateId[];

export interface DakotaPursuitTemplate {
  id: DakotaPursuitTemplateId;
  version: typeof DAKOTA_PURSUIT_TEMPLATE_VERSION;
  segment: DakotaPursuitSegment;
  label: string;
  title: string;
  purpose: string;
  actionSteps: readonly string[];
  noteFocus: string;
}

export const DAKOTA_PURSUIT_TEMPLATES: readonly DakotaPursuitTemplate[] = [
  {
    id: "restaurant_booking_fix_sop",
    version: DAKOTA_PURSUIT_TEMPLATE_VERSION,
    segment: "restaurant",
    label: "Restaurant booking-fix SOP",
    title: "Turn mobile intent into a completed reservation",
    purpose: "A focused operating plan for a restaurant whose verified customer path creates booking friction.",
    actionSteps: [
      "Confirm the primary reservation route, current hours, party-size rules, and the mobile path customers actually encounter.",
      "Repair dead ends between the website, menu, location details, and the selected booking destination.",
      "Align the reservation action and business facts across the owned website and verified public profile.",
      "Run a complete phone-first booking check, record the result, and give the owner a short weekly verification routine.",
    ],
    noteFocus: "booking-fix checklist",
  },
  {
    id: "salon_google_profile_sop",
    version: DAKOTA_PURSUIT_TEMPLATE_VERSION,
    segment: "salon",
    label: "Salon Google-profile SOP",
    title: "Make the public profile lead cleanly to a booking",
    purpose: "A practical profile-and-booking plan for a salon whose verified public facts or customer path need attention.",
    actionSteps: [
      "Confirm the exact business name, primary category, hours, services, and owner-approved booking destination.",
      "Correct conflicts between the verified public profile and the owned website without creating a second source of truth.",
      "Tighten the profile-to-booking path, including service context, current imagery, and the page customers reach.",
      "Test the full path on a phone and leave the owner a repeatable monthly profile check.",
    ],
    noteFocus: "Google profile checklist",
  },
  {
    id: "new_business_launch_checklist",
    version: DAKOTA_PURSUIT_TEMPLATE_VERSION,
    segment: "new_business",
    label: "New-business launch checklist",
    title: "Launch one owned customer path that works together",
    purpose: "A launch sequence for a new business whose verified setup gaps should be solved without adding unnecessary platforms.",
    actionSteps: [
      "Lock the owner-approved name, category, hours, service area, contact route, and primary customer action.",
      "Establish the owned domain and launch page as the durable source of truth for customers and public profiles.",
      "Connect the verified public presence to one working inquiry, booking, order, or visit path.",
      "Test confirmation, mobile behavior, business facts, and operator notifications before announcing the launch.",
      "Hand the owner a compact access, update, and recovery checklist so the system stays theirs.",
    ],
    noteFocus: "launch checklist",
  },
] as const;

export interface DakotaPursuitEvidenceItem {
  label: string;
  detail: string;
}

export interface DakotaPursuitPacketInput {
  templateId: DakotaPursuitTemplateId;
  packetId: string;
  businessName: string;
  contactName: string;
  offerFit: string;
  evidence: readonly DakotaPursuitEvidenceItem[];
  preparedAt: string;
}

export interface DakotaPursuitArtifactFingerprintInput extends Omit<DakotaPursuitPacketInput, "packetId" | "preparedAt"> {
  contactRoute: DakotaVerifiedContact | null;
}

export interface DakotaPursuitPacket {
  packetId: string;
  packetVersion: typeof DAKOTA_PURSUIT_PACKET_VERSION;
  templateId: DakotaPursuitTemplateId;
  templateVersion: typeof DAKOTA_PURSUIT_TEMPLATE_VERSION;
  segment: DakotaPursuitSegment;
  label: string;
  title: string;
  purpose: string;
  businessName: string;
  preparedAt: string;
  evidence: DakotaPursuitEvidenceItem[];
  offerFit: string;
  actionSteps: string[];
  note: string;
  plainText: string;
}

export interface DakotaApprovedPursuitArtifact {
  fingerprint: string;
  packet: DakotaPursuitPacket;
  attribution: DakotaPursuitAttribution;
}

const TEMPLATE_BY_ID = new Map(DAKOTA_PURSUIT_TEMPLATES.map((template) => [template.id, template]));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

export function pursuitTemplateById(id: DakotaPursuitTemplateId): DakotaPursuitTemplate {
  const template = TEMPLATE_BY_ID.get(id);
  if (!template) throw new Error("Dakota pursuit template is not approved.");
  return template;
}

export function recommendPursuitTemplateId(category: string): DakotaPursuitTemplateId {
  const normalized = category.toLowerCase();
  if (/(restaurant|cafe|coffee|bar|bakery|food|cater)/u.test(normalized)) return "restaurant_booking_fix_sop";
  if (/(salon|spa|barber|beauty|nail|hair)/u.test(normalized)) return "salon_google_profile_sop";
  return "new_business_launch_checklist";
}

function compactWords(value: string, maximumCharacters: number): string {
  const normalized = value.replace(/\s+/gu, " ").trim();
  if (normalized.length <= maximumCharacters) return normalized;
  const clipped = normalized.slice(0, maximumCharacters - 1).replace(/\s+\S*$/u, "").trim();
  return `${clipped || normalized.slice(0, maximumCharacters - 1).trim()}…`;
}

function compactName(value: string, fallback: string): string {
  const compact = compactWords(value, 64);
  return compact ? compact.split(/\s+/u).slice(0, 6).join(" ") : fallback;
}

function pursuitNote(template: DakotaPursuitTemplate, businessName: string, contactName: string): string {
  const recipient = compactName(contactName, "there");
  const business = compactName(businessName, "your business");
  return `Hi ${recipient} — I attached a one-page ${template.noteFocus} for ${business}, built only from the facts we verified. It lays out practical steps to improve the customer path without adding another platform. Which step would be most useful to tackle first?\n\n— David, Little Fight NYC`;
}

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}

export function isCompliantPursuitNote(value: string): boolean {
  return (
    countWords(value) <= 75 &&
    (value.match(/\?/gu) ?? []).length === 1 &&
    value.endsWith("— David, Little Fight NYC")
  );
}

function normalizedEvidence(items: readonly DakotaPursuitEvidenceItem[]): DakotaPursuitEvidenceItem[] {
  return items
    .map((item) => ({
      label: compactWords(item.label, 80),
      detail: compactWords(item.detail, 320),
    }))
    .filter((item) => item.label && item.detail)
    .slice(0, 3);
}

export function pursuitArtifactFingerprint(input: DakotaPursuitArtifactFingerprintInput): string {
  const contactRoute = input.contactRoute ? {
    contactId: input.contactRoute.contactId,
    name: input.contactRoute.name.trim(),
    role: input.contactRoute.role.trim(),
    channel: input.contactRoute.channel,
    value: input.contactRoute.value.trim(),
    sourceUrl: input.contactRoute.sourceUrl.trim(),
    verifiedAt: input.contactRoute.verifiedAt,
    consentClassification: input.contactRoute.consentClassification,
  } : null;
  return JSON.stringify({
    templateId: input.templateId,
    businessName: input.businessName.trim(),
    contactName: input.contactName.trim(),
    contactRoute,
    offerFit: input.offerFit.trim(),
    evidence: normalizedEvidence(input.evidence),
  });
}

function fingerprintWord(value: string, seed: number): string {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function pursuitPacketIdForFingerprint(fingerprint: string): string {
  const hex = [0x811c9dc5, 0x9e3779b1, 0x85ebca6b, 0xc2b2ae35]
    .map((seed, index) => fingerprintWord(`${index}:${fingerprint}`, seed))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function buildPursuitPacket(input: DakotaPursuitPacketInput): DakotaPursuitPacket | null {
  if (!UUID.test(input.packetId)) return null;
  const template = pursuitTemplateById(input.templateId);
  const evidence = normalizedEvidence(input.evidence);
  const businessName = compactWords(input.businessName, 160);
  const offerFit = compactWords(input.offerFit, 320);
  if (!businessName || !offerFit || evidence.length === 0 || Number.isNaN(Date.parse(input.preparedAt))) return null;
  const note = pursuitNote(template, businessName, input.contactName);
  if (!isCompliantPursuitNote(note)) return null;
  const actionSteps = [...template.actionSteps];
  const plainText = [
    "LITTLE FIGHT NYC · DAKOTA PURSUIT PACKET",
    template.label,
    template.title,
    `Prepared for: ${businessName}`,
    `Packet: ${input.packetId} · v${DAKOTA_PURSUIT_PACKET_VERSION}`,
    "",
    "VERIFIED DOSSIER EVIDENCE",
    ...evidence.map((item, index) => `${index + 1}. ${item.label}: ${item.detail}`),
    "",
    "APPROVED OFFER FIT",
    offerFit,
    "",
    "ACTION PLAN",
    ...actionSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "HUMAN-SENT NOTE",
    note,
    "",
    `Template: ${template.id} · v${template.version} · Segment: ${template.segment}`,
    "Prepared inside Dakota. No message was sent and no pipeline state was changed by creating this packet.",
  ].join("\n");
  return {
    packetId: input.packetId,
    packetVersion: DAKOTA_PURSUIT_PACKET_VERSION,
    templateId: template.id,
    templateVersion: template.version,
    segment: template.segment,
    label: template.label,
    title: template.title,
    purpose: template.purpose,
    businessName,
    preparedAt: input.preparedAt,
    evidence,
    offerFit,
    actionSteps,
    note,
    plainText,
  };
}

export function createPursuitAttribution(
  packet: DakotaPursuitPacket,
  approvedAt: string,
): DakotaPursuitAttribution {
  return {
    templateId: packet.templateId,
    templateVersion: packet.templateVersion,
    packetId: packet.packetId,
    packetVersion: packet.packetVersion,
    segment: packet.segment,
    approvedAt,
  };
}

export function isValidPursuitAttribution(value: DakotaPursuitAttribution | null | undefined): value is DakotaPursuitAttribution {
  if (!value || !UUID.test(value.packetId) || value.packetVersion !== DAKOTA_PURSUIT_PACKET_VERSION) return false;
  if (!Number.isFinite(Date.parse(value.approvedAt))) return false;
  const template = TEMPLATE_BY_ID.get(value.templateId);
  return Boolean(
    template &&
    value.templateVersion === template.version &&
    value.segment === template.segment,
  );
}

export function samePursuitAttribution(
  left: DakotaPursuitAttribution | null | undefined,
  right: DakotaPursuitAttribution | null | undefined,
): boolean {
  if (!left || !right) return !left && !right;
  return (
    left.templateId === right.templateId &&
    left.templateVersion === right.templateVersion &&
    left.packetId === right.packetId &&
    left.packetVersion === right.packetVersion &&
    left.segment === right.segment &&
    left.approvedAt === right.approvedAt
  );
}

export function activityNeedsPursuitAttribution(
  activity: Pick<DakotaActivity, "type" | "channel">,
  taskType: DakotaTaskType | null | undefined,
): boolean {
  if (activity.channel === "internal") return false;
  if (activity.type === "outreach") return taskType === "outreach";
  if (activity.type === "call") return taskType === "outreach" || taskType === "follow_up";
  return activity.type === "follow_up" && taskType === "follow_up";
}

export function latestPursuitAttribution(
  activities: readonly DakotaActivity[],
  contactId: string | null | undefined,
  beforeAt?: string,
): DakotaPursuitAttribution | null {
  if (!contactId) return null;
  const beforeMillis = beforeAt ? Date.parse(beforeAt) : Number.POSITIVE_INFINITY;
  const attributed = activities
    .filter((activity) => (
      activity.contactId === contactId &&
      activity.type !== "reply" &&
      Date.parse(activity.occurredAt) <= beforeMillis &&
      isValidPursuitAttribution(activity.pursuitAttribution)
    ))
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
  return attributed[0]?.pursuitAttribution ?? null;
}

export function canOpenPursuitChannel(contact: DakotaVerifiedContact | null): boolean {
  if (!contact) return false;
  if (contact.consentClassification === "public_business") {
    return contact.channel === "email" || contact.channel === "phone";
  }
  return (
    (contact.consentClassification === "explicit_inquiry" || contact.consentClassification === "existing_relationship") &&
    (contact.channel === "email" || contact.channel === "phone" || contact.channel === "sms")
  );
}
