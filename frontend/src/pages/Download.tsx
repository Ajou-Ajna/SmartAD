import { FunctionComponent } from "react";
import { useLocation } from "react-router-dom";
import NavigationRail1 from "../components/NavigationRail1";
import { useAppContext } from "../context/AppContext";

const Download: FunctionComponent = () => {
  const { currentItem } = useAppContext();
  const location = useLocation();
  const audioUrlFromBackend = (location.state as any)?.audioUrl;
  const downloadUrl = audioUrlFromBackend
    ? (audioUrlFromBackend.startsWith("http") ? audioUrlFromBackend : `/api/storage/stream?url=${encodeURIComponent(audioUrlFromBackend)}`)
    : "/dummy_audio.wav";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = currentItem?.audioFileName || "smartadv_audio.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen relative bg-schemes-surface overflow-hidden flex flex-col items-start pt-0 px-0 pb-0 box-border leading-[normal] tracking-[normal]">
      <main className="self-stretch flex-1 flex items-start py-[5px] px-0 gap-0 text-left text-[16px] text-[#000] font-[Roboto]">
        <NavigationRail1
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
        <section className="flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center gap-3.5 text-left text-[16px] text-[#000] font-[Roboto]">
          <div className="w-[817px] flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center gap-3.5 max-w-full shrink-0">
            <div className="self-stretch flex flex-col items-center py-0 px-6 gap-2 text-static-display-small-size text-schemes-on-surface">
              <h1 className="m-0 self-stretch relative text-[length:inherit] leading-static-display-small-line-height font-medium font-[inherit] shrink-0 mq750:text-[29px] mq750:leading-[35px] mq450:text-[22px] mq450:leading-[26px]">
                SmartADV
              </h1>
            </div>
            <div className="self-stretch flex flex-col items-center py-0 px-6 gap-2 text-schemes-on-surface-variant">
              <div className="self-stretch relative leading-static-display-small-line-height font-medium shrink-0">
                AI기반 화면해설 방송 자동 생성 솔루션
              </div>
            </div>
            <div className="self-stretch flex items-center pt-12 px-[60px] pb-2 box-border gap-4 max-w-full mq750:flex-wrap mq750:px-6">
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="relative text-[16px] leading-[24px] font-medium text-[#1e1e1e]">
                  {currentItem?.audioFileName || "smartadv_audio.wav"}
                </div>
                <div className="relative text-[14px] leading-[20px] text-[#696767]">
                  원본 비디오: {currentItem?.title || "업로드된 영상"}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button
                  className="cursor-pointer border-schemes-outline border-solid border-[1px] py-2 px-6 bg-schemes-surface-container-lowest rounded-[100px] flex items-center gap-2 hover:bg-schemes-surface-container"
                  onClick={handleDownload}
                >
                  <span className="material-icons text-[20px] text-schemes-on-surface">download</span>
                  <span className="relative text-static-label-large-size tracking-static-label-large-tracking leading-static-label-large-line-height font-medium font-[Roboto] text-schemes-on-surface">
                    Download
                  </span>
                </button>
                <div className="relative text-[14px] tracking-[0.5px] leading-[21px] font-medium text-[#696767]">
                  {currentItem?.audioSize || "12MB"}
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-center py-4 px-[60px] gap-2 mq750:px-6">
              <div className="self-stretch text-[14px] font-medium font-[Inter] text-schemes-on-surface-variant">
                오디오 미리듣기
              </div>
              <audio className="w-full" style={{ maxWidth: "640px" }} controls src={downloadUrl}>
                브라우저가 오디오를 지원하지 않습니다.
              </audio>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Download;
