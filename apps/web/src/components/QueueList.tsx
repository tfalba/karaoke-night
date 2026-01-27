import type { Player } from "../data/players";
import type { SongEntry } from "../types/karaoke";
import groupAvatar from "../assets/avatars/avatar-group.png";

export function QueueList(props: {
  players: Player[];
  entries: SongEntry[];
  forcedNextId: string | null;
  onRemove: (entryId: string) => void;
  onMakeNext: (entryId: string) => void;
}) {
  const { players, entries, forcedNextId, onRemove, onMakeNext } = props;

  const playerById = new Map(players.map(p => [p.id, p]));
  const queued = entries
    .filter(e => e.status === "queued")
    .sort((a, b) => {
      if (forcedNextId) {
        const aForced = a.id === forcedNextId;
        const bForced = b.id === forcedNextId;
        if (aForced && !bForced) return -1;
        if (!aForced && bForced) return 1;
      }
      return a.createdAt - b.createdAt;
    });

  return (
    <div className="space-y-2">
      {queued.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          No songs queued yet.
        </div>
      ) : (
        queued.map(e => {
          const playersForEntry = e.playerIds
            .map((id) => playerById.get(id))
            .filter((player): player is NonNullable<typeof player> => Boolean(player));
          const displayNames =
            playersForEntry.length > 0
              ? playersForEntry.map((player) => player.name).join(" + ")
              : e.playerIds.join(" + ");
          const displayNicknames = playersForEntry
            .map((player) => player.nickname)
            .filter(Boolean)
            .join(" + ");
          const accent = playerAccent(playersForEntry[0]?.name);
          return (
            <div
              key={e.id}
              className={`rounded-2xl border border-white/10 p-3 ${accent}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {playersForEntry.length === 1 ? (
                        playersForEntry.map((player) => (
                          <img
                            key={player.id}
                            src={player.photoUrl}
                            alt={player.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ))
                      ) : (
                        <img
                          src={groupAvatar}
                          alt="Singer"
                          className="h-8 w-8 rounded-full object-cover max-w-fit"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {displayNames}{" "}
                        {displayNicknames ? (
                          <span className="text-white/60">— {displayNicknames}</span>
                        ) : null}
                      </div>
                      <div className="truncate text-sm text-white/70">
                        {e.youtube?.title ?? e.query}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-white/60">
                    {e.youtube?.viewCount ? `${e.youtube.viewCount.toLocaleString()} views` : ""}
                  </div>
                  <button
                    onClick={() => onMakeNext(e.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm hover:bg-white/10"
                    title="Make next"
                    aria-label="Make next"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onRemove(e.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm hover:bg-white/10"
                    title="Remove song"
                    aria-label="Remove song"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function playerAccent(name?: string) {
  switch ((name ?? "").toLowerCase()) {
    case "tracy":
      return "bg-[#152536]/70";
    case "gina":
      return "bg-[#2a1a3c]/70";
    case "kara":
      return "bg-[#21381a]/70";
    case "alex":
      return "bg-[#3a1f1b]/70";
    case "nicole":
      return "bg-[#1f2f3a]/70";
    default:
      return "bg-white/5";
  }
}
