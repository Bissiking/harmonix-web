// AudioEngine — élément HTML5 audio + Web Audio API (analyser pour le visualizer).

export class AudioEngine {
  constructor(audioEl) {
    if (!audioEl) throw new Error("AudioEngine requires an <audio> element");
    this.audio = audioEl;
    this._ctx = null;
    this._analyser = null;
    this._gain = null;
    this._source = null;
    this._freqData = null;
    this._webAudioReady = false;
  }

  _initWebAudio() {
    if (this._webAudioReady) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._source = this._ctx.createMediaElementSource(this.audio);
      this._analyser = this._ctx.createAnalyser();
      this._analyser.fftSize = 128;
      this._analyser.smoothingTimeConstant = 0.82;
      this._gain = this._ctx.createGain();
      this._source.connect(this._analyser);
      this._analyser.connect(this._gain);
      this._gain.connect(this._ctx.destination);
      this._freqData = new Uint8Array(this._analyser.frequencyBinCount);
      this._webAudioReady = true;
    } catch {
      // Web Audio indisponible → lecture plain audio
    }
  }

  async unlock() {
    this._initWebAudio();
    if (this._ctx?.state === "suspended") {
      try { await this._ctx.resume(); } catch { /* noop */ }
    }
  }

  load(src) {
    this.audio.src = src;
    this.audio.load();
  }

  async play() {
    this._initWebAudio();
    if (this._ctx?.state === "suspended") {
      try { await this._ctx.resume(); } catch { /* noop */ }
    }
    return this.audio.play();
  }

  pause() { this.audio.pause(); }
  seek(time) { this.audio.currentTime = time; }
  setVolume(v) { this.audio.volume = Math.max(0, Math.min(1, v)); }
  setMuted(muted) { this.audio.muted = Boolean(muted); }

  getFrequencyData() {
    if (!this._analyser || !this._freqData) return null;
    this._analyser.getByteFrequencyData(this._freqData);
    return this._freqData;
  }

  on(event, cb, opts) { this.audio.addEventListener(event, cb, opts); }
  off(event, cb, opts) { this.audio.removeEventListener(event, cb, opts); }

  get duration() { return this.audio.duration || 0; }
  get currentTime() { return this.audio.currentTime || 0; }
  get paused() { return this.audio.paused; }
  get volume() { return this.audio.volume; }
  get muted() { return this.audio.muted; }
}
