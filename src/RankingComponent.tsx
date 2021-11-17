import React from "react";
import { Link } from "react-router-dom";
import "./Styles/RankingComponent.scss";
interface RankingComponentPropsInterface {
  login: string;
  photo: string;
  postCount?: number;
}
const RankingComponent: React.FC<RankingComponentPropsInterface> = (props) => {
  const { login, photo, postCount } = props;
  return (
    <div className="RankingContainer">
      <img src={photo} alt="User Avatar" />
      <span className="LoginContainer">
        <Link to={`/explore/users/${login}`}>{login}</Link>
      </span>
      {postCount !== null && <span className="postCount">{postCount}</span>}
    </div>
  );
};
export default RankingComponent;
