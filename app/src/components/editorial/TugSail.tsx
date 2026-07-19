import { useEffect, useState } from "react";
import TugMark from "./TugMark";
import "./TugSail.css";

/**
 * The secret sail — type "t·u·g" anywhere (outside a form field) and the
 * little boat crosses the bottom of the viewport, wake and all. Pure
 * discoverable delight; the mascot canon holds (steel hull, ONE orange
 * beacon). Skipped entirely under prefers-reduced-motion; ignores keys
 * while an input/textarea/contenteditable has focus; unmounts after one
 * crossing so it costs nothing when idle.
 */
export default function TugSail() {
  const [sailing, setSailing] = useState(false);

  useEffect(() => {
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-3);
      if (buffer === "tug") {
        buffer = "";
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        setSailing(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!sailing) return;
    const timer = window.setTimeout(() => setSailing(false), 5200);
    return () => window.clearTimeout(timer);
  }, [sailing]);

  if (!sailing) return null;

  return (
    <div className="lf-tugsail" aria-hidden="true">
      <div className="lf-tugsail__boat">
        <span className="lf-tugsail__toot">toot toot!</span>
        <span className="lf-tugsail__beacon" />
        <TugMark className="lf-tugsail__mark" />
        <span className="lf-tugsail__wake" />
      </div>
    </div>
  );
}
