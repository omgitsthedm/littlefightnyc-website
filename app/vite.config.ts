import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    sourcemap: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      input: {
        marketing: fileURLToPath(new URL("./index.html", import.meta.url)),
        dakota: fileURLToPath(new URL("./dakota.html", import.meta.url)),
      },
      output: {
        manualChunks(id) {
          // "react-dom" alone never matched: the app imports "react-dom/client"
          // (main.tsx) and "react-dom" (viewTransition.ts), and manualChunks
          // keys are module specifiers, not packages. React DOM was therefore
          // bundled into the app chunk — the least volatile dependency welded
          // to the code that changes on every deploy. Path-based assignment
          // keeps React stable without recursively pulling Router into Dakota.
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "react-core";
          }
          // Dakota is a standalone private entry and does not use the public
          // site's router. Keep Router in its own stable chunk so opening
          // /app/ never downloads navigation code it cannot execute.
          if (
            id.includes("/node_modules/react-router/") ||
            id.includes("/node_modules/react-router-dom/")
          ) {
            return "react-router";
          }
          // Keep the small Identity client explicit as well. Otherwise Rollup
          // may co-locate it with the Router chunk and make Dakota preload the
          // entire public navigation stack just to resolve its auth imports.
          if (
            id.includes("/node_modules/@netlify/identity/") ||
            id.includes("/node_modules/gotrue-js/")
          ) {
            return "netlify-identity";
          }
          // Co-locate the used lucide icons into one cached chunk instead of ~15
          // separate 0.2–0.4KB micro-chunks (fewer HTTP requests). Tree-shaking
          // still drops unused icons — only imported ones enter the graph.
          if (id.includes("/node_modules/lucide-react/")) return "icons";
          return undefined;
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
