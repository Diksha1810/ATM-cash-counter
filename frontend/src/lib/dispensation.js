export function findDispensation(requested, denominations) {
  if (!Number.isInteger(requested) || requested <= 0) return null;

  const states = new Map([[0, []]]);
  for (const { denomination, quantity } of denominations) {
    const snapshot = [...states.entries()];
    for (const [amount, notes] of snapshot) {
      for (let count = 1; count <= quantity; count += 1) {
        const nextAmount = amount + denomination * count;
        if (nextAmount > requested || states.has(nextAmount)) continue;
        states.set(nextAmount, [...notes, { denomination, quantity: count }]);
      }
    }
  }

  return states.get(requested) || null;
}

export function applyDispensation(inventory, notes) {
  const used = new Map(notes.map((note) => [note.denomination, note.quantity]));
  const denominations = inventory.denominations.map((note) => ({
    ...note,
    quantity: note.quantity - (used.get(note.denomination) || 0),
    value: note.denomination * (note.quantity - (used.get(note.denomination) || 0)),
  }));

  return {
    ...inventory,
    denominations,
    totalNotes: denominations.reduce((total, note) => total + note.quantity, 0),
    balance: denominations.reduce((total, note) => total + note.value, 0),
  };
}
