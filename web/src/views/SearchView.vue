<template>
  <div class="hx-page">
    <div class="hx-section-bar">
      <h2 class="hx-section-title">Recherche</h2>
    </div>

    <div class="hx-search-hero">
      <div class="hx-search-bar hx-search-bar--hero">
        <svg viewBox="0 0 24 24" class="hx-ico hx-search-ico"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input v-model="query" type="search" placeholder="Titre, artiste, album…" autofocus @input="debounced" />
        <button v-if="query" class="hx-search-clear" @click="query = ''; results = []">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="hx-loading">Recherche en cours…</div>
    <div v-else-if="query && !results.length" class="hx-empty">
      <p>Aucun résultat pour « {{ query }} »</p>
    </div>
    <div v-else-if="!query" class="hx-empty">
      <p>Saisis une recherche pour trouver une piste.</p>
    </div>
    <TrackList
      v-else
      :tracks="results"
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

const query = ref(String(route.query.q || ""));
const results = ref([]);
const loading = ref(false);
let timer = null;

function isFav(track) {
  return favorites.state.ids.has(String(track.id));
}

async function runSearch() {
  const q = query.value.trim();
  if (!q) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    const data = await api.get("/api/tracks/search", { query: { q }, timeout: 8000 });
    results.value = Array.isArray(data) ? data : data?.items || [];
    await favorites.loadFavorites().catch(() => {});
  } catch {
    results.value = [];
  } finally {
    loading.value = false;
  }
}

function debounced() {
  clearTimeout(timer);
  timer = setTimeout(runSearch, 300);
}

function onPlay(index) {
  player.playTrackList(results.value, index);
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
  const match = results.value.find((t) => t.album === track.album && t.album_id);
  if (match?.album_id) router.push({ name: "album-detail", params: { id: match.album_id } });
}

onMounted(runSearch);
</script>
