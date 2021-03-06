import React, { useState, useEffect } from "react";
import { collection, getDocs, where } from "@firebase/firestore";
import { query } from "firebase/firestore";
import "./Styles/UserProfile.scss";
import { useParams } from "react-router";
import { db } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
import { Empty } from "antd";
import nProgress from "nprogress";
export const SinglePost: React.FC = () => {
  const params = useParams<{ PostId: string }>();
  const [isLaoding, setIsLaoding] = useState<boolean>(true);
  const [postThatisBeingViewedData, setPostThatIsBeingViewedData] =
    useState<PostPropsInteface | null>(null);
  useEffect(() => {
    const getDataAboutPostFromDB = async () => {
      nProgress.start();
      const ref = params.PostId;
      const q = query(collection(db, "Posts"), where("URL", "==", ref));
      const PostDoc = await getDocs(q);
      if (PostDoc.docs[0] !== undefined) {
        setPostThatIsBeingViewedData(
          PostDoc.docs[0].data() as PostPropsInteface
        );
        setIsLaoding(false);
        nProgress.done();
      } else {
        setPostThatIsBeingViewedData(null);
        setIsLaoding(false);
        nProgress.done();
      }
    };
    getDataAboutPostFromDB();
  }, [params.PostId]);
  return isLaoding ? (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <LoadingRing colorVariant={"white"} />
    </div>
  ) : postThatisBeingViewedData === null ? (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Empty
        style={{ fontSize: 20 }}
        description="This Post doesn't exist :("
      />
    </div>
  ) : (
    <>
      <div className="divList">
        <Post
          date={postThatisBeingViewedData.date}
          key={postThatisBeingViewedData.URL}
        />
      </div>
    </>
  );
};
