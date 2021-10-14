export const validateYouTubeUrl = (url: string): boolean | undefined => {
  if (url !== undefined || url !== "") {
    const match = Matchlink(url);
    if (match && match[2].length === 11) {
      return true;
    } else {
      return false;
    }
  }
};
export const getLinkId = (url: string): string => {
  const match = Matchlink(url);
  //?start=84 This is the format we need to convert from ?t=84
  if (match && match[2].length === 11) {
    if (match[3] && match[4]) {
      return `https://www.youtube.com/embed/${match[2]}?start=${match[4]}`;
    } else {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
  }
  return "";
};
const Matchlink = (url: string): RegExpMatchArray | null => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|v=)([^#]*)(?:(\?t|&start)=(\d+))?.*/;
  const match = url.match(regExp);
  return match;
};
