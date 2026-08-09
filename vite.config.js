import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = `http://localhost:${env.HARMONIX_PORT || "6003"}`;
  const webPort = Number(env.HARMONIX_WEB_PORT || "5173");

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
      proxy: {
        // Le serveur Harmonix gère l'auth et proxy vers Sonora.
        "/auth": apiTarget,
        "/api": {
          target: apiTarget,
          ws: true,
        },
        "/covers": apiTarget,
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
