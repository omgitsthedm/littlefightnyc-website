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
  event?: "human_review_requested";
};

export function acquisitionCtaForIntent(
  intent: AcquisitionIntent,
  source: string,
): AcquisitionCta {
  if (intent === "website") {
    return {
      href: "/website-check/",
      label: "Check my website",
      compactLabel: "Check website",
      kicker: "Website",
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
      label: "Plan my system",
      compactLabel: "Plan it",
      kicker: "Systems",
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
