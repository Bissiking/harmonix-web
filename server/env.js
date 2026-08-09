import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function str(name, fallback = "") {
  const value = process.env[name];
  return value === undefined || value === null || value === "" ? fallback : value;
}

function bool(name, fallback = false) {
  const value = str(name);
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function num(name, fallback) {
  const value = Number(str(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  port: num("HARMONIX_PORT", 6003),
  baseUrl: str("HARMONIX_BASE_URL", "http://localhost:5173").replace(/\/+$/, ""),
  sonoraUrl: str("SONORA_URL", "http://localhost:6002").replace(/\/+$/, ""),
  sessionSecret: str("HARMONIX_SESSION_SECRET", "harmonix-dev-secret-change-me"),
  cookieSecure: bool("HARMONIX_COOKIE_SECURE", false),
  kyros: {
    authorizeUrl: str("HARMONIX_KYROS_AUTHORIZE_URL"),
    tokenUrl: str("HARMONIX_KYROS_TOKEN_URL"),
    revokeUrl: str("HARMONIX_KYROS_REVOKE_URL"),
    clientId: str("HARMONIX_KYROS_CLIENT_ID"),
    clientSecret: str("HARMONIX_KYROS_CLIENT_SECRET"),
    scope: str("HARMONIX_KYROS_SCOPE", "profile email"),
    audience: str("HARMONIX_KYROS_AUDIENCE"),
    resourceAudience: str("HARMONIX_KYROS_RESOURCE_AUDIENCE"),
  },
};
