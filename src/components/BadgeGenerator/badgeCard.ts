import {
  createBlankIconPixels,
  ICON_GRID_SIZE,
  iconPixelsToRects,
} from "../IconPainter/iconPainterDesktop";

export interface BadgeInput {
  name: string;
  role: string;
  company: string;
  about: string;
  contacts: BadgeContact[];
  pixels: boolean[];
}

export interface BadgeContact {
  label: string;
  href: string;
}

export const CARD_WIDTH = 320;
export const CARD_HEIGHT = 180;

const ICON_SCALE = 2;
const ICON_SIZE = ICON_GRID_SIZE * ICON_SCALE;
const EXPORT_SCALE = 3;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const trimLine = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}.` : value;

const getNameMetrics = (name: string) => {
  const width = Math.min(230, Math.max(80, name.length * 10));
  const x = Math.round((CARD_WIDTH - width) / 2);

  return { x, width };
};

export const createBadgeSvg = ({
  name,
  role,
  company,
  about,
  pixels,
}: BadgeInput) => {
  const iconRects = iconPixelsToRects(pixels, ICON_SCALE, 24, 66);
  const nameMetrics = getNameMetrics(name);

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" shape-rendering="crispEdges">
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="white"/>
    <rect x="0.5" y="0.5" width="${CARD_WIDTH - 1}" height="${CARD_HEIGHT - 1}" fill="none" stroke="black"/>
    <path d="M14 13H306M14 16H306M14 19H306" stroke="black"/>
    <rect x="${nameMetrics.x}" y="6" width="${nameMetrics.width}" height="22" fill="white"/>
    <text x="160" y="16" dominant-baseline="middle" text-anchor="middle" font-family="ChiKareGo2, Arial, sans-serif" font-size="18" fill="black">${escapeXml(trimLine(name, 22))}</text>
    <rect x="22" y="64" width="${ICON_SIZE + 4}" height="${ICON_SIZE + 4}" fill="white" stroke="black"/>
    ${iconRects}
    <text x="106" y="76" font-family="ChiKareGo2, Arial, sans-serif" font-size="18" fill="black">${escapeXml(trimLine(role, 18))}</text>
    <text x="106" y="95" font-family="FindersKeepers, Arial, sans-serif" font-size="16" fill="black">${escapeXml(trimLine(company, 34))}</text>
    <line x1="106" y1="104" x2="292" y2="104" stroke="black"/>
    <text x="106" y="130" font-family="FindersKeepers, Arial, sans-serif" font-size="18" fill="black">${escapeXml(trimLine(about, 26))}</text>
  </svg>
  `;
};

const drawText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
) => {
  context.font = font;
  context.fillStyle = "#000";
  context.fillText(text, x, y);
};

export const renderBadgeCanvas = async (input: BadgeInput) => {
  await document.fonts?.ready;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  const nameMetrics = getNameMetrics(input.name);

  canvas.width = CARD_WIDTH * EXPORT_SCALE;
  canvas.height = CARD_HEIGHT * EXPORT_SCALE;
  context.scale(EXPORT_SCALE, EXPORT_SCALE);
  context.imageSmoothingEnabled = false;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.strokeStyle = "#000";
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1);

  [13, 16, 19].forEach((y) => {
    context.beginPath();
    context.moveTo(14, y);
    context.lineTo(306, y);
    context.stroke();
  });

  context.fillStyle = "#fff";
  context.fillRect(nameMetrics.x, 6, nameMetrics.width, 22);
  context.textAlign = "center";
  context.textBaseline = "middle";
  drawText(
    context,
    trimLine(input.name, 22),
    160,
    16,
    '18px "ChiKareGo2", Arial, sans-serif',
  );

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.strokeRect(22.5, 64.5, ICON_SIZE + 3, ICON_SIZE + 3);
  context.fillStyle = "#000";
  input.pixels.forEach((pixel, index) => {
    if (!pixel) return;

    context.fillRect(
      24 + (index % ICON_GRID_SIZE) * ICON_SCALE,
      66 + Math.floor(index / ICON_GRID_SIZE) * ICON_SCALE,
      ICON_SCALE,
      ICON_SCALE,
    );
  });

  drawText(
    context,
    trimLine(input.role, 18),
    106,
    76,
    '18px "ChiKareGo2", Arial, sans-serif',
  );
  drawText(
    context,
    trimLine(input.company, 34),
    106,
    95,
    '16px "FindersKeepers", Arial, sans-serif',
  );
  context.beginPath();
  context.moveTo(106, 104);
  context.lineTo(292, 104);
  context.stroke();
  drawText(
    context,
    trimLine(input.about, 26),
    106,
    130,
    '18px "FindersKeepers", Arial, sans-serif',
  );

  return canvas;
};

const pixelsToHex = (pixels: boolean[]) => {
  let output = "";

  for (let index = 0; index < pixels.length; index += 4) {
    const value =
      Number(Boolean(pixels[index])) * 8 +
      Number(Boolean(pixels[index + 1])) * 4 +
      Number(Boolean(pixels[index + 2])) * 2 +
      Number(Boolean(pixels[index + 3]));

    output += value.toString(16);
  }

  return output;
};

const pixelsFromHex = (value: string | null) => {
  if (!value) return createBlankIconPixels();

  const pixels: boolean[] = [];

  value
    .slice(0, ICON_GRID_SIZE * ICON_GRID_SIZE / 4)
    .split("")
    .forEach((char) => {
      const nibble = Number.parseInt(char, 16);

      pixels.push(
        Boolean(nibble & 8),
        Boolean(nibble & 4),
        Boolean(nibble & 2),
        Boolean(nibble & 1),
      );
    });

  return pixels.length === ICON_GRID_SIZE * ICON_GRID_SIZE
    ? pixels
    : createBlankIconPixels();
};

export const createBadgeUrl = (input: BadgeInput) => {
  const url = new URL("/badge", window.location.origin);

  url.searchParams.set("name", input.name);
  url.searchParams.set("role", input.role);
  url.searchParams.set("company", input.company);
  url.searchParams.set("about", input.about);
  input.contacts
    .filter((contact) => contact.href.trim())
    .forEach((contact, index) => {
      url.searchParams.set(`contact${index}Label`, contact.label);
      url.searchParams.set(`contact${index}Href`, contact.href);
    });
  url.searchParams.set("icon", pixelsToHex(input.pixels));

  return url.toString();
};

export const readBadgeInputFromSearch = (
  search: string,
  fallback: BadgeInput,
): BadgeInput => {
  const params = new URLSearchParams(search);
  const contacts = Array.from({ length: 8 }, (_, index) => ({
    label: params.get(`contact${index}Label`) || "",
    href: params.get(`contact${index}Href`) || "",
  })).filter((contact) => contact.href);

  return {
    name: params.get("name") || fallback.name,
    role: params.get("role") || fallback.role,
    company: params.get("company") || params.get("stack") || fallback.company,
    about: params.get("about") || params.get("contact") || fallback.about,
    contacts: contacts.length ? contacts : fallback.contacts,
    pixels: pixelsFromHex(params.get("icon")),
  };
};
