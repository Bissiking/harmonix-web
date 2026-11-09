<template>
  <div class="hx-page">
    <div v-if="loading" class="hx-loading" role="status">Chargement du morceau…</div>
    <div v-else-if="error" class="hx-error" role="alert"><p>Impossible de charger ce morceau.</p><button class="hx-btn" @click="load">Réessayer</button></div>
    <template v-else-if="track">
      <div class="hx-full-player">
        <section class="hx-record">
          <img class="hx-record-cover" :src="coverUrl(track.cover)" :alt="`Pochette de ${track.title}`" @error="fallback" />
          <h1>{{ track.title }}</h1>
          <p class="hx-subtle">{{ track.artist }}<template v-if="track.album"> · {{ track.album }}</template></p>
          <div v-if="isCurrent" class="hx-full-progress">
            <input type="range" aria-label="Position de lecture" min="0" :max="player.state.duration || 0" step="0.1" :value="player.state.position" @input="player.seek(Number($event.target.value))" />
            <div><span>{{ fmt(player.state.position) }}</span><span>{{ fmt(player.state.duration) }}</span></div>
          </div>
          <div class="hx-full-controls">
            <button class="hx-icon-btn" :class="{ active: player.state.shuffle }" :aria-pressed="player.state.shuffle" aria-label="Lecture aléatoire" @click="player.toggleShuffle()"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg></button>
            <button class="hx-icon-btn" aria-label="Morceau précédent" :disabled="!isCurrent" @click="player.prev()"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M5 5v14M19 5 7 12l12 7z" /></svg></button>
            <button class="hx-btn-play hx-btn-play--large" :aria-label="isCurrent && player.state.isPlaying ? 'Mettre en pause' : 'Écouter'" @click="play"><svg viewBox="0 0 24 24" class="hx-ico"><path v-if="isCurrent && player.state.isPlaying" d="M8 5v14M16 5v14" /><path v-else d="m8 5 11 7-11 7z" /></svg></button>
            <button class="hx-icon-btn" aria-label="Morceau suivant" :disabled="!isCurrent" @click="player.next()"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M19 5v14M5 5l12 7-12 7z" /></svg></button>
            <button class="hx-icon-btn" :class="{ active: player.state.repeat !== 'none' }" :aria-label="`Répétition : ${repeatLabel}`" @click="player.toggleRepeat()"><svg viewBox="0 0 24 24" class="hx-ico"><path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" /></svg><span v-if="player.state.repeat === 'one'" class="hx-repeat-one">1</span></button>
          </div>
          <div class="hx-detail-actions">
            <button class="hx-btn" :class="{ active: isFav }" :aria-pressed="isFav" @click="toggleFav">{{ isFav ? 'Dans vos favoris' : 'Ajouter aux favoris' }}</button>
            <button class="hx-btn" @click="addQueue">Ajouter à la file</button>
          </div>
          <div class="hx-full-volume">
            <button class="hx-icon-btn" :aria-label="player.state.muted ? 'Rétablir le son' : 'Couper le son'" @click="player.toggleMute()"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M11 5 6 9H2v6h4l5 4zM15 8a6 6 0 0 1 0 8" /></svg></button>
            <label for="full-volume">Volume</label><input id="full-volume" type="range" min="0" max="1" step="0.01" :value="player.state.volume" @input="player.setVolume(Number($event.target.value))" />
          </div>
          <form class="hx-add-playlist" @submit.prevent="addToPlaylist">
            <label for="track-playlist">Ajouter à une playlist</label>
            <div><select id="track-playlist" v-model="playlistId" :disabled="playlistLoading || playlistError || !playlists.length"><option value="">{{ playlistLoading ? 'Chargement des playlists…' : playlistError ? 'Playlists indisponibles' : playlists.length ? 'Choisir une playlist' : 'Créez une playlist pour commencer' }}</option><option v-for="item in playlists" :key="item.id" :value="item.id">{{ item.name }}</option></select><button class="hx-btn" :disabled="playlistLoading || playlistError || !playlistId || saving">{{ saving ? 'Ajout…' : 'Ajouter' }}</button></div>
            <div v-if="playlistError" role="alert"><p class="hx-subtle">Impossible de charger vos playlists.</p><button type="button" class="hx-btn" @click="loadPlaylists">Réessayer</button></div>
            <RouterLink to="/playlists" class="hx-text-link">Gérer mes playlists</RouterLink>
          </form>
        </section>
        <LyricsPanel :track-id="track.id" />
      </div>
    </template>
    <div v-else class="hx-empty"><p>Choisissez un morceau pour ouvrir le lecteur.</p><RouterLink to="/" class="hx-btn hx-btn-primary">Explorer la bibliothèque</RouterLink></div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import LyricsPanel from "../components/LyricsPanel.vue";
import { library } from "../api/library.js";
import { coverUrl } from "../api/client.js";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { useSession } from "../stores/session.js";
import { toast } from "../stores/toasts.js";
import { formatTime as fmt } from "../utils/format.js";
const route = useRoute(), player = usePlayer(), favorites = useFavorites();
const session = useSession();
const track = ref(null), playlists = ref([]), playlistId = ref(""), saving = ref(false), loading = ref(true), error = ref(false);
const playlistLoading = ref(true), playlistError = ref(false);
const id = computed(() => route.name === "player" ? player.state.currentId : String(route.params.id || ""));
const isCurrent = computed(() => track.value?.id === player.state.currentId);
const isFav = computed(() => track.value && favorites.state.ids.has(track.value.id));
const repeatLabel = computed(() => ({ none: 'désactivée', one: 'un morceau', all: 'toute la liste' }[player.state.repeat]));
let version = 0;
async function load() {
  const token = ++version;
  if (!id.value) { track.value = null; loading.value = false; return; }
  loading.value = true; error.value = false;
  try { const data = await library.track(id.value); if (token === version) track.value = data; }
  catch { if (token === version) error.value = true; }
  finally { if (token === version) loading.value = false; }
}
watch(id, load, { immediate: true });
favorites.loadFavorites().catch(() => {});
async function loadPlaylists() {
  playlistLoading.value = true; playlistError.value = false; playlistId.value = '';
  try {
    const data = await library.playlists();
    playlists.value = data.filter((item) => String(item.owner_id) === String(session.state.user?.id) || session.state.permissions.some((p) => ['*', 'playlists:*'].includes(p)));
  } catch { playlistError.value = true; }
  finally { playlistLoading.value = false; }
}
loadPlaylists();
function fallback(event) { event.target.onerror = null; event.target.src = "/images/default_cover.svg"; }
function play() { if (isCurrent.value) player.togglePlay(); else player.playTrack(track.value); }
function addQueue() { player.addToQueue(track.value); toast("Ajouté à la file"); }
async function toggleFav() { try { const active = await favorites.toggleFavorite(track.value.id); toast(active ? "Ajouté aux favoris" : "Retiré des favoris"); } catch { toast("Favori indisponible", { type: "error" }); } }
async function addToPlaylist() {
  if (!playlistId.value || saving.value) return;
  saving.value = true;
  try { await library.addTracks(playlistId.value, [track.value.id]); toast("Morceau ajouté à la playlist"); }
  catch { toast("Ajout impossible. Vérifiez que cette playlist vous appartient.", { type: "error" }); }
  finally { saving.value = false; }
}
</script>
