<template>
  <div class="hx-tracklist">
    <div class="hx-tracklist-head">
      <span class="hx-tracklist-num">#</span>
      <span class="hx-tracklist-title-col">Titre</span>
      <span class="hx-tracklist-artist">Artiste</span>
      <span class="hx-tracklist-album">Album</span>
      <span class="hx-tracklist-dur">Durée</span>
    </div>
    <div v-if="!tracks.length" class="hx-empty">
      <slot name="empty">
        <p>Aucune piste</p>
      </slot>
    </div>
    <div
      v-for="(track, index) in tracks"
      :key="track.id"
      class="hx-track-row"
      :class="{ 'is-current': track.id === currentId }"
      @dblclick="onPlay(index)"
    >
      <div class="hx-tracklist-num" @click="onPlay(index)" role="button" :title="`Lire ${track.title}`">
        <svg v-if="track.id === currentId && isPlaying" viewBox="0 0 24 24" class="hx-ico hx-row-play"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
        <svg v-else viewBox="0 0 24 24" class="hx-ico hx-row-play"><path d="M7 4v16l13-8z" /></svg>
        <span class="hx-tracklist-idx">{{ index + 1 }}</span>
      </div>
      <div class="hx-tracklist-title-col">
        <img class="hx-track-cover" :src="cover(track.cover)" alt="" loading="lazy" @click="onPlay(index)" />
        <div class="hx-track-meta" @click="onPlay(index)">
          <div class="hx-track-title">{{ track.title || 'Sans titre' }}</div>
          <div class="hx-track-sub">{{ track.artist || 'Inconnu' }}</div>
        </div>
      </div>
      <div class="hx-tracklist-artist">{{ track.artist || '—' }}</div>
      <div class="hx-tracklist-album">
        <button v-if="track.album" class="hx-track-album-link" @click="$emit('open-album', track)">{{ track.album }}</button>
        <span v-else>—</span>
      </div>
      <div class="hx-tracklist-actions">
        <button class="hx-icon-btn" :class="{ active: isFav(track) }" @click="onFav(track)" :title="isFav(track) ? 'Retirer des favoris' : 'Ajouter aux favoris'">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
        </button>
        <button class="hx-icon-btn" title="Ajouter à la file" @click="$emit('add-queue', track)">
          <svg viewBox="0 0 24 24" class="hx-ico"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <span class="hx-tracklist-dur">{{ fmt(track.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { coverUrl } from "../api/client.js";
import { formatDuration as fmt } from "../utils/format.js";

defineProps({
  tracks: { type: Array, default: () => [] },
  currentId: { type: [String, Number], default: null },
  isPlaying: { type: Boolean, default: false },
  isFav: { type: Function, default: () => false },
});

defineEmits(["play", "open-album", "add-queue", "fav"]);

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}
</script>
