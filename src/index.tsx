import React from "react";
import { createContext } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";
import { Header } from "./Header";
import { LogIn } from "./LogIn";
import { MainContent } from "./MainContent";
import { PostPropsInteface } from "./Post";
import "./styles.scss";
export const userLogInContext = createContext<LogInInterface>({
  isUserLoggedIn: false,
  setIfUserIsLoggedIn: null,
});
export const currentlyLoggedInUserContext = createContext<UserData>({
  Login: "",
  Password: "",
  LikedPostArray: [],
});
export interface UserData {
  Login: string | undefined;
  Password: string | undefined;
  Email?: string | undefined;
  Avatar?: string | undefined;
  LikedPostArray?: PostPropsInteface[];
}
let DataBase: UserData[] = JSON.parse(localStorage.getItem("database") || "{}");
if (Object.keys(DataBase).length === 0) {
  DataBase = [
    {
      Login: "admin",
      Password: "admin",
      Email: "admin@admin.com",
      Avatar: undefined,
      LikedPostArray: [],
    },
  ];
}
export const DataBaseContext = createContext(DataBase);
export const saveDataBaseInLocalStorage = (): void => {
  localStorage.setItem("database", JSON.stringify(DataBase));
};
export interface LogInInterface {
  isUserLoggedIn: boolean | undefined;
  setIfUserIsLoggedIn: any;
}
// !Auto Login For Sake of Testing
export const App: React.FC = () => {
  const [isUserLoggedIn, setIfUserIsLoggedIn] = useState<boolean | undefined>(
    true
  );
  const [currentlyLoggedInUser, setCurrentlyLoggedInUser] = useState<UserData>(
    DataBase[0]
  );
  return (
    <>
      <DataBaseContext.Provider value={DataBase}>
        <currentlyLoggedInUserContext.Provider value={currentlyLoggedInUser}>
          <userLogInContext.Provider
            value={{ isUserLoggedIn, setIfUserIsLoggedIn }}
          >
            <Header />
            {isUserLoggedIn ? (
              <MainContent />
            ) : (
              <LogIn
                currentlyLoggedInUser={currentlyLoggedInUser}
                setCurrentlyLoggedInUser={setCurrentlyLoggedInUser}
              />
            )}
          </userLogInContext.Provider>
        </currentlyLoggedInUserContext.Provider>
      </DataBaseContext.Provider>
    </>
  );
};
ReactDOM.render(<App />, document.getElementById("root"));
