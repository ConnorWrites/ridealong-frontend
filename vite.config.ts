import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/auth": "http://localhost:3000",
      "/rides": "http://localhost:3000",
      "/health": "http://localhost:3000",
    },
  },
});