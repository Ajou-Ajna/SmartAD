import { FunctionComponent } from "react";
import NavigationRail1 from "../components/NavigationRail1";
import IconButtonStandard from "../components/IconButtonStandard";
import YoutubePlayer from "../components/YoutubePlayer";
import LinearDeterminateProgressIn from "../components/LinearDeterminateProgressIn";
import { useAppContext } from "../context/AppContext";

const View: FunctionComponent = () => {
  const { currentItem } = useAppContext();
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
              {currentItem?.url ? (
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
              <div className="w-full flex flex-col items-center gap-2" style={{ maxWidth: "640px" }}>
                <div className="self-stretch text-[14px] font-medium font-[Inter] text-schemes-on-surface-variant">
                  해설 오디오 미리듣기
                </div>
                <audio
                  className="w-full"
                  controls
                  src="/dummy_audio.wav"
                >
                  브라우저가 오디오를 지원하지 않습니다.
                </audio>
              </div>
            </div>
            <div className="self-stretch flex items-center justify-center flex-wrap content-center py-0 px-7 gap-[47px] z-[4] shrink-0 text-center font-[Inter] mq750:gap-[23px]">
              <div className="flex items-center flex-wrap content-center gap-1">
                <div className="w-[52px] flex flex-col items-start">
                  <input
                    className="m-0 self-stretch h-8 rounded-[100px] flex items-center justify-end py-0.5 px-1 box-border"
                    type="checkbox"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative tracking-[-0.02em] leading-[120%] font-semibold">
                    Auto Sync 사용
                  </div>
                </div>
              </div>
              <div className="flex items-center flex-wrap content-center gap-1">
                <div className="w-[52px] flex flex-col items-start">
                  <input
                    className="m-0 self-stretch h-8 rounded-[100px] flex items-center justify-end py-0.5 px-1 box-border"
                    type="checkbox"
                  />
                </div>
                <div className="h-[18px] w-[106px] relative tracking-[-0.02em] leading-[120%] font-semibold inline-block">
                  Auto Play 사용
                </div>
              </div>
              <div className="flex items-center flex-wrap content-center gap-1">
                <div className="w-[52px] flex flex-col items-start">
                  <input
                    className="m-0 self-stretch h-8 rounded-[100px] border-schemes-outline border-solid border-[2px] box-border flex items-center p-1"
                    type="checkbox"
                  />
                </div>
                <div className="relative tracking-[-0.02em] leading-[120%] font-semibold">
                  Audio Ducking 사용
                </div>
              </div>
            </div>
            <div className="w-full !!m-[0 important] absolute right-[0px] bottom-[-62px] left-[0px] rounded-t-sm rounded-b-2xl bg-schemes-surface overflow-hidden flex flex-col items-center justify-end z-[5] shrink-0 text-static-body-medium-size text-schemes-on-surface">
              <div className="flex flex-col items-start">
                <LinearDeterminateProgressIn
                  progress={50}
                  thickness="4 dp"
                  type="Flat"
                  progress1="50"
                  thickness1="4 dp"
                  type1="Flat"
                  progress2="50"
                  thickness2="4 dp"
                  type2="Flat"
                />
              </div>
              <div className="w-[789px] h-16 bg-schemes-surface-container flex items-center py-0 pl-0 pr-5 box-border gap-4">
                <img
                  className="h-16 w-16 relative object-cover"
                  loading="lazy"
                  alt=""
                  src="/Image@2x.png"
                />
                <div className="flex-1 flex flex-col items-start justify-center gap-0.5">
                  <div className="self-stretch relative tracking-static-body-medium-tracking leading-static-body-medium-line-height">
                    아주에서 만난 새로운 세계🌍 | 대학생 브이로그 | 아주대학교
                    VLOG - [아주캠퍼스] EP.02
                  </div>
                  <a
                    className="self-stretch relative text-static-body-small-size [text-decoration:underline] tracking-static-body-small-tracking leading-static-body-small-line-height text-schemes-on-surface-variant"
                    href="https://www.youtube.com/@-ajouuniversity4682"
                    target="_blank"
                  >
                    아주대학교-Ajou University
                  </a>
                </div>
                <div className="flex items-start">
                  <IconButtonStandard
                    size="Small"
                    state="Enabled"
                    type="Round"
                    width="Default"
                    showLeadingIcon
                    leadingIconHeight="48px"
                    leadingIconWidth="48px"
                    leadingIconBorder="none"
                    leadingIconPadding="0"
                    leadingIconBackgroundColor="transparent"
                  />
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
