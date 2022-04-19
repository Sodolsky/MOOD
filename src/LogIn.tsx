import * as React from "react";
import { useState } from "react";
import "./Styles/LogIn.scss";
import { useContext } from "react";
import { userLogInContext } from "./App";
import { SignUp } from "./SignUp";
import { UserAlert } from "./Alert";
import { UserData } from "./App";
import { auth } from "./firebase";
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  UserCredential,
} from "@firebase/auth";
import { FirebaseError } from "firebase/app";
import Logo from './img/icon-512.png';
export interface LogInProps {
  currentlyLoggedInUser: UserData;
  setCurrentlyLoggedInUser: React.Dispatch<React.SetStateAction<UserData>>;
}
export interface LoginData {
  Email: "";
  Password: "";
  Login: "";
}
export const LogIn: React.FC<LogInProps> = () => {
  const userLogObject = useContext(userLogInContext);
  const { setIfUserIsLoggedIn } = userLogObject;
  const [show, setShow] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<string>("");
  const [isUserSigningUp, setIfUserIsSigningUp] = useState<boolean>(false);
  const [userData, setUserData] = useState<LoginData>({
    Email: "",
    Password: "",
    Login: "",
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value;
    const name = event.target.name;
    setUserData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };
  const showUserAnError = (
    variant: string,
    message: string,
    isshown: boolean
  ): void => {
    setAlertVariant(variant);
    setMessage(message);
    setShow(isshown);
  };
  const handleSubmit = (event: React.MouseEvent): void => {
    event.preventDefault();
    if (userData.Password === "" || userData.Email === "") {
      return showUserAnError(
        "danger",
        "Provide us with Password or Email",
        true
      );
    }
    // userExistInDataBase(userData.Login, userData.Password);
    signInWithEmailAndPassword(
      auth,
      userData.Email as string,
      userData.Password as string
    )
      .then((UserCredential: UserCredential) => {
        setPersistence(auth, browserLocalPersistence);
      })
      .catch((error: FirebaseError) => {
        switch (error.code) {
          case "auth/wrong-password":
            showUserAnError("danger", `Provide us with a valid Password`, true);
            break;
          case "auth/user-not-found":
            showUserAnError("danger", `Provide us with correct Email`, true);
            break;
          case "auth/invalid-email":
            showUserAnError("danger", `Provide us with valid Email`, true);
            break;
          default:
            showUserAnError("danger", `(${error.code})${error.message}`, true);
        }
      });
  };
  if (!isUserSigningUp) {
    return (
      <>
        <UserAlert
          props={{ show, setShow }}
          message={message}
          variant={alertVariant}
        />

        <div className='background_box_cover'>
          <img src="https://picsum.photos/1920/1080" alt='apiPicture' />
          <img src={Logo} alt="logo" className='logo' />
          <div className='loginBGcover'></div>
        </div>
        <main>
          <div className="LogInForm">
            <div className="LogInText">
              <h1>
                welcome on Mood
              </h1>
              <p>feel free to share your current mood with us</p>
            </div>
            <form>
              <input
                type="text"
                name="Email"
                id="Email"
                placeholder="email"
                autoComplete="on"
                onChange={handleChange}
                value={userData?.Email}
              />
              <input
                type="password"
                name="Password"
                id="Password"
                placeholder="password"
                onChange={handleChange}
                autoComplete="on"
                value={userData?.Password}
              />
              <div className='buttonFlexWrap'>
                <button onClick={() => setIfUserIsSigningUp(true)}>
                  sign up now
                </button>
                <input
                  type="submit"
                  id="Submit"
                  value="log in"
                  onClick={handleSubmit}
                />
              </div>
            </form>
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <UserAlert
        props={{ show, setShow }}
        message={message}
        variant={alertVariant}
      />
      <SignUp
        setIfUserIsSigningUp={setIfUserIsSigningUp}
        setIfUserIsLoggedIn={setIfUserIsLoggedIn}
        showError={showUserAnError}
      />
    </>
  );
};
