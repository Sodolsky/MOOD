import * as React from "react";
import { CreatePost } from "./CreatePost";
import { Navigation } from "./Navigation";
import { Post, PostPropsInteface } from "./Post";
import "./Styles/MainPageStyles.scss";
import { useEffect } from "react";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
// import { useContext } from "react";
// import { currentlyLoggedInUserContext } from ".";
export const PostDataBase: PostPropsInteface[] = JSON.parse(
  localStorage.getItem("postdatabase") || "[]"
);
export const savePostsInLocalStorage = (): void => {
  localStorage.setItem("postdatabase", JSON.stringify(PostDataBase));
};
// if (Object.keys(PostData).length === 0) {
//   DataBase = [
//     {
//       Login: "admin",
//       Password: "admin",
//       Email: "admin@admin.com",
//       Avatar: undefined,
//     },
//   ];
// }
export const MainContent: React.FC = () => {
  // const currentUser = useContext(currentlyLoggedInUserContext);
  const [dataBaseOfPosts, setDataBaseOfPosts] =
    useState<PostPropsInteface[]>(PostDataBase);
  const [Posts, setPosts] = useState<JSX.Element[]>();
  const [hasMore] = useState<boolean>(false);
  const loadFunc = (page: number): void => {
    console.log("chce Wiecej");
  };
  console.log(dataBaseOfPosts);
  useEffect(() => {
    PostDataBase.reverse();
    const MappedPostDatBase = PostDataBase.map((el, inx = 0) => {
      return (
        <Post
          key={inx}
          postType={el.postType}
          userThatPostedThis={el.userThatPostedThis}
          text={el.text}
          img={el.img}
          YTLink={el.YTLink}
          likeCount={el.likeCount}
          poepleThatLiked={el.poepleThatLiked}
          date={el.date}
        />
      );
    });
    setPosts(MappedPostDatBase);
  }, [dataBaseOfPosts]);
  return (
    <>
      <div className="MainContentGrid">
        <Navigation />
        <CreatePost
          dataBaseOfPosts={dataBaseOfPosts}
          setDataBaseOfPosts={setDataBaseOfPosts}
        />
        <InfiniteScroll
          loader={
            <div className="loader" key={0}>
              Loading ...
            </div>
          }
          pageStart={0}
          initialLoad={true}
          loadMore={loadFunc}
          hasMore={hasMore}
        >
          <div className="divList">{Posts}</div>
        </InfiniteScroll>
      </div>
    </>
  );
};
