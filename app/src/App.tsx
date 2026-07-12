import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RouteScrollManager from "@/components/RouteScrollManager";
import Home from "@/pages/Home";

const EditorialShell = lazy(() => import("@/components/editorial/EditorialShell"));
const AnswerGuide = lazy(() => import("@/pages/AnswerGuide"));
const About = lazy(() => import("@/pages/About"));
const AreaDetail = lazy(() => import("@/pages/AreaDetail"));
const Areas = lazy(() => import("@/pages/Areas"));
const Audit = lazy(() => import("@/pages/Audit"));
const CaseStudyDetail = lazy(() => import("@/pages/CaseStudyDetail"));
const Contact = lazy(() => import("@/pages/Contact"));
const FieldGuide = lazy(() => import("@/pages/FieldGuide"));
const FitCheck = lazy(() => import("@/pages/FitCheck"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const GlossaryTerm = lazy(() => import("@/pages/GlossaryTerm"));
const IndustryDetail = lazy(() => import("@/pages/IndustryDetail"));
const Journal = lazy(() => import("@/pages/Journal"));
const JournalPost = lazy(() => import("@/pages/JournalPost"));
const Legal = lazy(() => import("@/pages/Legal"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ServiceAreaDetail = lazy(() => import("@/pages/ServiceAreaDetail"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Services = lazy(() => import("@/pages/Services"));
const StudioDetail = lazy(() => import("@/pages/StudioDetail"));
const Thanks = lazy(() => import("@/pages/Thanks"));

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
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
      <RouteScrollManager />
      <Routes>
        {/* Home: custom layout with the full Press Strike masthead - the
            magazine cover. Everything else inherits EditorialShell with the
            compact running masthead. */}
        <Route index element={<Home />} />

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
          <Route path="fit-check" element={route(FitCheck)} />
          <Route path="examples" element={route(FieldGuide)} />
          <Route path="audit" element={route(Audit)} />
          <Route path="answers" element={<Navigate to="/examples/#answers" replace />} />
          <Route path="answers/:slug" element={route(AnswerGuide)} />
          <Route path="glossary" element={route(Glossary)} />
          <Route path="glossary/:slug" element={route(GlossaryTerm)} />
          <Route path="journal" element={route(Journal)} />
          <Route path="journal/:slug" element={route(JournalPost)} />
          <Route path="industries" element={<Navigate to="/examples/#industries" replace />} />
          <Route path="industries/:slug" element={route(IndustryDetail)} />
          <Route path="case-studies" element={<Navigate to="/examples/#studies" replace />} />
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
    </>
  );
}
