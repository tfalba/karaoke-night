import type { Player } from "../data/players";
import type { SongEntry } from "../types/karaoke";

export function QueueList(props: { players: Player[]; entries: SongEntry[] }) {
  const { players, entries } = props;

  const playerById = new Map(players.map(p => [p.id, p]));
  const queued = entries
    .filter(e => e.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="space-y-2">
      {queued.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          No songs queued yet.
        </div>
      ) : (
        queued.map(e => {
          const p = playerById.get(e.playerId);
          return (
            <div
              key={e.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {p?.name ?? e.playerId}{" "}
                    <span className="text-white/60">— {p?.nickname ?? ""}</span>
                  </div>
                  <div className="truncate text-sm text-white/70">
                    {e.youtube?.title ?? e.query}
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  {e.youtube?.viewCount ? `${e.youtube.viewCount.toLocaleString()} views` : ""}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
