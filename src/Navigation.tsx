import * as React from "react";
import { Container, Navbar } from "react-bootstrap";
import Home from "./img/home.svg";
import Explore from "./img/explore.svg";
import Settings from "./img/settings.svg";
export const Navigation: React.FC = () => {
  return (
    <nav className="PersonalNav">
      <Navbar>
        <Container fluid className="justify-content-around">
          <button>
            <img src={Home} alt="Main Page" />
          </button>
          <button>
            <img src={Explore} alt="Explore" />
          </button>
          <button>
            <img src={Settings} alt="Meet Friends" />
          </button>
        </Container>
      </Navbar>
    </nav>
  );
};
