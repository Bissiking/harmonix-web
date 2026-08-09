<template>
  <div class="hx-toast-container" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="item in items" :key="item.id" class="hx-toast" :class="`hx-toast--${item.type}`" @click="$emit('dismiss', item.id)">
        <svg v-if="item.icon === 'heart'" viewBox="0 0 24 24" class="hx-ico"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
        <svg v-else-if="item.icon === 'alert'" viewBox="0 0 24 24" class="hx-ico"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
        <svg v-else viewBox="0 0 24 24" class="hx-ico"><path d="M20 6 9 17l-5-5" /></svg>
        <span>{{ item.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, default: () => [] } });
defineEmits(["dismiss"]);
</script>
