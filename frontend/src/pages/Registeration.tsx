import { FunctionComponent, useState } from "react";
import NavigationRail from "../components/NavigationRail";
import ButtonGroup from "../components/ButtonGroup";

// 이미 사용 중인 ID 목록 (실제 서비스에서는 API로 확인)
const EXISTING_IDS = ["admin", "test", "user"];

const Registeration: FunctionComponent = () => {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");

  const showIdError = id.length > 0 && EXISTING_IDS.includes(id);
  const showPwError = pwConfirm.length > 0 && pw !== pwConfirm;
  return (
    <div className="w-full min-h-screen relative bg-schemes-surface overflow-hidden flex flex-col items-start py-0 px-[13px] box-border leading-[normal] tracking-[normal]">
      <main className="self-stretch flex-1 flex items-start justify-between py-[5px] px-0 gap-0 text-left text-[16px] text-[#000] font-[Roboto]">
          <NavigationRail
            iconContainerBorder="unset"
            iconContainerPadding="unset"
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
            leadingIconBorder="unset"
            leadingIconPadding="unset"
            leadingIconBackgroundColor="unset"
          />
          <div className="self-stretch flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center py-7 px-0 gap-3.5 mq750:pt-5 mq750:pb-5 mq750:box-border">
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
            <section className="self-stretch flex flex-col items-center justify-center py-0 px-[75px] gap-[26px] text-left text-[16px] text-[#1e1e1e] font-[Inter] mq675:pl-[37px] mq675:pr-[37px] mq675:box-border">
              <div className="w-[451px] overflow-hidden flex flex-col items-start justify-center py-[9px] px-0 box-border gap-2.5">
                <div className="self-stretch flex flex-col items-start gap-space-200">
                  <div className="self-stretch relative leading-[140%] shrink-0">
                    닉네임
                  </div>
                  <div className="w-52 relative leading-[140%] text-[#757575] hidden shrink-0">
                    Description
                  </div>
                  <input
                    className="border-[#d9d9d9] border-solid border-stroke-border [outline:none] bg-schemes-on-primary w-[121px] h-[41px] rounded-radius-200 box-border overflow-hidden shrink-0 flex items-center py-space-300 px-space-400 min-w-[120px]"
                    type="text"
                  />
                  <div className="relative leading-[140%] hidden shrink-0">
                    Error
                  </div>
                </div>
                <div className="w-[238px] flex flex-col items-start gap-space-200">
                  <div className="self-stretch relative leading-[140%]">
                    이메일 주소
                  </div>
                  <div className="w-52 relative leading-[140%] text-[#757575] hidden">
                    Description
                  </div>
                  <input
                    className="border-[#d9d9d9] border-solid border-stroke-border [outline:none] w-full bg-schemes-on-primary self-stretch h-[41px] rounded-radius-200 box-border overflow-hidden shrink-0 flex items-center py-space-300 px-space-400 min-w-[120px]"
                    type="text"
                  />
                </div>
                <div className="w-[230px] flex flex-col items-start gap-space-200">
                  <div className="self-stretch relative leading-[140%]">ID</div>
                  <div className="self-stretch rounded-radius-200 bg-schemes-on-primary border-[#d9d9d9] border-solid border-stroke-border box-border overflow-hidden flex items-center py-2.5 px-[15px] min-w-[120px]">
                    <input
                      className="w-full [border:none] [outline:none] font-[Inter] text-[16px] bg-[transparent] h-4 flex-1 relative leading-[100%] text-[#1e1e1e] text-left inline-block min-w-[119px] p-0"
                      placeholder="ID 입력"
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                    />
                  </div>
                  {showIdError && (
                    <div className="relative leading-[140%] text-schemes-error" style={{ color: "#b3261e" }}>
                      이미 사용중인 ID 입니다
                    </div>
                  )}
                </div>
                <div className="w-[345px] flex flex-col items-start gap-space-200">
                  <div className="self-stretch relative leading-[140%]">PW</div>
                  <div className="self-stretch rounded-radius-200 bg-schemes-on-primary border-[#d9d9d9] border-solid border-stroke-border box-border overflow-hidden flex items-center py-2.5 px-[15px] min-w-[120px]">
                    <input
                      className="w-full [border:none] [outline:none] font-[Inter] text-[16px] bg-[transparent] h-4 flex-1 relative leading-[100%] text-[#1e1e1e] text-left inline-block min-w-[188px] p-0"
                      placeholder="영문 + 숫자 8자 이상 조합"
                      type="password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[345px] flex flex-col items-start gap-space-200">
                  <div className="self-stretch relative leading-[140%]">PW 재입력</div>
                  <div className="self-stretch rounded-radius-200 bg-schemes-on-primary border-[#d9d9d9] border-solid border-stroke-border box-border overflow-hidden flex items-center py-2.5 px-[15px] min-w-[120px]">
                    <input
                      className="w-full [border:none] [outline:none] font-[Inter] text-[16px] bg-[transparent] h-4 flex-1 relative leading-[100%] text-[#1e1e1e] text-left inline-block min-w-[188px] p-0"
                      placeholder="영문 + 숫자 8자 이상 조합"
                      type="password"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                    />
                  </div>
                  {showPwError && (
                    <div className="relative leading-[140%] text-schemes-error">
                      패스워드가 일치하지 않습니다.
                    </div>
                  )}
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
                buttonLabel1="가입"
                buttonHasIconEnd={false}
                buttonHasIconStart={false}
              />
            </section>
          </div>
        </main>
    </div>
  );
};

export default Registeration;
