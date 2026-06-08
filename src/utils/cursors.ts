import arrowSvg from "../assets/cursors/arrow.svg?raw";
import watchSvg from "../assets/cursors/watch.svg?raw";

const SVG_TO_DATAURI = (svg: string) => {
  const encoded = encodeURIComponent(svg)
    .replace(/%20/g, " ")
    .replace(/'/g, "%27")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%23/g, "#");
  return `url("data:image/svg+xml,${encoded}")`;
};

let injected = false;

export const injectCursorDataUris = () => {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const root = document.documentElement;
  root.style.setProperty("--cursor-default", SVG_TO_DATAURI(arrowSvg));
  root.style.setProperty("--cursor-arrow", SVG_TO_DATAURI(arrowSvg));
  root.style.setProperty("--cursor-watch", SVG_TO_DATAURI(watchSvg));
};
