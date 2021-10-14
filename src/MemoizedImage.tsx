import React from "react";
interface MemoizedImageInterface {
  src: string;
  classname?: string;
  alt: string;
}
export const MemoizedImage = React.memo(function Image({
  src,
  classname,
  alt,
}: MemoizedImageInterface) {
  return <img src={src} className={classname} alt={alt} />;
});
