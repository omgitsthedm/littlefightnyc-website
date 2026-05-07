import { lazy, Suspense, type ComponentType } from "react";
import { Route, Routes } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import Home from "@/pages/Home";

const AnswerGuide = lazy(() => import("@/pages/AnswerGuide"));
const Answers = lazy(() => import("@/pages/Answers"));
const About = lazy(() => import("@/pages/About"));
const AreaDetail = lazy(() => import("@/pages/AreaDetail"));
const CaseStudies = lazy(() => import("@/pages/CaseStudies"));
const Contact = lazy(() => import("@/pages/Contact"));
const FitCheck = lazy(() => import("@/pages/FitCheck"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const GlossaryTerm = lazy(() => import("@/pages/GlossaryTerm"));
const Legal = lazy(() => import("@/pages/Legal"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ServiceAreaDetail = lazy(() => import("@/pages/ServiceAreaDetail"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Services = lazy(() => import("@/pages/Services"));
const Thanks = lazy(() => import("@/pages/Thanks"));

function route(Component: ComponentType) {
  return (
    <Suspense fallback={<div className="route-loading">Loading the right page.</div>}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<Home />} />
        <Route path="services" element={route(Services)} />
        <Route path="services/:slug" element={route(ServiceDetail)} />
        <Route path="fit-check" element={route(FitCheck)} />
        <Route path="answers" element={route(Answers)} />
        <Route path="answers/:slug" element={route(AnswerGuide)} />
        <Route path="glossary" element={route(Glossary)} />
        <Route path="glossary/:slug" element={route(GlossaryTerm)} />
        <Route path="case-studies" element={route(CaseStudies)} />
        <Route path="about" element={route(About)} />
        <Route path="contact" element={route(Contact)} />
        <Route path="areas/:areaSlug/:serviceSlug" element={route(ServiceAreaDetail)} />
        <Route path="areas/:slug" element={route(AreaDetail)} />
        <Route path="thanks" element={route(Thanks)} />
        <Route path="privacy" element={route(Legal)} />
        <Route path="terms" element={route(Legal)} />
        <Route path="*" element={route(NotFound)} />
      </Route>
    </Routes>
  );
}
