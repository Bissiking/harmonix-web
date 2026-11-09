<template>
  <div class="hx-page">
    <div class="hx-section-bar"><h1>File d’attente</h1><button v-if="customCount" class="hx-btn" @click="clear">Vider les ajouts manuels</button></div>
    <div v-if="!player.state.current && !player.state.queueNext.length" class="hx-empty"><p>Lancez un morceau ou une playlist pour préparer votre écoute.</p><RouterLink to="/" class="hx-btn hx-btn-primary">Explorer la bibliothèque</RouterLink></div>
    <template v-if="player.state.current">
      <h2 class="hx-queue-heading">{{ player.state.isPlaying ? 'En lecture' : 'En pause' }}</h2>
      <RouterLink to="/lecture" class="hx-queue-current"><img class="hx-queue-cover" :src="coverUrl(player.state.current.cover)" alt="" /><span class="hx-queue-meta"><strong class="hx-queue-title">{{ player.state.current.title }}</strong><span class="hx-queue-sub">{{ player.state.current.artist }}</span></span></RouterLink>
    </template>
    <h2 v-if="player.state.queueNext.length" class="hx-queue-heading">À suivre</h2>
    <div v-for="(track, index) in player.state.queueNext" :key="`${track.id}-${index}`" class="hx-queue-item">
      <button class="hx-queue-track" @click="player.playQueued(index)"><img class="hx-queue-cover" :src="coverUrl(track.cover)" alt="" /><span class="hx-queue-meta"><strong class="hx-queue-title">{{ track.title }}</strong><span class="hx-queue-sub">{{ track.artist }}</span></span></button>
      <span class="hx-queue-badge" v-if="track._fromCustomQueue">Ajout manuel</span><span class="hx-queue-dur">{{ fmt(track.duration) }}</span>
      <button v-if="track._fromCustomQueue" class="hx-icon-btn" :aria-label="`Retirer ${track.title} de la file`" @click="remove(index)"><svg viewBox="0 0 24 24" class="hx-ico"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { usePlayer } from "../stores/player.js";
import { coverUrl } from "../api/client.js";
import { formatTime as fmt } from "../utils/format.js";
import { toast } from "../stores/toasts.js";
const player = usePlayer();
const customCount = computed(() => player.state.queueNext.filter((track) => track._fromCustomQueue).length);
function remove(index) { player.getController()?.removeFromCustomQueue(index); }
function clear() { player.getController()?.clearCustomQueue(); toast('Ajouts manuels retirés'); }
</script>
