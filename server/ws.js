import { WebSocketServer, WebSocket } from "ws";
import { URL } from "node:url";
import { env } from "./env.js";
import { readSession } from "./session.js";
import { refreshAccessToken } from "./kyros.js";

let bridge = null;

async function resolveToken(req) {
  const session = readSession(req);
  if (!session?.accessToken) return null;
  if (session.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(session.refreshToken);
      return refreshed.accessToken;
    } catch {
      return session.accessToken;
    }
  }
  return session.accessToken;
}

function toWsUrl(sonoraBase, riftId, token) {
  const url = new URL(`/api/rifts/${encodeURIComponent(riftId)}/ws`, sonoraBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

// Pont WebSocket : le navigateur se connecte à Harmonix (même origine),
// Harmonix authentifie via le cookie de session puis relaye vers Sonora.
export function attachRiftBridge(server) {
  const wss = new WebSocketServer({ noServer: true });
  bridge = wss;

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, "http://localhost");
    const match = url.pathname.match(/^\/api\/rifts\/([^/]+)\/ws$/);
    if (!match) {
      socket.destroy();
      return;
    }
    const riftId = decodeURIComponent(match[1]);
    wss.handleUpgrade(req, socket, head, (clientWs) => {
      (async () => {
        const token = await resolveToken(req);
        if (!token) {
          clientWs.close(4001, "AUTH_REQUIRED");
          return;
        }
        const upstream = new WebSocket(toWsUrl(env.sonoraUrl, riftId, token));
        const pending = [];
        let open = false;

        upstream.on("open", () => {
          open = true;
          while (pending.length) upstream.send(pending.shift());
        });
        upstream.on("message", (data) => {
          if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data);
        });
        upstream.on("close", (code, reason) => {
          if (clientWs.readyState === WebSocket.OPEN) clientWs.close(code, reason.toString());
        });
        upstream.on("error", () => {
          if (clientWs.readyState === WebSocket.OPEN) clientWs.close(1011, "UPSTREAM_ERROR");
        });

        clientWs.on("message", (data) => {
          if (open) upstream.send(data);
          else pending.push(data);
        });
        clientWs.on("close", () => {
          try { upstream.close(); } catch { /* noop */ }
        });
        clientWs.on("error", () => {
          try { upstream.close(); } catch { /* noop */ }
        });
      })().catch(() => {
        try { clientWs.close(1011, "INTERNAL_ERROR"); } catch { /* noop */ }
      });
    });
  });

  return wss;
}

export function getRiftBridge() {
  return bridge;
}
