import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Make the emitted stylesheet non-render-blocking on first paint. The SEO
 * fallback (`lf-seo`) already carries its own inline critical styles, so users
 * get immediate context while the full CSS downloads asynchronously.
 */
function asyncCssPlugin() {
  return {
    name: "async-css",
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet"([^>]*?) href="(\/assets\/index-[^"]+\.css)"([^>]*)>/i,
        '<link rel="preload" href="$2" as="style" id="lf-main-css" onload="this.onload=null;this.rel=\'stylesheet\';document.documentElement.classList.add(\'lf-css-ready\')"$1$3>' +
        '<noscript><link rel="stylesheet" href="$2"$1$3></noscript>'
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), asyncCssPlugin()],
  build: {
    target: "es2022",
    sourcemap: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
