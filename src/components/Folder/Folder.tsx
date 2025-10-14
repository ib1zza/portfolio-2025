import clsx from "clsx";
import s from "./Folder.module.scss";

interface FolderProps {
  name: string;
}
// TODO: add custom icon support
export function Folder({ name }: FolderProps) {
  const folderIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_1_1969)">
        <path
          d="M11 8H5V9H4V10H3V11H2V12H1V31H30V12H14V11H13V10H12V9H11V8Z"
          fill="white"
        />
        <path d="M5 7H11V8H5V7Z" fill="black" />
        <path d="M4 9V8H5V9H4Z" fill="black" />
        <path d="M3 10V9H4V10H3Z" fill="black" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M3 11V10H2V11H1V12H0V32H31V12H30V11H14V10H13V9H12V8H11V9H12V10H13V11H3ZM1 12V31H30V12H1Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_1_1969">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
  const isActive = false; // TODO: make props
  return (
    <div className={clsx(s.folder, { [s.active]: isActive })}>
      <div className={s.folderIcon}>{folderIcon}</div>
      <div className={s.folderName}>{name}</div>
    </div>
  );
}
