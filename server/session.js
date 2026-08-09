import crypto from "node:crypto";
import { env } from "./env.js";

const COOKIE_NAME = "hx_session";
const MAX_STATE_AGE = 10 * 60; // état OAuth (secondes)

function hmac(value) {
  return crypto.createHmac("sha256", env.sessionSecret).update(value).digest("base64url");
}

function encode(payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${hmac(body)}`;
}

function decode(value) {
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (hmac(body) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function cookieValue(payload, maxAge) {
  const parts = [`${COOKIE_NAME}=${encode(payload)}`, "Path=/", "HttpOnly", "SameSite=Lax"];
  if (env.cookieSecure) parts.push("Secure");
  if (Number.isFinite(maxAge) && maxAge > 0) parts.push(`Max-Age=${Math.floor(maxAge)}`);
  return parts.join("; ");
}

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

export function readSession(req) {
  const value = parseCookies(req)[COOKIE_NAME];
  if (!value) return null;
  return decode(value);
}

export function readOAuthState(req) {
  const session = readSession(req);
  return session?.oauthState || null;
}

export function setOAuthState(res, state) {
  res.append("Set-Cookie", cookieValue({ oauthState: state }, MAX_STATE_AGE));
}

export function clearOAuthState(res) {
  res.append("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function setSession(res, session) {
  const maxAge = Math.max(60, Number(session?.expiresIn) || 3600);
  res.append("Set-Cookie", cookieValue(session, maxAge));
}

export function clearSession(res) {
  res.append("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export { COOKIE_NAME };
