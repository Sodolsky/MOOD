import * as React from "react";
import { CreatePost } from "./CreatePost";
import { Navigation } from "./Navigation";
import { Post, PostPropsInteface } from "./Post";
import "./Styles/MainPageStyles.scss";
import { useEffect } from "react";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from "@firebase/firestore";
import { db } from "./firebase";
import { currentlyLoggedInUserContext, UserData } from "./App";
import { LoadingRing } from "./LoadingRing";
import { BackTop } from "antd";
import { isEqual } from "lodash";
import { usePageVisibility } from "./hooks/usePageVisibility";
import { getElementCountBetween2ElementsInArray } from "./likeFunctions";
import nProgress from "nprogress";
interface MainContentPorps {
  setCurrentlyLoggedInUser: React.Dispatch<React.SetStateAction<UserData>>;
}
type incomingPostsType = {
  ready: boolean;
  count: number;
};
export const MainContent: React.FC<MainContentPorps> = () => {
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const firstBatch = React.useRef<boolean>(true);
  const divListRef = React.useRef<HTMLDivElement | null>(null);
  const [lastDoc, setLastDoc] = useState<null | DocumentData>(null);
  const [isLaoding, setIsLaoding] = useState<boolean>(true);
  const [rawPosts, setRawPosts] = useState<PostPropsInteface[]>([]);
  const [Posts, setPosts] = useState<JSX.Element[]>();
  const [newPostsAreReady, setIfNewPostsAreReady] =
    React.useState<incomingPostsType>({
      count: 0,
      ready: false,
    });
  const cachedPosts = React.useRef<DocumentData[]>([]);
  const potentialNewPostsCount = React.useRef<number>(0);
  const visible = usePageVisibility();
  const lastPostSeen = React.useRef<PostPropsInteface | null>(null);
  useEffect(() => {
    if (visible) {
      if (newPostsAreReady.count === 0) {
        document.title = `MOOD`;
      } else {
        const count = newPostsAreReady.count;
        document.title = `MOOD (${count}) New Posts`;
      }
      lastPostSeen.current = rawPosts[0];
    } else {
      if (lastPostSeen.current) {
        if (!isEqual(rawPosts[0], lastPostSeen.current)) {
          const diff = getElementCountBetween2ElementsInArray(
            rawPosts,
            lastPostSeen.current
          );
          //Handle Normal logic when there are no new Posts in Cache.
          if (newPostsAreReady.count === 0) {
            if (diff === "n") {
              document.title = `MOOD (4+) New Posts`;
            } else {
              //We need to check if post that is being added is user post if not we handle normal logic else we dont change the title
              diff === 0
                ? (document.title = `MOOD`)
                : diff === 1
                ? rawPosts[0].userThatPostedThis.UID ===
                  currentlyLoggedInUser.UID
                  ? (document.title = `MOOD`)
                  : (document.title = `MOOD (${diff}) New Posts`)
                : (document.title = `MOOD (${diff}) New Posts`);
            }
            //Handle logic when there are Posts in cache and normal Posts Unseen
          } else if (diff !== "n") {
            const Total = newPostsAreReady.count + diff;
            document.title = `MOOD (${Total}) New Posts`;
            // new Notification("2 new Posts are Rdy");
          } else {
            document.title = `Mood (4+) New Posts`;
          }
        } else {
          if (newPostsAreReady.count !== 0) {
            document.title = `MOOD (${newPostsAreReady.count}) New Posts`;
          }
        }
      }
    }
  }, [rawPosts, visible, newPostsAreReady, currentlyLoggedInUser.UID]);
  // const firstBatch = React.useRef<boolean>(true);
  useEffect(() => {
    const ref = collection(db, "Posts");
    const q = query(ref, orderBy("timestamp", "desc"), limit(4));
    const Unsubscibe = onSnapshot(q, (doc) => {
      let shouldLoad: boolean = true;
      doc.docChanges().forEach((change) => {
        if (change.type === "modified") {
          return;
        } else if (change.type === "added") {
          if (window.pageYOffset > 1500) {
            shouldLoad = false;
            potentialNewPostsCount.current++;
            const arr = cachedPosts.current;
            arr.push(change.doc);
            cachedPosts.current = arr;
          }
          if (shouldLoad) {
            const cachedPostsIndexes = doc.docs.filter((x) => {
              if (cachedPosts.current.length !== 0) {
                for (const i of cachedPosts.current) {
                  const iFormatted = i.data() as PostPropsInteface;
                  const xFormatted = x.data() as PostPropsInteface;
                  if (iFormatted.URL === xFormatted.URL) {
                    return false;
                  }
                }
                return true;
              }
              return true;
            });
            const val = cachedPostsIndexes.map((item) => {
              return item.data() as PostPropsInteface;
            });
            setLastDoc(doc.docs[doc.docs.length - 1]);
            setRawPosts(val);
            firstBatch.current = false;
          } else {
            setIfNewPostsAreReady({
              ready: true,
              count: potentialNewPostsCount.current,
            });
          }
        }
      });
    });
    return () => {
      Unsubscibe();
    };
  }, []);
  const showNewPosts = async () => {
    nProgress.start();
    const cachedPostDataArray = cachedPosts.current.map((item) => {
      return item.data() as PostPropsInteface;
    });
    const arr = [...cachedPostDataArray, ...rawPosts];
    cachedPosts.current = [];
    potentialNewPostsCount.current = 0;
    setIfNewPostsAreReady({
      ready: false,
      count: potentialNewPostsCount.current,
    });
    const Ldoc = await getDoc(doc(db, "Posts", `${arr[arr.length - 1].date}`));
    setLastDoc(Ldoc);
    setRawPosts(arr);
    nProgress.done();
  };
  useEffect(() => {
    setPosts(
      rawPosts.map((item) => {
        return (
          <Post
            key={`${item.date} ${item.userThatPostedThis.Email} ${item.userThatPostedThis.Description}`}
            date={item.date}
          />
        );
      })
    );
    setIsLaoding(false);
  }, [rawPosts]);
  // const currentUser = React.useContext(currentlyLoggedInUserContext);
  const loadFunc = async (): Promise<void> => {
    const ref = collection(db, "Posts");
    const q = query(
      ref,
      orderBy("timestamp", "desc"),
      limit(4),
      startAfter(lastDoc)
    );
    onSnapshot(q, (doc) => {
      doc.docChanges().forEach((change) => {
        if (change.type === "modified") {
          return;
        } else if (change.type === "added") {
          const val = doc.docs.map((item) => {
            return item.data() as PostPropsInteface;
          });
          setLastDoc(doc.docs[doc.docs.length - 1]);
          setRawPosts([...rawPosts, ...val]);
        }
      });
    });
  };
  //https:firebase.google.com/docs/firestore/query-data/order-limit-data
  return isLaoding ? (
    <div className="MainContentGrid">
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}
      >
        <LoadingRing colorVariant="white" />
      </div>
    </div>
  ) : (
    <>
      {/* <ShowUserThatWeAreChaningSingInSystem
        wasShown={localStorageinfo}
        userObject={currentlyLoggedInUser}
      /> */}
      <BackTop duration={300} />
      {newPostsAreReady.ready && (
        <div className={`NewPostsAreReadyMobile`}>
          {newPostsAreReady.count} New Posts
        </div>
      )}
      <div className="MainContentGrid">
        <Navigation />
        <CreatePost />
        <InfiniteScroll
          scrollThreshold={0.7}
          style={{ overflow: "hidden" }}
          loader={
            <div style={{ display: "flex", justifyContent: "center" }}>
              <LoadingRing colorVariant={"white"} />
            </div>
          }
          hasMore={lastDoc !== undefined}
          next={loadFunc}
          dataLength={rawPosts.length}
          scrollableTarget={window}
          endMessage={
            <div style={{ display: "flex", justifyContent: "center" }}>
              You've seen all the posts :D
            </div>
          }
        >
          <div className="divList" ref={divListRef}>
            {newPostsAreReady.ready && (
              <button className="LoadNewPostsButton" onClick={showNewPosts}>
                Load {newPostsAreReady.count} new Posts
              </button>
            )}
            {Posts}
          </div>
        </InfiniteScroll>
        );
      </div>
    </>
  );
};
