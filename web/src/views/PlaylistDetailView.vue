<template>
  <div class="hx-page">
    <div v-if="loading" class="hx-loading" role="status">Chargement de la playlist…</div>
    <div v-else-if="error" class="hx-error"><p>Cette playlist est indisponible.</p><button class="hx-btn" @click="load">Réessayer</button></div>
    <template v-else-if="playlist">
      <div class="hx-detail-head">
        <img class="hx-detail-cover" :src="coverUrl(playlist.cover)" alt="" />
        <div class="hx-detail-info">
          <h1 class="hx-detail-title">{{ playlist.name }}</h1>
          <p class="hx-detail-sub">{{ tracks.length }} morceau{{ tracks.length > 1 ? 'x' : '' }} · {{ playlist.visibility === 'public' ? 'Playlist publique' : 'Playlist privée' }}</p>
          <div class="hx-detail-actions">
            <button class="hx-btn hx-btn-primary" :disabled="!tracks.length" @click="player.playTrackList(tracks)">Tout écouter</button>
            <button v-if="canEdit" class="hx-btn" @click="editing = !editing; newName = playlist.name">Renommer</button>
            <button v-if="canEdit" class="hx-btn" @click="confirmDelete = !confirmDelete">Supprimer la playlist</button>
          </div>
        </div>
      </div>
      <form v-if="editing" class="hx-inline-form" @submit.prevent="rename">
        <label for="rename-playlist">Nouveau nom</label><div><input id="rename-playlist" v-model="newName" maxlength="200" required /><button class="hx-btn hx-btn-primary" :disabled="saving || !newName.trim()">Enregistrer</button><button type="button" class="hx-btn" @click="editing = false">Annuler</button></div>
      </form>
      <div v-if="confirmDelete" class="hx-confirm" role="alert"><p>Supprimer « {{ playlist.name }} » ? Les morceaux resteront dans Sonora.</p><div class="hx-detail-actions"><button class="hx-btn hx-btn-danger" :disabled="saving" @click="removePlaylist">Confirmer la suppression</button><button class="hx-btn" @click="confirmDelete = false">Annuler</button></div></div>
      <TrackList :tracks="tracks" :current-id="player.state.currentId" :is-playing="player.state.isPlaying" :is-fav="isFav" @play="player.playTrackList(tracks, $event)" @add-queue="addQueue" @fav="onFav">
        <template v-if="canEdit" #actions="{ track }"><button class="hx-icon-btn" :disabled="saving" :aria-label="`Retirer ${track.title} de la playlist`" @click="removeTrack(track)"><svg viewBox="0 0 24 24" class="hx-ico"><path d="m6 6 12 12M18 6 6 18" /></svg></button></template>
        <template #empty><p>Cette playlist attend ses premiers morceaux.</p></template>
      </TrackList>
      <section v-if="canEdit" class="hx-playlist-add">
        <h2 class="hx-section-title">Ajouter des morceaux</h2>
        <label class="hx-sr-only" for="playlist-search">Rechercher un morceau à ajouter</label>
        <input id="playlist-search" v-model="query" type="search" placeholder="Rechercher dans le catalogue…" />
        <p v-if="searching" role="status" class="hx-subtle">Recherche en cours…</p>
        <p v-else-if="searchError" class="hx-error">La recherche est indisponible. Modifiez votre recherche pour réessayer.</p>
        <p v-else-if="query.trim() && !results.length" class="hx-subtle">Aucun morceau trouvé.</p>
        <div v-for="track in results" :key="track.id" class="hx-picker-row"><img :src="coverUrl(track.cover)" alt="" /><div><strong>{{ track.title }}</strong><span>{{ track.artist }}</span></div><button class="hx-btn" :disabled="saving || tracks.some((item) => item.id === track.id)" @click="addTrack(track)">{{ tracks.some((item) => item.id === track.id) ? 'Déjà ajouté' : 'Ajouter' }}</button></div>
      </section>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TrackList from "../components/TrackList.vue";
import { library } from "../api/library.js";
import { coverUrl } from "../api/client.js";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { useSession } from "../stores/session.js";
import { toast } from "../stores/toasts.js";
const route = useRoute(), router = useRouter(), player = usePlayer(), favorites = useFavorites(), session = useSession();
const playlist = ref(null), tracks = ref([]), loading = ref(true), error = ref(false), saving = ref(false);
const editing = ref(false), newName = ref(""), confirmDelete = ref(false), query = ref(""), results = ref([]), searching = ref(false), searchError = ref(false);
const canEdit = computed(() => String(playlist.value?.owner_id) === String(session.state.user?.id) || session.state.permissions.some((p) => ["*", "playlists:*"].includes(p)));
const isFav = (track) => favorites.state.ids.has(track.id);
let timer, version = 0, loadVersion = 0;
async function load() {
  const token = ++loadVersion;
  loading.value = true; error.value = false;
  try { const data = await library.playlist(route.params.id); if (token === loadVersion) { playlist.value = data; tracks.value = data.tracks; } }
  catch { if (token === loadVersion) error.value = true; }
  finally { if (token === loadVersion) loading.value = false; }
}
async function mutate(action, message) {
  if (saving.value) return;
  saving.value = true;
  try { await action(); toast(message); } catch { toast("Modification impossible. Réessayez.", { type: "error" }); } finally { saving.value = false; }
}
function rename() { mutate(async () => { await library.renamePlaylist(playlist.value.id, newName.value.trim()); playlist.value.name = newName.value.trim(); editing.value = false; }, "Playlist renommée"); }
function removePlaylist() { mutate(async () => { await library.deletePlaylist(playlist.value.id); router.push("/playlists"); }, "Playlist supprimée"); }
function removeTrack(track) { mutate(async () => { await library.removeTrack(playlist.value.id, track.id); tracks.value = tracks.value.filter((item) => item.id !== track.id); }, "Morceau retiré de la playlist"); }
function addTrack(track) { mutate(async () => { await library.addTracks(playlist.value.id, [track.id]); tracks.value.push(track); }, "Morceau ajouté"); }
function addQueue(track) { player.addToQueue(track); toast("Ajouté à la file"); }
async function onFav(track) { try { const active = await favorites.toggleFavorite(track.id); toast(active ? "Ajouté aux favoris" : "Retiré des favoris"); } catch { toast("Favori indisponible", { type: "error" }); } }
watch(query, () => {
  const token = ++version;
  clearTimeout(timer); results.value = []; searchError.value = false;
  if (!query.value.trim()) { searching.value = false; return; }
  searching.value = true;
  timer = setTimeout(async () => {
    try { const data = await library.search(query.value.trim()); if (token === version) results.value = data.slice(0, 20); }
    catch { if (token === version) searchError.value = true; }
    finally { if (token === version) searching.value = false; }
  }, 250);
});
watch(() => route.params.id, () => { editing.value = false; confirmDelete.value = false; query.value = ""; load(); }, { immediate: true });
favorites.loadFavorites().catch(() => {});
onUnmounted(() => { clearTimeout(timer); version++; loadVersion++; });
</script>
