import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Set `base` to your repo name for GitHub Pages, e.g. "/Your-Notes/"
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
});
