import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteMetaManager from "@/components/RouteMetaManager";
import RouteScrollManager from "@/components/RouteScrollManager";
import GlobalViewTransitions from "@/components/GlobalViewTransitions";
import { importWithRetry } from "@/lib/importWithRetry";
import Home from "@/pages/Home";

// All route chunks retry once on a transient load failure; the ErrorBoundary
// below force-reloads on a stale-hash failure so a returning visitor on an old
// index.html self-heals instead of seeing a blank screen.
function lazyRoute<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
) {
  return lazy(() => importWithRetry(importer));
}

const EditorialShell = lazyRoute(() => import("@/components/editorial/EditorialShell"));
const Espanol = lazyRoute(() => import("@/pages/Espanol"));
const AnswerGuide = lazyRoute(() => import("@/pages/AnswerGuide"));
const About = lazyRoute(() => import("@/pages/About"));
const AreaDetail = lazyRoute(() => import("@/pages/AreaDetail"));
const Areas = lazyRoute(() => import("@/pages/Areas"));
const CaseStudies = lazyRoute(() => import("@/pages/CaseStudies"));
const CaseStudyDetail = lazyRoute(() => import("@/pages/CaseStudyDetail"));
const Contact = lazyRoute(() => import("@/pages/Contact"));
const FieldGuide = lazyRoute(() => import("@/pages/FieldGuide"));
const TechAudit = lazyRoute(() => import("@/pages/TechAudit"));
const Glossary = lazyRoute(() => import("@/pages/Glossary"));
const GlossaryTerm = lazyRoute(() => import("@/pages/GlossaryTerm"));
const IndustryDetail = lazyRoute(() => import("@/pages/IndustryDetail"));
const Library = lazyRoute(() => import("@/pages/Library"));
const JournalPost = lazyRoute(() => import("@/pages/JournalPost"));
const Legal = lazyRoute(() => import("@/pages/Legal"));
const NotFound = lazyRoute(() => import("@/pages/NotFound"));
const ServiceAreaDetail = lazyRoute(() => import("@/pages/ServiceAreaDetail"));
const ServiceDetail = lazyRoute(() => import("@/pages/ServiceDetail"));
const Services = lazyRoute(() => import("@/pages/Services"));
const StudioDetail = lazyRoute(() => import("@/pages/StudioDetail"));
const Thanks = lazyRoute(() => import("@/pages/Thanks"));

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading__mark" aria-hidden="true">
        <span className="route-loading__dot" />
        <span className="route-loading__dot" />
        <span className="route-loading__dot" />
      </span>
      <span className="route-loading__label">Little Fight NYC</span>
      <span className="route-loading__line">Preparing the right page.</span>
    </div>
  );
}

function route(Component: ComponentType) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  return (
    <>
      <RouteMetaManager />
      <RouteScrollManager />
      <GlobalViewTransitions />
      <ErrorBoundary>
      <Routes>
        {/* Home: custom layout with the full Press Strike masthead - the
            magazine cover. Everything else inherits EditorialShell with the
            compact running masthead. */}
        <Route index element={<Home />} />

        {/* The complete pitch in Spanish — standalone, fully-Spanish chrome
            (an English nav/footer around Spanish content would be half a page). */}
        <Route path="es" element={route(Espanol)} />

        <Route
          element={
            <Suspense fallback={<RouteLoading />}>
              <EditorialShell />
            </Suspense>
          }
        >
          <Route path="services" element={route(Services)} />
          <Route path="services/:slug" element={route(ServiceDetail)} />
          <Route path="work" element={<Navigate to="/services/" replace />} />
          <Route path="websites" element={<Navigate to="/services/custom-local-websites/" replace />} />
          <Route path="systems" element={<Navigate to="/services/business-systems/" replace />} />
          <Route path="consulting" element={<Navigate to="/services/tech-consulting/" replace />} />
          <Route path="it-support" element={<Navigate to="/services/it-support/" replace />} />
          <Route path="lifetime-cost" element={<Navigate to="/answers/reduce-monthly-software-costs-small-business/" replace />} />
          <Route path="tech-audit" element={route(TechAudit)} />
          {/* Fit Check renamed to Tech Audit (2026-07-12) — SPA-side backup
              for the _redirects 301 so in-app history links never dead-end. */}
          <Route path="fit-check" element={<Navigate to="/tech-audit/" replace />} />
          <Route path="examples" element={route(FieldGuide)} />
          <Route path="audit" element={<Navigate to="/tech-audit/" replace />} />
          <Route path="library" element={route(Library)} />
          <Route path="answers" element={<Navigate to="/library/" replace />} />
          <Route path="answers/:slug" element={route(AnswerGuide)} />
          <Route path="glossary" element={route(Glossary)} />
          <Route path="glossary/:slug" element={route(GlossaryTerm)} />
          <Route path="journal" element={<Navigate to="/library/" replace />} />
          <Route path="journal/:slug" element={route(JournalPost)} />
          <Route path="industries" element={<Navigate to="/examples/#industries" replace />} />
          <Route path="industries/:slug" element={route(IndustryDetail)} />
          <Route path="case-studies" element={route(CaseStudies)} />
          <Route path="case-studies/:slug" element={route(CaseStudyDetail)} />
          <Route path="studio" element={<Navigate to="/services/#studio" replace />} />
          <Route path="studio/:slug" element={route(StudioDetail)} />
          <Route path="about" element={route(About)} />
          <Route path="contact" element={route(Contact)} />
          <Route path="areas" element={route(Areas)} />
          <Route path="areas/:areaSlug/:serviceSlug" element={route(ServiceAreaDetail)} />
          <Route path="areas/:slug" element={route(AreaDetail)} />
          <Route path="thanks" element={route(Thanks)} />
          <Route path="legal" element={route(Legal)} />
          <Route path="privacy" element={route(Legal)} />
          <Route path="terms" element={route(Legal)} />
          <Route path="*" element={route(NotFound)} />
        </Route>
      </Routes>
      </ErrorBoundary>
    </>
  );
}
