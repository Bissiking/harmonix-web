import { reactive } from "vue";

const THEME_KEY = "harmonix:v5:theme";

export const PRESETS = {
  "moon-resonance": { label: "Moon Resonance", gold: "#7b5cff", goldLight: "#c8b4ff", bgDark: "#0a0f2b", bgSurface: "#141a38", text: "#f4f2ff" },
  "nuit-doree": { label: "Nuit dorée", gold: "#f6c768", goldLight: "#ffe0a0", bgDark: "#06080f", bgSurface: "#0d1220", text: "#edf2ff" },
  default: { label: "Classique", gold: "#d4af37", goldLight: "#f0d479", bgDark: "#0a1628", bgSurface: "#12192b", text: "#ffffff" },
  "violet-dusk": { label: "Violet dusk", gold: "#a855f7", goldLight: "#d8b4fe", bgDark: "#0f0b1e", bgSurface: "#1a1133", text: "#f0e6ff" },
  "minuit-bleu": { label: "Minuit bleu", gold: "#3b82f6", goldLight: "#93c5fd", bgDark: "#060d1f", bgSurface: "#0d1b3e", text: "#e8f0ff" },
  "aube-rose": { label: "Aube rose", gold: "#f472b6", goldLight: "#fbcfe8", bgDark: "#1a0d14", bgSurface: "#2d1220", text: "#ffe8f4" },
  foret: { label: "Forêt", gold: "#22c55e", goldLight: "#86efac", bgDark: "#071510", bgSurface: "#0e241a", text: "#e8fff0" },
  cendre: { label: "Cendre", gold: "#a3a3a3", goldLight: "#d4d4d4", bgDark: "#111111", bgSurface: "#1e1e1e", text: "#f5f5f5" },
};

export const DEFAULT_THEME = PRESETS["moon-resonance"];

const state = reactive({
  preset: "moon-resonance",
  custom: false,
  colors: { ...DEFAULT_THEME },
});

function readStored() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored() {
  localStorage.setItem(THEME_KEY, JSON.stringify({ ...state.colors, preset: state.preset, custom: state.custom }));
}

function apply() {
  const c = state.colors;
  const root = document.documentElement;
  root.style.setProperty("--gold", c.gold);
  root.style.setProperty("--gold-light", c.goldLight);
  root.style.setProperty("--accent", c.gold);
  root.style.setProperty("--accent-light", c.goldLight);
  const actionBackground = mix("#0a0f2b", c.gold, 0.1);
  const whiteText = whiteContrast(actionBackground) >= 4.5;
  root.style.setProperty("--action-bg", actionBackground);
  root.style.setProperty("--action-text", whiteText ? "#ffffff" : "#000000");
  // Le survol augmente le contraste du texte choisi, quel que soit le preset.
  root.style.setProperty("--action-hover", mix(whiteText ? "#000000" : "#ffffff", actionBackground, 0.08));
  root.style.setProperty("--bg-dark", c.bgDark);
  root.style.setProperty("--bg-surface", c.bgSurface);
  root.style.setProperty("--bg-elevated", mix("#ffffff", c.bgSurface, 0.1));
  root.style.setProperty("--bg-hover", mix("#ffffff", c.bgSurface, 0.08));
  root.style.setProperty("--text", c.text);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", c.bgDark);
  writeStored();
}

function mix(a, b, ratio) {
  const pa = [a.slice(1, 3), a.slice(3, 5), a.slice(5, 7)].map((h) => parseInt(h, 16));
  const pb = [b.slice(1, 3), b.slice(3, 5), b.slice(5, 7)].map((h) => parseInt(h, 16));
  const out = pa.map((va, i) => Math.round(va * ratio + pb[i] * (1 - ratio)));
  return `#${out.map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0")).join("")}`;
}

function whiteContrast(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return 1.05 / (luminance + 0.05);
}

export function initTheme() {
  const stored = readStored();
  if (stored?.bgDark && !state.custom) {
    state.preset = stored.preset || "custom";
    state.custom = Boolean(stored.custom);
    state.colors = {
      gold: stored.gold || DEFAULT_THEME.gold,
      goldLight: stored.goldLight || stored.gold || DEFAULT_THEME.goldLight,
      bgDark: stored.bgDark || DEFAULT_THEME.bgDark,
      bgSurface: stored.bgSurface || DEFAULT_THEME.bgSurface,
      text: stored.text || DEFAULT_THEME.text,
    };
  }
  apply();
}

export function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  state.preset = name;
  state.custom = false;
  state.colors = { ...preset };
  apply();
}

export function applyCustom(colors) {
  state.preset = "custom";
  state.custom = true;
  state.colors = { ...state.colors, ...colors };
  apply();
}

export function resetTheme() {
  state.preset = "moon-resonance";
  state.custom = false;
  state.colors = { ...DEFAULT_THEME };
  apply();
}

export function useTheme() {
  return { state, applyPreset, applyCustom, resetTheme, PRESETS };
}
