export type PlayerId = string;

export type YoutubePick = {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount?: number;
  score?: number;
};

export type SongEntry = {
  id: string;
  playerIds: PlayerId[];
  query: string;
  createdAt: number;
  youtube?: YoutubePick;
  status: "queued" | "played";
};
