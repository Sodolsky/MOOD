import * as React from "react";
import Picture from "./img/insertpic.svg";
import { useRef } from "react";
export const FileUploader: React.FC<any> = ({ onFileSelect }) => {
  const fileInput = useRef<HTMLLabelElement>(null);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (
      file.type === "video/mp4" ||
      file.type === "video/ogg" ||
      file.type === "video/webm"
    ) {
      if (file.size > 40000000) {
        //Normal value 800000000
        return alert("Your File is bigger than 40MB Try to upload smaller one");
      } else {
        onFileSelect(file);
      }
    } else {
      if (file.size > 8000000) {
        return alert("Your File is bigger than 8MB Try to upload smaller one");
      } else {
        onFileSelect(file);
      }
    }
  };
  return (
    <>
      <label
        htmlFor="file-input"
        onClick={(e) => fileInput.current && fileInput.current.click()}
      >
        <img src={Picture} alt="Upload own mood" />
      </label>
      <input
        type="file"
        id="file-input"
        name="Img"
        accept="image/png, image/gif, image/jpeg ,video/*"
        onChange={handleFileInput}
      />
    </>
  );
};
