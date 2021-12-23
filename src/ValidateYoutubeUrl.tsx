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
type youtubeURL = { id: string; timestamp: null | string };
export const getLinkId = (url: string): youtubeURL => {
  const match = Matchlink(url);
  //?start=84 This is the format we need to convert from ?t=84
  if (match && match[2].length === 11) {
    return { id: match[2], timestamp: !match[4] ? null : `start=${match[4]}` };
  }
  return { id: "", timestamp: null };
};
const Matchlink = (url: string): RegExpMatchArray | null => {
  const regExp =
    // eslint-disable-next-line
    /^.*?(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)(?:(\?t|&start)=(\d+))?.*/;
  const match = url.match(regExp);
  return match;
};
