import Tippy from "@tippyjs/react";
import { doc, updateDoc } from "firebase/firestore";
import { isEqual } from "lodash";
import React, { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserData } from ".";
import { db } from "./firebase";
import heart from "./img/heart.svg";
import heartLiked from "./img/heartLiked.svg";
import {
  playLikeAnimation,
  removeLikeClass,
  removeUserFromLikedArray,
} from "./likeFunctions";
interface LikePostInterface {
  match: boolean;
  currentlyLoggedInUser: UserData;
  poepleThatLiked: UserData[];
  date: string;
}
export const savePoepleThatLikedPost = async (
  key: string,
  poepleThatLikedArray: UserData[]
) => {
  const postRef = doc(db, "Posts", `${key}`);
  await updateDoc(postRef, {
    poepleThatLiked: poepleThatLikedArray,
  });
};
export const LikePost: React.FC<LikePostInterface> = (props) => {
  const { match, currentlyLoggedInUser, poepleThatLiked, date } = props;
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
    if (
      poepleThatLiked.some((x) => {
        return isEqual(x.Login, currentlyLoggedInUser.Login);
      })
    ) {
      removeUserFromLikedArray(poepleThatLiked, currentlyLoggedInUser);
      removeLikeClass(heartRef);
    } else {
      poepleThatLiked.push(currentlyLoggedInUser);
      playLikeAnimation(heartRef);
    }
    saveLikedUsers();
  };
  const saveLikedUsers = (): void => {
    savePoepleThatLikedPost(date, poepleThatLiked);
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
                  <div className="LikedPostContainer" key={item.Email}>
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
