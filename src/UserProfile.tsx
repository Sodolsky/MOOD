import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  updateDoc,
} from "@firebase/firestore";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import {
  currentlyLoggedInUserContext,
  setCurrentlyLoggedInUserContext,
  UserData,
} from ".";
import { db, storageRef } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
import "./Styles/UserProfile.scss";
import ChangeIcon from "./img/change.svg";
import Yes from "./img/yes.png";
import No from "./img/no.png";
import ChangeBackgroundIcon from "./img/backgroundicon.png";
import { useDropzone } from "react-dropzone";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { Dropdown, Empty, Menu, Switch } from "antd";
import { Link } from "react-router-dom";
import { query, where, orderBy } from "firebase/firestore";
export type userPrefferedPostType =
  | "Latest Post"
  | "Most Liked"
  | "Oldest Post";
export const queryPostByDate = async (key: string) => {
  const ref = doc(db, "Posts", `${key}`);
  const highlightedPost = await getDoc(ref);
  return highlightedPost.data() as PostPropsInteface;
};
export const queryPostByLikeCount = async (userLogin: string) => {
  const PostCollection = collection(db, "Posts");
  const q = query(
    PostCollection,
    where("userThatPostedThis.Login", "==", `${userLogin}`),
    orderBy("likeCount", "desc"),
    limit(1)
  );
  const MostLikedPostData: PostPropsInteface[] = [];
  const MostLikedPost = await getDocs(q);
  MostLikedPost.forEach((item) => {
    MostLikedPostData.push(item.data() as PostPropsInteface);
  });
  return MostLikedPostData[0];
};
const applyChanges = async (
  user: string,
  color: string,
  userPrefferedPost: userPrefferedPostType | null
) => {
  if (!userPrefferedPost) {
  }
  const userRef = doc(db, "Users", user);
  updateDoc(userRef, {
    BackgroundColor: color,
    userPrefferedPost: userPrefferedPost,
  });
};
const uploadUserImageToStorageBucket = async (
  key: string,
  img: Blob | File
) => {
  const pathRef = ref(storageRef, "UserProfileImages");
  const fileRef = ref(pathRef, `${key}`);
  await uploadBytes(fileRef, img);
};
const UserProfile: React.FC = () => {
  const location = useLocation<Location>();
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);
  const [isUserValid, setIfUserIsValid] = useState<boolean>(false);
  const [displayBGImage, setDisplayBGImage] = useState<boolean>(true);
  const [shouldBackgroundCover, setshouldBackgroundCover] =
    useState<boolean>(false);
  const [profileIsBeingChanged, setProfileIsBeingChanged] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const setCurrentlyLoggedInUser = useContext(setCurrentlyLoggedInUserContext);
  const [highlightedPost, sethighlightedPost] =
    useState<PostPropsInteface | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userPrefferedPost, setUserPrefferedPost] =
    useState<userPrefferedPostType | null>(null);
  const profilePathLogin = useParams<{ user: string }>();
  const [profileColorValue, setprofileColorValue] = useState<string>(
    userData?.BackgroundColor || ""
  );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setprofileColorValue(value);
  };
  const handleSwitchChange = (state: boolean) => {
    state ? setDisplayBGImage(true) : setDisplayBGImage(false);
  };
  useEffect(() => {
    if (userData) {
      setprofileColorValue(userData.BackgroundColor as string);
      setIsContentLoaded(true);
    }
  }, [userData]);
  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles[0].size > 8000000) {
        return alert("Your File is bigger than 8MB Try to upload smaller one");
      }
      const fileRef = ref(
        storageRef,
        `UserProfileImages/${currentlyLoggedInUser.Login}`
      );
      setIsLoading(true);
      const userRef = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
      await uploadUserImageToStorageBucket(
        currentlyLoggedInUser.Login as string,
        acceptedFiles[0]
      );
      const myRef = await getDownloadURL(fileRef);
      await updateDoc(userRef, {
        BackgroundImage: myRef,
      });
      setCurrentlyLoggedInUser!((prevState: UserData) => {
        return { ...prevState, BackgroundImage: myRef };
      });
      const objectWrapper: UserData = {
        ...userData!,
        BackgroundImage: myRef,
      };
      const img = new Image();
      img.src = myRef;
      img.onload = () => {
        const proportion = window.innerWidth / img.width;
        proportion > 2.5
          ? setshouldBackgroundCover(false)
          : setshouldBackgroundCover(true);
      };
      setUserData(objectWrapper);
      setDisplayBGImage(true);
      setIsLoading(false);
    },
    [currentlyLoggedInUser, setCurrentlyLoggedInUser, userData]
  );
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg,image/png",
    onDrop,
  });
  useEffect(() => {
    //Function to get UserProfile data invoked on mount
    const getUserProfileData = async (profilePath: string) => {
      const ref = doc(db, "Users", `${profilePath}`);
      const userDataFeched = await getDoc(ref);
      const userobj = userDataFeched.data() as UserData;
      if (!userobj) {
        setIfUserIsValid(false);
        return;
      }
      const userPrefferedPost = userobj.userPrefferedPost;
      setUserData(userobj as UserData);
      setUserPrefferedPost(userPrefferedPost as userPrefferedPostType);
    };
    getUserProfileData(profilePathLogin.user);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  useEffect(() => {
    if (userData?.BackgroundImage !== "") {
      const img = new Image();
      img.src = userData?.BackgroundImage as string;
      img.onload = () => {
        const proportion = window.innerWidth / img.width;
        proportion > 2.5
          ? setshouldBackgroundCover(false)
          : setshouldBackgroundCover(true);
      };
    }
  }, [userData]);
  useEffect(() => {
    if (profileIsBeingChanged) {
      setPostForUser();
    } else if (userPrefferedPost !== null) {
      setPostForUser();
    }
  }, [userPrefferedPost]);
  const setPostForUser = () => {
    if (userData?.UserPosts) {
      switch (userPrefferedPost) {
        case "Latest Post":
          queryPostByDate(
            userData.UserPosts[userData.UserPosts?.length - 1]
          ).then((data) => {
            sethighlightedPost(data);
          });
          break;
        case "Most Liked":
          if (userData.Login) {
            queryPostByLikeCount(userData.Login).then((data) => {
              sethighlightedPost(data);
            });
          }
          break;
        case "Oldest Post":
          queryPostByDate(userData.UserPosts[0]).then((data) => {
            sethighlightedPost(data);
          });
          break;
        default:
          console.error(
            "An error has occured UserProfile Component swich statement"
          );
      }
    }
  };
  const bestPostMenu = (
    <Menu>
      <Menu.Item key="0" onClick={() => setUserPrefferedPost("Latest Post")}>
        <span>Latest Post</span>
      </Menu.Item>
      <Menu.Item key="1" onClick={() => setUserPrefferedPost("Most Liked")}>
        <span>Most Liked</span>
      </Menu.Item>
      <Menu.Item key="2" onClick={() => setUserPrefferedPost("Oldest Post")}>
        <span>Oldest Post</span>
      </Menu.Item>
    </Menu>
  );
  return isContentLoaded ? (
    <>
      <div
        className={`BackGroundLayer ${
          shouldBackgroundCover ? "CoverEntireBackground" : ""
        }`}
        style={{
          backgroundColor: profileIsBeingChanged
            ? profileColorValue
            : userData?.BackgroundColor,
          background: displayBGImage
            ? `url(${userData?.BackgroundImage})`
            : profileIsBeingChanged
            ? profileColorValue
            : userData?.BackgroundColor,
        }}
      >
        <div className="UserInfoContainer">
          {!profileIsBeingChanged
            ? currentlyLoggedInUser.Login === userData?.Login && (
                <div className="changeProfile">
                  <img
                    src={ChangeIcon}
                    alt={"Change Your Profile settings"}
                    onClick={() => {
                      setProfileIsBeingChanged(!profileIsBeingChanged);
                    }}
                  />
                </div>
              )
            : null}
          {profileIsBeingChanged && (
            <div className="AcceptOrDiscardChanges">
              {!isLoading ? (
                <div {...getRootProps()}>
                  <img src={ChangeBackgroundIcon} alt="Change Background" />
                  <input {...getInputProps()} />
                </div>
              ) : (
                <div style={{ right: "80px" }}>
                  <LoadingRing colorVariant="black" />
                </div>
              )}
              <img
                src={Yes}
                alt="ApplyChanges"
                onClick={async () => {
                  await applyChanges(
                    currentlyLoggedInUser.Login as string,
                    profileColorValue,
                    userPrefferedPost
                  );
                  const objectWrapper: UserData = {
                    ...userData!,
                    BackgroundColor: profileColorValue,
                    userPrefferedPost: userPrefferedPost,
                  };
                  setUserData(objectWrapper);
                  setProfileIsBeingChanged(false);
                }}
              />
              <img
                src={No}
                alt="DiscardChanges"
                onClick={() => {
                  setProfileIsBeingChanged(false);
                }}
              />
            </div>
          )}
          {profileIsBeingChanged ? (
            <div className={"ChangeColorContainer"}>
              <input
                type="color"
                value={profileColorValue}
                onChange={handleChange}
                onClick={() => {
                  setDisplayBGImage(false);
                }}
              />
            </div>
          ) : (
            <div className={"ChangeColorContainer"}>
              <Switch
                unCheckedChildren={"Color"}
                checkedChildren={"Image"}
                onChange={handleSwitchChange}
                defaultChecked
                checked={displayBGImage}
              />
            </div>
          )}
          <div className="UserImage">
            <img
              src={`${userData?.Avatar}` as string}
              alt={"Visited profile Avatar"}
            />
          </div>
          <div className="UserNameAndDescription">
            <span>{userData?.Login}</span>
            <div>{userData?.Description}</div>
          </div>
          <div className="LatestPost">
            {profileIsBeingChanged ? (
              <Dropdown
                overlay={bestPostMenu}
                trigger={["hover"]}
                placement="topCenter"
              >
                <span className="biggerText" style={{ color: "blue" }}>
                  {userPrefferedPost}
                </span>
              </Dropdown>
            ) : (
              <span className="biggerText">{userPrefferedPost}</span>
            )}
            {highlightedPost ? (
              <>
                <Link to={`/explore/users/${userData?.Login}/Posts`}>
                  <button className="VievAllPosts">View all user Posts</button>
                </Link>
                <div className="postContainerOnUserProfile">
                  <Post
                    key={`${highlightedPost.date} ${highlightedPost.userThatPostedThis.Email} ${highlightedPost.userThatPostedThis.Description}`}
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
                    URL={highlightedPost.URL}
                  />
                </div>
              </>
            ) : (
              <span className="biggerText">User didn't add a Post yet 😭</span>
            )}
          </div>
          <div className="Stats">
            <span>
              <h3>UserPosts</h3>
              <span>{userData?.UserPosts?.length}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  ) : isUserValid ? (
    <div className="LoaderBox">
      <LoadingRing colorVariant={"white"} />
    </div>
  ) : (
    <div className="LoaderBox" style={{ marginTop: "1rem", color: "white" }}>
      <Empty
        style={{ fontSize: 20 }}
        description="This User doesn't exist :("
      />
    </div>
  );
};
export default UserProfile;
