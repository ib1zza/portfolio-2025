import { OpenedPattern } from "./OpenedPattern";

interface FileIconProps {
  openedFill: string;
  patternId: string;
}

export const FileIcon = ({ openedFill, patternId }: FileIconProps) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
  >
    <path d="M21 1H4V31H27V7H21V1Z" fill={openedFill} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 0V1H23V2H22V6H26V5H27V6H28V32H3V0H22ZM4 31H27V7H21V1H4V31Z"
      fill="black"
    />
    <path d="M25 4H26V5H25V4Z" fill="black" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 3V2H23V3H24ZM24 3H25V4H24V3Z"
      fill="black"
    />
    <path d="M23 2H22V6H26V5H25V4H24V3H23V2Z" fill={openedFill} />
    <OpenedPattern id={patternId} />
  </svg>
);
