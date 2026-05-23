// src/hooks/useHaptics.ts
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

type HapticEasterEgg =
  | "happyMac"
  | "sadMac"
  | "startupChime"
  | "finderClick"
  | "systemError";

interface UseHapticsOptions {
  /**
   * Запустить haptic при монтировании хука.
   * Удобно для "сайт загрузился".
   */
  playOnMount?: boolean;

  /**
   * Небольшая задержка перед стартовой вибрацией,
   * чтобы она не сработала слишком рано во время hydration/loading.
   */
  startupDelayMs?: number;

  /**
   * Отключить haptics полностью.
   */
  disabled?: boolean;

  /**
   * Минимальная пауза между одиночными haptic-событиями.
   */
  throttleMs?: number;

  /**
   * Использовать navigator.vibrate как fallback в браузере.
   */
  enableBrowserFallback?: boolean;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const canUseBrowserVibrate = () =>
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  "vibrate" in navigator &&
  typeof navigator.vibrate === "function";

export const useHaptics = (options: UseHapticsOptions = {}) => {
  const {
    playOnMount = false,
    startupDelayMs = 450,
    disabled = false,
    throttleMs = 80,
    enableBrowserFallback = true,
  } = options;

  const lastPlayedAtRef = useRef(0);
  const sequencePlayingRef = useRef(false);

  const isAllowed = useCallback(() => {
    if (disabled) return false;
    if (typeof window === "undefined") return false;

    const now = Date.now();

    if (now - lastPlayedAtRef.current < throttleMs) {
      return false;
    }

    lastPlayedAtRef.current = now;
    return true;
  }, [disabled, throttleMs]);

  const vibrateFallback = useCallback(
    (pattern: number | number[] = 24) => {
      if (!enableBrowserFallback) return;

      if (canUseBrowserVibrate()) {
        navigator.vibrate(pattern);
      }
    },
    [enableBrowserFallback],
  );

  const safeImpact = useCallback(
    async (style: ImpactStyle = ImpactStyle.Light) => {
      if (!isAllowed()) return;

      try {
        await Haptics.impact({ style });
      } catch {
        vibrateFallback(
          style === ImpactStyle.Heavy
            ? 45
            : style === ImpactStyle.Medium
              ? 32
              : 18,
        );
      }
    },
    [isAllowed, vibrateFallback],
  );

  const safeNotification = useCallback(
    async (type: NotificationType = NotificationType.Success) => {
      if (!isAllowed()) return;

      try {
        await Haptics.notification({ type });
      } catch {
        vibrateFallback(
          type === NotificationType.Success
            ? [18, 35, 28]
            : type === NotificationType.Warning
              ? [24, 45, 24]
              : [45, 35, 45],
        );
      }
    },
    [isAllowed, vibrateFallback],
  );

  const safeSelectionStart = useCallback(async () => {
    if (!isAllowed()) return;

    try {
      await Haptics.selectionStart();
    } catch {
      vibrateFallback(10);
    }
  }, [isAllowed, vibrateFallback]);

  const safeSelectionChanged = useCallback(async () => {
    if (!isAllowed()) return;

    try {
      await Haptics.selectionChanged();
    } catch {
      vibrateFallback(8);
    }
  }, [isAllowed, vibrateFallback]);

  const safeSelectionEnd = useCallback(async () => {
    if (!isAllowed()) return;

    try {
      await Haptics.selectionEnd();
    } catch {
      vibrateFallback(10);
    }
  }, [isAllowed, vibrateFallback]);

  const playSequence = useCallback(
    async (steps: Array<() => Promise<void> | void>, gapMs = 70) => {
      if (disabled || sequencePlayingRef.current) return;

      sequencePlayingRef.current = true;

      try {
        for (const step of steps) {
          await step();
          await wait(gapMs);
        }
      } finally {
        sequencePlayingRef.current = false;
      }
    },
    [disabled],
  );

  /**
   * 1. Вибрация при открытии сайта / завершении загрузки.
   * Мягкий "загрузился Finder".
   */
  const siteLoaded = useCallback(async () => {
    await playSequence(
      [
        () => safeImpact(ImpactStyle.Light),
        () => safeNotification(NotificationType.Success),
      ],
      120,
    );
  }, [playSequence, safeImpact, safeNotification]);

  /**
   * 2. Открытие файла.
   */
  const fileOpen = useCallback(async () => {
    await safeImpact(ImpactStyle.Light);
  }, [safeImpact]);

  /**
   * 2. Закрытие файла.
   */
  const fileClose = useCallback(async () => {
    await safeSelectionChanged();
  }, [safeSelectionChanged]);

  /**
   * 2. Открытие папки.
   * Чуть плотнее, чем файл.
   */
  const folderOpen = useCallback(async () => {
    await playSequence(
      [
        () => safeSelectionStart(),
        () => safeImpact(ImpactStyle.Light),
        () => safeSelectionEnd(),
      ],
      45,
    );
  }, [playSequence, safeImpact, safeSelectionEnd, safeSelectionStart]);

  /**
   * 2. Закрытие папки.
   */
  const folderClose = useCallback(async () => {
    await playSequence(
      [() => safeSelectionChanged(), () => safeImpact(ImpactStyle.Light)],
      50,
    );
  }, [playSequence, safeImpact, safeSelectionChanged]);

  /**
   * Для клика по desktop icon, menu item, button.
   */
  const uiClick = useCallback(async () => {
    await safeSelectionChanged();
  }, [safeSelectionChanged]);

  /**
   * Для drag start / drop.
   */
  const dragStart = useCallback(async () => {
    await safeSelectionStart();
  }, [safeSelectionStart]);

  const dragEnd = useCallback(async () => {
    await safeSelectionEnd();
  }, [safeSelectionEnd]);

  /**
   * 3. Пасхалки.
   *
   * happyMac — мягкий happy boot.
   * startupChime — попытка передать "Mac startup chime" как тактильный аккорд.
   * sadMac — ошибка / Sad Mac.
   * finderClick — ретро Finder double click.
   * systemError — более драматичная "system bomb" вибрация.
   */
  const easterEgg = useCallback(
    async (type: HapticEasterEgg = "happyMac") => {
      if (type === "happyMac") {
        await playSequence(
          [
            () => safeImpact(ImpactStyle.Light),
            () => safeImpact(ImpactStyle.Medium),
            () => safeNotification(NotificationType.Success),
          ],
          95,
        );
        return;
      }

      if (type === "startupChime") {
        await playSequence(
          [
            () => safeImpact(ImpactStyle.Light),
            () => safeImpact(ImpactStyle.Light),
            () => safeImpact(ImpactStyle.Medium),
            () => safeImpact(ImpactStyle.Heavy),
            () => safeNotification(NotificationType.Success),
          ],
          115,
        );
        return;
      }

      if (type === "sadMac") {
        await playSequence(
          [
            () => safeImpact(ImpactStyle.Heavy),
            () => safeImpact(ImpactStyle.Medium),
            () => safeImpact(ImpactStyle.Light),
            () => safeNotification(NotificationType.Error),
          ],
          140,
        );
        return;
      }

      if (type === "finderClick") {
        await playSequence(
          [
            () => safeSelectionChanged(),
            () => safeSelectionChanged(),
            () => safeImpact(ImpactStyle.Light),
          ],
          55,
        );
        return;
      }

      if (type === "systemError") {
        await playSequence(
          [
            () => safeNotification(NotificationType.Warning),
            () => safeImpact(ImpactStyle.Heavy),
            () => safeImpact(ImpactStyle.Heavy),
            () => safeNotification(NotificationType.Error),
          ],
          130,
        );
      }
    },
    [playSequence, safeImpact, safeNotification, safeSelectionChanged],
  );

  useEffect(() => {
    if (!playOnMount || disabled) return;

    const timeoutId = window.setTimeout(() => {
      void siteLoaded();
    }, startupDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [disabled, playOnMount, siteLoaded, startupDelayMs]);

  return useMemo(
    () => ({
      siteLoaded,

      fileOpen,
      fileClose,

      folderOpen,
      folderClose,

      uiClick,
      dragStart,
      dragEnd,

      easterEgg,

      impactLight: () => safeImpact(ImpactStyle.Light),
      impactMedium: () => safeImpact(ImpactStyle.Medium),
      impactHeavy: () => safeImpact(ImpactStyle.Heavy),

      success: () => safeNotification(NotificationType.Success),
      warning: () => safeNotification(NotificationType.Warning),
      error: () => safeNotification(NotificationType.Error),
    }),
    [
      siteLoaded,
      fileOpen,
      fileClose,
      folderOpen,
      folderClose,
      uiClick,
      dragStart,
      dragEnd,
      easterEgg,
      safeImpact,
      safeNotification,
    ],
  );
};
