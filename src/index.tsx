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
import UserProfile, { userPrefferedPostType } from "./UserProfile";
import Explore from "./Explore";
import { UserProfilePosts } from "./UserProfilePosts";
import { auth, db } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import { onAuthStateChanged } from "@firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { isEqual } from "lodash";
export const userLogInContext = createContext<LogInInterface>({
  isUserLoggedIn: false,
  setIfUserIsLoggedIn: null,
});
export const currentlyLoggedInUserContext = createContext<UserData>({
  Login: "",
  Password: "",
  Email: "",
  UserPosts: [],
});
export const allUsersArrayContext = createContext<string[]>([]);
type setCurrentlyLoggedInUserType = React.Dispatch<
  React.SetStateAction<UserData>
> | null;
export const setCurrentlyLoggedInUserContext =
  createContext<setCurrentlyLoggedInUserType>(null);
export interface UserData {
  Login: string | undefined;
  Password: string | undefined;
  Email: string | undefined;
  Avatar?: string | undefined;
  BackgroundColor?: string | undefined;
  BackgroundImage?: string | undefined;
  UserPosts?: string[] | undefined;
  Description?: string | undefined;
  userPrefferedPost?: userPrefferedPostType | null;
  UID?: string;
  postCount?: number;
  commentsRef?: string[];
  commentCount?: number;
}
export interface LogInInterface {
  isUserLoggedIn: boolean | undefined;
  setIfUserIsLoggedIn: any;
}
// function getObjectDiff(obj1: any, obj2: any) {
//   const diff = Object.keys(obj1).reduce((result, key) => {
//     if (!obj2.hasOwnProperty(key)) {
//       result.push(key);
//     } else if (isEqual(obj1[key], obj2[key])) {
//       const resultKeyIndex = result.indexOf(key);
//       result.splice(resultKeyIndex, 1);
//     }
//     return result;
//   }, Object.keys(obj2));

//   return diff;
// }
export const App: React.FC = () => {
  const [firstUpdate, setFirstUpdate] = useState<boolean>(true);
  const [usersLoginArray, setUsersLoginArray] = useState<string[]>([]);
  React.useEffect(() => {
    const getDataFromDB = async () => {
      const ref = doc(db, "Utility", "UserLogins");
      const myDoc = await getDoc(ref);
      const obj = myDoc.data() as { UserLogins: string[] };
      setUsersLoginArray(obj.UserLogins);
    };
    getDataFromDB();
  }, []);
  const getDataAboutUser = async (UID: string) => {
    const uRef = collection(db, "Users");
    const q = query(uRef, where("UID", "==", `${UID}`));
    const userDoc = await getDocs(q);
    userDoc.forEach((item) => {
      const obj = item.data() as UserData;
      if (isEqual(obj, currentlyLoggedInUser)) {
        return;
      } else {
        setCurrentlyLoggedInUser({
          Login: obj.Login,
          Password: obj.Password,
          Email: obj.Email,
          UserPosts: obj.UserPosts,
          Avatar: obj.Avatar,
          Description: obj.Description,
          BackgroundColor: obj.BackgroundColor,
          BackgroundImage: obj.BackgroundImage,
          userPrefferedPost: obj.userPrefferedPost,
          UID: obj.UID,
          postCount: obj.postCount,
          commentsRef: obj.commentsRef,
          commentCount: obj.commentCount,
        });
      }
    });
  };
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (firstUpdate) {
        setFirstUpdate(false);
        return;
      }
      getDataAboutUser(user.uid);
      setIfUserIsLoggedIn(true);
    } else {
      if (firstUpdate) {
        setFirstUpdate(false);
        return;
      }
      setIfUserIsLoggedIn(false);
    }
  });
  const [isUserLoggedIn, setIfUserIsLoggedIn] = useState<boolean | undefined>(
    false
  );
  const [currentlyLoggedInUser, setCurrentlyLoggedInUser] = useState<UserData>({
    Login: "Admin",
    Password: "Admin",
    Email: "Admin",
  });
  console.log("inf");
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
                <allUsersArrayContext.Provider value={usersLoginArray}>
                  <Header />
                  {/*!Here We set up Routes when user is logged in */}
                  {auth.currentUser ? (
                    <>
                      <Route path="/" exact>
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
                      <Route path="/explore/users/:user" exact>
                        <div className="MainContentGrid">
                          <Navigation />
                          <UserProfile />
                        </div>
                      </Route>
                      <Route path="/explore/users/:user/Posts">
                        <div className="MainContentGrid">
                          <Navigation />
                          <UserProfilePosts />
                        </div>
                      </Route>
                    </>
                  ) : (
                    //!Here We set up Routes when user ISN'T logged in
                    <>
                      {firstUpdate ? (
                        <div className="screenCenter">
                          <LoadingRing colorVariant="white" />
                        </div>
                      ) : (
                        <LogIn
                          currentlyLoggedInUser={currentlyLoggedInUser}
                          setCurrentlyLoggedInUser={setCurrentlyLoggedInUser}
                        />
                      )}
                      {!firstUpdate && (
                        <>
                          <Route path="/tag" exact>
                            <Redirect to="/" />
                          </Route>
                          <Route path="/tag/:item" exact>
                            <Redirect to="/" />
                          </Route>
                          <Route path="/explore/users/:user">
                            <Redirect to="/" />
                          </Route>
                          <Route path="/explore/users/:user/Posts">
                            <Redirect to="/" />
                          </Route>
                          <Route path="/Settings">
                            <Redirect to="/" />
                          </Route>
                        </>
                      )}
                    </>
                  )}
                </allUsersArrayContext.Provider>
              </userLogInContext.Provider>
            </currentlyLoggedInUserContext.Provider>
          </setCurrentlyLoggedInUserContext.Provider>
        </Switch>
      </Router>
    </>
  );
};
ReactDOM.render(<App />, document.getElementById("root"));
