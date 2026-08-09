<template>
  <div class="hx-page">
    <div v-if="loading" class="hx-loading">Chargement…</div>
    <template v-else-if="playlist">
      <div class="hx-detail-head">
        <div class="hx-detail-cover hx-card-cover--placeholder">
          <svg viewBox="0 0 24 24" class="hx-ico"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
        </div>
        <div class="hx-detail-info">
          <div class="hx-detail-kind">Playlist</div>
          <h1 class="hx-detail-title">{{ playlist.name }}</h1>
          <p class="hx-detail-sub">{{ tracks.length }} morceau{{ tracks.length > 1 ? 'x' : '' }}</p>
          <div class="hx-detail-actions">
            <button class="hx-btn hx-btn-primary" :disabled="!tracks.length" @click="playAll">
              <svg viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg>
              <span>Tout lire</span>
            </button>
            <button class="hx-btn" @click="deletePlaylist">Supprimer</button>
          </div>
        </div>
      </div>

      <TrackList
        :tracks="tracks"
        :current-id="player.state.currentId"
        :is-playing="player.state.isPlaying"
        :is-fav="isFav"
        @play="onPlay"
        @open-album="openAlbum"
        @add-queue="onAddQueue"
        @fav="onFav"
      />
    </template>
    <div v-else class="hx-empty"><p>Playlist introuvable.</p></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TrackList from "../components/TrackList.vue";
import { api } from "../api/client.js";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { toast } from "../stores/toasts.js";

const route = useRoute();
const router = useRouter();
const player = usePlayer();
const favorites = useFavorites();

const playlist = ref(null);
const tracks = ref([]);
const loading = ref(true);

function isFav(track) {
  return favorites.state.ids.has(String(track.id));
}

async function load() {
  loading.value = true;
  try {
    const data = await api.get(`/api/playlists/${encodeURIComponent(route.params.id)}`, { timeout: 10000 });
    playlist.value = data?.playlist || data;
    tracks.value = Array.isArray(data?.tracks) ? data.tracks : data?.items || [];
    await favorites.loadFavorites().catch(() => {});
  } catch {
    playlist.value = null;
  } finally {
    loading.value = false;
  }
}

function playAll() {
  if (!tracks.value.length) return;
  player.playTrackList(tracks.value, 0);
}

function onPlay(index) {
  player.playTrackList(tracks.value, index);
}

function onAddQueue(track) {
  player.addToQueue(track);
  toast(`Ajouté à la file : ${track.title}`, { icon: "check" });
}

async function onFav(track) {
  try {
    const final = await favorites.toggleFavorite(track.id);
    toast(final ? "Ajouté aux favoris" : "Retiré des favoris", { icon: "heart" });
  } catch {
    toast("Favori indisponible", { type: "error", icon: "alert" });
  }
}

function openAlbum(track) {
  const match = tracks.value.find((t) => t.album === track.album && t.album_id);
  if (match?.album_id) router.push({ name: "album-detail", params: { id: match.album_id } });
}

async function deletePlaylist() {
  if (!window.confirm(`Supprimer la playlist « ${playlist.value.name} » ?`)) return;
  try {
    await api.delete(`/api/playlists/${encodeURIComponent(route.params.id)}`);
    toast("Playlist supprimée", { icon: "check" });
    router.push({ name: "playlists" });
  } catch {
    toast("Suppression impossible", { type: "error", icon: "alert" });
  }
}

onMounted(load);
</script>
