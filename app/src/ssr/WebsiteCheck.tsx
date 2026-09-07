/* eslint-disable react-refresh/only-export-components -- Build-only SSR exports are renderer functions, never browser HMR boundaries. */
import { renderToStaticMarkup } from "react-dom/server";
import { Route, Routes, StaticRouter } from "react-router-dom";
import EditorialShell from "@/components/editorial/EditorialShell";
import Home from "@/pages/Home";
import ServiceDetail from "@/pages/ServiceDetail";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import TechAudit from "@/pages/TechAudit";
import WebsiteCheck from "@/pages/WebsiteCheck";

/**
 * Build-time public markup for the acquisition routes that need the actual
 * component tree before the browser leaf has loaded. These deliberately do
 * not render App: App is lazy-route orchestration, while each entry below is
 * the same direct page and shell the browser renders after that orchestration.
 * main.tsx still uses createRoot and retains each snapshot until its real lazy
 * leaf has committed.
 */
export const COMPONENT_RENDERED_PUBLIC_PATHS = [
  "/",
  "/website-check/",
  "/services/custom-local-websites/",
  "/case-studies/hair-by-rachel-charles/",
  "/tech-audit/",
] as const;

export type ComponentRenderedPublicPath =
  (typeof COMPONENT_RENDERED_PUBLIC_PATHS)[number];

export function isComponentRenderedPublicPath(
  pathname: string,
): pathname is ComponentRenderedPublicPath {
  return (COMPONENT_RENDERED_PUBLIC_PATHS as readonly string[]).includes(pathname);
}

function renderWithinEditorialShell(
  pathname: Exclude<ComponentRenderedPublicPath, "/">,
): string {
  return renderToStaticMarkup(
    <StaticRouter location={pathname}>
      <Routes>
        <Route element={<EditorialShell />}>
          <Route path="/website-check/" element={<WebsiteCheck />} />
          <Route path="/services/:slug/" element={<ServiceDetail />} />
          <Route path="/case-studies/:slug/" element={<CaseStudyDetail />} />
          <Route path="/tech-audit/" element={<TechAudit />} />
        </Route>
      </Routes>
    </StaticRouter>,
  );
}

export function renderPublicRoute(pathname: ComponentRenderedPublicPath): string {
  if (!isComponentRenderedPublicPath(pathname)) {
    throw new Error(`Public component rendering is not enabled for ${pathname}`);
  }
  if (pathname === "/") {
    return renderToStaticMarkup(
      <StaticRouter location={pathname}>
        <Home />
      </StaticRouter>,
    );
  }

  return renderWithinEditorialShell(pathname);
}

// Kept as a narrow compatibility export for existing tooling while callers
// migrate to the explicit route map above.
export function renderWebsiteCheck(): string {
  return renderPublicRoute("/website-check/");
}
