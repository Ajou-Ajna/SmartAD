import { FunctionComponent, useState, useRef, DragEvent } from "react";
import ButtonOutline from "./ButtonOutline";

export type DropZoneType = {
  className?: string;
  onFileSelected?: (file: File) => void;
};

const DropZone: FunctionComponent<DropZoneType> = ({ className = "", onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        onFileSelected?.(file);
      } else {
        alert("영상 파일만 업로드할 수 있습니다.");
      }
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected?.(files[0]);
    }
  };

  return (
    <section
      className={`self-stretch flex flex-col items-start py-0 px-14 text-center text-[24px] text-[#1e1e1e] font-[Inter] mq750:pl-7 mq750:pr-7 mq750:box-border ${className}`}
    >
      <div className="self-stretch flex flex-col items-center">
        <div className="w-full flex flex-col items-start py-2.5 px-[26px] box-border max-w-full">
          <div
            className={`self-stretch shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-xl border-[#383838] border-dashed border-[3px] overflow-hidden flex flex-col items-center py-[51px] px-0 transition-colors ${
              isDragging ? "bg-[#d0c5e8] border-[#6750a4]" : "bg-[#e2e2e2]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="self-stretch h-[45px] flex flex-col items-start min-w-[160px]">
              <div className="self-stretch flex flex-col items-start">
                <h3 className="m-0 self-stretch relative text-[length:inherit] tracking-[-0.02em] leading-[120%] font-semibold font-[inherit] mq450:text-[19px] mq450:leading-[23px]">{`Drag & Drop Items Here`}</h3>
              </div>
            </div>
            <img
              className="w-[112.7px] h-[112.7px]"
              loading="lazy"
              alt=""
              src="/upload.svg"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <ButtonOutline
              size="Small"
              state="Enabled"
              type="Round"
              showIcon={false}
              icon={
                <img
                  className="cursor-pointer [border:none] p-0 bg-[transparent] h-5 w-5 relative"
                  alt=""
                />
              }
              labelText="파일 선택"
              onClick={handleFileSelect}
            />
            <div className="self-stretch flex flex-col items-start text-[16px] text-[#3556aa]">
              <div className="self-stretch relative tracking-[-0.02em] leading-[120%] font-semibold">
                {isDragging
                  ? "여기에 파일을 놓으세요!"
                  : (
                    <>
                      {`업로드 할 영상을 드래그 & 드랍 하거나,`}
                      <br />
                      {`직접 추가해주세요`}
                    </>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DropZone;
