import { importWithRetry } from "@/lib/importWithRetry";

type RouteImporter = () => Promise<unknown>;

const shell = () => import("@/components/editorial/EditorialShell");

function importerForPath(pathname: string): RouteImporter | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/es") return () => import("@/pages/Espanol");
  if (path === "/zh") return () => import("@/pages/Zhongwen");
  if (path === "/website-check") return () => import("@/pages/WebsiteCheck");
  if (path === "/tech-audit") return () => import("@/pages/TechAudit");
  if (path === "/about") return () => import("@/pages/About");
  if (path === "/clients") return () => import("@/pages/Clients");
  if (path === "/contact") return () => import("@/pages/Contact");
  if (path === "/examples") return () => import("@/pages/FieldGuide");
  if (path === "/library") return () => import("@/pages/Library");
  if (path === "/nationwide") return () => import("@/pages/Nationwide");
  if (path === "/legal" || path === "/privacy" || path === "/terms") return () => import("@/pages/Legal");
  if (path === "/services") return () => import("@/pages/Services");
  if (path === "/areas") return () => import("@/pages/Areas");
  if (path.startsWith("/services/")) return () => import("@/pages/ServiceDetail");
  if (path.startsWith("/case-studies/")) return () => import("@/pages/CaseStudyDetail");
  if (path.startsWith("/journal/")) return () => import("@/pages/JournalPost");
  if (path.startsWith("/answers/")) return () => import("@/pages/AnswerGuide");
  if (path.split("/").length > 3 && path.startsWith("/areas/")) return () => import("@/pages/ServiceAreaDetail");
  if (path.startsWith("/areas/")) return () => import("@/pages/AreaDetail");
  return null;
}

/** Start only the route the visitor has selected; errors stay with navigation. */
export function preloadSelectedPublicRoute(pathname: string): void {
  const leaf = importerForPath(pathname);
  if (!leaf) return;
  void importWithRetry(shell).catch(() => {});
  void importWithRetry(leaf).catch(() => {});
}
