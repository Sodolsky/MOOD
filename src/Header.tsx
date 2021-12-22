import * as React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Styles/Header.scss";
import moon from "./img/half-moon.svg";
import { auth } from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { setCurrentlyLoggedInUserContext } from ".";
export const Header: React.FC = () => {
  const setCurrentlyLoggedInUser = React.useContext(
    setCurrentlyLoggedInUserContext
  );
  return (
    <header>
      <Container fluid className="HeaderContainer">
        <Row className="Logo">
          <Col>
            <div className="AlignLogo">
              MOOD <img src={moon} alt="Logo  of a moon" />
              {auth.currentUser && (
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
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
};
