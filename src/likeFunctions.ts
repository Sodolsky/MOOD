import { UserData } from ".";
import { isEqual } from "lodash";
import { PostPropsInteface } from "./Post";
export const getIndexOf = (array: UserData[], loggedUser: UserData): number => {
  let val: number = 0;
  for (let i = 0; i < array.length; i++) {
    if (isEqual(array[i].Login, loggedUser.Login)) {
      val = i;
    }
  }
  return val;
};
export const removeUserFromLikedArray = (
  array: UserData[],
  currentUser: UserData
): void => {
  if (array.length === 1) {
    array.pop();
    return;
  }
  array.splice(getIndexOf(array, currentUser), 1);
};
// I know its redundant but i dont wanna ever deal with another like logic
export const playLikeAnimation = (
  ref: React.MutableRefObject<HTMLImageElement>
): void => {
  if (ref.current === null) {
    return;
  } else {
    ref.current.classList.add("AnimationForLikeClass");
  }
};
export const removeLikeClass = (
  ref: React.MutableRefObject<HTMLImageElement>
): void => {
  if (ref.current === null) {
    return;
  } else if (ref.current.classList.contains("AnimationForLikeClass")) {
    ref.current.classList.remove("AnimationForLikeClass");
  }
};
export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};
// export const generateRandomTextComment = (
//   userThatPostedThisLogin: string
// ): string => {
//   const arrayWithTexts: string[] = [
//     "No one commented on this post be the first person to do it ^_^",
//     `${userThatPostedThisLogin} must feel sad about his post having no reactions 😥`,
//     `Add a comment to make ${userThatPostedThisLogin} feel happier 😉`,
//     `Tell ${userThatPostedThisLogin} how do you feel about his mood 🤩`,
//     `Be the first person to add a comment. Everyone is bored 😴`,
//   ];
//   const rand = getRandomInt(0, 5);
//   return arrayWithTexts[rand];
// };
export const checkIfTextHaveHashtags = (text: string): string[] => {
  const match = text.match(/#[A-Za-z0-9]*/g);
  if (match) {
    return match;
  } else {
    return [];
  }
};
export const formatTextToHaveLinksToHashtags = (
  text: string,
  hashtags: string[]
): string => {
  if (hashtags.length === 0) {
    return text;
  } else {
    let splited = text.split(" ");
    hashtags.forEach((item) => {
      const ix = splited.indexOf(item);
      splited[ix] = `<a>${item}</a>`;
      text = splited.join(" ");
    });
    return text;
  }
};
export const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column" as "row",
  alignItems: "center",
  width: "95%",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  cursor: "pointer",
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
  margin: "1rem",
};
export const getElementCountBetween2ElementsInArray = (
  postId: PostPropsInteface[],
  Element: PostPropsInteface | null
): number | "n" => {
  if (!Element) {
    return 0;
  }
  let Counter = 0;
  for (const i of postId) {
    if (i.date !== Element.date) {
      Counter++;
    } else {
      break;
    }
  }
  if (Counter === postId.length) {
    return "n";
  } else {
    return Counter;
  }
};
export const getObjectDiff = (obj1: any, obj2: any) => {
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
};
//!Potential Functions to operate with the db
// const addUsersToTheirPosts = async () => {
//   const allPostsRef = collection(db, "Posts");
//   const allUsersRef = collection(db, "Users");
//   const allPostsArray = await getDocs(allPostsRef);
//   const allUsers = await getDocs(allUsersRef);
//   const someArr: any = [];
//   const someUSRArr: any = [];
//   allPostsArray.forEach((doc) => {
//     if (doc.exists()) {
//       someArr.push(doc.data());
//     } else {
//       console.log("bug");
//     }
//   });
//   allUsers.forEach((doc) => {
//     if (doc.exists()) {
//       someUSRArr.push(doc.data());
//     }
//   });
//   for (const i of someUSRArr) {
//     const newArr = [];
//     for (const j of someArr) {
//       if (i.Login === j.userThatPostedThis.Login) {
//         newArr.push(j.date);
//       }
//     }
//     updateDoc(doc(db, "Users", `${i.Login}`), {
//       UserPosts: newArr,
//     });
//   }
// };
// const copyPosts = async () => {
//   const oldPostsRef = collection(db, "Posts");
//   const newPosts = collection(db, "Posts2");
//   const q = query(newPosts, where("text", "!=", ""));
//   const myDocs = await getDocs(q);
//   let count = 0;
//   myDocs.forEach((item) => {
//     const obj = item.data() as PostPropsInteface;
//     if (obj.id) {
//       count += 1;
//     }
//   });
//   console.log(count);
// myDocs.forEach(async (item) => {
//   const obj = item.data() as PostPropsInteface;
//   const docRef = await addDoc(newPosts, obj);
//   const rf = doc(db, "Posts2", docRef.id);
//   await updateDoc(rf, {
//     id: docRef.id,
//   });
// });
// };
// const
// const quickQuery = async () => {
//   type commentUserType = { Login: string; commentsRef: string[] };
//   const userCommentsRefArray: commentUserType[] = [];
//   const userRefs = collection(db, "Users");
//   const PostsRef = collection(db, "Posts");
//   const userDocs = await getDocs(userRefs);
//   userDocs.forEach((item) => {
//     const obj = item.data() as UserData;
//     userCommentsRefArray.push({
//       Login: obj.Login as string,
//       commentsRef: obj.commentsRef as string[],
//     });
//   });
//   const myDocs = await getDocs(PostsRef);
//   let total = 0;
//   myDocs.forEach(async (item) => {
//     const CommentsCollectionId = collection(
//       db,
//       "Posts",
//       `${item.id}`,
//       "comments"
//     );
//     const comments = await getDocs(CommentsCollectionId);
//     total += comments.size;
//     comments.forEach((item) => {
//       const obj = item.data() as CommentInterface;
//       const path = item.ref.path;
//       const loginofUsr = obj.userThatAddedComment.Login;
//       userCommentsRefArray.find((o, i) => {
//         if (o.Login === loginofUsr) {
//           const arr = o.commentsRef;
//           arr.push(path);
//           userCommentsRefArray[i] = {
//             Login: loginofUsr,
//             commentsRef: arr,
//           };
//           return true;
//         }
//       });
//     });
//     if (total === 1699) {
//       userCommentsRefArray.forEach((item) => {
//         const ref = doc(db, "Users", item.Login);
//         updateDoc(ref, {
//           commentsRef: item.commentsRef,
//         });
//       });
//       console.log("Done");
//     }
//   });
// };
// const quickOperation = async () => {
//   const ref = collection(db, "Posts");
//   const q = query(ref, where("hashtags", "!=", []));
//   const myDocs = await getDocs(q);
//   const Myset: Set<string> = new Set();
//   const arrWithAllHashtags: string[] = [];
//   myDocs.forEach((item) => {
//     const obj = item.data() as PostPropsInteface;
//     obj.hashtags.forEach((item) => {
//       Myset.add(item);
//       arrWithAllHashtags.push(item);
//     });
//   });
//   const arrayWithCount: { name: string; count: number }[] = [];
//   for (const i of Myset.values()) {
//     const Numb = arrWithAllHashtags.filter((x) => x === i).length;
//     arrayWithCount.push({ name: i, count: Numb });
//   }
//   arrayWithCount.forEach(async (item) => {
//     await setDoc(doc(db, "Hashtags", `${item.name}`), item);
//   });
//   console.log("done");
// };
