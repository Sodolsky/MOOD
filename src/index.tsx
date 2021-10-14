import React from "react";
import { createContext } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";
import { Header } from "./Header";
import { LogIn } from "./LogIn";
import { MainContent } from "./MainContent";
import "./styles.scss";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Tags } from "./Tags";
import { Settings } from "./Settings";
import { Navigation } from "./Navigation";
import UserProfile from "./UserProfile";
import Explore from "./Explore";
export const userLogInContext = createContext<LogInInterface>({
  isUserLoggedIn: false,
  setIfUserIsLoggedIn: null,
});
export const currentlyLoggedInUserContext = createContext<UserData>({
  Login: "",
  Password: "",
  UserPostsReference: [],
});
type setCurrentlyLoggedInUserType = React.Dispatch<
  React.SetStateAction<UserData>
> | null;
export const setCurrentlyLoggedInUserContext =
  createContext<setCurrentlyLoggedInUserType>(null);
export interface UserData {
  Login: string | undefined;
  Password: string | undefined;
  Email?: string | undefined;
  Avatar?: string | undefined;
  UserPostsReference?: string[] | undefined;
  Description?: string | undefined;
}
export interface LogInInterface {
  isUserLoggedIn: boolean | undefined;
  setIfUserIsLoggedIn: any;
}
// !Auto Login For Sake of Testing
export const App: React.FC = () => {
  const [isUserLoggedIn, setIfUserIsLoggedIn] = useState<boolean | undefined>(
    false
  );
  const [currentlyLoggedInUser, setCurrentlyLoggedInUser] = useState<UserData>({
    Login: "Admin",
    Password: "Admin",
  });
  return (
    <>
      <Router>
        <Switch>
          <setCurrentlyLoggedInUserContext.Provider
            value={setCurrentlyLoggedInUser}
          >
            <currentlyLoggedInUserContext.Provider
              value={currentlyLoggedInUser}
            >
              <userLogInContext.Provider
                value={{ isUserLoggedIn, setIfUserIsLoggedIn }}
              >
                <Header />
                {/*!Here We set up Routes when user is logged in */}
                {isUserLoggedIn ? (
                  <>
                    <Route path="/">
                      <Redirect to="/home" />
                    </Route>
                    <Route path="/settings">
                      <div className="MainContentGrid">
                        <Navigation />
                        <Settings />
                      </div>
                    </Route>
                    <Route path="/explore" exact>
                      <div className="MainContentGrid">
                        <Navigation />
                        <Explore />
                      </div>
                    </Route>
                    <Route path="/home" exact>
                      <MainContent
                        setCurrentlyLoggedInUser={setCurrentlyLoggedInUser}
                      />
                    </Route>
                    <Route path="/explore/tag" exact>
                      <h1>Kiedy tu bedzie lista tagow</h1>{" "}
                      {/*TODO Add something here */}
                    </Route>
                    <Route path="/explore/tag/:item">
                      <div className="MainContentGrid">
                        <Navigation />
                        <Tags />
                      </div>
                    </Route>
                    <Route path="/explore/users/:user">
                      <div className="MainContentGrid">
                        <Navigation />
                        <UserProfile />
                      </div>
                    </Route>
                  </>
                ) : (
                  //!Here We set up Routes when user ISN'T logged in
                  <>
                    <LogIn
                      currentlyLoggedInUser={currentlyLoggedInUser}
                      setCurrentlyLoggedInUser={setCurrentlyLoggedInUser}
                    />
                    <Route path="/tag" exact>
                      <Redirect to="/" />
                    </Route>
                    <Route path="/tag/:item">
                      <Redirect to="/" />
                    </Route>
                    <Route path="/explore/users/:user">
                      <Redirect to="/" />
                    </Route>
                    <Route path="/Settings">
                      <Redirect to="/" />
                    </Route>
                  </>
                )}
              </userLogInContext.Provider>
            </currentlyLoggedInUserContext.Provider>
          </setCurrentlyLoggedInUserContext.Provider>
        </Switch>
      </Router>
    </>
  );
};
ReactDOM.render(<App />, document.getElementById("root"));
