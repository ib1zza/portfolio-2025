import { useEffect, useState, lazy, Suspense } from "react";
import Loader from "./components/Loader/Loader";

const LazyDesktop = lazy(() => import("./components/Desktop"));
const LazyCursor = lazy(() => import("./components/CustomCursor"));

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  // TODO: make 2000
  const MIN_LOADER_DURATION_MS = 2000;

  useEffect(() => {
    document.body.style.cursor = "none";

    const minDelay = new Promise((res) =>
      setTimeout(res, MIN_LOADER_DURATION_MS)
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
      document.body.style.cursor = "default";
    };
  }, []);

  if (!isAppReady) {
    return <Loader minDurationMs={MIN_LOADER_DURATION_MS} />;
  }

  return (
    <div className="App">
      <div className="main-wrapper">
        <Suspense fallback={null}>
          <LazyDesktop />
          <LazyCursor />
        </Suspense>
      </div>
    </div>
  );
}

export default App;
