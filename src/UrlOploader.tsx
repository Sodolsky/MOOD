import React from "react";
import Video from "./img/video.svg";
export interface UrlUploaderPropsInterface {
  isLinkChoosen: boolean;
  setIfLinkIsChoosen: React.Dispatch<React.SetStateAction<boolean>>;
  onClick: () => void;
}
export const UrlUploader: React.FC<UrlUploaderPropsInterface> = (props) => {
  return (
    <>
      <img
        src={Video}
        alt="Upload own mood"
        onClick={() => {
          props.setIfLinkIsChoosen(true);
          props.onClick();
        }}
      />
    </>
  );
};
