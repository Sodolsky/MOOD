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
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0`;
  }
  return "";
};
const Matchlink = (url: string): RegExpMatchArray | null => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|v=|\?v=)([^#]*).*/;
  const match = url.match(regExp);
  return match;
};
