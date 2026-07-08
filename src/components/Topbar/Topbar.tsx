import clsx from "clsx";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { isMobilePointerMode } from "../../constants/responsive";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowManager } from "../../store/useWindowManager";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import { useEasterEggs } from "../../features/easter-eggs/EasterEggContext";
import { useEasterEggProgress } from "../../features/easter-eggs/useEasterEggProgress";
import { useMenuStore } from "../../store/useMenuStore";
import CheckmarkSvg from "../../assets/icons/checkmark.svg?react";
import s from "./Topbar.module.scss";

interface SubmenuItemData {
  title: string;
  action: () => void;
  disabled?: boolean;
  checked?: boolean;
}

interface TabData {
  title: React.ReactNode;
  submenu?: Array<SubmenuItemData | null>;
  mobileHidden?: boolean;
  isTitleTab?: boolean;
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
      <span className={s.checkmark}>
        {item.checked ? <CheckmarkSvg /> : <span className={s.checkmarkSpacer} />}
      </span>
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
  const windows = useWindowManager((state) => state.windows);
  const windowIds = useWindowManager((state) => state.windowIds);
  const focusWindow = useWindowManager((state) => state.focusWindow);
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

  const customTabs = useMenuStore((state) => state.customTabs);
  const fileMenuOverrides = useMenuStore((state) => state.fileMenuOverrides);
  const editMenuOverrides = useMenuStore((state) => state.editMenuOverrides);

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

  const isDesktopMode = !focusedWindowId;

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
                title: "Icon Painter",
                action: () => openPortfolioWindow("iconPainter", "Icon Painter"),
              },
              {
                title: "Dither Studio",
                action: () => openPortfolioWindow("ditherStudio", "Dither Studio"),
              },
              {
                title: "Model Viewer",
                action: () => openPortfolioWindow("modelViewer", "Model Viewer"),
              },
              {
                title: "Badge Generator",
                action: () =>
                  openPortfolioWindow("badgeGenerator", "Badge Generator"),
              },
              {
                title: "Audio Player",
                action: () => openPortfolioWindow("audioPlayer", "Audio Player"),
              },
              {
                title: "Video Player",
                action: () => openPortfolioWindow("videoPlayer", "Video Player"),
              },
              {
                title: "Space Invaders",
                action: () =>
                  openPortfolioWindow("spaceInvaders", "Space Invaders"),
              },
              {
                title: "Assistant",
                action: () =>
                  openPortfolioWindow("portfolioAssistant", "Assistant"),
              },
            ],
      },
      {
        title: "File",
        mobileHidden: true,
        submenu: fileMenuOverrides
          ? [...fileMenuOverrides]
          : [
              {
                title: "Open About",
                action: () => openPortfolioWindow("about", "About Me"),
              },
              {
                title: "Open Projects",
                action: () => openPortfolioWindow("projects", "Projects"),
              },
              {
                title: "Open Education",
                action: () => openPortfolioWindow("education", "Education"),
              },
              {
                title: "Open Contact",
                action: () => openPortfolioWindow("contact", "Contact"),
              },
            ],
      },
      {
        title: "Edit",
        mobileHidden: true,
        submenu: editMenuOverrides || undefined,
      },
      ...customTabs,
      {
        title: "Window",
        mobileHidden: true,
        submenu: [
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
          ...(windowIds.length > 0
            ? [
                null,
                ...windowIds.map((id) => ({
                  title: windows[id]?.title || "Window",
                  action: () => focusWindow(id),
                  checked: focusedWindowId === id,
                })),
              ]
            : []),
        ],
      },
      {
        title: "Special",
        mobileHidden: true,
        submenu: [
          ...(isDesktopMode
            ? [
                {
                  title: "Restart Finder",
                  action: () => {
                    resetLayout();
                    resetWindows();
                  },
                },
                {
                  title: "Clean Up Icons",
                  action: () => cleanUpChildren(cleanUpTarget),
                },
              ]
            : []),
          ...(canRevealLastDisk
            ? [
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
      isDesktopMode,
      openPortfolioWindow,
      revealLastDiskFromSpecial,
      resetLayout,
      resetWindows,
      runSpecialAction,
      fileMenuOverrides,
      editMenuOverrides,
      customTabs,
      windowIds,
      windows,
      focusWindow,
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
      {tabs.map((tab, index) => {
        const submenu = tab.submenu;
        if (!submenu) return null;
        const hasSubmenu = submenu.length > 0;
        if (!hasSubmenu) return null;

        return (
          <div
            key={index}
            className={clsx(s.tab, { [s.mobileHidden]: tab.mobileHidden })}
            ref={setTabRef(index)}
          >
            <div
              className={clsx(s.tabTitle, {
                [s.active]: activeMenuIndex === index && !tab.isTitleTab,
                [s.titleTab]: tab.isTitleTab,
              })}
              onPointerDown={(event) => {
                if (tab.isTitleTab) return;
                handlePointerDownOnTab(event, index);
              }}
            >
              {tab.title}
            </div>
            {hasSubmenu && activeMenuIndex === index && (
              <Submenu
                items={submenu}
                onItemClick={handleSubmenuItemClick}
                setRef={setSubmenuRef}
              />
            )}
          </div>
        );
      })}
      <div className={s.clock}>{clock}</div>
    </div>
  );
}
