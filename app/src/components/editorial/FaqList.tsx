import { MessageCircleQuestion } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import "./FaqList.css";

/**
 * FaqList — a plain-English Q&A block. Reused on glossary, area, answer,
 * and service pages so every page can close with the questions owners
 * actually ask. Semantic <dl>; reveal via the global data-reveal rule.
 */
export default function FaqList({
  title = "Common questions",
  items,
}: {
  title?: string;
  items: Array<{ question: string; answer: string }>;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.15 });

  if (!items || items.length === 0) return null;

  return (
    <section ref={ref} className="lf-faq" data-reveal aria-label={title}>
      <p className="lf-faq__label">
        <MessageCircleQuestion size={14} strokeWidth={2} aria-hidden="true" />
        {title}
      </p>
      <dl className="lf-faq__list">
        {items.map((item) => (
          <div key={item.question} className="lf-faq__item">
            <dt className="lf-faq__q">{item.question}</dt>
            <dd className="lf-faq__a">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
