import type { Player } from "../data/players";
import type { SongEntry } from "../types/karaoke";

export function NowPlayingCard(props: {
  player: Player | null;
  entry: SongEntry | null;
}) {
  const { player, entry } = props;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-neon">
      <div className="flex items-center gap-3">
        <img
          src={player?.photoUrl ?? "https://placehold.co/120x120/png"}
          alt={player?.name ?? "No singer yet"}
          className="h-14 w-14 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.25em] text-white/60">
            Now singing
          </div>
          <div className="truncate text-lg font-semibold">
            {player ? player.name : "—"}
          </div>
          <div className="truncate text-sm text-white/70">
            {player ? `“${player.nickname}”` : "Add songs to begin"}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="text-xs text-white/60">Song</div>
        <div className="truncate font-semibold">
          {entry?.youtube?.title ?? entry?.query ?? "—"}
        </div>
        <div className="truncate text-xs text-white/60">
          {entry?.youtube?.channelTitle ? `Source: ${entry.youtube.channelTitle}` : ""}
        </div>
      </div>
    </div>
  );
}
