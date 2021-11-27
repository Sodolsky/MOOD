import React from "react";
import {
  getBrowserVisibilityProp,
  getIsDocumentHidden,
} from "./utilityFunctions";
export function usePageVisibility() {
  const [isVisible, setIsVisible] = React.useState(getIsDocumentHidden());
  const onVisibilityChange = () => setIsVisible(getIsDocumentHidden());

  React.useEffect(() => {
    const visibilityChange = getBrowserVisibilityProp();
    document.addEventListener(
      visibilityChange as string,
      onVisibilityChange,
      false
    );

    return () => {
      document.removeEventListener(
        visibilityChange as string,
        onVisibilityChange
      );
    };
  });

  return isVisible;
}
