import { FunctionComponent, type CSSProperties } from "react";

export type StarsType = {
  className?: string;

  /** Variant props */
  selected?: CSSProperties["selected"];
  state?: CSSProperties["state"];
};

const Stars: FunctionComponent<StarsType> = ({
  className = "",
  selected = false,
  state = "Enabled",
}) => {
  return (
    <button
      className={`cursor-pointer [border:none] p-0 bg-[transparent] h-5 w-5 relative z-[1] ${className}`}
    >
      <img
        className="absolute h-[83.5%] w-[83.5%] top-[8.5%] right-[8%] bottom-[8%] left-[8.5%] max-w-full overflow-hidden max-h-full hidden"
        alt=""
      />
    </button>
  );
};

export default Stars;
