## Context: Portfolio Project Architecture

Перед началом работы прочитай файл `info.md` в корне проекта. Это веб-портфолио в стиле классического Macintosh (System 6/7).

**Важно:** В проекте уже есть Audio Player и Video Player, используй их структуру как референс. Эстетика — 1-bit чёрно-белая, как и во всех приложениях.

---

## Задача: Создать приложение Space Invaders

Классическая аркадная игра, полностью отрисованная на Canvas 2D в 1-bit стиле. Управление — клавиатура (← → A D + Space) на ПК, виртуальные кнопки (← → FIRE) на мобильных устройствах.

---

### Функциональные требования

1. **Главное меню**
   - При открытии — экран с названием "SPACE INVADERS" и надписью "PRESS ENTER TO START"
   - Пиксельный крупный текст

2. **Игровой процесс**
   - **Player**: платформа внизу экрана, движется влево-вправо, стреляет лазерами вверх
   - **Aliens**: сетка 5×11 типов пришельцев (2–3 формы), движутся горизонтально как группа; при касании края опускаются на ряд и меняют направление; с каждым уровнем скорость растёт
   - **Bullets**: пули игрока, летят вверх; максимум 1–2 пули одновременно на экране
   - **Bombs**: случайные пришельцы в нижнем ряду бросают бомбы вниз; чем ниже ряд, тем выше шанс
   - **Collision Detection**: AABB (пересечение прямоугольников) — пуля/пришелец, бомба/игрок, пуля/укрытие, бомба/укрытие
   - **Shields**: 4 блока-укрытия в нижней трети; каждый — матрица пикселей; разрушаются постепенно при попаданиях
   - **UFO**: случайно пролетает вверху, даёт бонусные очки (50–300)
   - **Waves**: после уничтожения всех пришельцев — новый уровень со скоростью выше
   - **Score + Lives**: 3 жизни; потеря жизни при попадании бомбы; табло счёта в верхней части

3. **Экраны**
   - `"menu"` — приветственный экран, Enter для старта
   - `"playing"` — основной геймплей
   - `"paused"` — пауза (P), "PAUSED" по центру
   - `"gameover"` — "GAME OVER" + счёт + ENTER TO RESTART
   - `"victory"` — "YOU WIN!" + счёт + ENTER TO RESTART

4. **Управление — клавиатура (ПК)**
   - `ArrowLeft` / `ArrowRight` — движение
   - `A` / `D` — альтернативное движение (оба регистра)
   - `Space` — стрельба
   - `P` — пауза
   - `Enter` — старт / рестарт
   - Smooth movement: `keydown` выставляет флаг в `useRef`, `keyup` сбрасывает; игровой цикл двигает пока флаг активен

5. **Управление — сенсорные кнопки (Mobile)**
   - DOM-кнопки `←`, `→`, `FIRE` поверх Canvas
   - Показывать только на touch-устройствах (`@media (pointer: coarse)`)
   - `touchstart` на `←`/`→` — флаг движения, `touchend` — сброс
   - `FIRE` — однократный выстрел по `touchstart`
   - `preventDefault()` на touch-событиях для блокировки скролла
   - `touch-action: none` на контейнере игры

### Технические требования

#### Файлы для создания:

1. **`src/components/SpaceInvaders/SpaceInvaders.tsx`**
   - `useRef` для `<canvas>`, `requestAnimationFrame`
   - `useState` для состояния, счёта, уровня, жизней
   - Константы:
     ```
     CANVAS_WIDTH = 320
     CANVAS_HEIGHT = 280
     PLAYER_WIDTH = 20
     PLAYER_HEIGHT = 8
     ALIEN_COLS = 11
     ALIEN_ROWS = 5
     ALIEN_WIDTH = 16
     ALIEN_HEIGHT = 12
     BULLET_WIDTH = 2
     BULLET_HEIGHT = 6
     BOMB_WIDTH = 3
     BOMB_HEIGHT = 5
     PLAYER_SPEED = 3
     BULLET_SPEED = 4
     BOMB_SPEED = 2
     LIVES = 3
     ```
   - Игровой цикл: `requestAnimationFrame`, вызов `update()` + `draw()`
   - Player, Aliens, Bullets, Bombs, Shields, UFO — объекты/массивы внутри `update`/`draw`
   - Рендеринг: только `fillStyle = "white"` (фон) и `"black"` (всё остальное), `fillRect` для пиксельных спрайтов
   - `image-rendering: pixelated` на canvas (CSS)
   - `Props`: `{ windowId: string }`

2. **`src/components/SpaceInvaders/SpaceInvaders.module.scss`**
   - SCSS Module, Mac-стиль
   - Импорт `@use "@/global/styles/vars" as *;`, `@use "@/global/styles/mixins" as *;`
   - Canvas в чёрной рамке, белый фон
   - Стили для мобильных кнопок:
     ```scss
     .controls {
       display: flex;
       justify-content: center;
       gap: ui(12);
       margin-top: ui(8);
       // скрыты на десктопе
       @media (pointer: fine) { display: none; }
     }
     .btn {
       width: ui(48);
       height: ui(48);
       border: ui(1.5) solid #000;
       background: #fff;
       font-family: var(--font-main);
       font-size: ui(18);
       cursor: pointer;
       &:active { background: #000; color: #fff; }
     }
     .btnFire {
       width: ui(80);
     }
     ```
   - `touch-action: none` на игровом контейнере
   - Использовать `ui()` для размеров

3. **`src/components/SpaceInvaders/index.ts`**
   - `export { SpaceInvaders } from "./SpaceInvaders"`

#### Файлы для изменения:

1. **`src/store/useFileSystem.ts`**
   - Добавить `"space-invaders"` в union `app` в `AppItem`
   - В `createInitialItems()`:
     ```ts
     spaceInvaders: {
       id: "spaceInvaders",
       name: "Space Invaders",
       type: "app",
       parentId: "root",
       position: getDesktopGridPosition(/* следующий свободный слот */),
       app: "space-invaders",
     }
     ```
   - Добавить `"spaceInvaders"` в `root.children`

2. **`src/components/Window/WindowAppContent.tsx`**
   - Добавить `lazy(() => import("../SpaceInvaders"))`
   - Добавить `{app === "space-invaders" && <SpaceInvaders windowId={windowId} />}`

3. **`src/constants/windowLayout.ts`**
   - Добавить `"space-invaders"` в `WindowAppId`
   - Добавить в `WINDOW_BASE_METRICS`: `gameSize: { width: 520, height: 480 }`
   - Добавить в `getAppWindowSize()`:
     ```ts
     app === "space-invaders" ? scaleUiSize(WINDOW_BASE_METRICS.gameSize) :
     ```

4. **`src/components/Folder/FinderIcon.tsx`**
   - Добавить `"app-spaceInvaders"` в `FinderIconType`
   - Добавить пиксельную SVG-иконку (силуэт пришельца / голова инопланетянина)

### Архитектурные соглашения

- `memo` обёртка, SCSS Modules, алиас `@`
- `getAssetPath()` для ассетов, `scaleUiValue()`/`scaleUiSize()` для размеров
- `lazy` загрузка в WindowAppContent
- `props: { windowId: string }`
- Весь игровой код внутри одного компонента (`SpaceInvaders.tsx`), никаких внешних зависимостей
- Canvas занимает всю доступную высоту окна; кнопки управления — снизу под Canvas

### Проверка

1. Иконка "Space Invaders" на рабочем столе — двойной клик открывает окно
2. Enter → игра начинается, пришельцы движутся
3. ← → A D — плавное движение пушки, Space — стрельба
4. Пришельцы стреляют бомбами, укрытия разрушаются
5. Game Over при 0 жизней, Victory при уничтожении всех волн
6. P — пауза/продолжение
7. На мобильных устройствах появляются кнопки ← → FIRE и работают
8. На ПК кнопки скрыты
9. `npm run lint` — 0 errors, `npm run build` — успешно
