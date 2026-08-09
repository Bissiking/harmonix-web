<template>
  <div class="hx-app">
    <SidebarNav :open="mobileOpen" @close="mobileOpen = false" />
    <main class="hx-main">
      <header class="hx-header">
        <button class="hx-icon-btn hx-menu-toggle" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        <div class="hx-brand">
          <span class="hx-brand-logo">
            <svg viewBox="0 0 32 32" class="hx-ico"><path d="M10 24V12l14-3v11" /><circle cx="10" cy="24" r="2.4" fill="currentColor" stroke="none" /><circle cx="24" cy="20" r="2.4" fill="currentColor" stroke="none" /></svg>
          </span>
          <span class="hx-brand-copy">
            <span class="hx-brand-name">Harmonix</span>
            <span class="hx-brand-sub">V3.0.0</span>
          </span>
        </div>
        <SearchBar />
        <div class="hx-header-spacer" />
        <div class="hx-user">
          <template v-if="session.state.authenticated">
            <RouterLink to="/parametres" class="hx-user-chip" :title="session.state.user?.username || ''">
              <span class="hx-avatar">{{ (session.state.user?.username || '?').slice(0, 1).toUpperCase() }}</span>
              <span class="hx-user-name">{{ session.state.user?.username }}</span>
            </RouterLink>
            <button class="hx-icon-btn" title="Déconnexion" @click="logout">
              <svg viewBox="0 0 24 24" class="hx-ico"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
          </template>
          <button v-else class="hx-btn hx-btn-primary" @click="session.login()">Se connecter</button>
        </div>
      </header>
      <div class="hx-content" ref="rootEl">
        <RouterView />
      </div>
    </main>
    <PlayerBar />
    <ToastHost :items="toasts.state.items" @dismiss="toasts.dismiss" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterView, RouterLink } from "vue-router";
import { initPlayer } from "../stores/player.js";
import { useSession, logout } from "../stores/session.js";
import { useToasts } from "../stores/toasts.js";
import SidebarNav from "./SidebarNav.vue";
import PlayerBar from "./PlayerBar.vue";
import ToastHost from "./ToastHost.vue";
import SearchBar from "./SearchBar.vue";

const session = useSession();
const toasts = useToasts();
const rootEl = ref(null);
const mobileOpen = ref(false);

onMounted(() => {
  initPlayer(rootEl.value);
  window.addEventListener("harmonix:unauthorized", handleUnauthorized);
});

onUnmounted(() => {
  window.removeEventListener("harmonix:unauthorized", handleUnauthorized);
});

function handleUnauthorized() {
  session.fetchSession();
}
</script>
