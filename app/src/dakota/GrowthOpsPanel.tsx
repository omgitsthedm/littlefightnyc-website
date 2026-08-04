import { useState } from "react";
import { CalendarClock, Check, Copy, ExternalLink, MapPinned, ShieldCheck } from "lucide-react";
import { upcomingHolidayHoursFlags, weeklyGbpDraft } from "./growthOps";
import { formatDate } from "./presentation";

const GOOGLE_BUSINESS_HREF = "https://business.google.com/";

export function GrowthOpsPanel({ now }: { now: Date }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const draft = weeklyGbpDraft(now);
  const holidayFlags = upcomingHolidayHoursFlags(now);
  const postText = `${draft.title}\n\n${draft.body}\n\n${draft.ctaLabel}: ${draft.ctaUrl}`;

  const copyDraft = async () => {
    setCopyState("idle");
    try {
      await navigator.clipboard.writeText(postText);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <section className="growth-ops" aria-labelledby="growth-ops-title">
      <header>
        <div><p className="eyebrow">Owned visibility desk</p><h3 id="growth-ops-title">This week’s Google profile draft</h3><span>Week of {formatDate(draft.weekKey)} · {draft.theme}</span></div>
        <strong><ShieldCheck size={16} /> Draft only · human publish</strong>
      </header>
      <div className="growth-ops__grid">
        <article className="growth-ops__draft">
          <span>Human-authored weekly draft</span>
          <h4>{draft.title}</h4>
          <p>{draft.body}</p>
          <a href={draft.ctaUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{draft.ctaLabel} <ExternalLink size={15} /></a>
          <div><button type="button" className="primary-button" onClick={() => void copyDraft()}>{copyState === "copied" ? <Check size={17} /> : <Copy size={17} />}{copyState === "copied" ? "Draft copied" : "Copy weekly draft"}</button><a className="secondary-button" href={GOOGLE_BUSINESS_HREF} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open Google Business <ExternalLink size={16} /></a></div>
        </article>
        <aside className="growth-ops__holidays" aria-labelledby="holiday-hours-title">
          <div><CalendarClock size={20} /><span><strong id="holiday-hours-title">Holiday-hours watch</strong>Verify the real schedule before changing the website or Google profile.</span></div>
          {holidayFlags.length ? <ul>{holidayFlags.map((flag) => <li key={`${flag.name}:${flag.observedDate}`}><MapPinned size={17} /><span><strong>{flag.name}</strong>{flag.actualDate === flag.observedDate ? formatDate(flag.actualDate) : `${formatDate(flag.actualDate)} · observed ${formatDate(flag.observedDate)}`} · {flag.daysUntilObserved === 0 ? "today" : `${flag.daysUntilObserved} days`}</span></li>)}</ul> : <p>No federal holiday falls inside the next 45 days.</p>}
        </aside>
      </div>
      <p className="growth-ops__contract"><ShieldCheck size={16} /> Copying or opening Google changes nothing in Dakota. David or Aside verifies the current offer, edits as needed, and publishes manually. No GBP write API is used.</p>
      <span className="sr-only" role="status" aria-live="polite">{copyState === "copied" ? "Weekly Google Business Profile draft copied. Nothing was published." : copyState === "error" ? "Clipboard access failed. Nothing was published." : ""}</span>
    </section>
  );
}
