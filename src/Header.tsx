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
  setCurrentlyLoggedInUserContext,
} from ".";
import Tippy from "@tippyjs/react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
type notificationTypes = "comment" | "like";
export interface NotificationInterface {
  type: notificationTypes;
  postId: string;
  whoDid: string;
}
export const Header: React.FC = () => {
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const [notifications, setNotifications] = React.useState<
    NotificationInterface[]
  >([]);
  React.useEffect(() => {
    if (currentlyLoggedInUser.Email !== "Admin") {
      setNotifications(
        currentlyLoggedInUser.Notifications as NotificationInterface[]
      );
    }
  }, [currentlyLoggedInUser.Notifications, currentlyLoggedInUser.Email]);
  const clearNotifications = async () => {
    const ref = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
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
    const ref = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
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
                            Login: "Admin",
                            Password: "Admin",
                            Email: "Admin",
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
                    maxWidth={"100%"}
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
