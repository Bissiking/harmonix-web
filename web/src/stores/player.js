import { reactive, readonly } from "vue";
import { AudioEngine } from "../core/AudioEngine.js";
import { PlayerController } from "../core/PlayerController.js";
import { streamUrl } from "../api/client.js";
import { api } from "../api/client.js";
import { eventBus } from "../core/EventBus.js";

const state = reactive({
  current: null,
  currentId: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 1,
  muted: false,
  shuffle: false,
  repeat: "none", // none | all | one
  queueNext: [],
  totalPlaylist: 0,
  loading: false,
  error: null,
  hasStarted: false,
});

let engine = null;
let controller = null;
let audioEl = null;
let syncTimer = null;
let lastSavedPosition = -1;
let lastSyncState = "";

function persistState() {
  if (!state.currentId) return;
  const signature = JSON.stringify({
    id: state.currentId,
    positionMs: Math.floor(state.position * 1000),
    volume: state.volume,
    shuffle: state.shuffle,
    repeat: state.repeat,
    isPlaying: state.isPlaying,
  });
  if (signature === lastSyncState) return;
  lastSyncState = signature;
  api
    .put("/api/playback/state", {
      trackId: state.currentId,
      positionMs: Math.floor(state.position * 1000),
      volume: state.volume,
      shuffle: state.shuffle,
      repeat: state.repeat,
      isPlaying: state.isPlaying,
    })
    .catch(() => {});
}

function syncLoop() {
  if (syncTimer) return;
  syncTimer = setInterval(() => {
    if (state.currentId && Math.abs(state.position - lastSavedPosition) > 4) {
      lastSavedPosition = state.position;
      persistState();
    }
  }, 10000);
}

export function initPlayer(rootEl) {
  if (audioEl) return;
  audioEl = document.createElement("audio");
  audioEl.preload = "none";
  audioEl.crossOrigin = "anonymous";
  audioEl.id = "hx-audio";
  rootEl.appendChild(audioEl);

  engine = new AudioEngine(audioEl);
  controller = new PlayerController({
    engine,
    getSrc: (track) => streamUrl(track.id),
  });

  engine.on("timeupdate", () => {
    state.position = engine.currentTime;
    state.duration = engine.duration || state.duration;
  });
  engine.on("durationchange", () => {
    state.duration = engine.duration || 0;
  });
  engine.on("play", () => {
    state.isPlaying = true;
    persistState();
  });
  engine.on("pause", () => {
    state.isPlaying = false;
    persistState();
  });
  engine.on("ended", () => {
    controller.handleEnded().then((track) => {
      if (track) syncCurrent();
      else {
        state.isPlaying = false;
        state.position = state.duration || 0;
        persistState();
      }
    });
  });
  engine.on("loadedmetadata", () => {
    state.duration = engine.duration || 0;
  });
  engine.on("error", () => {
    state.error = "Erreur de lecture audio";
    state.isPlaying = false;
  });

  eventBus.on("queue:updated", (queueState) => {
    state.current = controller.current;
    state.currentId = controller.currentId;
    state.queueNext = queueState.next;
    state.totalPlaylist = queueState.totalPlaylist;
    state.shuffle = queueState.shuffle;
    state.repeat = queueState.repeat;
    syncCurrent();
  });

  eventBus.on("favorites:toggled", persistState);

  state.volume = Number(localStorage.getItem("harmonix:volume") ?? "1");
  state.muted = localStorage.getItem("harmonix:muted") === "1";
  state.shuffle = localStorage.getItem("harmonix:shuffle") === "1";
  state.repeat = localStorage.getItem("harmonix:repeat") || "none";
  engine.setVolume(state.volume);
  engine.setMuted(state.muted);
  controller.shuffle = state.shuffle;
  controller.repeat = state.repeat;

  // Reprise de session
  api
    .get("/api/playback/resume-active", { timeout: 8000 })
    .then((data) => {
      const resume = data?.resume;
      if (!resume?.track) return;
      controller.setPlaylist([resume.track], { keepTrackId: resume.track.id });
      if (resume.positionMs > 1) engine.seek(resume.positionMs / 1000);
      if (resume.wasPlaying) play().catch(() => {});
    })
    .catch(() => {});

  syncLoop();
  window.addEventListener("beforeunload", persistState);
  window.addEventListener("pagehide", persistState);
}

function syncCurrent() {
  const track = controller.current;
  if (!track) {
    state.current = null;
    state.currentId = null;
    state.duration = 0;
    return;
  }
  state.current = track;
  state.currentId = track.id;
  state.duration = track.duration || state.duration;
  eventBus.emit("track:changed", track);
}

function getTrackContext(track, sourceTracks) {
  return sourceTracks || [track];
}

export function setPlaylist(tracks, { playIndex = 0, autoPlay = true, keepTrackId = null } = {}) {
  const list = Array.isArray(tracks) ? tracks : [];
  if (!list.length) return;
  controller.setPlaylist(list, { keepTrackId });
  const targetIndex = playIndex >= 0 ? playIndex : 0;
  state.loading = true;
  state.error = null;
  controller
    .loadByPlaylistIndex(targetIndex, { autoPlay })
    .then(() => {
      state.loading = false;
      if (autoPlay) return engine.unlock().then(() => engine.play()).catch(() => {});
    })
    .catch(() => {
      state.loading = false;
      state.error = "Lecture impossible";
    });
}

export function playTrack(track, sourceTracks = [track]) {
  setPlaylist(getTrackContext(track, sourceTracks), { keepTrackId: track.id, autoPlay: true });
}

export function playTrackList(list, index = 0) {
  setPlaylist(list, { playIndex: index, autoPlay: true });
}

export function addToQueue(track) {
  controller.addToQueue(track);
}

export function playNext(track) {
  controller.playNext(track);
}

export async function togglePlay() {
  if (!controller.current) return;
  await engine.unlock();
  if (engine.paused) {
    await engine.play();
  } else {
    engine.pause();
  }
}

export async function play() {
  if (!controller.current) return;
  await engine.unlock();
  await engine.play();
}

export function pause() {
  engine?.pause();
}

export async function next() {
  const track = await controller.next();
  if (track) {
    eventBus.emit("track:changed", track);
    return track;
  }
  return null;
}

export async function prev() {
  return controller.prev();
}

export function seek(time) {
  if (!engine) return;
  engine.seek(Math.max(0, Math.min(time, state.duration || time)));
  state.position = time;
  persistState();
}

export function setVolume(value) {
  const v = Math.max(0, Math.min(1, value));
  state.volume = v;
  engine?.setVolume(v);
  localStorage.setItem("harmonix:volume", String(v));
  persistState();
}

export function toggleMute() {
  state.muted = !state.muted;
  engine?.setMuted(state.muted);
  localStorage.setItem("harmonix:muted", state.muted ? "1" : "0");
}

export function toggleShuffle() {
  const next = !state.shuffle;
  state.shuffle = next;
  controller.setShuffle(next);
  localStorage.setItem("harmonix:shuffle", next ? "1" : "0");
  persistState();
}

export function toggleRepeat() {
  const order = ["none", "all", "one"];
  const idx = order.indexOf(state.repeat);
  const next = order[(idx + 1) % order.length];
  state.repeat = next;
  controller.setRepeat(next);
  localStorage.setItem("harmonix:repeat", next);
  persistState();
}

export function setRepeat(mode) {
  state.repeat = mode;
  controller.setRepeat(mode);
  localStorage.setItem("harmonix:repeat", mode);
  persistState();
}

export function getFrequencyData() {
  return engine?.getFrequencyData() || null;
}

export function getPlayerState() {
  return readonly(state);
}

export function usePlayer() {
  return {
    state,
    setPlaylist,
    playTrack,
    playTrackList,
    addToQueue,
    playNext,
    togglePlay,
    play,
    pause,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setRepeat,
    getFrequencyData,
    getController: () => controller,
  };
}
