import { FunctionComponent } from "react";
import NavigationRail from "../components/NavigationRail";
import ButtonGroup from "../components/ButtonGroup";
import { useNavigate } from "react-router-dom";

const Login: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen relative bg-schemes-surface overflow-hidden flex flex-col items-start py-0 px-[13px] box-border leading-[normal] tracking-[normal]">
      <main className="self-stretch flex-1 flex items-start justify-between py-[5px] px-0 gap-0 text-left text-[16px] text-[#000] font-[Roboto]">
          <NavigationRail
            iconContainerBorder="none"
            iconContainerPadding="0"
            archiveIconBorder="unset"
            archiveIconPadding="unset"
            archiveIconBackgroundColor="unset"
            iconBorder="unset"
            iconPadding="unset"
            iconBackgroundColor="unset"
            starFilledIconBorder="unset"
            starFilledIconPadding="unset"
            starFilledIconBackgroundColor="unset"
            settingsIconBorder="unset"
            settingsIconPadding="unset"
            settingsIconBackgroundColor="unset"
            size="Medium"
            state="Enabled"
            type="Square"
            width="Default"
            showLeadingIcon
            leadingIconHeight="unset"
            leadingIconWidth="unset"
            leadingIconBorder="none"
            leadingIconPadding="0"
            leadingIconBackgroundColor="transparent"
          />
          <div className="self-stretch flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center py-7 px-0 gap-3.5 mq675:pt-5 mq675:pb-5 mq675:box-border">
            <div className="self-stretch flex flex-col items-center py-0 px-6 gap-2 text-static-display-small-size text-schemes-on-surface">
              <h1 className="m-0 relative text-[length:inherit] leading-static-display-small-line-height font-medium font-[inherit] shrink-0 mq450:text-[22px] mq450:leading-[26px] mq750:text-[29px] mq750:leading-[35px]">
                SmartADV
              </h1>
              <div className="w-[528px] relative text-static-title-medium-size tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium text-schemes-on-surface-variant hidden shrink-0">
                Supporting text
              </div>
            </div>
            <div className="self-stretch h-[27px] flex flex-col items-center py-0 px-6 box-border gap-2 text-schemes-on-surface-variant">
              <div className="relative leading-static-display-small-line-height font-medium shrink-0">
                AI기반 화면해설 방송 자동 생성 솔루션
              </div>
              <div className="w-[528px] relative tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium hidden shrink-0">
                Supporting text
              </div>
            </div>
            <section className="self-stretch flex flex-col items-center justify-center py-0 px-[75px] gap-[46px] text-left text-[16px] text-[#1e1e1e] font-[Inter] mq675:gap-[23px] mq675:pl-[37px] mq675:pr-[37px] mq675:box-border">
              <div className="w-[451px] overflow-hidden flex flex-col items-start justify-center py-[9px] px-0 box-border gap-2.5">
                <div className="w-[230px] flex flex-col items-start gap-space-200">
                  <div className="self-stretch relative leading-[140%]">ID</div>
                  <div className="w-[120px] relative leading-[140%] text-[#757575] hidden">
                    Description
                  </div>
                  <input
                    className="border-[#d9d9d9] border-solid border-stroke-border [outline:none] w-full bg-schemes-on-primary self-stretch h-[41px] rounded-radius-200 box-border overflow-hidden shrink-0 flex items-center py-space-300 px-space-400 font-[Inter] text-[16px] text-[#1e1e1e] min-w-[120px]"
                    type="text"
                    placeholder="ID 입력"
                  />
                </div>
                <div className="w-[345px] flex flex-col items-start gap-space-200">
                  <div className="self-stretch relative leading-[140%] shrink-0">
                    PW
                  </div>
                  <div className="w-52 relative leading-[140%] text-[#757575] hidden shrink-0">
                    Description
                  </div>
                  <input
                    className="border-[#d9d9d9] border-solid border-stroke-border [outline:none] w-full bg-schemes-on-primary self-stretch h-[41px] rounded-radius-200 box-border overflow-hidden shrink-0 flex items-center py-space-300 px-space-400 font-[Inter] text-[16px] text-[#1e1e1e] min-w-[120px]"
                    type="text"
                    placeholder="영문 + 숫자 8자 이상 조합"
                  />
                  <div className="relative leading-[140%] hidden shrink-0">
                    Error
                  </div>
                </div>
              </div>
              <div className="h-[108px] overflow-hidden shrink-0 flex flex-col items-center py-0 px-5 box-border gap-2.5">
                <div className="h-12 flex items-center justify-center">
                  <button className="cursor-pointer border-[#000] border-solid border-[1px] p-0 bg-schemes-on-primary h-10 rounded-[100px] box-border overflow-hidden flex items-center justify-center">
                    <div className="flex items-center justify-center py-2.5 px-4 relative isolate gap-2 shrink-0">
                      <img
                        className="h-6 w-6 relative z-[1]"
                        alt=""
                        src="/Google-1.svg"
                      />
                      <div className="relative text-static-label-large-size tracking-static-label-large-tracking leading-static-label-large-line-height font-medium font-[Roboto] text-schemes-on-surface-variant text-left z-[2]">
                        Sign in with Google
                      </div>
                    </div>
                  </button>
                </div>
                <div className="h-12 flex items-center justify-center">
                  <button className="cursor-pointer border-[#000] border-solid border-[1px] p-0 bg-schemes-on-primary h-10 rounded-[100px] box-border overflow-hidden flex items-center justify-center">
                    <div className="flex items-center justify-center py-2.5 px-4 relative isolate gap-2 shrink-0">
                      <img
                        className="h-6 w-6 relative z-[1]"
                        alt=""
                        src="/Google-11.svg"
                      />
                      <div className="relative text-static-label-large-size tracking-static-label-large-tracking leading-static-label-large-line-height font-medium font-[Roboto] text-schemes-on-surface-variant text-left z-[2]">
                        Sign in with Apple
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              <ButtonGroup
                align="Justify"
                buttonEnd
                buttonStart
                buttonSize="Medium"
                buttonSize1="Medium"
                buttonState="Default"
                buttonState1="Default"
                buttonVariant="Subtle"
                buttonVariant1="Primary"
                buttonLabel="취소"
                buttonLabel1="로그인"
                buttonHasIconEnd={false}
                buttonHasIconStart={false}
              />
              <div className="flex items-center justify-center gap-2 text-[14px] font-[Inter]">
                <span className="text-schemes-on-surface-variant">계정이 없으신가요?</span>
                <button
                  className="cursor-pointer [border:none] bg-[transparent] p-0 text-[14px] font-semibold font-[Inter] text-[#6750a4] underline"
                  onClick={() => navigate("/register")}
                >
                  회원가입
                </button>
              </div>
            </section>
          </div>
        </main>
    </div>
  );
};

export default Login;
