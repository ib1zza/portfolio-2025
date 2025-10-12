import React from "react";
import s from "./Desktop.module.scss";
import { Topbar } from "../Topbar";
import CustomCursor from "../CustomCursor/CustomCursor";

export function Desktop() {
  return (
    <div className={s.desktop}>
      <Topbar />
    </div>
  );
}
