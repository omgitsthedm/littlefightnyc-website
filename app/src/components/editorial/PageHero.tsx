import {
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import type { CinematicMediaAsset } from "@/data/cinematic-media";
import { HELLO_EMAIL, PHONE_HREF, SMS_HREF } from "@/data/contact";
import {
  acquisitionCtaForIntent,
  acquisitionIntentForPathname,
  techAuditHref,
} from "@/lib/acquisitionIntent";
import CinematicMedia from "./CinematicMedia";
import "./PageHero.css";

type PageHeroAction = {
  href: string;
  label: string;
  kicker?: string;
  event?: string;
};

type Props = {
  eyebrow?: string;
  icon?: LucideIcon;
  title: React.ReactNode;
  dek?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    /** Cap mobile density for unusually heavy images while preserving desktop detail. */
    mobileWidths?: number[];
    video?: CinematicMediaAsset;
    fit?: "cover" | "contain";
  };
  /**
   * Case-study archetype: the project proof image runs full-bleed BEHIND the
   * title under a dark scrim. The work IS the hero.
   */
  backdrop?: {
    src: string;
    alt: string;
    position?: string;
    mobilePosition?: string;
    video?: CinematicMediaAsset;
    fit?: "cover" | "contain";
  };
  /**
   * Answer archetype: an orange "quick answer" card sits right in the hero.
   * No photo — the page should look like an answer, not a brochure.
   */
  quickAnswer?: React.ReactNode;
  /**
   * Area archetype: the neighborhood name at display scale above the h1.
   * Decorative (the eyebrow already names it for screen readers).
   */
  displayName?: string;
  /** Area archetype: small mono chips (e.g. ZIP codes) under the dek. */
  chips?: string[];
  /**
   * The owner-facing first move. Omit it to derive the route-appropriate
   * action. Pass false only when the page itself is a completed action, such
   * as the thank-you screen.
   */
  action?: PageHeroAction | false;
  /** Keep the quick contact choices visible by default on every inner page. */
  showContactRail?: boolean;
};

const PROTECTED_PRESENTATION_PATHS = new Set([
  "/studio/dakota/",
  "/studio/cockpit/",
  "/studio/venuecircuit/",
  "/case-studies/public-house-creative/",
  "/case-studies/venuecircuit/",
]);

/**
 * Reusable hero for every inner page — now with archetypes so no two page
 * types feel stamped from one template:
 * - default: eyebrow + big title + dek (+ optional side image)
 * - case (`backdrop`): full-bleed project proof image behind the title
 * - answer (`quickAnswer`): pure type + an orange quick-answer card
 * - area (`displayName` + `chips`): giant neighborhood name + ZIP chips
 */
export default function PageHero({
  eyebrow,
  icon: Icon,
  title,
  dek,
  image,
  backdrop,
  quickAnswer,
  displayName,
  chips,
  action,
  showContactRail = true,
}: Props) {
  const ref = useScrollReveal<HTMLElement>({ revealOnMount: true });
  const { pathname } = useLocation();
  const normalizedPathname = pathname === "/" ? "/" : `${pathname.replace(/\/$/, "")}/`;
  const protectedPresentation = PROTECTED_PRESENTATION_PATHS.has(normalizedPathname);
  const intent = acquisitionIntentForPathname(pathname);
  const defaultAction = acquisitionCtaForIntent(intent, "page_hero");
  const resolvedAction = action === false
    ? null
    : action ?? {
        href: defaultAction.href,
        label: defaultAction.label,
        kicker: defaultAction.kicker,
        event: defaultAction.event,
      };
  const formHref = pathname.replace(/\/$/, "") === "/tech-audit"
    ? "#fit-step-title"
    : techAuditHref(intent, "page_hero_form");

  // Full-bleed backdrop: responsive variants ship at 480/640/900 — include the
  // original full-size asset so big screens still get a sharp image.
  const backdropImg = backdrop && !backdrop.video
    ? (() => {
        const p = responsiveImageProps(backdrop.src, "100vw", [640, 900]);
        return "srcSet" in p && p.srcSet
          ? { sizes: p.sizes, srcSet: `${p.srcSet}, ${backdrop.src} 1800w` }
          : p;
      })()
    : undefined;

  const variantClass = [
    image ? "lf-pagehero--with-image" : "",
    backdrop ? "lf-pagehero--case" : "",
    quickAnswer ? "lf-pagehero--answer" : "",
    displayName ? "lf-pagehero--area" : "",
    protectedPresentation ? "lf-pagehero--protected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={ref}
      className={`lf-pagehero ${variantClass}`}
      data-lf-owner-intro="true"
    >
      {backdrop && (
        <div
          className="lf-pagehero__backdrop"
          aria-hidden={backdrop.video ? undefined : true}
          style={
            {
              "--lf-backdrop-position": backdrop.position,
              "--lf-backdrop-position-mobile": backdrop.mobilePosition,
            } as React.CSSProperties
          }
        >
          {backdrop.video ? (
            <CinematicMedia
              media={backdrop.video}
              fit={backdrop.fit ?? "cover"}
              priority
            />
          ) : (
            <img
              src={backdrop.src}
              alt=""
              {...backdropImg}
              fetchPriority="high"
              decoding="async"
            />
          )}
          <span className="lf-pagehero__scrim" />
        </div>
      )}

      <div className="lf-pagehero__inner">
        <div className="lf-pagehero__text">
          {(eyebrow || Icon) && (
            <p className="lf-pagehero__eyebrow">
              {Icon && (
                <span className="lf-pagehero__eyebrow-icon" aria-hidden="true">
                  <Icon size={15} strokeWidth={2} />
                </span>
              )}
              {eyebrow}
            </p>
          )}
          {displayName && (
            <p
              className="lf-pagehero__display"
              aria-hidden="true"
              // Longest unbreakable word drives the fit cap (see PageHero.css):
              // long names like "Williamsburg." would otherwise clip against
              // the hero image column at every viewport.
              style={
                {
                  "--lf-display-ch": Math.max(
                    ...displayName.split(/\s+/).map((w) => w.length)
                  ),
                } as React.CSSProperties
              }
            >
              <em>{displayName}</em>
            </p>
          )}
          <h1 className="lf-pagehero__title">{title}</h1>
          {dek && <p className="lf-pagehero__dek">{dek}</p>}
          {quickAnswer && (
            <aside className="lf-pagehero__quick" aria-label="Quick answer">
              <span className="lf-pagehero__quick-label">Quick answer</span>
              <p className="lf-pagehero__quick-body">{quickAnswer}</p>
            </aside>
          )}
          {chips && chips.length > 0 && (
            <ul className="lf-pagehero__chips" aria-label="ZIP codes we cover here">
              {chips.map((chip) => (
                <li key={chip} className="lf-pagehero__chip">
                  {chip}
                </li>
              ))}
            </ul>
          )}
          {showContactRail && !protectedPresentation && resolvedAction && (
            <div className="lf-pagehero__actions" data-lf-contact-rail="true">
              <div className="lf-pagehero__decisions" role="group" aria-label="Start here">
                {resolvedAction.href.startsWith("/") ? (
                  <Link
                    className="lf-pagehero__decision lf-pagehero__decision--primary"
                    to={resolvedAction.href}
                    data-lf-event={resolvedAction.event}
                    data-lf-label="page_hero"
                  >
                    <span>{resolvedAction.kicker ?? "Start here"}</span>
                    <strong>{resolvedAction.label}</strong>
                    <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                  </Link>
                ) : (
                  <a
                    className="lf-pagehero__decision lf-pagehero__decision--primary"
                    href={resolvedAction.href}
                    data-lf-event={resolvedAction.event}
                    data-lf-label="page_hero"
                  >
                    <span>{resolvedAction.kicker ?? "Start here"}</span>
                    <strong>{resolvedAction.label}</strong>
                    <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                  </a>
                )}
                <a
                  className="lf-pagehero__decision lf-pagehero__decision--urgent"
                  href={PHONE_HREF}
                  data-lf-label="page_hero_phone"
                >
                  <span>Something is broken?</span>
                  <strong>Call now</strong>
                  <Phone size={18} strokeWidth={2} aria-hidden="true" />
                </a>
              </div>

              <div className="lf-pagehero__channels" aria-label="More ways to reach Little Fight NYC">
                <a href={SMS_HREF} data-lf-label="page_hero_sms">
                  <MessageSquare size={15} strokeWidth={2} aria-hidden="true" />
                  Text
                </a>
                <a href={`mailto:${HELLO_EMAIL}`} data-lf-label="page_hero_email">
                  <Mail size={15} strokeWidth={2} aria-hidden="true" />
                  Email
                </a>
                <a href={formHref} data-lf-label="page_hero_form">
                  <Send size={15} strokeWidth={2} aria-hidden="true" />
                  Form
                </a>
              </div>
              <p className="lf-pagehero__hours">
                9am–9pm Eastern: a human answers. After hours: leave a message.
              </p>
            </div>
          )}
        </div>

        {image && (
          <div className="lf-pagehero__image">
            {image.video ? (
              <CinematicMedia
                media={image.video}
                alt={image.alt}
                fit={image.fit ?? "cover"}
                priority
              />
            ) : (
              <picture className="lf-pagehero__picture">
                {image.mobileWidths && (
                  <source
                    media="(max-width: 767px)"
                    {...responsiveImageProps(image.src, "100vw", image.mobileWidths)}
                  />
                )}
                <img
                  {...skelImg}
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  style={{
                    objectFit: image.fit ?? "cover",
                    objectPosition: image.fit === "contain" ? "center center" : undefined,
                  }}
                  {...responsiveImageProps(
                    image.src,
                    "(min-width: 1440px) 36vw, (min-width: 1024px) 42vw, 100vw",
                    [480, 640, 900],
                  )}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
