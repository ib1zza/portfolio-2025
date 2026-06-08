import arrowSvg from "../assets/cursors/arrow.svg?raw";
import backgroundSvg from "../assets/cursors/background.svg?raw";
import beamSvg from "../assets/cursors/beam.svg?raw";
import busySvg from "../assets/cursors/busy.svg?raw";
import grabSvg from "../assets/cursors/grab.svg?raw";
import grab_02Svg from "../assets/cursors/grab_02.svg?raw";
import handSvg from "../assets/cursors/hand.svg?raw";
import pencilSvg from "../assets/cursors/pencil.svg?raw";
import precisionSvg from "../assets/cursors/precision.svg?raw";
import resizeSvg from "../assets/cursors/resize.svg?raw";
import resize_02Svg from "../assets/cursors/resize_02.svg?raw";
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
  root.style.setProperty("--cursor-background", SVG_TO_DATAURI(backgroundSvg));
  root.style.setProperty("--cursor-beam", SVG_TO_DATAURI(beamSvg));
  root.style.setProperty("--cursor-busy", SVG_TO_DATAURI(busySvg));
  root.style.setProperty("--cursor-grab", SVG_TO_DATAURI(grabSvg));
  root.style.setProperty("--cursor-grab_02", SVG_TO_DATAURI(grab_02Svg));
  root.style.setProperty("--cursor-hand", SVG_TO_DATAURI(handSvg));
  root.style.setProperty("--cursor-pencil", SVG_TO_DATAURI(pencilSvg));
  root.style.setProperty("--cursor-precision", SVG_TO_DATAURI(precisionSvg));
  root.style.setProperty("--cursor-resize", SVG_TO_DATAURI(resizeSvg));
  root.style.setProperty("--cursor-resize_02", SVG_TO_DATAURI(resize_02Svg));
  root.style.setProperty("--cursor-watch", SVG_TO_DATAURI(watchSvg));
};
