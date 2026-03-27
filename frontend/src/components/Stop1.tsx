import { FunctionComponent, type CSSProperties } from "react";

export type StopType = {
  className?: string;

  /** Variant props */
  progress?: CSSProperties["progress"];
  thickness?: CSSProperties["thickness"];
  type?: CSSProperties["type"];
};

const Stop: FunctionComponent<StopType> = ({
  className = "",
  progress = 0,
  thickness = "4 dp",
  type = "Flat",
}) => {
  return (
    <div
      className={`w-1.5 h-2 absolute !!m-[0 important] top-[calc(50%_-_4px)] right-[0.3px] z-[1] ${className}`}
    >
      <div className="absolute top-[calc(50%_-_2px)] right-[0px] rounded-[26px] bg-schemes-primary w-1 h-1" />
    </div>
  );
};

export default Stop;
