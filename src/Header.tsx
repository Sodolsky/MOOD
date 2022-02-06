import * as React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Styles/Header.scss";
import moon from "./img/half-moon.svg";
import { auth, db } from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckSquare,
  faComment,
  faDoorOpen,
  faHeart,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  currentlyLoggedInUserContext,
  NotificationDataFromFirebase,
  setCurrentlyLoggedInUserContext,
} from "./App";
import Tippy from "@tippyjs/react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import {
  arrayRemove,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useMediaQuery } from "@react-hook/media-query";
type notificationTypes = "comment" | "like";
export interface NotificationInterface {
  type: notificationTypes;
  postId: string;
  whoDid: string;
}
export const Header: React.FC = () => {
  const match = useMediaQuery("only screen and (min-width:450px");
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const [notifications, setNotifications] = React.useState<
    NotificationInterface[]
  >([]);
  React.useEffect(() => {
    const subscribeToNotifications = (UID: string) => {
      const notificationRef = collection(db, "Notifications");
      const qNotifications = query(
        notificationRef,
        where("UID", "==", `${UID}`)
      );
      onSnapshot(qNotifications, (doc) => {
        doc.docs.forEach((item) => {
          const obj = item.data() as NotificationDataFromFirebase;
          setNotifications(obj.Notifications);
        });
      });
    };
    if (currentlyLoggedInUser.UID) {
      subscribeToNotifications(currentlyLoggedInUser.UID);
    }
  }, [currentlyLoggedInUser]);
  const clearNotifications = async () => {
    const ref = doc(db, "Notifications", `${currentlyLoggedInUser.Login}`);
    setNotifications([]);
    await updateDoc(ref, {
      Notifications: [],
    });
    //RemovingFromFirebase
  };
  const handleSingleNotificationRemoval = async (
    notification: NotificationInterface
  ) => {
    setNotifications(notifications.filter((x) => x !== notification));
    const ref = doc(db, "Notifications", `${currentlyLoggedInUser.Login}`);
    await updateDoc(ref, {
      Notifications: arrayRemove(notification),
    });
  };
  const setCurrentlyLoggedInUser = React.useContext(
    setCurrentlyLoggedInUserContext
  );
  return (
    <header>
      <Container fluid className="HeaderContainer">
        <Row className="Logo">
          <Col>
            <div className="AlignLogo">
              MOOD <sub style={{ fontSize: "1rem" }}>is not dead</sub>{" "}
              <img src={moon} alt="Logo  of a moon" />
              {auth.currentUser && (
                <>
                  <div className="FAContainer">
                    <FontAwesomeIcon
                      icon={faDoorOpen}
                      onClick={() => {
                        if (setCurrentlyLoggedInUser) {
                          setCurrentlyLoggedInUser({
                            Login: "",
                            Email: "",
                          });
                        }
                        try {
                          auth.signOut();
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    />
                  </div>
                  <Tippy
                    interactive={true}
                    delay={200}
                    placement={"right"}
                    maxWidth={`${match ? "400px" : "200px"}`}
                    content={
                      <div className="tippyNotifications">
                        <div className="ButtonContainer">
                          {notifications.length > 0 ? (
                            <Button onClick={clearNotifications}>
                              Clear All
                            </Button>
                          ) : (
                            <div className="FlexContainer">
                              <FontAwesomeIcon icon={faCheckSquare} />
                              <span>You are up to date with Notifications</span>
                            </div>
                          )}
                        </div>
                        {notifications.map((x, i) => {
                          if (x.type === "comment") {
                            return (
                              <div
                                className="NotificationContainer"
                                key={`${x.postId}${i}${x.whoDid}${x.type}`}
                              >
                                <Link to={`/explore/posts/${x.postId}`}>
                                  <FontAwesomeIcon icon={faComment} />
                                  <span>
                                    <b>{x.whoDid}</b> Commented On Your Post
                                  </span>
                                </Link>
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="trash"
                                  onClick={() =>
                                    handleSingleNotificationRemoval(x)
                                  }
                                />
                              </div>
                            );
                          } else {
                            return (
                              <div
                                className="NotificationContainer"
                                key={`${x.type}${x.whoDid}${i}${x.postId}`}
                              >
                                <Link to={`/explore/posts/${x.postId}`}>
                                  <FontAwesomeIcon icon={faHeart} />
                                  <span>
                                    <b>{x.whoDid}</b> Liked Your Post
                                  </span>
                                </Link>
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="trash"
                                  onClick={() =>
                                    handleSingleNotificationRemoval(x)
                                  }
                                />
                              </div>
                            );
                          }
                        })}
                      </div>
                    }
                    allowHTML={true}
                    animation={"scale"}
                    appendTo={"parent"}
                  >
                    <div className="FAContainerBell">
                      <FontAwesomeIcon
                        icon={faBell}
                        className={`${
                          notifications.length > 0 ? "BellAnimation" : ""
                        }`}
                      />
                    </div>
                  </Tippy>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
};
