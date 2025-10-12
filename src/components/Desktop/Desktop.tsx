import React from "react";
import s from "./Desktop.module.scss";
import { Topbar } from "../Topbar";

export function Desktop() {
  return (
    <div className={s.desktop}>
      <Topbar />
    </div>
  );
}
