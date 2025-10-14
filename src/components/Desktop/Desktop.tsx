import s from "./Desktop.module.scss";
import { Topbar } from "../Topbar";
import Window from "../Window";
import Folder from "../Folder";

export function Desktop() {
  return (
    <div className={s.desktop}>
      <Topbar />

      <Window />

      <Folder name="My Folder" />
    </div>
  );
}
