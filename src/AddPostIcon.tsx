import React from "react";
import AddPostSvg from "./img/plus.png";
import "./Styles/AddPostIcon.scss";
export interface AddPostIconInterface {
  setAddPostIconClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddPostIcon: React.FC<AddPostIconInterface> = (props) => {
  const { setAddPostIconClicked } = props;
  return (
    <div className="AddPostBox" onClick={() => setAddPostIconClicked(true)}>
      <img src={AddPostSvg} alt="Add new Post" title="Add New Post" />
    </div>
  );
};
