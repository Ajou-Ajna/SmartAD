import { FunctionComponent, type CSSProperties } from "react";

export type ListItem0DensityBaselineType = {
  className?: string;
  swapDividerType?: React.ReactNode;
  overline?: string;
  supportingText?: string;
  trailingSupportingText?: string;
  headline?: string;
  showTrailingSupportingText?: boolean;
  stateLayer?: React.ReactNode;
  showDivider?: boolean;
  swapDividerType1?: React.ReactNode;

  /** Variant props */
  condition?: CSSProperties["condition"];
  leading?: CSSProperties["leading"];
  showOverline?: CSSProperties["showOverline"];
  showSupportingText?: CSSProperties["showSupportingText"];
  trailing?: CSSProperties["trailing"];
};

const ListItem0DensityBaseline: FunctionComponent<
  ListItem0DensityBaselineType
> = ({
  className = "",
  condition = "3 line+",
  leading = "None",
  showOverline = false,
  showSupportingText = true,
  trailing = "None",
  swapDividerType,
  overline = "Overline",
  supportingText = "원본 비디오: 아주에서 만난 새로운 세계🌍 | 대학생 브이로그 | 아주대학교 VLOG - [아주캠퍼스] EP.02",
  trailingSupportingText = "100+",
  headline = "smartadv_audio.wav",
  showTrailingSupportingText = false,
  stateLayer,
  showDivider = false,
  swapDividerType1,
}) => {
  return (
    <div
      className={`w-[360px] rounded-lg bg-schemes-surface flex flex-col items-center relative isolate min-h-[88px] z-[3] shrink-0 text-left text-static-label-medium-size text-schemes-on-surface-variant font-[Roboto] ${className}`}
    >
      {stateLayer}
      <div className="self-stretch flex items-start py-3 px-4 gap-4 z-[1]">
        <div className="flex-1 overflow-hidden flex flex-col items-start">
          <div className="w-80 relative tracking-static-label-medium-tracking leading-static-label-medium-line-height font-medium hidden">
            {overline}
          </div>
          <div className="self-stretch relative text-static-body-large-size tracking-static-body-large-tracking leading-static-body-large-line-height text-schemes-on-surface">
            {headline}
          </div>
          <div className="self-stretch relative text-static-body-medium-size tracking-static-body-medium-tracking leading-static-body-medium-line-height">
            {supportingText}
          </div>
        </div>
        {!!showTrailingSupportingText && (
          <div className="relative text-static-label-small-size tracking-static-label-small-tracking leading-static-label-small-line-height font-medium text-right">
            {trailingSupportingText}
          </div>
        )}
      </div>
      {swapDividerType1}
    </div>
  );
};

export default ListItem0DensityBaseline;
