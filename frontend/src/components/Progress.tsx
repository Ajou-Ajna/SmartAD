import { FunctionComponent, useState } from "react";
import NavigationRail1 from "./NavigationRail1";
import IconButtonStandard from "./IconButtonStandard";
import CircularIndeterminateProgres from "./CircularIndeterminateProgres";
import Switch from "./Switch";

export type ProgressType = {
  className?: string;
};

const Progress: FunctionComponent<ProgressType> = ({ className = "" }) => {
  const [iconButtonStandardItems] = useState([
    {
      size: "Small" as const,
      state: "Enabled" as const,
      type: "Round" as const,
      width: "Default" as const,
      showLeadingIcon: false,
      leadingIconHeight: undefined,
      leadingIconWidth: "30.5px" as const,
      leadingIconBorder: undefined,
      leadingIconPadding: undefined,
      leadingIconBackgroundColor: undefined,
    },
    {
      size: "Small" as const,
      state: "Enabled" as const,
      type: "Round" as const,
      width: "Default" as const,
      showLeadingIcon: true,
      leadingIconHeight: undefined,
      leadingIconWidth: "30.5px" as const,
      leadingIconBorder: undefined,
      leadingIconPadding: undefined,
      leadingIconBackgroundColor: undefined,
    },
    {
      size: "Small" as const,
      state: "Enabled" as const,
      type: "Round" as const,
      width: "Default" as const,
      showLeadingIcon: true,
      leadingIconHeight: undefined,
      leadingIconWidth: "unset" as const,
      leadingIconBorder: "unset" as const,
      leadingIconPadding: "unset" as const,
      leadingIconBackgroundColor: "unset" as const,
    },
  ]);
  return (
    <div
      className={`w-[913px] h-[706px] rounded-[18px] bg-schemes-surface max-w-full overflow-hidden flex flex-col items-start py-0 px-[13px] box-border leading-[normal] tracking-[normal] ${className}`}
    >
      <section className="w-[871px] flex flex-col items-start">
        <header className="self-stretch h-14 shadow-[0px_-0.6px_0px_rgba(0,_0,_0,_0.05)_inset,_0px_0.6px_0px_rgba(0,_0,_0,_0.15)] bg-schemes-surface flex items-center p-4 box-border gap-4 top-[0] z-[99] sticky">
          <div className="flex items-center gap-3 shrink-0">
            <img
              className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 relative"
              alt=""
              src="/back.svg"
            />
            <img
              className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 relative"
              alt=""
              src="/forward.svg"
            />
            <img
              className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 relative"
              alt=""
              src="/refresh.svg"
            />
          </div>
          <div className="flex-1 rounded-[46.1px] bg-schemes-surface-container overflow-hidden flex items-center justify-between py-1.5 px-4 gap-0 shrink-0">
            <div className="flex-1 flex items-center gap-2">
              <img
                className="h-[15.4px] w-[15.4px] relative"
                alt=""
                src="/lock.svg"
              />
              <input
                className="w-[calc(100%_-_35.4px)] [border:none] [outline:none] font-[Roboto] text-static-body-large-size bg-[transparent] h-6 flex-1 relative tracking-static-body-large-tracking leading-static-body-large-line-height text-schemes-on-surface text-left inline-block min-w-[250px] p-0"
                placeholder="www.smartadv.com/upload"
                type="text"
              />
            </div>
            <img
              className="cursor-pointer [border:none] p-0 bg-[transparent] h-5 w-5 relative"
              alt=""
              src="/star.svg"
            />
          </div>
          <img
            className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 relative shrink-0"
            alt=""
            src="/more.svg"
          />
        </header>
        <main className="self-stretch flex items-start justify-between py-[5px] px-0 gap-0">
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
          <section className="self-stretch flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center py-7 px-0 gap-3.5 text-left text-[16px] text-[#000] font-[Roboto] mq750:pt-5 mq750:pb-5 mq750:box-border">
            <div className="self-stretch h-12 flex items-start flex-wrap content-start py-0 px-[13px] box-border gap-[23px]">
              <div className="h-12 flex items-center">
                <div className="flex items-center p-2.5 shrink-0">
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
                </div>
                <div className="w-[245px] relative leading-[44px] font-medium inline-block shrink-0">
                  환영합니다, Guest
                </div>
              </div>
              <div className="h-[15px] flex-1 relative min-w-[125px] text-schemes-on-surface-variant">
                <div className="absolute top-[52px] left-[0px] tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium hidden shrink-0">
                  Supporting text
                </div>
              </div>
              <div className="w-[101px] overflow-hidden shrink-0 flex items-center gap-[31px]">
                {iconButtonStandardItems.map((item, index) => (
                  <IconButtonStandard
                    key={index}
                    size={item.size}
                    state={item.state}
                    type={item.type}
                    width={item.width}
                    showLeadingIcon={item.showLeadingIcon}
                    leadingIconHeight={item.leadingIconHeight}
                    leadingIconWidth={item.leadingIconWidth}
                    leadingIconBorder={item.leadingIconBorder}
                    leadingIconPadding={item.leadingIconPadding}
                    leadingIconBackgroundColor={item.leadingIconBackgroundColor}
                  />
                ))}
              </div>
            </div>
            <div className="self-stretch flex flex-col items-center py-0 px-6 gap-2 text-static-display-small-size text-schemes-on-surface">
              <h1 className="m-0 relative text-[length:inherit] leading-static-display-small-line-height font-medium font-[inherit] shrink-0 mq450:text-[22px] mq450:leading-[26px] mq750:text-[29px] mq750:leading-[35px]">
                SmartADV
              </h1>
              <div className="w-[528px] relative text-static-title-medium-size tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium text-schemes-on-surface-variant hidden shrink-0">
                Supporting text
              </div>
            </div>
            <div className="self-stretch h-11 flex flex-col items-center py-0 px-6 box-border text-schemes-on-surface-variant">
              <div className="relative leading-static-display-small-line-height font-medium">
                AI기반 화면해설 방송 자동 생성 솔루션
              </div>
            </div>
            <div className="self-stretch flex items-center py-[9px] px-0 text-center">
              <div className="flex-1 flex flex-col items-center gap-[22px]">
                <div className="self-stretch relative tracking-static-body-large-tracking leading-static-body-large-line-height">
                  영상 처리 중.....
                </div>
                <div className="self-stretch flex items-center justify-center text-[32px] text-[#78d257]">
                  <h2 className="m-0 flex-1 relative text-[length:inherit] tracking-static-body-large-tracking leading-static-body-large-line-height font-medium font-[inherit] mq450:text-[19px] mq450:leading-[14px] mq750:text-[26px] mq750:leading-[19px]">
                    73%
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
                  Loading Demucs Libraries..
                </div>
              </div>
            </div>
            <div className="self-stretch flex items-center justify-center flex-wrap content-center py-0 px-7 gap-[47px] text-center font-[Inter] mq750:gap-[23px]">
              <div className="flex items-center flex-wrap content-center gap-1">
                <div className="w-[52px] flex flex-col items-start">
                  <Switch icon selected state="Enabled" icon1="/Icon.svg" />
                </div>
                <div className="relative tracking-[-0.02em] leading-[120%] font-semibold">
                  끝나면 알림 받기
                </div>
              </div>
              <div className="flex items-center flex-wrap content-center gap-1">
                <div className="w-[52px] flex flex-col items-start">
                  <Switch icon selected state="Enabled" icon1="/Icon.svg" />
                </div>
                <div className="relative tracking-[-0.02em] leading-[120%] font-semibold">
                  진행률 실시간 업데이트
                </div>
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
                <div className="relative tracking-[-0.02em] leading-[120%] font-semibold">
                  작업 완료 시 창닫기
                </div>
              </div>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
};

export default Progress;
