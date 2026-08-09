<template>
  <div class="hx-page">
    <div class="hx-section-bar">
      <h2 class="hx-section-title">Rifts</h2>
      <button v-if="!activeRift" class="hx-btn hx-btn-primary" @click="createNew">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M12 5v14M5 12h14" /></svg>
        <span>Nouveau rift</span>
      </button>
      <button v-else class="hx-btn" @click="leave">
        <svg viewBox="0 0 24 24" class="hx-ico"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
        <span>Quitter</span>
      </button>
    </div>

    <div v-if="activeRift" class="hx-rift-room">
      <div class="hx-rift-room-head">
        <div class="hx-rift-room-title">
          <span class="hx-rift-dot" :class="{ live: state.connected }"></span>
          <span>{{ activeRift.name }}</span>
        </div>
        <span class="hx-rift-status">{{ state.connected ? 'Connecté' : 'Hors ligne' }}</span>
      </div>

      <div class="hx-rift-room-body">
        <div v-if="!player.state.current" class="hx-empty">
          <p>Lance un morceau depuis la bibliothèque pour l'écouter dans le rift.</p>
          <RouterLink to="/" class="hx-btn hx-btn-primary">Aller à la bibliothèque</RouterLink>
        </div>
        <div v-else class="hx-rift-now">
          <img class="hx-rift-now-cover" :src="cover(player.state.current.cover)" alt="" />
          <div>
            <div class="hx-rift-now-title">{{ player.state.current.title }}</div>
            <div class="hx-rift-now-sub">{{ player.state.current.artist }}</div>
          </div>
        </div>

        <div v-if="state.messages.length" class="hx-rift-log">
          <div v-for="(msg, i) in state.messages" :key="i" class="hx-rift-log-line">
            <span class="hx-rift-log-tag" :class="{ self: isSelf(msg) }">{{ labelOf(msg) }}</span>
            <span class="hx-rift-log-body">{{ bodyOf(msg) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="state.loading" class="hx-loading">Chargement des rifts…</div>
      <div v-else-if="!state.rifts.length" class="hx-empty">
        <p>Aucun rift actif. Crée-en un pour écouter ensemble !</p>
      </div>
      <div v-else class="hx-rift-grid">
        <button v-for="rift in state.rifts" :key="rift.id" class="hx-rift-card" @click="openRift(rift)">
          <div class="hx-rift-cover">
            <svg viewBox="0 0 24 24" class="hx-ico"><path d="M4 12a8 8 0 0 1 16 0M8 12a4 4 0 0 1 8 0" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg>
          </div>
          <div class="hx-rift-info">
            <div class="hx-rift-name">{{ rift.name }}</div>
            <div class="hx-rift-sub">
              <span>{{ rift.listeners }} écoutant</span>
              <span v-if="rift.owner"> · {{ rift.owner }}</span>
            </div>
          </div>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRifts } from "../stores/rifts.js";
import { usePlayer } from "../stores/player.js";
import { useSession } from "../stores/session.js";
import { coverUrl } from "../api/client.js";
import { toast } from "../stores/toasts.js";

const route = useRoute();
const router = useRouter();
const rifts = useRifts();
const player = usePlayer();
const session = useSession();
const { state } = rifts;

const activeRift = ref(null);
const username = computed(() => session.state.user?.username || "toi");

function cover(c) {
  return coverUrl(c) || "/images/default_cover.svg";
}

function isSelf(msg) {
  return msg?.from && msg.from === (session.state.user?.username || session.state.user?.id || "toi");
}

function labelOf(msg) {
  return msg?.from || msg?.type || "info";
}

function bodyOf(msg) {
  if (msg?.text) return msg.text;
  if (msg?.action) return `action: ${msg.action}`;
  return JSON.stringify(msg);
}

function openRift(rift) {
  router.push({ name: "rifts", query: { id: rift.id } });
}

function leave() {
  rifts.disconnectRift();
  router.push({ name: "rifts" });
}

async function createNew() {
  const name = window.prompt("Nom du rift :", "Rift de " + new Date().toLocaleTimeString());
  if (!name?.trim()) return;
  try {
    const data = await rifts.createRift(name.trim());
    const id = String(data?.id ?? data?._id ?? data?.rift?.id ?? "");
    if (id) {
      toast("Rift créé", { icon: "check" });
      openRift({ id });
    }
  } catch {
    toast("Création impossible", { type: "error", icon: "alert" });
  }
}

watch(
  () => route.query.id,
  (id) => {
    if (id) {
      const rift = state.rifts.find((r) => r.id === String(id));
      rifts.connectRift(String(id), {
        onMessage: (msg) => {
          if (msg?.track_id) {
            // Les rifts peuvent diffuser la piste en cours ; on réutilise l'état local.
          }
        },
      });
      activeRift.value = { ...(rift || {}), id: String(id) };
    } else {
      rifts.disconnectRift();
      activeRift.value = null;
    }
  },
  { immediate: true }
);

onMounted(() => rifts.loadRifts().catch(() => {}));
onUnmounted(() => rifts.disconnectRift());</script>
