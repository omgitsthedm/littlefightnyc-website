export type AcquisitionIntent =
  | "website"
  | "support"
  | "consulting"
  | "systems"
  | "clients"
  | "general";

const SERVICE_INTENTS: Record<string, AcquisitionIntent> = {
  "custom-local-websites": "website",
  "it-support": "support",
  "tech-consulting": "consulting",
  "business-systems": "systems",
};

export function acquisitionIntentForServiceSlug(
  slug: string | undefined,
): AcquisitionIntent {
  return slug ? SERVICE_INTENTS[slug] ?? "general" : "general";
}

export function acquisitionIntentForPathname(
  pathname: string,
): AcquisitionIntent {
  const path = `/${pathname.replace(/^\/+|\/+$/g, "")}`;

  if (path === "/clients" || path.startsWith("/clients/")) return "clients";
  if (
    path === "/" ||
    path === "/website-check" ||
    path === "/nationwide" ||
    path === "/services/new-business-launch" ||
    path === "/services/ongoing-care" ||
    path === "/services/custom-local-websites" ||
    /^\/areas\/[^/]+\/websites$/.test(path)
  ) {
    return "website";
  }
  if (
    path === "/services/it-support" ||
    /^\/areas\/[^/]+\/it-support$/.test(path)
  ) {
    return "support";
  }
  if (
    path === "/tech-audit" ||
    path === "/services/tech-consulting" ||
    /^\/areas\/[^/]+\/local-search$/.test(path)
  ) {
    return "consulting";
  }
  if (
    path === "/services/business-systems" ||
    path === "/studio" ||
    path.startsWith("/studio/") ||
    /^\/areas\/[^/]+\/business-systems$/.test(path)
  ) {
    return "systems";
  }
  return "general";
}

export function techAuditHref(intent: AcquisitionIntent, source: string) {
  const safeSource = source.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "site";
  const params = new URLSearchParams();
  if (["website", "support", "consulting", "systems"].includes(intent)) {
    params.set("intent", intent);
  }
  params.set("source", safeSource);
  return `/tech-audit/?${params.toString()}`;
}

export type AcquisitionCta = {
  href: string;
  label: string;
  compactLabel: string;
  kicker: string;
  /**
   * The sticky mobile help bar has a hard height budget (a 320px phone gives
   * it ~14% of the viewport, permanently). Longer, better kickers stay on the
   * roomy surfaces; this is the short form for that one bar.
   */
  compactKicker?: string;
  event?: "human_review_requested";
};

export function acquisitionCtaForIntent(
  intent: AcquisitionIntent,
  source: string,
): AcquisitionCta {
  if (intent === "website") {
    return {
      // Straight to the URL field, focused (RouteScrollManager focuses form
      // controls named by a hash) — one tap fewer than landing at the top of
      // the page and finding the box two screens down.
      href: "/website-check/#website-check-url",
      label: "Check my website",
      compactLabel: "Check website",
      kicker: "Free first look",
      compactKicker: "Free look",
    };
  }
  if (intent === "support") {
    return {
      href: techAuditHref(intent, source),
      label: "Get tech help",
      compactLabel: "Get help",
      kicker: "Tech help",
      event: "human_review_requested",
    };
  }
  if (intent === "systems") {
    return {
      href: techAuditHref(intent, source),
      label: "Plan software you own",
      compactLabel: "Plan it",
      kicker: "Free consult",
      compactKicker: "Free consult",
      event: "human_review_requested",
    };
  }
  if (intent === "clients") {
    return {
      href: "/clients/",
      label: "Open client desk",
      compactLabel: "Client desk",
      kicker: "Clients",
    };
  }
  return {
    href: techAuditHref(intent, source),
    label: "Free second opinion",
    compactLabel: "Second opinion",
    kicker: "Free consult",
    event: "human_review_requested",
  };
}
