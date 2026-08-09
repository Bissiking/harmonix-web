import { reactive } from "vue";
import { api } from "../api/client.js";

const state = reactive({
  user: null,
  roles: [],
  permissions: [],
  isAdmin: false,
  loading: true,
  authenticated: false,
});

export async function fetchSession() {
  state.loading = true;
  try {
    const data = await api.get("/auth/me", { timeout: 8000 });
    if (data && (data.id || data.authenticated)) {
      state.user = data;
      state.roles = data.roles || [];
      state.permissions = data.permissions || [];
      state.isAdmin = Boolean(data.is_admin);
      state.authenticated = Boolean(data.id);
    } else {
      state.authenticated = false;
    }
  } catch {
    state.authenticated = false;
  } finally {
    state.loading = false;
  }
}

export function login() {
  window.location.href = "/auth/login";
}

export function logout() {
  window.location.href = "/auth/logout";
}

export function hasPermission(permission) {
  if (!state.authenticated) return true; // mode sans auth
  return state.permissions.includes("*") || state.permissions.includes(permission);
}

export function useSession() {
  return { state, fetchSession, login, logout, hasPermission };
}
