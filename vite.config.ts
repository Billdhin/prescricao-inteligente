import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Caminho base do deploy. No GitHub Pages (projeto) é "/<repo>/"; o workflow
  // define VITE_BASE. Em dev/local fica "/" (não afeta `npm run dev`).
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
