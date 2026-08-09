<template>
  <aside class="hx-sidebar" :class="{ open }">
    <div class="hx-sidebar-brand">
      <RouterLink to="/" @click="$emit('close')">
        <span class="hx-sidebar-logo">
          <svg viewBox="0 0 32 32" class="hx-ico"><path d="M10 24V12l14-3v11" /><circle cx="10" cy="24" r="2.4" fill="currentColor" stroke="none" /><circle cx="24" cy="20" r="2.4" fill="currentColor" stroke="none" /></svg>
        </span>
          <span class="hx-sidebar-copy">
            <span class="hx-sidebar-text">Harmonix</span>
            <span class="hx-sidebar-sub">Musiques créées avec Suno</span>
        </span>
      </RouterLink>
      <button class="hx-icon-btn hx-sidebar-close" @click="$emit('close')" aria-label="Fermer">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>

    <nav class="hx-nav">
      <RouterLink to="/" class="hx-nav-item" @click="$emit('close')">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
        <span>Bibliothèque</span>
      </RouterLink>
      <RouterLink to="/queue" class="hx-nav-item" @click="$emit('close')">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M3 12h9M3 6h13M3 18h7M17 16l4 4m0-4-4 4" /></svg>
        <span>File d'attente</span>
      </RouterLink>
      <template v-if="session.state.authenticated">
        <RouterLink to="/favoris" class="hx-nav-item" @click="$emit('close')">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
          <span>Favoris</span>
        </RouterLink>
        <RouterLink to="/playlists" class="hx-nav-item" @click="$emit('close')">
          <svg viewBox="0 0 24 24" class="hx-ico"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
          <span>Playlists</span>
        </RouterLink>
        <RouterLink to="/albums" class="hx-nav-item" @click="$emit('close')">
          <svg viewBox="0 0 24 24" class="hx-ico"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" /></svg>
          <span>Albums</span>
        </RouterLink>
        <RouterLink to="/rifts" class="hx-nav-item" @click="$emit('close')">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M4 12a8 8 0 0 1 16 0M8 12a4 4 0 0 1 8 0" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg>
          <span>Rifts</span>
        </RouterLink>
        <RouterLink to="/parametres" class="hx-nav-item" @click="$emit('close')">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></svg>
          <span>Paramètres</span>
        </RouterLink>
      </template>
    </nav>

    <div class="hx-sidebar-footer">
      <div class="hx-version-line">Harmonix: V3.0.0</div>
      <div class="hx-version-line">Propulsé par Sonora</div>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { useSession } from "../stores/session.js";

defineProps({ open: Boolean });
defineEmits(["close"]);
const session = useSession();
</script>
