import { api } from "./client.js";

// Contrat Sonora partagé avec harmonix-apps ; V5 est la version du client.
export const LIBRARY_API = "/api/harmonix/apps/v2";
export const unwrap = (data) => data?.ok === true && "data" in data ? data.data : data;

export function normalizeTrack(track) {
  if (!track) return null;
  return {
    ...track,
    id: String(track.id ?? track.track_id),
    title: track.title || "Sans titre",
    artist: track.artist || "Artiste inconnu",
    cover: track.cover_file || track.coverFile || track.cover_url || track.coverUrl || track.cover || null,
    duration: Number(track.duration_ms ?? track.durationMs) / 1000 || Number(track.duration) || 0,
  };
}

function normalizeCollection(item) {
  return {
    ...item,
    id: String(item.id),
    cover: item.cover_file || item.cover_url || item.cover || null,
    tracks: Array.isArray(item.tracks) ? item.tracks.map(normalizeTrack) : [],
  };
}

async function get(path, opts) { return unwrap(await api.get(`${LIBRARY_API}${path}`, opts)); }
const segment = (id) => encodeURIComponent(id);

export const library = {
  tracks: async () => (await get("/catalog/tracks")).map(normalizeTrack),
  search: async (q) => (await get("/catalog/search", { query: { q } })).map(normalizeTrack),
  track: async (id) => normalizeTrack(await get(`/catalog/tracks/${segment(id)}`)),
  lyrics: (id) => get(`/catalog/tracks/${segment(id)}/lyrics`),
  albums: async () => (await get("/catalog/albums")).map(normalizeCollection),
  album: async (id) => normalizeCollection(await get(`/catalog/albums/${segment(id)}`)),
  playlists: async () => (await get("/playlists")).map(normalizeCollection),
  playlist: async (id) => normalizeCollection(await get(`/playlists/${segment(id)}`)),
  createPlaylist: async (name) => unwrap(await api.post(`${LIBRARY_API}/playlists`, { name })),
  renamePlaylist: (id, name) => api.patch(`${LIBRARY_API}/playlists/${segment(id)}`, { name }),
  deletePlaylist: (id) => api.delete(`${LIBRARY_API}/playlists/${segment(id)}`),
  addTracks: (id, ids) => api.post(`${LIBRARY_API}/playlists/${segment(id)}/tracks`, { track_ids: ids }),
  removeTrack: (id, trackId) => api.delete(`${LIBRARY_API}/playlists/${segment(id)}/tracks/${segment(trackId)}`),
  favorites: async () => (await get("/library/favorites")).map(normalizeTrack),
  toggleFavorite: async (trackId) => unwrap(await api.post(`${LIBRARY_API}/library/favorites/toggle`, { trackId })),
  savePlayback: (body, opts) => api.put(`${LIBRARY_API}/playback/state`, body, opts),
  resume: () => get("/playback/resume-active", { timeout: 8000 }),
};
