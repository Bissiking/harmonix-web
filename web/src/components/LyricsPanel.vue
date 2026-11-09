<template>
  <section class="hx-lyrics" aria-labelledby="lyrics-heading">
    <div class="hx-section-bar"><h2 id="lyrics-heading" class="hx-section-title">Paroles</h2><span v-if="synced" class="hx-subtle">Synchronisées</span></div>
    <div v-if="loading" class="hx-loading" role="status">Chargement des paroles…</div>
    <div v-else-if="error" class="hx-error"><p>Les paroles sont indisponibles.</p><button class="hx-btn" @click="load">Réessayer</button></div>
    <p v-else-if="!lines.length" class="hx-lyrics-empty">Ce morceau n’a pas encore de paroles dans Sonora.</p>
    <div v-else ref="scroller" class="hx-lyrics-lines" :class="{ synced }" tabindex="0" aria-label="Paroles du morceau">
      <template v-for="(line, index) in lines" :key="index">
        <button v-if="synced" class="hx-lyric-line" :class="{ active: index === active }" :aria-current="index === active ? 'true' : undefined" :disabled="!isCurrent" :data-line="index" @click="player.seek(line.time)">{{ line.text || '…' }}</button>
        <p v-else class="hx-lyric-line">{{ line.text }}</p>
      </template>
    </div>
    <p v-if="synced && lines.length" class="hx-subtle hx-lyrics-help">{{ isCurrent ? 'Choisissez un vers pour reprendre la lecture à cet instant.' : 'Lancez ce morceau pour suivre les paroles.' }}</p>
  </section>
</template>
<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import { library } from "../api/library.js";
import { parseLyrics, activeLyricIndex } from "../core/lyrics.js";
import { usePlayer } from "../stores/player.js";
const props = defineProps({ trackId: { type: String, required: true } });
const player = usePlayer(), loading = ref(true), error = ref(false), synced = ref(false), lines = ref([]), scroller = ref(null);
let version = 0;
const isCurrent = computed(() => player.state.currentId === props.trackId);
const active = computed(() => isCurrent.value && synced.value ? activeLyricIndex(lines.value, player.state.position) : -1);
async function load() {
  const token = ++version;
  loading.value = true; error.value = false; lines.value = [];
  try {
    const data = await library.lyrics(props.trackId);
    if (token !== version) return;
    synced.value = Boolean(data.synced);
    lines.value = parseLyrics(data.lyrics || "", synced.value);
  } catch { if (token === version) error.value = true; }
  finally { if (token === version) loading.value = false; }
}
watch(() => props.trackId, load, { immediate: true });
watch(active, async (index) => {
  await nextTick();
  const element = scroller.value?.querySelector(`[data-line="${index}"]`);
  if (!element) return;
  scroller.value.scrollTo({ top: Math.max(0, element.offsetTop - scroller.value.clientHeight / 3), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});
onUnmounted(() => version++);
</script>
