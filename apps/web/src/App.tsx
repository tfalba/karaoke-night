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
import { PLAYERS, type Player } from "./data/players";
import bgImage from "./assets/backgrounds/colorful-firepit.jpg";
import beachFirepit from "./assets/backgrounds/beach-firepit.jpg";
import concert from "./assets/backgrounds/concert.jpg";
import discoBallLaser from "./assets/backgrounds/disco-ball-laser.jpg";
import discoBallThree from "./assets/backgrounds/disco-ball-three.jpg";
import discoBall from "./assets/backgrounds/disco-ball.jpg";
import fireworks from "./assets/backgrounds/fireworks.jpg";
import turntable from "./assets/backgrounds/turntable.jpg";
import avatar1 from "./assets/avatars/avatar-1.png";
import avatar2 from "./assets/avatars/avatar-2.png";
import avatar3 from "./assets/avatars/avatar-3.png";
import avatar4 from "./assets/avatars/avatar-4.png";
import avatar5 from "./assets/avatars/avatar-5.png";
import avatar6 from "./assets/avatars/avatar-6.png";
import avatar7 from "./assets/avatars/avatar-7.png";
import avatar8 from "./assets/avatars/avatar-8.png";
import avatar9 from "./assets/avatars/avatar-9.png";
import avatar10 from "./assets/avatars/avatar-10.png";
import avatar11 from "./assets/avatars/avatar-11.png";
import avatar12 from "./assets/avatars/avatar-12.png";
import avatar13 from "./assets/avatars/avatar-13.png";
import avatar14 from "./assets/avatars/avatar-14.png";
import avatar15 from "./assets/avatars/avatar-15.png";

const BACKGROUND_OPTIONS = [
  { label: "Colorful Firepit", image: bgImage },
  { label: "Beach Firepit", image: beachFirepit },
  { label: "Concert", image: concert },
  { label: "Disco Ball Laser", image: discoBallLaser },
  { label: "Disco Ball Trio", image: discoBallThree },
  { label: "Disco Ball", image: discoBall },
  { label: "Fireworks", image: fireworks },
  { label: "Turntable", image: turntable },
];

const AVATAR_OPTIONS = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
];

type PersistShape = {
  entries: SongEntry[];
  nowPlayingId: string | null;
  lastSingerId: string | null;
  draft?: { playerIds?: string[]; query?: string };
  playersAlt?: Player[];
};

const FALLBACK: PersistShape = {
  entries: [],
  nowPlayingId: null,
  lastSingerId: null,
  draft: {},
  playersAlt: [],
};

const DEFAULT_PLAYER_COUNT = 5;

type DraftPlayer = {
  id: string;
  name: string;
  photoUrl: string;
};

function getAvatarForIndex(index: number) {
  return AVATAR_OPTIONS[index % AVATAR_OPTIONS.length];
}

function buildDraftFromPlayers(players: Player[]) {
  if (players.length) {
    return players.map((player, index) => ({
      id: player.id,
      name: player.name,
      photoUrl: player.photoUrl || getAvatarForIndex(index),
    }));
  }
  return Array.from({ length: DEFAULT_PLAYER_COUNT }, (_, index) => ({
    id: `player-${index + 1}`,
    name: "",
    photoUrl: getAvatarForIndex(index),
  }));
}

function buildPlayersAltFromDraft(draft: DraftPlayer[]) {
  return draft.map((player, index) => ({
    id: player.id,
    name: player.name.trim(),
    nickname: "Guest Star",
    photoUrl: player.photoUrl || getAvatarForIndex(index),
  }));
}

export default function App() {
  const persistedState = useMemo(() => loadState<PersistShape>(FALLBACK), []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [awaitingNextStart, setAwaitingNextStart] = useState(false);
  const [forcedNextId, setForcedNextId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState(bgImage);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(true);
  const [playersAlt, setPlayersAlt] = useState<Player[]>(
    () => persistedState.playersAlt ?? []
  );
  const [playersPickerOpen, setPlayersPickerOpen] = useState(
    () => !(persistedState.playersAlt?.length ?? 0)
  );
  const [playersDraft, setPlayersDraft] = useState<DraftPlayer[]>(
    () => buildDraftFromPlayers(persistedState.playersAlt ?? [])
  );

  const [entries, setEntries] = useState<SongEntry[]>(() => {
    const persisted = persistedState.entries;
    return persisted.map((entry) => normalizeEntry(entry));
  });
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(
    () => persistedState.nowPlayingId
  );
  const [lastSingerId, setLastSingerId] = useState<string | null>(
    () => persistedState.lastSingerId
  );

  // persist
  useEffect(() => {
    saveState({
      entries,
      nowPlayingId,
      lastSingerId,
      draft: {},
      playersAlt,
    });
  }, [entries, nowPlayingId, lastSingerId, playersAlt]);

  const PLAYERS_ALT = playersAlt.length ? playersAlt : PLAYERS;
  const playerById = useMemo(
    () => new Map(PLAYERS_ALT.map((p) => [p.id, p])),
    [PLAYERS_ALT]
  );
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
    setPlayersAlt([]);
    setPlayersDraft(buildDraftFromPlayers([]));
    setPlayersPickerOpen(true);
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

  function openPlayersModal() {
    setPlayersDraft(buildDraftFromPlayers(playersAlt));
    setPlayersPickerOpen(true);
  }


  const remainingCount = entries.filter((e) => e.status === "queued").length;
  const showNowPlaying = Boolean(nowPlaying || nowPlayers.length > 0);

  return (
    <div
      className="min-h-screen bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {backgroundPickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-3xl border border-white/15 bg-[#0b0b15]/90 p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/50">
                  Pick The Vibe
                </div>
                <div className="text-2xl font-semibold">
                  Choose a background
                </div>
              </div>
              <div className="text-sm text-white/60">
                This will set the room atmosphere.
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BACKGROUND_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setBackgroundImage(option.image);
                    setBackgroundPickerOpen(false);
                  }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-white/40"
                >
                  <img
                    src={option.image}
                    alt={option.label}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3">
                    <div className="text-sm font-semibold">
                      {option.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {!backgroundPickerOpen && playersPickerOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-6xl rounded-3xl border border-white/15 bg-[#0b0b15]/90 p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/50">
                  Who's Singing
                </div>
                <div className="text-2xl font-semibold">
                  Add singers and pick avatars
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPlayersDraft((prev) => [
                      ...prev,
                      {
                        id: uid("player"),
                        name: "",
                        photoUrl: getAvatarForIndex(prev.length),
                      },
                    ]);
                  }}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
                >
                  Add singer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlayersDraft((prev) =>
                      prev.length > 1 ? prev.slice(0, -1) : prev
                    );
                  }}
                  disabled={playersDraft.length <= 1}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const readyPlayers = buildPlayersAltFromDraft(playersDraft);
                    setPlayersAlt(readyPlayers);
                    setPlayersPickerOpen(false);
                  }}
                  disabled={playersDraft.some((draft) => !draft.name.trim())}
                  className="rounded-full bg-[#13dcf6] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {playersAlt.length ? "Save singers" : "Start the night"}
                </button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {playersDraft.map((player, index) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 text-sm font-semibold text-white/80">
                    Singer {index + 1}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    placeholder="Singer name"
                    onChange={(event) => {
                      const value = event.target.value;
                      setPlayersDraft((prev) =>
                        prev.map((draft) =>
                          draft.id === player.id
                            ? { ...draft, name: value }
                            : draft
                        )
                      );
                    }}
                    className="mb-4 w-full rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => {
                      const isSelected = player.photoUrl === avatar;
                      return (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => {
                            setPlayersDraft((prev) =>
                              prev.map((draft) =>
                                draft.id === player.id
                                  ? { ...draft, photoUrl: avatar }
                                  : draft
                              )
                            );
                          }}
                          className={[
                            "overflow-hidden rounded-xl border transition",
                            isSelected
                              ? "border-[#13dcf6] ring-2 ring-[#13dcf6]/60"
                              : "border-white/10 hover:border-white/40",
                          ].join(" ")}
                        >
                          <img
                            src={avatar}
                            alt="Singer avatar option"
                            className="h-12 w-12 object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <div className="px-8 pt-8 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.35em] text-white/60">
            Karaoke Night
          </div>
          <div className="text-2xl font-semibold">Club Mode</div>

      
      </div>
      <div className="mx-auto grid grid-cols-[3fr_1fr] gap-6 p-6">
        {/* Main video */}
        <div className=" aspect-[16/9] col-main">
          <VideoStage
            isOpen={lyricsOpen}
            onToggle={() => setLyricsOpen((v) => !v)}
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
          <NowPlayingCard players={nowPlayers} entry={nowPlaying} isOpen={nowPlayingOpen} onToggle={() => setNowPlayingOpen((v) => !v)} />
        </div>
      ) : null}
      </div>
        <div className="flex items-center justify-center gap-3">
          <div className="text-sm text-white/70">{remainingCount} queued</div>
          <NeonButton onClick={openPlayersModal}>Edit singers</NeonButton>
          <NeonButton
            onClick={nextUp}
            disabled={remainingCount === 0 && !nowPlayingId}
          >
            Next
          </NeonButton>
        </div>
      <QueueDrawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen((v) => !v)}
        players={PLAYERS_ALT}
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
