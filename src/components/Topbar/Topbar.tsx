import clsx from "clsx";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { isMobilePointerMode } from "../../constants/responsive";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowManager } from "../../store/useWindowManager";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import { useEasterEggs } from "../../features/easter-eggs/EasterEggContext";
import { useEasterEggProgress } from "../../features/easter-eggs/useEasterEggProgress";
import s from "./Topbar.module.scss";

interface SubmenuItemData {
  title: string;
  action: () => void;
  disabled?: boolean;
}

interface TabData {
  title: string;
  submenu?: Array<SubmenuItemData | null>;
  mobileHidden?: boolean;
}

interface SubmenuProps {
  items: Array<SubmenuItemData | null>;
  onItemClick: (action: () => void) => void;
  setRef: (el: HTMLDivElement | null) => void;
}

const clockFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const formatClock = () => clockFormatter.format(new Date());

const isTouchLikePointer = (event: MouseEvent | PointerEvent) =>
  "pointerType" in event &&
  (event.pointerType === "touch" || event.pointerType === "pen");

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
      onPointerUp={() => {
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
  const [isAppleSpecialMenuActive, setIsAppleSpecialMenuActive] =
    useState(false);
  const [clock, setClock] = useState(formatClock);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const focusedWindowId = useWindowManager((state) => state.focusedWindowId);
  const focusedFileId = useWindowManager((state) =>
    state.focusedWindowId
      ? state.windows[state.focusedWindowId]?.fileId
      : undefined,
  );
  const hasWindows = useWindowManager((state) => state.windowIds.length > 0);
  const openWindow = useWindowManager((state) => state.openWindow);
  const closeAllWindows = useWindowManager((state) => state.closeAllWindows);
  const resetWindows = useWindowManager((state) => state.resetWindows);
  const { closeWindowAnimated } = useWindowOpenAnimation();
  const setActive = useFileSystem((state) => state.setActive);
  const focusedItem = useFileSystem((state) =>
    focusedFileId ? state.items[focusedFileId] : undefined,
  );
  const cleanUpChildren = useFileSystem((state) => state.cleanUpChildren);
  const resetLayout = useFileSystem((state) => state.resetLayout);
  const {
    canRevealLastDisk,
    isShiftHeld,
    revealLastDiskFromSpecial,
    runSpecialAction,
  } = useEasterEggs();
  const cleanUpTarget =
    focusedItem?.type === "folder"
      ? focusedItem.id
      : (focusedItem?.parentId ?? "root");
  const markFound = useEasterEggProgress((state) => state.markFound);

  useEffect(() => {
    const timerId = window.setInterval(() => setClock(formatClock()), 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const openPortfolioWindow = useCallback(
    (id: string, title: string) => {
      openWindow(id, title, id);
      setActive(id);
    },
    [openWindow, setActive],
  );

  const closeFocusedWindowAnimated = useCallback(() => {
    if (focusedWindowId) closeWindowAnimated(focusedWindowId);
  }, [closeWindowAnimated, focusedWindowId]);

  const tabs: TabData[] = useMemo(
    () => [
      {
        title: "¤",
        submenu: isAppleSpecialMenuActive
          ? [
              {
                title: "Defragment Reality",
                action: () => runSpecialAction("defragment-reality"),
              },
              {
                title: "Increase Creativity",
                action: () => runSpecialAction("increase-creativity"),
              },
              {
                title: "Reboot Universe",
                action: () => runSpecialAction("reboot-universe"),
              },
              {
                title: "Calibrate Inspiration",
                action: () => runSpecialAction("calibrate-inspiration"),
              },
            ]
          : [
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
        mobileHidden: true,
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
        mobileHidden: true,
        submenu: [
          {
            title: "Clean Up Icons",
            action: () => cleanUpChildren(cleanUpTarget),
          },
        ],
      },
      {
        title: "Special",
        mobileHidden: true,
        submenu: [
          {
            title: "Restart Finder",
            action: () => {
              resetLayout();
              resetWindows();
            },
          },
          ...(canRevealLastDisk
            ? [
                null,
                {
                  title: "Reveal Last Disk",
                  action: revealLastDiskFromSpecial,
                },
              ]
            : []),
        ],
      },
    ],
    [
      canRevealLastDisk,
      cleanUpChildren,
      cleanUpTarget,
      closeAllWindows,
      closeFocusedWindowAnimated,
      focusedWindowId,
      hasWindows,
      isAppleSpecialMenuActive,
      openPortfolioWindow,
      revealLastDiskFromSpecial,
      resetLayout,
      resetWindows,
      runSpecialAction,
    ],
  );

  const handleSubmenuItemClick = useCallback((action: () => void) => {
    action();
    setActiveMenuIndex(null);
    setIsMousePressed(false);
    setIsAppleSpecialMenuActive(false);
  }, []);

  const handleMouseOver = useCallback(
    (event: MouseEvent | PointerEvent) => {
      if (!isMousePressed) return;

      const target = event.target as Node;
      const hoveredTabIndex = tabRefs.current.findIndex(
        (tab) => tab && tab.contains(target),
      );

      if (
        hoveredTabIndex !== -1 &&
        hoveredTabIndex !== activeMenuIndex &&
        tabs[hoveredTabIndex].submenu
      ) {
        setIsAppleSpecialMenuActive(hoveredTabIndex === 0 && isShiftHeld);
        setActiveMenuIndex(hoveredTabIndex);
      }
    },
    [isMousePressed, activeMenuIndex, isShiftHeld, tabs],
  );

  const handleGlobalPointerUp = useCallback(
    (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node;
      const clickedOnSubmenu = submenuRef.current?.contains(target);
      const clickedOnTabTitle = tabRefs.current.some((tab) => {
        if (!tab) return false;
        const tabTitle = tab.querySelector(`.${s.tabTitle}`);
        return tabTitle && tabTitle.contains(target);
      });

      if (clickedOnSubmenu) {
        setIsMousePressed(false);
        return;
      }

      if (isTouchLikePointer(event) || isMobilePointerMode()) {
        if (!clickedOnTabTitle) setActiveMenuIndex(null);
      } else {
        setActiveMenuIndex(null);
      }
      setIsMousePressed(false);
      if (!clickedOnSubmenu) setIsAppleSpecialMenuActive(false);
    },
    [],
  );

  useEffect(() => {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("pointermove", handleMouseOver);
    document.addEventListener("mouseup", handleGlobalPointerUp);
    document.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("pointermove", handleMouseOver);
      document.removeEventListener("mouseup", handleGlobalPointerUp);
      document.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [handleMouseOver, handleGlobalPointerUp]);

  useEffect(() => {
    if (activeMenuIndex !== 0) return;

    setIsAppleSpecialMenuActive(isShiftHeld);
  }, [activeMenuIndex, isShiftHeld]);

  useEffect(() => {
    if (isAppleSpecialMenuActive) {
      markFound("special-menu");
    }
  }, [isAppleSpecialMenuActive, markFound]);

  const handlePointerDownOnTab = useCallback(
    (event: ReactPointerEvent, index: number) => {
      event.preventDefault();
      setIsAppleSpecialMenuActive(index === 0 && isShiftHeld);
      if (
        event.pointerType === "touch" ||
        event.pointerType === "pen" ||
        isMobilePointerMode()
      ) {
        setIsMousePressed(false);
        setActiveMenuIndex((currentIndex) =>
          currentIndex === index ? null : index,
        );
        return;
      }

      setIsMousePressed(true);
      setActiveMenuIndex(index);
    },
    [isShiftHeld],
  );

  const setTabRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      tabRefs.current[index] = el;
    },
    [],
  );

  const setSubmenuRef = useCallback((el: HTMLDivElement | null) => {
    submenuRef.current = el;
  }, []);

  return (
    <div className={s.topbar}>
      {tabs.map((tab, index) => (
        <div key={tab.title} className={clsx(s.tab, { [s.mobileHidden]: tab.mobileHidden })} ref={setTabRef(index)}>
          <div
            className={clsx(s.tabTitle, {
              [s.active]: activeMenuIndex === index,
            })}
            onPointerDown={(event) => handlePointerDownOnTab(event, index)}
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
