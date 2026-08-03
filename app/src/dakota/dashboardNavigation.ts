export type DashboardView = "do-next" | "research" | "pipeline" | "money";

const DEFAULT_DASHBOARD_VIEW: DashboardView = "do-next";

const VIEW_ALIASES: Readonly<Record<string, DashboardView>> = {
  "do-next": "do-next",
  today: "do-next",
  inbound: "do-next",
  research: "research",
  queue: "research",
  pipeline: "pipeline",
  money: "money",
  revenue: "money",
};

export type DashboardLocationResolution = {
  view: DashboardView;
  href: string;
  shouldReplace: boolean;
};

function relativeHref(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function dashboardHrefForView(currentUrl: URL, view: DashboardView): string {
  const nextUrl = new URL(currentUrl.href);
  if (view === DEFAULT_DASHBOARD_VIEW) nextUrl.searchParams.delete("view");
  else nextUrl.searchParams.set("view", view);
  return relativeHref(nextUrl);
}

export function dashboardRecordKey(currentUrl: URL): string {
  return currentUrl.searchParams.get("record")?.trim().toLowerCase() ?? "";
}

export function dashboardHrefForRecord(currentUrl: URL, candidateKey: string | null): string {
  const nextUrl = new URL(currentUrl.href);
  if (candidateKey) nextUrl.searchParams.set("record", candidateKey.toLowerCase());
  else nextUrl.searchParams.delete("record");
  return relativeHref(nextUrl);
}

export function resolveDashboardLocation(currentUrl: URL): DashboardLocationResolution {
  const requestedView = currentUrl.searchParams.get("view");
  const view = requestedView === null
    ? DEFAULT_DASHBOARD_VIEW
    : VIEW_ALIASES[requestedView] ?? DEFAULT_DASHBOARD_VIEW;
  const href = dashboardHrefForView(currentUrl, view);

  return {
    view,
    href,
    shouldReplace: href !== relativeHref(currentUrl),
  };
}
