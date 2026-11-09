import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.SONORA_URL || "http://localhost:6002";
  const webPort = Number(env.HARMONIX_WEB_PORT || "5173");
  const proxy = {
    "/auth": { target: apiTarget, changeOrigin: true },
    "/api": { target: apiTarget, changeOrigin: true, ws: true },
    "/covers": { target: apiTarget, changeOrigin: true },
  };

  return {
    root: "web",
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./web/src", import.meta.url)),
      },
    },
    server: {
      port: webPort,
      strictPort: true,
      // Relais de développement uniquement : toute la logique est dans Sonora.
      proxy,
    },
    preview: { port: webPort, strictPort: true, proxy },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
