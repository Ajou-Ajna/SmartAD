import { FunctionComponent, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationRail1 from "../components/NavigationRail1";

const ProgressPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const destination: string = (location.state as { destination?: string })?.destination ?? "/view";

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("영상 업로드 중...");
  const [statusDetail, setStatusDetail] = useState("");

  useEffect(() => {
    const videoId = (location.state as any)?.videoId;
    if (!videoId) {
        setStatusText("업로드된 영상이 없습니다.");
        return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${videoId}`);
        if (res.ok) {
          const job = await res.json();
          setProgress(job.progress || 0);

          let text = job.status;
          if (job.status === "PREPROCESSING") text = "영상 분석 및 센서 감지 중...";
          else if (job.status === "SCRIPT_GENERATING") text = "해설 대본 작성 중...";
          else if (job.status === "TTS_GENERATING") text = "해설 음성 합성 중...";
          else if (job.status === "DONE") text = "완료!";
          else if (job.status === "PENDING") text = "작업 대기 중...";

          setStatusText(text);
          if (job.statusDetail) {
            setStatusDetail(job.statusDetail);
          }

          if (job.status === "DONE") {
            clearInterval(interval);
            // Get the resulting audio url
            const resultRes = await fetch(`/api/results/video/${videoId}`);
            let audioUrl = "";
            let videoUrl = "";
            if (resultRes.ok) {
               const resultData = await resultRes.json();
               audioUrl = resultData.narrationAudioPath;
               videoUrl = resultData.mergedVideoPath;
            }
            setTimeout(() => navigate(destination, { state: { videoId, audioUrl, videoUrl } }), 600);
          } else if (job.status === "FAILED") {
            clearInterval(interval);
            setStatusText("작업 실패!");
            if (job.statusDetail) setStatusDetail(job.statusDetail);
          }
        }
      } catch (e) {
        console.error("Polling Error", e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [navigate, destination, location.state]);

  const isDone = statusText === "완료!";
  const isFailed = statusText === "작업 실패!";
  const isActive = !isDone && !isFailed;

  return (
    <div className="w-full min-h-screen relative bg-schemes-surface flex flex-col items-start py-0 px-[13px] box-border leading-[normal] tracking-[normal]">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .spinner {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 5px solid rgba(120, 210, 87, 0.15);
          border-top-color: #78d257;
          animation: spin 1s linear infinite;
        }
        .pulse-text {
          animation: pulse 2s ease-in-out infinite;
        }
        .progress-ring {
          width: 120px;
          height: 120px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .progress-ring svg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform: rotate(-90deg);
        }
        .progress-ring circle {
          fill: none;
          stroke-width: 5;
        }
        .progress-ring .track {
          stroke: rgba(120, 210, 87, 0.12);
        }
        .progress-ring .fill {
          stroke: #78d257;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.6s ease;
        }
      `}</style>
      <main className="self-stretch flex-1 flex items-start justify-between py-[5px] px-0 gap-0 text-left text-[16px] text-schemes-on-surface-variant font-[Roboto]">
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
        <div className="flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center py-7 px-0 gap-3.5 mq675:pt-5 mq675:pb-5 mq675:box-border">
          <div className="self-stretch flex flex-col items-center py-0 px-6 gap-2 text-static-display-small-size text-schemes-on-surface">
            <h1 className="m-0 relative text-[length:inherit] leading-static-display-small-line-height font-medium font-[inherit] shrink-0 mq450:text-[22px] mq450:leading-[26px] mq750:text-[29px] mq750:leading-[35px]">
              SmartADV
            </h1>
          </div>
          <div className="self-stretch h-11 flex flex-col items-center py-0 px-6 box-border gap-2">
            <div className="w-[261px] h-[22px] relative leading-static-display-small-line-height font-medium inline-block shrink-0">
              AI기반 화면해설 방송 자동 생성 솔루션
            </div>
          </div>

          <div className="self-stretch flex items-center py-[9px] px-0 text-center text-schemes-on-surface">
            <div className="flex-1 flex flex-col items-center gap-[22px]">
              <div className="self-stretch relative tracking-static-body-large-tracking leading-static-body-large-line-height">
                {isActive ? "영상 처리 중....." : statusText}
              </div>

              {/* Progress Ring with percentage */}
              <div className="progress-ring">
                <svg viewBox="0 0 120 120">
                  <circle className="track" cx="60" cy="60" r="54" />
                  <circle
                    className="fill"
                    cx="60" cy="60" r="54"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - progress / 100)}
                  />
                </svg>
                {isActive && <div className="spinner" style={{ position: 'absolute' }} />}
                <span
                  className="relative text-[28px] font-medium"
                  style={{ color: isFailed ? '#e53935' : '#78d257', zIndex: 1 }}
                >
                  {progress}%
                </span>
              </div>

              {/* Main status */}
              <div
                className="self-stretch relative tracking-static-body-large-tracking leading-static-body-large-line-height font-medium"
                style={{ fontSize: '15px' }}
              >
                {statusText}
              </div>

              {/* Detail status */}
              {statusDetail && (
                <div
                  className={`self-stretch relative tracking-static-body-large-tracking leading-static-body-large-line-height text-schemes-on-surface-variant ${isActive ? 'pulse-text' : ''}`}
                  style={{ fontSize: '13px', marginTop: '-12px' }}
                >
                  {statusDetail}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
