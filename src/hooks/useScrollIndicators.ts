import React from "react";

interface ScrollIndicators {
  showLeft: boolean;
  showRight: boolean;
  handleScroll: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const useScrollIndicators = (
  isMobile: boolean,
  threshold = 10
): ScrollIndicators => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(true);

  const handleScroll = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    const isAtStart = scrollLeft <= threshold;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - threshold;

    setShowLeft(!isAtStart);
    setShowRight(!isAtEnd);
  }, [threshold]);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (!isMobile || !element) return;

    handleScroll();

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [isMobile, handleScroll]);

  return { showLeft, showRight, handleScroll, scrollRef };
};
