import type { SongEntry } from "../types/karaoke";

export function pickNextPlayerId(opts: {
  entries: SongEntry[];
  lastSingerId: string | null;
}): string | null {
  const { entries, lastSingerId } = opts;

  const remainingByPlayer = new Map<string, number>();
  for (const e of entries) {
    if (e.status !== "queued") continue;
    remainingByPlayer.set(e.playerId, (remainingByPlayer.get(e.playerId) ?? 0) + 1);
  }

  const eligible = Array.from(remainingByPlayer.entries())
    .filter(([playerId, count]) => count > 0 && playerId !== lastSingerId);

  if (!eligible.length) {
    // If the only remaining singer is the last one, allow it (fallback)
    const fallback = Array.from(remainingByPlayer.entries()).filter(([, c]) => c > 0);
    if (!fallback.length) return null;
    return weightedPick(fallback);
  }

  return weightedPick(eligible);

  function weightedPick(pairs: Array<[string, number]>) {
    // Weight: 1 + remainingCount (so players with more songs get slightly more weight)
    const weights = pairs.map(([id, count]) => [id, 1 + count] as const);
    const total = weights.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [id, w] of weights) {
      r -= w;
      if (r <= 0) return id;
    }
    return weights[weights.length - 1][0];
  }
}

export function pickNextEntryForPlayer(entries: SongEntry[], playerId: string): SongEntry | null {
  // FIFO: earliest queued song for that player
  const queued = entries
    .filter(e => e.status === "queued" && e.playerId === playerId)
    .sort((a, b) => a.createdAt - b.createdAt);
  return queued[0] ?? null;
}
