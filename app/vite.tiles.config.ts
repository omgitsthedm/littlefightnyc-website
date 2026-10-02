import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Static documents own marketing. These chunks enhance only consent, inquiry
// and website-check journeys; the former application shell is not an entry.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    target: "es2022",
    manifest: true,
    sourcemap: false,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: { "tile-bridge": fileURLToPath(new URL("./src/tile-bridge/bridge.ts", import.meta.url)) },
    },
  },
});
