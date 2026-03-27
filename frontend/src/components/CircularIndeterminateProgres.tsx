import { FunctionComponent, useMemo, type CSSProperties } from "react";

export type CircularIndeterminateProgresType = {
  className?: string;

  /** Variant props */
  step?: CSSProperties["step"];
  thickness?: CSSProperties["thickness"];
  type?: CSSProperties["type"];

  /** Style props */
  circularIndeterminateProgresHeight?: CSSProperties["height"];
  circularIndeterminateProgresWidth?: CSSProperties["width"];
  circularIndeterminateProgresFlex?: CSSProperties["flex"];
};

const CircularIndeterminateProgres: FunctionComponent<
  CircularIndeterminateProgresType
> = ({
  className = "",
  step = 1,
  thickness = "4 dp",
  type = "Flat",
  circularIndeterminateProgresHeight,
  circularIndeterminateProgresWidth,
  circularIndeterminateProgresFlex,
}) => {
  const circularIndeterminateProgresStyle: CSSProperties = useMemo(() => {
    return {
      height: circularIndeterminateProgresHeight,
      width: circularIndeterminateProgresWidth,
      flex: circularIndeterminateProgresFlex,
    };
  }, [
    circularIndeterminateProgresHeight,
    circularIndeterminateProgresWidth,
    circularIndeterminateProgresFlex,
  ]);

  return (
    <button
      className={`cursor-pointer [border:none] p-0 bg-[transparent] h-10 w-10 relative ${className}`}
      style={circularIndeterminateProgresStyle}
    >
      <img
        className="absolute h-[47.25%] w-[36%] top-[52.75%] right-[0.75%] bottom-[0%] left-[63.25%] max-w-full overflow-hidden max-h-full object-contain shrink-0"
        loading="lazy"
        alt=""
        src="/Active-indicator.svg"
      />
      <img
        className="absolute h-full w-full top-[-7.75%] right-[-5.5%] bottom-[-7.75%] left-[-7.75%] max-w-full overflow-hidden max-h-full object-contain z-[1] shrink-0"
        alt=""
        src="/Track.svg"
      />
    </button>
  );
};

export default CircularIndeterminateProgres;
