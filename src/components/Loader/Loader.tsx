import React, { useEffect, useMemo, useState } from "react";
import s from "./Loader.module.scss";

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

type Pixel = readonly [number, number];

const HELLO_STROKES: Pixel[] = [
  [4, 19],
  [4, 18],

  [5, 17],
  [5, 16],
  [6, 15],
  [7, 14],
  [8, 14],
  [8, 13],
  [8, 12],
  [8, 11],
  [7, 11],

  // h — верхняя петля / восходящий штрих
  [6, 12],
  [6, 13],
  [6, 14],
  [6, 16],
  [6, 17],
  [6, 18],
  [6, 19],

  // h — спуск вниз
  [7, 15],
  [7, 16],
  [8, 16],

  // [8, 16],
  [7, 16],
  [7, 15],

  // h — правая ножка / выход в соединение с e
  [8, 17],
  [8, 18],
  [9, 18],
  [9, 19],
  [10, 19],

  // e — входной штрих и верх петли
  [11, 18],
  [12, 17],
  [13, 17],
  [13, 16],
  [14, 16],
  [13, 15],

  [12, 15],
  [11, 16],

  // e — середина петли
  [11, 17],

  // e — нижняя дуга / выход в первую l
  [12, 18],
  [12, 19],
  [13, 19],
  [14, 19],

  // первая l — верхняя петля
  [15, 18],
  [16, 17],
  [17, 16],
  [18, 15],
  [18, 14],
  [18, 13],
  [19, 12],
  [18, 11],
  [17, 11],
  [17, 12],
  [16, 13],

  // первая l — вертикальный штрих вниз
  [16, 14],
  [16, 15],
  [16, 16],
  [17, 17],

  // первая l — нижний выходной штрих
  [16, 18],
  [17, 18],
  [17, 19],
  [18, 19],
  [19, 19],

  [19, 18],

  // вторая l — верхняя петля
  [20, 17],
  [21, 16],
  [22, 15],
  [22, 14],
  [22, 13],
  [23, 12],
  [22, 11],

  [21, 11],
  [21, 12],
  [20, 13],

  // вторая l — вертикальный штрих вниз
  [20, 14],
  [20, 15],
  [20, 16],
  [21, 17],

  // вторая l — нижний выходной штрих к o
  [20, 18],
  [21, 18],
  [21, 19],
  [22, 19],
  [23, 19],

  // o — верхняя дуга
  [23, 18],
  [24, 17],
  [24, 16],
  [25, 16],

  [25, 15],
  [26, 15],
  [27, 15],

  // o — правая и левая стороны
  [27, 16],
  [28, 16],
  [28, 17],
  [28, 18],
  [27, 18],
  [27, 19],
  [26, 19],
  [25, 19],
  [25, 18],
  [24, 18],

  // o — нижняя дуга и завершение росчерка
];

const IBIZZA_LOGO_STROKES: Pixel[] = [
  // левая верхняя штука — поднимаемся по диагонали к верху
  [2, 2],
  [3, 1],
  [4, 0],

  // центральная вертикаль — сверху вниз
  [4, 1],
  [4, 2],
  [4, 3],
  [4, 4],
  [4, 5],
  [4, 6],
  [4, 7],
  [4, 8],

  // правая диагональ — из нижней части вправо-вверх
  [5, 7],
  [6, 6],
  [7, 5],
  [8, 4],

  // горизонталь — справа налево до упора
  [7, 4],
  [6, 4],
  [5, 4],
  [4, 4],
  [3, 4],
  [2, 4],
  [1, 4],
  [0, 4],
];

const IbizzaLogo = () => (
  <svg
    className={s.ibizzaLogo}
    width="144"
    height="144"
    viewBox="0 0 9 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {IBIZZA_LOGO_STROKES.map(([x, y], index) => (
      <rect
        key={`${x}-${y}-${index}`}
        className={s.ibizzaLogoPixel}
        x={x}
        y={y}
        width="1"
        height="1"
        fill="black"
        style={{
          animationDelay: `${index * 45}ms`,
        }}
      />
    ))}
  </svg>
);
const HelloSketch = () => {
  const pixels = useMemo(() => HELLO_STROKES, []);

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

      {pixels.map(([x, y], index) => (
        <rect
          key={`${x}-${y}-${index}`}
          className={s.helloSketchPixel}
          x={x}
          y={y}
          width="1"
          height="1"
          fill="black"
          style={{
            animationDelay: `${index * 18 * 1.6}ms`,
          }}
        />
      ))}
    </svg>
  );
};

interface LoaderProps {
  minDurationMs?: number;
}

const Loader: React.FC<LoaderProps> = ({ minDurationMs = 2000 }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs]);

  if (!showLoader) return null;

  return (
    <div className={s.loaderOverlay}>
      <div className={s.loaderContent}>
        {/* <IbizzaLogo /> */}
        {/* <LoadingIcon /> */}
        <HelloSketch />
      </div>
    </div>
  );
};

export default Loader;
