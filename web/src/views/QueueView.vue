<template>
  <div class="hx-page">
    <div class="hx-section-bar">
      <h2 class="hx-section-title">File d'attente</h2>
      <button v-if="queue.next.length" class="hx-btn" @click="clearCustom">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" /></svg>
        <span>Vider la file</span>
      </button>
    </div>

    <div v-if="!queue.current && !queue.next.length" class="hx-empty">
      <p>La file est vide. Lance une playlist ou un morceau.</p>
    </div>

    <template v-if="queue.current">
      <h3 class="hx-queue-heading">En lecture</h3>
      <div class="hx-queue-current" @click="openTrack">
        <img class="hx-queue-cover" :src="cover(queue.current.cover)" alt="" />
        <div class="hx-queue-meta">
          <div class="hx-queue-title">{{ queue.current.title }}</div>
          <div class="hx-queue-sub">{{ queue.current.artist }} — {{ queue.current.album }}</div>
        </div>
      </div>
    </template>

    <template v-if="queue.next.length">
      <h3 class="hx-queue-heading">À suivre ({{ queue.next.length }})</h3>
      <div class="hx-queue-list">
        <button v-for="(track, i) in queue.next" :key="`${track.id}-${i}`" class="hx-queue-item" :class="{ 'is-custom': track._fromCustomQueue }" @click="playAt(i)">
          <img class="hx-queue-cover" :src="cover(track.cover)" alt="" loading="lazy" />
          <span class="hx-queue-meta">
            <span class="hx-queue-title">{{ track.title }}</span>
            <span class="hx-queue-sub">{{ track.artist || 'Inconnu' }}</span>
          </span>
          <span class="hx-queue-badge" v-if="track._fromCustomQueue">Manuelle</span>
          <span class="hx-queue-dur">{{ fmt(track.duration) }}</span>
          <span class="hx-icon-btn hx-queue-remove" :title="'Retirer de la file'" @click.stop="removeAt(i)">
            <svg viewBox="0 0 24 24" class="hx-ico"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { coverUrl } from "../api/client.js";
import { usePlayer } from "../stores/player.js";
import { eventBus } from "../core/EventBus.js";
import { formatDuration as fmt } from "../utils/format.js";
import { toast } from "../stores/toasts.js";

const router = useRouter();
const player = usePlayer();
const controller = player.getController();
const queue = ref(player.state.queueNext ? { current: player.state.current, next: player.state.queueNext } : { current: null, next: [] });

function refresh() {
  queue.value = controller?.getQueueState?.() || {
    current: player.state.current,
    next: player.state.queueNext,
  };
}

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

function playAt(index) {
  const track = queue.value.next[index];
  if (!track) return;
  if (track._fromCustomQueue) {
    player.playTrack(track);
  } else {
    const playlist = controller.getActiveList();
    const idx = playlist.findIndex((t) => t.id === track.id);
    if (idx >= 0) player.playTrackList(playlist, idx);
  }
}

function removeAt(index) {
  const track = queue.value.next[index];
  if (!track) return;
  if (track._fromCustomQueue) {
    const i = queue.value.customNext?.indexOf(track) ?? -1;
    if (i >= 0) controller.removeFromCustomQueue(i);
  }
  refresh();
}

function clearCustom() {
  controller.clearCustomQueue();
  refresh();
  toast("File personnalisée vidée", { icon: "check" });
}

function openTrack() {
  if (queue.value.current?.id) router.push({ name: "track", params: { id: queue.value.current.id } });
}

onMounted(() => {
  refresh();
  eventBus.on("queue:updated", refresh);
});
onUnmounted(() => {
  eventBus.off("queue:updated", refresh);
});
</script>
