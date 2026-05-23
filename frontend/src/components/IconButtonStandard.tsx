import { FunctionComponent, useMemo, type CSSProperties } from "react";
import { useAppContext } from "../context/AppContext";

export type IconButtonStandardType = {
  className?: string;
  showLeadingIcon?: boolean;
  onClick?: () => void;

  /** Variant props */
  size?: CSSProperties["size"];
  state?: CSSProperties["state"];
  type?: CSSProperties["type"];
  width?: CSSProperties["width"];

  /** Style props */
  leadingIconHeight?: CSSProperties["height"];
  leadingIconWidth?: CSSProperties["width"];
  leadingIconBorder?: CSSProperties["border"];
  leadingIconPadding?: CSSProperties["padding"];
  leadingIconBackgroundColor?: CSSProperties["backgroundColor"];
};

const getContentIconStyle = (styleKey: string) => {
  switch (styleKey) {
    case "Medium-Enabled-Square-Default":
      return "[&]:[border:unset] [&]:p-[unset] [&]:bg-[unset] [&]:h-14 [&]:w-14 [&]:rounded-2xl";
  }
};

const IconButtonStandard: FunctionComponent<IconButtonStandardType> = ({
  className = "",
  size = "Small",
  state = "Enabled",
  type = "Round",
  width = "Default",
  showLeadingIcon,
  onClick,
  leadingIconHeight,
  leadingIconWidth,
  leadingIconBorder,
  leadingIconPadding,
  leadingIconBackgroundColor,
}) => {
  const { user } = useAppContext();
  const variantKey = [size, state, type, width].join("-");

  const leadingIconStyle: CSSProperties = useMemo(() => {
    return {
      height: leadingIconHeight,
      width: leadingIconWidth,
      border: leadingIconBorder,
      padding: leadingIconPadding,
      backgroundColor: leadingIconBackgroundColor,
    };
  }, [
    leadingIconHeight,
    leadingIconWidth,
    leadingIconBorder,
    leadingIconPadding,
    leadingIconBackgroundColor,
  ]);

  return (
    !!showLeadingIcon && (
      <button
        className={`cursor-pointer [border:none] p-0 bg-[transparent] h-12 w-12 flex items-center justify-center ${className}`}
        style={leadingIconStyle}
        onClick={onClick}
      >
        <img
          className={`cursor-pointer [border:none] p-0 bg-[transparent] h-10 w-10 rounded-[100px] object-cover ${getContentIconStyle(variantKey)}`}
          alt=""
          src={user && user.picture ? user.picture : "/Content1.svg"}
        />
      </button>
    )
  );
};

export default IconButtonStandard;
