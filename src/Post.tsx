// Key to download image files is  `${userThatPostedThis.Login}${text}`;
import * as React from "react";
import "./Styles/tippyStyles.scss";
import "tippy.js/animations/scale.css";
import { currentlyLoggedInUserContext, UserData } from "./App";
import { getLinkId } from "./ValidateYoutubeUrl";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import commentSVG from "./img/Comment.svg";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { getRandomInt } from "./likeFunctions";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storageRef } from "./firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "@firebase/firestore";
import { useMediaQuery } from "@react-hook/media-query";
import { CommentInterface } from "./CreatePost";
import { CommentComponent } from "./CommentComponent";
import moment from "moment";
import { LikePost } from "./LikePost";
import { LazyLoadedImage } from "./LazyLoadedImage";
import { Link } from "react-router-dom";
import RemovePostIcon from "./img/xicon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { message } from "antd";
import SkeletonPost from "./SkeletonPost";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { NotificationInterface } from "./Header";
const bottomStyle: React.CSSProperties = {
  borderTop: "black 1px solid",
};
export interface UserForFirebase {
  Login: string;
  Avatar: string;
}
export interface PostPropsInteface {
  postType: string;
  userThatPostedThis: UserForFirebase;
  text: string;
  fileType?: string;
  img?: string;
  YTLink?: string;
  likeCount: number;
  hashtags: string[];
  poepleThatLiked: UserForFirebase[];
  date: string;
  URL: string;
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
  userThatAddedComment: UserData,
  userThatPostedLogin: string,
  postId: string
) => {
  const postRef = collection(db, "Posts", `${key}`, "comments");
  const userRef = doc(db, "Users", `${userThatAddedComment.Login}`);
  const userRefNotification = doc(
    db,
    "Notifications",
    `${userThatPostedLogin}`
  );
  const newCommentObj: CommentInterface = {
    userThatAddedComment: {
      Login: userThatAddedComment.Login as string,
      Avatar: userThatAddedComment.Avatar as string,
    },
    content: text,
    date: date,
    usersThatLikedThisComment: [],
  };
  const userData = await getDoc(userRef);
  const userDataObject = userData.data() as UserData;
  const commentsRefArray = userDataObject.commentsRef;
  if (userThatPostedLogin !== userThatAddedComment.Login) {
    const NotificationObj: NotificationInterface = {
      postId: postId,
      type: "comment",
      whoDid: userThatAddedComment.Login as string,
      date: moment(new Date()).unix(),
    };
    await updateDoc(userRefNotification, {
      Notifications: arrayUnion(NotificationObj),
    });
  }
  await addDoc(postRef, newCommentObj).then(async (doc) => {
    if (commentsRefArray) {
      commentsRefArray.push(doc.path);
      await updateDoc(userData.ref, {
        commentsRef: commentsRefArray,
      });
    }
  });
};
export const Post: React.FC<{ date: string }> = ({ date }) => {
  const match = useMediaQuery("only screen and (min-width:450px");
  //We are defining date as another variable to avoid name collison when passing props to comment element
  const parentDate = date;
  const LinkWasCopiedSuccesfullyMessage = () => {
    message.success("Link was Copied to your clipboard 👍", 3);
  };
  const myDate = moment(parentDate, "DD-MM-YYYY  HH:mm:ss").toDate();
  const [allComments, setAllComments] = useState<CommentInterface[]>([]);
  const [topComment, setTopComment] = useState<null | CommentInterface>(null);
  const [commentVal, changeCommentVal] = useState<string>("");
  const [commentCount, setCommentCount] = useState<number>(0);
  const [postData, setPostData] = useState<Omit<
    PostPropsInteface,
    "date"
  > | null>(null);
  const [addingCommentSelected, setIfAddingCommentIsSelected] =
    useState<boolean>(false);
  const firstRender = React.useRef<boolean>(true);
  // Here we are fetching the comments data and setting up top comment
  useEffect(() => {
    const refForComments = collection(db, "Posts", `${date}`, "comments");
    const refForPost = doc(db, "Posts", `${date}`);
    let DataContainer: PostPropsInteface = {
      date: "",
      postType: "",
      userThatPostedThis: {
        Login: "",
        Avatar: "",
      },
      text: "",
      likeCount: 0,
      hashtags: [],
      poepleThatLiked: [],
      URL: "",
      YTLink: "",
      fileType: "",
      img: "",
    };
    const PostSubscription = onSnapshot(refForPost, (doc) => {
      const data = doc.data() as PostPropsInteface;
      DataContainer = data;
      // setPostData(data);
    });
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
        if (firstRender.current) {
          firstRender.current = false;
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
      }
      setPostData(DataContainer);
    });
    return () => {
      Unsubscribe();
      PostSubscription();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    changeCommentVal(val);
  };
  return !postData ? (
    <SkeletonPost />
  ) : (
    <div className="ListWrapper">
      <div className="Post">
        <div className="PostUserInfo">
          <img
            src={postData?.userThatPostedThis.Avatar}
            className="userAvatar"
            alt="Your Icon"
          />
          <FontAwesomeIcon
            icon={faLink}
            className="LinkToPost"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.protocol}//${window.location.host}/explore/posts/${postData.URL}`
              );
              LinkWasCopiedSuccesfullyMessage();
            }}
          />
          {currentlyLoggedInUser.Login === "EVILSODOL" &&
            postData?.userThatPostedThis.Login === "EVILSODOL" && (
              <img
                src={RemovePostIcon}
                alt="Click to remove your Post"
                className="DeletePost"
                onClick={() => {
                  removePost(currentlyLoggedInUser, date);
                }}
              />
            )}
          <span>
            <Link to={`/users/${postData?.userThatPostedThis.Login}`}>
              {postData?.userThatPostedThis.Login}
            </Link>
          </span>
        </div>
        <div className="PostBody">
          <div className="PostText">
            {postData && postData.hashtags.length > 0
              ? postData?.text
                  .split(" ")
                  .map<React.ReactNode>((item) => {
                    if (
                      postData.hashtags.some(
                        (arritem) => arritem === item.toLowerCase()
                      )
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
              : postData?.text}
          </div>
          <div className="PostPhoto">
            {postData?.postType === "photo" ? (
              <div className="userImageContainer">
                {postData?.fileType === "image" ? (
                  <LazyLoadedImage
                    src={postData?.img as string}
                    alt={"Your Uploaded Mood"}
                  />
                ) : (
                  <video controls src={postData?.img} />
                )}
              </div>
            ) : (
              <LiteYouTubeEmbed
                id={getLinkId(postData.YTLink as string).id}
                params={getLinkId(postData.YTLink as string).timestamp || ""}
                title="YouTube video player"
                adNetwork={false}
                playlist={false}
                webp={true}
              ></LiteYouTubeEmbed>
            )}
          </div>
          <span className="WhenPostWasAdded">{moment(myDate).fromNow()}</span>
          <span className="LikesAndComments">
            <LikePost
              currentlyLoggedInUser={currentlyLoggedInUser}
              match={match}
              poepleThatLiked={
                postData?.poepleThatLiked ? postData.poepleThatLiked : []
              }
              date={date}
              postId={postData.URL}
              userThatPostedLogin={postData.userThatPostedThis.Login as string}
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
                    currentlyLoggedInUser,
                    postData.userThatPostedThis.Login as string,
                    postData.URL
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
                      parentPostRef={date}
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
                    return b.date - a.date;
                  })
                  .map((item) => {
                    return (
                      <CommentComponent
                        key={`${item.date}${currentlyLoggedInUser.UID}${item.content}`}
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
const removePost = async (currentlyLoggedInUser: UserData, key: string) => {
  const removedPostRef = doc(db, "Posts", key);
  const userRef = doc(db, "Users", currentlyLoggedInUser.Login as string);
  const userdoc = await getDoc(userRef);
  const Data = userdoc.data() as UserData;
  const userPostsArray = Data.UserPosts;
  if (userPostsArray) {
    const updatedUserPosts = userPostsArray.filter((x) => x !== key);
    await updateDoc(userRef, {
      UserPosts: updatedUserPosts,
    });
    await deleteDoc(removedPostRef);
  }
};
