<template>
  <div class="hx-page">
    <div class="hx-section-bar">
      <h2 class="hx-section-title">Albums</h2>
      <span class="hx-count">{{ albums.length }}</span>
    </div>

    <div v-if="loading" class="hx-loading">Chargement des albums…</div>
    <div v-else-if="error" class="hx-error" role="alert"><p>Les albums sont momentanément indisponibles.</p><button class="hx-btn" @click="load">Réessayer</button></div>
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
import { coverUrl } from "../api/client.js";
import { library } from "../api/library.js";

const albums = ref([]);
const loading = ref(true);
const error = ref(false);

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

async function load() {
  loading.value = true;
  error.value = false;
  try {
    const data = await library.albums();
    albums.value = Array.isArray(data) ? data : data?.items || [];
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
