import { reactive } from "vue";

let nextId = 1;

const state = reactive({
  items: [],
});

export function toast(message, { type = "info", icon = "check", duration = 2600 } = {}) {
  const id = nextId++;
  state.items.push({ id, message, type, icon });
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
  return id;
}

export function dismiss(id) {
  const idx = state.items.findIndex((item) => item.id === id);
  if (idx >= 0) state.items.splice(idx, 1);
}

export function useToasts() {
  return { state, toast, dismiss };
}
