<template>
  <main class="hx-login">
    <div class="hx-login-art"><img src="/branding/Icon-512.png" alt="" /><h1>Harmonix</h1><p>La musique vous accompagne.</p><span>Web V5 · Moon Resonance</span></div>
    <section class="hx-login-card" aria-labelledby="login-title">
      <img class="hx-login-logo" src="/branding/Icon-192.png" alt="" />
      <h2 id="login-title">Retrouvez votre musique.</h2>
      <p>Votre bibliothèque Sonora, vos favoris et vos playlists, réunis dans votre navigateur.</p>
      <p v-if="errorMessage || session.state.error" class="hx-login-error" role="alert">{{ errorMessage || session.state.error }}</p>
      <button v-if="availability === 'available'" class="hx-btn hx-btn-primary hx-btn-lg" :disabled="loading" @click="startLogin">{{ loading ? 'Ouverture de Kyros…' : 'Se connecter avec Kyros' }}</button>
      <p v-else-if="availability === 'loading'" role="status">Vérification de la connexion…</p>
      <template v-else><p role="status">{{ availabilityMessage }}</p><button class="hx-btn" @click="loadConfig">Réessayer</button></template>
      <p class="hx-login-note">Votre compte reste géré par Kyros.</p>
    </section>
  </main>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "../api/client.js";
import { loginAvailability } from "../api/auth.js";
import { useSession } from "../stores/session.js";
const session = useSession(), loading = ref(false), availability = ref('loading'), errorMessage = ref("");
const availabilityMessage = computed(() => ({
  unconfigured: 'La connexion Kyros n’est pas configurée dans Sonora.',
  unreachable: 'Impossible de joindre Sonora pour vérifier la connexion. Réessayez dans un instant.',
  incompatible: 'Sonora n’a pas fourni d’informations de connexion reconnues. Vérifiez sa version et réessayez.',
}[availability.value] || ''));
async function loadConfig() {
  availability.value = 'loading';
  try { availability.value = loginAvailability(await api.get('/auth/config')); }
  catch { availability.value = 'unreachable'; }
}
onMounted(() => {
  loadConfig();
  const query = new URLSearchParams(location.search);
  if (query.get('error') || query.get('sso_error')) errorMessage.value = 'La connexion n’a pas abouti. Vous pouvez réessayer.';
  if (session.state.authenticated) location.href = '/';
});
function startLogin() { loading.value = true; session.login(); }
</script>
