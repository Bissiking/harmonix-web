import { reactive } from "vue";
import { api } from "../api/client.js";
import { toast } from "./toasts.js";

const state = reactive({
  user: null,
  roles: [],
  permissions: [],
  isAdmin: false,
  loading: true,
  authenticated: false,
  error: null,
});

export async function fetchSession() {
  state.loading = true;
  state.error = null;
  try {
    const data = await api.get("/auth/me", { timeout: 8000 });
    if (data && (data.id || data.authenticated)) {
      state.user = data;
      state.roles = data.roles || [];
      state.permissions = data.permissions || [];
      state.isAdmin = Boolean(data.is_admin);
      state.authenticated = Boolean(data.id || data.authenticated);
    } else {
      state.authenticated = false;
    }
  } catch (error) {
    if (error.status === 401) {
      state.authenticated = false;
      state.user = null;
      state.permissions = [];
      state.roles = [];
      state.isAdmin = false;
    } else {
      state.error = "Sonora est momentanément indisponible. Réessayez dans un instant.";
    }
  } finally {
    state.loading = false;
  }
}

export function login() {
  window.location.href = `/auth/login?${new URLSearchParams({ return_to: window.location.origin })}`;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
    window.location.href = "/connexion";
  } catch {
    toast("Déconnexion impossible. Réessayez lorsque Sonora sera disponible.", { type: "error" });
  }
}

export function hasPermission(permission) {
  if (!state.authenticated) return false;
  return state.permissions.includes("*") || state.permissions.includes(permission);
}

export function useSession() {
  return { state, fetchSession, login, logout, hasPermission };
}
