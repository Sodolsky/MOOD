import * as React from "react";
import { CreatePost } from "./CreatePost";
import { Navigation } from "./Navigation";
import { Post, PostPropsInteface } from "./Post";
import "./Styles/MainPageStyles.scss";
import { useEffect } from "react";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import {
  collection,
  doc,
  DocumentData,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
} from "@firebase/firestore";
import { db } from "./firebase";
import { UserData } from ".";
import { LoadingRing } from "./LoadingRing";
import { BackTop } from "antd";
interface MainContentPorps {
  setCurrentlyLoggedInUser: React.Dispatch<React.SetStateAction<UserData>>;
}
export const MainContent: React.FC<MainContentPorps> = (props) => {
  const [lastDoc, setLastDoc] = useState<null | DocumentData>(null);
  const [hasMore, setIfHasMore] = useState<boolean>(false);
  const [rawPosts, setRawPosts] = useState<PostPropsInteface[]>([]);
  const [Posts, setPosts] = useState<JSX.Element[]>();
  const [, forceUpdate] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  // We need to treck amount of Posts in DataBase by Retriving document with exact number of them
  useEffect(() => {
    if (count > 4) {
      setIfHasMore(true);
    }
  }, [count]);
  useEffect(() => {
    const countPostRef = doc(db, "Posts", "count");
    onSnapshot(countPostRef, async (count) => {
      if (!count.exists()) {
        await setDoc(countPostRef, {
          count: 0,
        });
        setCount(0);
      } else {
        const docCount = count.data();
        setCount(docCount.count);
      }
    });
    const ref = collection(db, "Posts");
    const q = query(ref, orderBy("timestamp", "desc"), limit(4));
    const Unsubscibe = onSnapshot(q, (doc) => {
      const val = doc.docs.map((item) => {
        return item.data() as PostPropsInteface;
      });
      setLastDoc(doc.docs[doc.docs.length - 1]);
      setRawPosts(val);
    });
    return () => {
      Unsubscibe();
    };
  }, []);
  useEffect(() => {
    rawPosts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setPosts(
      rawPosts.map((item) => {
        return (
          <Post
            key={`${item.date} ${item.userThatPostedThis.Email} ${item.userThatPostedThis.Description}`}
            date={item.date}
            postType={item.postType}
            fileType={item.fileType}
            userThatPostedThis={item.userThatPostedThis}
            text={item.text}
            hashtags={item.hashtags}
            likeCount={item.likeCount}
            poepleThatLiked={item.poepleThatLiked}
            YTLink={item.YTLink}
            img={item.img}
          />
        );
      })
    );
  }, [rawPosts]);
  useEffect(() => {
    if (lastDoc === undefined) {
      setIfHasMore(false);
    }
  }, [lastDoc]);
  // const currentUser = React.useContext(currentlyLoggedInUserContext);
  const loadFunc = (): void => {
    if (hasMore) {
      const ref = collection(db, "Posts");
      const q = query(
        ref,
        orderBy("timestamp", "desc"),
        limit(4),
        startAfter(lastDoc)
      );
      onSnapshot(q, (doc) => {
        const val = doc.docs.map((item) => {
          return item.data() as PostPropsInteface;
        });
        setLastDoc(doc.docs[doc.docs.length - 1]);
        setRawPosts(rawPosts.concat(val));
      });
    }
  };
  //https:firebase.google.com/docs/firestore/query-data/order-limit-data
  return (
    <>
      <BackTop duration={300} />
      <div className="MainContentGrid">
        <Navigation />
        <CreatePost forceUpdate={forceUpdate} setCount={setCount} />
        <InfiniteScroll
          loader={<LoadingRing key={0} colorVariant={"black"} />}
          initialLoad={false}
          loadMore={loadFunc}
          hasMore={hasMore}
          threshold={400}
        >
          <div className="divList">{Posts}</div>
        </InfiniteScroll>
        );
      </div>
    </>
  );
};
