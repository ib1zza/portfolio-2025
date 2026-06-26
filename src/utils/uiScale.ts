import {
  DESKTOP_UI_SCALE_QUERY,
  TABLET_UI_SCALE_QUERY,
} from "../constants/responsive";

const MOBILE_UI_SCALE = 1.5;
const TABLET_UI_SCALE = 1.5;
const DESKTOP_UI_SCALE = 2;

export const isDesktopUiScale = () =>
  typeof window !== "undefined" &&
  window.matchMedia(DESKTOP_UI_SCALE_QUERY).matches;

export const isTabletUiScale = () =>
  typeof window !== "undefined" &&
  window.matchMedia(TABLET_UI_SCALE_QUERY).matches;

export const getUiScale = () => {
  if (isDesktopUiScale()) return DESKTOP_UI_SCALE;
  if (isTabletUiScale()) return TABLET_UI_SCALE;
  return MOBILE_UI_SCALE;
};

export const scaleUiValue = (value: number) => value * getUiScale();

export const scaleUiSize = <T extends { width: number; height: number }>(
  size: T,
) => ({
  width: scaleUiValue(size.width),
  height: scaleUiValue(size.height),
});
