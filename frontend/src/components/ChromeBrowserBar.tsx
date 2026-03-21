import { FunctionComponent, useMemo, type CSSProperties } from "react";

export type ChromeBrowserBarType = {
  className?: string;
  text?: string;

  /** Style props */
  chromeBrowserBarWidth?: CSSProperties["width"];
};

const ChromeBrowserBar: FunctionComponent<ChromeBrowserBarType> = ({
  className = "",
  chromeBrowserBarWidth,
  text,
}) => {
  const chromeBrowserBarStyle: CSSProperties = useMemo(() => {
    return {
      width: chromeBrowserBarWidth,
    };
  }, [chromeBrowserBarWidth]);

  return (
    <header
      className={`self-stretch shadow-[0px_-0.6px_0px_rgba(0,_0,_0,_0.05)_inset,_0px_0.6px_0px_rgba(0,_0,_0,_0.15)] bg-schemes-surface flex items-center p-4 gap-4 top-[0] z-[99] sticky shrink-0 text-left text-static-body-large-size text-schemes-on-surface font-[Roboto] ${className}`}
      style={chromeBrowserBarStyle}
    >
      <div className="flex items-center gap-3">
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
      <div className="flex-1 rounded-[46.1px] bg-schemes-surface-container overflow-hidden flex items-center justify-between py-1.5 px-4 gap-0">
        <div className="flex-1 flex items-center gap-2">
          <img
            className="h-[15.4px] w-[15.4px] relative"
            alt=""
            src="/lock.svg"
          />
          <div className="flex-1 relative tracking-static-body-large-tracking leading-static-body-large-line-height">
            {text}
          </div>
        </div>
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] h-5 w-5 relative"
          alt=""
          src="/star.svg"
        />
      </div>
      <img
        className="cursor-pointer [border:none] p-0 bg-[transparent] h-6 w-6 relative"
        alt=""
        src="/more.svg"
      />
    </header>
  );
};

export default ChromeBrowserBar;
