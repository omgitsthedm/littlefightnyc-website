import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "./VisualIndex.css";

export type VisualIndexItem = {
  body: string;
  eyebrow: string;
  icon: LucideIcon;
  image: string;
  title: string;
  to: string;
};

type Props = {
  dek?: string;
  eyebrow: string;
  id?: string;
  items: VisualIndexItem[];
  title: string;
  variant?: "feature" | "compact";
};

// Destination-specific CTA verb, keyed off the item's route so each card
// tells you where it goes instead of a repeated generic "Open".
const CTA_BY_SECTION: Record<string, string> = {
  services: "See the service",
  studio: "See the project",
  answers: "Read the answer",
  "case-studies": "See the study",
  industries: "See the playbook",
  journal: "Read the entry",
};

function ctaLabel(to: string): string {
  const section = to.replace(/^\/+/, "").split("/")[0];
  return CTA_BY_SECTION[section] ?? "Open";
}

export default function VisualIndex({
  dek,
  eyebrow,
  id,
  items,
  title,
  variant = "feature",
}: Props) {
  return (
    <section id={id} className={`lf-visual-index lf-visual-index--${variant}`}>
      <div className="lf-visual-index__inner">
        <header className="lf-visual-index__head">
          <p className="lf-visual-index__eyebrow">{eyebrow}</p>
          <h2 className="lf-visual-index__title">{title}</h2>
          {dek && <p className="lf-visual-index__dek">{dek}</p>}
        </header>

        <div className="lf-visual-index__grid">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                viewTransition
                className="lf-visual-index__item"
              >
                <span className="lf-visual-index__media" aria-hidden="true">
                  <img
                    src={item.image}
                    alt=""
                    {...responsiveImageProps(
                      item.image,
                      "(min-width: 1180px) 34vw, (min-width: 720px) 48vw, 100vw",
                    )}
                    loading={index < 2 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                  <span className="lf-visual-index__icon">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                </span>

                <span className="lf-visual-index__copy">
                  <span className="lf-visual-index__item-eyebrow">
                    {item.eyebrow}
                  </span>
                  <span className="lf-visual-index__item-title">
                    {item.title}
                  </span>
                  <span className="lf-visual-index__body">{item.body}</span>
                  <span className="lf-visual-index__open">
                    {ctaLabel(item.to)} <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
