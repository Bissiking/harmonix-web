import { createRouter, createWebHistory } from "vue-router";
import AppShell from "./components/AppShell.vue";
import { fetchSession, useSession } from "./stores/session.js";

const routes = [
  {
    path: "/",
    component: AppShell,
    children: [
      { path: "", name: "home", component: () => import("./views/HomeView.vue") },
      { path: "recherche", name: "search", component: () => import("./views/SearchView.vue") },
      { path: "favoris", name: "favorites", component: () => import("./views/FavoritesView.vue") },
      { path: "playlists", name: "playlists", component: () => import("./views/PlaylistsView.vue") },
      { path: "playlists/:id", name: "playlist-detail", component: () => import("./views/PlaylistDetailView.vue") },
      { path: "albums", name: "albums", component: () => import("./views/AlbumsView.vue") },
      { path: "albums/:id", name: "album-detail", component: () => import("./views/AlbumDetailView.vue") },
      { path: "queue", name: "queue", component: () => import("./views/QueueView.vue") },
      { path: "parametres", name: "settings", component: () => import("./views/SettingsView.vue") },
      { path: "piste/:id", name: "track", component: () => import("./views/TrackView.vue") },
      { path: "rifts", name: "rifts", component: () => import("./views/RiftsView.vue") },
    ],
  },
  { path: "/connexion", name: "login", component: () => import("./views/LoginView.vue") },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

let sessionPromise = null;
function ensureSession() {
  if (!sessionPromise) sessionPromise = fetchSession();
  return sessionPromise;
}

router.beforeEach(async (to) => {
  await ensureSession();
  if (to.name !== "login") {
    // Sonora exige un token Kyros : toutes les pages nécessitent l'auth.
    const { state } = useSession();
    if (!state.authenticated && !state.loading) {
      return { name: "login" };
    }
  }
  return true;
});
