import Tippy from "@tippyjs/react";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { isEqual } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserData } from "./App";
import { db } from "./firebase";
import { NotificationInterface } from "./Header";
import heart from "./img/heart.svg";
import heartLiked from "./img/heartLiked.svg";
import {
  playLikeAnimation,
  removeLikeClass,
  removeUserFromLikedArray,
} from "./likeFunctions";
import { UserForFirebase } from "./Post";
interface LikePostInterface {
  match: boolean;
  currentlyLoggedInUser: UserData;
  poepleThatLiked: UserForFirebase[];
  date: string;
  postId: string;
  userThatPostedLogin: string;
}
export const savePoepleThatLikedPost = async (
  key: string,
  poepleThatLikedArray: UserForFirebase[],
  postId: string,
  login: string,
  userThatPostedLogin: string
) => {
  const postRef = doc(db, "Posts", `${key}`);
  const userRef = doc(db, "Notifications", `${userThatPostedLogin}`);
  if (login !== userThatPostedLogin) {
    const NotificationObj: NotificationInterface = {
      postId: postId,
      type: "like",
      whoDid: login,
      date: moment(new Date()).unix(),
    };
    await updateDoc(userRef, {
      Notifications: arrayUnion(NotificationObj),
    });
  }
  await updateDoc(postRef, {
    poepleThatLiked: poepleThatLikedArray,
  });
};
export const LikePost: React.FC<LikePostInterface> = (props) => {
  const {
    match,
    currentlyLoggedInUser,
    poepleThatLiked,
    date,
    postId,
    userThatPostedLogin,
  } = props;
  const heartRef = React.useRef<any>(null);
  const isLiked = poepleThatLiked.some((x) => {
    return isEqual(x.Login, currentlyLoggedInUser.Login);
  });
  const [wasLiked, setWasLiked] = useState<boolean>(isLiked);
  const [likes, setLikes] = useState<number>(0);
  const handleLikeChange = (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    event.preventDefault();
    const obj: UserForFirebase = {
      Login: currentlyLoggedInUser.Login as string,
      Avatar: currentlyLoggedInUser.Avatar as string,
    };
    if (
      poepleThatLiked.some((x) => {
        return isEqual(x.Login, currentlyLoggedInUser.Login);
      })
    ) {
      removeUserFromLikedArray(poepleThatLiked, obj);
      removeLikeClass(heartRef);
    } else {
      poepleThatLiked.push(obj);
      playLikeAnimation(heartRef);
    }
    saveLikedUsers();
  };
  const saveLikedUsers = (): void => {
    savePoepleThatLikedPost(
      date,
      poepleThatLiked,
      postId,
      currentlyLoggedInUser.Login as string,
      userThatPostedLogin
    );
    setLikes(poepleThatLiked.length);
  };
  useEffect(() => {
    setLikes(poepleThatLiked.length);
  }, [poepleThatLiked]);
  return (
    <>
      <img
        className="HeartToLike"
        ref={heartRef}
        src={
          poepleThatLiked.some((x) => {
            return isEqual(x.Login, currentlyLoggedInUser.Login);
          })
            ? heartLiked
            : heart
        }
        onClick={(event) => {
          setWasLiked(!wasLiked);
          handleLikeChange(event);
        }}
        alt="Place where you love someone post"
      />
      {match && (
        <Tippy
          interactive={true}
          delay={200}
          placement={"left"}
          content={
            <div className="tippyLikes">
              {poepleThatLiked.map((item) => {
                return (
                  <div className="LikedPostContainer" key={item.Login}>
                    <img src={item.Avatar as string} alt="User Avatar" />
                    <Link to={`/users/${item.Login}`}>
                      <span>{item.Login}</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          }
          allowHTML={true}
          animation={"scale"}
          appendTo={"parent"}
        >
          <div>Hearts</div>
        </Tippy>
      )}{" "}
      {likes}
    </>
  );
};
