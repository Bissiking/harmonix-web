<template><svg viewBox="0 0 24 24" class="hx-ico" aria-hidden="true"><path :d="paths[name] || paths.library" /></svg></template>
<script setup>
defineProps({ name: { type: String, default: "library" } });
const paths = {
  library: 'M4 4h4v16H4zM11 4h4v16h-4zM18 4l3 1v15l-3-1z',
  search: 'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0m-2 6 6 6',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
  playlist: 'M3 6h13M3 11h13M3 16h8M17 14v8m-4-4h8',
  disc: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0m-7 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  queue: 'M3 5h18M3 11h14M3 17h9m4-2 6 4-6 4z',
  settings: 'M4 3v7m0 4v7M12 3v3m0 4v11M20 3v11m0 4v3M1 10h6m2-4h6m2 8h6',
  rift: 'M4 9v6M8 5v14M12 2v20M16 5v14M20 9v6',
  close: 'm6 6 12 12M18 6 6 18', play: 'm8 5 11 7-11 7z', pause: 'M8 5v14M16 5v14',
  prev: 'M5 5v14M19 5 7 12l12 7z', next: 'M19 5v14M5 5l12 7-12 7z',
  volume: 'M11 5 6 9H2v6h4l5 4zM15 8a6 6 0 0 1 0 8m4-11a10 10 0 0 1 0 14',
  muted: 'M11 5 6 9H2v6h4l5 4zM16 9l6 6m0-6-6 6',
  shuffle: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  repeat: 'm17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 12 5-5-5-5m5 5H9',
  menu: 'M3 6h18M3 12h18M3 18h18', expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
};
</script>
