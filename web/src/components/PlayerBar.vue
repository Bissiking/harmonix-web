<template>
  <footer class="hx-player" aria-label="Lecteur audio">
    <div class="hx-player-left">
      <RouterLink to="/lecture" class="hx-player-track" :aria-label="current ? `Ouvrir le lecteur : ${current.title}` : 'Ouvrir le lecteur'">
        <img class="hx-player-cover" :src="coverUrl(current?.cover)" alt="" @error="fallback" />
        <span class="hx-player-info"><strong class="hx-player-title">{{ current?.title || 'Prêt à écouter' }}</strong><small class="hx-player-artist">{{ current?.artist || 'Choisissez un morceau' }}</small></span>
      </RouterLink>
      <button class="hx-icon-btn hx-player-fav" :class="{ active: favActive }" :disabled="!current" :aria-pressed="favActive" :aria-label="favActive ? 'Retirer des favoris' : 'Ajouter aux favoris'" @click="onFav"><HxIcon name="heart" /></button>
    </div>
    <div class="hx-player-center">
      <div class="hx-player-controls">
        <button class="hx-icon-btn hx-player-mode" :class="{ active: state.shuffle }" :aria-pressed="state.shuffle" aria-label="Lecture aléatoire" @click="player.toggleShuffle()"><HxIcon name="shuffle" /></button>
        <button class="hx-icon-btn" :disabled="!current" aria-label="Morceau précédent" @click="player.prev()"><HxIcon name="prev" /></button>
        <button class="hx-btn-play" :disabled="!current" :aria-label="state.isPlaying ? 'Mettre en pause' : 'Lire le morceau'" :aria-busy="state.loading" @click="player.togglePlay()"><HxIcon :name="state.isPlaying ? 'pause' : 'play'" /></button>
        <button class="hx-icon-btn" :disabled="!current" aria-label="Morceau suivant" @click="player.next()"><HxIcon name="next" /></button>
        <button class="hx-icon-btn hx-player-mode" :class="{ active: state.repeat !== 'none' }" :aria-label="`Répétition : ${repeatLabel}`" @click="player.toggleRepeat()"><HxIcon name="repeat" /><span v-if="state.repeat === 'one'" class="hx-repeat-one">1</span></button>
      </div>
      <div class="hx-player-progress"><span class="hx-time">{{ fmt(state.position) }}</span><input type="range" aria-label="Position de lecture" min="0" :max="state.duration || 0" step="0.1" :value="state.position" :disabled="!current" @input="player.seek(Number($event.target.value))" /><span class="hx-time">{{ fmt(state.duration) }}</span></div>
    </div>
    <div class="hx-player-right">
      <button class="hx-icon-btn hx-volume-toggle" :aria-label="state.muted ? 'Rétablir le son' : 'Couper le son'" @click="player.toggleMute()"><HxIcon :name="state.muted ? 'muted' : 'volume'" /></button>
      <input class="hx-volume" type="range" aria-label="Volume" min="0" max="1" step="0.01" :value="state.volume" @input="player.setVolume(Number($event.target.value))" />
      <RouterLink to="/queue" class="hx-icon-btn" aria-label="Ouvrir la file d’attente"><HxIcon name="queue" /></RouterLink>
      <RouterLink to="/lecture" class="hx-icon-btn" aria-label="Lecteur complet et paroles"><HxIcon name="expand" /></RouterLink>
    </div>
    <div v-if="state.error" class="hx-player-error" role="alert"><span>{{ state.error }}</span><button class="hx-btn" @click="player.play()">Réessayer</button></div>
  </footer>
</template>
<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import HxIcon from "./HxIcon.vue";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { coverUrl } from "../api/client.js";
import { formatTime as fmt } from "../utils/format.js";
import { toast } from "../stores/toasts.js";
const player = usePlayer(), favorites = useFavorites(), state = player.state;
const current = computed(() => state.current);
const favActive = computed(() => Boolean(current.value && favorites.state.ids.has(current.value.id)));
const repeatLabel = computed(() => ({ none: 'désactivée', one: 'un morceau', all: 'toute la liste' }[state.repeat]));
function fallback(event) { event.target.onerror = null; event.target.src = '/images/default_cover.svg'; }
async function onFav() { try { const active = await favorites.toggleFavorite(current.value.id); toast(active ? 'Ajouté aux favoris' : 'Retiré des favoris'); } catch { toast('Favori indisponible', { type: 'error' }); } }
</script>
