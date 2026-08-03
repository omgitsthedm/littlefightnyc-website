import { useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, LoaderCircle, Plus, ShieldCheck, X } from "lucide-react";
import { validateOperatorIdentity } from "./operatorValidation";
import { EMPTY_OPERATOR_RECORD, STATUS_LABELS } from "./revenue";
import type { OperatorIdentity, OperatorRecordInput, OperatorStatus } from "./types";

export function CaptureOpportunity({
  notebookAvailable,
  onClose,
  onSave,
}: {
  notebookAvailable: boolean;
  onClose: () => void;
  onSave: (key: string, record: OperatorRecordInput) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [status, setStatus] = useState<Extract<OperatorStatus, "early_signal" | "research_ready">>("early_signal");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = Boolean(businessName || category || city || sourceUrl || status !== "early_signal");

  const requestClose = () => {
    if (saving) return;
    if (!submittedRef.current && dirty && !window.confirm("Discard this unsaved Dakota opportunity?")) return;
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
    if (!dirty || submittedRef.current) return;
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

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!notebookAvailable) {
      setError("The private operator notebook is unavailable. Manual capture is paused.");
      return;
    }
    const sourceId = crypto.randomUUID().toLowerCase();
    const key = `manual:${sourceId}`;
    const identity: OperatorIdentity = {
      businessName,
      ...(category ? { category } : {}),
      ...(city ? { city } : {}),
      source: "manual",
      sourceId,
      ...(sourceUrl ? { publicSourceUrl: sourceUrl } : {}),
    };
    const identityError = validateOperatorIdentity(identity);
    if (identityError) {
      setError(identityError);
      return;
    }
    const record: OperatorRecordInput = {
      ...EMPTY_OPERATOR_RECORD,
      status,
      identity,
    };

    setSaving(true);
    try {
      await onSave(key, record);
      submittedRef.current = true;
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The manual opportunity could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      className="capture-dialog"
      ref={dialogRef}
      aria-labelledby="capture-title"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <form className="capture-card" name="dakota-manual-opportunity" autoComplete="off" onSubmit={save} noValidate>
        <header>
          <div>
            <p className="eyebrow"><span /> Manual public-source intake</p>
            <h2 id="capture-title">Capture opportunity</h2>
          </div>
          <button className="icon-button" type="button" onClick={requestClose} disabled={saving} aria-label="Close manual capture">
            <X size={20} />
          </button>
        </header>
        <p className="capture-lede">Add a public business for private research. This creates no contact, message, form submission, or queue mutation.</p>

        <div className="capture-grid">
          <label>
            <span>Business name <small>Required</small></span>
            <input name="business_name" autoComplete="off" required maxLength={240} value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
          </label>
          <label>
            <span>Category</span>
            <input name="category" autoComplete="off" maxLength={160} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Restaurant, salon, law firm…" />
          </label>
          <label>
            <span>City / location</span>
            <input name="city" autoComplete="off" maxLength={160} value={city} onChange={(event) => setCity(event.target.value)} placeholder="New York, NY…" />
          </label>
          <label>
            <span>Public HTTPS source URL</span>
            <input name="public_source_url" autoComplete="off" spellCheck={false} maxLength={2048} type="url" inputMode="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://…" />
          </label>
          <label>
            <span>Starting state</span>
            <select name="starting_state" autoComplete="off" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <option value="early_signal">{STATUS_LABELS.early_signal}</option>
              <option value="research_ready">{STATUS_LABELS.research_ready}</option>
            </select>
          </label>
        </div>

        <div className="no-send-contract"><ShieldCheck size={16} /><span><strong>Capture only.</strong> The record stays in Dakota’s private operator notebook.</span></div>
        {error ? <div className="form-error" ref={errorRef} tabIndex={-1} role="alert"><CircleAlert size={16} />{error}</div> : null}
        <footer>
          <button type="button" className="secondary-button" onClick={requestClose} disabled={saving}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving || !notebookAvailable}>
            {saving ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}
            Save private signal
          </button>
        </footer>
      </form>
    </dialog>
  );
}
