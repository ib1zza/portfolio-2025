// src/components/HapticsTester/HapticsTester.tsx
import { useState } from "react";
import { useHaptics } from "../../hooks/useHaptics";

type HapticButton = {
  label: string;
  description?: string;
  onClick: () => Promise<void> | void;
};

type HapticGroup = {
  title: string;
  items: HapticButton[];
};

export const HapticsTester = () => {
  const [lastEffect, setLastEffect] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const {
    siteLoaded,

    fileOpen,
    fileClose,

    folderOpen,
    folderClose,

    uiClick,
    dragStart,
    dragEnd,

    easterEgg,

    impactLight,
    impactMedium,
    impactHeavy,

    success,
    warning,
    error,
  } = useHaptics({
    throttleMs: 40,
    enableBrowserFallback: true,
  });

  const runEffect = async (
    label: string,
    effect: () => Promise<void> | void,
  ) => {
    if (isRunning) return;

    setIsRunning(true);
    setLastEffect(label);

    try {
      await effect();
    } finally {
      window.setTimeout(() => {
        setIsRunning(false);
      }, 160);
    }
  };

  const groups: HapticGroup[] = [
    {
      title: "Site / Loading",
      items: [
        {
          label: "Site Loaded",
          description: "Мягкий сигнал завершения загрузки сайта",
          onClick: siteLoaded,
        },
      ],
    },
    {
      title: "Files & Folders",
      items: [
        {
          label: "File Open",
          description: "Открытие файла",
          onClick: fileOpen,
        },
        {
          label: "File Close",
          description: "Закрытие файла",
          onClick: fileClose,
        },
        {
          label: "Folder Open",
          description: "Открытие папки",
          onClick: folderOpen,
        },
        {
          label: "Folder Close",
          description: "Закрытие папки",
          onClick: folderClose,
        },
      ],
    },
    {
      title: "UI",
      items: [
        {
          label: "UI Click",
          description: "Обычный клик по кнопке / меню / иконке",
          onClick: uiClick,
        },
        {
          label: "Drag Start",
          description: "Начало перетаскивания",
          onClick: dragStart,
        },
        {
          label: "Drag End",
          description: "Конец перетаскивания",
          onClick: dragEnd,
        },
      ],
    },
    {
      title: "Impact",
      items: [
        {
          label: "Impact Light",
          description: "Лёгкий удар",
          onClick: impactLight,
        },
        {
          label: "Impact Medium",
          description: "Средний удар",
          onClick: impactMedium,
        },
        {
          label: "Impact Heavy",
          description: "Сильный удар",
          onClick: impactHeavy,
        },
      ],
    },
    {
      title: "Notification",
      items: [
        {
          label: "Success",
          description: "Успешное действие",
          onClick: success,
        },
        {
          label: "Warning",
          description: "Предупреждение",
          onClick: warning,
        },
        {
          label: "Error",
          description: "Ошибка",
          onClick: error,
        },
      ],
    },
    {
      title: "Easter Eggs",
      items: [
        {
          label: "Happy Mac",
          description: "Мягкая позитивная пасхалка",
          onClick: () => easterEgg("happyMac"),
        },
        {
          label: "Startup Chime",
          description: "Тактильная отсылка к Mac startup chime",
          onClick: () => easterEgg("startupChime"),
        },
        {
          label: "Sad Mac",
          description: "Ошибка / Sad Mac вайб",
          onClick: () => easterEgg("sadMac"),
        },
        {
          label: "Finder Click",
          description: "Быстрый Finder double click",
          onClick: () => easterEgg("finderClick"),
        },
        {
          label: "System Error",
          description: "Более драматичная system bomb вибрация",
          onClick: () => easterEgg("systemError"),
        },
      ],
    },
  ];

  return (
    <section
      style={{
        display: "grid",
        gap: "16px",
        width: "min(720px, 100%)",
        padding: "16px",
        color: "#000",
      }}
    >
      <header>
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            lineHeight: 1.2,
          }}
        >
          Haptics Tester
        </h2>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: "14px",
            lineHeight: 1.35,
          }}
        >
          Нажимай кнопки, чтобы проверить все текущие haptic-эффекты.
        </p>

        {lastEffect && (
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "13px",
              lineHeight: 1.3,
            }}
          >
            Last effect: <strong>{lastEffect}</strong>
          </p>
        )}
      </header>

      {groups.map((group) => (
        <div
          key={group.title}
          style={{
            display: "grid",
            gap: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: 1.2,
            }}
          >
            {group.title}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "8px",
            }}
          >
            {group.items.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={isRunning}
                onClick={() => runEffect(item.label, item.onClick)}
                title={item.description}
                style={{
                  appearance: "none",
                  display: "grid",
                  gap: "4px",
                  minHeight: "64px",
                  padding: "10px",
                  border: "2px solid #000",
                  borderRadius: 0,
                  background: isRunning ? "#d8d8d8" : "#fff",
                  color: "#000",
                  font: "inherit",
                  textAlign: "left",
                  cursor: isRunning ? "default" : "pointer",
                  boxShadow: "2px 2px 0 #000",
                }}
              >
                <strong
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </strong>

                {item.description && (
                  <span
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.25,
                      opacity: 0.75,
                    }}
                  >
                    {item.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};
