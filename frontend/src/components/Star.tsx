import { FunctionComponent, type CSSProperties } from "react";

export type StarType = {
  className?: string;
  iconEnd?: React.ReactNode;
  iconStart?: React.ReactNode;
  hasIconEnd?: boolean;
  hasIconStart?: boolean;
  label?: string;
  iconStart1?: React.ReactNode;

  /** Variant props */
  size?: CSSProperties["size"];
  state?: CSSProperties["state"];
  variant?: CSSProperties["variant"];
};

const getStarStyle = (styleKey: string) => {
  switch (styleKey) {
    case "Medium-Default-Subtle":
      return "[&]:[border:unset] [&]:bg-[unset]";
  }
};
const getStarIconStyle = (styleKey: string) => {
  switch (styleKey) {
    case "Medium-Default-Subtle":
      return "[&]:hidden";
  }
};
const getButtonText1Style = (styleKey: string) => {
  switch (styleKey) {
    case "Medium-Default-Subtle":
      return "[&]:text-[#303030]";
  }
};
const getXIconStyle = (styleKey: string) => {
  switch (styleKey) {
    case "Medium-Default-Subtle":
      return "[&]:hidden";
  }
};

const Star: FunctionComponent<StarType> = ({
  className = "",
  size = "Medium",
  state = "Default",
  variant = "Primary",
  iconEnd,
  iconStart,
  hasIconEnd = false,
  hasIconStart = false,
  label = "가입",
  iconStart1,
}) => {
  const variantKey = [size, state, variant].join("-");

  return (
    <button
      className={`cursor-pointer border-[#2c2c2c] border-solid border-stroke-border py-3 px-6 bg-[#2c2c2c] flex-1 rounded-radius-200 overflow-hidden flex items-center justify-center gap-space-200 ${getStarStyle(variantKey)} ${className}`}
    >
      {hasIconStart && iconStart1}
      <div
        className={`relative text-[16px] leading-[100%] font-[Inter] text-[#f5f5f5] text-center whitespace-nowrap ${getButtonText1Style(variantKey)}`}
      >
        {label}
      </div>
      {hasIconEnd && iconEnd}
    </button>
  );
};

export default Star;
