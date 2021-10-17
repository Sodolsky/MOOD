import { doc, getDoc } from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { UserData } from ".";
import { db } from "./firebase";
import { LazyLoadedImage } from "./LLImage";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
import "./Styles/UserProfile.scss";
export const queryLatestPost = async (key: string) => {
  const ref = doc(db, "Posts", `${key}`);
  const highlightedPost = await getDoc(ref);
  return highlightedPost.data() as PostPropsInteface;
};
const UserProfile: React.FC = () => {
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);
  const [highlightedPost, sethighlightedPost] =
    useState<PostPropsInteface | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const profilePathLogin = useParams<{ user: string }>();
  useEffect(() => {
    //Function to get UserProfile data invoked on mount
    const getUserProfileData = async (profilePath: string) => {
      const ref = doc(db, "Users", `${profilePath}`);
      const userData = await getDoc(ref);
      setUserData(userData.data() as UserData);
    };
    getUserProfileData(profilePathLogin.user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (userData) {
      setIsContentLoaded(true);
      if (userData.UserPosts) {
        queryLatestPost(
          userData.UserPosts[userData.UserPosts?.length - 1]
        ).then((data) => {
          sethighlightedPost(data);
        });
      }
    }
  }, [userData]);
  return isContentLoaded ? (
    <>
      <div className="BackGroundLayer">
        <div className="UserInfoContainer">
          <div className="UserImage">
            <LazyLoadedImage
              src={userData?.Avatar as string}
              alt={"Visited profile Avatar"}
            />
          </div>
          <div className="UserNameAndDescription">
            <span>{userData?.Login}</span>
            <div>{userData?.Description}</div>
          </div>
          <div className="LatestPost">
            <span className="biggerText">Latest Post</span>
            {highlightedPost ? (
              <div className="postContainerOnUserProfile">
                <Post
                  date={highlightedPost?.date}
                  postType={highlightedPost.postType}
                  text={highlightedPost.text}
                  userThatPostedThis={highlightedPost.userThatPostedThis}
                  YTLink={highlightedPost.YTLink}
                  img={highlightedPost.img}
                  likeCount={highlightedPost.likeCount}
                  fileType={highlightedPost.fileType}
                  hashtags={highlightedPost.hashtags}
                  poepleThatLiked={highlightedPost.poepleThatLiked}
                />
              </div>
            ) : (
              <span className="biggerText">User didn't add a Post yet 😭</span>
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="LoaderBox">
      <LoadingRing colorVariant={"white"} />
    </div>
  );
};
export default UserProfile;
