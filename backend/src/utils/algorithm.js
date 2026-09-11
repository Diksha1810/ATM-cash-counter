/**
 * Bounded DP. The state key is amount + bitmask, which lets us explicitly
 * prefer solutions using more denominations. For each state we retain the
 * best candidate according to: distinct denominations desc, note count asc,
 * depletion penalty asc.
 */
function findDispensation(requested, denominations) {
  if (!Number.isInteger(requested) || requested <= 0) return null;
  const total = denominations.reduce((s, d) => s + d.denomination * d.quantity, 0);
  if (requested > total) return null;

  const max = total;
  const states = Array.from({ length: max + 1 }, () => new Map());
  states[0].set(0, { mask: 0, notes: 0, penalty: 0, counts: {} });

  for (let i = 0; i < denominations.length; i++) {
    const { denomination, quantity } = denominations[i];
    const snapshot = states.map((m) => Array.from(m.entries()));

    for (let amount = 0; amount <= max; amount++) {
      for (const [, base] of snapshot[amount]) {
        for (let n = 1; n <= quantity && amount + n * denomination <= max; n++) {
          const nextAmount = amount + n * denomination;
          const counts = { ...base.counts, [denomination]: n };
          const candidate = {
            mask: base.mask | (1 << i),
            notes: base.notes + n,
            penalty: base.penalty + (n / Math.max(1, quantity)) ** 2,
            counts,
          };
          const key = candidate.mask;
          const old = states[nextAmount].get(key);
          if (!old || better(candidate, old)) {
            states[nextAmount].set(key, candidate);
          }
        }
      }
    }
  }

  let best = null;
  for (const candidate of states[requested].values()) {
    if (!best || better(candidate, best)) best = candidate;
  }
  if (!best) return null;

  return denominations
    .map((d) => ({
      denomination: d.denomination,
      quantity: best.counts[d.denomination] || 0,
    }))
    .filter((x) => x.quantity > 0);
}

function better(a, b) {
  const ad = popcount(a.mask);
  const bd = popcount(b.mask);
  if (ad !== bd) return ad > bd;
  if (a.notes !== b.notes) return a.notes < b.notes;
  return a.penalty < b.penalty;
}

function popcount(n) {
  let c = 0;
  while (n) {
    c += n & 1;
    n >>= 1;
  }
  return c;
}

module.exports = { findDispensation };
