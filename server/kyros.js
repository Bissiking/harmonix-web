import { env } from "./env.js";

function requireConfig() {
  if (!env.kyros.authorizeUrl || !env.kyros.tokenUrl || !env.kyros.clientId || !env.kyros.clientSecret) {
    throw new Error("KYROS_CONFIG_MISSING");
  }
}

function buildAuthorizeParams(state) {
  const params = new URLSearchParams({
    client_id: env.kyros.clientId,
    redirect_uri: `${env.baseUrl}/auth/callback`,
    response_type: "code",
    scope: env.kyros.scope,
    state,
  });
  if (env.kyros.audience) params.set("audience", env.kyros.audience);
  if (env.kyros.resourceAudience) params.set("resource_aud", env.kyros.resourceAudience);
  return params;
}

export function buildAuthorizeUrl(state) {
  requireConfig();
  return `${env.kyros.authorizeUrl}?${buildAuthorizeParams(state).toString()}`;
}

async function tokenRequest(body) {
  requireConfig();
  const response = await fetch(env.kyros.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error_description || data.error || `KYROS_TOKEN_HTTP_${response.status}`);
    error.code = data.error || "KYROS_TOKEN_ERROR";
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function exchangeCode(code, state) {
  const data = await tokenRequest({
    grant_type: "authorization_code",
    client_id: env.kyros.clientId,
    client_secret: env.kyros.clientSecret,
    code,
    redirect_uri: `${env.baseUrl}/auth/callback`,
    state,
  });
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: Number(data.expires_in) || 3600 };
}

export async function refreshAccessToken(refreshToken) {
  const data = await tokenRequest({
    grant_type: "refresh_token",
    client_id: env.kyros.clientId,
    client_secret: env.kyros.clientSecret,
    refresh_token: refreshToken,
  });
  return { accessToken: data.access_token, refreshToken: data.refresh_token || refreshToken, expiresIn: Number(data.expires_in) || 3600 };
}

export async function revokeRefreshToken(refreshToken) {
  if (!env.kyros.revokeUrl || !refreshToken) return;
  try {
    await fetch(env.kyros.revokeUrl, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        client_id: env.kyros.clientId,
        client_secret: env.kyros.clientSecret,
        token: refreshToken,
        token_type_hint: "refresh_token",
      }),
    });
  } catch {
    // best-effort revoke
  }
}
