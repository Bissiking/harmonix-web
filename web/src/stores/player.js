import { reactive, readonly } from "vue";
import { AudioEngine } from "../core/AudioEngine.js";
import { PlayerController } from "../core/PlayerController.js";
import { streamUrl, coverUrl } from "../api/client.js";
import { library, normalizeTrack } from "../api/library.js";
import { eventBus } from "../core/EventBus.js";

const state = reactive({
  current: null, currentId: null, isPlaying: false, position: 0, duration: 0,
  volume: 1, muted: false, shuffle: false, repeat: "none", queueNext: [],
  totalPlaylist: 0, loading: false, error: null, hasStarted: false,
});
let engine, controller, audioEl, syncTimer;
let lastSyncState = "";
let selection = 0;
let restoring = false;

function persistState({ keepalive = false } = {}) {
  if (!state.currentId || restoring) return;
  const body = {
    trackId: state.currentId, positionMs: Math.floor(state.position * 1000),
    volume: state.volume, shuffle: state.shuffle, repeat: state.repeat, isPlaying: state.isPlaying,
  };
  const signature = JSON.stringify(body);
  if (signature === lastSyncState) return;
  lastSyncState = signature;
  library.savePlayback(body, { keepalive }).catch(() => {
    if (lastSyncState === signature) lastSyncState = "";
  });
}

function updateMediaSession() {
  if (!("mediaSession" in navigator)) return;
  const track = state.current;
  if (track && typeof MediaMetadata !== "undefined") {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title, artist: track.artist || "", album: track.album || "",
      artwork: [{ src: new URL(coverUrl(track.cover), location.origin).href }],
    });
  }
  navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
}

function updateMediaPosition() {
  if (!navigator.mediaSession?.setPositionState || !state.duration) return;
  try {
    navigator.mediaSession.setPositionState({
      duration: state.duration, playbackRate: 1, position: Math.min(state.position, state.duration),
    });
  } catch { /* Position média facultative. */ }
}

function syncCurrent(queue) {
  const track = controller.current;
  const changed = String(track?.id) !== String(state.currentId);
  state.current = track;
  state.currentId = track?.id ?? null;
  state.queueNext = queue.next;
  state.totalPlaylist = queue.totalPlaylist;
  state.shuffle = queue.shuffle;
  state.repeat = queue.repeat;
  if (changed) {
    state.position = 0;
    state.duration = track?.duration || 0;
    state.error = null;
    if (track) eventBus.emit("track:changed", track);
    updateMediaSession();
  }
}

function playbackError(error) {
  state.loading = false;
  if (error?.name === "AbortError") return;
  state.error = error?.name === "NotAllowedError"
    ? "Appuyez sur Lecture pour autoriser l’écoute."
    : "Lecture impossible. Vérifiez votre connexion et réessayez.";
}

export function initPlayer(rootEl) {
  if (audioEl) return;
  audioEl = document.createElement("audio");
  audioEl.preload = "metadata";
  audioEl.id = "hx-audio";
  rootEl.appendChild(audioEl);
  engine = new AudioEngine(audioEl);
  controller = new PlayerController({ engine, getSrc: (track) => streamUrl(track.id) });
  eventBus.on("queue:updated", syncCurrent);
  engine.on("timeupdate", () => { state.position = engine.currentTime; updateMediaPosition(); });
  engine.on("durationchange", () => {
    state.duration = engine.duration || state.current?.duration || 0;
    updateMediaPosition();
  });
  engine.on("play", () => {
    state.isPlaying = true;
    state.hasStarted = true;
    state.error = null;
    updateMediaSession();
    persistState();
  });
  engine.on("playing", () => { state.loading = false; });
  engine.on("waiting", () => { state.loading = true; });
  engine.on("pause", () => {
    state.isPlaying = false;
    state.loading = false;
    updateMediaSession();
    persistState();
  });
  engine.on("ended", async () => {
    persistState();
    try { await controller.handleEnded(); } catch (error) { playbackError(error); }
  });
  engine.on("error", () => playbackError());
  try {
    const volume = Number(localStorage.getItem("harmonix:volume") ?? 1);
    state.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1;
    state.muted = localStorage.getItem("harmonix:muted") === "1";
    state.shuffle = localStorage.getItem("harmonix:shuffle") === "1";
    const repeat = localStorage.getItem("harmonix:repeat");
    state.repeat = ["none", "all", "one"].includes(repeat) ? repeat : "none";
  } catch { /* Stockage facultatif. */ }
  engine.setVolume(state.volume);
  engine.setMuted(state.muted);
  controller.shuffle = state.shuffle;
  controller.repeat = state.repeat;

  if ("mediaSession" in navigator) {
    const actions = {
      play, pause, nexttrack: next, previoustrack: prev,
      seekto: ({ seekTime }) => seek(seekTime),
      seekbackward: ({ seekOffset = 10 }) => seek(state.position - seekOffset),
      seekforward: ({ seekOffset = 10 }) => seek(state.position + seekOffset),
    };
    for (const [action, handler] of Object.entries(actions)) {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* Action facultative. */ }
    }
  }
  const initialSelection = selection;
  library.resume().then(async (resume) => {
    if (!resume?.track || selection !== initialSelection) return;
    restoring = true;
    try {
      const track = normalizeTrack(resume.track);
      controller.setPlaylist([track], { keepTrackId: track.id });
      await controller.loadCurrent();
      engine.seek(Number(resume.position_ms ?? resume.positionMs ?? 0) / 1000);
      state.position = Number(resume.position_ms ?? resume.positionMs ?? 0) / 1000;
    } finally { restoring = false; }
  }).catch(() => {});
  syncTimer = setInterval(() => { if (state.isPlaying) persistState(); }, 10000);
  window.addEventListener("pagehide", saveOnExit);
  document.addEventListener("visibilitychange", saveWhenHidden);
}

function saveOnExit() { persistState({ keepalive: true }); }
function saveWhenHidden() { if (document.visibilityState === "hidden") saveOnExit(); }
function remember(key, value) { try { localStorage.setItem(`harmonix:${key}`, String(value)); } catch { /* facultatif */ } }

export function setPlaylist(tracks, { playIndex = 0, autoPlay = true, keepTrackId = null } = {}) {
  if (!controller || !Array.isArray(tracks) || !tracks.length) return;
  selection++;
  const currentSelection = selection;
  const found = keepTrackId === null ? -1 : tracks.findIndex((t) => String(t.id) === String(keepTrackId));
  const index = found >= 0 ? found : Math.max(0, Math.min(playIndex, tracks.length - 1));
  state.loading = true;
  state.error = null;
  controller.clearCustomQueue();
  controller.setPlaylist(tracks, { keepTrackId: tracks[index].id });
  controller.loadByPlaylistIndex(index, { autoPlay }).catch((error) => {
    if (selection === currentSelection) playbackError(error);
  }).finally(() => { if (selection === currentSelection) state.loading = false; });
}

export function playTrack(track, sourceTracks = [track]) { setPlaylist(sourceTracks, { keepTrackId: track.id }); }
export function playTrackList(tracks, index = 0) { setPlaylist(tracks, { playIndex: index }); }
export function addToQueue(track) {
  if (!controller?.current) setPlaylist([track], { autoPlay: false });
  else controller.addToQueue(track);
}
export function playNext(track) { controller?.playNext(track); }
export async function play() {
  if (!controller?.current) return;
  try {
    if (audioEl.error) { await controller.loadCurrent(); engine.seek(state.position); }
    await engine.unlock();
    await engine.play();
  } catch (error) { playbackError(error); }
}
export function pause() { engine?.pause(); }
export function togglePlay() { return engine?.paused ? play() : pause(); }
export async function next() {
  selection++;
  try { return await controller?.next(); } catch (error) { playbackError(error); }
}
export async function prev() {
  selection++;
  try { return await controller?.prev(); } catch (error) { playbackError(error); }
}
export async function playQueued(index) {
  selection++;
  try { return await controller?.playQueued(index); } catch (error) { playbackError(error); }
}
export function seek(time) {
  if (!engine || !Number.isFinite(time)) return;
  state.position = Math.max(0, Math.min(time, state.duration || time));
  engine.seek(state.position);
  updateMediaPosition();
  persistState();
}
export function setVolume(value) {
  if (!Number.isFinite(value)) return;
  state.volume = Math.max(0, Math.min(1, value));
  engine?.setVolume(state.volume);
  remember("volume", state.volume);
}
export function toggleMute() {
  state.muted = !state.muted;
  engine?.setMuted(state.muted);
  remember("muted", state.muted ? 1 : 0);
}
export function toggleShuffle() {
  controller?.setShuffle(!state.shuffle);
  remember("shuffle", state.shuffle ? 1 : 0);
  persistState();
}
export function setRepeat(mode) {
  controller?.setRepeat(mode);
  remember("repeat", state.repeat);
  persistState();
}
export function toggleRepeat() { setRepeat({ none: "all", all: "one", one: "none" }[state.repeat]); }
export function getFrequencyData() { return engine?.getFrequencyData() || null; }
export function getPlayerState() { return readonly(state); }
export function disposePlayer() {
  if (!audioEl) return;
  pause();
  clearInterval(syncTimer);
  window.removeEventListener("pagehide", saveOnExit);
  document.removeEventListener("visibilitychange", saveWhenHidden);
  eventBus.off("queue:updated", syncCurrent);
  audioEl.removeAttribute("src");
  audioEl.load();
  audioEl.remove();
  engine?._ctx?.close().catch(() => {});
  if (navigator.mediaSession) navigator.mediaSession.metadata = null;
  audioEl = engine = controller = null;
  selection++;
  Object.assign(state, { current: null, currentId: null, isPlaying: false, position: 0, duration: 0, queueNext: [], loading: false, error: null });
}
export function usePlayer() {
  return { state, setPlaylist, playTrack, playTrackList, addToQueue, playNext, togglePlay,
    play, pause, next, prev, playQueued, seek, setVolume, toggleMute, toggleShuffle, toggleRepeat,
    setRepeat, getFrequencyData, getController: () => controller };
}
