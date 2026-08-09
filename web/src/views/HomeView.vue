<template>
  <div class="hx-page">
    <section class="hx-now-playing" :class="{ idle: !current }">
      <div class="hx-now-playing-meta">
        <span class="hx-placard">{{ nowPlayingLabel }}</span>
        <span class="hx-lamp" :class="{ on: isLive }"></span>
      </div>
      <div class="hx-now-playing-body">
        <div class="hx-now-playing-cover-wrap">
          <img v-if="current" class="hx-now-playing-cover" :src="cover(current.cover)" :alt="current.title" loading="lazy" />
          <div v-else class="hx-now-playing-cover hx-now-playing-cover--idle" aria-hidden="true"></div>
          <div class="hx-meter" :class="{ live: isLive }">
            <span v-for="n in 8" :key="n" class="hx-meter-bar"></span>
          </div>
        </div>
        <div class="hx-now-playing-info">
          <template v-if="current">
            <div class="hx-now-playing-title">{{ current.title }}</div>
            <div class="hx-now-playing-sub">{{ current.artist }}<template v-if="current.album"> · {{ current.album }}</template></div>
            <div class="hx-now-playing-actions">
              <button class="hx-btn hx-btn-primary" @click="player.togglePlay()">
                <svg v-if="isLive" viewBox="0 0 24 24" class="hx-ico"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                <svg v-else viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg>
                <span>{{ isLive ? 'Pause' : 'Reprendre' }}</span>
              </button>
              <button class="hx-btn" @click="player.next()">Suivant</button>
            </div>
          </template>
          <template v-else>
            <div class="hx-now-playing-title hx-now-playing-title--idle">Aucun morceau en lecture</div>
            <div class="hx-now-playing-sub">Choisissez un morceau dans votre bibliothèque pour commencer.</div>
          </template>
        </div>
      </div>
    </section>

    <section v-if="recents.length" class="hx-recents">
      <h2 class="hx-section-title">Écoutés récemment</h2>
      <div class="hx-recents-strip">
        <button
          v-for="track in recents"
          :key="track.id"
          class="hx-card"
          @click="playTrack(track)"
        >
          <img class="hx-card-cover" :src="cover(track.cover)" :alt="track.title" loading="lazy" />
          <div class="hx-card-overlay"><span class="hx-card-play"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg></span></div>
          <div class="hx-card-info">
            <div class="hx-card-title">{{ track.title }}</div>
            <div class="hx-card-sub">{{ track.artist }}</div>
          </div>
        </button>
      </div>
    </section>

    <div class="hx-section-bar">
      <div class="hx-section-bar-left">
        <h2 class="hx-section-title">Toute la bibliothèque</h2>
        <span class="hx-count">{{ tracks.length }}</span>
      </div>
      <div class="hx-view-toggle" role="group" aria-label="Vue">
        <button class="hx-view-toggle-btn" :class="{ active: viewMode === 'list' }" @click="setView('list')" title="Vue liste">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </button>
        <button class="hx-view-toggle-btn" :class="{ active: viewMode === 'grid' }" @click="setView('grid')" title="Vue grille">
          <svg viewBox="0 0 24 24" class="hx-ico"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="hx-loading">Chargement de la bibliothèque…</div>
    <div v-else-if="error" class="hx-error">
      <p>Impossible de charger les musiques.</p>
      <p class="hx-error-sub">Sonora est peut-être en maintenance.</p>
    </div>
    <template v-else>
      <TrackList
        v-if="viewMode === 'list'"
        :tracks="tracks"
        :current-id="player.state.currentId"
        :is-playing="player.state.isPlaying"
        :is-fav="isFav"
        @play="onPlay"
        @open-album="openAlbum"
        @add-queue="onAddQueue"
        @fav="onFav"
      />
      <div v-else class="hx-grid">
        <article v-for="(track, i) in tracks" :key="track.id" class="hx-card">
          <button class="hx-card-main" :aria-label="`Lire ${track.title}`" @click="onPlay(i)">
            <img class="hx-card-cover" :src="cover(track.cover)" :alt="track.title" loading="lazy" />
            <div class="hx-card-overlay">
              <span class="hx-card-play" aria-hidden="true"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg></span>
            </div>
            <div class="hx-card-info">
              <div class="hx-card-title">{{ track.title }}</div>
              <div class="hx-card-sub">{{ track.artist }}</div>
            </div>
          </button>
          <button
            class="hx-card-fav"
            :class="{ active: isFav(track) }"
            :aria-label="isFav(track) ? `Retirer ${track.title} des favoris` : `Ajouter ${track.title} aux favoris`"
            :aria-pressed="isFav(track)"
            @click="onFav(track)"
          >
            <svg viewBox="0 0 24 24" class="hx-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
          </button>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import TrackList from "../components/TrackList.vue";
import { api, coverUrl } from "../api/client.js";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { toast } from "../stores/toasts.js";

const router = useRouter();
const player = usePlayer();
const favorites = useFavorites();

const tracks = ref([]);
const recents = ref([]);
const loading = ref(true);
const error = ref(false);
const viewMode = ref(localStorage.getItem("harmonix:view") || "list");

const current = computed(() => player.state.current);
const isLive = computed(() => player.state.isPlaying);
const nowPlayingLabel = computed(() => {
  if (!current.value) return "Prêt à écouter";
  return isLive.value ? "En lecture" : "En pause";
});
function setView(mode) {
  viewMode.value = mode;
  localStorage.setItem("harmonix:view", mode);
}

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

function isFav(track) {
  return favorites.state.ids.has(String(track.id));
}

function readRecents() {
  try {
    recents.value = JSON.parse(localStorage.getItem("harmonix:recents") || "[]");
  } catch {
    recents.value = [];
  }
}

async function load() {
  loading.value = true;
  error.value = false;
  try {
    const data = await api.get("/api/tracks", { timeout: 15000 });
    const list = Array.isArray(data) ? data : data?.items || [];
    tracks.value = list;
    await favorites.loadFavorites().catch(() => {});
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function onPlay(index) {
  player.playTrackList(tracks.value, index);
  const track = tracks.value[index];
  if (track) pushRecent(track);
}

function pushRecent(track) {
  const list = [track, ...recents.value.filter((t) => t.id !== track.id)].slice(0, 12);
  recents.value = list;
  localStorage.setItem("harmonix:recents", JSON.stringify(list));
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
  if (!track.album) return;
  const match = tracks.value.find((t) => t.album === track.album && t.album_id);
  if (match?.album_id) {
    router.push({ name: "album-detail", params: { id: match.album_id } });
  }
}

onMounted(() => {
  readRecents();
  load();
  window.addEventListener("harmonix:recents-updated", readRecents);
});
</script>
