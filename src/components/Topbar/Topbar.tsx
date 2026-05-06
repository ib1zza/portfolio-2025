import clsx from "clsx";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import { useCustomCursor } from "../../hooks/useCustomCursor";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowManager } from "../../store/useWindowManager";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import s from "./Topbar.module.scss";

interface SubmenuItemData {
  title: string;
  action: () => void;
  disabled?: boolean;
}

interface TabData {
  title: string;
  submenu?: Array<SubmenuItemData | null>;
}

interface SubmenuProps {
  items: Array<SubmenuItemData | null>;
  onItemClick: (action: () => void) => void;
  setRef: (el: HTMLDivElement | null) => void;
}

const formatClock = () =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

const SubmenuContent = ({
  item,
  onClick,
}: {
  item: SubmenuItemData | null;
  onClick: (action: () => void) => void;
}) => {
  if (!item) return <div className={s.submenuSeparator} />;

  return (
    <div
      className={clsx(s.submenuItem, { [s.disabled]: item.disabled })}
      onMouseUp={() => {
        if (!item.disabled) onClick(item.action);
      }}
    >
      {item.title}
    </div>
  );
};

const Submenu = ({ items, onItemClick, setRef }: SubmenuProps) => (
  <div className={s.submenu} ref={setRef}>
    {items.map((item, index) => (
      <SubmenuContent key={index} item={item} onClick={onItemClick} />
    ))}
  </div>
);

export function Topbar() {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [clock, setClock] = useState(formatClock);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const focusedWindowId = useWindowManager((state) => state.focusedWindowId);
  const focusedFileId = useWindowManager((state) =>
    state.focusedWindowId
      ? state.windows[state.focusedWindowId]?.fileId
      : undefined
  );
  const hasWindows = useWindowManager(
    (state) => state.windowIds.length > 0
  );
  const openWindow = useWindowManager((state) => state.openWindow);
  const closeAllWindows = useWindowManager((state) => state.closeAllWindows);
  const resetWindows = useWindowManager((state) => state.resetWindows);
  const { closeWindowAnimated } = useWindowOpenAnimation();
  const setActive = useFileSystem((state) => state.setActive);
  const focusedItem = useFileSystem((state) =>
    focusedFileId ? state.items[focusedFileId] : undefined
  );
  const cleanUpChildren = useFileSystem((state) => state.cleanUpChildren);
  const resetLayout = useFileSystem((state) => state.resetLayout);
  const cleanUpTarget =
    focusedItem?.type === "folder"
      ? focusedItem.id
      : focusedItem?.parentId ?? "root";

  useEffect(() => {
    const timerId = window.setInterval(() => setClock(formatClock()), 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const openPortfolioWindow = useCallback(
    (id: string, title: string) => {
      openWindow(id, title, id);
      setActive(id);
    },
    [openWindow, setActive]
  );

  const closeFocusedWindowAnimated = useCallback(() => {
    if (focusedWindowId) closeWindowAnimated(focusedWindowId);
  }, [closeWindowAnimated, focusedWindowId]);

  const tabs: TabData[] = useMemo(
    () => [
      {
        title: "¤",
        submenu: [
          {
            title: "About This Portfolio...",
            action: () => openPortfolioWindow("about", "About Me"),
          },
          null,
          {
            title: "Close Window",
            action: closeFocusedWindowAnimated,
            disabled: !focusedWindowId,
          },
          {
            title: "Close All",
            action: closeAllWindows,
            disabled: !hasWindows,
          },
        ],
      },
      {
        title: "File",
        submenu: [
          {
            title: "Open About",
            action: () => openPortfolioWindow("about", "About Me"),
          },
          {
            title: "Open Projects",
            action: () => openPortfolioWindow("projects", "Projects"),
          },
          null,
          {
            title: "Close Window",
            action: closeFocusedWindowAnimated,
            disabled: !focusedWindowId,
          },
          {
            title: "Close All",
            action: closeAllWindows,
            disabled: !hasWindows,
          },
        ],
      },
      {
        title: "Edit",
        submenu: [
          {
            title: "Clean Up Icons",
            action: () => cleanUpChildren(cleanUpTarget),
          },
        ],
      },
      {
        title: "Special",
        submenu: [
          {
            title: "Restart Finder",
            action: () => {
              resetLayout();
              resetWindows();
            },
          },
        ],
      },
    ],
    [
      cleanUpChildren,
      cleanUpTarget,
      closeAllWindows,
      closeFocusedWindowAnimated,
      focusedWindowId,
      hasWindows,
      openPortfolioWindow,
      resetLayout,
      resetWindows,
    ]
  );

  const handleSubmenuItemClick = useCallback((action: () => void) => {
    action();
    setActiveMenuIndex(null);
    setIsMousePressed(false);
  }, []);

  const handleMouseOver = useCallback(
    (event: MouseEvent) => {
      if (!isMousePressed) return;

      const target = event.target as Node;
      const hoveredTabIndex = tabRefs.current.findIndex(
        (tab) => tab && tab.contains(target)
      );

      if (
        hoveredTabIndex !== -1 &&
        hoveredTabIndex !== activeMenuIndex &&
        tabs[hoveredTabIndex].submenu
      ) {
        setActiveMenuIndex(hoveredTabIndex);
      }
    },
    [isMousePressed, activeMenuIndex, tabs]
  );

  const handleGlobalMouseUp = useCallback((event: MouseEvent) => {
    const target = event.target as Node;
    const clickedOnSubmenu = submenuRef.current?.contains(target);
    const clickedOnTabTitle = tabRefs.current.some((tab) => {
      if (!tab) return false;
      const tabTitle = tab.querySelector(`.${s.tabTitle}`);
      return tabTitle && tabTitle.contains(target);
    });

    if ((!clickedOnSubmenu && !clickedOnTabTitle) || clickedOnTabTitle) {
      setActiveMenuIndex(null);
    }
    setIsMousePressed(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseOver, handleGlobalMouseUp]);

  const handleMouseDownOnTab = useCallback((index: number) => {
    setIsMousePressed(true);
    setActiveMenuIndex(index);
  }, []);

  const setTabRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      tabRefs.current[index] = el;
    },
    []
  );

  const setSubmenuRef = useCallback((el: HTMLDivElement | null) => {
    submenuRef.current = el;
  }, []);

  const { withCursor } = useCustomCursor();

  return (
    <div className={s.topbar}>
      {tabs.map((tab, index) => (
        <div key={tab.title} className={s.tab} ref={setTabRef(index)}>
          <div
            {...withCursor("hand")}
            className={clsx(s.tabTitle, {
              [s.active]: activeMenuIndex === index,
            })}
            onMouseDown={() => handleMouseDownOnTab(index)}
          >
            {tab.title}
          </div>
          {tab.submenu && activeMenuIndex === index && (
            <Submenu
              items={tab.submenu}
              onItemClick={handleSubmenuItemClick}
              setRef={setSubmenuRef}
            />
          )}
        </div>
      ))}
      <div className={s.clock}>{clock}</div>
    </div>
  );
}
