import * as React from "react";
import { useState } from "react";
import {
  Container,
  Row,
  Col,
  ModalBody,
  Modal,
  Button,
  Alert,
} from "react-bootstrap";
import TextareAutosize from "react-textarea-autosize";
import { FileUploader } from "./FileUploader";
import { useEffect } from "react";
import heart from "./img/heart.svg";
import DefaultUserPhoto from "./img/unkownuser.svg";
import { UrlUploader } from "./UrlOploader";
import { getLinkId, validateYouTubeUrl } from "./ValidateYoutubeUrl";
import { AddPostIcon } from "./AddPostIcon";
import { currentlyLoggedInUserContext } from ".";
import { useContext } from "react";
import { PostDataBase, savePostsInLocalStorage } from "./MainContent";
import { PostPropsInteface } from "./Post";
interface CreatePostInterface {
  dataBaseOfPosts: PostPropsInteface[];
  setDataBaseOfPosts: React.Dispatch<React.SetStateAction<PostPropsInteface[]>>;
}
export const CreatePost: React.FC<CreatePostInterface> = (props) => {
  const { dataBaseOfPosts, setDataBaseOfPosts } = props;
  const [addPostIconClicked, setAddPostIconClicked] = useState<boolean>(false);
  const [newPostText, setNewPostText] = useState<string>("");
  const [userImage, setUserImage] = useState<string | File>("");
  const [isLinkChoosen, setIfLinkIsChoosen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [YTLink, setYTLink] = useState<string | undefined>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [postType, setPostType] = useState<string>("");
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const [imgPrevievSrc, setImgPrevievSrc] = useState<undefined | string>(
    undefined
  );
  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    const value = event.target.value;
    setNewPostText(value);
  };
  useEffect(() => {
    if (userImage === "") {
      return setImgPrevievSrc(
        "https://images.pexels.com/photos/3472690/pexels-photo-3472690.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
      );
    }
    return setImgPrevievSrc(URL.createObjectURL(userImage));
  }, [userImage]);
  useEffect(() => {
    isLinkChoosen ? setPostType("video") : setPostType("photo");
  }, [isLinkChoosen]);
  //When User decides to dismiss his current Post we need to reset everything
  const dismissPost = (): void => {
    setNewPostText("");
    setImgPrevievSrc("");
    setUserImage("");
    setShowModal(false);
    setYTLink("");
    setIfLinkIsChoosen(false);
    setAddPostIconClicked(false);
  };
  //We need to set Post Type and Add Post To DataBase
  const handlePost = (): void => {
    PostDataBase.push({
      postType: postType,
      userThatPostedThis: currentlyLoggedInUser,
      YTLink: YTLink || "",
      text: newPostText,
      img: imgPrevievSrc,
      likeCount: 0,
      poepleThatLiked: [],
      date: new Date().toLocaleTimeString().replace(",", ""),
    });
    setDataBaseOfPosts({ ...dataBaseOfPosts });
    console.log(PostDataBase, dataBaseOfPosts);
    savePostsInLocalStorage();
    dismissPost();
  };
  return (
    <>
      {addPostIconClicked ? (
        <Container className="createPost">
          <Row>
            <Col xs={6} className="NewPostBody">
              <TextareAutosize
                maxRows={2}
                autoFocus
                maxLength={100}
                onChange={handleChange}
                value={newPostText}
                name="Text"
                placeholder="Describe your Current Mood"
              />
            </Col>
            {newPostText.length > 0 && (
              <Col xs={6} className="PictureAndSubmit">
                <div className="Picture">
                  {!isLinkChoosen ? (
                    <>
                      <FileUploader onFileSelect={setUserImage} />
                      or
                      <UrlUploader
                        isLinkChoosen={isLinkChoosen}
                        setIfLinkIsChoosen={setIfLinkIsChoosen}
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      placeholder="Paste YT Link"
                      onChange={(event) =>
                        setYTLink(
                          () => (event.target.name = event.target.value)
                        )
                      }
                      value={YTLink}
                    />
                  )}
                </div>
              </Col>
            )}
          </Row>
          <Row>
            <Col className="WrapperForPreviewButton">
              {(YTLink !== "" || userImage !== "") && (
                <button
                  onClick={() => {
                    //TODO Tutaj dodac sprawdzanie czy jest link wybrany i wtedy podjac odpowiednia akcje
                    if (isLinkChoosen) {
                      if (validateYouTubeUrl(YTLink || "") === false) {
                        return setShowAlert(true);
                      }
                      return setShowModal(true);
                    }
                    return setShowModal(true);
                  }}
                  className="PrevievInModal"
                >
                  See your Own Post
                </button>
              )}
            </Col>
          </Row>
        </Container>
      ) : (
        <AddPostIcon setAddPostIconClicked={setAddPostIconClicked} />
      )}
      <Modal show={showModal} centered={true}>
        <ModalBody>
          <div className="Post">
            <div className="PostUserInfo">
              <img
                src={
                  currentlyLoggedInUser.Avatar
                    ? currentlyLoggedInUser.Avatar
                    : DefaultUserPhoto
                }
                alt="Your Icon"
              />
              <span>Sodol</span>
            </div>
            <div className="PostBody">
              <div className="PostText">{newPostText}</div>
              <div className="PostPhoto">
                {!isLinkChoosen ? (
                  <img src={imgPrevievSrc} alt="Your Uploaded Mood" />
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
              <img src={heart} alt="Place where you love someone post" />
            </div>
          </div>
        </ModalBody>
        <Modal.Footer>
          <Button variant="primary" onClick={handlePost}>
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
