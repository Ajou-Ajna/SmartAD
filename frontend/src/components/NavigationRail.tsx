import {
  FunctionComponent,
  useMemo,
  type CSSProperties,
  useCallback,
} from "react";
import IconButtonStandard from "./IconButtonStandard";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export type NavigationRailType = {
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
  iconContainerBorder?: CSSProperties["border"];
  iconContainerPadding?: CSSProperties["padding"];
  archiveIconBorder?: CSSProperties["border"];
  archiveIconPadding?: CSSProperties["padding"];
  archiveIconBackgroundColor?: CSSProperties["backgroundColor"];
  iconBorder?: CSSProperties["border"];
  iconPadding?: CSSProperties["padding"];
  iconBackgroundColor?: CSSProperties["backgroundColor"];
  starFilledIconBorder?: CSSProperties["border"];
  starFilledIconPadding?: CSSProperties["padding"];
  starFilledIconBackgroundColor?: CSSProperties["backgroundColor"];
  settingsIconBorder?: CSSProperties["border"];
  settingsIconPadding?: CSSProperties["padding"];
  settingsIconBackgroundColor?: CSSProperties["backgroundColor"];
};

const NavigationRail: FunctionComponent<NavigationRailType> = ({
  className = "",
  iconContainerBorder,
  iconContainerPadding,
  archiveIconBorder,
  archiveIconPadding,
  archiveIconBackgroundColor,
  iconBorder,
  iconPadding,
  iconBackgroundColor,
  starFilledIconBorder,
  starFilledIconPadding,
  starFilledIconBackgroundColor,
  settingsIconBorder,
  settingsIconPadding,
  settingsIconBackgroundColor,
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
  const iconContainerStyle: CSSProperties = useMemo(() => {
    return {
      border: iconContainerBorder,
      padding: iconContainerPadding,
    };
  }, [iconContainerBorder, iconContainerPadding]);

  const archiveIconStyle: CSSProperties = useMemo(() => {
    return {
      border: archiveIconBorder,
      padding: archiveIconPadding,
      backgroundColor: archiveIconBackgroundColor,
    };
  }, [archiveIconBorder, archiveIconPadding, archiveIconBackgroundColor]);

  const iconStyle: CSSProperties = useMemo(() => {
    return {
      border: iconBorder,
      padding: iconPadding,
      backgroundColor: iconBackgroundColor,
    };
  }, [iconBorder, iconPadding, iconBackgroundColor]);

  const starFilledIconStyle: CSSProperties = useMemo(() => {
    return {
      border: starFilledIconBorder,
      padding: starFilledIconPadding,
      backgroundColor: starFilledIconBackgroundColor,
    };
  }, [
    starFilledIconBorder,
    starFilledIconPadding,
    starFilledIconBackgroundColor,
  ]);

  const settingsIconStyle: CSSProperties = useMemo(() => {
    return {
      border: settingsIconBorder,
      padding: settingsIconPadding,
      backgroundColor: settingsIconBackgroundColor,
    };
  }, [settingsIconBorder, settingsIconPadding, settingsIconBackgroundColor]);

  const navigate = useNavigate();
  const { user, logout } = useAppContext();

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
      className={`min-h-screen w-[72px] overflow-hidden shrink-0 flex flex-col items-center pt-11 px-0 pb-14 box-border gap-[78px] text-center text-static-label-medium-size text-schemes-secondary font-[Roboto] ${className}`}
    >
      <div className="flex flex-col items-center gap-[13px] shrink-0">
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
          onClick={() => {
            if (user) {
              if (window.confirm("로그아웃 하시겠습니까?")) {
                logout();
              }
            } else {
              navigate("/login");
            }
          }}
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
          <button
            className="cursor-pointer [border:none] p-0 bg-schemes-secondary-container rounded-2xl overflow-hidden flex flex-col items-center justify-center"
            style={iconContainerStyle}
          >
            <div className="w-14 h-8 flex items-center justify-center relative isolate">
              <img
                className="cursor-pointer [border:none] p-0 bg-[transparent] w-6 relative max-h-full z-[0]"
                alt=""
                src="/archive.svg"
                style={archiveIconStyle}
              />
              <img
                className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 absolute !!m-[0 important] top-[calc(50%_-_12px)] left-[calc(50%_-_12px)] z-[1]"
                alt=""
                style={iconStyle}
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
            style={starFilledIconStyle}
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
          style={settingsIconStyle}
        />
        <div className="self-stretch relative tracking-static-label-medium-tracking leading-static-label-medium-line-height font-medium">
          Settings
        </div>
      </div>
    </div>
  );
};

export default NavigationRail;
