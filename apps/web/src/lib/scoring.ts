import type { YoutubePick } from "../types/karaoke";

const PREFERRED_CHANNELS = [
  "Sing King",
  "Karaoke Version",
  "Karafun",
  "Karaoke",
];

function norm(s: string) {
  return s.toLowerCase();
}

function keywordScore(title: string) {
  const t = norm(title);
  let score = 0;

  // strong karaoke intent
  if (t.includes("karaoke")) score += 30;
  if (t.includes("karaoke version")) score += 20;
  if (t.includes("instrumental")) score += 8;
  if (t.includes("lyrics")) score += 4;
  if (t.includes("no vocals") || t.includes("no vocal")) score += 8;

  // mild penalties
  if (t.includes("live")) score -= 8;
  if (t.includes("cover")) score -= 4; // covers can be fine, but less reliable for karaoke sync
  if (t.includes("reaction")) score -= 20;

  return score;
}

function channelScore(channelTitle: string) {
  const c = norm(channelTitle);
  const hit = PREFERRED_CHANNELS.find(x => norm(x) === c || c.includes(norm(x)));
  return hit ? 12 : 0;
}

function queryMatchScore(title: string, query: string) {
  // crude match: count overlapping tokens (ignoring tiny tokens)
  const tTokens = new Set(norm(title).split(/\s+/).filter(x => x.length >= 3));
  const qTokens = new Set(norm(query).split(/\s+/).filter(x => x.length >= 3));
  let overlap = 0;
  for (const tok of qTokens) if (tTokens.has(tok)) overlap++;
  return overlap * 4;
}

function viewScore(viewCount: number) {
  // log-ish scaling: 0..~30 typical
  if (!viewCount || viewCount <= 0) return 0;
  const v = Math.log10(viewCount + 1); // 1M => ~6
  return v * 5;
}

export function scoreVideo(pick: YoutubePick, query: string) {
  const title = pick.title ?? "";
  const channelTitle = pick.channelTitle ?? "";
  const views = pick.viewCount ?? 0;

  return (
    keywordScore(title) +
    channelScore(channelTitle) +
    queryMatchScore(title, query) +
    viewScore(views)
  );
}
