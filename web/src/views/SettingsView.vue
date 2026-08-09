<template>
  <div class="hx-page">
    <h2 class="hx-section-title">Paramètres</h2>

    <section class="hx-settings-section">
      <h3 class="hx-settings-heading">Thème</h3>
      <div class="hx-theme-grid">
        <button
          v-for="(preset, key) in PRESETS"
          :key="key"
          class="hx-theme-swatch"
          :class="{ active: theme.state.preset === key && !theme.state.custom }"
          @click="theme.applyPreset(key)"
        >
          <span class="hx-theme-swatch-colors">
            <span v-for="c in [preset.bgSurface, preset.gold, preset.text]" :key="c" class="hx-theme-dot" :style="{ background: c }" />
          </span>
          <span class="hx-theme-swatch-label">{{ preset.label }}</span>
        </button>
      </div>

      <div class="hx-settings-row">
        <label for="hx-custom-gold">Couleur d'accent</label>
        <input id="hx-custom-gold" type="color" :value="theme.state.colors.gold" @input="onCustom('gold', $event.target.value)" />
      </div>
      <div class="hx-settings-row">
        <label for="hx-custom-bg">Fond</label>
        <input id="hx-custom-bg" type="color" :value="theme.state.colors.bgDark" @input="onCustom('bgDark', $event.target.value)" />
      </div>
      <button class="hx-btn" @click="theme.resetTheme()">Réinitialiser le thème</button>
    </section>

    <section class="hx-settings-section">
      <h3 class="hx-settings-heading">Lecture</h3>
      <div class="hx-settings-row">
        <label for="hx-shuffle">Aléatoire</label>
        <input id="hx-shuffle" type="checkbox" :checked="player.state.shuffle" @change="player.toggleShuffle()" />
      </div>
      <div class="hx-settings-row">
        <label for="hx-repeat">Répétition</label>
        <select :value="player.state.repeat" @change="player.setRepeat($event.target.value)">
          <option value="none">Aucune</option>
          <option value="all">Toute la liste</option>
          <option value="one">Morceau unique</option>
        </select>
      </div>
    </section>

    <section class="hx-settings-section" v-if="session.state.authenticated">
      <h3 class="hx-settings-heading">Compte</h3>
      <div class="hx-settings-row">
        <span>Connecté en tant que <strong>{{ session.state.user?.username || session.state.user?.email || '—' }}</strong></span>
      </div>
      <div v-if="session.state.isAdmin" class="hx-settings-row"><span class="hx-badge-admin">Administrateur</span></div>
      <button class="hx-btn" @click="logout">Se déconnecter</button>
    </section>
  </div>
</template>

<script setup>
import { useSession, logout } from "../stores/session.js";
import { useTheme, PRESETS } from "../stores/theme.js";
import { usePlayer } from "../stores/player.js";

const session = useSession();
const theme = useTheme();
const player = usePlayer();

function onCustom(key, value) {
  theme.applyCustom({ [key]: value });
}
</script>
