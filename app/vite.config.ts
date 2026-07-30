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
      output: {
        manualChunks: {
          // "react-dom" alone never matched: the app imports "react-dom/client"
          // (main.tsx) and "react-dom" (viewTransition.ts), and manualChunks
          // keys are module specifiers, not packages. React DOM was therefore
          // bundled into the app chunk — the least volatile dependency welded
          // to the code that changes on every deploy, so returning visitors
          // re-downloaded it each time. Both specifiers are listed now.
          "react-vendor": [
            "react",
            "react-dom",
            "react-dom/client",
            "react-router-dom",
          ],
          // Co-locate the used lucide icons into one cached chunk instead of ~15
          // separate 0.2–0.4KB micro-chunks (fewer HTTP requests). Tree-shaking
          // still drops unused icons — only imported ones enter the graph.
          "icons": ["lucide-react"],
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
