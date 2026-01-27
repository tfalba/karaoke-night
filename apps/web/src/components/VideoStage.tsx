import YouTube from "react-youtube";
import { NeonButton } from "./NeonButton";

type UpNextDetails = {
  title: string;
  singer?: string | null;
};

export function VideoStage(props: {
  videoId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  isPendingNext?: boolean;
  upNext?: UpNextDetails | null;
  onEnded?: () => void;
}) {
  const {
    videoId,
    isPendingNext = false,
    upNext,
    onEnded,
    isOpen,
    onToggle,
  } = props;
  const showPlaceholder = !videoId || isPendingNext;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-start">
        <NeonButton className="bg-[#9c27b0]/60" onClick={onToggle}>
          {isOpen ? "Close Lyrics" : "Open Lyrics"}
        </NeonButton>
      </div>
      <div
        className={[
          "relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-[#9c27b0]/60",
          "shadow-neon transition-all duration-200",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        ].join(" ")}
      >
        {showPlaceholder ? (
          <div className="flex h-full items-center justify-center p-10 text-center bg-black/70">
            <div className="max-w-md">
              {isPendingNext && upNext ? (
                <>
                  <div className="text-2xl font-semibold">Up next</div>
                  <div className="mt-2 text-lg text-white/90">
                    {upNext.title}
                  </div>
                  {upNext.singer ? (
                    <div className="mt-1 text-sm text-white/70">
                      Singer:{" "}
                      <span className="font-semibold">{upNext.singer}</span>
                    </div>
                  ) : null}
                  <div className="mt-4 text-sm text-white/70">
                    Tap <span className="font-semibold">Next</span> to start.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-semibold">
                    Load up the queue 🎤
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    Add a song in the drawer, then hit{" "}
                    <span className="font-semibold">Next</span>.
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
    </div>
  );
}
