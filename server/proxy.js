import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { env } from "./env.js";
import { readSession, setSession, clearSession } from "./session.js";
import { refreshAccessToken } from "./kyros.js";

const MAX_BUFFER_BODY = 8 * 1024 * 1024; // octets conservés en mémoire pour le retry
const PROXY_PREFIXES = ["/api", "/covers"];

function upstreamUrl(req) {
  return new URL(req.originalUrl, env.sonoraUrl);
}

function isStreamable(req) {
  const method = req.method || "GET";
  const length = Number(req.headers["content-length"]) || 0;
  // GET / audio streaming + gros corps (uploads) : pas de buffer, pas de retry.
  return method === "GET" || length > MAX_BUFFER_BODY;
}

function filterHeaders(req, extra = {}) {
  const blocked = new Set(["host", "connection", "content-length", "cookie", "origin", "referer", "accept-encoding"]);
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (blocked.has(key.toLowerCase()) || value === undefined) continue;
    headers[key] = value;
  }
  // compresser uniquement via la réponse JSON (Sonora ne renvoie pas gzip ici)
  Object.assign(headers, extra);
  return headers;
}

function forwardStream(req, res, headers) {
  const target = upstreamUrl(req);
  const transport = target.protocol === "https:" ? https : http;
  const proxy = transport.request(target, { method: req.method, headers }, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res);
  });
  proxy.on("error", (error) => {
    if (!res.headersSent) {
      res.status(502).json({ success: false, error: "UPSTREAM_ERROR", message: error.message });
    } else {
      res.destroy();
    }
  });
  req.pipe(proxy);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      chunks.push(chunk);
      size += chunk.length;
      if (size > MAX_BUFFER_BODY) {
        reject(new Error("BODY_TOO_LARGE"));
        req.removeAllListeners("data");
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function forwardBuffered(req, res, body, headers) {
  const target = upstreamUrl(req);
  const transport = target.protocol === "https:" ? https : http;
  const proxy = transport.request(target, { method: req.method, headers }, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res);
  });
  proxy.on("error", (error) => {
    if (!res.headersSent) {
      res.status(502).json({ success: false, error: "UPSTREAM_ERROR", message: error.message });
    } else {
      res.destroy();
    }
  });
  proxy.end(body);
}

export function proxyToSonora(req, res) {
  const session = readSession(req);

  if (isStreamable(req)) {
    const headers = filterHeaders(req, session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : {});
    forwardStream(req, res, headers);
    return;
  }

  readBody(req)
    .then(async (body) => {
      const attempt = async (token) => {
        const headers = filterHeaders(req, {
          authorization: token ? `Bearer ${token}` : "",
          "content-length": body.length,
        });
        return new Promise((resolve) => {
          const target = upstreamUrl(req);
          const transport = target.protocol === "https:" ? https : http;
          const proxy = transport.request(target, { method: req.method, headers }, (upstream) => {
            resolve({ status: upstream.statusCode, headers: upstream.headers, stream: upstream });
          });
          proxy.on("error", (error) => resolve({ error }));
          proxy.end(body);
        });
      };

      let result = await attempt(session?.accessToken || null);

      // Token expiré → refresh puis retry une fois.
      if (result.status === 401 && session?.refreshToken) {
        try {
          const refreshed = await refreshAccessToken(session.refreshToken);
          const next = { ...session, ...refreshed };
          setSession(res, next);
          result.stream?.resume?.(); // vider le corps 401
          result = await attempt(refreshed.accessToken);
        } catch {
          clearSession(res);
          return res.status(401).json({ success: false, error: "AUTH_REQUIRED" });
        }
      }

      if (result.error) {
        return res.status(502).json({ success: false, error: "UPSTREAM_ERROR", message: result.error.message });
      }
      if (result.status === 401) {
        clearSession(res);
      }
      res.writeHead(result.status, result.headers);
      result.stream.pipe(res);
    })
    .catch(() => res.status(400).json({ success: false, error: "BAD_REQUEST" }));
}

export function isProxyPath(path) {
  return PROXY_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
