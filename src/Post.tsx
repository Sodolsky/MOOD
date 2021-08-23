import * as React from "react";
import { currentlyLoggedInUserContext, UserData } from ".";
import { getLinkId } from "./ValidateYoutubeUrl";
import UnkownUser from "./img/unkownuser.svg";
import heart from "./img/heart.svg";
import heartLiked from "./img/heartLiked.svg";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { PostDataBase, savePostsInLocalStorage } from "./MainContent";
import { useRef } from "react";
import { removeUserFromLikedArray } from "./likeFunctions";
export interface PostPropsInteface {
  postType: string;
  userThatPostedThis: UserData;
  text: string;
  img?: string;
  YTLink?: string;
  likeCount: number;
  poepleThatLiked: UserData[];
  date: string;
}
export const Post: React.FC<PostPropsInteface> = (props) => {
  const {
    postType,
    userThatPostedThis,
    text,
    img,
    YTLink,
    poepleThatLiked,
    date,
  } = props;
  const firstUpdate = useRef(true);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  console.log(date);
  const [wasLiked, setIfWasLiked] = useState<boolean>(
    poepleThatLiked.some(
      (x) => JSON.stringify(x) === JSON.stringify(currentlyLoggedInUser)
    )
      ? true
      : false
  );
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    poepleThatLiked.some(
      (x) => JSON.stringify(x) === JSON.stringify(currentlyLoggedInUser)
    )
      ? removeUserFromLikedArray(poepleThatLiked, currentlyLoggedInUser)
      : poepleThatLiked.push(currentlyLoggedInUser);
    savePostsInLocalStorage();
  }, [wasLiked, currentlyLoggedInUser, poepleThatLiked]);
  return (
    <li className="listele">
      <div className="Post">
        <div className="PostUserInfo">
          <img
            src={
              userThatPostedThis.Avatar === undefined
                ? UnkownUser
                : userThatPostedThis.Avatar
            }
            alt="Your Icon"
          />
          <span>{userThatPostedThis.Login}</span>
        </div>
        <div className="PostBody">
          <div className="PostText">{text}</div>
          <div className="PostPhoto">
            {postType === "photo" ? (
              <img src={img} alt="Your Uploaded Mood" />
            ) : (
              <iframe
                src={getLinkId(YTLink || "")}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
        <div className="PostFooter">
          <img
            src={wasLiked ? heartLiked : heart}
            onClick={() => setIfWasLiked(!wasLiked)}
            alt="Place where you love someone post"
          />
        </div>
      </div>
    </li>
  );
};
