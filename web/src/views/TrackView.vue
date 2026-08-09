<template>
  <div class="hx-page">
    <div v-if="loading" class="hx-loading">Chargement…</div>
    <template v-else-if="track">
      <div class="hx-detail-head">
        <img class="hx-detail-cover" :src="cover(track.cover)" :alt="track.title" />
        <div class="hx-detail-info">
          <div class="hx-detail-kind">Morceau</div>
          <h1 class="hx-detail-title">{{ track.title }}</h1>
          <p class="hx-detail-sub">{{ track.artist || 'Inconnu' }}<template v-if="track.album"> — {{ track.album }}</template></p>
          <div class="hx-detail-actions">
            <button v-if="player.state.currentId !== track.id" class="hx-btn hx-btn-primary" @click="play">
              <svg viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg>
              <span>Écouter</span>
            </button>
            <button v-else class="hx-btn hx-btn-primary" @click="player.togglePlay()">
              <svg v-if="player.state.isPlaying" viewBox="0 0 24 24" class="hx-ico"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
              <svg v-else viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg>
              <span>{{ player.state.isPlaying ? 'Pause' : 'Reprendre' }}</span>
            </button>
            <button class="hx-btn" :class="{ active: isFav }" @click="toggleFav">
              <svg viewBox="0 0 24 24" class="hx-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
              <span>{{ isFav ? 'Dans les favoris' : 'Ajouter aux favoris' }}</span>
            </button>
            <button class="hx-btn" @click="addQueue">Ajouter à la file</button>
          </div>
        </div>
      </div>

      <div v-if="similarTracks.length" class="hx-similar">
        <h2 class="hx-section-title">Similaires</h2>
        <TrackList
          :tracks="similarTracks"
          :current-id="player.state.currentId"
          :is-playing="player.state.isPlaying"
          :is-fav="isFavTrack"
          @play="onSimilarPlay"
          @open-album="openAlbum"
          @add-queue="onAddQueue"
          @fav="onFav"
        />
      </div>
    </template>
    <div v-else class="hx-empty"><p>Morceau introuvable.</p></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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

const track = ref(null);
const similarTracks = ref([]);
const loading = ref(true);

const isFav = computed(() => track.value && favorites.state.ids.has(String(track.value.id)));
function isFavTrack(t) {
  return favorites.state.ids.has(String(t.id));
}

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

async function load() {
  loading.value = true;
  try {
    const id = route.params.id;
    const data = await api.get(`/api/tracks/${encodeURIComponent(id)}`, { timeout: 10000 });
    track.value = data?.track || data;
    await favorites.loadFavorites().catch(() => {});
    loadSimilar(id);
  } catch {
    track.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadSimilar(id) {
  try {
    const data = await api.get(`/api/tracks/${encodeURIComponent(id)}/similar`, { timeout: 8000 });
    similarTracks.value = Array.isArray(data) ? data : data?.items || [];
  } catch {
    similarTracks.value = [];
  }
}

function play() {
  if (track.value) player.playTrack(track.value);
}

function toggleFav() {
  if (!track.value) return;
  favorites
    .toggleFavorite(track.value.id)
    .then((final) => toast(final ? "Ajouté aux favoris" : "Retiré des favoris", { icon: "heart" }))
    .catch(() => toast("Favori indisponible", { type: "error", icon: "alert" }));
}

function addQueue() {
  if (!track.value) return;
  player.addToQueue(track.value);
  toast(`Ajouté à la file : ${track.value.title}`, { icon: "check" });
}

function onSimilarPlay(index) {
  player.playTrackList(similarTracks.value, index);
}

function onAddQueue(t) {
  player.addToQueue(t);
  toast(`Ajouté à la file : ${t.title}`, { icon: "check" });
}

async function onFav(t) {
  try {
    const final = await favorites.toggleFavorite(t.id);
    toast(final ? "Ajouté aux favoris" : "Retiré des favoris", { icon: "heart" });
  } catch {
    toast("Favori indisponible", { type: "error", icon: "alert" });
  }
}

function openAlbum(t) {
  if (t.album_id) router.push({ name: "album-detail", params: { id: t.album_id } });
}

watch(() => route.params.id, load);
onMounted(load);
</script>
