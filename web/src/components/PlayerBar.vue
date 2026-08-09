<template>
  <footer class="hx-player">
    <div class="hx-player-left">
      <div class="hx-player-cover-wrap">
        <img class="hx-player-cover" :src="coverUrl(current?.cover)" alt="" loading="lazy" />
        <Visualizer v-if="isPlaying" class="hx-player-viz" />
      </div>
      <div class="hx-player-info" @click="openTrack">
        <div class="hx-player-title">{{ current?.title || 'Aucun titre' }}</div>
        <div class="hx-player-artist">{{ current?.artist || '—' }}</div>
      </div>
      <span class="hx-player-state" :class="{ on: isPlaying && current }">
        <span class="hx-lamp" :class="{ on: isPlaying && current }"></span>
        <span class="hx-placard">{{ playerStatus }}</span>
      </span>
      <button class="hx-icon-btn hx-fav" :class="{ active: favActive }" @click="onFav" :aria-pressed="favActive">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
      </button>
    </div>

    <div class="hx-player-center">
      <div class="hx-player-controls">
        <button class="hx-icon-btn" :class="{ active: shuffle }" @click="toggleShuffle" title="Aléatoire">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
        </button>
        <button class="hx-icon-btn" @click="prev" title="Précédent">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M6 5v14M19 5v14L8 12z" /></svg>
        </button>
        <button class="hx-btn-play" @click="togglePlay">
          <svg v-if="isPlaying" viewBox="0 0 24 24" class="hx-ico"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
          <svg v-else viewBox="0 0 24 24" class="hx-ico"><path d="M7 4v16l13-8z" /></svg>
        </button>
        <button class="hx-icon-btn" @click="next" title="Suivant">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M18 5v14M5 5v14l11-7z" /></svg>
        </button>
        <button class="hx-icon-btn" :class="{ active: repeat !== 'none' }" @click="toggleRepeat" :title="`Répéter : ${repeat}`">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M17 2 21 6l-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" /></svg>
          <span v-if="repeat === 'one'" class="hx-repeat-one">1</span>
        </button>
      </div>
      <div class="hx-player-progress">
        <span class="hx-time">{{ fmt(position) }}</span>
        <div class="hx-rail" :title="current ? 'Position de lecture' : 'Aucune piste'">
          <div class="hx-rail-track">
            <div class="hx-rail-fill" :style="progressStyle.fill"></div>
            <div class="hx-rail-needle" :style="progressStyle.needle"></div>
          </div>
          <input
            class="hx-rail-input"
            type="range"
            min="0"
            :max="duration || 0"
            step="0.1"
            :value="position"
            @input="onSeek"
            :disabled="!current"
          />
        </div>
        <span class="hx-time">{{ fmt(duration) }}</span>
      </div>
    </div>

    <div class="hx-player-right">
      <button class="hx-icon-btn" @click="toggleMute" :title="muted ? 'Démuter' : 'Muet'">
        <svg v-if="muted || volume === 0" viewBox="0 0 24 24" class="hx-ico"><path d="M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6" /></svg>
        <svg v-else viewBox="0 0 24 24" class="hx-ico"><path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
      </button>
      <div class="hx-rail hx-volume" title="Volume">
        <div class="hx-rail-track">
          <div class="hx-rail-fill" :style="volumeStyle.fill"></div>
          <div class="hx-rail-needle" :style="volumeStyle.needle"></div>
        </div>
        <input class="hx-rail-input" type="range" min="0" max="1" step="0.01" :value="volume" @input="onVolume" />
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import Visualizer from "./Visualizer.vue";
import { usePlayer } from "../stores/player.js";
import { useFavorites } from "../stores/favorites.js";
import { formatTime as fmt } from "../utils/format.js";
import { coverUrl } from "../api/client.js";
import { toast } from "../stores/toasts.js";

const router = useRouter();
const player = usePlayer();
const favorites = useFavorites();
const { state } = player;

const isPlaying = computed(() => state.isPlaying);
const current = computed(() => state.current);
const favActive = computed(() => current.value && favorites.state.ids.has(String(current.value.id)));
const shuffle = computed(() => state.shuffle);
const repeat = computed(() => state.repeat);
const position = computed(() => state.position);
const duration = computed(() => state.duration);
const muted = computed(() => state.muted);
const volume = computed(() => state.volume);
const playerStatus = computed(() => {
  if (!current.value) return "PRÊT";
  return isPlaying.value ? "EN LECTURE" : "EN PAUSE";
});

function railStyle(value, max) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return {
    fill: { transform: `scaleX(${ratio})` },
    needle: { left: `${ratio * 100}%` },
  };
}
const progressStyle = computed(() => railStyle(position.value, duration.value));
const volumeStyle = computed(() => railStyle(volume.value, 1));

const togglePlay = player.togglePlay;
const toggleShuffle = player.toggleShuffle;
const toggleRepeat = player.toggleRepeat;
const toggleMute = player.toggleMute;
const prev = player.prev;
const next = player.next;

async function onFav() {
  if (!current.value) return;
  try {
    const final = await favorites.toggleFavorite(current.value.id);
    toast(final ? "Ajouté aux favoris" : "Retiré des favoris", { icon: final ? "heart" : "heart" });
  } catch {
    toast("Favori indisponible", { type: "error", icon: "alert" });
  }
}

function onSeek(e) {
  player.seek(Number(e.target.value));
}
function onVolume(e) {
  player.setVolume(Number(e.target.value));
}
function openTrack() {
  if (current.value?.id) router.push({ name: "track", params: { id: current.value.id } });
}
</script>
