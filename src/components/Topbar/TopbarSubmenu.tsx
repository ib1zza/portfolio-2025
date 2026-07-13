import { memo } from "react";
import clsx from "clsx";
import CheckmarkSvg from "../../assets/icons/checkmark.svg?react";
import type { SubmenuItemData, SubmenuProps } from "./types";
import s from "./Topbar.module.scss";

export const SubmenuContent = ({
  item,
  onClick,
}: {
  item: SubmenuItemData | null;
  onClick: (action: () => void) => void;
}) => {
  if (!item) return <div className={s.submenuSeparator} />;

  return (
    <div
      className={clsx(s.submenuItem, { [s.disabled]: item.disabled })}
      onPointerUp={() => {
        if (!item.disabled) onClick(item.action);
      }}
    >
      <span className={s.checkmark}>
        {item.checked ? <CheckmarkSvg /> : <span className={s.checkmarkSpacer} />}
      </span>
      {item.title}
    </div>
  );
};

export const Submenu = memo(function Submenu({ items, onItemClick, setRef }: SubmenuProps) {
  return (
    <div className={s.submenu} ref={setRef}>
      {items.map((item, index) => (
        <SubmenuContent key={index} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
});
