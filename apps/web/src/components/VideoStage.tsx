import YouTube from "react-youtube";

export function VideoStage(props: { videoId: string | null }) {
  const { videoId } = props;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-neon">
      {!videoId ? (
        <div className="flex h-full items-center justify-center p-10 text-center bg-black/70">
          <div className="max-w-md">
            <div className="text-2xl font-semibold">Load up the queue 🎤</div>
            <div className="mt-2 text-sm text-white/70">
              Add a song in the drawer, then hit <span className="font-semibold">Next</span>.
            </div>
          </div>
        </div>
      ) : (
        <YouTube
          videoId={videoId}
          className="h-full w-full"
          iframeClassName="h-full w-full"
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 1,
              rel: 0,
              modestbranding: 1,
            },
          }}
        />
      )}
    </div>
  );
}
