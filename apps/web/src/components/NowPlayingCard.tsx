import type { Player } from "../data/players";
import type { SongEntry } from "../types/karaoke";
import { NeonButton } from "./NeonButton";

export function NowPlayingCard(props: {
  players: Player[];
  entry: SongEntry | null;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { players, entry, isOpen, onToggle } = props;
  const displayNames = players.map((player) => player.name).join(" + ");
  const displayNicknames = players.map((player) => player.nickname).join(" + ");
  const displayTitle = decodeHtmlEntities(
    entry?.youtube?.title ?? entry?.query ?? "—"
  );

  return (
     <div className="flex flex-col h-full">
          <div className="flex justify-end">
            <NeonButton className="bg-[#13dcf6]/60" onClick={onToggle}>
              {isOpen ? "Close Now Singing" : "Open Now Singing"}
            </NeonButton>
          </div>
          <div
            className={[
              "overflow-hidden rounded-3xl border border-white/10 bg-[#13dcf6]/80 p-4",
              "shadow-neon transition-all duration-200",
              isOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-3 opacity-0",
            ].join(" ")}
          >

        
    {/* <div className="rounded-3xl border border-white/10 bg-[#13dcf6]/80 p-4 shadow-neon"> */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 overflow-hidden justify-center items-center gap-2">
          {players.length > 0 ? (
            players.map((player) => (
              <img
                key={player.id}
                src={player.photoUrl}
                alt={player.name}
                className="aspect-[1] rounded-2xl object-cover"
              />
            ))
          ) : (
            <img
              src="https://placehold.co/120x120/png"
              alt="No singer yet"
              className="aspect-[1]rounded-2xl object-cover"
            />
          )}
        </div>
       
      </div>
       <div className="mt-4 rounded-2xl border border-white/10 min-w-0 bg-black/30 p-3">
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
       

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="text-xs text-white/80">Song</div>
        <div className="truncate font-semibold">
          {displayTitle}
        </div>
        <div className="truncate text-xs text-white/80">
          {entry?.youtube?.channelTitle ? `Source: ${entry.youtube.channelTitle}` : ""}
        </div>
      </div>
    </div>
    </div>
  );
}

function decodeHtmlEntities(value: string) {
  if (typeof document === "undefined") return value;
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");
  return doc.documentElement.textContent ?? value;
}
