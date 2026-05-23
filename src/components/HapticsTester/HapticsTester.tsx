// src/pages/WebHapticsTestPage.tsx
import { useState } from "react";
import { useHaptics } from "../../hooks/useHaptics";

type TestButton = {
  label: string;
  description: string;
  run: () => Promise<void> | void;
};

type TestGroup = {
  title: string;
  buttons: TestButton[];
};

export const HapticsTester = () => {
  const [lastEffect, setLastEffect] = useState<string>("—");
  const [isRunning, setIsRunning] = useState(false);
  const [debug, setDebug] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);

  const haptics = useHaptics({
    debug,
    showSwitch,
    throttleMs: 40,
    defaultIntensity: 0.6,
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
      }, 180);
    }
  };

  const groups: TestGroup[] = [
    {
      title: "Project Effects",
      buttons: [
        {
          label: "Site Loaded",
          description: "Эффект завершения загрузки сайта",
          run: haptics.siteLoaded,
        },
        {
          label: "File Open",
          description: "Открытие файла",
          run: haptics.fileOpen,
        },
        {
          label: "File Close",
          description: "Закрытие файла",
          run: haptics.fileClose,
        },
        {
          label: "Folder Open",
          description: "Открытие папки",
          run: haptics.folderOpen,
        },
        {
          label: "Folder Close",
          description: "Закрытие папки",
          run: haptics.folderClose,
        },
        {
          label: "UI Click",
          description: "Обычный клик по UI",
          run: haptics.uiClick,
        },
        {
          label: "Drag Start",
          description: "Начало перетаскивания",
          run: haptics.dragStart,
        },
        {
          label: "Drag End",
          description: "Завершение перетаскивания",
          run: haptics.dragEnd,
        },
      ],
    },
    {
      title: "WebHaptics Built-in Presets",
      buttons: [
        {
          label: "Success",
          description: "Built-in success: два коротких тапа",
          run: haptics.success,
        },
        {
          label: "Nudge",
          description: "Built-in nudge: сильный тап + мягкий тап",
          run: haptics.nudge,
        },
        {
          label: "Error",
          description: "Built-in error: три резких тапа",
          run: haptics.error,
        },
        {
          label: "Buzz",
          description: "Built-in buzz: длинная вибрация",
          run: haptics.buzz,
        },
      ],
    },
    {
      title: "Custom Basic Patterns",
      buttons: [
        {
          label: "Soft Tap",
          description: "Очень лёгкий короткий тап",
          run: haptics.softTap,
        },
        {
          label: "Hard Tap",
          description: "Сильный одиночный тап",
          run: haptics.hardTap,
        },
        {
          label: "Double Tap",
          description: "Два коротких тапа",
          run: haptics.doubleTap,
        },
        {
          label: "Triple Tap",
          description: "Три коротких тапа",
          run: haptics.tripleTap,
        },
      ],
    },
    {
      title: "Easter Eggs",
      buttons: [
        {
          label: "Happy Mac",
          description: "Позитивная ретро-пасхалка",
          run: () => haptics.easterEgg("happyMac"),
        },
        {
          label: "Startup Chime",
          description: "Тактильная отсылка к Mac startup chime",
          run: () => haptics.easterEgg("startupChime"),
        },
        {
          label: "Sad Mac",
          description: "Ошибка / Sad Mac вайб",
          run: () => haptics.easterEgg("sadMac"),
        },
        {
          label: "Finder Click",
          description: "Finder double click",
          run: () => haptics.easterEgg("finderClick"),
        },
        {
          label: "System Bomb",
          description: "Классическая system bomb / crash пасхалка",
          run: () => haptics.easterEgg("systemBomb"),
        },
        {
          label: "SOS",
          description: "SOS-паттерн: короткие, длинные, короткие",
          run: () => haptics.easterEgg("sos"),
        },
        {
          label: "Boot Sequence",
          description: "Ретро-последовательность загрузки",
          run: () => haptics.easterEgg("bootSequence"),
        },
      ],
    },
  ];

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "24px",
        color: "#000",
        background: "#c0c0c0",
        fontFamily: "inherit",
      }}
    >
      <section
        style={{
          display: "grid",
          gap: "18px",
          maxWidth: "920px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "grid",
            gap: "8px",
            padding: "16px",
            border: "2px solid #000",
            background: "#fff",
            boxShadow: "4px 4px 0 #000",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              lineHeight: 1.1,
            }}
          >
            WebHaptics Test Page
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: 1.4,
            }}
          >
            Тестовая страница для проверки всех haptic-эффектов из
            <code> useWebHapticsEffects</code>.
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            Last effect: <strong>{lastEffect}</strong>
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <input
                type="checkbox"
                checked={debug}
                onChange={(event) => setDebug(event.target.checked)}
              />
              Debug audio
            </label>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <input
                type="checkbox"
                checked={showSwitch}
                onChange={(event) => setShowSwitch(event.target.checked)}
              />
              Show WebHaptics switch
            </label>

            <button
              type="button"
              onClick={() => haptics.cancel()}
              style={{
                padding: "6px 10px",
                border: "2px solid #000",
                background: "#fff",
                color: "#000",
                font: "inherit",
                fontSize: "13px",
                boxShadow: "2px 2px 0 #000",
                cursor: "pointer",
              }}
            >
              Cancel current vibration
            </button>
          </div>
        </header>

        {groups.map((group) => (
          <section
            key={group.title}
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                lineHeight: 1.2,
              }}
            >
              {group.title}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
              }}
            >
              {group.buttons.map((button) => (
                <button
                  key={button.label}
                  type="button"
                  disabled={isRunning}
                  title={button.description}
                  onClick={() => runEffect(button.label, button.run)}
                  style={{
                    appearance: "none",
                    display: "grid",
                    gap: "6px",
                    minHeight: "82px",
                    padding: "12px",
                    border: "2px solid #000",
                    borderRadius: 0,
                    background: isRunning ? "#d8d8d8" : "#fff",
                    color: "#000",
                    font: "inherit",
                    textAlign: "left",
                    cursor: isRunning ? "default" : "pointer",
                    boxShadow: "3px 3px 0 #000",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.2,
                    }}
                  >
                    {button.label}
                  </strong>

                  <span
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.3,
                      opacity: 0.75,
                    }}
                  >
                    {button.description}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
};
