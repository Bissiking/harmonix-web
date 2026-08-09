<template>
  <div class="hx-page">
    <div class="hx-section-bar">
      <h2 class="hx-section-title">Favoris</h2>
      <span class="hx-count">{{ tracks.length }}</span>
    </div>

    <div v-if="loading" class="hx-loading">Chargement des favoris…</div>
    <div v-else-if="!tracks.length" class="hx-empty">
      <svg viewBox="0 0 24 24" class="hx-empty-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
      <p>Ajoute des morceaux à tes favoris pour les retrouver ici.</p>
    </div>
    <TrackList
      v-else
      :tracks="tracks"
      :current-id="player.state.currentId"
      :is-playing="player.state.isPlaying"
      :is-fav="isFav"
      @play="onPlay"
      @open-album="openAlbum"
      @add-queue="onAddQueue"
      @fav="onFav"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import TrackList from "../components/TrackList.vue";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { toast } from "../stores/toasts.js";

const router = useRouter();
const player = usePlayer();
const favorites = useFavorites();
const tracks = ref([]);
const loading = ref(true);

function isFav(track) {
  return favorites.state.ids.has(String(track.id));
}

async function load() {
  loading.value = true;
  try {
    tracks.value = await favorites.loadFavorites();
  } finally {
    loading.value = false;
  }
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
    tracks.value = tracks.value.filter((t) => t.id !== track.id);
    toast(final ? "Ajouté aux favoris" : "Retiré des favoris", { icon: "heart" });
  } catch {
    toast("Favori indisponible", { type: "error", icon: "alert" });
  }
}

function openAlbum(track) {
  const match = tracks.value.find((t) => t.album === track.album && t.album_id);
  if (match?.album_id) router.push({ name: "album-detail", params: { id: match.album_id } });
}

onMounted(load);
</script>
