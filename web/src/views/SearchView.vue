<template>
  <div class="hx-page">
    <div class="hx-page-heading"><div><h1>Recherche</h1><p>Un titre, un artiste, un album. Retrouvez votre prochaine écoute.</p></div></div>
    <div class="hx-search-bar hx-search-bar--hero">
      <svg viewBox="0 0 24 24" class="hx-ico"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>
      <input v-model="query" type="search" placeholder="Que voulez-vous écouter ?" aria-label="Titre, artiste ou album" />
    </div>
    <div v-if="loading" class="hx-loading" role="status">Recherche en cours…</div>
    <div v-else-if="error" class="hx-error" role="alert"><p>La recherche est indisponible.</p><button class="hx-btn" @click="runSearch">Réessayer</button></div>
    <div v-else-if="!query.trim()" class="hx-empty"><p>Saisissez quelques mots pour explorer votre musique.</p></div>
    <div v-else-if="!results.length" class="hx-empty"><p>Aucun résultat pour « {{ query }} ».</p></div>
    <template v-else>
      <h2 class="hx-section-title hx-search-count">{{ results.length }} résultat{{ results.length > 1 ? 's' : '' }}</h2>
      <TrackList :tracks="results" :current-id="player.state.currentId" :is-playing="player.state.isPlaying" :is-fav="isFav" @play="player.playTrackList(results, $event)" @fav="onFav" @add-queue="addQueue" />
    </template>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import TrackList from "../components/TrackList.vue";
import { library } from "../api/library.js";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { toast } from "../stores/toasts.js";
const route = useRoute(), player = usePlayer(), favorites = useFavorites();
const query = ref(String(route.query.q || "")), results = ref([]), loading = ref(false), error = ref(false);
let timer, version = 0;
const isFav = (track) => favorites.state.ids.has(track.id);
async function runSearch() {
  const token = ++version, q = query.value.trim();
  error.value = false;
  if (!q) { results.value = []; loading.value = false; return; }
  loading.value = true;
  try { const data = await library.search(q); if (token === version) results.value = data; }
  catch { if (token === version) error.value = true; }
  finally { if (token === version) loading.value = false; }
}
watch(query, () => { version++; clearTimeout(timer); timer = setTimeout(runSearch, 250); });
watch(() => route.query.q, (q) => { query.value = String(q || ""); });
async function onFav(track) { try { const active = await favorites.toggleFavorite(track.id); toast(active ? "Ajouté aux favoris" : "Retiré des favoris"); } catch { toast("Favori indisponible", { type: "error" }); } }
function addQueue(track) { player.addToQueue(track); toast("Ajouté à la file"); }
onMounted(() => { runSearch(); favorites.loadFavorites().catch(() => {}); });
onUnmounted(() => { version++; clearTimeout(timer); });
</script>
