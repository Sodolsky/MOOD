import React, { createElement, useContext, useRef, useState } from "react";
import { Comment, Avatar } from "antd";
import { CommentInterface } from "./CreatePost";
import moment from "moment";
import { isEqual } from "lodash";
import { currentlyLoggedInUserContext, UserData } from "./App";
import { LikeOutlined, LikeFilled } from "@ant-design/icons";
import { removeUserFromLikedArray } from "./likeFunctions";
import { doc, updateDoc } from "@firebase/firestore";
import { db } from "./firebase";
import { Link } from "react-router-dom";
const savePoepleThatLikedComment = async (
  keyforPost: string,
  poepleThatLikedArray: UserData[],
  id: string
) => {
  const postRef = doc(db, "Posts", `${keyforPost}`, "comments", `${id}`);
  await updateDoc(postRef, {
    usersThatLikedThisComment: poepleThatLikedArray,
  });
};
export const CommentComponent: React.FC<CommentInterface> = (props) => {
  let {
    userThatAddedComment,
    content,
    date,
    usersThatLikedThisComment,
    parentPostRef,
    id,
  } = props;
  const AvatarRef = useRef(null);
  const saveLikedUsers = (): void => {
    savePoepleThatLikedComment(
      parentPostRef as string,
      usersThatLikedThisComment,
      id as string
    );
  };
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const isThisFuckingShitLiked = usersThatLikedThisComment.some((x) => {
    return isEqual(x.Login, currentlyLoggedInUser.Login);
  });
  const [isLiked, setIfIsLiked] = useState<boolean>(isThisFuckingShitLiked);
  const [likeCount, setLikeCount] = useState<number>(
    usersThatLikedThisComment.length
  );
  const handleLikeChange = (
    event: React.MouseEvent<Element, MouseEvent>
  ): void => {
    event.preventDefault();
    if (
      usersThatLikedThisComment.some((x) => {
        return isEqual(x.Login, currentlyLoggedInUser.Login);
      })
    ) {
      removeUserFromLikedArray(
        usersThatLikedThisComment,
        currentlyLoggedInUser
      );
      setLikeCount(usersThatLikedThisComment.length);
    } else {
      usersThatLikedThisComment.push(currentlyLoggedInUser);
      setLikeCount(usersThatLikedThisComment.length);
    }
    saveLikedUsers();
  };
  const formatedDate = new Date(date.seconds * 1000);
  const actions = [
    <span
      className="flexWrapForComment"
      onClick={(event) => {
        setIfIsLiked(!isLiked);
        handleLikeChange(event);
      }}
    >
      {createElement(isLiked ? LikeFilled : LikeOutlined)}
      {likeCount}
    </span>,
  ];
  return (
    <>
      <Comment
        style={{
          backgroundColor: "#f0f2f5",
          borderRadius: "1rem",
          display: "flex",
          width: "90%",
          alignItems: "center",
          padding: "0.5rem",
        }}
        actions={actions}
        author={
          <Link to={`/users/${userThatAddedComment.Login}`}>
            {userThatAddedComment.Login}
          </Link>
        }
        key={`${(userThatAddedComment.Login, parentPostRef)}`}
        avatar={
          <Link to={`/users/${userThatAddedComment.Login}`}>
            <Avatar
              ref={AvatarRef}
              className="CommentAvatar"
              src={userThatAddedComment.Avatar}
              alt="User That Commented Avatar"
            />
          </Link>
        }
        datetime={moment(formatedDate).fromNow()}
        content={content}
      />
      {/* <Tippy
        interactive={true}
        interactiveBorder={20}
        maxWidth={"fit-content"}
        delay={200}
        placement={"left-end"}
        content={
          <div className="tippyContent">
            <div className="PostUserInfo">
              <img src={userThatAddedComment.Avatar} alt="Your Icon" />
              <Link to={`/explore/users/${userThatAddedComment.Login}`}>
                <span>{userThatAddedComment.Login}</span>
              </Link>
            </div>
            <span className="userDescription">
              {userThatAddedComment.Description}
            </span>
          </div>
        }
        allowHTML={true}
        className="tippyBox"
        animation={"scale"}
        appendTo={"parent"}
        reference={AvatarRef}
      /> */}
    </>
  );
};
