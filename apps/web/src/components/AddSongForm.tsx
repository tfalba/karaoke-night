import { useMemo, useState } from "react";
import type { Player } from "../data/players";
import { NeonButton } from "./NeonButton";

export function AddSongForm(props: {
  players: Player[];
  onAdd: (playerId: string, query: string) => Promise<void>;
}) {
  const { players, onAdd } = props;
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => !!playerId && query.trim().length >= 2 && !busy, [
    playerId,
    query,
    busy,
  ]);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setBusy(true);
        try {
          await onAdd(playerId, query.trim());
          setQuery("");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <div className="text-xs text-white/60">Player</div>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
          >
            {players.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.nickname}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-xs text-white/60">Song</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g., "Dancing Queen"'
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
          />
        </label>
      </div>

      <NeonButton type="submit" disabled={!canSubmit}>
        {busy ? "Searching…" : "Add to queue"}
      </NeonButton>
    </form>
  );
}
