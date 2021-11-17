import * as React from "react";
import { Container, Navbar } from "react-bootstrap";
import Home from "./img/home.svg";
import Explore from "./img/explore.svg";
import Settings from "./img/settings.svg";
import UserProfileIcon from "./img/userprofile.png";
import { Link, useLocation } from "react-router-dom";
import { currentlyLoggedInUserContext } from ".";
export const Navigation: React.FC = () => {
  const location = useLocation();
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const splited = location.pathname.split("/");
  return (
    <>
      <nav className="PersonalNav">
        <Navbar>
          <Container fluid className="justify-content-around">
            <button>
              <Link to="/home">
                <img
                  src={Home}
                  alt="Main Page"
                  style={{
                    paddingBottom: "0.1rem",
                    borderBottom:
                      splited[1] === "home" ? "3px solid purple" : 0,
                  }}
                />
              </Link>
            </button>
            <button>
              <Link to="/explore">
                <img
                  src={Explore}
                  alt="Explore"
                  style={{
                    paddingBottom: "0.25rem",
                    borderBottom:
                      splited[1] === "explore" &&
                      splited[3] !== currentlyLoggedInUser.Login
                        ? "3px solid purple"
                        : 0,
                  }}
                />
              </Link>
            </button>
            <button>
              <Link to={`/explore/users/${currentlyLoggedInUser.Login}`}>
                <img
                  src={UserProfileIcon}
                  alt="Your Profile"
                  style={{
                    paddingBottom: "0.25rem",
                    borderBottom:
                      splited[1] === "explore" &&
                      splited[3] === currentlyLoggedInUser.Login
                        ? "3px solid purple"
                        : 0,
                  }}
                />
              </Link>
            </button>
            <button>
              <Link to="/settings">
                <img
                  src={Settings}
                  alt="Settings"
                  style={{
                    paddingBottom: "0.25rem",
                    borderBottom:
                      splited[1] === "settings" ? "3px solid purple" : 0,
                  }}
                />
              </Link>
            </button>
          </Container>
        </Navbar>
      </nav>
    </>
  );
};
