import { defineConfig } from "astro/config";

export default defineConfig({
  server: {
    proxy: {
      "/ws": {
        target: "http://localhost:3000/ws",
        ws: true,
      },
    },
  },
});