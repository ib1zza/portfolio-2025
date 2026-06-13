import { memo, useEffect, useState, type ReactNode } from "react";

import { MacButton, MacProgress } from "../../../components/UIKit";
import type { SpecialAction } from "../EasterEggContext";
import s from "./SpecialActionDialogHost.module.scss";

interface SpecialActionDialogHostProps {
  action: SpecialAction;
  onClose: () => void;
}

interface DialogFrameProps {
  buttons: ReactNode;
  children: ReactNode;
  title: string;
}

const RESULT_MESSAGES: Record<
  Exclude<SpecialAction, "defragment-reality" | "reboot-universe">,
  string
> = {
  "increase-creativity": "Creativity increased by 12%.",
  "calibrate-inspiration": "Inspiration levels nominal.",
};

const DialogFrame = ({ buttons, children, title }: DialogFrameProps) => (
  <div className={s.backdrop} role="dialog" aria-modal="true" aria-label={title}>
    <section className={s.dialog} onMouseDown={(event) => event.stopPropagation()}>
      <div className={s.titleBar}>
        <div className={s.titleLines} aria-hidden="true" />
        <div className={s.title}>{title}</div>
        <div className={s.titleLines} aria-hidden="true" />
      </div>
      <div className={s.body}>{children}</div>
      <footer className={s.buttons}>{buttons}</footer>
    </section>
  </div>
);

const DefragmentRealityDialog = ({ onClose }: { onClose: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const intervalId = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + 4);
        if (next === 100) window.clearInterval(intervalId);
        return next;
      });
    }, 80);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <DialogFrame
      title="Defragment Reality"
      buttons={
        progress === 100 ? (
          <MacButton variant="default" onClick={onClose}>
            OK
          </MacButton>
        ) : null
      }
    >
      {progress === 100 ? (
        <p>Reality optimized successfully.</p>
      ) : (
        <>
          <p>Optimizing local reality map...</p>
          <MacProgress value={progress} aria-label="Defragment reality" />
        </>
      )}
    </DialogFrame>
  );
};

const RebootUniverseDialog = ({ onClose }: { onClose: () => void }) => {
  const [hasContinued, setHasContinued] = useState(false);

  if (hasContinued) {
    return (
      <DialogFrame
        title="Reboot Universe"
        buttons={
          <MacButton variant="default" onClick={onClose}>
            OK
          </MacButton>
        }
      >
        <p>Universe reboot postponed.</p>
      </DialogFrame>
    );
  }

  return (
    <DialogFrame
      title="Reboot Universe"
      buttons={
        <>
          <MacButton onClick={onClose}>Cancel</MacButton>
          <MacButton variant="default" onClick={() => setHasContinued(true)}>
            Continue
          </MacButton>
        </>
      }
    >
      <p>Unsaved civilizations may be lost.</p>
    </DialogFrame>
  );
};

export const SpecialActionDialogHost = memo(function SpecialActionDialogHost({
  action,
  onClose,
}: SpecialActionDialogHostProps) {
  if (action === "defragment-reality") {
    return <DefragmentRealityDialog onClose={onClose} />;
  }

  if (action === "reboot-universe") {
    return <RebootUniverseDialog onClose={onClose} />;
  }

  return (
    <DialogFrame
      title={
        action === "increase-creativity"
          ? "Increase Creativity"
          : "Calibrate Inspiration"
      }
      buttons={
        <MacButton variant="default" onClick={onClose}>
          OK
        </MacButton>
      }
    >
      <p>{RESULT_MESSAGES[action]}</p>
    </DialogFrame>
  );
});
