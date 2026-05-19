import { FunctionComponent, useState } from "react";
import NavigationRail from "../components/NavigationRail";
import DropZone from "../components/DropZone";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const DragDrop: FunctionComponent = () => {
  const navigate = useNavigate();
  const { addArchiveItem } = useAppContext();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
            uploadProgress={uploadProgress}
            onFileSelected={(file) => {
              if (uploadProgress !== null) return; // Prevent double upload
              
              addArchiveItem({
                title: file.name,
                type: "file",
                fileName: file.name,
              });

              const formData = new FormData();
              formData.append("file", file);
              
              setUploadProgress(0);

              const xhr = new XMLHttpRequest();
              xhr.open("POST", "/api/videos/upload", true);

              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const percentComplete = Math.round((event.loaded / event.total) * 100);
                  setUploadProgress(percentComplete);
                }
              };

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const data = JSON.parse(xhr.responseText);
                    navigate("/progress", { state: { destination: "/view", videoId: data.id } });
                  } catch (e) {
                    console.error("Failed to parse response", e);
                    setUploadProgress(null);
                  }
                } else {
                  console.error("Upload failed", xhr.statusText);
                  setUploadProgress(null);
                }
              };

              xhr.onerror = () => {
                console.error("Upload Error");
                setUploadProgress(null);
              };

              xhr.send(formData);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default DragDrop;
