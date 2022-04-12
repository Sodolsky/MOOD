import { LoadingRing } from "./LoadingRing";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { BackTop, Empty } from "antd";
import {
  collection,
  DocumentData,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { PostPropsInteface, Post } from "./Post";
import { db } from "./firebase";

export const HallOfFame = () => {
  const [isLoading, setisLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<PostPropsInteface[]>([]);
  const [lastdoc, setLastDoc] = useState<DocumentData>();
  useEffect(() => {
    const q = query(
      collection(db, "Posts"),
      orderBy("timestamp", "desc"),
      where("hallOfFame", "==", true),
      limit(4)
    );
    const unSubscribe = onSnapshot(q, (querySnap) => {
      const dataArray: PostPropsInteface[] = [];
      if (querySnap.size > 0) {
        querySnap.forEach((item) => {
          dataArray.push(item.data() as PostPropsInteface);
        });
      }
      const { docs } = querySnap;
      setLastDoc(docs.length > 1 ? docs[docs.length - 1] : undefined);
      setPosts(dataArray);
      setisLoading(false);
    });
    return () => unSubscribe();
  }, []);
  const loadFunc = async () => {
    const q = query(
      collection(db, "Posts"),
      orderBy("timestamp", "desc"),
      where("hallOfFame", "==", true),
      limit(4),
      startAfter(lastdoc)
    );
    onSnapshot(q, (doc) => {
      const newPosts = doc.docs.map((item) => {
        return item.data() as PostPropsInteface;
      });
      setLastDoc(doc.docs[doc.docs.length - 1]);
      setPosts([...posts, ...newPosts]);
      setisLoading(false);
    });
  };
  return !isLoading ? (
    <>
      <BackTop duration={300} />
      <InfiniteScroll
        style={{ overflow: "hidden", paddingBottom: "2rem" }}
        loader={
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LoadingRing colorVariant={"white"} />
          </div>
        }
        hasMore={lastdoc !== undefined}
        next={loadFunc}
        dataLength={posts?.length as number}
        scrollableTarget={window}
      >
        {posts.length > 0 ? (
          <div className="divList">
            {posts.map((item) => {
              return <Post date={item.date} key={`${item.URL}`} />;
            })}
          </div>
        ) : (
          <Empty
            style={{
              fontSize: "1.5rem",
              textAlign: "center",
              marginTop: "2rem",
            }}
            description={
              " No posts we're added to Hall of Fame Try to add one yourself!"
            }
          />
        )}
      </InfiniteScroll>
    </>
  ) : (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <LoadingRing colorVariant={"white"} />
    </div>
  );
};
