import * as React from "react";
import { UserData, saveDataBaseInLocalStorage } from ".";
import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
interface SignUpProps {
  Values: {
    DataBase: UserData[];
  };
  setIfUserIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>;
  showError: (variant: string, message: string, isshown: boolean) => void;
}
export const validateEmail = (email: string | undefined) => {
  const reg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(String(email).toLowerCase());
};
export const SignUp: React.FC<SignUpProps> = (props) => {
  const { DataBase } = props.Values;
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
    if (registerData.Password!.length < 4) {
      return props.showError(
        "danger",
        "Your Password Should contain at least 4 characters",
        true
      );
    }
    for (const item of DataBase) {
      if (registerData.Login === item.Login) {
        return props.showError("danger", "Your Login was already taken", true);
      }
      if (registerData.Email === item.Email) {
        return props.showError("danger", "Your Email was already taken", true);
      }
    }
    props.showError("success", "Sucess! Your account has been created!", true);
    DataBase.push(registerData);
    saveDataBaseInLocalStorage();
    props.setIfUserIsSigningUp(false);
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
