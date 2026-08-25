import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Caminho base do deploy. No Cloudflare Pages o site vive na RAIZ do domínio, então
  // "/" é o valor certo e VITE_BASE não é definido por ninguém. A variável fica porque
  // custa nada e cobre um host futuro que sirva o app em subcaminho.
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
