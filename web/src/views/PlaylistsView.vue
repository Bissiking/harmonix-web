<template>
  <div class="hx-page">
    <div class="hx-page-heading"><div><h1>Vos playlists</h1><p>La bonne musique, dans le bon ordre.</p></div></div>
    <form class="hx-inline-form" @submit.prevent="createNew">
      <label for="playlist-name">Créer une playlist</label>
      <div><input id="playlist-name" v-model="name" maxlength="200" placeholder="Donnez-lui un nom" required /><button class="hx-btn hx-btn-primary" :disabled="saving || !name.trim()">{{ saving ? 'Création…' : 'Créer' }}</button></div>
    </form>
    <div v-if="loading" class="hx-loading" role="status">Chargement des playlists…</div>
    <div v-else-if="error" class="hx-error"><p>Vos playlists sont indisponibles.</p><button class="hx-btn" @click="load">Réessayer</button></div>
    <div v-else-if="!playlists.length" class="hx-empty"><p>Votre première playlist commence par un nom, puis quelques morceaux.</p></div>
    <div v-else class="hx-card-grid">
      <RouterLink v-for="playlist in playlists" :key="playlist.id" :to="{ name: 'playlist-detail', params: { id: playlist.id } }" class="hx-card">
        <img class="hx-card-cover" :src="coverUrl(playlist.cover)" alt="" loading="lazy" />
        <div class="hx-card-info"><strong class="hx-card-title">{{ playlist.name }}</strong><span class="hx-card-sub">{{ playlist.track_count ?? 0 }} morceaux · {{ playlist.visibility === 'public' ? 'Publique' : 'Privée' }}</span></div>
      </RouterLink>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { library } from "../api/library.js";
import { coverUrl } from "../api/client.js";
import { toast } from "../stores/toasts.js";
const router = useRouter(), playlists = ref([]), loading = ref(true), error = ref(false), saving = ref(false), name = ref("");
async function load() {
  loading.value = true; error.value = false;
  try { playlists.value = await library.playlists(); } catch { error.value = true; } finally { loading.value = false; }
}
async function createNew() {
  if (!name.value.trim() || saving.value) return;
  saving.value = true;
  try { const playlist = await library.createPlaylist(name.value.trim()); toast("Playlist créée"); router.push({ name: "playlist-detail", params: { id: playlist.id } }); }
  catch { toast("Création impossible. Réessayez.", { type: "error" }); } finally { saving.value = false; }
}
onMounted(load);
</script>
