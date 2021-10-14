import { UserData } from ".";
import { isEqual } from "lodash";
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
  console.log(match);
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
