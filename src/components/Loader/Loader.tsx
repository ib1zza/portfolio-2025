import React, { useEffect, useState } from "react";
import s from "./Loader.module.scss";

// SVG иконка, которую вы предоставили
const LoadingIcon = () => (
  <svg
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
        <LoadingIcon />
      </div>
    </div>
  );
};

export default Loader;
