import { useEffect, useState } from "react";

export function useScale(baseWidth = 800, baseHeight = 600) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScale(Math.min(width / baseWidth, height / baseHeight));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [baseWidth, baseHeight]);

  return scale;
}
