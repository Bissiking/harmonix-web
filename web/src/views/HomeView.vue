<template>
  <div class="hx-page">
    <div class="hx-page-heading">
      <div><h1>Votre bibliothèque</h1><p>Vos morceaux. Votre rythme.</p></div>
      <button class="hx-btn" :disabled="loading" @click="load">Actualiser</button>
    </div>
    <div v-if="loading" class="hx-loading" role="status">Chargement du catalogue Sonora…</div>
    <div v-else-if="error" class="hx-error" role="alert"><p>Le catalogue est momentanément indisponible.</p><button class="hx-btn" @click="load">Réessayer</button></div>
    <template v-else>
      <section v-if="featured" class="hx-listening">
        <img class="hx-listening-cover" :src="coverUrl(featured.cover)" :alt="`Pochette de ${featured.title}`" @error="fallback" />
        <div class="hx-listening-info">
          <h2>{{ featured.title }}</h2>
          <p>{{ featured.artist }}<span v-if="featured.album"> · {{ featured.album }}</span></p>
          <p class="hx-listening-state">{{ current ? (player.state.isPlaying ? 'En lecture' : 'Prêt à reprendre') : 'À découvrir dans votre bibliothèque' }}</p>
          <div class="hx-detail-actions">
            <button class="hx-btn hx-btn-primary" @click="playFeatured">
              <svg viewBox="0 0 24 24" class="hx-ico"><path v-if="player.state.isPlaying && current" d="M8 5v14M16 5v14" /><path v-else d="m8 5 11 7-11 7z" /></svg>
              {{ current ? (player.state.isPlaying ? 'Mettre en pause' : 'Reprendre') : 'Écouter' }}
            </button>
            <RouterLink class="hx-btn" :to="{ name: 'track', params: { id: featured.id } }">Paroles et détails</RouterLink>
          </div>
        </div>
      </section>
      <section v-if="recents.length" class="hx-recents">
        <h2 class="hx-section-title">Écoutés récemment</h2>
        <div class="hx-recents-strip">
          <button v-for="track in recents" :key="track.id" class="hx-recent" @click="player.playTrack(track, tracks)">
            <img :src="coverUrl(track.cover)" alt="" loading="lazy" @error="fallback" />
            <span><strong>{{ track.title }}</strong><small>{{ track.artist }}</small></span>
          </button>
        </div>
      </section>
      <div class="hx-section-bar">
        <h2 class="hx-section-title">Tous les morceaux <span class="hx-count">{{ tracks.length }}</span></h2>
        <div class="hx-library-tools">
          <label class="hx-select-label">Trier
            <select v-model="sort"><option value="recent">Ajouts récents</option><option value="title">Titre</option><option value="artist">Artiste</option><option value="album">Album</option></select>
          </label>
          <div class="hx-view-toggle" role="group" aria-label="Présentation du catalogue">
            <button class="hx-icon-btn" :class="{ active: viewMode === 'list' }" :aria-pressed="viewMode === 'list'" aria-label="Vue liste" @click="setView('list')"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg></button>
            <button class="hx-icon-btn" :class="{ active: viewMode === 'grid' }" :aria-pressed="viewMode === 'grid'" aria-label="Vue pochettes" @click="setView('grid')"><svg viewBox="0 0 24 24" class="hx-ico"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>
          </div>
        </div>
      </div>
      <TrackList v-if="viewMode === 'list'" :tracks="visibleTracks" :current-id="player.state.currentId" :is-playing="player.state.isPlaying" :is-fav="isFav" @play="onPlay" @fav="onFav" @add-queue="onAddQueue" />
      <div v-else class="hx-grid">
        <article v-for="(track, index) in visibleTracks" :key="track.id" class="hx-card">
          <button class="hx-card-main" :aria-label="`Écouter ${track.title}`" @click="onPlay(index)">
            <img class="hx-card-cover" :src="coverUrl(track.cover)" alt="" loading="lazy" @error="fallback" />
            <span class="hx-card-info"><strong class="hx-card-title">{{ track.title }}</strong><span class="hx-card-sub">{{ track.artist }}</span></span>
          </button>
          <RouterLink class="hx-card-link" :to="{ name: 'track', params: { id: track.id } }">Paroles et détails</RouterLink>
        </article>
      </div>
      <div v-if="sortedTracks.length > visibleTracks.length" class="hx-load-more"><button class="hx-btn" @click="limit += 100">Afficher plus de morceaux</button></div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import TrackList from "../components/TrackList.vue";
import { library } from "../api/library.js";
import { coverUrl } from "../api/client.js";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { useSession } from "../stores/session.js";
import { eventBus } from "../core/EventBus.js";
import { toast } from "../stores/toasts.js";
const player = usePlayer();
const favorites = useFavorites();
const session = useSession();
const tracks = ref([]), recents = ref([]), loading = ref(true), error = ref(false);
const viewMode = ref("list"), sort = ref("recent"), limit = ref(100);
const recentKey = `harmonix:v5:recents:${session.state.user?.id || session.state.user?.sub || 'guest'}`;
const current = computed(() => player.state.current);
const featured = computed(() => current.value || sortedTracks.value[0]);
const sortedTracks = computed(() => [...tracks.value].sort((a, b) => sort.value === "recent"
  ? String(b.added_at || "").localeCompare(String(a.added_at || ""))
  : String(a[sort.value] || "").localeCompare(String(b[sort.value] || ""), "fr", { sensitivity: "base" })));
const visibleTracks = computed(() => sortedTracks.value.slice(0, limit.value));
const isFav = (track) => favorites.state.ids.has(track.id);
function fallback(event) { event.target.onerror = null; event.target.src = "/images/default_cover.svg"; }
function setView(mode) { viewMode.value = mode; try { localStorage.setItem("harmonix:view", mode); } catch {} }
async function load() {
  loading.value = true; error.value = false;
  try {
    tracks.value = await library.tracks();
    try {
      const ids = JSON.parse(localStorage.getItem(recentKey) || "[]");
      recents.value = ids.map((id) => tracks.value.find((track) => track.id === id)).filter(Boolean).slice(0, 6);
      viewMode.value = localStorage.getItem("harmonix:view") === "grid" ? "grid" : "list";
    } catch { recents.value = []; }
    favorites.loadFavorites().catch(() => {});
  } catch { error.value = true; } finally { loading.value = false; }
}
function remember(track) {
  if (!track) return;
  recents.value = [track, ...recents.value.filter((t) => t.id !== track.id)].slice(0, 6);
  try { localStorage.setItem(recentKey, JSON.stringify(recents.value.map((t) => t.id))); } catch {}
}
function onPlay(index) { player.playTrackList(sortedTracks.value, index); }
function playFeatured() { if (current.value) player.togglePlay(); else player.playTrack(featured.value, sortedTracks.value); }
function onAddQueue(track) { player.addToQueue(track); toast(`Ajouté à la file : ${track.title}`); }
async function onFav(track) {
  try { const active = await favorites.toggleFavorite(track.id); toast(active ? "Ajouté aux favoris" : "Retiré des favoris"); }
  catch { toast("Favori indisponible", { type: "error" }); }
}
onMounted(() => { load(); eventBus.on("track:changed", remember); });
onUnmounted(() => eventBus.off("track:changed", remember));
</script>
