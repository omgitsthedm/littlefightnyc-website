import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_THEME = "#050507";

function getThemeColor(pathname: string): string {
  // Keep the dark brand as the default; allow per-route accents if desired.
  if (pathname.startsWith("/tech-audit")) return "#050507";
  if (pathname.startsWith("/services")) return "#050507";
  if (pathname.startsWith("/journal")) return "#080b14";
  return DEFAULT_THEME;
}

export default function RouteMetaManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const themeColor = getThemeColor(pathname);
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content = themeColor;
  }, [pathname]);

  return null;
}
