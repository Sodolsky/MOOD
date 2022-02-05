import * as React from "react";
import { setCurrentlyLoggedInUserContext, UserData } from "./App";
import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { auth, db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from "@firebase/firestore";
import { collection } from "firebase/firestore";
import { PostPropsInteface } from "./Post";
import { userPrefferedPostType } from "./UserProfile";
import { createUserWithEmailAndPassword, UserCredential } from "@firebase/auth";
import { FirebaseError } from "@firebase/util";
import { NotificationInterface } from "./Header";
import nProgress from "nprogress";
interface SignUpProps {
  setIfUserIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>;
  setIfUserIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  showError: (variant: string, message: string, isshown: boolean) => void;
}
const addNewAccountIntoDataBase = async (
  Login: string | undefined,
  Password: string | undefined,
  Email: string | undefined,
  UserPosts: PostPropsInteface[],
  Avatar: File | string,
  Description: string | undefined,
  BackgroundColor: string,
  BackgroundImage: string,
  userPrefferedPost: userPrefferedPostType,
  UID: string,
  postCount: number,
  commentsRef: string[],
  commentCount: number,
  Notifications: NotificationInterface[]
) => {
  try {
    nProgress.start();
    await setDoc(doc(db, "Users", `${Login}`), {
      Login: Login,
      Password: Password,
      Email: Email,
      UserPosts: UserPosts,
      Avatar: Avatar,
      Description: Description,
      BackgroundColor: BackgroundColor,
      BackgroundImage: BackgroundImage,
      userPrefferedPost: userPrefferedPost,
      UID: UID,
      postCount: postCount,
      commentsRef: commentsRef,
      commentCount: commentCount,
      Notifications: Notifications,
    });
    nProgress.done();
  } catch (error) {
    console.log(error);
  }
};
export const validateEmail = (email: string | undefined) => {
  const reg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(String(email).toLowerCase());
};
export const SignUp: React.FC<SignUpProps> = (props) => {
  const { setIfUserIsLoggedIn } = props;
  const setCurrentlyLoggedInUser = React.useContext(
    setCurrentlyLoggedInUserContext
  );
  const validateUserInDataBase = async (
    key: string | undefined,
    userEmail: string | undefined
  ) => {
    const referenceInDataBase = doc(db, "Users", `${key}`);
    nProgress.start();
    const documentSnapshot = await getDoc(referenceInDataBase);
    const emailRef = collection(db, "Users");
    const queryforEmail = query(emailRef, where("Email", "!=", ""));
    nProgress.inc();
    const querySnapshot = await getDocs(queryforEmail);
    const emailsArray: string[] = [];
    querySnapshot.forEach((item) => emailsArray.push(item.data().Email));
    for (const i of emailsArray) {
      if (i === userEmail) {
        nProgress.done();
        return props.showError("danger", "Your Email Was Already Taken", true);
      }
    }
    if (documentSnapshot.exists()) {
      props.showError("danger", "Your Login Was Already Taken", true);
      nProgress.done();
      return false;
    } else {
      nProgress.done();
      return true;
    }
  };
  const [registerData, setRegisterData] = useState<UserData>({
    Login: "",
    Password: "",
    Email: "",
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value;
    const name = event.target.name;
    setRegisterData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };
  const handleSubmit = (event: React.MouseEvent): void => {
    event.preventDefault();
    if (
      registerData.Password === "" ||
      registerData.Login === "" ||
      registerData.Email === ""
    ) {
      return props.showError("danger", "Please Fill Out Everything", true);
    }
    if (!validateEmail(registerData.Email)) {
      return props.showError(
        "danger",
        "Provide us with a valid Email Address",
        true
      );
    }
    if (registerData.Password!.length < 6) {
      return props.showError(
        "danger",
        "Your Password Should contain at least 6 characters",
        true
      );
    }
    if (registerData.Login !== undefined) {
      if (registerData.Login.length > 16) {
        return props.showError(
          "danger",
          "Your Login cannnot be longer than 16 characters",
          true
        );
      }
    }
    validateUserInDataBase(registerData.Login, registerData.Email).then(
      (message) => {
        if (!message) {
          return;
        } else {
          props.showError(
            "success",
            "Sucess! Your account has been created!",
            true
          );
          createUserWithEmailAndPassword(
            auth,
            registerData.Email as string,
            registerData.Password as string
          )
            .then((userCredentials: UserCredential) => {
              const user = userCredentials.user;
              //!Change the function too
              addNewAccountIntoDataBase(
                registerData.Login,
                registerData.Password,
                registerData.Email,
                [],
                `https://avatars.dicebear.com/api/bottts/${registerData.Login}.svg`,
                `Hello my name is ${registerData.Login} i'm using MOOD App 😎`,
                "2f2f2f",
                "",
                "Latest Post",
                user.uid,
                0,
                [],
                0,
                []
              );
              setIfUserIsLoggedIn(true);
              setCurrentlyLoggedInUser!({
                Login: registerData.Login,
                Password: registerData.Password,
                Email: registerData.Email,
                UserPosts: [],
                Avatar: `https://avatars.dicebear.com/api/bottts/${registerData.Login}.svg`,
                Description: `Hello my name is ${registerData.Login} i'm using MOOD App 😎`,
                BackgroundColor: "2f2f2f",
                BackgroundImage: "",
                userPrefferedPost: "Latest Post",
                UID: user.uid,
                postCount: 0,
                Notifications: [],
              });
            })
            .catch((error: FirebaseError) => {
              props.showError(
                "danger",
                `(${error.code}),${error.message}`,
                true
              );
            });
        }
      }
    );
  };
  return (
    <main>
      <Row>
        <Col className="LogInText">SIGN UP</Col>
      </Row>
      <Container className="LogInForm">
        <form>
          <Row>
            <Col>
              <input
                type="text"
                name="Login"
                id="Login"
                placeholder="Username"
                autoComplete="on"
                onChange={handleChange}
                value={registerData?.Login}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <input
                type="email"
                name="Email"
                id="Email"
                placeholder="Email"
                autoComplete="on"
                onChange={handleChange}
                value={registerData?.Email}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <input
                type="Password"
                name="Password"
                id="Password"
                placeholder="Password"
                autoComplete="on"
                onChange={handleChange}
                value={registerData?.Password}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <input
                type="submit"
                id="SubmitSignUp"
                value="SIGN UP"
                onClick={handleSubmit}
              />
            </Col>
          </Row>
        </form>
        <Row>
          <Col>
            <p>
              Hava a account?
              <button onClick={() => props.setIfUserIsSigningUp(false)}>
                Log In Now
              </button>
            </p>
          </Col>
        </Row>
      </Container>
    </main>
  );
};
