import { FunctionComponent } from "react";
import NavigationRail from "../components/NavigationRail";
import DropZone from "../components/DropZone";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const DragDrop: FunctionComponent = () => {
  const navigate = useNavigate();
  const { addArchiveItem } = useAppContext();
  return (
    <div className="w-full min-h-screen relative bg-schemes-surface flex flex-col items-start py-0 px-[13px] box-border leading-[normal] tracking-[normal]">
      <main className="self-stretch flex-1 flex items-start justify-between py-[5px] px-0 gap-0 text-left text-[16px] text-[#000] font-[Roboto]">
        <NavigationRail
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
            <div className="w-[528px] relative text-static-title-medium-size tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium text-schemes-on-surface-variant hidden shrink-0">
              Supporting text
            </div>
          </div>
          <div className="self-stretch h-11 flex flex-col items-center py-0 px-6 box-border gap-2 text-schemes-on-surface-variant">
            <div className="relative leading-static-display-small-line-height font-medium shrink-0">
              AI기반 화면해설 방송 자동 생성 솔루션
            </div>
            <div className="w-[528px] relative tracking-static-title-medium-tracking leading-static-title-medium-line-height font-medium hidden shrink-0">
              Supporting text
            </div>
          </div>
          <DropZone
            onFileSelected={async (file) => {
              addArchiveItem({
                title: file.name,
                type: "file",
                fileName: file.name,
              });

              const formData = new FormData();
              formData.append("file", file);
              
              try {
                const response = await fetch("/api/videos/upload", {
                  method: "POST",
                  body: formData,
                });
                if (response.ok) {
                  const data = await response.json();
                  navigate("/progress", { state: { destination: "/view", videoId: data.id } });
                } else {
                  console.error("Upload failed");
                }
              } catch (e) {
                console.error("Upload Error", e);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default DragDrop;
