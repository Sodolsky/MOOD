import React, { useState } from "react";
import { useParams } from "react-router";
import { LoadingRing } from "./LoadingRing";
import "./Styles/UserProfile.scss";
const UserProfile: React.FC = () => {
  const profilePathLogin = useParams<{ user: string }>();
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);
  setTimeout(() => {
    setIsContentLoaded(true);
  }, 3000);
  return isContentLoaded ? (
    <h1>Test</h1>
  ) : (
    <div className="LoaderBox">
      <LoadingRing colorVariant={"white"} />
    </div>
  );
};
export default UserProfile;
