<template>
  <div class="hx-app" @keydown.esc="mobileOpen = false" @keydown.tab="trapMenuFocus">
    <a class="hx-skip-link" href="#main-content">Aller au contenu</a>
    <button v-if="mobileOpen" class="hx-nav-backdrop" aria-label="Fermer le menu" @click="mobileOpen = false" />
    <SidebarNav :open="mobileOpen" @close="mobileOpen = false" />
    <main class="hx-main" :inert="mobileOpen">
      <header class="hx-header">
        <button class="hx-icon-btn hx-menu-toggle" aria-label="Ouvrir le menu" aria-controls="main-navigation" :aria-expanded="mobileOpen" @click="mobileOpen = !mobileOpen"><HxIcon name="menu" /></button>
        <SearchBar />
        <RouterLink to="/parametres" class="hx-user-chip" :aria-label="`Compte de ${username}`"><span class="hx-avatar">{{ username.slice(0, 1).toUpperCase() }}</span><span class="hx-user-name">{{ username }}</span></RouterLink>
      </header>
      <div v-if="session.state.error" class="hx-session-warning" role="status">{{ session.state.error }}<button class="hx-btn" @click="session.fetchSession()">Réessayer</button></div>
      <div id="main-content" ref="rootEl" class="hx-content" tabindex="-1"><RouterView /></div>
    </main>
    <div ref="audioRoot" />
    <PlayerBar :inert="mobileOpen" />
    <nav class="hx-mobile-nav" :inert="mobileOpen" aria-label="Navigation mobile">
      <RouterLink to="/" exact-active-class="is-active"><HxIcon name="library" /><span>Bibliothèque</span></RouterLink>
      <RouterLink to="/recherche"><HxIcon name="search" /><span>Recherche</span></RouterLink>
      <RouterLink to="/favoris"><HxIcon name="heart" /><span>Favoris</span></RouterLink>
      <RouterLink to="/playlists"><HxIcon name="playlist" /><span>Playlists</span></RouterLink>
    </nav>
    <ToastHost :items="toasts.state.items" @dismiss="toasts.dismiss" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { RouterView, RouterLink, useRouter, useRoute } from "vue-router";
import { initPlayer, disposePlayer } from "../stores/player.js";
import { useSession } from "../stores/session.js";
import { useToasts } from "../stores/toasts.js";
import SidebarNav from "./SidebarNav.vue";
import PlayerBar from "./PlayerBar.vue";
import ToastHost from "./ToastHost.vue";
import SearchBar from "./SearchBar.vue";
import HxIcon from "./HxIcon.vue";
const session = useSession(), toasts = useToasts(), router = useRouter(), route = useRoute();
const rootEl = ref(null), audioRoot = ref(null), mobileOpen = ref(false);
const username = computed(() => session.state.user?.username || session.state.user?.email || 'Mon compte');
onMounted(() => { initPlayer(audioRoot.value); window.addEventListener("harmonix:unauthorized", handleUnauthorized); });
onUnmounted(() => { window.removeEventListener("harmonix:unauthorized", handleUnauthorized); disposePlayer(); });
watch(() => route.fullPath, () => { mobileOpen.value = false; rootEl.value?.scrollTo(0, 0); });
watch(mobileOpen, async (open) => {
  await nextTick();
  document.querySelector(open ? '.hx-sidebar-close' : '.hx-menu-toggle')?.focus();
});
function trapMenuFocus(event) {
  if (!mobileOpen.value) return;
  const controls = [...document.querySelectorAll('.hx-sidebar a, .hx-sidebar button')];
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
let checking = false;
async function handleUnauthorized() {
  if (checking) return;
  checking = true;
  await session.fetchSession();
  checking = false;
  if (!session.state.authenticated && !session.state.error) router.replace({ name: 'login' });
}
</script>
