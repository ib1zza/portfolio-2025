import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getAppWindowSize,
  getDocumentNoteWindowSize,
} from "../../constants/windowLayout";
import { useHaptics } from "../../hooks/useHaptics";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowOpenAnimation } from "../../components/WindowOpenAnimation";
import { EASTER_EGG_LOG_FILE_ID } from "./easterEggDefinitions";
import { useEasterEggProgress } from "./useEasterEggProgress";
import {
  EasterEggContext,
  type SpecialAction,
} from "./EasterEggContext";

const SpecialActionDialogHost = lazy(() =>
  import("./components/SpecialActionDialogHost").then((module) => ({
    default: module.SpecialActionDialogHost,
  })),
);

const SystemCrashOverlay = lazy(() =>
  import("./components/SystemCrashOverlay").then((module) => ({
    default: module.SystemCrashOverlay,
  })),
);

const EASTER_EGGS_ENABLED = true;
const HYPERCARD_SEQUENCE = "HYPERCARD";
const HYPERCARD_KEY_TIMEOUT_MS = 1600;
const TIME_MACHINE_CLICK_WINDOW_MS = 4000;
const TIME_MACHINE_REQUIRED_CLICKS = 5;
const TRASH_CLICK_WINDOW_MS = 4000;
const TRASH_REQUIRED_CLICKS = 5;

const TIME_MACHINE_HD_ID = "timeMachineHd";
const TIME_MACHINE_LAST_DISK_ID = "tmLastDisk";
const HYPERCARD_STACK_ID = "hypercardStack";

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

const reduceHyperCardSequence = (current: string, nextKey: string) => {
  let candidate = `${current}${nextKey}`;

  while (candidate && !HYPERCARD_SEQUENCE.startsWith(candidate)) {
    candidate = candidate.slice(1);
  }

  return candidate;
};

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const { openWindowAnimated } = useWindowOpenAnimation();
  const setActive = useFileSystem((state) => state.setActive);
  const markFound = useEasterEggProgress((state) => state.markFound);
  const foundEggCount = useEasterEggProgress(
    (state) => state.foundEggIds.length,
  );
  const foundEggIds = useEasterEggProgress(
    (state) => state.foundEggIds,
  );
  const isTimeMachineVisible = useFileSystem((state) => {
    const root = state.items.root;
    return root?.type === "folder" && root.children.includes(TIME_MACHINE_HD_ID);
  });
  const isLastDiskRevealed = useFileSystem((state) => {
    const disk = state.items[TIME_MACHINE_HD_ID];
    return (
      disk?.type === "system" && disk.children.includes(TIME_MACHINE_LAST_DISK_ID)
    );
  });
  const haptics = useHaptics({ throttleMs: 80 });
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const [hasOpenedTimeMachineHd, setHasOpenedTimeMachineHd] = useState(false);
  const [activeSpecialAction, setActiveSpecialAction] =
    useState<SpecialAction | null>(null);
  const [systemCrash, setSystemCrash] = useState<{ sourceRect?: DOMRect } | null>(
    null,
  );
  const hyperCardSequenceRef = useRef("");
  const lastHyperCardKeyAtRef = useRef(0);
  const timeMachineClicksRef = useRef<number[]>([]);
  const trashClicksRef = useRef<number[]>([]);
  const canRevealLastDisk =
    isTimeMachineVisible && hasOpenedTimeMachineHd && !isLastDiskRevealed;

  const revealEasterEggLog = useCallback(() => {
    useFileSystem.getState().addExtraRootItem(EASTER_EGG_LOG_FILE_ID);
  }, []);

  const revealTimeMachineHd = useCallback(() => {
    useFileSystem.getState().addExtraRootItem(TIME_MACHINE_HD_ID);
    markFound("time-machine-hd");
    void haptics.easterEgg("finderClick");
  }, [haptics, markFound]);

  useEffect(() => {
    if (foundEggCount > 0) {
      revealEasterEggLog();
    }
    if (foundEggIds.includes("time-machine-hd")) {
      revealTimeMachineHd();
    }
  }, [foundEggCount, foundEggIds, revealEasterEggLog, revealTimeMachineHd]);

  useEffect(() => {
    if (isTimeMachineVisible) {
      markFound("time-machine-hd");
    }
  }, [isTimeMachineVisible, markFound]);

  useEffect(() => {
    if (isLastDiskRevealed) {
      markFound("last-disk");
    }
  }, [isLastDiskRevealed, markFound]);

  const revealLastDisk = useCallback(() => {
    useFileSystem.setState((state) => {
      const disk = state.items[TIME_MACHINE_HD_ID];

      if (
        disk?.type !== "system" ||
        disk.children.includes(TIME_MACHINE_LAST_DISK_ID)
      ) {
        return state;
      }

      return {
        items: {
          ...state.items,
          [TIME_MACHINE_HD_ID]: {
            ...disk,
            children: [...disk.children, TIME_MACHINE_LAST_DISK_ID],
          },
        },
      };
    });
  }, []);

  const revealLastDiskFromSpecial = useCallback(() => {
    if (!canRevealLastDisk) return;

    markFound("last-disk");
    revealLastDisk();
    setActive(TIME_MACHINE_LAST_DISK_ID);
    openWindowAnimated({
      id: TIME_MACHINE_LAST_DISK_ID,
      title: "LAST_DISK.img",
      parentId: TIME_MACHINE_LAST_DISK_ID,
      preferredSize: getDocumentNoteWindowSize(),
      windowOptions: {
        resizable: false,
        windowVariant: "note",
      },
    });
  }, [
    canRevealLastDisk,
    markFound,
    openWindowAnimated,
    revealLastDisk,
    setActive,
  ]);

  const openHyperCardStack = useCallback(() => {
    markFound("hypercard-stack");
    setActive(HYPERCARD_STACK_ID);
    openWindowAnimated({
      id: HYPERCARD_STACK_ID,
      title: "HyperCard Stack",
      parentId: HYPERCARD_STACK_ID,
      preferredSize: getAppWindowSize("hypercard-stack"),
      windowOptions: {
        resizable: false,
        windowVariant: "hypercard",
      },
    });
  }, [markFound, openWindowAnimated, setActive]);

  useEffect(() => {
    if (!EASTER_EGGS_ENABLED) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      setIsShiftHeld(event.shiftKey);

      // Trigger: type H Y P E R C A R D while not editing text.
      if (
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toUpperCase() : "";
      if (!/^[A-Z]$/.test(key)) return;

      const now = Date.now();
      const previous =
        now - lastHyperCardKeyAtRef.current > HYPERCARD_KEY_TIMEOUT_MS
          ? ""
          : hyperCardSequenceRef.current;
      const nextSequence = reduceHyperCardSequence(previous, key);

      lastHyperCardKeyAtRef.current = now;
      hyperCardSequenceRef.current = nextSequence;

      if (nextSequence === HYPERCARD_SEQUENCE) {
        hyperCardSequenceRef.current = "";
        openHyperCardStack();
      }
    };

    const syncShiftState = (event: KeyboardEvent) => {
      setIsShiftHeld(event.shiftKey);
    };

    const resetShiftState = () => {
      setIsShiftHeld(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", syncShiftState);
    window.addEventListener("blur", resetShiftState);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", syncShiftState);
      window.removeEventListener("blur", resetShiftState);
    };
  }, [openHyperCardStack]);

  const recordDesktopBackgroundClick = useCallback(
    (event: { altKey: boolean }) => {
      if (!EASTER_EGGS_ENABLED || !event.altKey) return;

      const now = Date.now();
      timeMachineClicksRef.current = [
        ...timeMachineClicksRef.current.filter(
          (timestamp) => now - timestamp <= TIME_MACHINE_CLICK_WINDOW_MS,
        ),
        now,
      ];

      // Trigger: hold Option and click empty desktop background five times in four seconds.
      if (timeMachineClicksRef.current.length >= TIME_MACHINE_REQUIRED_CLICKS) {
        timeMachineClicksRef.current = [];
        revealTimeMachineHd();
      }
    },
    [revealTimeMachineHd],
  );

  const recordItemOpenRequest = useCallback(
    (itemId: string) => {
      if (!EASTER_EGGS_ENABLED) return;

      if (itemId === TIME_MACHINE_HD_ID) setHasOpenedTimeMachineHd(true);
    },
    [],
  );

  const recordTrashClick = useCallback(
    (sourceRect?: DOMRect) => {
      if (!EASTER_EGGS_ENABLED || systemCrash) return;

      const now = Date.now();
      trashClicksRef.current = [
        ...trashClicksRef.current.filter(
          (timestamp) => now - timestamp <= TRASH_CLICK_WINDOW_MS,
        ),
        now,
      ];

      // Trigger: click the Trash icon five times in a short Finder rhythm.
      if (trashClicksRef.current.length >= TRASH_REQUIRED_CLICKS) {
        trashClicksRef.current = [];
        markFound("trash-bomb");
        setSystemCrash({ sourceRect });
        void haptics.easterEgg("finderClick");
      }
    },
    [haptics, markFound, systemCrash],
  );

  const clearSystemCrash = useCallback(() => {
    setSystemCrash(null);
  }, []);

  const runSpecialAction = useCallback((action: SpecialAction) => {
    if (!EASTER_EGGS_ENABLED) return;
    setActiveSpecialAction(action);
  }, []);

  const value = useMemo(
    () => ({
      canRevealLastDisk,
      isShiftHeld,
      recordDesktopBackgroundClick,
      recordItemOpenRequest,
      recordTrashClick,
      revealLastDiskFromSpecial,
      runSpecialAction,
    }),
    [
      canRevealLastDisk,
      isShiftHeld,
      recordDesktopBackgroundClick,
      recordItemOpenRequest,
      recordTrashClick,
      revealLastDiskFromSpecial,
      runSpecialAction,
    ],
  );

  return (
    <EasterEggContext.Provider value={value}>
      {children}
      {activeSpecialAction && (
        <Suspense fallback={null}>
          <SpecialActionDialogHost
            action={activeSpecialAction}
            onClose={() => setActiveSpecialAction(null)}
          />
        </Suspense>
      )}
      {systemCrash && (
        <Suspense fallback={null}>
          <SystemCrashOverlay
            sourceRect={systemCrash.sourceRect}
            onDismiss={clearSystemCrash}
          />
        </Suspense>
      )}
    </EasterEggContext.Provider>
  );
}
