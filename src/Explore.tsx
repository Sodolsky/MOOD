import { collection, getDocs, orderBy, query } from "@firebase/firestore";
import React, { useState } from "react";
import { UserData } from ".";
import { db } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import RankingComponent from "./RankingComponent";
import "./Styles/Explore.scss";
type topPosters = { postCount: number; userLogin: string; avatar: string };
const Explore: React.FC = () => {
  const [topPosters, setTopPosters] = useState<topPosters[] | null>(null);
  const [shouldLoadAll, setshouldLoadAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  React.useEffect(() => {
    const getDataFromDB = async () => {
      const q = query(collection(db, "Users"), orderBy("postCount", "desc"));
      const users = await getDocs(q);
      const arr: topPosters[] = [];
      users.forEach((item) => {
        const obj = item.data() as UserData;
        if (obj.UserPosts && obj.Login) {
          arr.push({
            postCount: obj.UserPosts?.length,
            userLogin: obj.Login,
            avatar: obj.Avatar as string,
          });
        } else if (!obj.UserPosts) {
          arr.push({
            postCount: 0,
            userLogin: obj.Login as string,
            avatar: obj.Avatar as string,
          });
        }
      });
      setTopPosters(arr);
      setIsLoading(false);
    };
    getDataFromDB();
  }, []);
  return isLoading ? (
    <div className="LoadingContainer">
      <LoadingRing colorVariant="white" />
    </div>
  ) : (
    <>
      <div className="StatsHeader">Stats</div>
      <div className="StatsContainer">
        {shouldLoadAll ? (
          <article>
            <h2>Most Posts</h2>
            {topPosters!.map((item) => {
              return (
                <RankingComponent
                  key={item.userLogin}
                  login={item.userLogin}
                  photo={item.avatar}
                  postCount={item.postCount}
                />
              );
            })}
            <div className="ButtonContainer">
              <button onClick={() => setshouldLoadAll(false)}>Hide...</button>
            </div>
          </article>
        ) : (
          <article>
            <h2>Most Posts</h2>
            {topPosters!.slice(0, 5).map((item) => {
              return (
                <RankingComponent
                  key={item.userLogin}
                  login={item.userLogin}
                  photo={item.avatar}
                  postCount={item.postCount}
                />
              );
            })}
            <div className="ButtonContainer">
              <button
                onClick={() => {
                  setshouldLoadAll(true);
                }}
              >
                Load More...
              </button>
            </div>
          </article>
        )}
      </div>
    </>
  );
};
export default Explore;
