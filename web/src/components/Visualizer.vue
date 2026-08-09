<template>
  <div class="hx-visualizer" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { usePlayer } from "../stores/player.js";

const player = usePlayer();
const canvas = ref(null);
let raf = null;

function draw() {
  const ctx = canvas.value?.getContext("2d");
  if (!ctx) return;
  const data = player.getFrequencyData();
  const w = canvas.value.width;
  const h = canvas.value.height;
  ctx.clearRect(0, 0, w, h);
  const bars = 12;
  const gap = 2;
  const bw = (w - gap * (bars - 1)) / bars;
  for (let i = 0; i < bars; i++) {
    const value = data ? data[Math.floor((i / bars) * data.length)] / 255 : 0.08;
    const bh = Math.max(2, value * h);
    const x = i * (bw + gap);
    const y = h - bh;
    const gradient = ctx.createLinearGradient(0, y, 0, h);
    gradient.addColorStop(0, "var(--gold-light)");
    gradient.addColorStop(1, "var(--gold)");
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, bw / 2);
    ctx.fill();
  }
  raf = requestAnimationFrame(draw);
}

function resize() {
  const rect = canvas.value?.getBoundingClientRect();
  if (!rect || !canvas.value) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.value.width = Math.round(rect.width * dpr);
  canvas.value.height = Math.round(rect.height * dpr);
  canvas.value.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
}

onMounted(() => {
  resize();
  draw();
  window.addEventListener("resize", resize);
});
onUnmounted(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);
});
</script>
