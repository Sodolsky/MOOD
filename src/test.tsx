import { collection } from "@firebase/firestore";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import * as React from "react";
import { useEffect } from "react";
import { db } from "./firebase";
import { PostPropsInteface } from "./Post";
export const Test: React.FC = () => {
  const [posts, setPosts] = React.useState<PostPropsInteface[]>();
  console.log("inf", posts);
  useEffect(() => {
    const ref = collection(db, "Posts");
    const q = query(ref, orderBy("date", "desc"));
    onSnapshot(q, (doc) => {
      const val = doc.docs.map((item) => {
        return item.data() as PostPropsInteface;
      });
      const dateSorted = val.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setPosts(dateSorted);
    });
  }, []);
  useEffect(() => {
    console.log(posts);
  }, [posts]);
  return (
    <>
      <h1>Logika</h1>
    </>
  );
};
