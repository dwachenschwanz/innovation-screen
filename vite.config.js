// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "/innovation-screen/", // <-- replace with your repo name
  server: {
    proxy: {
      // your login endpoint lives under /wizard-api
      "/wizard-api": {
        target: "https://backend-trials.smartorg.com",
        changeOrigin: true,
        secure: true, // set false only if the backend uses a self-signed cert
      },
      // you also call /kirk/... in other endpoints
      "/kirk": {
        target: "https://backend-trials.smartorg.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
