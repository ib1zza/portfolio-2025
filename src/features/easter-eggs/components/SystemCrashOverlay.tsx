import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { getAssetPath } from "../../../utils/assets";
import s from "./SystemCrashOverlay.module.scss";

interface SystemCrashOverlayProps {
  sourceRect?: DOMRect;
  onDismiss: () => void;
}

const BOMB_FALL_MS = 700;
const SAD_MAC_DELAY_MS = 300;

const getFallbackSource = () => ({
  x: window.innerWidth - 72,
  y: window.innerHeight - 88,
});

const BombIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    <path
      d="M13 11H6V14H4V15H2V17H1V19H0V26H1V28H2V30H4V31H6V32H13V31H15V30H17V28H18V26H19V19H18V17H17V15H15V14H13V11Z"
      fill="black"
    />
    <rect x="4" y="19" width="1" height="1" fill="white" />
    <rect x="4" y="25" width="1" height="1" fill="white" />
    <rect x="6" y="27" width="1" height="1" fill="white" />
    <rect x="3" y="21" width="1" height="3" fill="white" />
    <path d="M11 6H16V7H11V6Z" fill="black" />
    <path d="M10 8V7H11V8H10Z" fill="black" />
    <path d="M10 8V11H9V8H10Z" fill="black" />
    <path d="M18 8H16V7H18V8Z" fill="black" />
    <path d="M21 8H18V9H21V8Z" fill="black" />
    <path d="M21 8V7H24V8H21Z" fill="black" />
    <rect x="16" y="3" width="1" height="1" fill="black" />
    <rect x="18" y="4" width="1" height="1" fill="black" />
    <rect x="20" y="5" width="1" height="1" fill="black" />
    <rect x="22" y="4" width="1" height="1" fill="black" />
    <rect x="25" y="3" width="1" height="1" fill="black" />
    <rect x="26" y="6" width="1" height="1" fill="black" />
    <rect x="26" y="9" width="1" height="1" fill="black" />
    <rect x="23" y="10" width="1" height="1" fill="black" />
    <rect x="20" y="10" width="1" height="1" fill="black" />
    <rect x="19" y="11" width="1" height="1" fill="black" />
    <rect x="18" y="12" width="1" height="1" fill="black" />
    <rect x="23" y="12" width="1" height="1" fill="black" />
    <rect x="23" y="14" width="1" height="1" fill="black" />
    <rect x="27" y="10" width="1" height="1" fill="black" />
    <rect x="28" y="11" width="1" height="1" fill="black" />
    <rect x="29" y="12" width="1" height="1" fill="black" />
    <rect x="28" y="6" width="1" height="1" fill="black" />
    <rect x="30" y="6" width="1" height="1" fill="black" />
    <rect x="26" y="2" width="1" height="1" fill="black" />
    <rect x="27" y="1" width="1" height="1" fill="black" />
    <rect x="28" width="1" height="1" fill="black" />
    <rect x="21" y="2" width="1" height="1" fill="black" />
    <rect x="20" width="1" height="1" fill="black" />
  </svg>
);

export function SystemCrashOverlay({
  sourceRect,
  onDismiss,
}: SystemCrashOverlayProps) {
  const [isSadMacVisible, setIsSadMacVisible] = useState(false);
  const source = useMemo(() => {
    if (!sourceRect) return getFallbackSource();

    return {
      x: sourceRect.left + sourceRect.width / 2 - 16,
      y: sourceRect.top + sourceRect.height / 2 - 16,
    };
  }, [sourceRect]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsSadMacVisible(true),
      BOMB_FALL_MS + SAD_MAC_DELAY_MS,
    );

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = () => onDismiss();
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <div className={s.overlay} aria-live="assertive" onClick={onDismiss}>
      {!isSadMacVisible ? (
        <div
          className={s.bomb}
          style={
            {
              "--bomb-start-x": `${source.x}px`,
              "--bomb-start-y": `${source.y}px`,
            } as CSSProperties
          }
        >
          <BombIcon />
        </div>
      ) : (
        <div className={s.sadMacScreen} role="dialog" aria-label="Sad Mac">
          <img
            className={s.sadMacIcon}
            src={getAssetPath("icons/sad_mac.svg")}
            alt=""
            draggable="false"
          />
          <div className={s.errorCode} aria-label="Error code 00000539 000007D5">
            <span>00000539</span>
            <span>000007D5</span>
          </div>
        </div>
      )}
    </div>
  );
}
