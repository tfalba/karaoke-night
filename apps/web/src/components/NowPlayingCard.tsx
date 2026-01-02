import type { Player } from "../data/players";
import type { SongEntry } from "../types/karaoke";

export function NowPlayingCard(props: {
  players: Player[];
  entry: SongEntry | null;
}) {
  const { players, entry } = props;
  const displayNames = players.map((player) => player.name).join(" + ");
  const displayNicknames = players.map((player) => player.nickname).join(" + ");

  return (
    <div className="rounded-3xl border border-white/10 bg-[#13dcf6]/80 p-4 shadow-neon">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {players.length > 0 ? (
            players.map((player) => (
              <img
                key={player.id}
                src={player.photoUrl}
                alt={player.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ))
          ) : (
            <img
              src="https://placehold.co/120x120/png"
              alt="No singer yet"
              className="h-16 w-16 rounded-2xl object-cover"
            />
          )}
        </div>
        <div className="min-w-0 bg-black/30 p-3">
          <div className="text-xs uppercase tracking-[0.25em] text-white/80">
            Now singing
          </div>
          <div className="truncate text-lg font-semibold">
            {players.length ? displayNames : "—"}
          </div>
          <div className="truncate text-sm text-white/80">
            {players.length ? `“${displayNicknames}”` : "Add songs to begin"}
          </div>
        </div>
      </div>
       

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="text-xs text-white/80">Song</div>
        <div className="truncate font-semibold">
          {entry?.youtube?.title ?? entry?.query ?? "—"}
        </div>
        <div className="truncate text-xs text-white/80">
          {entry?.youtube?.channelTitle ? `Source: ${entry.youtube.channelTitle}` : ""}
        </div>
      </div>
    </div>
  );
}
