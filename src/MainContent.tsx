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
interface MainContentPorps {
  setCurrentlyLoggedInUser: React.Dispatch<React.SetStateAction<UserData>>;
}
type incomingPostsType = {
  ready: boolean;
  count: number;
};
export const MainContent: React.FC<MainContentPorps> = (props) => {
  // const localStorageinfo = localStorage.getItem("signupinfo") || "false";
  // const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const divListRef = React.useRef<HTMLDivElement | null>(null);
  const [lastDoc, setLastDoc] = useState<null | DocumentData>(null);
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
        const val = doc.docs.map((item) => {
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
