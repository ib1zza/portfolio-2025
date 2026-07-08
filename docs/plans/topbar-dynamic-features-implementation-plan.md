# План реализации динамического Topbar

Данный документ представляет собой подробный пошаговый план реализации динамических возможностей компонента `Topbar` в соответствии с документом `topbar-dynamic-features.md` и архитектурой проекта.

## Шаг 1: Создание `useMenuStore`

Для инверсии контроля и управления меню из любого приложения создадим новый неперсистентный Zustand-стор:
`src/store/useMenuStore.ts`

**Структура стора:**

```typescript
import { create } from "zustand";

export interface MenuAction {
  title: string;
  action: () => void;
  disabled?: boolean;
}

export interface CustomTab {
  title: string;
  submenu: Array<MenuAction | null>;
}

interface MenuStore {
  activeAppName: string | null;
  fileMenuOverrides: Array<MenuAction | null> | null;
  editMenuOverrides: Array<MenuAction | null> | null;
  customTabs: CustomTab[];

  setAppMenu: (
    appName: string,
    customTabs?: CustomTab[],
    fileOverrides?: Array<MenuAction | null>,
    editOverrides?: Array<MenuAction | null>,
  ) => void;
  clearAppMenu: () => void;
}
```

_Важно:_ Стор не должен оборачиваться в `persist` middleware, так как содержит ссылки на функции (`action`).

## Шаг 2: Рефакторинг `Topbar.tsx`

Необходимо обновить `src/components/Topbar/Topbar.tsx`:

1. **Индикация активного приложения:**
   - Читать `activeAppName` из `useMenuStore`.
   - Если `activeAppName` не задан (или фокус сброшен), по умолчанию отображать **Finder** (если находимся на рабочем столе).
   - Выводить название приложения жирным шрифтом сразу после вкладки `¤` (Apple Menu). Это может быть некликабельный элемент или специальная вкладка.

2. **Динамические меню File и Edit:**
   - **File:** Если есть `fileMenuOverrides`, объединять их со стандартными пунктами (или полностью заменять, например `Close Window` оставить базовым). Добавить логику для "New Folder", "Get Info" для Finder.
   - **Edit:** Если есть `editMenuOverrides`, использовать их, иначе отображать стандартное меню (в Finder — `Clean Up Icons`).

3. **Кастомные вкладки (App-Specific Menus):**
   - Рендерить массив `customTabs` между вкладками `Edit` и `Window`.

4. **Новая вкладка "Window":**
   - Добавить вкладку `Window` перед `Special`.
   - Получать список окон: `const windows = useWindowManager(state => state.windows); const windowIds = useWindowManager(state => state.windowIds);`
   - Добавить действия:
     - Список всех открытых окон (с вызовом `focusWindow(id)` по клику и галочкой для текущего `focusedWindowId`).
     - `Minimize All` (если будет реализовано сворачивание).
     - `Close All` (перенести из Apple/File меню).

## Шаг 3: Интеграция с Finder (по умолчанию)

Поскольку рабочий стол не является "окном", его логика может быть встроена либо в сам `Desktop.tsx`, либо обрабатываться в `Topbar.tsx` как состояние по умолчанию при `focusedWindowId === undefined`.

- **AppName:** "Finder".
- **File Menu:** "New Folder" (вызов экшена из `useFileSystem`), "Get Info" (если выделен файл).
- **Edit Menu:** "Clean Up Icons".

## Шаг 4: Интеграция с приложениями (на примере Icon Painter)

В `src/components/IconPainter/IconPainter.tsx` (или в родительском компоненте-обертке окна):

1. Отслеживать фокус окна:

   ```typescript
   const isFocused = useWindowManager(
     (state) => state.focusedWindowId === myWindowId,
   );
   const setAppMenu = useMenuStore((state) => state.setAppMenu);
   const clearAppMenu = useMenuStore((state) => state.clearAppMenu);
   ```

2. При `isFocused === true` регистрировать меню через `useEffect`:

   ```typescript
   useEffect(() => {
     if (!isFocused) return;

     setAppMenu(
       "Icon Painter",
       [
         {
           title: "Tools",
           submenu: [
             { title: "Pencil", action: () => selectTool("pencil") },
             { title: "Fill", action: () => selectTool("fill") },
             // ...
           ],
         },
         {
           title: "Image",
           submenu: [
             { title: "Clear Canvas", action: clearCanvas },
             { title: "Invert Colors", action: invertColors },
           ],
         },
       ],
       // File overrides
       [
         { title: "Save", action: saveIcon },
         { title: "Export...", action: exportIcon },
       ],
       // Edit overrides
       [
         { title: "Undo", action: undo, disabled: !canUndo },
         { title: "Redo", action: redo, disabled: !canRedo },
       ],
     );

     return () => clearAppMenu();
   }, [
     isFocused,
     selectTool,
     clearCanvas,
     invertColors,
     saveIcon,
     exportIcon,
     undo,
     redo,
   ]);
   ```

   _Рекомендация:_ Использовать `useRef` для сохранения актуальных callback-функций, чтобы избежать проблем со stale closures в `useEffect`, либо аккуратно пересоздавать меню при изменении зависимостей.

## Шаг 5: Интеграция с остальными приложениями

Аналогичным образом зарегистрировать меню для:

- **Dither Studio:** Вкладки `Adjust` (яркость/контраст) и `Palette` (смена пресетов).
- **Model Viewer:** Вкладка `View` (Wireframe, Reset Camera).

## Шаг 6: Тестирование и проверка UI

- Убедиться, что `Topbar` не ломает z-index и корректно отображается поверх окон (`z-index` rules in `_vars.scss`).
- Проверить поведение на мобильных устройствах (`mobileHidden` флаги для новых вкладок).
- Протестировать смену фокуса: при клике на рабочем столе кастомное меню должно моментально сменяться на Finder-меню. При переключении между двумя окнами разных приложений меню должны обновляться соответственно.
