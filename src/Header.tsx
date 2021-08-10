import * as React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Styles/Header.scss";
import moon from "./img/half-moon.svg";
export const Header: React.FC = () => {
  return (
    <header>
      <Container fluid className="HeaderContainer">
        <Row className="Logo">
          <Col>
            <div className="AlignLogo">
              MOOD <img src={moon} alt="Logo  of a moon" />
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
};
