import { reactive } from "vue";
import { library } from "../api/library.js";
import { eventBus } from "../core/EventBus.js";

const state = reactive({ ids: new Set(), list: [], loaded: false, loading: false, error: null });
let loadPromise;
const toggles = new Map();

export function loadFavorites() {
  if (loadPromise) return loadPromise;
  state.loading = true;
  state.error = null;
  loadPromise = library.favorites().then((items) => {
    state.list = items;
    state.ids = new Set(items.map((t) => String(t.id)));
    state.loaded = true;
    return items;
  }).catch((error) => {
    state.error = "Impossible de charger vos favoris.";
    throw error;
  }).finally(() => { state.loading = false; loadPromise = null; });
  return loadPromise;
}

export async function isFavorite(id) {
  if (!state.loaded) await loadFavorites();
  return state.ids.has(String(id));
}

export function toggleFavorite(trackId) {
  const id = String(trackId);
  if (toggles.has(id)) return toggles.get(id);
  const was = state.ids.has(id);
  if (was) state.ids.delete(id); else state.ids.add(id);
  const pending = library.toggleFavorite(id).then(async (data) => {
    const final = Boolean(data.favorite);
    if (final) {
      state.ids.add(id);
      if (!state.list.some((track) => track.id === id)) {
        try { state.list.unshift(await library.track(id)); } catch { state.loaded = false; }
      }
    } else {
      state.ids.delete(id);
      state.list = state.list.filter((track) => track.id !== id);
    }
    eventBus.emit("favorites:toggled", { trackId: id, isFav: final });
    return final;
  }).catch((error) => {
    if (was) state.ids.add(id); else state.ids.delete(id);
    throw error;
  }).finally(() => toggles.delete(id));
  toggles.set(id, pending);
  return pending;
}

export function useFavorites() { return { state, isFavorite, loadFavorites, toggleFavorite }; }
