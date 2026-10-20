import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("./preview/", import.meta.url)),
  publicDir: "../public",
  base: "/invitacion-boda-saul-y-narda/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
});
