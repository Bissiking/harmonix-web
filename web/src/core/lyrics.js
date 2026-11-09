// LRC : plusieurs horodatages par vers et décalage global en millisecondes.
export function parseLyrics(raw = "", synced = false) {
  if (!synced) return raw.split(/\r?\n/).map((text) => ({ time: null, text: text.trim() })).filter((line) => line.text);
  const offset = Number(raw.match(/\[offset:([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  const lines = [];
  for (const row of raw.split(/\r?\n/)) {
    const stamps = [...row.matchAll(/\[(\d{1,3}):([0-5]\d)(?:[.:](\d{1,3}))?\]/g)];
    const text = row.replace(/\[[^\]]*\]/g, "").trim();
    for (const stamp of stamps) {
      const fraction = Number(`0.${stamp[3] || 0}`);
      lines.push({ time: Math.max(0, Number(stamp[1]) * 60 + Number(stamp[2]) + fraction + offset), text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function activeLyricIndex(lines, position) {
  let index = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time === null || lines[i].time > position) break;
    index = i;
  }
  return index;
}
