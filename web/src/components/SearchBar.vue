<template>
  <form class="hx-search-wrap" role="search" @submit.prevent="goSearch">
    <div class="hx-search-bar">
      <svg viewBox="0 0 24 24" class="hx-ico"><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></svg>
      <input v-model="query" type="search" placeholder="Titre, artiste ou album…" aria-label="Rechercher dans Sonora" />
      <button type="submit" class="hx-icon-btn" aria-label="Lancer la recherche"><svg viewBox="0 0 24 24" class="hx-ico"><path d="M4 12h16m-6-6 6 6-6 6" /></svg></button>
    </div>
  </form>
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter(), query = ref("");
function goSearch() { router.push({ name: "search", query: query.value.trim() ? { q: query.value.trim() } : {} }); }
</script>
