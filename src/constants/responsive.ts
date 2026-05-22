export const MOBILE_POINTER_QUERY =
  "(max-width: 768px), (hover: none), (pointer: coarse)";
export const COARSE_POINTER_QUERY = "(hover: none), (pointer: coarse)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const TABLET_UI_SCALE_QUERY = `(min-width: 769px) and (max-width: 1023px) and ${FINE_POINTER_QUERY}`;
export const DESKTOP_UI_SCALE_QUERY = `(min-width: 1024px) and ${FINE_POINTER_QUERY}`;

export const isMobilePointerMode = () =>
  typeof window !== "undefined" &&
  window.matchMedia(MOBILE_POINTER_QUERY).matches;

export const isCoarsePointerMode = () =>
  typeof window !== "undefined" &&
  window.matchMedia(COARSE_POINTER_QUERY).matches;

export const isFinePointerMode = () =>
  typeof window !== "undefined" &&
  window.matchMedia(FINE_POINTER_QUERY).matches;
