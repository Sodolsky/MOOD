// Key to download image files is  `${userThatPostedThis.Login}${text}`;
import * as React from "react";
import "./Styles/tippyStyles.scss";
import "tippy.js/animations/scale.css";
import { currentlyLoggedInUserContext, UserData } from ".";
import { getLinkId } from "./ValidateYoutubeUrl";
import commentSVG from "./img/Comment.svg";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { getRandomInt } from "./likeFunctions";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storageRef } from "./firebase";
import { addDoc, collection, onSnapshot } from "@firebase/firestore";
import Tippy from "@tippyjs/react";
import { useMediaQuery } from "@react-hook/media-query";
import { CommentInterface } from "./CreatePost";
import { CommentComponent } from "./CommentComponent";
import moment from "moment";
import { LikePost } from "./LikePost";
import { LazyLoadedImage } from "./LLImage";
import { Link } from "react-router-dom";
const bottomStyle: React.CSSProperties = {
  borderTop: "black 1px solid",
};
export interface PostPropsInteface {
  postType: string;
  userThatPostedThis: UserData;
  text: string;
  fileType?: string;
  img?: string;
  YTLink?: string;
  likeCount: number;
  hashtags: string[];
  poepleThatLiked: UserData[];
  date: string;
}
export const downloadImageIfPostHasOne = async (key: string) => {
  const pathRef = ref(storageRef, "PostImages");
  const fileRef = ref(pathRef, `${key}`);
  let returnImgURL: string = "";
  await getDownloadURL(fileRef).then((downloadedImage) => {
    returnImgURL = downloadedImage;
  });
  return returnImgURL;
};
export const addCommentToDataBase = async (
  key: string,
  text: string,
  date: Date,
  userThatAddedComment: UserData
) => {
  const postRef = collection(db, "Posts", `${key}`, "comments");
  const newCommentObj: CommentInterface = {
    userThatAddedComment: userThatAddedComment,
    content: text,
    date: date,
    usersThatLikedThisComment: [],
  };
  await addDoc(postRef, newCommentObj);
};
export const Post: React.FC<PostPropsInteface> = (props) => {
  const match = useMediaQuery("only screen and (min-width:450px");
  let {
    postType,
    userThatPostedThis,
    text,
    img,
    YTLink,
    poepleThatLiked,
    date,
    fileType,
    hashtags,
  } = props;
  //We are defining date as another variable to avoid name collison when passing props to comment element
  const parentDate = date;
  const myDate = moment(parentDate, "DD-MM-YYYY  HH:mm:ss").toDate();
  const [allComments, setAllComments] = useState<CommentInterface[]>([]);
  const [topComment, setTopComment] = useState<null | CommentInterface>(null);
  const [commentVal, changeCommentVal] = useState<string>("");
  const [commentCount, setCommentCount] = useState<number>(0);
  const [addingCommentSelected, setIfAddingCommentIsSelected] =
    useState<boolean>(false);
  // Here we are fetching the comments data and setting up top comment
  useEffect(() => {
    const refForComments = collection(db, "Posts", `${date}`, "comments");
    const Unsubscribe = onSnapshot(refForComments, (doc) => {
      if (doc.docs.length > 0) {
        const arrayForSave: CommentInterface[] = [];
        doc.docs.forEach((item) => {
          const comment = {
            ...(item.data() as CommentInterface),
            id: item.id,
          };
          arrayForSave.push(comment);
        });
        setAllComments(arrayForSave);
        setCommentCount(arrayForSave.length);
        if (arrayForSave.length === 0) {
          return;
        }
        if (arrayForSave.length === 1) {
          setTopComment(arrayForSave[0]);
        } else {
          // We need to find the highest amount of likes in comments array
          arrayForSave.sort((a: CommentInterface, b: CommentInterface) => {
            return (
              b.usersThatLikedThisComment.length -
              a.usersThatLikedThisComment.length
            );
          });
          //Then we need to estimate if there are more comments that have the same amount of likes
          const numberOfHighestLikeComments = arrayForSave.filter((item) => {
            return (
              item.usersThatLikedThisComment.length ===
              arrayForSave[0].usersThatLikedThisComment.length
            );
          }).length;
          //If there is only one comment with high amount of likes we set it as a topComment
          if (numberOfHighestLikeComments === 1) {
            setTopComment(arrayForSave[0]);
          } else {
            //If not we randomise the top comment from highest amount of like comments
            const rand = getRandomInt(0, numberOfHighestLikeComments);
            setTopComment(arrayForSave[rand]);
          }
        }
      }
    });
    return () => Unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    changeCommentVal(val);
  };
  return (
    <div className="ListWrapper">
      <div className="Post">
        <div className="PostUserInfo">
          <Tippy
            interactive={true}
            interactiveBorder={20}
            maxWidth={"250"}
            delay={200}
            placement={"top-end"}
            content={
              <div className="tippyContent">
                <div className="PostUserInfo">
                  <img src={userThatPostedThis.Avatar} alt="Your Icon" />
                  <Link to={`/explore/users/${userThatPostedThis.Login}`}>
                    <span>{userThatPostedThis.Login}</span>
                  </Link>
                </div>
                <span className="userDescription">
                  {userThatPostedThis.Description}
                </span>
              </div>
            }
            allowHTML={true}
            className="tippyBox"
            animation={"scale"}
            appendTo={"parent"}
          >
            <img
              src={userThatPostedThis.Avatar}
              className="userAvatar"
              alt="Your Icon"
            />
          </Tippy>
          <span>
            <Link to={`/explore/users/${userThatPostedThis.Login}`}>
              {userThatPostedThis.Login}
            </Link>
          </span>
        </div>
        <div className="PostBody">
          <div className="PostText">
            {hashtags.length > 0
              ? text
                  .split(" ")
                  .map<React.ReactNode>((item) => {
                    if (
                      hashtags.some((arritem) => arritem === item.toLowerCase())
                    ) {
                      let route = item.substring(1);
                      route = route.toLowerCase();
                      return (
                        <Link to={`/explore/tag/${route}`} key={item}>
                          {item.toLowerCase()}
                        </Link>
                      );
                    } else {
                      return item;
                    }
                  })
                  .reduce((prev, curr) => [prev, " ", curr])
              : text}
          </div>
          <div className="PostPhoto">
            {postType === "photo" ? (
              <div className="userImageContainer">
                {fileType === "image" ? (
                  <LazyLoadedImage
                    src={img as string}
                    alt={"Your Uploaded Mood"}
                  />
                ) : (
                  <video controls src={img} />
                )}
              </div>
            ) : (
              <iframe
                src={getLinkId(YTLink || "")}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer;  clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <span className="WhenPostWasAdded">{moment(myDate).fromNow()}</span>
          <span className="LikesAndComments">
            <LikePost
              currentlyLoggedInUser={currentlyLoggedInUser}
              match={match}
              poepleThatLiked={poepleThatLiked}
              date={date}
            />
            <img
              className="Comment on Someone's post"
              src={commentSVG}
              onClick={(event) => {
                setIfAddingCommentIsSelected(!addingCommentSelected);
              }}
              alt="Place where you love someone post"
            />
            {match && "Comments"} {commentCount}
          </span>
        </div>
        <div
          className="PostFooter"
          style={commentCount > 0 || addingCommentSelected ? bottomStyle : {}}
        >
          {!addingCommentSelected ? null : (
            <div className="addComment">
              <input
                type="text"
                value={commentVal}
                onChange={handleChange}
                placeholder="Your comment"
              />
              <button
                onClick={() => {
                  addCommentToDataBase(
                    date,
                    commentVal,
                    new Date(),
                    currentlyLoggedInUser
                  );
                  changeCommentVal("");
                }}
                disabled={commentVal.length < 1}
              >
                Add
              </button>
            </div>
          )}
          <div className="TopComment">
            {topComment === null
              ? // <p>{randomCommentText}</p>
                null
              : !addingCommentSelected && (
                  <>
                    <CommentComponent
                      userThatAddedComment={topComment.userThatAddedComment}
                      content={topComment.content}
                      date={topComment.date}
                      usersThatLikedThisComment={
                        topComment.usersThatLikedThisComment
                      }
                      parentPostRef={parentDate}
                      id={topComment.id}
                    />
                  </>
                )}
          </div>
          {!addingCommentSelected ? null : (
            <>
              <div className="CommentList">
                {allComments
                  .sort((a: CommentInterface, b: CommentInterface) => {
                    return +moment(a.date) - +moment(b.date);
                  })
                  .map((item) => {
                    return (
                      <CommentComponent
                        key={`${uuidv4()}`}
                        content={item.content}
                        date={item.date}
                        userThatAddedComment={item.userThatAddedComment}
                        usersThatLikedThisComment={
                          item.usersThatLikedThisComment
                        }
                        id={item.id}
                        parentPostRef={date}
                      />
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
