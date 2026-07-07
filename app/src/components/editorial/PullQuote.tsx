import type { ReactNode } from "react";
import { useScrollReveal } from "./useScrollReveal";
import "./PullQuote.css";

/**
 * PullQuote — a full-measure call-out. Used to lift one concrete line
 * (an example, a customer truth, a claim) out of the body copy so a
 * text-heavy page has a visual beat to land on. Orange rule = signal.
 */
export default function PullQuote({
  children,
  cite,
}: {
  children: ReactNode;
  cite?: string;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.3 });

  return (
    <figure ref={ref} className="lf-pullquote" data-reveal>
      <blockquote className="lf-pullquote__quote">{children}</blockquote>
      {cite && <figcaption className="lf-pullquote__cite">{cite}</figcaption>}
    </figure>
  );
}
