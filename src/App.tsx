import { useEffect, useState, lazy, Suspense } from "react";
import Loader from "./components/Loader/Loader";
import { FINE_POINTER_QUERY } from "./constants/responsive";
import { useWindowManager } from "./store/useWindowManager";
import { ROUTE_METADATA, getItemPathFromId } from "./utils/routing";

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

  const focusedWindowId = useWindowManager((state) => state.focusedWindowId);

  const isTestRoute = window.location.pathname.startsWith("/test");
  const isBadgeRoute = window.location.pathname.startsWith("/badge");
  const isStandaloneRoute = isBadgeRoute || isTestRoute;



  useEffect(() => {
    if (isStandaloneRoute) return;

    const path = focusedWindowId ? getItemPathFromId(focusedWindowId) : "";
    const meta = ROUTE_METADATA[path] || ROUTE_METADATA[""];
    const siteUrl = import.meta.env.VITE_SITE_URL || "https://ib1zza.com";
    const routePath = path ? `${path}/` : "";

    // 1. Title
    document.title = meta.title;

    // 2. Meta description
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);

    // 3. Canonical link
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${siteUrl}/${routePath}`);

    // 4. Open Graph Meta Tags
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", `${siteUrl}/${routePath}`);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.ogTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.description);

    // 5. Twitter Meta Tags
    document.querySelector('meta[property="twitter:url"]')?.setAttribute("content", `${siteUrl}/${routePath}`);
    document.querySelector('meta[property="twitter:title"]')?.setAttribute("content", meta.ogTitle);
    document.querySelector('meta[property="twitter:description"]')?.setAttribute("content", meta.description);
  }, [focusedWindowId, isStandaloneRoute]);

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

  useEffect(() => {
    if (isStandaloneRoute || isLoaderVisible) return;

    const timeoutIds: number[] = [];

    const prefetchRemaining = async () => {
      try {
        const [
          { preloadedWindowContainer },
          { preloadedApps },
          { preloadedDocs },
          { preloadedEasterEggs },
        ] = await Promise.all([
          import("./components/Desktop"),
          import("./components/Window/WindowAppContent"),
          import("./components/Window/WindowDocumentContent"),
          import("./features/easter-eggs/EasterEggProvider"),
        ]);

        const preloadedComponents = [
          preloadedWindowContainer,
          ...Object.values(preloadedApps),
          ...Object.values(preloadedDocs),
          ...Object.values(preloadedEasterEggs),
        ];

        preloadedComponents.forEach((preloaded, index) => {
          const id = window.setTimeout(() => {
            preloaded.preload().catch(() => {});
          }, index * 50);
          timeoutIds.push(id);
        });
      } catch (err) {
        console.error("Prefetch failed:", err);
      }
    };

    const idleCallback =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).requestIdleCallback ||
      ((cb: () => void) => window.setTimeout(cb, 1000));

    idleCallback(() => {
      void prefetchRemaining();

      if ("fonts" in document) {
        document.fonts.load("12px Monaco").catch((err) => {
          console.error("Failed to preload Monaco font:", err);
        });
      }
    });

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [isLoaderVisible, isStandaloneRoute]);



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
