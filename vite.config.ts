import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

// Read version from package.json
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Change to your repo name for GitHub Pages: '/anders.garberg.wtf/'
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
