import * as React from "react";
import { Container, Navbar } from "react-bootstrap";
import Home from "./img/home.svg";
import Explore from "./img/explore.png";
import UserProfileIcon from "./img/userprofile.png";
import { Link, useLocation } from "react-router-dom";
import { currentlyLoggedInUserContext } from ".";
import { LazyLoadedImage } from "./LazyLoadedImage";
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
                <LazyLoadedImage
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
                <LazyLoadedImage
                  src={Explore}
                  alt="Explore"
                  style={{
                    paddingBottom: "0.25rem",
                    borderBottom:
                      splited[1] === "explore" ? "3px solid purple" : "",
                  }}
                />
              </Link>
            </button>
            <button>
              <Link to={`/users/${currentlyLoggedInUser.Login}`}>
                <LazyLoadedImage
                  src={UserProfileIcon}
                  alt="Your Profile"
                  style={{
                    paddingBottom: "0.25rem",
                    borderBottom:
                      splited[1] === "users" ? "3px solid purple" : "",
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
