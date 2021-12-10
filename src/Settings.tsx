import React from "react";
import { useContext, useCallback } from "react";
import { Container } from "react-bootstrap";
import {
  currentlyLoggedInUserContext,
  setCurrentlyLoggedInUserContext,
  UserData,
} from ".";
import "./Styles/Settings.scss";
import { useState } from "react";
import { auth, db, storageRef } from "./firebase";
import { ref } from "@firebase/storage";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

// import moment from "moment";

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
  // Here we Upload a file into a Cloud Storage and also change currentUser Avatar to fileRef.
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const fileRef = ref(storageRef, `${currentlyLoggedInUser.Login}`);
      const userRef = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
      if (acceptedFiles[0].size > 10000000) {
        return alert("Your File is bigger than 10MB Try to upload smaller one");
      }
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
    },
    [currentlyLoggedInUser, setCurrentlyLoggedInUser]
  );
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
        <div className="styleContainer"></div>
      </Container>
    </>
  );
};
