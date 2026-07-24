import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteMetaManager from "@/components/RouteMetaManager";
import RouteScrollManager from "@/components/RouteScrollManager";
import GlobalViewTransitions from "@/components/GlobalViewTransitions";
import TugSail from "@/components/editorial/TugSail";
import EditorialShell from "@/components/editorial/EditorialShell";
import SiteNotices from "@/components/SiteNotices";
import Home from "@/pages/Home";
import About from "@/pages/About";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import Contact from "@/pages/Contact";
import FieldGuide from "@/pages/FieldGuide";
import ServiceDetail from "@/pages/ServiceDetail";
import Services from "@/pages/Services";

const AnswerGuide = lazy(() => import("@/pages/AnswerGuide"));
const AreaDetail = lazy(() => import("@/pages/AreaDetail"));
const Areas = lazy(() => import("@/pages/Areas"));
const Espanol = lazy(() => import("@/pages/Espanol"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const GlossaryTerm = lazy(() => import("@/pages/GlossaryTerm"));
const IndustryDetail = lazy(() => import("@/pages/IndustryDetail"));
const JournalPost = lazy(() => import("@/pages/JournalPost"));
const Legal = lazy(() => import("@/pages/Legal"));
const Library = lazy(() => import("@/pages/Library"));
const Nationwide = lazy(() => import("@/pages/Nationwide"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ServiceAreaDetail = lazy(() => import("@/pages/ServiceAreaDetail"));
const StudioDetail = lazy(() => import("@/pages/StudioDetail"));
const TechAudit = lazy(() => import("@/pages/TechAudit"));
const Thanks = lazy(() => import("@/pages/Thanks"));
const Zhongwen = lazy(() => import("@/pages/Zhongwen"));

function RouteFallback() {
  return (
    <section className="lf-route-fallback" role="status" aria-label="Loading page">
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </section>
  );
}

function route(Component: ComponentType) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  const { search } = useLocation();

  return (
    <>
      <RouteMetaManager />
      <RouteScrollManager />
      <GlobalViewTransitions />
      <TugSail />
      <SiteNotices />
      <ErrorBoundary>
      <Routes>
        {/* Home: custom layout with the full Press Strike masthead - the
            magazine cover. Everything else inherits EditorialShell with the
            compact running masthead. */}
        <Route index element={<Home />} />

        {/* The complete pitch in Spanish — standalone, fully-Spanish chrome
            (an English nav/footer around Spanish content would be half a page). */}
        <Route path="es" element={route(Espanol)} />
        <Route path="zh" element={route(Zhongwen)} />

        <Route
          element={<EditorialShell />}
        >
          <Route path="services" element={route(Services)} />
          <Route path="services/:slug" element={route(ServiceDetail)} />
          <Route path="work" element={<Navigate to="/services/" replace />} />
          <Route path="websites" element={<Navigate to="/services/custom-local-websites/" replace />} />
          <Route path="systems" element={<Navigate to="/services/business-systems/" replace />} />
          <Route path="consulting" element={<Navigate to="/services/tech-consulting/" replace />} />
          <Route path="it-support" element={<Navigate to="/services/it-support/" replace />} />
          <Route path="lifetime-cost" element={<Navigate to="/answers/reduce-monthly-software-costs-small-business/" replace />} />
          {/* Query state selects the general or website-specific intake. A key
              prevents an in-place query change from leaving the other mode's
              current step mounted. Draft data remains available per mode. */}
          <Route
            path="tech-audit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <TechAudit key={search} />
              </Suspense>
            }
          />
          {/* Fit Check renamed to Tech Audit (2026-07-12) — SPA-side backup
              for the _redirects 301 so in-app history links never dead-end. */}
          <Route path="fit-check" element={<Navigate to="/tech-audit/" replace />} />
          <Route path="examples" element={route(FieldGuide)} />
          <Route path="audit" element={<Navigate to="/tech-audit/" replace />} />
          <Route path="library" element={route(Library)} />
          <Route path="nationwide" element={route(Nationwide)} />
          <Route path="answers" element={<Navigate to="/library/" replace />} />
          <Route path="answers/:slug" element={route(AnswerGuide)} />
          <Route path="glossary" element={route(Glossary)} />
          <Route path="glossary/:slug" element={route(GlossaryTerm)} />
          <Route path="journal" element={<Navigate to="/library/" replace />} />
          <Route path="journal/:slug" element={route(JournalPost)} />
          <Route path="industries" element={<Navigate to="/examples/#industries" replace />} />
          <Route path="industries/:slug" element={route(IndustryDetail)} />
          <Route path="case-studies" element={<Navigate to="/examples/" replace />} />
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
