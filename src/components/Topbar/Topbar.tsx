import s from "./Topbar.module.scss";
import { useState, useRef, useEffect, useCallback } from "react";

// Интерфейсы для лучшей читаемости и типизации
interface SubmenuItemData {
  title: string;
  action: () => void;
}

interface TabData {
  title: string;
  submenu?: Array<SubmenuItemData | null>;
}

interface SubmenuProps {
  items: Array<SubmenuItemData | null>;
  onItemClick: (action: () => void) => void;
  setRef: (el: HTMLDivElement | null) => void;
}

// Компонент для отдельного пункта подменю или разделителя
const SubmenuContent = ({
  item,
  onClick,
}: {
  item: SubmenuItemData | null;
  onClick: (action: () => void) => void;
}) => {
  if (!item) {
    return <div className={s.submenuSeparator} />;
  }
  return (
    <div className={s.submenuItem} onMouseUp={() => onClick(item.action)}>
      {item.title}
    </div>
  );
};

// Отдельный компонент для подменю
const Submenu = ({ items, onItemClick, setRef }: SubmenuProps) => {
  return (
    <div className={s.submenu} ref={setRef}>
      {items.map((item, index) => (
        <SubmenuContent key={index} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
};

export function Topbar() {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submenuRef = useRef<HTMLDivElement | null>(null);

  const tabs: TabData[] = [
    {
      title: "¤",
      submenu: [
        {
          title: "About this Website ...",
          action: () => {
            console.log("About this Website clicked");
          },
        },
        null, // Разделитель
        {
          title: "Close Window",
          action: () => {
            console.log("Close Window clicked");
          },
        },
        {
          title: "Mock action",
          action: () => {
            console.log("Mock action clicked");
          },
        },
      ],
    },
    {
      title: "File",
      submenu: [
        {
          title: "New",
          action: () => console.log("New clicked"),
        },
        {
          title: "Open",
          action: () => console.log("Open clicked"),
        },
      ],
    },
    {
      title: "Edit",
      submenu: [
        {
          title: "Undo",
          action: () => console.log("Undo clicked"),
        },
        {
          title: "Redo",
          action: () => console.log("Redo clicked"),
        },
      ],
    },
  ];

  // Обработчик для клика по пункту подменю
  const handleSubmenuItemClick = useCallback((action: () => void) => {
    action();
    setActiveMenuIndex(null);
    setIsMousePressed(false);
  }, []); // Зависимостей нет, т.к. action передается как аргумент

  // Обработчик наведения мыши при зажатой кнопке
  const handleMouseOver = useCallback(
    (event: MouseEvent) => {
      if (!isMousePressed) return;

      const target = event.target as Node;

      const hoveredTabIndex = tabRefs.current.findIndex(
        (tab) => tab && tab.contains(target)
      );

      // Если навели на другой таб и он имеет подменю - переключаемся на него
      if (
        hoveredTabIndex !== -1 &&
        hoveredTabIndex !== activeMenuIndex &&
        tabs[hoveredTabIndex].submenu
      ) {
        setActiveMenuIndex(hoveredTabIndex);
      }
    },
    [isMousePressed, activeMenuIndex, tabs]
  ); // Добавил tabs в зависимости, хотя он и статичен.

  // Обработчик отпускания кнопки мыши (глобальный)
  const handleGlobalMouseUp = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOnSubmenu = submenuRef.current?.contains(target);
      const clickedOnTabTitle = tabRefs.current.some((tab) => {
        if (!tab) return false;
        const tabTitle = tab.querySelector(`.${s.tabTitle}`);
        return tabTitle && tabTitle.contains(target);
      });

      // Закрываем меню, если клик был вне подменю И не на заголовке таба
      // ИЛИ если клик был на заголовке таба (даже активного)
      if ((!clickedOnSubmenu && !clickedOnTabTitle) || clickedOnTabTitle) {
        setActiveMenuIndex(null);
      }
      setIsMousePressed(false);
    },
    [tabs] // Добавил tabs в зависимости
  );

  useEffect(() => {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseOver, handleGlobalMouseUp]); // Зависимости - сами обработчики

  const handleMouseDownOnTab = useCallback((index: number) => {
    setIsMousePressed(true);
    // При зажатии сразу показываем меню этого таба
    setActiveMenuIndex(index);
  }, []);

  // Функции для сохранения рефов
  const setTabRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      tabRefs.current[index] = el;
    },
    []
  );

  const setSubmenuRef = useCallback((el: HTMLDivElement | null) => {
    submenuRef.current = el;
  }, []);

  return (
    <div className={s.topbar}>
      {tabs.map((tab, index) => (
        <div key={index} className={s.tab} ref={setTabRef(index)}>
          <div
            className={`${s.tabTitle} ${
              activeMenuIndex === index ? s.active : ""
            }`}
            onMouseDown={() => handleMouseDownOnTab(index)}
          >
            {tab.title}
          </div>
          {tab.submenu && activeMenuIndex === index && (
            <Submenu
              items={tab.submenu}
              onItemClick={handleSubmenuItemClick}
              setRef={setSubmenuRef}
            />
          )}
        </div>
      ))}
    </div>
  );
}
