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
  DocumentData,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from "@firebase/firestore";
import { db } from "./firebase";
import { UserData } from ".";
import { LoadingRing } from "./LoadingRing";
import { BackTop } from "antd";
import { isEqual } from "lodash";
import { usePageVisibility } from "./hooks/usePageVisibility";
import { getElementCountBetween2ElementsInArray } from "./likeFunctions";
// export const ShowUserThatWeAreChaningSingInSystem: React.FC<{
//   wasShown: string;
//   userObject: UserData;
// }> = (props) => {
//   const { wasShown, userObject } = props;
//   // const [isModalVisible, setIsModalVisible] = useState<boolean>(
//   //   wasShown === "false"
//   // );
//   // const handleOk = () => {
//   //   setIsModalVisible(false);
//   //   localStorage.setItem("signupinfo", "true");
//   // };
//   // const handleCancel = () => {
//   //   setIsModalVisible(false);
//   //   localStorage.setItem("signupinfo", "true");
//   // };
//   return wasShown === "false" ? (
//     <Modal
//       title="Sign in method change"
//       onCancel={handleCancel}
//       onOk={handleOk}
//       visible={isModalVisible}
//     >
//       Dear {userObject.Login}, on 06.11.2021 we will be changing the way you
//       Sign In for the platform. Instead of using Login and Password , you will
//       need to provide us with Email and Password. We know that most users didn't
//       really care about providing us with a Valid Email, so here are your Login
//       Credentials:
//       <br />
//       <span
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <h3>
//           Email: <span style={{ color: "red" }}>{userObject.Email}</span>
//         </h3>
//         <h3>
//           Password: <span style={{ color: "red" }}>{userObject.Password}</span>
//         </h3>
//       </span>
//     </Modal>
//   ) : (
//     <></>
//   );
// };
function getObjectDiff(obj1: any, obj2: any) {
  const diff = Object.keys(obj1).reduce((result, key) => {
    if (!obj2.hasOwnProperty(key)) {
      result.push(key);
    } else if (isEqual(obj1[key], obj2[key])) {
      const resultKeyIndex = result.indexOf(key);
      result.splice(resultKeyIndex, 1);
    }
    return result;
  }, Object.keys(obj2));

  return diff;
}
interface MainContentPorps {
  setCurrentlyLoggedInUser: React.Dispatch<React.SetStateAction<UserData>>;
}
type incomingPostsType = {
  ready: boolean;
  count: number;
};
export const MainContent: React.FC<MainContentPorps> = () => {
  const divListRef = React.useRef<HTMLDivElement | null>(null);
  const [lastDoc, setLastDoc] = useState<null | DocumentData>(null);
  const [isLaoding, setIsLaoding] = useState<boolean>(true);
  const [hasMore, setIfHasMore] = useState<boolean>(true);
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
              diff === 0
                ? (document.title = `MOOD`)
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
  }, [rawPosts, visible, newPostsAreReady]);
  // const firstBatch = React.useRef<boolean>(true);
  useEffect(() => {
    const ref = collection(db, "Posts");
    const q = query(ref, orderBy("timestamp", "desc"), limit(4));
    const Unsubscibe = onSnapshot(q, (doc) => {
      // if (firstBatch.current) {
      //   firstBatch.current = false;
      //   return;
      // }
      let shouldLoad: boolean = true;
      doc.docChanges().forEach((change) => {
        if (change.type === "added") {
          if (window.pageYOffset > 1500) {
            shouldLoad = false;
            potentialNewPostsCount.current++;
            const arr = cachedPosts.current;
            arr.push(change.doc);
            cachedPosts.current = arr;
          }
        }
      });
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
      } else {
        setIfNewPostsAreReady({
          ready: true,
          count: potentialNewPostsCount.current,
        });
      }
    });
    return () => {
      Unsubscibe();
    };
  }, []);
  // useEffect(() => {
  //   console.log(newPostsAreReady);
  // }, [newPostsAreReady]);
  const showNewPosts = () => {
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
    setLastDoc(arr[arr.length - 1]);
    setRawPosts(arr);
  };
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
            URL={item.URL}
          />
        );
      })
    );
    setIsLaoding(false);
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
          loader={<LoadingRing key={0} colorVariant={"black"} />}
          initialLoad={false}
          loadMore={loadFunc}
          hasMore={hasMore}
          threshold={400}
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
