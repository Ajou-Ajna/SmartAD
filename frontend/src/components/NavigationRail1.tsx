import {
  FunctionComponent,
  useMemo,
  type CSSProperties,
  useCallback,
} from "react";
import IconButtonStandard from "./IconButtonStandard";
import { useNavigate } from "react-router-dom";

export type NavigationRail1Type = {
  className?: string;
  size?: CSSProperties["size"];
  state?: CSSProperties["state"];
  type?: CSSProperties["type"];
  width?: CSSProperties["width"];
  showLeadingIcon?: boolean;
  leadingIconHeight?: CSSProperties["height"];
  leadingIconWidth?: CSSProperties["width"];
  leadingIconBorder?: CSSProperties["border"];
  leadingIconPadding?: CSSProperties["padding"];
  leadingIconBackgroundColor?: CSSProperties["backgroundColor"];

  /** Style props */
  navigationRailPosition?: CSSProperties["position"];
  navigationRailTop?: CSSProperties["top"];
  navigationRailLeft?: CSSProperties["left"];
  menuFabPadding?: CSSProperties["padding"];
};

const NavigationRail1: FunctionComponent<NavigationRail1Type> = ({
  className = "",
  navigationRailPosition,
  navigationRailTop,
  navigationRailLeft,
  menuFabPadding,
  size = "Small",
  state,
  type = "Round",
  width,
  showLeadingIcon,
  leadingIconHeight,
  leadingIconWidth,
  leadingIconBorder,
  leadingIconPadding,
  leadingIconBackgroundColor,
}) => {
  const navigationRailStyle: CSSProperties = useMemo(() => {
    return {
      position: navigationRailPosition,
      top: navigationRailTop,
      left: navigationRailLeft,
    };
  }, [navigationRailPosition, navigationRailTop, navigationRailLeft]);

  const menuFabStyle: CSSProperties = useMemo(() => {
    return {
      padding: menuFabPadding,
    };
  }, [menuFabPadding]);

  const navigate = useNavigate();

  const onUploadClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onFABClick = useCallback(() => {
    navigate("/url");
  }, [navigate]);

  const onArchiveClick = useCallback(() => {
    navigate("/archive");
  }, [navigate]);

  const onLikesClick = useCallback(() => {
    navigate("/likes");
  }, [navigate]);

  return (
    <div
      className={`min-h-screen w-[72px] overflow-hidden shrink-0 flex flex-col items-center pt-11 px-0 pb-14 box-border gap-[78px] text-center text-static-label-medium-size text-schemes-secondary font-[Roboto] mq750:pt-[29px] mq750:pb-9 mq750:box-border ${className}`}
      style={navigationRailStyle}
    >
      <div
        className="flex flex-col items-center gap-[13px] shrink-0"
        style={menuFabStyle}
      >
        <IconButtonStandard
          size={size}
          state={state}
          type={type}
          width={width}
          showLeadingIcon={showLeadingIcon}
          leadingIconHeight={leadingIconHeight}
          leadingIconWidth={leadingIconWidth}
          leadingIconBorder={leadingIconBorder}
          leadingIconPadding={leadingIconPadding}
          leadingIconBackgroundColor={leadingIconBackgroundColor}
          onClick={() => navigate("/login")}
        />
        <div className="w-[62px] h-[75px] flex flex-col items-center gap-1 cursor-pointer" onClick={onUploadClick}>
          <div className="flex items-start py-0 px-[3px]">
            <img
              className="h-14 w-14 rounded-corner-large"
              loading="lazy"
              alt=""
              src="/FAB1.svg"
            />
          </div>
          <div className="w-[62px] h-[15px] relative tracking-static-label-medium-tracking leading-static-label-medium-line-height font-medium inline-block text-center">
            Upload
          </div>
        </div>
        <div className="w-[62px] h-[75px] flex flex-col items-center gap-1 cursor-pointer" onClick={onFABClick}>
          <div className="flex items-start py-0 px-[3px]">
            <img
              className="h-14 w-14 rounded-corner-large"
              loading="lazy"
              alt=""
              src="/FAB.svg"
            />
          </div>
          <div className="w-[62px] h-[15px] relative tracking-static-label-medium-tracking leading-static-label-medium-line-height font-medium inline-block text-center">
            URL
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start gap-1 shrink-0">
        <div className="self-stretch flex flex-col items-center justify-center py-1.5 px-0 gap-1 cursor-pointer" onClick={onArchiveClick}>
          <button className="cursor-pointer [border:none] p-0 bg-schemes-secondary-container rounded-2xl overflow-hidden flex flex-col items-center justify-center">
            <div className="w-14 h-8 flex items-center justify-center relative isolate">
              <img
                className="cursor-pointer [border:none] p-0 bg-[transparent] w-6 relative max-h-full z-[0]"
                alt=""
                src="/archive.svg"
              />
              <img
                className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 absolute !!m-[0 important] top-[calc(50%_-_12px)] left-[calc(50%_-_12px)] z-[1]"
                alt=""
              />
            </div>
          </button>
          <div className="self-stretch relative tracking-static-label-medium-tracking leading-static-label-medium-line-height font-medium">
            Archive
          </div>
        </div>
        <div className="self-stretch flex flex-col items-center justify-center py-1.5 px-0 gap-1 text-schemes-on-surface-variant cursor-pointer" onClick={onLikesClick}>
          <img
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-6 h-6 relative"
            alt=""
            src="/star-filled.svg"
          />
          <div className="self-stretch relative tracking-static-label-medium-tracking leading-static-label-medium-line-height font-medium">
            Likes
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-center justify-center py-1.5 px-0 gap-1 shrink-0 text-schemes-on-surface-variant">
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] w-6 h-6 relative"
          alt=""
          src="/settings.svg"
        />
        <div className="self-stretch relative tracking-static-label-medium-tracking leading-static-label-medium-line-height font-medium">
          Settings
        </div>
      </div>
    </div>
  );
};

export default NavigationRail1;
