import clsx from "clsx";
import s from "./Window.module.scss";

interface WindowProps {
  children: React.ReactNode;
  isActive?: boolean;
}

export function Window({ children, isActive }: WindowProps) {
  // TODO: make props
  // const inActive = !isActive;
  const inActive = false;

  const title = "Title text";

  // TODO: make props

  const finderData = {
    files: 9,
    inDisk: "64 MB",
    available: "128 MB",
  };

  const arrowIcon = (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 0H5V1H4V2H3V3H2V4H1V5H0V6H3V10H9V6H12V5H11V4H10V3H9V2H8V1H7V0ZM7 1V2H8V3H9V4H10V5H8V9H4V5H2V4H3V3H4V2H5V1H7Z"
        fill="black"
      />
      <path d="M7 1H5V2H4V3H3V4H2V5H4V9H8V5H10V4H9V3H8V2H7V1Z" />
    </svg>
  );

  // TODO: make dynamic
  const isNeedToScrollHorizontal = true;
  const isNeedToScrollVertical = true;
  return (
    <div className={clsx(s.window, { [s.inActive]: inActive })}>
      <div className={s.windowTop}>
        <div className={s.buttonContainer}>
          <button className={s.windowTopButton}>
            <img src="/icons/sparkle.svg" alt="sparkle" draggable={false} />
          </button>
        </div>
        <div className={s.title}>{title}</div>
        <div className={s.buttonContainer}>
          <button className={clsx(s.windowTopButton, s.windowTopButtonClose)}>
            <img src="/icons/sparkle.svg" alt="sparkle" draggable={false} />
          </button>
        </div>
      </div>
      {finderData && (
        <div className={s.finderData}>
          <div className={s.finderItemsCount}>{finderData.files} items</div>
          <div className={s.finderInDisk}>{finderData.inDisk} in disk</div>
          <div className={s.finderAvailable}>
            {finderData.available} available
          </div>
        </div>
      )}

      <div className={s.content}>
        <div
          className={clsx(s.contentWindow, {
            [s.needToScrollHorizontal]: isNeedToScrollHorizontal,
            [s.needToScrollVertical]: isNeedToScrollVertical,
          })}
        >
          {children}
        </div>
        <div className={s.verticalScroll}>
          <button className={clsx(s.navigationButton, s.navigationButtonUp)}>
            {arrowIcon}
          </button>
          {isNeedToScrollVertical && (
            <div className={s.verticalScrollBar}>
              <div className={s.scrollThumb} />
            </div>
          )}
          <button className={clsx(s.navigationButton, s.navigationButtonDown)}>
            {arrowIcon}
          </button>
        </div>
        <div className={s.horizontalScroll}>
          <button className={clsx(s.navigationButton, s.navigationButtonLeft)}>
            {arrowIcon}
          </button>
          {isNeedToScrollHorizontal && (
            <div className={s.horizontalScrollBar}>
              <div className={s.scrollThumb} />
            </div>
          )}
          <button className={clsx(s.navigationButton, s.navigationButtonRight)}>
            {arrowIcon}
          </button>
        </div>
        <button className={s.windowResize}></button>
      </div>
    </div>
  );
}
