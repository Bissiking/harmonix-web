import { reactive } from "vue";
import { api } from "../api/client.js";

const state = reactive({
  rifts: [],
  loading: false,
  error: null,
  active: null, // { id, name, listeners, ... } du rift connecté
  connected: false,
  socket: null,
  messages: [],
});

function normalize(list) {
  const items = Array.isArray(list) ? list : list?.items || [];
  return items.map((item) => ({
    id: String(item.id ?? item._id ?? ""),
    name: item.name || item.title || "Rift sans nom",
    cover: item.cover || null,
    listeners: item.listeners ?? item.listener_count ?? 0,
    isActive: Boolean(item.is_active ?? item.active),
    owner: item.owner?.username || item.owner?.name || null,
  }));
}

export async function loadRifts() {
  state.loading = true;
  state.error = null;
  try {
    const data = await api.get("/api/rifts", { timeout: 10000 });
    state.rifts = normalize(data);
    return state.rifts;
  } catch (error) {
    state.error = error?.message || "Rifts indisponibles";
    throw error;
  } finally {
    state.loading = false;
  }
}

export async function createRift(name) {
  const data = await api.post("/api/rifts", { name });
  await loadRifts();
  return data;
}

export function connectRift(riftId, { onMessage } = {}) {
  disconnectRift();
  const id = String(riftId);
  const base = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
  const socket = new WebSocket(`${base}/api/rifts/${encodeURIComponent(id)}/ws`);

  socket.addEventListener("open", () => {
    state.connected = true;
  });
  socket.addEventListener("message", (event) => {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      payload = { raw: event.data };
    }
    state.messages.push(payload);
    if (state.messages.length > 80) state.messages.shift();
    onMessage?.(payload);
  });
  socket.addEventListener("close", () => {
    state.connected = false;
    if (state.socket === socket) state.socket = null;
  });
  socket.addEventListener("error", () => {
    state.error = "Connexion au rift impossible";
  });

  state.socket = socket;
  state.active = { id };
  state.messages = [];
}

export function disconnectRift() {
  if (state.socket) {
    try {
      state.socket.close();
    } catch { /* noop */ }
  }
  state.socket = null;
  state.connected = false;
  state.active = null;
}

export function sendRift(payload) {
  if (state.socket?.readyState === WebSocket.OPEN) {
    state.socket.send(JSON.stringify(payload));
    return true;
  }
  return false;
}

export function useRifts() {
  return {
    state,
    loadRifts,
    createRift,
    connectRift,
    disconnectRift,
    sendRift,
  };
}
