import { FunctionComponent, type CSSProperties } from "react";
import Star from "./Star";

export type ButtonGroupType = {
  className?: string;
  buttonEnd?: boolean;
  buttonStart?: boolean;
  buttonSize?: CSSProperties["size"];
  buttonSize1?: CSSProperties["size"];
  buttonState?: CSSProperties["state"];
  buttonState1?: CSSProperties["state"];
  buttonVariant?: CSSProperties["variant"];
  buttonVariant1?: CSSProperties["variant"];
  buttonLabel?: string;
  buttonLabel1?: string;
  buttonHasIconEnd?: boolean;
  buttonHasIconStart?: boolean;

  /** Variant props */
  align?: CSSProperties["align"];
};

const ButtonGroup: FunctionComponent<ButtonGroupType> = ({
  className = "",
  align = "Justify",
  buttonEnd = true,
  buttonStart = true,
  buttonSize,
  buttonSize1,
  buttonState,
  buttonState1,
  buttonVariant = "Primary",
  buttonVariant1 = "Primary",
  buttonLabel,
  buttonLabel1,
  buttonHasIconEnd,
  buttonHasIconStart,
}) => {
  return (
    <div className={`w-60 flex items-center gap-space-400 ${className}`}>
      {!!buttonStart && (
        <Star
          size={buttonSize}
          state={buttonState}
          variant={buttonVariant}
          iconEnd={<img className="h-4 w-4 relative hidden" alt="" />}
          iconStart={null}
          hasIconEnd={false}
          hasIconStart={false}
          label={buttonLabel}
        />
      )}
      {!!buttonEnd && (
        <Star
          size={buttonSize1}
          state={buttonState1}
          variant={buttonVariant1}
          iconEnd={
            <img
              className="h-4 w-4 relative"
              alt=""
            />
          }
          iconStart={
            <img
              className="h-4 w-4 relative"
              alt=""
            />
          }
          hasIconEnd={buttonHasIconEnd}
          hasIconStart={buttonHasIconStart}
          label={buttonLabel1}
          iconStart1={
            <img
              className="h-4 w-4 relative"
              alt=""
            />
          }
        />
      )}
    </div>
  );
};

export default ButtonGroup;
