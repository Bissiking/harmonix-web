<template>
  <div class="hx-search-wrap">
    <div class="hx-search-bar">
      <svg viewBox="0 0 24 24" class="hx-ico hx-search-ico"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
      <input
        v-model="query"
        type="search"
        placeholder="Rechercher un titre, artiste, album..."
        aria-label="Rechercher"
        autocomplete="off"
        @focus="open = true"
        @input="debouncedSearch"
        @keydown.enter="goSearch"
      />
      <button v-if="query" class="hx-search-clear" @click="clear">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
    <div v-if="open" class="hx-search-results" role="listbox">
      <template v-if="loading">
        <div class="hx-search-empty">Recherche en cours...</div>
      </template>
      <template v-else-if="results.length">
        <button
          v-for="track in results"
          :key="track.id"
          class="hx-search-item"
          role="option"
          @mousedown.prevent="pick(track)"
        >
          <img class="hx-search-cover" :src="cover(track.cover)" alt="" loading="lazy" />
          <span class="hx-search-meta">
            <span class="hx-search-title">{{ track.title }}</span>
            <span class="hx-search-sub">{{ track.artist || 'Inconnu' }} · {{ track.album || '' }}</span>
          </span>
          <span class="hx-search-dur">{{ fmt(track.duration) }}</span>
        </button>
        <button class="hx-search-item hx-search-all" @mousedown.prevent="goSearch">
          Voir tous les résultats
        </button>
      </template>
      <template v-else-if="query && !loading">
        <div class="hx-search-empty">Aucun résultat</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api, coverUrl } from "../api/client.js";
import { playTrack } from "../stores/player.js";
import { formatDuration as fmt } from "../utils/format.js";

const router = useRouter();
const query = ref("");
const results = ref([]);
const loading = ref(false);
const open = ref(false);
let timer = null;

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

function clear() {
  query.value = "";
  results.value = [];
}

async function search() {
  const q = query.value.trim();
  if (!q) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    const data = await api.get("/api/tracks/search", { query: { q }, timeout: 6000 });
    const items = Array.isArray(data) ? data : data?.items || [];
    results.value = items.slice(0, 6);
  } catch {
    results.value = [];
  } finally {
    loading.value = false;
  }
}

function debouncedSearch() {
  clearTimeout(timer);
  timer = setTimeout(search, 250);
}

function pick(track) {
  open.value = false;
  playTrack(track);
}

function goSearch() {
  const q = query.value.trim();
  open.value = false;
  router.push({ name: "search", query: q ? { q } : {} });
}
</script>
