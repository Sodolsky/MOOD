import * as React from "react";
import "./Styles/LoadingRingStyles.scss";
type colorVariant = "white" | "black";
interface LoadingRingInterface {
  colorVariant: colorVariant;
}
export const LoadingRing: React.FC<LoadingRingInterface> = (props) => {
  const { colorVariant } = props;
  return colorVariant === "black" ? (
    <div className="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  ) : (
    <div className="lds-ring-white">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
