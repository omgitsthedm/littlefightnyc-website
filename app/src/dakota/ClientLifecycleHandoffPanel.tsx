import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
} from "lucide-react";
import {
  buildReferralRequestMessage,
  buildReviewRequestMessage,
  isRelationshipEmail,
} from "./reviewReferral";
import type { DakotaTask, DakotaVerifiedContact } from "./types";
import { GOOGLE_VOICE_CALLS_HREF, GOOGLE_VOICE_MESSAGES_HREF } from "./workflow";

const GMAIL_COMPOSE_HREF = "https://mail.google.com/mail/u/hello%40littlefightnyc.com/#inbox?compose=new";
const LIFECYCLE_TASK_TYPES = new Set([
  "client_success",
  "proof_request",
  "review_request",
  "referral_request",
  "renewal",
  "expansion",
]);

function openExternal(href: string): void {
  window.open(href, "_blank", "noopener,noreferrer");
}

function allowedLifecycleRoute(task: DakotaTask, contact: DakotaVerifiedContact | null): boolean {
  if (!contact || task.contactId !== contact.contactId || task.channel !== contact.channel) return false;
  if (task.type === "review_request" || task.type === "referral_request") {
    return task.channel === "email" && isRelationshipEmail(contact);
  }
  return (
    (contact.consentClassification === "explicit_inquiry" || contact.consentClassification === "existing_relationship") &&
    (task.channel === "email" || task.channel === "phone" || task.channel === "sms")
  );
}

export function ClientLifecycleHandoffPanel({
  task,
  contact,
  draft,
  jobLabel,
  onDraftChange,
}: {
  task: DakotaTask;
  contact: DakotaVerifiedContact | null;
  draft: string;
  jobLabel: string;
  onDraftChange: (value: string) => void;
}) {
  const [approvedFingerprint, setApprovedFingerprint] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "message" | "recipient" | "error">("idle");
  if (!LIFECYCLE_TASK_TYPES.has(task.type)) return null;

  const compoundingAsk = task.type === "review_request" || task.type === "referral_request";
  const message = task.type === "review_request"
    ? buildReviewRequestMessage(jobLabel)
    : task.type === "referral_request"
      ? buildReferralRequestMessage()
      : draft;
  const routeAllowed = allowedLifecycleRoute(task, contact);
  const fingerprint = JSON.stringify({
    taskId: task.taskId,
    taskType: task.type,
    contactId: contact?.contactId ?? null,
    channel: contact?.channel ?? null,
    value: contact?.value ?? null,
    consent: contact?.consentClassification ?? null,
    message,
  });
  const approved = approvedFingerprint === fingerprint;

  const copyValue = async (kind: "message" | "recipient", value: string) => {
    if (!approved || !value) return;
    setCopyState("idle");
    try {
      await navigator.clipboard.writeText(value);
      setCopyState(kind);
    } catch {
      setCopyState("error");
    }
  };

  const appHref = task.channel === "email"
    ? GMAIL_COMPOSE_HREF
    : task.channel === "sms"
      ? GOOGLE_VOICE_MESSAGES_HREF
      : task.channel === "phone"
        ? GOOGLE_VOICE_CALLS_HREF
        : null;

  return (
    <section className="lifecycle-handoff" aria-labelledby="lifecycle-handoff-title">
      <header>
        <div><p className="eyebrow">Client compounding loop</p><h4 id="lifecycle-handoff-title">One exact client. One human send.</h4></div>
        <span><ShieldCheck size={16} /> No automation · no new service</span>
      </header>
      {compoundingAsk ? (
        <div className="lifecycle-message">
          <strong>{task.type === "review_request" ? "Approved review request" : "One-time referral ask"}</strong>
          <pre>{message}</pre>
          <small>{task.type === "review_request" ? "No incentive, no rating gate, and the canonical Google review link appears once." : "Created only after a verified positive client outcome; never create a second referral task for this record."}</small>
        </div>
      ) : (
        <label className="lifecycle-draft"><span>Private human-written message</span><textarea rows={7} maxLength={6000} value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="Write the exact client-success, proof, renewal, or expansion note. Nothing sends from Dakota…" /></label>
      )}
      <label className="artifact-approval">
        <input
          type="checkbox"
          checked={approved}
          disabled={!routeAllowed || !message.trim()}
          onChange={(event) => setApprovedFingerprint(event.target.checked ? fingerprint : null)}
        />
        <span><strong>I reviewed this exact client, route, and message.</strong>Copying or opening the app does not record a send, complete the task, or change revenue.</span>
      </label>
      {!routeAllowed ? <p className="pursuit-kit__reason"><ShieldCheck size={15} /> {compoundingAsk ? "Save and select an explicit-inquiry or existing-relationship email route first. Review and referral asks never use public-business contacts or SMS." : "This task needs its exact saved explicit-inquiry or existing-relationship email, phone, or SMS route."}</p> : null}
      <div className="pursuit-kit__controls">
        <button type="button" className="primary-button" disabled={!approved || !message.trim()} onClick={() => void copyValue("message", message)}>{copyState === "message" ? <Check size={17} /> : <Copy size={17} />}{copyState === "message" ? "Message copied" : "Copy approved message"}</button>
        <button type="button" className="secondary-button" disabled={!approved || !contact} onClick={() => contact && void copyValue("recipient", contact.value)}>{copyState === "recipient" ? <Check size={17} /> : <Copy size={17} />}{copyState === "recipient" ? "Recipient copied" : "Copy recipient"}</button>
        {appHref ? <button type="button" className="secondary-button" disabled={!approved} onClick={() => openExternal(appHref)}>{task.channel === "email" ? <Mail size={17} /> : task.channel === "sms" ? <MessageSquareText size={17} /> : <Phone size={17} />}{task.channel === "email" ? "Open Gmail" : task.channel === "sms" ? "Open Voice messages" : "Open Voice calls"} <ExternalLink size={15} /></button> : null}
      </div>
      <p className="pursuit-kit__contract"><ShieldCheck size={16} /> The app opens without client details in the URL. David verifies hello@littlefightnyc.com and the exact recipient, sends manually, then records the real result below.</p>
      <span className="sr-only" role="status" aria-live="polite">{copyState === "message" ? "Approved lifecycle message copied. No send was recorded." : copyState === "recipient" ? "Recipient copied. No send was recorded." : copyState === "error" ? "Clipboard access failed. Nothing was recorded." : ""}</span>
    </section>
  );
}
