// Client HTTP Sonora, sous la même origine via Vite ou la passerelle de production.

const BASE = "";

async function request(path, { method = "GET", body, query, timeout = 15000, raw = false, keepalive = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let url = `${BASE}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: "same-origin",
      keepalive,
    });
    if (res.status === 401) {
      const event = new CustomEvent("harmonix:unauthorized");
      window.dispatchEvent(event);
      throw new ApiError("AUTH_REQUIRED", 401);
    }
    if (raw) return res;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new ApiError(data.error || `HTTP_${res.status}`, res.status);
      err.data = data;
      throw err;
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") throw new ApiError("TIMEOUT", 408);
    throw new ApiError("NETWORK_ERROR", 0, error);
  } finally {
    clearTimeout(timer);
  }
}

export class ApiError extends Error {
  constructor(message, status = 0, cause) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
  request,
};

export function streamUrl(trackId) {
  return `/api/harmonix/apps/v2/stream/${encodeURIComponent(trackId)}`;
}

export function coverUrl(cover) {
  if (!cover) return "/images/default_cover.svg";
  if (/^https?:\/\//i.test(cover)) return cover;
  if (/^\//.test(cover)) return cover.startsWith("/covers/") ? cover : `/covers/${cover.replace(/^\/+/, "")}`;
  return `/covers/${encodeURIComponent(cover)}`;
}
