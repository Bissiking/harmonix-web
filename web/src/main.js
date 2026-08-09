import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router.js";
import { initTheme } from "./stores/theme.js";
import "./assets/css/main.css";

initTheme();

createApp(App).use(router).mount("#app");
