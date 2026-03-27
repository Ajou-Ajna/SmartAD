import { FunctionComponent, type CSSProperties } from "react";

export type ButtonOutlineType = {
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
  labelText?: string;
  onClick?: () => void;

  /** Variant props */
  size?: CSSProperties["size"];
  state?: CSSProperties["state"];
  type?: CSSProperties["type"];
};

const ButtonOutline: FunctionComponent<ButtonOutlineType> = ({
  className = "",
  size = "Small",
  state = "Enabled",
  type = "Round",
  showIcon = false,
  icon,
  labelText = "파일 선택",
  onClick,
}) => {
  return (
    <div
      className={`h-12 flex items-center justify-center text-left text-static-label-large-size text-schemes-on-surface-variant font-[Roboto] cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="rounded-[100px] border-schemes-outline-variant border-solid border-[1px] overflow-hidden flex flex-col items-center justify-center">
        <div className="flex items-center justify-center py-2.5 px-4 gap-2">
          {icon}
          <div className="relative tracking-static-label-large-tracking leading-static-label-large-line-height font-medium">
            {labelText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonOutline;
