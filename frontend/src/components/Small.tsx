import { FunctionComponent, type CSSProperties } from "react";
import Stars from "./Stars";

export type SmallType = {
  className?: string;
  showIcon?: boolean;
  showLabelText?: boolean;
  labelText?: string;
  iconSelected?: React.ReactNode;
  icon?: React.ReactNode;

  /** Variant props */
  selected?: CSSProperties["selected"];
  state?: CSSProperties["state"];
};

const Small: FunctionComponent<SmallType> = ({
  className = "",
  selected = false,
  state = "Enabled",
  showIcon = true,
  showLabelText = true,
  labelText = "Download",
  iconSelected,
  icon,
}) => {
  return (
    <button
      className={`cursor-pointer [border:none] p-0 bg-schemes-secondary-container !!m-[0 important] absolute top-[0px] left-[0px] rounded-lg overflow-hidden flex flex-col items-center justify-center min-w-[48px] z-[0] shrink-0 ${className}`}
    >
      <div className="w-full rounded overflow-hidden flex items-center justify-center py-2.5 px-4 box-border relative isolate gap-2 max-w-full">
        {iconSelected}
        {iconSelected}
        {!!showLabelText && (
          <div className="relative text-static-label-large-size tracking-static-label-large-tracking leading-static-label-large-line-height font-medium font-[Roboto] text-schemes-on-secondary-container text-left z-[0]">
            {labelText}
          </div>
        )}
      </div>
    </button>
  );
};

export default Small;
