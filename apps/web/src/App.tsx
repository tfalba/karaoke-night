import { useEffect, useMemo, useState } from "react";
import type { SongEntry } from "./types/karaoke";
import { clearState, loadState, saveState } from "./lib/storage";
import { searchKaraokeVideo } from "./lib/youtube";
import { uid } from "./lib/ids";
import { pickNextEntryForPlayer, pickNextPlayerId } from "./lib/picker";
import { NeonButton } from "./components/NeonButton";
import { VideoStage } from "./components/VideoStage";
import { NowPlayingCard } from "./components/NowPlayingCard";
import { QueueDrawer } from "./components/QueueDrawer";
import { PLAYERS } from "./data/players";
import  bgImage from "./assets/fireworks.jpg";


type PersistShape = {
  entries: SongEntry[];
  nowPlayingId: string | null;
  lastSingerId: string | null;
  draft?: { playerId?: string; query?: string };
};

const FALLBACK: PersistShape = {
  entries: [],
  nowPlayingId: null,
  lastSingerId: null,
  draft: {},
};

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const [entries, setEntries] = useState<SongEntry[]>(
    () => loadState<PersistShape>(FALLBACK).entries
  );
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(
    () => loadState<PersistShape>(FALLBACK).nowPlayingId
  );
  const [lastSingerId, setLastSingerId] = useState<string | null>(
    () => loadState<PersistShape>(FALLBACK).lastSingerId
  );

  // persist
  useEffect(() => {
    saveState({
      entries,
      nowPlayingId,
      lastSingerId,
      draft: {},
    });
  }, [entries, nowPlayingId, lastSingerId]);

  const playerById = useMemo(() => new Map(PLAYERS.map((p) => [p.id, p])), []);
  const nowPlaying = useMemo(
    () => entries.find((e) => e.id === nowPlayingId) ?? null,
    [entries, nowPlayingId]
  );
  const nowPlayer = useMemo(
    () => (nowPlaying ? playerById.get(nowPlaying.playerId) ?? null : null),
    [nowPlaying, playerById]
  );

  const videoId = nowPlaying?.youtube?.videoId ?? null;

  async function addSong(playerId: string, query: string) {
    const pick = await searchKaraokeVideo(query);

    const entry: SongEntry = {
      id: uid("song"),
      playerId,
      query,
      createdAt: Date.now(),
      youtube: pick,
      status: "queued",
    };

    setEntries((prev) => [...prev, entry]);
  }

  function clearAll() {
    clearState();
    setEntries([]);
    setNowPlayingId(null);
    setLastSingerId(null);
  }

  function nextUp() {
    // mark current as played
    setEntries((prev) => {
      const updated = prev.map((e) => {
        if (e.id === nowPlayingId) return { ...e, status: "played" as const };
        return e;
      });

      const nextPlayerId = pickNextPlayerId({ entries: updated, lastSingerId });
      if (!nextPlayerId) {
        setNowPlayingId(null);
        return updated;
      }

      const nextEntry = pickNextEntryForPlayer(updated, nextPlayerId);
      if (!nextEntry) {
        setNowPlayingId(null);
        return updated;
      }

      setLastSingerId(nextPlayerId);
      setNowPlayingId(nextEntry.id);

      return updated;
    });
  }

  const remainingCount = entries.filter((e) => e.status === "queued").length;

  return (
    <div className="neon-bg min-h-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
>
      <div className="mx-auto grid max-w-[1600px] grid-cols-[3fr_1fr] gap-6 p-6">
        {/* Main video */}
        <div className="h-[60vh] aspect-[16/9] col-main">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-white/60">
                Karaoke Night
              </div>
              <div className="text-2xl font-semibold">Club Mode</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-white/70">
                {remainingCount} queued
              </div>
              <NeonButton
                onClick={nextUp}
                disabled={remainingCount === 0 && !nowPlayingId}
              >
                Next
              </NeonButton>
            </div>
          </div>

          <VideoStage videoId={videoId} />
        </div>
        <div className="col-side">

          <NowPlayingCard player={nowPlayer} entry={nowPlaying} />
          </div>
</div>
        {/* Right rail */}
        <div className="space-y-6">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-white/60">
              Rules
            </div>
            <ul className="mt-2 space-y-2 text-sm text-white/70">
              <li>• Picks a new singer on “Next”</li>
              <li>• Avoids the last singer when possible</li>
              <li>• Weighted toward players with more songs remaining</li>
              <li>• Searches YouTube for “karaoke version”</li>
              <li>• Queue persists until cleared</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={clearAll}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm hover:bg-black/10"
              >
                Clear local storage + reset
              </button>
            </div>
          </div>
        </div>
      {/* </div> */}

      <QueueDrawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen((v) => !v)}
        players={PLAYERS}
        entries={entries}
        onAdd={addSong}
        onClear={clearAll}
      />
    </div>
  );
}
