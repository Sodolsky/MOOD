import React from "react";
import { createContext } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";
import { Header } from "./Header";
import { LogIn } from "./LogIn";
import { MainContent } from "./MainContent";
import "./styles.scss";
export const userLogInContext = createContext<LogInInterface>({
  isUserLoggedIn: false,
  setIfUserIsLoggedIn: null,
});
export interface LogInInterface {
  isUserLoggedIn: boolean | undefined;
  setIfUserIsLoggedIn: any;
}
export const App: React.FC = () => {
  const [isUserLoggedIn, setIfUserIsLoggedIn] = useState<boolean | undefined>(
    false
  );
  return (
    <>
      <userLogInContext.Provider
        value={{ isUserLoggedIn, setIfUserIsLoggedIn }}
      >
        <Header />
        {isUserLoggedIn ? <MainContent /> : <LogIn />}
      </userLogInContext.Provider>
    </>
  );
};
ReactDOM.render(<App />, document.getElementById("root"));
