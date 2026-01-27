import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../data/players";
import { NeonButton } from "./NeonButton";

export function AddSongForm(props: {
  players: Player[];
  onAdd: (playerIds: string[], query: string) => Promise<void>;
}) {
  const { players, onAdd } = props;
  const [playerIds, setPlayerIds] = useState<string[]>(
    players[0]?.id ? [players[0].id] : []
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const canSubmit = useMemo(
    () => playerIds.length > 0 && query.trim().length >= 2 && !busy,
    [playerIds, query, busy]
  );
  const selectedPlayers = useMemo(
    () => players.filter((player) => playerIds.includes(player.id)),
    [players, playerIds]
  );

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function togglePlayer(playerId: string) {
    setPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setBusy(true);
        try {
          await onAdd(playerIds, query.trim());
          setQuery("");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <div className="text-xs text-white/60">Players</div>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-left text-sm"
            >
              <span className="text-white/80">
                {selectedPlayers.length
                  ? selectedPlayers.map((player) => player.name).join(", ")
                  : "Select singers"}
              </span>
              <span className="text-xs text-white/50">
                {selectedPlayers.length ? `${selectedPlayers.length} selected` : "Pick"}
              </span>
            </button>
            {menuOpen ? (
              <div className="absolute z-10 w-full rounded-2xl border border-white/10 bg-[#0b0b15]/95 p-2 shadow-xl">
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {players.map((player) => {
                    const isChecked = playerIds.includes(player.id);
                    return (
                      <label
                        key={player.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePlayer(player.id)}
                          className="h-4 w-4 accent-[#13dcf6]"
                        />
                        <img
                          src={player.photoUrl}
                          alt={`${player.name} avatar`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">
                            {player.name}
                          </div>
                          <div className="text-xs text-white/50">
                            {player.nickname}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
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
