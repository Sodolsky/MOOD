import {
  collection,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "@firebase/firestore";
import { useMediaQuery } from "@react-hook/media-query";
import React, { useState } from "react";
import { UserData } from ".";
import { db } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import RankingComponent from "./RankingComponent";
import StatsImg from "./img/stats.png";
import HashtagIMG from "./img/hashtag.png";
import "./Styles/Explore.scss";
import { LazyLoadedImage } from "./LLImage";
import { Link } from "react-router-dom";
import { BackArrow } from "./BackArrow";
type topPosters = { postCount: number; userLogin: string; avatar: string };
type topTags = {
  count: number;
  name: string;
};
const Explore: React.FC = () => {
  const showLess = (Type: "Comment" | "Post") => {
    switch (Type) {
      case "Comment":
        setTopCommenters(topCommenters?.slice(0, 5) as topPosters[]);
        break;
      case "Post":
        setTopPosters(topPosters?.slice(0, 5) as topPosters[]);
        break;
    }
  };
  const loadMore = (Type: "Comment" | "Post") => {
    const loadFromDB = async () => {
      switch (Type) {
        case "Comment":
          if (topCommenters!.length === allRankingStats.comments?.length) {
            const commentQuery = query(
              collection(db, "Users"),
              orderBy("commentCount", "desc"),
              startAfter(lastDoc.comment),
              limit(10)
            );
            const newCommentsArray: topPosters[] = [];
            const newComments = await getDocs(commentQuery);
            let iteratorComments = 0;
            newComments.forEach((item) => {
              iteratorComments++;
              const obj = item.data() as UserData;
              newCommentsArray.push({
                postCount: obj.commentCount ?? 0,
                userLogin: obj.Login as string,
                avatar: obj.Avatar as string,
              });
              if (iteratorComments === newComments.size) {
                if (newComments.size !== 10) {
                  setLastDoc((prev) => {
                    return { ...prev, comment: undefined };
                  });
                } else {
                  setLastDoc((prev) => {
                    return { ...prev, comment: item };
                  });
                }
              }
            });
            if (topCommenters) {
              newCommentsArray.sort((a, b) => {
                return b.postCount - a.postCount;
              });
              const newArray = [...topCommenters, ...newCommentsArray];
              setTopCommenters(newArray);
              setAllRankingStats((prev) => {
                return { ...prev, comments: newArray };
              });
            }
          } else {
            setTopCommenters(allRankingStats.comments as topPosters[]);
          }
          break;
        case "Post":
          if (topPosters?.length === allRankingStats.posts?.length) {
            const PostQuery = query(
              collection(db, "Users"),
              orderBy("postCount", "desc"),
              startAfter(lastDoc.post),
              limit(10)
            );
            const newPostsArray: topPosters[] = [];
            const newPosts = await getDocs(PostQuery);
            let iteratorPosts = 0;
            newPosts.forEach((item) => {
              iteratorPosts++;
              const obj = item.data() as UserData;
              newPostsArray.push({
                postCount: obj.postCount ?? 0,
                userLogin: obj.Login as string,
                avatar: obj.Avatar as string,
              });
              if (iteratorPosts === newPosts.size) {
                if (newPosts.size !== 10) {
                  setLastDoc((prev) => {
                    return { ...prev, post: undefined };
                  });
                } else {
                  setLastDoc((prev) => {
                    return { ...prev, post: item };
                  });
                }
              }
            });
            if (topPosters) {
              newPostsArray.sort((a, b) => {
                return b.postCount - a.postCount;
              });
              const newArray = [...topPosters, ...newPostsArray];
              setTopPosters(newArray);
              setAllRankingStats((prev) => {
                return { ...prev, posts: newArray };
              });
            }
          } else {
            setTopPosters(allRankingStats.posts as topPosters[]);
          }
      }
    };
    loadFromDB();
  };
  const isMobile = useMediaQuery("only screen and (max-width:768px");
  const [topPosters, setTopPosters] = useState<topPosters[] | null>(null);
  const [lastDoc, setLastDoc] = useState<{
    comment: DocumentData | undefined;
    post: DocumentData | undefined;
  }>({ comment: undefined, post: undefined });
  const [topCommenters, setTopCommenters] = useState<topPosters[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allRankingStats, setAllRankingStats] = useState<{
    comments: topPosters[] | undefined;
    posts: topPosters[] | undefined;
  }>({ comments: undefined, posts: undefined });
  const [currentExploreOption, setCurrentExploreOption] = useState<
    "tags" | "stats" | "default"
  >("default");
  const [topTags, setTopTags] = useState<topTags[] | null>(null);
  React.useEffect(() => {
    if (currentExploreOption === "stats") {
      if (!topPosters && !topCommenters) {
        const getDataFromDB = async () => {
          const PostQuery = query(
            collection(db, "Users"),
            orderBy("postCount", "desc"),
            limit(5)
          );
          const commentQuery = query(
            collection(db, "Users"),
            orderBy("commentCount", "desc"),
            limit(5)
          );
          const users = await getDocs(PostQuery);
          const arr: topPosters[] = [];
          users.forEach((item) => {
            const obj = item.data() as UserData;
            if (obj.UserPosts && obj.Login) {
              arr.push({
                postCount: obj.postCount ?? 0,
                userLogin: obj.Login,
                avatar: obj.Avatar as string,
              });
            }
          });
          setLastDoc((prev) => {
            return { ...prev, post: users.docs[users.docs.length - 1] };
          });
          setAllRankingStats((prev) => {
            return { ...prev, posts: arr };
          });
          const Comments = await getDocs(commentQuery);
          const commentsArray: topPosters[] = [];
          Comments.forEach((item) => {
            const obj = item.data() as UserData;
            commentsArray.push({
              postCount: obj.commentCount ?? 0,
              userLogin: obj.Login as string,
              avatar: obj.Avatar as string,
            });
          });
          setLastDoc((prev) => {
            return {
              ...prev,
              comment: Comments.docs[Comments.docs.length - 1],
            };
          });
          setAllRankingStats((prev) => {
            return { ...prev, comments: arr };
          });
          setTopPosters(arr);
          setTopCommenters(commentsArray);
          setIsLoading(false);
        };
        getDataFromDB();
      } else {
        setIsLoading(false);
      }
    }
    if (currentExploreOption === "tags") {
      if (!topTags) {
        setIsLoading(true);
        const getDataFromDb = async () => {
          const collectionRef = collection(db, "Hashtags");
          const tagsQuery = query(
            collectionRef,
            orderBy("count", "desc"),
            limit(5)
          );
          const myDocs = await getDocs(tagsQuery);
          const tempArr: topTags[] = [];
          myDocs.forEach((item) => {
            tempArr.push(item.data() as topTags);
          });
          setTopTags(tempArr);
          setIsLoading(false);
        };
        getDataFromDb();
      } else {
        setIsLoading(false);
      }
    }
    if (currentExploreOption === "default") {
      setIsLoading(false);
    }
  }, [currentExploreOption, topCommenters, topPosters, topTags]);
  return isLoading ? (
    <div className="LoadingContainer">
      <LoadingRing colorVariant="white" />
    </div>
  ) : currentExploreOption === "default" ? (
    <div
      className="ChooseContainer"
      style={isMobile ? { flexDirection: "column" } : {}}
    >
      <div
        className="Tags"
        style={
          isMobile
            ? {
                borderRight: "none",
                borderBottom: "0.5rem white solid",
                width: "100%",
              }
            : {}
        }
        onClick={() => {
          setCurrentExploreOption("tags");
        }}
      >
        {
          <div className="ImgContainer">
            <LazyLoadedImage src={HashtagIMG} alt={"View Hashtags"} />
            <span>Hashtags</span>
          </div>
        }
      </div>
      <div
        className="Stats"
        style={
          isMobile
            ? {
                width: "100%",
              }
            : {}
        }
        onClick={() => {
          setCurrentExploreOption("stats");
          setIsLoading(true);
        }}
      >
        {
          <div className="ImgContainer">
            <LazyLoadedImage src={StatsImg} alt={"View Stats"} />
            <span>Stats</span>
          </div>
        }
      </div>
    </div>
  ) : currentExploreOption === "stats" ? (
    isLoading ? (
      <div className="LoadingContainer">
        <LoadingRing colorVariant="white" />
      </div>
    ) : (
      <>
        <div className="StatsHeader">
          <span>
            Stats
            <BackArrow onClickFunc={() => setCurrentExploreOption("default")} />
          </span>
        </div>
        <div
          className="StatsContainer"
          style={
            isMobile
              ? {
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }
              : { flexDirection: "row" }
          }
        >
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
              <button
                onClick={() => {
                  lastDoc.post !== undefined
                    ? loadMore("Post")
                    : allRankingStats.posts!?.length > topPosters!?.length
                    ? loadMore("Post")
                    : showLess("Post");
                }}
              >
                {lastDoc.post !== undefined
                  ? "Load More..."
                  : allRankingStats.posts!?.length > topPosters!?.length
                  ? "Load More..."
                  : "Hide..."}
              </button>
            </div>
          </article>
          <article>
            <h2>Most Comments</h2>
            {topCommenters!.map((item) => {
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
                  lastDoc.comment !== undefined
                    ? loadMore("Comment")
                    : allRankingStats.comments!?.length > topCommenters!?.length
                    ? loadMore("Comment")
                    : showLess("Comment");
                }}
              >
                {lastDoc.comment !== undefined
                  ? "Load More..."
                  : allRankingStats.comments!?.length > topCommenters!?.length
                  ? "Load More..."
                  : "Hide..."}
              </button>
            </div>
          </article>
        </div>
      </>
    )
  ) : (
    <>
      <div className="StatsHeader TagsHeader">
        <span>
          Tags
          <BackArrow onClickFunc={() => setCurrentExploreOption("default")} />
        </span>
      </div>
      <div className="TagsContainer">
        {topTags?.map((item, index) => {
          return (
            <div className="Tag" key={item.name}>
              <span className="Rank">{index + 1}</span>
              <Link to={`/explore/tag/${item.name.slice(1)}`}>
                <span>{item.name}</span>
              </Link>
              <span className="Count">{item.count}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};
export default Explore;
