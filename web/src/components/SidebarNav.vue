<template>
  <aside id="main-navigation" class="hx-sidebar" :class="{ open }" :inert="compact && !open" aria-label="Navigation principale">
    <div class="hx-sidebar-brand">
      <RouterLink to="/" @click="$emit('close')"><img src="/branding/Icon-192.png" alt="" /><span><strong>Harmonix</strong><small>Web V5</small></span></RouterLink>
      <button class="hx-icon-btn hx-sidebar-close" aria-label="Fermer le menu" @click="$emit('close')"><HxIcon name="close" /></button>
    </div>
    <nav class="hx-nav">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="hx-nav-item" :exact-active-class="'is-active'" @click="$emit('close')"><HxIcon :name="link.icon" /><span>{{ link.label }}</span></RouterLink>
    </nav>
    <div class="hx-sidebar-footer"><span>Harmonix 5.0.0</span><small>Votre musique, avec Sonora.</small></div>
  </aside>
</template>
<script setup>
import { RouterLink } from "vue-router";
import HxIcon from "./HxIcon.vue";
import { ref, onMounted, onUnmounted } from "vue";
defineProps({ open: Boolean }); defineEmits(["close"]);
const media = matchMedia('(max-width: 900px)'), compact = ref(media.matches);
function updateCompact(event) { compact.value = event.matches; }
onMounted(() => media.addEventListener('change', updateCompact));
onUnmounted(() => media.removeEventListener('change', updateCompact));
const links = [
  { to: '/', icon: 'library', label: 'Bibliothèque' }, { to: '/recherche', icon: 'search', label: 'Rechercher' },
  { to: '/favoris', icon: 'heart', label: 'Favoris' }, { to: '/playlists', icon: 'playlist', label: 'Playlists' },
  { to: '/albums', icon: 'disc', label: 'Albums' }, { to: '/queue', icon: 'queue', label: 'File d’attente' },
  { to: '/lecture', icon: 'play', label: 'Lecteur et paroles' }, { to: '/rifts', icon: 'rift', label: 'Rifts' },
  { to: '/parametres', icon: 'settings', label: 'Paramètres' },
];
</script>
