<template>
  <div class="hx-page">
    <div class="hx-section-bar">
      <h2 class="hx-section-title">Albums</h2>
      <span class="hx-count">{{ albums.length }}</span>
    </div>

    <div v-if="loading" class="hx-loading">Chargement des albums…</div>
    <div v-else-if="!albums.length" class="hx-empty"><p>Aucun album disponible.</p></div>
    <div v-else class="hx-card-grid">
      <RouterLink v-for="album in albums" :key="album.id" :to="{ name: 'album-detail', params: { id: album.id } }" class="hx-card hx-card--link">
        <img class="hx-card-cover" :src="cover(album.cover)" :alt="album.title" loading="lazy" />
        <div class="hx-card-info">
          <div class="hx-card-title">{{ album.title }}</div>
          <div class="hx-card-sub">{{ album.artist || 'Inconnu' }}</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api, coverUrl } from "../api/client.js";

const albums = ref([]);
const loading = ref(true);

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

async function load() {
  loading.value = true;
  try {
    const data = await api.get("/api/albums", { timeout: 10000 });
    albums.value = Array.isArray(data) ? data : data?.items || [];
  } catch {
    albums.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
