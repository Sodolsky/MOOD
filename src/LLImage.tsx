import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
interface LLImagePropsInterface {
  src: string;
  alt: string;
  classname?: string;
}
export const LazyLoadedImage: React.FC<LLImagePropsInterface> = (props) => {
  const { src, alt, classname } = props;
  return (
    <LazyLoadImage src={src} alt={alt} effect={"blur"} className={classname} />
  );
};
