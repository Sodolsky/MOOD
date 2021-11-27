import React from "react";
import { useContext, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Col, Container, Row } from "react-bootstrap";
import {
  currentlyLoggedInUserContext,
  setCurrentlyLoggedInUserContext,
  UserData,
} from ".";
import "./Styles/Settings.scss";
import { baseStyle } from "./likeFunctions";
import { useState } from "react";
import { auth, db, storageRef } from "./firebase";
import { ref } from "@firebase/storage";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { LoadingRing } from "./LoadingRing";
import TextareAutosize from "react-textarea-autosize";

// import moment from "moment";
// const addUsersToTheirPosts = async () => {
//   const allPostsRef = collection(db, "Posts");
//   const allUsersRef = collection(db, "Users");
//   const allPostsArray = await getDocs(allPostsRef);
//   const allUsers = await getDocs(allUsersRef);
//   const someArr: any = [];
//   const someUSRArr: any = [];
//   allPostsArray.forEach((doc) => {
//     if (doc.exists()) {
//       someArr.push(doc.data());
//     } else {
//       console.log("bug");
//     }
//   });
//   allUsers.forEach((doc) => {
//     if (doc.exists()) {
//       someUSRArr.push(doc.data());
//     }
//   });
//   for (const i of someUSRArr) {
//     const newArr = [];
//     for (const j of someArr) {
//       if (i.Login === j.userThatPostedThis.Login) {
//         newArr.push(j.date);
//       }
//     }
//     updateDoc(doc(db, "Users", `${i.Login}`), {
//       UserPosts: newArr,
//     });
//   }
// };
// const copyPosts = async () => {
//   const oldPostsRef = collection(db, "Posts");
//   const newPosts = collection(db, "Posts2");
//   const q = query(newPosts, where("text", "!=", ""));
//   const myDocs = await getDocs(q);
//   let count = 0;
//   myDocs.forEach((item) => {
//     const obj = item.data() as PostPropsInteface;
//     if (obj.id) {
//       count += 1;
//     }
//   });
//   console.log(count);
//   // myDocs.forEach(async (item) => {
//   //   const obj = item.data() as PostPropsInteface;
//   //   const docRef = await addDoc(newPosts, obj);
//   //   const rf = doc(db, "Posts2", docRef.id);
//   //   await updateDoc(rf, {
//   //     id: docRef.id,
//   //   });
//   // });
// };
// const
// const quickQuery = async () => {
//   type commentUserType = { Login: string; commentsRef: string[] };
//   const userCommentsRefArray: commentUserType[] = [];
//   const userRefs = collection(db, "Users");
//   const PostsRef = collection(db, "Posts");
//   const userDocs = await getDocs(userRefs);
//   userDocs.forEach((item) => {
//     const obj = item.data() as UserData;
//     userCommentsRefArray.push({
//       Login: obj.Login as string,
//       commentsRef: obj.commentsRef as string[],
//     });
//   });
//   const myDocs = await getDocs(PostsRef);
//   let total = 0;
//   myDocs.forEach(async (item) => {
//     const CommentsCollectionId = collection(
//       db,
//       "Posts",
//       `${item.id}`,
//       "comments"
//     );
//     const comments = await getDocs(CommentsCollectionId);
//     total += comments.size;
//     comments.forEach((item) => {
//       const obj = item.data() as CommentInterface;
//       const path = item.ref.path;
//       const loginofUsr = obj.userThatAddedComment.Login;
//       userCommentsRefArray.find((o, i) => {
//         if (o.Login === loginofUsr) {
//           const arr = o.commentsRef;
//           arr.push(path);
//           userCommentsRefArray[i] = {
//             Login: loginofUsr,
//             commentsRef: arr,
//           };
//           return true;
//         }
//       });
//     });
//     if (total === 1699) {
//       userCommentsRefArray.forEach((item) => {
//         const ref = doc(db, "Users", item.Login);
//         updateDoc(ref, {
//           commentsRef: item.commentsRef,
//         });
//       });
//       console.log("Done");
//     }
//   });
// };
// const quickOperation = async () => {
//   const ref = collection(db, "Posts");
//   const myDocs = await getDocs(ref);
//   myDocs.forEach((item) => {
//     const randId = uuidv4();
//     updateDoc(item.ref, {
//       URL: randId,
//     });
//   });
// };
export const Settings: React.FC = () => {
  const setCurrentlyLoggedInUser = useContext(setCurrentlyLoggedInUserContext);
  const [userDescription, setUserDescription] = useState<string>("");
  const [isUserChangingDescription, setIfUserIsChangingDescription] =
    useState<boolean>(false);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    const value = event.target.value;
    setUserDescription(value);
  };
  // Here wa handle update user Description
  const updateUserDescription = async (message: string) => {
    const userRef = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
    await updateDoc(userRef, {
      Description: message,
    });
    if (currentlyLoggedInUser.UserPosts !== undefined) {
      currentlyLoggedInUser.UserPosts.forEach((item) => {
        const postRef = doc(db, "Posts", `${item}`);
        updateDoc(postRef, {
          "userThatPostedThis.Description": message,
        });
      });
    }
    setCurrentlyLoggedInUser!((prevState: UserData) => {
      return { ...prevState, Description: message };
    });
  };
  // Here we Upload a file into a Cloud Storage and also change currentUser Avatar to fileRef.
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const fileRef = ref(storageRef, `${currentlyLoggedInUser.Login}`);
      const userRef = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
      if (acceptedFiles[0].size > 10000000) {
        return alert("Your File is bigger than 10MB Try to upload smaller one");
      }
      setifNewAvatarIsBeingLoaded(true);
      await uploadBytes(fileRef, acceptedFiles[0]).then((snapshot) => {});
      // We use login cause its default path for Avatar that is being save at cloud storage.
      const file = await getDownloadURL(fileRef);
      await updateDoc(userRef, {
        Avatar: file,
      });
      if (currentlyLoggedInUser.UserPosts !== undefined) {
        currentlyLoggedInUser.UserPosts.forEach((item) => {
          const postRef = doc(db, "Posts", `${item}`);
          updateDoc(postRef, {
            "userThatPostedThis.Avatar": file,
          });
        });
      }
      setCurrentlyLoggedInUser!((prevState: UserData) => {
        return { ...prevState, Avatar: file };
      });
      // addUsersToTheirPosts();
      // quickQuery();
      // quickOperation();
      setifNewAvatarIsBeingLoaded(false);
      setifAvatarIsBeingChanged(false);
    },
    [currentlyLoggedInUser, setCurrentlyLoggedInUser]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/jpeg,image/png",
    onDrop,
  });
  const [avatarIsBeingChanged, setifAvatarIsBeingChanged] =
    useState<boolean>(false);
  const [newAvatarIsBeingLoaded, setifNewAvatarIsBeingLoaded] =
    useState<boolean>(false);
  /* Code was taken from https://react-dropzone.js.org/#section-styling-dropzone  */
  return (
    <>
      <div className="logOutButtonContainer">
        <button
          className="logOutButton"
          onClick={() => {
            auth.signOut();
          }}
        >
          Log me Out
        </button>
      </div>
      {/* Its empty because its inheriting grid from MainContent Component */}
      <Container className="contain">
        <div className="styleContainer">
          <Row>
            <Col>
              <div className="changeAvatar">
                <h4>Your Avatar</h4>
                {avatarIsBeingChanged ? (
                  !newAvatarIsBeingLoaded ? (
                    <>
                      <div style={baseStyle} {...getRootProps()}>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                          <p>Drag the files here...</p>
                        ) : (
                          <p>Select files or drag them</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <LoadingRing colorVariant={"black"} />
                    </div>
                  )
                ) : (
                  <>
                    <img src={currentlyLoggedInUser.Avatar} alt="User Avatar" />
                    <button
                      onClick={() =>
                        setifAvatarIsBeingChanged(!avatarIsBeingChanged)
                      }
                    >
                      Change
                    </button>
                  </>
                )}
              </div>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <h4>Your Profile Description</h4>
              {isUserChangingDescription ? (
                <>
                  <div className="centerFlex">
                    <TextareAutosize
                      maxRows={3}
                      autoFocus
                      style={{ display: "inline" }}
                      maxLength={100}
                      onChange={handleChange}
                      value={userDescription}
                      name="Text"
                      placeholder="Your Profile Description"
                    />
                  </div>
                  <div className="ChangeDescriptionButton">
                    <button
                      onClick={(_) => {
                        setIfUserIsChangingDescription(false);
                        updateUserDescription(userDescription);
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="centerFlex">
                    <span>{currentlyLoggedInUser.Description}</span>
                  </div>
                  <div className="ChangeDescriptionButton">
                    <button
                      onClick={() => {
                        setIfUserIsChangingDescription(true);
                      }}
                    >
                      Change
                    </button>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
};
