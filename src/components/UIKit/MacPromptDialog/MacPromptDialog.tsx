import { memo, useEffect, useRef, useState } from "react";

import { MacButton } from "../MacButton";
import { MacTextInput } from "../MacTextInput";
import s from "./MacPromptDialog.module.scss";

interface MacPromptDialogProps {
  initialValue: string;
  label: string;
  title: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

export const MacPromptDialog = memo(function MacPromptDialog({
  initialValue,
  label,
  title,
  onCancel,
  onConfirm,
}: MacPromptDialogProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div
      className={s.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <form
        className={s.dialog}
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(value);
        }}
      >
        <div className={s.titleBar}>
          <div className={s.titleLines} aria-hidden="true" />
          <div className={s.title}>{title}</div>
          <div className={s.titleLines} aria-hidden="true" />
        </div>

        <div className={s.content}>
          <label className={s.field}>
            <span>{label}:</span>
            <MacTextInput
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  onCancel();
                }
              }}
            />
          </label>

          <MacButton
            className={s.okButton}
            variant="default"
            disabled={!value.trim()}
            type="submit"
          >
            OK
          </MacButton>
        </div>
      </form>
    </div>
  );
});
