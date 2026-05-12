import { useEffect, useState, lazy, Suspense } from "react";
import Loader from "./components/Loader/Loader";
import { BadgeSharePage } from "./components/BadgeSharePage";

const LazyDesktop = lazy(() => import("./components/Desktop"));
const LazyCursor = lazy(() => import("./components/CustomCursor"));

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isCustomCursorEnabled, setIsCustomCursorEnabled] = useState(false);
  const isBadgeRoute = window.location.pathname.startsWith("/badge");
  // TODO: make 2000
  const MIN_LOADER_DURATION_MS = 2000;

  useEffect(() => {
    document.body.classList.toggle("native-cursor", isBadgeRoute);

    if (isBadgeRoute) {
      document.body.style.cursor = "default";
      setIsCustomCursorEnabled(false);

      return () => {
        document.body.classList.remove("native-cursor");
        document.body.style.cursor = "default";
      };
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncCursorMode = () => {
      setIsCustomCursorEnabled(mediaQuery.matches);
      document.body.style.cursor = mediaQuery.matches ? "none" : "default";
    };

    syncCursorMode();
    mediaQuery.addEventListener("change", syncCursorMode);

    const minDelay = new Promise((res) =>
      setTimeout(res, MIN_LOADER_DURATION_MS),
    );

    const loadLazyComponents = Promise.all([
      import("./components/Desktop"),
      import("./components/CustomCursor"),
    ]);

    // Ожидаем и загрузку компонентов, и минимум 2 секунды
    Promise.all([minDelay, loadLazyComponents]).then(() => {
      setIsAppReady(true);
    });

    return () => {
      mediaQuery.removeEventListener("change", syncCursorMode);
      document.body.classList.remove("native-cursor");
      document.body.style.cursor = "default";
    };
  }, [isBadgeRoute]);

  if (isBadgeRoute) {
    return <BadgeSharePage />;
  }

  if (!isAppReady) {
    return <Loader minDurationMs={MIN_LOADER_DURATION_MS} />;
  }

  return (
    <div className="App">
      <div className="main-wrapper">
        <Suspense fallback={null}>
          <LazyDesktop />
          {isCustomCursorEnabled && <LazyCursor />}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
