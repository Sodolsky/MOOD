import * as React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import "./Styles/LogIn.scss";
import { useContext } from "react";
import { userLogInContext } from ".";
import { SignUp } from "./SignUp";
import { UserAlert } from "./Alert";
import { UserData } from ".";
import { db } from "./firebase";
import { doc, getDoc } from "@firebase/firestore";
import { onSnapshot } from "firebase/firestore";
export interface LogInProps {
  currentlyLoggedInUser: UserData;
  setCurrentlyLoggedInUser: React.Dispatch<React.SetStateAction<UserData>>;
}
export const LogIn: React.FC<LogInProps> = (props) => {
  const { setCurrentlyLoggedInUser } = props;
  const userLogObject = useContext(userLogInContext);
  const { setIfUserIsLoggedIn } = userLogObject;
  const [show, setShow] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<string>("");
  const [isUserSigningUp, setIfUserIsSigningUp] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    Login: "",
    Password: "",
  });
  const userExistInDataBase = async (
    key: string | undefined,
    userPassword: string | undefined
  ) => {
    const ref = doc(db, "Users", `${key}`);
    // Everytime we update a userData we set it as a currentUser For sake of React Updating UI and not doing milion read operations.
    onSnapshot(ref, (item) => {
      if (item.exists()) {
        const obj = item.data();
        setCurrentlyLoggedInUser({
          Login: obj.Login,
          Password: obj.Password,
          Email: obj.Email,
          UserPosts: obj.UserPosts,
          Avatar: obj.Avatar,
          Description: obj.Description,
        });
      }
    });
    // I think this code is redundant but im not sure gonna leave it for now.
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      const obj = docSnap.data();
      if (userPassword !== obj.Password) {
        return showUserAnError("danger", "Invalid Password", true);
      }
      // Every Property on User Object starts with Capital Letter
      setCurrentlyLoggedInUser({
        Login: obj.Login,
        Password: obj.Password,
        Email: obj.Email,
        UserPosts: obj.UserPosts,
        Avatar: obj.Avatar,
        Description: obj.Description,
      });
      setIfUserIsLoggedIn(true);
      return;
    } else {
      return showUserAnError("danger", "Invalid Login", true);
    }
  };
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
    if (userData.Password === "" || userData.Login === "") {
      return showUserAnError(
        "danger",
        "Provide us with Password or Login",
        true
      );
    }
    userExistInDataBase(userData.Login, userData.Password);
  };
  if (!isUserSigningUp) {
    return (
      <>
        <UserAlert
          props={{ show, setShow }}
          message={message}
          variant={alertVariant}
        />
        <main>
          <Container className="LogInForm">
            <Row>
              <Col className="LogInText">LOG IN</Col>
            </Row>
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
                    value={userData?.Login}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <input
                    type="password"
                    name="Password"
                    id="Password"
                    placeholder="Password"
                    onChange={handleChange}
                    autoComplete="on"
                    value={userData?.Password}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <input
                    type="submit"
                    id="Submit"
                    value="LOG IN"
                    onClick={handleSubmit}
                  />
                </Col>
              </Row>
            </form>
            <Row>
              <Col>
                <p>
                  Not a Member?
                  <button onClick={() => setIfUserIsSigningUp(true)}>
                    Sign Up Now
                  </button>
                </p>
              </Col>
            </Row>
          </Container>
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
        showError={showUserAnError}
      />
    </>
  );
};
