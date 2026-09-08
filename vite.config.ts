import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: "ssd-initial-loader",
    transformIndexHtml(html) {
      // Keep the pre-React label sourced from the same catalog as Loader.
      const labels = Object.fromEntries(["en", "hi"].map((locale) => {
        const catalog = JSON.parse(readFileSync(new URL(`./src/i18n/locales/${locale}/common.json`, import.meta.url), "utf8"));
        return [`${locale}-IN`, catalog.loading.page];
      }));
      return html
        .replace("__SSD_INITIAL_LOADING_TEXT__", labels["en-IN"].replace(/&/g, "&amp;").replace(/</g, "&lt;"))
        .replace("__SSD_INITIAL_LOADING_LABELS__", JSON.stringify(labels).replace(/</g, "\\u003c"));
    },
  }],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) return "react-vendor";
          if (id.includes("react-router")) return "router-vendor";
          if (id.includes("echarts")) return "charts-vendor";
          if (id.includes("lucide-react")) return "icons-vendor";
          return "vendor";
        },
      },
    },
  },
});
