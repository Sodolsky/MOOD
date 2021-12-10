import {
  collection,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "@firebase/firestore";
import { BackTop } from "antd";
import { limit } from "firebase/firestore";
import * as React from "react";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router";
import { db } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
export interface useParamsInterface {
  item: string;
}
export const Tags: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<PostPropsInteface[]>([]);
  const [lastdoc, setLastDoc] = useState<DocumentData>();
  const params = useParams<useParamsInterface>();
  useEffect(() => {
    const q = query(
      collection(db, "Posts"),
      orderBy("timestamp", "desc"),
      where("hashtags", "array-contains", `#${params.item}`),
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
      setLastDoc(docs[docs.length - 1]);
      setPosts(dataArray);
      setIsLoading(false);
    });
    return () => unSubscribe();
  }, [params.item]);
  const loadFunc = async () => {
    const q = query(
      collection(db, "Posts"),
      orderBy("timestamp", "desc"),
      where("hashtags", "array-contains", `#${params.item}`),
      limit(4),
      startAfter(lastdoc)
    );
    await onSnapshot(q, (doc) => {
      const newPosts = doc.docs.map((item) => {
        return item.data() as PostPropsInteface;
      });
      setLastDoc(doc.docs[doc.docs.length - 1]);
      setPosts([...posts, ...newPosts]);
    });
  };

  return !isLoading ? (
    <>
      <BackTop duration={300} />
      <InfiniteScroll
        style={{ overflow: "hidden" }}
        loader={
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LoadingRing colorVariant={"white"} />
          </div>
        }
        hasMore={lastdoc !== undefined}
        next={loadFunc}
        dataLength={posts?.length as number}
        scrollableTarget={window}
        endMessage={
          <div style={{ display: "flex", justifyContent: "center" }}>
            You've seen all the posts :D
          </div>
        }
      >
        <div className="divList">
          {posts!.map((item) => {
            return (
              <Post
                postType={item.postType}
                userThatPostedThis={item.userThatPostedThis}
                text={item.text}
                likeCount={item.likeCount}
                hashtags={item.hashtags}
                poepleThatLiked={item.poepleThatLiked}
                date={item.date}
                URL={item.URL}
                YTLink={item.YTLink}
                fileType={item.fileType}
                img={item.img}
                key={item.date}
              />
            );
          })}
        </div>
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
