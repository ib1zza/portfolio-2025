import { memo } from "react";
import { MacButton } from "../UIKit/MacButton/MacButton";
import s from "./ShareDialog.module.scss";

export interface ShareDialogProps {
  onClose: () => void;
  onCopy: () => void;
  onOpen: () => void;
  qrDataUrl: string;
  backdropClassName?: string;
}

export const ShareDialog = memo(function ShareDialog({
  onClose,
  onCopy,
  onOpen,
  qrDataUrl,
  backdropClassName,
}: ShareDialogProps) {
  return (
    <div className={`${s.dialogBackdrop} ${backdropClassName || ""}`}>
      <div className={s.popupWindow}>
        <div className={s.dialogTitle}>Share Badge</div>
        <div className={s.qrFrame}>
          {qrDataUrl ? <img src={qrDataUrl} alt="Badge QR code" /> : null}
        </div>
        <div className={s.dialogActions}>
          <MacButton onClick={onOpen} className={s.openBtn}>
            open
          </MacButton>
          <MacButton onClick={onCopy} className={s.copyBtn}>
            copy link
          </MacButton>
          <div className={s.dialogSeparator} />
          <MacButton variant="default" onClick={onClose} className={s.closeBtn}>
            close
          </MacButton>
        </div>
      </div>
    </div>
  );
});
