<template>
  <div class="hx-page">
    <div v-if="loading" class="hx-loading">Chargement…</div>
    <template v-else-if="album">
      <div class="hx-detail-head">
        <img class="hx-detail-cover" :src="cover(album.cover)" :alt="album.title" />
        <div class="hx-detail-info">
          <div class="hx-detail-kind">Album</div>
          <h1 class="hx-detail-title">{{ album.title }}</h1>
          <p class="hx-detail-sub">{{ album.artist || 'Inconnu' }} · {{ tracks.length }} morceau{{ tracks.length > 1 ? 'x' : '' }}</p>
          <div class="hx-detail-actions">
            <button class="hx-btn hx-btn-primary" :disabled="!tracks.length" @click="playAll">
              <svg viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg>
              <span>Tout lire</span>
            </button>
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
    <div v-else class="hx-empty"><p>Album introuvable.</p></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TrackList from "../components/TrackList.vue";
import { api, coverUrl } from "../api/client.js";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { toast } from "../stores/toasts.js";

const route = useRoute();
const router = useRouter();
const player = usePlayer();
const favorites = useFavorites();

const album = ref(null);
const tracks = ref([]);
const loading = ref(true);

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

function isFav(track) {
  return favorites.state.ids.has(String(track.id));
}

async function load() {
  loading.value = true;
  try {
    const data = await api.get(`/api/albums/${encodeURIComponent(route.params.id)}`, { timeout: 10000 });
    album.value = data?.album || data;
    tracks.value = Array.isArray(data?.tracks) ? data.tracks : data?.items || [];
    await favorites.loadFavorites().catch(() => {});
  } catch {
    album.value = null;
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
  if (track.album_id && track.album_id !== route.params.id) {
    router.push({ name: "album-detail", params: { id: track.album_id } });
  }
}

onMounted(load);
</script>
