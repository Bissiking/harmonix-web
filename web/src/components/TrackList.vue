<template>
  <div class="hx-tracklist">
    <div class="hx-tracklist-head" aria-hidden="true">
      <span>#</span><span>Titre</span><span>Artiste</span><span>Album</span><span>Actions</span>
    </div>
    <div v-if="!tracks.length" class="hx-empty"><slot name="empty"><p>Aucun morceau dans cette liste.</p></slot></div>
    <div v-for="(track, index) in tracks" :key="track.id" class="hx-track-row" :class="{ 'is-current': track.id === currentId }">
      <button class="hx-tracklist-num" :aria-label="`Écouter ${track.title}`" @click="$emit('play', index)">
        <svg viewBox="0 0 24 24" class="hx-ico hx-row-play"><path d="m8 5 11 7-11 7z" /></svg>
        <span class="hx-tracklist-idx">{{ index + 1 }}</span>
      </button>
      <div class="hx-tracklist-title-col">
        <button class="hx-track-art" :aria-label="`Écouter ${track.title}`" @click="$emit('play', index)">
          <img class="hx-track-cover" :src="coverUrl(track.cover)" alt="" loading="lazy" @error="imageFallback" />
        </button>
        <div class="hx-track-meta">
          <RouterLink class="hx-track-title" :to="{ name: 'track', params: { id: track.id } }">{{ track.title }}</RouterLink>
          <div class="hx-track-sub">{{ track.artist || 'Artiste inconnu' }}</div>
        </div>
      </div>
      <div class="hx-tracklist-artist">{{ track.artist }}</div>
      <div class="hx-tracklist-album"><span>{{ track.album || '—' }}</span></div>
      <div class="hx-tracklist-actions">
        <button class="hx-icon-btn" :class="{ active: isFav(track) }" :aria-pressed="isFav(track)" :aria-label="isFav(track) ? `Retirer ${track.title} des favoris` : `Ajouter ${track.title} aux favoris`" @click="$emit('fav', track)">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
        </button>
        <button class="hx-icon-btn" :aria-label="`Ajouter ${track.title} à la file`" @click="$emit('add-queue', track)">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <slot name="actions" :track="track" />
        <span class="hx-tracklist-dur">{{ fmt(track.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { coverUrl } from "../api/client.js";
import { formatDuration as fmt } from "../utils/format.js";
defineProps({
  tracks: { type: Array, default: () => [] }, currentId: { type: [String, Number], default: null },
  isPlaying: Boolean, isFav: { type: Function, default: () => false },
});
defineEmits(["play", "open-album", "add-queue", "fav"]);
function imageFallback(event) { event.target.onerror = null; event.target.src = "/images/default_cover.svg"; }
</script>
