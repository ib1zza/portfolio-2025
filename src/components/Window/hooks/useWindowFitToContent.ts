import { useCallback } from "react";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";

import type { WindowInstance } from "../../../store/useWindowManager";
import {
  areSizesEqual,
} from "../windowGeometry";
import {
  getTopbarHeight,
  getWindowMinSize,
} from "../../../constants/windowLayout";

interface UseWindowFitToContentParams {
  contentRef: RefObject<HTMLDivElement | null>;
  id: string;
  position: WindowInstance["position"];
  size: WindowInstance["size"];
  setWindowDimensions: React.Dispatch<React.SetStateAction<WindowInstance["size"]>>;
  updateWindowBounds: (
    id: string,
    bounds: Pick<WindowInstance, "position" | "size">
  ) => void;
}

const getNumericStyleValue = (style: CSSStyleDeclaration, property: string) =>
  parseFloat(style.getPropertyValue(property)) || 0;

const measureElementRect = (
  element: HTMLElement,
  relativeTo: DOMRect,
  scrollLeft: number,
  scrollTop: number,
): { width: number; height: number } => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  // display: contents generates no box — measure its children instead
  if (
    rect.width === 0 &&
    rect.height === 0 &&
    element.children.length > 0 &&
    style.display === "contents"
  ) {
    let w = 0, h = 0;
    Array.from(element.children).forEach((child) => {
      const childRect = measureElementRect(
        child as HTMLElement, relativeTo, scrollLeft, scrollTop,
      );
      w = Math.max(w, childRect.width);
      h = Math.max(h, childRect.height);
    });
    return { width: w, height: h };
  }

  const marginRight = getNumericStyleValue(style, "margin-right");
  const marginBottom = getNumericStyleValue(style, "margin-bottom");

  return {
    width: Math.max(0, rect.right - relativeTo.left + scrollLeft + marginRight),
    height: Math.max(0, rect.bottom - relativeTo.top + scrollTop + marginBottom),
  };
};

const getArticleContentSize = (article: HTMLElement) => {
  const articleRect = article.getBoundingClientRect();
  const articleStyle = window.getComputedStyle(article);
  const paddingRight = getNumericStyleValue(articleStyle, "padding-right");
  const paddingBottom = getNumericStyleValue(articleStyle, "padding-bottom");
  let width = 0;
  let height = 0;

  Array.from(article.children).forEach((child) => {
    const element = child as HTMLElement;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const marginRight = getNumericStyleValue(style, "margin-right");
    const marginBottom = getNumericStyleValue(style, "margin-bottom");

    width = Math.max(
      width,
      rect.right - articleRect.left + marginRight + paddingRight
    );
    height = Math.max(
      height,
      rect.bottom - articleRect.top + marginBottom + paddingBottom
    );
  });

  return {
    width: Math.ceil(width || article.scrollWidth),
    height: Math.ceil(height || article.scrollHeight),
  };
};

const getContentSize = (node: HTMLElement) => {
  const children = Array.from(node.children) as HTMLElement[];

  if (!children.length) {
    return { width: node.scrollWidth, height: node.scrollHeight };
  }

  if (children.length === 1 && children[0].tagName === "ARTICLE") {
    return getArticleContentSize(children[0]);
  }

  const nodeRect = node.getBoundingClientRect();
  let width = 0;
  let height = 0;

  children.forEach((child) => {
    const childSize = measureElementRect(
      child, nodeRect, node.scrollLeft, node.scrollTop,
    );
    width = Math.max(width, childSize.width);
    height = Math.max(height, childSize.height);
  });

  return {
    width: Math.ceil(width || node.scrollWidth),
    height: Math.ceil(height || node.scrollHeight),
  };
};

export const useWindowFitToContent = ({
  contentRef,
  id,
  position,
  size,
  setWindowDimensions,
  updateWindowBounds,
}: UseWindowFitToContentParams) => {
  const commitWindowDimensions = useCallback(
    (nextSize: WindowInstance["size"]) => {
      setWindowDimensions((currentSize) =>
        areSizesEqual(currentSize, nextSize) ? currentSize : nextSize
      );
    },
    [setWindowDimensions]
  );

  const handleZoomToFit = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      const node = contentRef.current;
      if (!node) return;

      const contentSize = getContentSize(node);
      const chromeWidth = size.width - node.clientWidth;
      const chromeHeight = size.height - node.clientHeight;
      const minSize = getWindowMinSize();
      const topbarHeight = getTopbarHeight();
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight - topbarHeight;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minSize.width, contentSize.width + chromeWidth)
      );
      const nextHeight = Math.min(
        maxHeight,
        Math.max(minSize.height, contentSize.height + chromeHeight)
      );
      const nextPosition = {
        x: Math.min(position.x, Math.max(0, window.innerWidth - nextWidth)),
        y: Math.min(
          Math.max(topbarHeight, position.y),
          Math.max(topbarHeight, window.innerHeight - nextHeight)
        ),
      };

      commitWindowDimensions({ width: nextWidth, height: nextHeight });
      updateWindowBounds(id, {
        position: nextPosition,
        size: { width: nextWidth, height: nextHeight },
      });
    },
    [
      commitWindowDimensions,
      contentRef,
      id,
      position,
      size,
      updateWindowBounds,
    ]
  );

  return {
    commitWindowDimensions,
    handleZoomToFit,
  };
};
