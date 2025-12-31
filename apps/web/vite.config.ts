// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from "path";

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//     server: {
//     host: true,
//     port: 5173,
//     hmr: {
//       protocol: "ws",
//       host: "localhost",
//       port: 5173,
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
    // remove host:true unless you explicitly need LAN access
  },
});
