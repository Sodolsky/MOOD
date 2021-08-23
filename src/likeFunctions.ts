import { UserData } from ".";
export const getIndexOf = (array: UserData[], loggedUser: UserData): number => {
  let val: number = 0;
  for (let i = 0; i < array.length; i++) {
    if (JSON.stringify(array[i]) === JSON.stringify(loggedUser)) {
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
  array.slice(getIndexOf(array, currentUser), 1);
};
