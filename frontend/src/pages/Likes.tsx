import { FunctionComponent, useEffect } from "react";
import NavigationRail1 from "../components/NavigationRail1";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Likes: FunctionComponent = () => {
  const navigate = useNavigate();
  const { archiveItems, toggleLike, setCurrentItem, fetchArchive } = useAppContext();

  useEffect(() => {
    fetchArchive();
  }, []);
  const likedItems = archiveItems.filter((item) => item.liked);

  return (
    <div className="w-full min-h-screen relative bg-schemes-surface flex flex-col items-start py-0 px-[13px] box-border leading-[normal] tracking-[normal]">
      <main className="self-stretch flex-1 flex items-start justify-between py-[5px] px-0 gap-0 text-left text-[16px] text-schemes-on-surface-variant font-[Roboto]">
          <NavigationRail1
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
          <div className="flex-1 rounded-xl bg-schemes-on-primary flex flex-col items-center py-7 px-0 gap-3.5 mq675:pt-5 mq675:pb-5 mq675:box-border">
            <div className="self-stretch flex flex-col items-center py-0 px-6 gap-2 text-static-display-small-size text-schemes-on-surface">
              <h1 className="m-0 relative text-[length:inherit] leading-static-display-small-line-height font-medium font-[inherit] shrink-0 mq450:text-[22px] mq450:leading-[26px] mq750:text-[29px] mq750:leading-[35px]">
                SmartADV
              </h1>
            </div>
            <div className="self-stretch h-11 flex flex-col items-center py-0 px-6 box-border gap-2">
              <div className="relative leading-static-display-small-line-height font-medium shrink-0">
                Likes - 좋아요 목록
              </div>
            </div>

            {likedItems.length === 0 ? (
              <div className="self-stretch flex flex-col items-center py-12 px-6 gap-4 text-schemes-on-surface-variant">
                <img className="w-16 h-16 opacity-40" alt="" src="/star-filled.svg" />
                <div className="relative text-[16px] leading-[140%] font-medium font-[Inter] text-center">
                  좋아요를 표시한 해설이 없습니다.
                  <br />
                  Archive에서 마음에 드는 해설에 좋아요를 눌러보세요.
                </div>
              </div>
            ) : (
              <div className="self-stretch flex flex-col items-center py-0 px-6 gap-3">
                {likedItems.map((item) => (
                  <div
                    key={item.id}
                    className="self-stretch rounded-xl bg-schemes-surface-container-lowest border-[#e0e0e0] border-solid border-[1px] flex items-center p-4 gap-4 cursor-pointer"
                    onClick={() => {
                      setCurrentItem(item);
                      navigate("/view", { state: { audioUrl: item.audioFileName, videoUrl: item.fileName } });
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-schemes-secondary-container flex items-center justify-center shrink-0">
                      <span className="material-icons text-schemes-on-secondary-container text-[20px]">
                        {item.type === "url" ? "link" : "upload_file"}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="relative text-[14px] leading-[140%] font-semibold font-[Inter] text-[#1e1e1e] truncate">
                        {item.title}
                      </div>
                      <div className="relative text-[12px] leading-[140%] font-[Inter] text-schemes-on-surface-variant">
                        {item.date} | {item.type === "url" ? "URL" : "파일 업로드"} | {item.audioSize}
                      </div>
                    </div>
                    <button
                      className="cursor-pointer [border:none] p-2 bg-[transparent] flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id);
                      }}
                    >
                      <span className="material-icons text-[24px]" style={{ color: "#6750a4" }}>
                        favorite
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
    </div>
  );
};

export default Likes;
