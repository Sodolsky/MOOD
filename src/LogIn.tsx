import * as React from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { useState } from "react";
import "./Styles/LogIn.scss";
import { useContext } from "react";
import { userLogInContext } from ".";
import { SignUp } from "./SignUp";
import { UserAlert } from "./Alert";
export interface UserData {
  Login: string | undefined;
  Password: string | undefined;
  Email?: string | undefined;
}
let DataBase: UserData[] = JSON.parse(localStorage.getItem("database") || "{}");
if (Object.keys(DataBase).length === 0) {
  DataBase = [{ Login: "admin", Password: "admin", Email: "admin@admin.com" }];
}
export const saveDataBaseInLocalStorage = (): void => {
  localStorage.setItem("database", JSON.stringify(DataBase));
};
export const LogIn: React.FC = () => {
  console.table(DataBase);
  const userLogObject = useContext(userLogInContext);
  const { isUserLoggedIn, setIfUserIsLoggedIn } = userLogObject;
  const [show, setShow] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<string>("");
  const [isUserSigningUp, setIfUserIsSigningUp] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    Login: "",
    Password: "",
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
    if (userData.Password === "" || userData.Login === "") {
      return showUserAnError(
        "danger",
        "Provide us with Password or Login",
        true
      );
    }
    let isUserAccountInDataBase: boolean = false;
    for (const item of DataBase) {
      const { Login, Password }: UserData = item;
      if (userData.Login === Login && userData.Password === Password) {
        isUserAccountInDataBase = true;
        setIfUserIsLoggedIn(true);
      }
    }
    !isUserAccountInDataBase &&
      showUserAnError("danger", "Invalid Login or Password", true);
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
        Values={{ DataBase }}
        setIfUserIsSigningUp={setIfUserIsSigningUp}
        showError={showUserAnError}
      />
    </>
  );
};
