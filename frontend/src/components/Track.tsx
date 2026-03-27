import { FunctionComponent, type CSSProperties } from "react";

export type TrackType = {
  className?: string;

  /** Variant props */
  progress?: CSSProperties["progress"];
  thickness?: CSSProperties["thickness"];
  type?: CSSProperties["type"];
};

const Track: FunctionComponent<TrackType> = ({
  className = "",
  progress = 0,
  thickness = "4 dp",
  type = "Flat",
}) => {
  return (
    <div className={`self-stretch h-3 relative z-[0] ${className}`}>
      <div className="absolute w-[calc(100%_-_0.3px)] top-[calc(50%_-_2px)] right-[0.3px] left-[0px] rounded-sm bg-schemes-secondary-container h-1" />
    </div>
  );
};

export default Track;
