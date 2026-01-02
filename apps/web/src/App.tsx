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
import { RulesDrawer } from "./components/RulesDrawer";
import { PLAYERS } from "./data/players";
import bgImage from "./assets/fireworks.jpg";

type PersistShape = {
  entries: SongEntry[];
  nowPlayingId: string | null;
  lastSingerId: string | null;
  draft?: { playerIds?: string[]; query?: string };
};

const FALLBACK: PersistShape = {
  entries: [],
  nowPlayingId: null,
  lastSingerId: null,
  draft: {},
};

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [awaitingNextStart, setAwaitingNextStart] = useState(false);
  const [forcedNextId, setForcedNextId] = useState<string | null>(null);

  const [entries, setEntries] = useState<SongEntry[]>(() => {
    const persisted = loadState<PersistShape>(FALLBACK).entries;
    return persisted.map((entry) => normalizeEntry(entry));
  });
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
  const nowPlayers = useMemo(() => {
    if (!nowPlaying) return [];
    return nowPlaying.playerIds
      .map((id) => playerById.get(id))
      .filter((player): player is NonNullable<typeof player> => Boolean(player));
  }, [nowPlaying, playerById]);

  const videoId = nowPlaying?.youtube?.videoId ?? null;

  function normalizeEntry(entry: SongEntry) {
    if (Array.isArray(entry.playerIds)) {
      return entry;
    }
    const legacyId = (entry as SongEntry & { playerId?: string }).playerId;
    return {
      ...entry,
      playerIds: legacyId ? [legacyId] : [],
    };
  }

  async function addSong(playerIds: string[], query: string) {
    const pick = await searchKaraokeVideo(query);

    const entry: SongEntry = {
      id: uid("song"),
      playerIds,
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
    setAwaitingNextStart(false);
    setForcedNextId(null);
  }

  function pickNext(entriesList: SongEntry[]) {
    const updated = entriesList.map((e) => {
      if (e.id === nowPlayingId) return { ...e, status: "played" as const };
      return e;
    });

    const forcedEntry = forcedNextId
      ? updated.find((e) => e.id === forcedNextId && e.status === "queued") ?? null
      : null;
    if (forcedNextId && !forcedEntry) {
      setForcedNextId(null);
    }
    if (forcedEntry) {
      return {
        updated,
        nextEntry: forcedEntry,
        nextPlayerId: forcedEntry.playerIds[0] ?? null,
      };
    }

    const nextPlayerId = pickNextPlayerId({ entries: updated, lastSingerId });
    if (!nextPlayerId) {
      return { updated, nextEntry: null, nextPlayerId: null };
    }

    const nextEntry = pickNextEntryForPlayer(updated, nextPlayerId);
    if (!nextEntry) {
      return { updated, nextEntry: null, nextPlayerId: null };
    }

    return { updated, nextEntry, nextPlayerId };
  }

  function nextUp() {
    if (awaitingNextStart && nowPlayingId) {
      const pendingEntry = entries.find((entry) => entry.id === nowPlayingId) ?? null;
      setLastSingerId(pendingEntry?.playerIds[0] ?? null);
      setAwaitingNextStart(false);
      return;
    }

    // mark current as played
    setEntries((prev) => {
      const { updated, nextEntry, nextPlayerId } = pickNext(prev);

      if (!nextEntry || !nextPlayerId) {
        setNowPlayingId(null);
        setAwaitingNextStart(false);
        return updated;
      }

      setLastSingerId(nextPlayerId);
      setNowPlayingId(nextEntry.id);
      setAwaitingNextStart(false);
      setForcedNextId(null);

      return updated;
    });
  }

  function handleVideoEnd() {
    setEntries((prev) => {
      const { updated, nextEntry } = pickNext(prev);

      if (!nextEntry) {
        setNowPlayingId(null);
        setAwaitingNextStart(false);
        return updated;
      }

      setNowPlayingId(nextEntry.id);
      setAwaitingNextStart(true);
      setForcedNextId(null);
      return updated;
    });
  }

  function removeEntry(entryId: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    if (nowPlayingId === entryId) {
      setNowPlayingId(null);
      setAwaitingNextStart(false);
    }
    if (forcedNextId === entryId) {
      setForcedNextId(null);
    }
  }

  function makeNext(entryId: string) {
    setForcedNextId(entryId);
    if (awaitingNextStart) {
      setNowPlayingId(entryId);
    }
  }


  const remainingCount = entries.filter((e) => e.status === "queued").length;
  const showNowPlaying = Boolean(nowPlaying || nowPlayers.length > 0);

  return (
    <div
      className="neon-bg min-h-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="px-8 pt-8 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-white/60">
            Karaoke Night
          </div>
          <div className="text-2xl font-semibold">Club Mode</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-white/70">{remainingCount} queued</div>
          <NeonButton
            onClick={nextUp}
            disabled={remainingCount === 0 && !nowPlayingId}
          >
            Next
          </NeonButton>
        </div>
      </div>
      <div className="mx-auto grid grid-cols-[3fr_1fr] gap-6 p-6">
        {/* Main video */}
        <div className=" aspect-[16/9] col-main">
          <VideoStage
            videoId={videoId}
            isPendingNext={awaitingNextStart}
            upNext={
              awaitingNextStart && nowPlaying
                ? {
                    title: nowPlaying.youtube?.title ?? nowPlaying.query,
                    singer: nowPlayers.length
                      ? nowPlayers.map((player) => player.name).join(" + ")
                      : null,
                  }
                : null
            }
            onEnded={handleVideoEnd}
          />
        </div>
        {showNowPlaying ? (
          <div className="col-side min-w-0">
          <NowPlayingCard players={nowPlayers} entry={nowPlaying} />
        </div>
      ) : null}
      </div>
      <QueueDrawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen((v) => !v)}
        players={PLAYERS}
        entries={entries}
        forcedNextId={forcedNextId}
        onAdd={addSong}
        onRemove={removeEntry}
        onMakeNext={makeNext}
      />
      <RulesDrawer
        isOpen={rulesOpen}
        onToggle={() => setRulesOpen((v) => !v)}
        onClear={clearAll}
      />
    </div>
  );
}
