import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteMetaManager from "@/components/RouteMetaManager";
import RouteScrollManager from "@/components/RouteScrollManager";
import RouteFocusManager from "@/components/RouteFocusManager";
import GlobalViewTransitions from "@/components/GlobalViewTransitions";
import TugSail from "@/components/editorial/TugSail";
import SiteNotices from "@/components/SiteNotices";
import { importWithRetry } from "@/lib/importWithRetry";
import Home from "@/pages/Home";

// A transient mobile/CDN failure gets one quiet retry before the ErrorBoundary
// considers a guarded full refresh. This protects in-progress scroll/form state
// from being discarded for a one-off route chunk miss.
function lazyRoute<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
) {
  return lazy(() => importWithRetry(importer));
}

const AnswerGuide = lazyRoute(() => import("@/pages/AnswerGuide"));
const About = lazyRoute(() => import("@/pages/About"));
const AreaDetail = lazyRoute(() => import("@/pages/AreaDetail"));
const Areas = lazyRoute(() => import("@/pages/Areas"));
const CaseStudyDetail = lazyRoute(() => import("@/pages/CaseStudyDetail"));
const Clients = lazyRoute(() => import("@/pages/Clients"));
const Contact = lazyRoute(() => import("@/pages/Contact"));
const EditorialShell = lazyRoute(() => import("@/components/editorial/EditorialShell"));
const Espanol = lazyRoute(() => import("@/pages/Espanol"));
const FieldGuide = lazyRoute(() => import("@/pages/FieldGuide"));
const Glossary = lazyRoute(() => import("@/pages/Glossary"));
const GlossaryTerm = lazyRoute(() => import("@/pages/GlossaryTerm"));
const IndustryDetail = lazyRoute(() => import("@/pages/IndustryDetail"));
const JournalPost = lazyRoute(() => import("@/pages/JournalPost"));
const Legal = lazyRoute(() => import("@/pages/Legal"));
const Library = lazyRoute(() => import("@/pages/Library"));
const Nationwide = lazyRoute(() => import("@/pages/Nationwide"));
const NewBusinessLaunch = lazyRoute(() => import("@/pages/NewBusinessLaunch"));
const NotFound = lazyRoute(() => import("@/pages/NotFound"));
const OngoingCare = lazyRoute(() => import("@/pages/OngoingCare"));
const ServiceAreaDetail = lazyRoute(() => import("@/pages/ServiceAreaDetail"));
const ServiceDetail = lazyRoute(() => import("@/pages/ServiceDetail"));
const Services = lazyRoute(() => import("@/pages/Services"));
const StudioDetail = lazyRoute(() => import("@/pages/StudioDetail"));
const TechAudit = lazyRoute(() => import("@/pages/TechAudit"));
const Thanks = lazyRoute(() => import("@/pages/Thanks"));
const TriviaAnswer = lazyRoute(() => import("@/pages/TriviaAnswer"));
const WebsiteCheck = lazyRoute(() => import("@/pages/WebsiteCheck"));
const Zhongwen = lazyRoute(() => import("@/pages/Zhongwen"));

function RouteFallback() {
  return (
    // role="status" is a live region, and a live region announces its CONTENT,
    // not its label — the three dots are aria-hidden, so there was nothing to
    // announce and a screen-reader user heard silence while a route loaded.
    // The aria-label made it look handled. Real text, visually hidden.
    <section className="lf-route-fallback" role="status">
      <span className="lf-route-fallback__mark" aria-hidden="true">
        <span className="lf-route-fallback__dot" />
        <span className="lf-route-fallback__dot" />
        <span className="lf-route-fallback__dot" />
      </span>
      <span className="lf-sr-only">Loading page</span>
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
      <RouteFocusManager />
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
          element={
            <Suspense fallback={<RouteFallback />}>
              <EditorialShell />
            </Suspense>
          }
        >
          <Route path="services" element={route(Services)} />
          <Route path="services/new-business-launch" element={route(NewBusinessLaunch)} />
          <Route path="services/ongoing-care" element={route(OngoingCare)} />
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
          <Route path="website-check" element={route(WebsiteCheck)} />
          {/* Fit Check renamed to Tech Audit (2026-07-12) — SPA-side backup
              for the _redirects 301 so in-app history links never dead-end. */}
          <Route path="fit-check" element={<Navigate to="/tech-audit/" replace />} />
          <Route path="examples" element={route(FieldGuide)} />
          <Route path="audit" element={<Navigate to="/tech-audit/" replace />} />
          <Route path="library" element={route(Library)} />
          <Route path="nationwide" element={route(Nationwide)} />
          <Route path="answers" element={<Navigate to="/library/" replace />} />
          <Route path="answers/:slug" element={route(AnswerGuide)} />
          <Route path="trivia/1979" element={route(TriviaAnswer)} />
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
          <Route path="clients" element={route(Clients)} />
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
