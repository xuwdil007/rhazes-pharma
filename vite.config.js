import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";

export default defineConfig(() => {
  const staticSite = process.env.VITE_STATIC_SITE === "true";
  return {
    base: process.env.VITE_BASE_PATH || "/",
    plugins: [
      react(),
      ...(!staticSite
        ? [laravel({ input: ["src/main.jsx"], refresh: true })]
        : []),
    ],
    build: staticSite
      ? { outDir: "dist", emptyOutDir: true }
      : { emptyOutDir: true },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
  };
});
