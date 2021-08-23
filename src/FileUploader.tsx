import * as React from "react";
import Picture from "./img/insertpic.svg";
import { useRef } from "react";
export const FileUploader: React.FC<any> = ({ onFileSelect }) => {
  const fileInput = useRef<HTMLLabelElement>(null);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files![0];
    onFileSelect(files);
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
        accept="image/png, image/gif, image/jpeg"
        onChange={handleFileInput}
      />
    </>
  );
};
