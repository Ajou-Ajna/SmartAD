import { FunctionComponent, useMemo, type CSSProperties } from "react";

export type InputFieldType = {
  className?: string;
  iD?: string;
  placeholder?: string;
  error?: string;
  showError?: boolean;

  /** Style props */
  inputFieldWidth?: CSSProperties["width"];
  descriptionWidth?: CSSProperties["width"];
  iDMinWidth?: CSSProperties["minWidth"];
  errorColor?: CSSProperties["color"];
};

const InputField: FunctionComponent<InputFieldType> = ({
  className = "",
  inputFieldWidth,
  iD,
  descriptionWidth,
  placeholder,
  iDMinWidth,
  error,
  showError,
  errorColor,
}) => {
  const inputFieldStyle: CSSProperties = useMemo(() => {
    return {
      width: inputFieldWidth,
    };
  }, [inputFieldWidth]);

  const descriptionStyle: CSSProperties = useMemo(() => {
    return {
      width: descriptionWidth,
    };
  }, [descriptionWidth]);

  const iDStyle: CSSProperties = useMemo(() => {
    return {
      minWidth: iDMinWidth,
    };
  }, [iDMinWidth]);

  const errorStyle: CSSProperties = useMemo(() => {
    return {
      color: errorColor,
    };
  }, [errorColor]);

  return (
    <div
      className={`w-[230px] flex flex-col items-start gap-space-200 text-left text-[16px] text-[#1e1e1e] font-[Inter] ${className}`}
      style={inputFieldStyle}
    >
      <div className="self-stretch relative leading-[140%]">{iD}</div>
      <div
        className="w-[120px] relative leading-[140%] text-[#757575] hidden"
        style={descriptionStyle}
      >
        Description
      </div>
      <div className="self-stretch rounded-radius-200 bg-schemes-on-primary border-[#d9d9d9] border-solid border-stroke-border box-border overflow-hidden flex items-center py-2.5 px-[15px] min-w-[120px]">
        <input
          className="w-full [border:none] [outline:none] font-[Inter] text-[16px] bg-[transparent] h-4 flex-1 relative leading-[100%] text-[#1e1e1e] text-left inline-block min-w-[119px] p-0"
          placeholder={placeholder}
          type="text"
          style={iDStyle}
        />
      </div>
      {!!showError && (
        <div
          className="relative leading-[140%] text-schemes-error"
          style={errorStyle}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default InputField;
