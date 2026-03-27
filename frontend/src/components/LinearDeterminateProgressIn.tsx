import { FunctionComponent, type CSSProperties } from "react";
import Track from "./Track";
import Stop from "./Stop1";

export type LinearDeterminateProgressInType = {
  className?: string;
  progress1?: CSSProperties["progress"];
  thickness1?: CSSProperties["thickness"];
  type1?: CSSProperties["type"];
  progress2?: CSSProperties["progress"];
  thickness2?: CSSProperties["thickness"];
  type2?: CSSProperties["type"];

  /** Variant props */
  progress?: CSSProperties["progress"];
  thickness?: CSSProperties["thickness"];
  type?: CSSProperties["type"];
};

const LinearDeterminateProgressIn: FunctionComponent<
  LinearDeterminateProgressInType
> = ({
  className = "",
  progress = 0,
  thickness = "4 dp",
  type = "Flat",
  progress1 = 50,
  thickness1,
  type1,
  progress2 = 50,
  thickness2,
  type2,
}) => {
  return (
    <div
      className={`w-[789px] flex items-start py-0 pl-0.5 pr-0 box-border ${className}`}
    >
      <div className="h-3 flex-1 relative">
        <div className="absolute h-full w-[49.26%] top-[0px] right-[50.74%] bottom-[0px] left-[0%] flex items-start">
          <img
            className="h-3 w-10 relative"
            loading="lazy"
            alt=""
            src="/Segment-start.svg"
          />
          <img
            className="h-3 flex-1 relative max-w-full overflow-hidden"
            loading="lazy"
            alt=""
            src="/Segment-start.svg"
          />
        </div>
        <div className="absolute h-full w-[50.74%] top-[0px] right-[0%] bottom-[0px] left-[49.26%] flex flex-col items-start py-0 pl-1.5 pr-0 box-border isolate gap-2">
          <Track progress={progress1} thickness={thickness1} type={type1} />
          <Stop progress={progress2} thickness={thickness2} type={type2} />
        </div>
      </div>
    </div>
  );
};

export default LinearDeterminateProgressIn;
