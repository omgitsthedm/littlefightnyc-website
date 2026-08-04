import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Mail,
  MessageSquareText,
  Phone,
  Printer,
  ShieldCheck,
} from "lucide-react";
import {
  GOOGLE_VOICE_CALLS_HREF,
  GOOGLE_VOICE_MESSAGES_HREF,
} from "./workflow";
import {
  DAKOTA_PURSUIT_TEMPLATES,
  buildPursuitPacket,
  canOpenPursuitChannel,
  createPursuitAttribution,
  pursuitArtifactFingerprint,
  pursuitPacketIdForFingerprint,
  recommendPursuitTemplateId,
  type DakotaApprovedPursuitArtifact,
  type DakotaPursuitEvidenceItem,
} from "./pursuitKit";
import type {
  DakotaPursuitTemplateId,
  DakotaVerifiedContact,
} from "./types";

const GMAIL_COMPOSE_HREF = "https://mail.google.com/mail/u/hello%40littlefightnyc.com/#inbox?compose=new";

function downloadText(filename: string, value: string): void {
  const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(href);
}

function openExternal(href: string): void {
  window.open(href, "_blank", "noopener,noreferrer");
}

export function PursuitKitPanel({
  businessName,
  category,
  contact,
  evidence,
  offerFit,
  pursuitApproved,
  onArtifactChange,
}: {
  businessName: string;
  category: string;
  contact: DakotaVerifiedContact | null;
  evidence: readonly DakotaPursuitEvidenceItem[];
  offerFit: string;
  pursuitApproved: boolean;
  onArtifactChange: (artifact: DakotaApprovedPursuitArtifact | null) => void;
}) {
  const [templateId, setTemplateId] = useState<DakotaPursuitTemplateId>(() => recommendPursuitTemplateId(category));
  const contactName = contact?.name || contact?.role || "there";
  const fingerprint = useMemo(() => pursuitArtifactFingerprint({
    templateId,
    businessName,
    contactName,
    contactRoute: contact,
    offerFit,
    evidence,
  }), [businessName, contact, contactName, evidence, offerFit, templateId]);
  const [approvedArtifact, setApprovedArtifact] = useState<DakotaApprovedPursuitArtifact | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "packet" | "note" | "recipient" | "error">("idle");

  useEffect(() => {
    onArtifactChange(approvedArtifact?.fingerprint === fingerprint ? approvedArtifact : null);
  }, [approvedArtifact, fingerprint, onArtifactChange]);

  const packet = useMemo(() => buildPursuitPacket({
    templateId,
    packetId: pursuitPacketIdForFingerprint(fingerprint),
    businessName,
    contactName,
    offerFit,
    evidence,
    preparedAt: new Date().toISOString(),
  }), [businessName, contactName, evidence, fingerprint, offerFit, templateId]);
  const artifactApproved = Boolean(approvedArtifact && approvedArtifact.fingerprint === fingerprint);
  const channelAllowed = canOpenPursuitChannel(contact);
  const canApprove = Boolean(packet && pursuitApproved && channelAllowed);

  const changeTemplate = (next: DakotaPursuitTemplateId) => {
    if (next === templateId) return;
    setTemplateId(next);
    setApprovedArtifact(null);
    onArtifactChange(null);
    setCopyState("idle");
  };

  const setApproval = (approved: boolean) => {
    if (!approved) {
      setApprovedArtifact(null);
      return;
    }
    if (!packet || !canApprove) return;
    const approvedAt = new Date().toISOString();
    setApprovedArtifact({
      fingerprint,
      packet,
      attribution: createPursuitAttribution(packet, approvedAt),
    });
  };

  const copyValue = async (kind: "packet" | "note" | "recipient", value: string) => {
    if (!artifactApproved || !value) return;
    setCopyState("idle");
    try {
      await navigator.clipboard.writeText(value);
      setCopyState(kind);
    } catch {
      setCopyState("error");
    }
  };

  const printPacket = () => {
    if (!artifactApproved || !packet) return;
    document.body.classList.add("dakota-print-pursuit");
    const clean = () => document.body.classList.remove("dakota-print-pursuit");
    window.addEventListener("afterprint", clean, { once: true });
    window.print();
    clean();
  };

  const downloadPacket = () => {
    if (!artifactApproved || !packet) return;
    downloadText(`dakota-pursuit-${packet.packetId}.txt`, packet.plainText);
  };

  return (
    <section className="pursuit-kit" aria-labelledby="pursuit-kit-title">
      <header className="pursuit-kit__header">
        <div>
          <p className="eyebrow">Attributable reciprocity</p>
          <h4 id="pursuit-kit-title">Give them the useful answer first</h4>
          <p>Choose one authored playbook. The packet uses saved dossier evidence only; previewing it never changes stage, activity, milestones, or money.</p>
        </div>
        <span><ShieldCheck size={16} /> Human approved · zero new services</span>
      </header>

      <div className="pursuit-template-picker" aria-label="Approved pursuit templates">
        {DAKOTA_PURSUIT_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            className={template.id === templateId ? "pursuit-template pursuit-template--selected" : "pursuit-template"}
            aria-pressed={template.id === templateId}
            onClick={() => changeTemplate(template.id)}
          >
            <span>{template.segment.replaceAll("_", " ")}</span>
            <strong>{template.label}</strong>
            <small>{template.actionSteps.length} operator steps · v{template.version}</small>
          </button>
        ))}
      </div>

      {packet ? (
        <article className="pursuit-packet" aria-label="Pursuit packet preview">
          <header>
            <div className="pursuit-packet__brand"><img src="/brand-kit/assets/logo/mark-white.svg" alt="Little Fight NYC tugboat mark" /><span>Little Fight NYC · Dakota</span><strong>{packet.label}</strong></div>
            <div><small>Packet</small><code>{packet.packetId}</code></div>
          </header>
          <div className="pursuit-packet__title">
            <p>Prepared for {packet.businessName}</p>
            <h5>{packet.title}</h5>
            <span>{packet.purpose}</span>
          </div>
          <section>
            <h6>Verified dossier evidence</h6>
            <ol>{packet.evidence.map((item) => <li key={`${item.label}:${item.detail}`}><strong>{item.label}</strong><span>{item.detail}</span></li>)}</ol>
          </section>
          <section>
            <h6>Smallest credible offer</h6>
            <p>{packet.offerFit}</p>
          </section>
          <section>
            <h6>Action plan</h6>
            <ol className="pursuit-packet__steps">{packet.actionSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
          </section>
          <section className="pursuit-packet__note">
            <h6>Human-sent note · 75 words max · one question</h6>
            <pre>{packet.note}</pre>
          </section>
          <footer>Template {packet.templateId} · v{packet.templateVersion} · Packet v{packet.packetVersion} · {packet.segment.replaceAll("_", " ")}</footer>
        </article>
      ) : (
        <div className="pursuit-kit__locked"><ShieldCheck size={20} /><p><strong>Save the dossier evidence first.</strong>Add and save verified pain, one offer fit, and an allowed contact route before creating an artifact.</p></div>
      )}

      <label className="artifact-approval">
        <input type="checkbox" checked={artifactApproved} disabled={!canApprove} onChange={(event) => setApproval(event.target.checked)} />
        <span><strong>I reviewed this exact packet, evidence, recipient, steps, and note.</strong>This approval unlocks human-operated handoffs only. It does not record outreach or move the opportunity.</span>
      </label>
      {!pursuitApproved ? <p className="pursuit-kit__reason"><ShieldCheck size={15} /> Approve manual pursuit in step 03 before approving this artifact.</p> : !channelAllowed ? <p className="pursuit-kit__reason"><ShieldCheck size={15} /> Select and save an allowed route: explicit inquiry or existing relationship may use email, phone, or SMS; a verified public business route may use email or phone, never SMS.</p> : null}

      <div className="pursuit-kit__controls" aria-label="Approved artifact controls">
        <button type="button" className="primary-button" disabled={!artifactApproved || !packet} onClick={() => packet && void copyValue("note", packet.note)}>{copyState === "note" ? <Check size={17} /> : <Copy size={17} />}{copyState === "note" ? "Note copied" : "Copy approved note"}</button>
        <button type="button" className="secondary-button" disabled={!artifactApproved || !packet} onClick={() => packet && void copyValue("packet", packet.plainText)}>{copyState === "packet" ? <Check size={17} /> : <Copy size={17} />}{copyState === "packet" ? "Packet copied" : "Copy packet"}</button>
        <button type="button" className="secondary-button" disabled={!artifactApproved || !packet} onClick={printPacket}><Printer size={17} /> Print / save PDF</button>
        <button type="button" className="secondary-button" disabled={!artifactApproved || !packet} onClick={downloadPacket}><Download size={17} /> Download text</button>
        <button type="button" className="secondary-button" disabled={!artifactApproved || !contact} onClick={() => contact && void copyValue("recipient", contact.value)}>{copyState === "recipient" ? <Check size={17} /> : <Copy size={17} />}{copyState === "recipient" ? "Recipient copied" : "Copy recipient"}</button>
        {contact?.channel === "email" ? <button type="button" className="secondary-button" disabled={!artifactApproved} onClick={() => openExternal(GMAIL_COMPOSE_HREF)}><Mail size={17} /> Open Gmail <ExternalLink size={15} /></button> : null}
        {contact?.channel === "sms" ? <button type="button" className="secondary-button" disabled={!artifactApproved} onClick={() => openExternal(GOOGLE_VOICE_MESSAGES_HREF)}><MessageSquareText size={17} /> Open Voice messages <ExternalLink size={15} /></button> : null}
        {contact?.channel === "phone" ? <button type="button" className="secondary-button" disabled={!artifactApproved} onClick={() => openExternal(GOOGLE_VOICE_CALLS_HREF)}><Phone size={17} /> Open Voice calls <ExternalLink size={15} /></button> : null}
      </div>
      <p className="pursuit-kit__contract"><FileCheck2 size={16} /> Gmail and Voice open without prospect details in the URL. David verifies the sender and exact recipient, sends manually, then records the real result below.</p>
      <span className="sr-only" role="status" aria-live="polite">{copyState === "packet" ? "Approved packet copied. No outreach was recorded." : copyState === "note" ? "Approved note copied. No outreach was recorded." : copyState === "recipient" ? "Recipient copied. No outreach was recorded." : copyState === "error" ? "Clipboard access failed. Nothing was recorded." : ""}</span>

      {packet ? (
        <article className="pursuit-packet-print" aria-hidden="true">
          <header><div><img src="/brand-kit/assets/logo/mark-ink.svg" alt="" aria-hidden="true" /><strong>Little Fight NYC</strong></div><span>Dakota · Attributable Reciprocity</span></header>
          <p className="print-kicker">{packet.label} · v{packet.templateVersion}</p>
          <h1>{packet.title}</h1>
          <p className="print-for">Prepared for <strong>{packet.businessName}</strong></p>
          <section><h2>Verified dossier evidence</h2><ol>{packet.evidence.map((item) => <li key={`${item.label}:${item.detail}`}><strong>{item.label}:</strong> {item.detail}</li>)}</ol></section>
          <section><h2>Smallest credible offer</h2><p>{packet.offerFit}</p></section>
          <section><h2>Action plan</h2><ol>{packet.actionSteps.map((step) => <li key={step}>{step}</li>)}</ol></section>
          <section><h2>Human-sent note</h2><pre>{packet.note}</pre></section>
          <footer><span>{packet.packetId} · packet v{packet.packetVersion}</span><span>{packet.templateId} · {packet.segment}</span></footer>
        </article>
      ) : null}
    </section>
  );
}
