import { FunctionComponent } from "react";

export type YoutubePlayerType = {
  className?: string;
};

const YoutubePlayer: FunctionComponent<YoutubePlayerType> = ({
  className = "",
}) => {
  return (
    <div
      className={`absolute top-[0px] left-[164px] w-[490px] h-[276px] flex flex-col items-start isolate gap-2.5 bg-[url('/Youtube-player@3x.png')] bg-cover bg-no-repeat bg-[top] text-left text-[15px] text-[#eaeaea] font-[Inter] ${className}`}
    >
      <div className="w-[490px] flex flex-col items-start gap-[84px] z-[0]">
        <div className="self-stretch h-24 relative [background:linear-gradient(180deg,_rgba(0,_0,_0,_0),_rgba(0,_0,_0,_0.25))] [transform:_rotate(180deg)]" />
        <div className="self-stretch h-24 relative [background:linear-gradient(180deg,_rgba(0,_0,_0,_0),_rgba(0,_0,_0,_0.5))] [transform:_rotate(180deg)]" />
      </div>
      <div className="w-[473.4px] h-[35px] absolute !!m-[0 important] right-[12px] bottom-[4px] z-[1]">
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute right-[10px] bottom-[6px] w-4 h-4"
          alt=""
          src="/ico-fullscreen.svg"
        />
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute right-[43px] bottom-[5px] rounded-[1px] w-[22px] h-[18px]"
          alt=""
          src="/ico-tv.svg"
        />
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute right-[80px] bottom-[7px] w-5 h-3.5"
          alt=""
          src="/ico-theater.svg"
        />
        <img
          className="absolute right-[113px] bottom-[6px] w-5 h-4 object-cover"
          loading="lazy"
          alt=""
          src="/ico-hd@2x.png"
        />
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute right-[153px] bottom-[7px] w-[18px] h-3.5"
          alt=""
          src="/ico-titles.svg"
        />
        <div className="absolute bottom-[0px] left-[120.4px] tracking-[0.01em] leading-[146.48%] flex items-center [text-shadow:1px_0_0_rgba(0,_0,_0,_0.1),_0_1px_0_rgba(0,_0,_0,_0.1),_-1px_0_0_rgba(0,_0,_0,_0.1),_0_-1px_0_rgba(0,_0,_0,_0.1)]">
          5:32 / 9:22
        </div>
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute bottom-[6px] left-[97.4px] w-[13.3px] h-4"
          alt=""
          src="/ico-sound.svg"
        />
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute bottom-[8px] left-[65.4px] w-3 h-3"
          alt=""
          src="/ico-next.svg"
        />
        <img
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute bottom-[6px] left-[24.4px] w-[13px] h-4"
          alt=""
          src="/ico-play.svg"
        />
        <div className="absolute w-full right-[0px] bottom-[32px] left-[0px] h-[3px]">
          <div className="absolute w-[calc(100%_-_7.4px)] right-[0px] bottom-[0px] left-[7.4px] bg-[rgba(234,234,234,0.2)] h-[3px]" />
          <div className="absolute w-[50.78%] right-[49.22%] bottom-[0px] left-[0%] bg-[rgba(234,234,234,0.5)] h-[3px]" />
          <div className="absolute w-[53.44%] right-[46.47%] bottom-[0px] left-[0.08%] bg-[#fc0d1c] h-[3px]" />
        </div>
      </div>
      <img
        className="w-[68px] h-12 absolute !!m-[0 important] top-[calc(50%_-_24px)] left-[calc(50%_-_34px)] z-[2]"
        loading="lazy"
        alt=""
        src="/play-button.svg"
      />
      <h3 className="!!m-[0 important] w-[422px] h-[27px] absolute top-[24px] left-[17px] text-[18px] leading-[151.28%] text-schemes-on-primary flex items-center z-[3] font-[Roboto]">
        <span className="w-full">
          <span className="font-medium">
            아주에서 만난 새로운 세계🌍 | 대학생 브이로그 | 아주대학교 VLOG -
            [아주캠퍼스] EP.
          </span>
          <span className="font-medium font-[Inter]">02</span>
        </span>
      </h3>
      <img
        className="cursor-pointer [border:none] p-0 bg-[transparent] w-5 h-5 absolute !!m-[0 important] top-[14px] right-[16px] z-[4]"
        alt=""
        src="/ico-info.svg"
      />
    </div>
  );
};

export default YoutubePlayer;
