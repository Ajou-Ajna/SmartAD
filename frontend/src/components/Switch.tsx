import { FunctionComponent, type CSSProperties } from "react";

export type SwitchType = {
  className?: string;
  icon1?: string;

  /** Variant props */
  icon?: CSSProperties["icon"];
  selected?: CSSProperties["selected"];
  state?: CSSProperties["state"];
};

const getSwitchStyle = (styleKey: string) => {
  switch (styleKey) {
    case "true-false-Enabled":
      return "[&]:bg-schemes-surface-container-highest [&]:[justify-content:unset] [&]:p-1 [&]:border-schemes-outline [&]:border-solid [&]:border-[2px]";
  }
};
const getTargetContainerStyle = (styleKey: string) => {
  switch (styleKey) {
    case "true-false-Enabled":
      return "[&]:right-[unset] [&]:left-[-12px]";
  }
};
const getHandleShapeStyle = (styleKey: string) => {
  switch (styleKey) {
    case "true-false-Enabled":
      return "[&]:bg-schemes-outline";
  }
};
const getContainerStyle = (styleKey: string) => {
  switch (styleKey) {
    case "true-false-Enabled":
      return "[&]:rounded-[100px]";
  }
};
const getIconStyle = (styleKey: string) => {
  switch (styleKey) {
    case "true-false-Enabled":
      return "[&]:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(20%)_saturate(63%)_hue-rotate(236deg)_brightness(109%)_contrast(87%)]";
  }
};

const Switch: FunctionComponent<SwitchType> = ({
  className = "",
  icon = false,
  selected = true,
  state = "Enabled",
  icon1,
}) => {
  const variantKey = [icon, selected, state].join("-");

  return (
    <div
      className={`self-stretch h-8 rounded-[100px] bg-schemes-primary flex items-center justify-end py-0.5 px-1 box-border ${getSwitchStyle(variantKey)} ${className}`}
    >
      <div className="self-stretch flex-1 relative">
        <div
          className={`absolute top-[calc(50%_-_24px)] right-[-12px] flex items-center justify-center p-1 shrink-0 ${getTargetContainerStyle(variantKey)}`}
        >
          <div className="rounded-[100px] flex flex-col items-center justify-center p-2">
            <button
              className={`cursor-pointer [border:none] p-[11px] bg-schemes-on-primary rounded-3xl overflow-hidden flex items-center justify-center relative isolate ${getHandleShapeStyle(variantKey)}`}
            >
              <div
                className={`h-0.5 w-0.5 relative rounded-[23px] z-[0] shrink-0 ${getContainerStyle(variantKey)}`}
              />
              <img
                className={`h-4 w-4 absolute !!m-[0 important] top-[calc(50%_-_8px)] left-[calc(50%_-_8px)] z-[1] shrink-0 ${getIconStyle(variantKey)}`}
                alt=""
                src={icon1}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Switch;
