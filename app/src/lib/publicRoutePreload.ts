import { importWithRetry } from "@/lib/importWithRetry";

type RouteImporter = () => Promise<unknown>;
type PublicRoute = { leaf: RouteImporter; shell?: boolean };

const shell = () => import("@/components/editorial/EditorialShell");
const selectedPreloads = new Map<string, Promise<void>>();

function excludedPath(path: string): boolean {
  return path === "/app" ||
    path.startsWith("/app/") ||
    path === "/dakota.html" ||
    path.startsWith("/.netlify/identity") ||
    path.startsWith("/identity-callback");
}

function routeForPath(pathname: string): PublicRoute | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (excludedPath(path)) return null;
  if (path === "/") return null;
  if (path === "/es") return { leaf: () => import("@/pages/Espanol") };
  if (path === "/zh") return { leaf: () => import("@/pages/Zhongwen") };
  if (path === "/website-check") return { leaf: () => import("@/pages/WebsiteCheck"), shell: true };
  if (path === "/tech-audit" || path === "/fit-check" || path === "/audit") return { leaf: () => import("@/pages/TechAudit"), shell: true };
  if (path === "/about") return { leaf: () => import("@/pages/About"), shell: true };
  if (path === "/clients") return { leaf: () => import("@/pages/Clients"), shell: true };
  if (path === "/contact") return { leaf: () => import("@/pages/Contact"), shell: true };
  if (path === "/examples") return { leaf: () => import("@/pages/FieldGuide"), shell: true };
  if (path === "/library" || path === "/answers" || path === "/journal") return { leaf: () => import("@/pages/Library"), shell: true };
  if (path === "/nationwide") return { leaf: () => import("@/pages/Nationwide"), shell: true };
  if (path === "/legal" || path === "/privacy" || path === "/terms") return { leaf: () => import("@/pages/Legal"), shell: true };
  if (path === "/services" || path === "/work") return { leaf: () => import("@/pages/Services"), shell: true };
  if (path === "/services/new-business-launch") return { leaf: () => import("@/pages/NewBusinessLaunch"), shell: true };
  if (path === "/services/ongoing-care") return { leaf: () => import("@/pages/OngoingCare"), shell: true };
  if (path === "/websites" || path === "/systems" || path === "/consulting" || path === "/it-support") return { leaf: () => import("@/pages/ServiceDetail"), shell: true };
  if (path === "/lifetime-cost") return { leaf: () => import("@/pages/AnswerGuide"), shell: true };
  if (path === "/start") return { leaf: () => import("@/pages/CardStart"), shell: true };
  if (path === "/trivia/1979") return { leaf: () => import("@/pages/TriviaAnswer"), shell: true };
  if (path === "/thanks") return { leaf: () => import("@/pages/Thanks"), shell: true };
  if (path === "/glossary") return { leaf: () => import("@/pages/Glossary"), shell: true };
  if (path.startsWith("/glossary/")) return { leaf: () => import("@/pages/GlossaryTerm"), shell: true };
  if (path === "/areas") return { leaf: () => import("@/pages/Areas"), shell: true };
  if (path.split("/").length > 3 && path.startsWith("/areas/")) return { leaf: () => import("@/pages/ServiceAreaDetail"), shell: true };
  if (path.startsWith("/areas/")) return { leaf: () => import("@/pages/AreaDetail"), shell: true };
  if (path.startsWith("/services/")) return { leaf: () => import("@/pages/ServiceDetail"), shell: true };
  if (path === "/case-studies" || path === "/industries") return { leaf: () => import("@/pages/FieldGuide"), shell: true };
  if (path === "/studio") return { leaf: () => import("@/pages/Services"), shell: true };
  if (path.startsWith("/case-studies/")) return { leaf: () => import("@/pages/CaseStudyDetail"), shell: true };
  if (path.startsWith("/industries/")) return { leaf: () => import("@/pages/IndustryDetail"), shell: true };
  if (path.startsWith("/studio/")) return { leaf: () => import("@/pages/StudioDetail"), shell: true };
  if (path.startsWith("/journal/")) return { leaf: () => import("@/pages/JournalPost"), shell: true };
  if (path.startsWith("/answers/")) return { leaf: () => import("@/pages/AnswerGuide"), shell: true };
  return { leaf: () => import("@/pages/NotFound"), shell: true };
}

/**
 * Preload only the public route a visitor selected. The returned promise is
 * shared by hover, focus, and click so the click waits for the same request.
 */
export function preloadSelectedPublicRoute(pathname: string): Promise<void> | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const route = routeForPath(normalized);
  if (!route) return null;
  const existing = selectedPreloads.get(normalized);
  if (existing) return existing;

  const preload = Promise.all([
    importWithRetry(route.leaf),
    ...(route.shell ? [importWithRetry(shell)] : []),
  ]).then(() => undefined);
  selectedPreloads.set(normalized, preload);
  void preload.catch(() => selectedPreloads.delete(normalized));
  return preload;
}
