import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { env } from "./env.js";
import { buildAuthorizeUrl, exchangeCode, revokeRefreshToken } from "./kyros.js";
import { readSession, readOAuthState, setOAuthState, setSession, clearSession, clearOAuthState } from "./session.js";
import { proxyToSonora, isProxyPath } from "./proxy.js";
import { attachRiftBridge } from "./ws.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../web/dist");

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: "1mb" }));

  // ── Auth Kyros ─────────────────────────────────────────────
  app.get("/auth/config", (_req, res) => {
    res.json({ provider: "kyros", hasClientId: Boolean(env.kyros.clientId) });
  });

  app.get("/auth/login", (req, res) => {
    try {
      const state = crypto.randomBytes(24).toString("hex");
      setOAuthState(res, state);
      res.redirect(buildAuthorizeUrl(state));
    } catch (error) {
      res.status(500).json({ success: false, error: "KYROS_CONFIG_MISSING", message: error.message });
    }
  });

  app.get("/auth/callback", async (req, res) => {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`/connexion?error=${encodeURIComponent(String(error))}`);
    if (!code || !state) return res.status(400).send("Missing code or state");
    if (state !== readOAuthState(req)) return res.status(403).send("Invalid state");
    try {
      const tokens = await exchangeCode(String(code), String(state));
      const session = { ...tokens };
      clearOAuthState(res);
      setSession(res, session);
      res.redirect("/");
    } catch (err) {
      console.error("[auth] exchange failed:", err);
      res.status(500).send("Token exchange failed");
    }
  });

  app.get("/auth/logout", async (req, res) => {
    const session = readSession(req);
    if (session?.refreshToken) {
      await revokeRefreshToken(session.refreshToken).catch(() => {});
    }
    clearSession(res);
    res.redirect("/");
  });

  app.get("/auth/me", async (req, res) => {
    const session = readSession(req);
    if (!session?.accessToken) return res.status(401).json({ success: false, error: "AUTH_REQUIRED" });
    try {
      // Délègue l'identité/permissions à Sonora.
      const upstream = await fetch(`${env.sonoraUrl}/api/auth/me`, {
        headers: { authorization: `Bearer ${session.accessToken}` },
      });
      if (upstream.status === 401 && session.refreshToken) {
        // le proxy fera le refresh sur /api/*, ici on renvoie juste l'identité locale
        return res.json({ id: null, sub: session.sub || null, authenticated: true, needsRefresh: true });
      }
      const body = await upstream.json();
      return res.json(body);
    } catch {
      return res.status(502).json({ success: false, error: "UPSTREAM_ERROR" });
    }
  });

  // ── Proxy Sonora ───────────────────────────────────────────
  app.use((req, res, next) => {
    if (isProxyPath(req.path)) return proxyToSonora(req, res);
    next();
  });

  // ── SPA statique (production) ──────────────────────────────
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir, { index: "index.html", maxAge: "1h" }));
    app.get(/^\/(?!api\/|auth\/|covers\/).*/, (_req, res) => res.sendFile(path.join(distDir, "index.html")));
  } else {
    app.get("/", (_req, res) => res.send("Harmonix V3 — exécute `npm run dev` ou `npm run build` puis `npm start`."));
  }

  app.use((_req, res) => res.status(404).json({ success: false, error: "NOT_FOUND" }));

  return app;
}

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`[harmonix] V3 listening on ${env.baseUrl} → Sonora ${env.sonoraUrl}`);
});
attachRiftBridge(server);
