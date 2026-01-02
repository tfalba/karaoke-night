const KEY = "karaokeNight.v1";

export type PersistedState = {
  entries: unknown[];
  nowPlayingId: string | null;
  lastSingerId: string | null;
  draft?: { playerIds?: string[]; query?: string };
};

export function loadState<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState(state: PersistedState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
