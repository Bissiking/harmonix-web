<template>
  <div class="hx-page">
    <div class="hx-section-bar">
      <h2 class="hx-section-title">Playlists</h2>
      <button class="hx-btn hx-btn-primary" @click="createNew">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M12 5v14M5 12h14" /></svg>
        <span>Nouvelle playlist</span>
      </button>
    </div>

    <div v-if="loading" class="hx-loading">Chargement des playlists…</div>
    <div v-else-if="!playlists.length" class="hx-empty">
      <p>Aucune playlist pour l'instant. Crée-en une !</p>
    </div>
    <div v-else class="hx-card-grid">
      <RouterLink v-for="playlist in playlists" :key="playlist.id" :to="{ name: 'playlist-detail', params: { id: playlist.id } }" class="hx-card hx-card--link">
        <div class="hx-card-cover hx-card-cover--placeholder">
          <svg viewBox="0 0 24 24" class="hx-ico"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
        </div>
        <div class="hx-card-info">
          <div class="hx-card-title">{{ playlist.name }}</div>
          <div class="hx-card-sub">{{ playlist.track_count ?? playlist.tracks?.length ?? 0 }} morceaux</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api/client.js";
import { toast } from "../stores/toasts.js";

const router = useRouter();
const playlists = ref([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const data = await api.get("/api/playlists", { timeout: 10000 });
    playlists.value = Array.isArray(data) ? data : data?.items || [];
  } catch {
    playlists.value = [];
  } finally {
    loading.value = false;
  }
}

async function createNew() {
  const name = window.prompt("Nom de la playlist :", "Ma playlist");
  if (!name?.trim()) return;
  try {
    const data = await api.post("/api/playlists", { name: name.trim() });
    toast("Playlist créée", { icon: "check" });
    router.push({ name: "playlist-detail", params: { id: data?.id ?? data?._id } });
  } catch {
    toast("Création impossible", { type: "error", icon: "alert" });
  }
}

onMounted(load);
</script>
