import s from "./Desktop.module.scss";
import { Topbar } from "../Topbar";
import Window from "../Window";
export function Desktop() {
  return (
    <div className={s.desktop}>
      <Topbar />

      <Window />
    </div>
  );
}
