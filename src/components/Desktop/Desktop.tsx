import s from "./Desktop.module.scss";
import { Topbar } from "../Topbar";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowManager } from "../../store/useWindowManager";
import Folder from "../Folder";
import Window from "../Window";
import { useRef, type MouseEventHandler } from "react";
import { useShallow } from "zustand/react/shallow";

export function Desktop() {
  const removeActive = useFileSystem((state) => state.removeActive);
  const desktopItems = useFileSystem(
    useShallow((state) =>
      Object.values(state.items).filter((item) => item.parentId === "root")
    )
  );
  const windows = useWindowManager(
    useShallow((state) => Object.values(state.windows))
  );
  const unfocusAll = useWindowManager((state) => state.unfocusAll);
  const desktopRef = useRef<HTMLDivElement | null>(null);

  const handleBgClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === desktopRef.current) {
      removeActive();
      unfocusAll();
    }
  };

  return (
    <div className={s.desktop} ref={desktopRef} onClick={handleBgClick}>
      <Topbar />

      {/* Папки на рабочем столе */}
      {desktopItems.map((item) =>
        item.type === "folder" ? (
          <Folder
            key={item.id}
            id={item.id}
            name={item.name}
            position={item.position!}
            constraintRef={desktopRef}
          />
        ) : null
      )}

      {/* Окна */}
      {windows.map((win) => (
        <Window key={win.id} data={win} />
      ))}
    </div>
  );
}
