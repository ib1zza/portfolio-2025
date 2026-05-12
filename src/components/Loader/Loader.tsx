import React, { useEffect, useState } from "react";
import s from "./Loader.module.scss";

// SVG иконка, которую вы предоставили
const LoadingIcon = () => (
  <svg
    className={s.helloSketchIcon}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M26 1H5V2H4V27H5V31H26V27H27V2H26V1Z" fill="white" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26 0H5V1H4V2H3V27H4V32H27V27H28V2H27V1H26V0ZM26 1V2H27V27H4V2H5V1H26ZM26 31H5V28H26V31Z"
      fill="black"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 3H7V4H6V17H7V18H24V17H25V4H24V3ZM24 4V17H7V4H24Z"
      fill="black"
    />
    <path d="M13 13H12V14H13V15H17V14H18V13H17V14H13V13Z" fill="black" />
    <path d="M16 7H15V11H14V12H16V7Z" fill="black" />
    <rect x="19" y="7" width="1" height="2" fill="black" />
    <rect x="11" y="7" width="1" height="2" fill="black" />
    <rect x="6" y="22" width="2" height="1" fill="black" />
    <rect x="18.5" y="22" width="6" height="1" fill="black" />
  </svg>
);

const HELLO_PIXELS = [
  [7, 11],
  [8, 11],
  [17, 11],
  [18, 11],
  [21, 11],
  [22, 11],
  [6, 12],
  [8, 12],
  [17, 12],
  [19, 12],
  [21, 12],
  [23, 12],
  [6, 13],
  [8, 13],
  [16, 13],
  [18, 13],
  [20, 13],
  [22, 13],
  [6, 14],
  [7, 14],
  [8, 14],
  [16, 14],
  [18, 14],
  [20, 14],
  [22, 14],
  [6, 15],
  [7, 15],
  [12, 15],
  [13, 15],
  [16, 15],
  [18, 15],
  [20, 15],
  [22, 15],
  [25, 15],
  [26, 15],
  [27, 15],
  [29, 15],
  [5, 16],
  [6, 16],
  [7, 16],
  [8, 16],
  [11, 16],
  [13, 16],
  [14, 16],
  [16, 16],
  [17, 16],
  [20, 16],
  [21, 16],
  [24, 16],
  [25, 16],
  [27, 16],
  [28, 16],
  [5, 17],
  [6, 17],
  [8, 17],
  [11, 17],
  [12, 17],
  [13, 17],
  [16, 17],
  [17, 17],
  [20, 17],
  [21, 17],
  [24, 17],
  [28, 17],
  [4, 18],
  [6, 18],
  [8, 18],
  [9, 18],
  [11, 18],
  [12, 18],
  [15, 18],
  [16, 18],
  [17, 18],
  [19, 18],
  [20, 18],
  [21, 18],
  [23, 18],
  [24, 18],
  [25, 18],
  [27, 18],
  [28, 18],
  [4, 19],
  [6, 19],
  [9, 19],
  [10, 19],
  [12, 19],
  [13, 19],
  [14, 19],
  [17, 19],
  [18, 19],
  [19, 19],
  [21, 19],
  [22, 19],
  [23, 19],
  [25, 19],
  [26, 19],
  [27, 19],
];

const IbizzaLogo = () => (
  <svg
    className={s.ibizzaLogo}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(11 11)">
      <path
        d="M4 0H5V4H8V4.5V5H5V7H6V6H7V5H8V4.5V4H9V4.5V5H8V6H7V7H6V8H5V9H4V5H0V4H4V2H3V3H2V2H3V1H4V0Z"
        fill="black"
      />
    </g>
  </svg>
);

const HelloSketch = () => {
  return (
    <svg
      className={s.helloSketch}
      width="512"
      height="512"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect width="32" height="32" fill="white" />
      {HELLO_PIXELS.map(([x, y], index) => (
        <rect
          key={`${x}-${y}-${index}`}
          className={s.helloSketchPixel}
          x={x}
          y={y}
          width="1"
          height="1"
          fill="black"
          style={{ animationDelay: `${(x + y) * 8}ms` }}
        />
      ))}
    </svg>
  );
};

interface LoaderProps {
  minDurationMs?: number; // Минимальная продолжительность показа прелоадера в миллисекундах
}

const Loader: React.FC<LoaderProps> = ({ minDurationMs = 2000 }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Устанавливаем таймер для минимальной продолжительности прелоадера
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, minDurationMs);

    return () => clearTimeout(timer); // Очищаем таймер при размонтировании
  }, [minDurationMs]);

  // Если showLoader все еще true, или если у Suspense еще не готов контент,
  // мы всегда покажем этот Loader.
  // Фактическое скрытие произойдет, когда Suspense "готов"
  // и minDurationMs истекла.
  if (!showLoader) return null; // Этот return не будет работать, пока Suspense не готов

  return (
    <div className={s.loaderOverlay}>
      <div className={s.loaderContent}>
        <IbizzaLogo />
        <LoadingIcon />
        <HelloSketch />
      </div>
    </div>
  );
};

export default Loader;
