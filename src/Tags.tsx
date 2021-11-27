import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@firebase/firestore";
import * as React from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { db } from "./firebase";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
export interface useParamsInterface {
  item: string;
}
export const Tags: React.FC = () => {
  const [posts, setPosts] = React.useState<PostPropsInteface[]>();
  const params = useParams<useParamsInterface>();
  useEffect(() => {
    const q = query(
      collection(db, "Posts"),
      orderBy("timestamp", "desc"),
      where("hashtags", "array-contains", `#${params.item}`)
    );
    const unSubscribe = onSnapshot(q, (querySnap) => {
      const dataArray: PostPropsInteface[] = [];
      if (querySnap.size > 0) {
        querySnap.forEach((item) => {
          dataArray.push(item.data() as PostPropsInteface);
        });
      }
      setPosts(dataArray);
    });
    return () => unSubscribe();
  }, [params.item]);
  return (
    <div className="divList">
      {posts !== undefined ? (
        posts.map((item) => {
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
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <LoadingRing colorVariant={"black"} />
        </div>
      )}
    </div>
  );
};
