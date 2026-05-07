import { Route, Routes } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import Answers from "@/pages/Answers";
import CaseStudies from "@/pages/CaseStudies";
import Contact from "@/pages/Contact";
import FitCheck from "@/pages/FitCheck";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Services from "@/pages/Services";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="fit-check" element={<FitCheck />} />
        <Route path="answers" element={<Answers />} />
        <Route path="case-studies" element={<CaseStudies />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
