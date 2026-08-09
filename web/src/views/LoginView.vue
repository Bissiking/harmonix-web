<template>
  <div class="hx-login">
    <div class="hx-login-card">
      <div class="hx-login-brand">
        <span class="hx-brand-logo hx-brand-logo--lg">
          <svg viewBox="0 0 32 32" class="hx-ico"><path d="M10 24V12l14-3v11" /><circle cx="10" cy="24" r="2.4" fill="currentColor" stroke="none" /><circle cx="24" cy="20" r="2.4" fill="currentColor" stroke="none" /></svg>
        </span>
        <h1>Harmonix</h1>
        <p class="hx-login-sub">Musiques Suno &amp; ChatGPT, propulsé par Sonora</p>
      </div>

      <p v-if="errorMessage" class="hx-login-error">{{ errorMessage }}</p>

      <button v-if="hasClientId" class="hx-btn hx-btn-primary hx-btn-lg" :disabled="loading" @click="startLogin">
        <svg v-if="loading" viewBox="0 0 24 24" class="hx-ico hx-spin"><path d="M12 2a10 10 0 1 0 10 10" /></svg>
        <svg v-else viewBox="0 0 24 24" class="hx-ico"><path d="M12 3v3M5.6 5.6l2.2 2.2M3 12h3M5.6 18.4l2.2-2.2M12 18v3M18.4 18.4l-2.2-2.2M18 12h3" /><circle cx="12" cy="12" r="2.6" /></svg>
        <span>Se connecter avec Kyros</span>
      </button>
      <p v-else class="hx-login-sub">Connexion indisponible (Kyros non configuré).</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../api/client.js";
import { useSession } from "../stores/session.js";

const session = useSession();
const loading = ref(false);
const hasClientId = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  try {
    const config = await api.get("/auth/config");
    hasClientId.value = Boolean(config?.hasClientId);
  } catch {
    hasClientId.value = false;
  }
  const q = new URLSearchParams(location.search);
  if (q.get("error")) {
    errorMessage.value = `Connexion refusée (${q.get("error")}). Réessaie.`;
  }
  if (session.state.authenticated) {
    location.href = "/";
  }
});

function startLogin() {
  loading.value = true;
  location.href = "/auth/login";
}
</script>
