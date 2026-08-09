import { reactive } from "vue";
import { api } from "../api/client.js";
import { eventBus } from "../core/EventBus.js";

const state = reactive({
  ids: new Set(),
  list: [],
  loaded: false,
  loading: false,
});

async function ensureLoaded() {
  if (state.loaded || state.loading) return;
  state.loading = true;
  try {
    const data = await api.get("/api/favorites", { timeout: 8000 });
    const items = data?.items || [];
    state.list = items;
    state.ids = new Set(items.map((t) => String(t.id)));
    state.loaded = true;
  } catch {
    // silencieux
  } finally {
    state.loading = false;
  }
}

export async function isFavorite(trackId) {
  await ensureLoaded();
  return state.ids.has(String(trackId));
}

export async function loadFavorites() {
  state.loaded = false;
  state.list = [];
  await ensureLoaded();
  return state.list;
}

export async function toggleFavorite(trackId) {
  const id = String(trackId);
  const was = state.ids.has(id);
  // optimiste
  if (was) state.ids.delete(id);
  else state.ids.add(id);
  eventBus.emit("favorites:toggled", { trackId: id, isFav: !was });
  try {
    const data = await api.post(`/api/favorites/${encodeURIComponent(id)}/toggle`);
    const final = Boolean(data?.favorite);
    if (final) state.ids.add(id);
    else state.ids.delete(id);
    eventBus.emit("favorites:toggled", { trackId: id, isFav: final });
    if (state.loaded) {
      const idx = state.list.findIndex((t) => String(t.id) === id);
      if (idx >= 0) state.list.splice(idx, 1);
    }
    return final;
  } catch {
    // rollback
    if (was) state.ids.add(id);
    else state.ids.delete(id);
    eventBus.emit("favorites:toggled", { trackId: id, isFav: was });
    throw new Error("Favori indisponible");
  }
}

export function useFavorites() {
  return { state, isFavorite, loadFavorites, toggleFavorite };
}
