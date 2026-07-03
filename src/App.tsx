import { useEffect, useState, lazy, Suspense } from "react";
import Loader from "./components/Loader/Loader";
import { FINE_POINTER_QUERY } from "./constants/responsive";

const LazyDesktop = lazy(() => import("./components/Desktop"));
const LazyCursor = lazy(() => import("./components/CustomCursor"));
const LazyBadgeSharePage = lazy(() =>
  import("./components/BadgeSharePage").then((m) => ({
    default: m.BadgeSharePage,
  })),
);
const LazyHapticsTester = lazy(() =>
  import("./components/HapticsTester/HapticsTester").then((m) => ({
    default: m.HapticsTester,
  })),
);
const MIN_LOADER_DURATION_MS = import.meta.env.DEV ? 0 : 3000;
const LOADER_AFTER_CONTENT_READY_MS = 100;

function App() {
  const [isContentReady, setIsContentReady] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isCustomCursorEnabled, setIsCustomCursorEnabled] = useState(false);

  const isTestRoute = window.location.pathname.startsWith("/test");
  const isBadgeRoute = window.location.pathname.startsWith("/badge");
  const isStandaloneRoute = isBadgeRoute || isTestRoute;

  useEffect(() => {
    document.body.classList.toggle("native-cursor", isStandaloneRoute);

    if (isStandaloneRoute) {
      document.body.style.cursor = "default";
      setIsCustomCursorEnabled(false);
      setIsContentReady(true);
      setIsLoaderVisible(false);

      return () => {
        document.body.classList.remove("native-cursor");
        document.body.style.cursor = "default";
      };
    }

    let isCancelled = false;
    let revealTimer: number | undefined;

    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);

    const syncCursorMode = () => {
      setIsCustomCursorEnabled(mediaQuery.matches);
      document.body.style.cursor = mediaQuery.matches ? "none" : "default";
    };

    syncCursorMode();
    mediaQuery.addEventListener("change", syncCursorMode);

    const minDelay = new Promise((resolve) => {
      window.setTimeout(resolve, MIN_LOADER_DURATION_MS);
    });

    const loadLazyComponents = Promise.all([
      import("./components/Desktop"),
      import("./components/CustomCursor"),
    ]);

    Promise.all([minDelay, loadLazyComponents]).then(() => {
      if (isCancelled) return;

      // 1. Сначала монтируем основной контент под лоадером
      setIsContentReady(true);

      // 2. Даём браузеру хотя бы один кадр на первый рендер
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isCancelled) return;

          // 3. Лоадер ещё немного лежит поверх уже смонтированного контента
          revealTimer = window.setTimeout(() => {
            if (isCancelled) return;
            setIsLoaderVisible(false);
          }, LOADER_AFTER_CONTENT_READY_MS);
        });
      });
    });

    return () => {
      isCancelled = true;

      if (revealTimer) {
        window.clearTimeout(revealTimer);
      }

      mediaQuery.removeEventListener("change", syncCursorMode);
      document.body.classList.remove("native-cursor");
      document.body.style.cursor = "default";
    };
  }, [isStandaloneRoute]);

  if (isTestRoute) {
    return (
      <Suspense fallback={null}>
        <LazyHapticsTester />
      </Suspense>
    );
  }
  if (isBadgeRoute) {
    return (
      <Suspense fallback={null}>
        <LazyBadgeSharePage />
      </Suspense>
    );
  }

  return (
    <>
      {isContentReady && (
        <div className="App">
          <div className="main-wrapper">
            <Suspense fallback={null}>
              <LazyDesktop />
              {isCustomCursorEnabled && <LazyCursor />}
            </Suspense>
          </div>
        </div>
      )}

      {isLoaderVisible && <Loader />}
    </>
  );
}

export default App;
