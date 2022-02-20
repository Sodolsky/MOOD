import { Empty } from "antd";
import { Link } from "react-router-dom";
import "./Styles/NotFound.scss";
export const NotFound = () => {
  return (
    <div className="EmptyContainer">
      <Empty
        description={"Nie znaleźliśmy podanej strony 😥"}
        style={{ fontSize: "2rem" }}
      />
      <Link to={"/home"}>
        <button>Przejdź na stronę główną</button>
      </Link>
    </div>
  );
};
