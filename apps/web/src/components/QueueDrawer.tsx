import type { Player } from "../data/players";
import type { SongEntry } from "../types/karaoke";
import { AddSongForm } from "./AddSongForm";
import { NeonButton } from "./NeonButton";
import { QueueList } from "./QueueList";


export function QueueDrawer(props: {
  isOpen: boolean;
  onToggle: () => void;
  players: Player[];
  entries: SongEntry[];
  forcedNextId: string | null;
  onAdd: (playerIds: string[], query: string) => Promise<void>;
  onRemove: (entryId: string) => void;
  onMakeNext: (entryId: string) => void;
}) {
  const {
    isOpen,
    onToggle,
    players,
    entries,
    forcedNextId,
    onAdd,
    onRemove,
    onMakeNext,
  } = props;

  return (
    <div className="fixed bottom-6 right-6 z-50">
    
      <div
        className={[
          "mt-3 w-[520px] max-w-[90vw] overflow-hidden rounded-3xl border border-white/10 bg-[#9c27b0]/60 backdrop-blur",
          "shadow-neon transition-all duration-200",
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        ].join(" ")}
      >
        <div className="border-b border-white/10 p-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/60">
              Queue
            </div>
            <div className="text-lg font-semibold">
              {entries.filter(e => e.status === "queued").length} up next
            </div>
          </div>
        </div>

        <div className="p-4">
          <AddSongForm players={players} onAdd={onAdd} />
          <div className="mt-4">
            <QueueList
              players={players}
              entries={entries}
              forcedNextId={forcedNextId}
              onRemove={onRemove}
              onMakeNext={onMakeNext}
            />
          </div>
        </div>
      </div>
        <div className="flex justify-end">
        <NeonButton className="bg-[#9c27b0]/60" onClick={onToggle}>
          {isOpen ? "Close Queue" : "Open Queue"}
        </NeonButton>
      </div>

    </div>
  );
}
