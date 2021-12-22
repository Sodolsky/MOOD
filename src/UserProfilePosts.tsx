import {
  collection,
  DocumentData,
  Query,
  query,
  QuerySnapshot,
  startAfter,
  where,
} from "@firebase/firestore";
import { BackTop } from "antd";
import { getDocs, limit, orderBy } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useLocation } from "react-router";
import { db } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
type sortingType = "Latest" | "MostLiked" | "Oldest";
export const UserProfilePosts: React.FC = () => {
  const myLocation = useLocation<Location>();
  const userLogin = myLocation.pathname.split("/")[2];
  const [Posts, setPosts] = useState<PostPropsInteface[]>([]);
  const [lastDoc, setLastDoc] = useState<null | DocumentData>(null);
  const [hasMore, sethasMore] = useState<boolean>(true);
  const [activeSorting, setActiveSorting] = useState<sortingType>("Latest");
  const queryDataBase = async (
    q: Query<DocumentData>,
    firstSetOfPosts: boolean
  ) => {
    const myDocs = await getDocs(q);
    const arrayWithPost: PostPropsInteface[] = [];
    myDocs.forEach((item) => {
      arrayWithPost.push(item.data() as PostPropsInteface);
    });
    setFetchedPosts(arrayWithPost, myDocs, firstSetOfPosts);
  };
  const setFetchedPosts = (
    PostArray: PostPropsInteface[],
    docs: QuerySnapshot<DocumentData>,
    firstSetOfPosts: boolean
  ) => {
    if (firstSetOfPosts) {
      setPosts(PostArray);
      setLastDoc(docs.docs[docs.docs.length - 1]);
    } else {
      setLastDoc(docs.docs[docs.docs.length - 1]);
      setPosts(Posts.concat(PostArray));
    }
  };
  const fetchUserPosts = async (Login: string) => {
    const postCollectionRef = collection(db, "Posts");
    if (activeSorting === "Latest") {
      const q = query(
        postCollectionRef,
        where("userThatPostedThis.Login", "==", `${Login}`),
        orderBy("timestamp", "desc"),
        limit(4)
      );
      queryDataBase(q, true);
    }
    if (activeSorting === "MostLiked") {
      const q = query(
        postCollectionRef,
        where("userThatPostedThis.Login", "==", `${Login}`),
        orderBy("likeCount", "desc"),
        limit(4)
      );
      queryDataBase(q, true);
    }
    if (activeSorting === "Oldest") {
      const q = query(
        postCollectionRef,
        where("userThatPostedThis.Login", "==", `${Login}`),
        orderBy("timestamp", "asc"),
        limit(4)
      );
      queryDataBase(q, true);
    }
  };
  useEffect(() => {
    switch (activeSorting) {
      case "Latest":
        setPosts([]);
        setLastDoc(null);
        fetchUserPosts(userLogin);
        break;
      case "MostLiked":
        setPosts([]);
        setLastDoc(null);
        fetchUserPosts(userLogin);
        break;
      case "Oldest":
        setPosts([]);
        setLastDoc(null);
        fetchUserPosts(userLogin);
        break;
      default:
        console.log("error has occured in UserProfilePosts Component");
        break;
    }
    // eslint-disable-next-line
  }, [activeSorting, userLogin]);
  const loadFunc = async () => {
    if (hasMore) {
      const postCollectionRef = collection(db, "Posts");
      if (activeSorting === "Latest") {
        const q = query(
          postCollectionRef,
          where("userThatPostedThis.Login", "==", `${userLogin}`),
          orderBy("timestamp", "desc"),
          limit(4),
          startAfter(lastDoc)
        );
        queryDataBase(q, false);
      }
      if (activeSorting === "MostLiked") {
        const q = query(
          postCollectionRef,
          where("userThatPostedThis.Login", "==", `${userLogin}`),
          orderBy("likeCount", "desc"),
          limit(4),
          startAfter(lastDoc)
        );
        queryDataBase(q, false);
      }
      if (activeSorting === "Oldest") {
        const q = query(
          postCollectionRef,
          where("userThatPostedThis.Login", "==", `${userLogin}`),
          orderBy("timestamp", "asc"),
          limit(4),
          startAfter(lastDoc)
        );
        queryDataBase(q, false);
      }
    }
  };
  useEffect(() => {
    Posts.length !== 0 && setIsLoaded(true);
    if (lastDoc === undefined) {
      sethasMore(false);
    }
  }, [Posts, lastDoc]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  return isLoaded ? (
    <InfiniteScroll
      loader={<LoadingRing key={0} colorVariant={"black"} />}
      initialLoad={false}
      loadMore={loadFunc}
      hasMore={true}
      threshold={400}
    >
      <BackTop duration={300} />
      <div className="Filters">
        <button
          className={activeSorting === "Latest" ? "ActiveButton" : ""}
          onClick={() => setActiveSorting("Latest")}
        >
          Latest ⏰
        </button>
        <button
          className={activeSorting === "MostLiked" ? "ActiveButton" : ""}
          onClick={() => setActiveSorting("MostLiked")}
        >
          Most Liked 🔥
        </button>
        <button
          className={activeSorting === "Oldest" ? "ActiveButton" : ""}
          onClick={() => setActiveSorting("Oldest")}
        >
          Oldest 👴
        </button>
      </div>
      <div className="divList">
        {Posts.map((item) => {
          return (
            <Post
              key={`${item.date} ${item.userThatPostedThis.Email} ${item.userThatPostedThis.Description}`}
              date={item.date}
            />
          );
        })}
      </div>
    </InfiniteScroll>
  ) : (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <LoadingRing colorVariant="white" />
    </div>
  );
};
