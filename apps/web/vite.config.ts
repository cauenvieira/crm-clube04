import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/main.tsx"),
      formats: ["es"],
      fileName: () => "app.js"
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
