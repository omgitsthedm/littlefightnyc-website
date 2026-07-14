import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Brand-forward browser chrome: the LiFi orange "overtakes" the title bar /
// address bar wherever theme-color is honored (iOS + macOS Safari 15+, Chrome/
// Android, installed PWA). A near-black theme-color was invisible against the
// default dark toolbar; orange makes the chrome read as the brand.
const THEME_COLOR = "#F97316";

export default function RouteMetaManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof document === "undefined") return;

    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content = THEME_COLOR;
  }, [pathname]);

  return null;
}
