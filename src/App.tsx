import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { isEqual } from "lodash";
import { useState, useRef, createContext, useEffect } from "react";
import {
  Route,
  Redirect,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import Explore from "./Explore";
import { db, auth } from "./firebase";
import { Header, NotificationInterface } from "./Header";
import { LoadingRing } from "./LoadingRing";
import { LogIn } from "./LogIn";
import { MainContent } from "./MainContent";
import { Navigation } from "./Navigation";
import { NotFound } from "./NotFound";
import { SinglePost } from "./SinglePost";
import { Tags } from "./Tags";
import UserProfile, { userPrefferedPostType } from "./UserProfile";
import { UserProfilePosts } from "./UserProfilePosts";
// const getUserPermissionForNotifications = () => {
//   if (Notification.permission !== "denied") {
//     Notification.requestPermission((permission) => {
//       if (permission === "granted") {
//       }
//     });
//   }
// };
// export const spawnNotifications = (
//   theBody: any,
//   theIcon: any,
//   theTitle: any
// ) => {
//   var options = {
//     body: theBody,
//     icon: theIcon,
//   };
//   var n = new Notification(theTitle, options);
// };
export const userLogInContext = createContext<LogInInterface>({
  isUserLoggedIn: false,
  setIfUserIsLoggedIn: null,
});
export const currentlyLoggedInUserContext = createContext<UserData>({
  Login: "",
  Email: "",
  UserPosts: [],
});
export interface NotificationDataFromFirebase {
  Notifications: NotificationInterface[];
  UID: string;
}
export const allUsersArrayContext = createContext<string[]>([]);
type setCurrentlyLoggedInUserType = React.Dispatch<
  React.SetStateAction<UserData>
> | null;
export const setCurrentlyLoggedInUserContext =
  createContext<setCurrentlyLoggedInUserType>(null);
export interface UserData {
  Login: string | undefined;
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
export const App: React.FC = () => {
  const [isUserLoggedIn, setIfUserIsLoggedIn] = useState<boolean | undefined>(
    false
  );
  const [currentlyLoggedInUser, setCurrentlyLoggedInUser] = useState<UserData>({
    Login: "",
    Email: "",
  });
  const [isAuthBeingProccesed, setIsAuthBeingProccesed] =
    useState<boolean>(true);
  const usersLoginArray = useRef<string[]>([]);
  const getUsersLoginsUtility = async () => {
    const ref = doc(db, "Utility", "UserLogins");
    try {
      const myDoc = await getDoc(ref);
      const obj = myDoc.data() as string[];
      usersLoginArray.current = obj;
    } catch (error) {
      console.log(error, "e");
    }
  };
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
        getUsersLoginsUtility();
      }
      setIfUserIsLoggedIn(true);
    });
  };
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        getDataAboutUser(user.uid);
        setIsAuthBeingProccesed(false);
      } else {
        setIfUserIsLoggedIn(false);
        setIsAuthBeingProccesed(false);
      }
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <Router>
        <setCurrentlyLoggedInUserContext.Provider
          value={setCurrentlyLoggedInUser}
        >
          <currentlyLoggedInUserContext.Provider value={currentlyLoggedInUser}>
            <userLogInContext.Provider
              value={{ isUserLoggedIn, setIfUserIsLoggedIn }}
            >
              <allUsersArrayContext.Provider value={usersLoginArray.current}>
                <Header />
                {/*!Here We set up Routes when user is logged in */}
                {auth.currentUser ? (
                  currentlyLoggedInUser.Login !== "" ? (
                    <>
                      <Switch>
                        <Route path="/" exact>
                          <Redirect to="/home" />
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
                        <Route path="/explore/posts/:PostId">
                          <div className="MainContentGrid">
                            <Navigation />
                            <SinglePost />
                          </div>
                        </Route>
                        <Route path="/explore/tag" exact>
                          <Redirect to={"/explore"} />
                        </Route>
                        <Route path="/explore/tag/:item">
                          <div className="MainContentGrid">
                            <Navigation />
                            <Tags />
                          </div>
                        </Route>
                        <Route path="/users/:user" exact>
                          <div className="MainContentGrid">
                            <Navigation />
                            <UserProfile />
                          </div>
                        </Route>
                        <Route path="/users/:user/Posts">
                          <div className="MainContentGrid">
                            <Navigation />
                            <UserProfilePosts />
                          </div>
                        </Route>
                        <Route path="*" exact>
                          <div className="MainContentGrid">
                            <Navigation />
                            <NotFound />
                          </div>
                        </Route>
                      </Switch>
                    </>
                  ) : (
                    <div className="screenCenter">
                      <LoadingRing colorVariant="white" />
                    </div>
                  )
                ) : (
                  //!Here We set up Routes when user ISN'T logged in
                  <>
                    {isAuthBeingProccesed ||
                    (auth.currentUser && currentlyLoggedInUser.Login === "") ? (
                      <div className="screenCenter">
                        <LoadingRing colorVariant="white" />
                      </div>
                    ) : (
                      <LogIn
                        currentlyLoggedInUser={currentlyLoggedInUser}
                        setCurrentlyLoggedInUser={setCurrentlyLoggedInUser}
                      />
                    )}
                    {!isAuthBeingProccesed && !auth.currentUser && (
                      <>
                        <Switch>
                          <Route path="*" exact>
                            <Redirect to="/" />
                          </Route>
                          <Route path="/explore/posts/:PostId">
                            <Redirect to="/" />
                          </Route>
                          <Route path="/explore/tag" exact>
                            <Redirect to="/" />
                          </Route>
                          <Route path="/explore/tag/:item" exact>
                            <Redirect to="/" />
                          </Route>
                          <Route path="/users/:user">
                            <Redirect to="/" />
                          </Route>
                          <Route path="/users/:user/Posts">
                            <Redirect to="/" />
                          </Route>
                        </Switch>
                      </>
                    )}
                  </>
                )}
              </allUsersArrayContext.Provider>
            </userLogInContext.Provider>
          </currentlyLoggedInUserContext.Provider>
        </setCurrentlyLoggedInUserContext.Provider>
      </Router>
    </>
  );
};
