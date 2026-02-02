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
    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
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
          const accent = playerAccent(players, playersForEntry[0]?.id);
          const displayTitle = decodeHtmlEntities(e.youtube?.title ?? e.query);
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
                            className="h-12 w-12 rounded-full object-cover max-w-fit"
                          />
                        ))
                      ) : (
                        <img
                          src={groupAvatar}
                          alt="Singer"
                          className="h-12 w-12 rounded-full object-cover max-w-fit"
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
                        {displayTitle}
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

function playerAccent(players: Player[], playerId?: string) {
  const index = players.findIndex((player) => player.id === playerId);
  switch (index) {
    case 0:
      return "bg-[#152536]/70";
    case 1:
      return "bg-[#2a1a3c]/70";
    case 2:
      return "bg-[#21381a]/70";
    case 3:
      return "bg-[#3a1f1b]/70";
    case 4:
      return "bg-[#1f2f3a]/70";
    default:
      return "bg-white/5";
  }
}

function decodeHtmlEntities(value: string) {
  if (typeof document === "undefined") return value;
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");
  return doc.documentElement.textContent ?? value;
}
