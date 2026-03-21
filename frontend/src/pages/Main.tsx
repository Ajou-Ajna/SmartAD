import { FunctionComponent, useState, useCallback } from "react";
import { Button } from "@mui/material";
import NavigationRail1 from "../components/NavigationRail1";
import IconButtonStandard from "../components/IconButtonStandard";
import { useNavigate } from "react-router-dom";
import CircularIndeterminateProgres from "../components/CircularIndeterminateProgres";
import Switch from "../components/Switch";
import { useAppContext } from "../context/AppContext";

const Main: FunctionComponent = () => {
  const navigate = useNavigate();
  const { addArchiveItem } = useAppContext();
  const [urlInput, setUrlInput] = useState("");

  const onTrailingElementsIconClick = useCallback(() => {
    if (urlInput.trim()) {
      addArchiveItem({
        title: urlInput.trim(),
        type: "url",
        url: urlInput.trim(),
      });
      navigate("/view");
    }
  }, [navigate, urlInput, addArchiveItem]);

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
              <div className="w-[528px] relative text-static-title-medium-size tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium text-schemes-on-surface-variant hidden shrink-0">
                Supporting text
              </div>
            </div>
            <div className="self-stretch h-11 flex flex-col items-center py-0 px-6 box-border gap-2">
              <div className="w-[261px] h-[22px] relative leading-static-display-small-line-height font-medium inline-block shrink-0">
                AI기반 화면해설 방송 자동 생성 솔루션
              </div>
              <div className="w-[528px] relative tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium hidden shrink-0">
                Supporting text
              </div>
            </div>
            <div className="self-stretch flex items-center justify-center p-2.5">
              <div className="h-14 flex-1 rounded-[28px] bg-schemes-surface-container-high overflow-hidden flex items-center justify-center max-w-[720px] mq750:max-w-full">
                <div className="self-stretch w-[720px] flex items-center p-1 box-border relative isolate">
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
                  <div className="self-stretch flex-1 flex items-center py-0 px-5 z-[1] ml-[-16px] relative">
                    <input
                      className="w-full [border:none] [outline:none] bg-[transparent] relative tracking-static-body-large-tracking leading-static-body-large-line-height font-[Roboto] text-static-body-large-size text-schemes-on-surface p-0"
                      placeholder="변환하고 싶은 동영상의 URL을 입력하거나, 검색하고 싶은 동영상의 제목을 입력하세요"
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onTrailingElementsIconClick();
                        }
                      }}
                    />
                  </div>
                  <Button
                    className="h-12 w-12 !!m-[0 important] absolute top-[calc(50%_-_24px)] right-[4px] cursor-pointer z-[2]"
                    disableElevation
                    variant="text"
                    sx={{
                      borderRadius: "0px 0px 0px 0px",
                      width: 48,
                      height: 48,
                    }}
                    onClick={onTrailingElementsIconClick}
                  />
                </div>
              </div>
            </div>
            <div className="w-[519px] h-[22px] relative leading-static-display-small-line-height font-medium inline-block">
              인공지능이 자동 생성하는 해설이므로, 실제 영상 내용과 다소 다를 수
              있습니다.
            </div>
            <section className="self-stretch flex flex-col items-start py-[34px] px-0 gap-[22px] text-left text-[16px] text-[#000] font-[Roboto]">
              <div className="self-stretch rounded-xl bg-schemes-on-primary flex flex-col items-center gap-[23px]">
                <div className="flex items-center">
                  <CircularIndeterminateProgres
                    step={1}
                    thickness="4 dp"
                    type="Flat"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <div className="h-[37px] w-[105px] relative leading-[44px] font-medium inline-block">
                    <span>{`서버상태 : `}</span>
                    <span className="text-[#b6a754]">지연</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="h-[37px] w-[137px] relative leading-[44px] font-medium inline-block">
                    <span>{`네트워크 상태 : `}</span>
                    <span className="text-[#34cd4b]">양호</span>
                  </div>
                </div>
              </div>
              <div className="self-stretch flex items-center justify-center flex-wrap content-center py-0 px-7 gap-[47px] text-center font-[Inter] mq450:gap-[23px]">
                <div className="flex items-center flex-wrap content-center gap-1">
                  <div className="w-[52px] flex flex-col items-start">
                    <Switch icon selected state="Enabled" icon1="/Icon.svg" />
                  </div>
                  <div className="h-[18px] w-[196px] relative tracking-[-0.02em] leading-[120%] font-semibold inline-block">
                    Gemini 3.0 Pro API 사용
                  </div>
                </div>
                <div className="flex items-center flex-wrap content-center gap-1">
                  <div className="w-[52px] flex flex-col items-start">
                    <Switch icon selected state="Enabled" icon1="/Icon.svg" />
                  </div>
                  <div className="h-[18px] w-[106px] relative tracking-[-0.02em] leading-[120%] font-semibold inline-block">{`자동 토큰 절약 `}</div>
                </div>
                <div className="flex items-center flex-wrap content-center gap-1">
                  <div className="w-[52px] flex flex-col items-start">
                    <Switch
                      icon
                      selected={false}
                      state="Enabled"
                      icon1="/Icon1.svg"
                    />
                  </div>
                  <div className="h-[18px] w-[141px] relative tracking-[-0.02em] leading-[120%] font-semibold inline-block">
                    합본 오디오 받기
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
    </div>
  );
};

export default Main;
