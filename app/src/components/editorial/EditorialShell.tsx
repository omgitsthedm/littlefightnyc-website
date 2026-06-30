import { Outlet } from "react-router-dom";

import "@/styles/editorial/fonts.css";
import "@/styles/editorial/tokens.css";
import "@/styles/editorial/base.css";
import "@/styles/editorial/legacy-overrides.css";

import RouteMeta from "@/components/RouteMeta";
import QuietNav from "./QuietNav";
import QuietFooter from "./QuietFooter";
import StickyHelpBar from "./StickyHelpBar";

export default function EditorialShell() {
  return (
    <div className="lf-editorial" id="top">
      <RouteMeta />
      <a href="#main-content" className="lf-skip-link">Skip to content</a>
      <QuietNav />
      <main id="main-content" className="lf-page">
        <Outlet />
      </main>
      <StickyHelpBar />
      <QuietFooter />
    </div>
  );
}
