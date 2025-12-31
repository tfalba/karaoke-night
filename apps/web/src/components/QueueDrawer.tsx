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
  onAdd: (playerId: string, query: string) => Promise<void>;
  onClear: () => void;
}) {
  const { isOpen, onToggle, players, entries, onAdd, onClear } = props;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex justify-end">
        <NeonButton onClick={onToggle}>
          {isOpen ? "Close Queue" : "Open Queue"}
        </NeonButton>
      </div>

      <div
        className={[
          "mt-3 w-[420px] max-w-[90vw] overflow-hidden rounded-3xl border border-white/10 bg-black/70 backdrop-blur",
          "shadow-neon transition-all duration-200",
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        ].join(" ")}
      >
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-white/60">
                Queue
              </div>
              <div className="text-lg font-semibold">
                {entries.filter(e => e.status === "queued").length} up next
              </div>
            </div>
            <button
              onClick={onClear}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="p-4">
          <AddSongForm players={players} onAdd={onAdd} />
          <div className="mt-4">
            <QueueList players={players} entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
}
