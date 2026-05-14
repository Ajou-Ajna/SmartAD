import { FunctionComponent, useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import NavigationRail1 from "../components/NavigationRail1";
import YoutubePlayer from "../components/YoutubePlayer";
import { useAppContext } from "../context/AppContext";

const View: FunctionComponent = () => {
  const { currentItem } = useAppContext();
  const location = useLocation();
  const audioUrlFromBackend = (location.state as any)?.audioUrl;
  const videoUrlFromBackend = (location.state as any)?.videoUrl;
  const finalAudioUrl = audioUrlFromBackend ? `/api/storage/stream?url=${encodeURIComponent(audioUrlFromBackend)}` : "/dummy_audio.wav";
  const finalVideoUrl = videoUrlFromBackend ? `/api/storage/stream?url=${encodeURIComponent(videoUrlFromBackend)}` : "";
  
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = mediaRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = mediaRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = mediaRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  }, []);
  return (
    <div className="w-full min-h-screen relative bg-schemes-surface overflow-hidden flex items-start pt-0 px-[5px] pb-0 box-border leading-[normal] tracking-[normal]">
      <main className="self-stretch flex-1 flex items-start justify-between py-[5px] px-0 gap-0">
          <NavigationRail1
            navigationRailPosition="unset"
            navigationRailTop="unset"
            navigationRailLeft="unset"
            menuFabPadding="unset"
            size="Medium"
            state="Enabled"
            type="Square"
            width="Default"
            showLeadingIcon
            leadingIconHeight="unset"
            leadingIconWidth="unset"
            leadingIconBorder="none"
            leadingIconPadding="0"
            leadingIconBackgroundColor="transparent"
          />
          <section className="flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center py-7 px-0 relative isolate gap-3.5 text-left text-[16px] text-[#000] font-[Roboto] mq750:pt-5 mq750:pb-5 mq750:box-border">
            <div className="self-stretch flex flex-col items-center py-0 px-6 gap-2 z-[1] shrink-0 text-static-display-small-size text-schemes-on-surface">
              <h1 className="m-0 relative text-[length:inherit] leading-static-display-small-line-height font-medium font-[inherit] shrink-0 mq450:text-[22px] mq450:leading-[26px] mq750:text-[29px] mq750:leading-[35px]">
                SmartADV
              </h1>
              <div className="w-[528px] relative text-static-title-medium-size tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium text-schemes-on-surface-variant hidden shrink-0">
                Supporting text
              </div>
            </div>
            <div className="self-stretch h-11 flex flex-col items-center py-0 px-6 box-border gap-2 z-[2] shrink-0 text-schemes-on-surface-variant">
              <div className="relative leading-static-display-small-line-height font-medium shrink-0">
                AI기반 화면해설 방송 자동 생성 솔루션
              </div>
              <div className="w-[528px] relative tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium hidden shrink-0">
                Supporting text
              </div>
            </div>
            <div className="self-stretch relative z-[3] shrink-0 flex flex-col items-center gap-4 px-6">
              {finalVideoUrl ? (
                <video
                  ref={mediaRef}
                  className="w-full rounded-xl"
                  style={{ aspectRatio: "16/9", maxWidth: "640px" }}
                  src={finalVideoUrl}
                  controls={false}
                  preload="metadata"
                />
              ) : currentItem?.url ? (
                <iframe
                  className="w-full rounded-xl"
                  style={{ aspectRatio: "16/9", maxWidth: "640px" }}
                  src={(() => {
                    const url = currentItem.url;
                    let videoId = "";
                    try {
                      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
                      if (parsed.hostname.includes("youtube.com")) {
                        videoId = parsed.searchParams.get("v") || "";
                      } else if (parsed.hostname.includes("youtu.be")) {
                        videoId = parsed.pathname.slice(1);
                      }
                    } catch {
                      /* ignore parse errors */
                    }
                    return videoId
                      ? `https://www.youtube.com/embed/${videoId}?autoplay=0`
                      : "";
                  })()}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <YoutubePlayer />
              )}
            </div>
            <div className="w-full !!m-[0 important] absolute right-[0px] bottom-[-62px] left-[0px] rounded-t-sm rounded-b-2xl bg-schemes-surface overflow-hidden flex flex-col items-center justify-end z-[5] shrink-0 text-static-body-medium-size text-schemes-on-surface">
              <div
                className="w-full h-1 bg-schemes-secondary-container cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-schemes-primary transition-[width] duration-150"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
              <div className="w-full h-16 bg-schemes-surface-container flex items-center py-0 pl-0 pr-5 box-border gap-4">
                <img
                  className="h-16 w-16 relative object-cover"
                  loading="lazy"
                  alt=""
                  src="/Image@2x.png"
                />
                <div className="flex-1 flex flex-col items-start justify-center gap-0.5 min-w-0">
                  <div className="self-stretch relative tracking-static-body-medium-tracking leading-static-body-medium-line-height truncate">
                    {currentItem?.title || "제목 없음"}
                  </div>
                </div>
                <div className="flex items-start">
                  <button
                    className="cursor-pointer [border:none] p-0 bg-[transparent] h-12 w-12 flex items-center justify-center"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "일시정지" : "재생"}
                  >
                    <svg className="h-6 w-6 text-schemes-on-surface" viewBox="0 0 24 24" fill="currentColor">
                      {isPlaying ? (
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      ) : (
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                  </button>
                  <button className="cursor-pointer [border:none] p-0 bg-[transparent] h-12 w-12 flex items-center justify-center relative isolate">
                    <img
                      className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 relative z-[0]"
                      alt=""
                      src="/skip-next-filled.svg"
                    />
                    <img
                      className="cursor-pointer [border:none] p-0 bg-[transparent] h-10 w-10 absolute !!m-[0 important] top-[calc(50%_-_20px)] left-[calc(50%_-_20px)] z-[1]"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
    </div>
  );
};

export default View;
