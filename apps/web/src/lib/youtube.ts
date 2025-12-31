import type { YoutubePick } from "../types/karaoke";
import { scoreVideo } from "./scoring";

const API = "https://www.googleapis.com/youtube/v3";

function mustGetKey() {
  const key = import.meta.env.VITE_YT_API_KEY as string | undefined;
  if (!key) throw new Error("Missing VITE_YT_API_KEY (set it in .env.local)");
  return key;
}

export async function searchKaraokeVideo(query: string): Promise<YoutubePick> {
  const key = mustGetKey();

  // 1) Search
  const q = `${query} karaoke version`;
  const searchUrl = new URL(`${API}/search`);
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "10");
  searchUrl.searchParams.set("q", q);
  searchUrl.searchParams.set("videoEmbeddable", "true");
  searchUrl.searchParams.set("safeSearch", "none");
  searchUrl.searchParams.set("key", key);

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw new Error(`YouTube search failed (${searchRes.status})`);
  const searchJson = await searchRes.json();

  const candidates = (searchJson.items ?? [])
    .map((it: any) => ({
      videoId: it?.id?.videoId as string | undefined,
      title: it?.snippet?.title as string | undefined,
      channelTitle: it?.snippet?.channelTitle as string | undefined,
    }))
    .filter((x: any) => x.videoId && x.title && x.channelTitle) as YoutubePick[];

  if (!candidates.length) {
    throw new Error("No YouTube results found.");
  }

  // 2) Fetch view counts
  const ids = candidates.map(c => c.videoId).join(",");
  const videosUrl = new URL(`${API}/videos`);
  videosUrl.searchParams.set("part", "statistics,snippet");
  videosUrl.searchParams.set("id", ids);
  videosUrl.searchParams.set("key", key);

  const videosRes = await fetch(videosUrl);
  if (!videosRes.ok) throw new Error(`YouTube videos lookup failed (${videosRes.status})`);
  const videosJson = await videosRes.json();

  const viewById = new Map<string, number>();
  for (const it of videosJson.items ?? []) {
    const id = it?.id;
    const view = Number(it?.statistics?.viewCount ?? 0);
    if (id) viewById.set(id, view);
  }

  // 3) Score
  const scored = candidates.map(c => {
    const viewCount = viewById.get(c.videoId) ?? 0;
    const score = scoreVideo({ ...c, viewCount }, query);
    return { ...c, viewCount, score };
  });

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored[0];
}
