// Générateur d'ordre aléatoire stable pour le mode shuffle.
export function buildShuffledOrder(length, { keepIndex = null, seed = Date.now() } = {}) {
  if (length <= 0) return [];
  const order = Array.from({ length }, (_, i) => i);
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (keepIndex !== null && keepIndex >= 0 && keepIndex < length) {
    const pos = order.indexOf(keepIndex);
    if (pos >= 0) {
      order.splice(pos, 1);
      order.unshift(keepIndex);
    }
  }
  return order;
}
