import YouTube from "react-youtube";

type UpNextDetails = {
  title: string;
  singer?: string | null;
};

export function VideoStage(props: {
  videoId: string | null;
  isPendingNext?: boolean;
  upNext?: UpNextDetails | null;
  onEnded?: () => void;
}) {
  const { videoId, isPendingNext = false, upNext, onEnded } = props;
  const showPlaceholder = !videoId || isPendingNext;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-neon">
      {showPlaceholder ? (
        <div className="flex h-full items-center justify-center p-10 text-center bg-black/70">
          <div className="max-w-md">
            {isPendingNext && upNext ? (
              <>
                <div className="text-2xl font-semibold">Up next</div>
                <div className="mt-2 text-lg text-white/90">{upNext.title}</div>
                {upNext.singer ? (
                  <div className="mt-1 text-sm text-white/70">
                    Singer: <span className="font-semibold">{upNext.singer}</span>
                  </div>
                ) : null}
                <div className="mt-4 text-sm text-white/70">
                  Tap <span className="font-semibold">Next</span> to start.
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold">Load up the queue 🎤</div>
                <div className="mt-2 text-sm text-white/70">
                  Add a song in the drawer, then hit <span className="font-semibold">Next</span>.
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <YouTube
          videoId={videoId}
          className="h-full w-full"
          iframeClassName="h-full w-full"
          onEnd={onEnded}
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
