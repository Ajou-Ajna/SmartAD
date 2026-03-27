import { FunctionComponent, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationRail1 from "../components/NavigationRail1";
import CircularIndeterminateProgres from "../components/CircularIndeterminateProgres";

const PROGRESS_DURATION_MS = 3000;

const ProgressPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const destination: string = (location.state as { destination?: string })?.destination ?? "/view";

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("영상 분석 중...");

  useEffect(() => {
    const steps = [
      { at: 0, text: "영상 분석 중..." },
      { at: 30, text: "음성 구간 감지 중..." },
      { at: 60, text: "해설 오디오 생성 중..." },
      { at: 85, text: "마무리 처리 중..." },
    ];

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / PROGRESS_DURATION_MS) * 100), 99);
      setProgress(pct);

      const step = [...steps].reverse().find((s) => pct >= s.at);
      if (step) setStatusText(step.text);

      if (elapsed >= PROGRESS_DURATION_MS) {
        clearInterval(interval);
        setProgress(100);
        setStatusText("완료!");
        setTimeout(() => navigate(destination), 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [navigate, destination]);

  return (
    <div className="w-full min-h-screen relative bg-schemes-surface flex flex-col items-start py-0 px-[13px] box-border leading-[normal] tracking-[normal]">
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
                영상 처리 중.....
              </div>
              <div className="self-stretch flex items-center justify-center text-[32px] text-[#78d257]">
                <h2 className="m-0 flex-1 relative text-[length:inherit] tracking-static-body-large-tracking leading-static-body-large-line-height font-medium font-[inherit] mq450:text-[19px] mq450:leading-[14px] mq750:text-[26px] mq750:leading-[19px]">
                  {progress}%
                </h2>
              </div>
              <div className="w-[113px] flex items-center">
                <CircularIndeterminateProgres
                  step={1}
                  thickness="4 dp"
                  type="Flat"
                  circularIndeterminateProgresHeight="113px"
                  circularIndeterminateProgresWidth="unset"
                  circularIndeterminateProgresFlex="1"
                />
              </div>
              <div className="self-stretch relative tracking-static-body-large-tracking leading-static-body-large-line-height">
                {statusText}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
