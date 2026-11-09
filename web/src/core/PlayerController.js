// PlayerController — gestion de file, shuffle, répétition, file personnalisée.
// Adapté de la logique Harmonix 2.x pour la V3.

import { buildShuffledOrder } from "./shuffle.js";
import { eventBus } from "./EventBus.js";

export class PlayerController {
  constructor({ engine, getSrc }) {
    if (!engine) throw new Error("PlayerController requires an engine");
    if (typeof getSrc !== "function") throw new Error("PlayerController requires getSrc(track)");

    this.engine = engine;
    this.getSrc = getSrc;

    this.playlist = [];
    this.order = [];
    this.orderIndex = 0;
    this.shuffle = false;
    this.repeat = "none"; // none | all | one

    this.customNext = [];
    this._customTrack = null;
  }

  // ── Playlist ──────────────────────────────────────────────

  setPlaylist(list, { keepTrackId = null, seed, preserveCustomTrack = false } = {}) {
    this.playlist = Array.isArray(list) ? list : [];
    const keepIndex = keepTrackId ? this.playlist.findIndex((t) => String(t.id) === String(keepTrackId)) : -1;
    this.order = this.shuffle
      ? buildShuffledOrder(this.playlist.length, { keepIndex: keepIndex >= 0 ? keepIndex : null, seed })
      : Array.from({ length: this.playlist.length }, (_, i) => i);

    if (keepIndex >= 0) {
      const keepOrderIndex = this.order.findIndex((i) => i === keepIndex);
      this.orderIndex = keepOrderIndex >= 0 ? keepOrderIndex : 0;
    } else {
      this.orderIndex = Math.min(this.orderIndex, Math.max(0, this.order.length - 1));
    }
    if (!preserveCustomTrack) this._customTrack = null;
    eventBus.emit("queue:updated", this.getQueueState());
  }

  // ── Getters ───────────────────────────────────────────────

  get current() {
    if (this._customTrack) return this._customTrack;
    const idx = this.order[this.orderIndex];
    return idx === undefined ? null : this.playlist[idx] || null;
  }

  get currentId() { return this.current?.id ?? null; }

  peekNext(count = 8) {
    const result = [];
    for (let i = 0; i < Math.min(count, this.customNext.length); i++) {
      result.push({ ...this.customNext[i], _fromCustomQueue: true });
    }
    if (result.length < count && this.playlist.length > 0) {
      let nextOrderIndex = this.orderIndex + 1;
      while (result.length < count) {
        if (nextOrderIndex >= this.order.length) {
          if (this.repeat === "all") nextOrderIndex = 0;
          else break;
        }
        const track = this.playlist[this.order[nextOrderIndex]];
        if (track) result.push(track);
        nextOrderIndex++;
      }
    }
    return result;
  }

  getQueueState() {
    return {
      current: this.current,
      next: this.peekNext(12),
      customNext: [...this.customNext],
      totalPlaylist: this.playlist.length,
      orderIndex: this.orderIndex,
      shuffle: this.shuffle,
      repeat: this.repeat,
    };
  }

  // ── File personnalisée ────────────────────────────────────

  addToQueue(track) {
    if (!track) return;
    this.customNext.push(track);
    eventBus.emit("queue:updated", this.getQueueState());
  }

  playNext(track) {
    if (!track) return;
    this.customNext.unshift(track);
    eventBus.emit("queue:updated", this.getQueueState());
  }

  removeFromCustomQueue(index) {
    this.customNext.splice(index, 1);
    eventBus.emit("queue:updated", this.getQueueState());
  }

  clearCustomQueue() {
    this.customNext = [];
    eventBus.emit("queue:updated", this.getQueueState());
  }

  // ── Modes ─────────────────────────────────────────────────

  setShuffle(enabled, { keepTrackId = null, seed } = {}) {
    const next = Boolean(enabled);
    if (this.shuffle === next) return;
    // Un ajout manuel a sa propre piste active ; remélanger uniquement la liste
    // de fond tout en gardant son point de reprise et le même flux audio.
    const anchorId = this._customTrack
      ? this.playlist[this.order[this.orderIndex]]?.id
      : this.currentId;
    this.shuffle = next;
    this.setPlaylist(this.playlist, { keepTrackId: keepTrackId ?? anchorId, seed, preserveCustomTrack: true });
  }

  setRepeat(mode) {
    const m = String(mode || "none");
    if (!["none", "all", "one"].includes(m)) return;
    this.repeat = m;
    eventBus.emit("queue:updated", this.getQueueState());
  }

  // ── Sélection ─────────────────────────────────────────────

  selectByTrackId(trackId) {
    if (!trackId) return false;
    const id = String(trackId);
    this._customTrack = null;
    let orderPos = this.order.findIndex((i) => String(this.playlist?.[i]?.id) === id);
    if (orderPos < 0) {
      this.setPlaylist(this.playlist, { keepTrackId: id });
      orderPos = this.order.findIndex((i) => String(this.playlist?.[i]?.id) === id);
    }
    if (orderPos < 0) return false;
    this.orderIndex = orderPos;
    return true;
  }

  // ── Lecture ───────────────────────────────────────────────

  async loadCurrent({ autoPlay = false } = {}) {
    const track = this.current;
    if (!track) return null;
    this.engine.load(this.getSrc(track));
    if (autoPlay) {
      await this.engine.unlock();
      await this.engine.play();
    }
    return track;
  }

  async loadByPlaylistIndex(index, { autoPlay = false } = {}) {
    const i = Number(index);
    const track = Number.isFinite(i) ? this.playlist[i] : null;
    if (!track) return null;
    this._customTrack = null;
    this.selectByTrackId(track.id);
    eventBus.emit("queue:updated", this.getQueueState());
    return this.loadCurrent({ autoPlay });
  }

  async next() {
    if (!this.playlist.length) return null;
    this._customTrack = null;

    if (this.customNext.length > 0) {
      const track = this.customNext.shift();
      this._customTrack = track;
      eventBus.emit("queue:updated", this.getQueueState());
      await this.engine.unlock();
      this.engine.load(this.getSrc(track));
      await this.engine.play();
      return track;
    }

    this.orderIndex += 1;
    if (this.orderIndex >= this.order.length) {
      if (this.repeat === "all") this.orderIndex = 0;
      else {
        this.orderIndex = this.order.length - 1;
        eventBus.emit("queue:updated", this.getQueueState());
        return null;
      }
    }

    eventBus.emit("queue:updated", this.getQueueState());
    return this.loadCurrent({ autoPlay: true });
  }

  async prev() {
    if (!this.playlist.length) return null;

    if (this.engine.currentTime > 3) {
      this.engine.seek(0);
      return this.current;
    }

    this._customTrack = null;
    this.orderIndex = Math.max(0, this.orderIndex - 1);
    eventBus.emit("queue:updated", this.getQueueState());
    return this.loadCurrent({ autoPlay: true });
  }

  async handleEnded() {
    if (this.repeat === "one" && this.current) {
      this.engine.seek(0);
      await this.engine.play();
      return this.current;
    }
    return this.next();
  }

  async playQueued(index) {
    const selected = this.peekNext(index + 1)[index];
    if (!selected) return null;
    if (index < this.customNext.length) {
      this._customTrack = this.customNext.splice(0, index + 1).at(-1);
    } else {
      const offset = index - this.customNext.length + 1;
      this.customNext = [];
      this._customTrack = null;
      this.orderIndex = (this.orderIndex + offset) % this.order.length;
    }
    eventBus.emit("queue:updated", this.getQueueState());
    return this.loadCurrent({ autoPlay: true });
  }

  getActiveList() {
    return this.order.map((i) => this.playlist[i]).filter(Boolean);
  }
}
