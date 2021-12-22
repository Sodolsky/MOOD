import { Skeleton } from "antd";
import SkeletonImage from "antd/lib/skeleton/Image";
import React from "react";
import "./Styles/MainPageStyles.scss";
const SkeletonPost: React.FC = () => {
  return (
    <div className="ListWrapper">
      <div className="Post">
        <div className="PostUserInfo">
          <Skeleton.Avatar active={true} shape="circle" />
        </div>
        <div className="PostBody">
          <SkeletonImage
            style={{ width: "450px", height: "400px", margin: "25px" }}
          />
        </div>
        <div className="PostFooter"></div>
      </div>
    </div>
  );
};
export default SkeletonPost;
