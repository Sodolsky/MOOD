import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./Styles/BackArrow.scss";
interface BackArrowProps {
  onClickFunc: () => void;
}
//!Parent need to have position relative
export const BackArrow: React.FC<BackArrowProps> = ({ onClickFunc }) => {
  return (
    <div className="BackArrowContainer">
      <FontAwesomeIcon
        icon={faArrowLeft}
        className="BackArrow"
        onClick={onClickFunc}
      />
    </div>
  );
};
