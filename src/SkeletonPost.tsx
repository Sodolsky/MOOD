import { Skeleton } from "antd";
import React from "react";
import { LoadingRing } from "./LoadingRing";
import "./Styles/MainPageStyles.scss";
const SkeletonPost: React.FC = () => {
  return (
    <div className="ListWrapper">
      <div className="Post">
        <div className="PostUserInfo">
          <Skeleton.Avatar active={true} shape="circle" />
        </div>
        <div className="PostBody">
          <LoadingRing colorVariant="black" />
        </div>
        <div className="PostFooter"></div>
      </div>
    </div>
  );
};
export default SkeletonPost;
