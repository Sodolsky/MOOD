import * as React from "react";
import { useState } from "react";
import { ModalBody, Modal, Button, Alert } from "react-bootstrap";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import BackArrow from "./img/backarrow.png";
import { v4 as uuidv4 } from "uuid";
import TextareAutosize from "react-textarea-autosize";
import { FileUploader } from "./FileUploader";
import { useEffect } from "react";
import heartLiked from "./img/heartLiked.svg";
import { UrlUploader } from "./UrlOploader";
import { getLinkId, validateYouTubeUrl } from "./ValidateYoutubeUrl";
import { AddPostIcon } from "./AddPostIcon";
import { currentlyLoggedInUserContext, UserData } from "./App";
import { useContext } from "react";
import { db, storageRef } from "./firebase.js";
import { doc, setDoc, Timestamp, updateDoc } from "@firebase/firestore";
import { ref, uploadBytes } from "@firebase/storage";
import { downloadImageIfPostHasOne, UserForFirebase } from "./Post";
import { LoadingRing } from "./LoadingRing";
import commentSVG from "./img/Comment.svg";
import { useMediaQuery } from "@react-hook/media-query";
import { checkIfTextHaveHashtags } from "./likeFunctions";
import { uniq } from "lodash";
import moment from "moment";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
//Key needs to be changed
const uploadUserImageToStorageBucket = async (
  key: string,
  img: Blob | File
) => {
  const pathRef = ref(storageRef, "PostImages");
  const fileRef = ref(pathRef, `${key}`);
  await uploadBytes(fileRef, img);
};
export interface CommentInterface {
  userThatAddedComment: {
    Avatar: string;
    Login: string;
  };
  content: string;
  date: any;
  usersThatLikedThisComment: UserForFirebase[];
  id?: string;
  parentPostRef?: string;
}
export const CreatePost: React.FC = () => {
  const [addPostIconClicked, setAddPostIconClicked] = useState<boolean>(false);
  const [newPostText, setNewPostText] = useState<string>("");
  const [userImage, setUserImage] = useState<File>();
  const [isLinkChoosen, setIfLinkIsChoosen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [YTLink, setYTLink] = useState<string | undefined>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [postType, setPostType] = useState<string>("");
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const [imgPrevievSrc, setImgPrevievSrc] = useState<undefined | string>(
    undefined
  );
  const [imglock, setImgLock] = useState<boolean>(false);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [rawImageBlob, setRawImageBlob] = useState<File | Blob>();
  const match = useMediaQuery("only screen and (min-width:450px");
  const addNewPostIntoDataBase = async (
    postType: string,
    userThatPostedThis: UserData,
    text: string,
    likeCount: number,
    poepleThatLiked: UserForFirebase[],
    date: string,
    timestamp: Timestamp,
    hashtags: string[],
    URL: string,
    img?: string,
    fileType?: string,
    YTLink?: string
  ) => {
    // const userRef = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
    try {
      await setDoc(doc(db, "Posts", `${date}`), {
        postType: postType,
        userThatPostedThis: {
          Login: userThatPostedThis.Login,
          Avatar: userThatPostedThis.Avatar,
        },
        text: text,
        img: img,
        fileType: fileType,
        hashtags: hashtags,
        YTLink: YTLink,
        likeCount: likeCount,
        poepleThatLiked: poepleThatLiked,
        date: date,
        timestamp: timestamp,
        URL: URL,
      });
      currentlyLoggedInUser.UserPosts?.push(date);
      //Evil Sodol is my testing account and i dont want to update its UserPosts Reference.
      if (currentlyLoggedInUser.Login !== "EVILSODOL") {
        await updateDoc(doc(db, "Users", `${currentlyLoggedInUser.Login}`), {
          UserPosts: currentlyLoggedInUser.UserPosts,
        });
      }
    } catch (error) {
      console.log("Error with adding document", error);
    }
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    const value = event.target.value;
    setNewPostText(value);
  };
  useEffect(() => {
    if (userImage === undefined) {
      return setImgPrevievSrc("");
    }
    setRawImageBlob(userImage);
    return setImgPrevievSrc(URL.createObjectURL(userImage));
  }, [userImage]);
  useEffect(() => {
    isLinkChoosen ? setPostType("video") : setPostType("photo");
  }, [isLinkChoosen]);
  useEffect(() => {
    document.onpaste = function (event) {
      if (event.clipboardData) {
        var items = event.clipboardData.items;
        for (var index in items) {
          var item = items[index];
          if (item.kind === "file") {
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function (event) {
              if (event.target) {
                // console.log(event.target.result?.toString()); // data url!
              }
            };
            if (blob) {
              if (
                blob.type === "video/mp4" ||
                blob.type === "video/ogg" ||
                blob.type === "video/webm"
              ) {
                if (blob.size > 40000000) {
                  //Normal value 800000000
                  return alert(
                    "Your File is bigger than 40MB Try to paste smaller one"
                  );
                } else {
                }
              } else {
                if (blob.size > 15000000) {
                  return alert(
                    "Your File is bigger than 15MB Try to paste smaller one"
                  );
                }
                setRawImageBlob(blob);

                checkFileType(blob);
                setUserImage(blob);
                const data = URL.createObjectURL(blob);
                setImgPrevievSrc(data);
                reader.readAsDataURL(blob);
              }
            }
          }
        }
      }
    };
  }, []);

  //When User decides to dismiss his current Post we need to reset everything
  const dismissPost = (): void => {
    setNewPostText("");
    setImgPrevievSrc("");
    setUserImage(undefined);
    setShowModal(false);
    setYTLink("");
    setIfLinkIsChoosen(false);
    setAddPostIconClicked(false);
    setRawImageBlob(undefined);
    setPostLoading(false);
    setImgLock(false);
  };
  //We need to set Post Type and Add Post To DataBase
  const handlePost = async () => {
    setImgLock(true);
    setPostLoading(true);
    const format = "DD.MM.YYYY, HH:mm:ss";
    const postDate: string = moment(new Date()).format(format);
    let imageUrl: string = "";
    let fileType: string = "";
    if (rawImageBlob !== undefined) {
      await uploadUserImageToStorageBucket(postDate, rawImageBlob);
      await downloadImageIfPostHasOne(postDate).then((item) => {
        imageUrl = item;
      });
    }
    const hashtagArray: string[] = checkIfTextHaveHashtags(newPostText);
    const loweredCaseHashtagArray: string[] = hashtagArray.map((item) => {
      return item.toLowerCase();
    });
    const uniqueHashtagArray = uniq(loweredCaseHashtagArray);
    checkFileType(rawImageBlob)
      ? (fileType = "image")
      : (fileType = "uservideo");
    const userObjForFirebase: UserForFirebase = {
      Login: currentlyLoggedInUser.Login as string,
      Avatar: currentlyLoggedInUser.Avatar as string,
    };
    addNewPostIntoDataBase(
      postType,
      currentlyLoggedInUser,
      newPostText,
      1,
      [userObjForFirebase],
      postDate,
      Timestamp.fromDate(new Date()),
      uniqueHashtagArray,
      uuidv4(),
      imageUrl,
      fileType,
      YTLink
    );
    dismissPost();
  };
  return (
    <>
      {addPostIconClicked ? (
        <div className="createPost">
          <div className="NewPostBody">
            <TextareAutosize
              autoFocus={true}
              maxLength={200}
              maxRows={3}
              onChange={handleChange}
              value={newPostText}
              name="Text"
              placeholder="Describe your Current Mood"
            />
          </div>
          <div className="NewPostFeatures">
            {isLinkChoosen && (
              <div className="YoutubeUrl">
                <img
                  onClick={() => {
                    setYTLink("");
                    setIfLinkIsChoosen(false);
                  }}
                  className="BackArrow"
                  src={BackArrow}
                  alt="Go back and select Post Type Again"
                />
                <input
                  type="text"
                  placeholder="Paste YT Link"
                  onChange={(event) =>
                    setYTLink(() => (event.target.name = event.target.value))
                  }
                  value={YTLink}
                />
              </div>
            )}
            {!isLinkChoosen && (
              <div className="CanBeAddedContainer">
                Is Image Uploaded:
                {rawImageBlob !== undefined &&
                userImage &&
                imgPrevievSrc !== "" &&
                !isLinkChoosen
                  ? "✅"
                  : "❌"}
              </div>
            )}
            <div className="PictureAndSubmit">
              <div className="Picture">
                {!isLinkChoosen && <FileUploader onFileSelect={setUserImage} />}
                <UrlUploader
                  isLinkChoosen={isLinkChoosen}
                  setIfLinkIsChoosen={setIfLinkIsChoosen}
                  onClick={() => {
                    setRawImageBlob(undefined);
                    setImgPrevievSrc("");
                    setUserImage(undefined);
                  }}
                />
              </div>
            </div>
          </div>
          {(YTLink !== "" || userImage !== undefined) &&
            newPostText.replaceAll(/\s/g, "").length > 0 && (
              <div className="CssButtonContainer">
                <hr />
                <div className="wrapperForPrevievButton">
                  <button
                    onClick={() => {
                      //TODO Tutaj dodac sprawdzanie czy jest link wybrany i wtedy podjac odpowiednia akcje
                      if (isLinkChoosen) {
                        if (validateYouTubeUrl(YTLink || "") === false) {
                          return setShowAlert(true);
                        } else {
                          return setShowModal(true);
                        }
                      } else if (rawImageBlob && imgPrevievSrc !== "") {
                        return setShowModal(true);
                      }
                    }}
                    className="PrevievInModal"
                  >
                    See your Own Post
                  </button>
                </div>
              </div>
            )}
        </div>
      ) : (
        <AddPostIcon setAddPostIconClicked={setAddPostIconClicked} />
      )}
      <Modal show={showModal} centered={true}>
        <ModalBody>
          <div className="Post">
            <div className="PostHeader">
              <div className="NameAndDescription">
                <img
                  src={currentlyLoggedInUser.Avatar}
                  className="userAvatar"
                  alt="Your Icon"
                />
                <span>{currentlyLoggedInUser.Login}</span>
              </div>
            </div>
            <div className="PostBody">
              <div className="PostText">{newPostText}</div>
              <div className="PostPhoto">
                {postLoading ? (
                  <LoadingRing colorVariant={"black"} />
                ) : !isLinkChoosen ? (
                  <div className="userImageContainer">
                    {checkFileType(rawImageBlob) ? (
                      <img src={imgPrevievSrc} alt="Your Uploaded Mood" />
                    ) : (
                      <video controls src={imgPrevievSrc} />
                    )}
                  </div>
                ) : (
                  <LiteYouTubeEmbed
                    id={getLinkId(YTLink as string).id}
                    params={getLinkId(YTLink as string).timestamp || ""}
                    title="YouTube video player"
                    adNetwork={false}
                    playlist={false}
                    noCookie={true}
                    webp={true}
                  ></LiteYouTubeEmbed>
                )}
              </div>
              <span className="LikesAndComments">
                <img src={heartLiked} alt="Place where you love someone post" />
                {match && "Hearts"} {1}
                <img
                  src={commentSVG}
                  alt="Place where you can comment someone poost"
                />
                {match && "Comments"} {0}
              </span>
            </div>
          </div>
        </ModalBody>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={
              !imglock
                ? handlePost
                : () => {
                    return console.log("Blokada");
                  }
            }
          >
            Post
          </Button>
          <Button variant="secondary" onClick={dismissPost}>
            Dismiss
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="InvalidLinkAlert">
        <Alert
          variant="danger"
          className="Alert"
          onClose={() => setShowAlert(false)}
          dismissible
          show={showAlert}
        >
          Provide us with a valid Youtube URL
        </Alert>
      </div>
    </>
  );
};
const checkFileType = (rawImageBlob: File | Blob | undefined) => {
  let returnVal: boolean = true;
  switch (rawImageBlob?.type) {
    case "image/png":
    case "image/jpg":
    case "image/gif":
      break;
    case "video/mp4":
    case "video/ogg":
    case "video/webm":
      returnVal = false;
      break;
  }
  return returnVal;
};
