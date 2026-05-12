import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

import { portfolio } from "../../data/portfolio";
import { MacButton } from "../UIKit/MacButton";
import { createBlankIconPixels } from "../IconPainter/iconPainterDesktop";
import {
  createBadgeSvg,
  readBadgeInputFromSearch,
  type BadgeInput,
  type BadgeContact,
} from "../BadgeGenerator/badgeCard";
import s from "./BadgeSharePage.module.scss";

const FALLBACK_BADGE: BadgeInput = {
  name: portfolio.profile.name,
  role: portfolio.profile.role,
  company: portfolio.experience[0]?.company ?? "GROKHOTOV STUDIO",
  about: "I build UI kits, animation, and production websites.",
  contacts: portfolio.contacts,
  pixels: createBlankIconPixels(),
};

export function BadgeSharePage() {
  const [popup, setPopup] = useState<"share" | "contacts" | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const input = useMemo(() => {
    const input = readBadgeInputFromSearch(window.location.search, FALLBACK_BADGE);

    document.title = `${input.name} badge`;

    return input;
  }, []);
  const badgeSvg = useMemo(() => createBadgeSvg(input), [input]);
  const pageUrl = useMemo(() => window.location.href, []);

  useEffect(() => {
    let isActive = true;

    QRCode.toDataURL(pageUrl, {
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
      margin: 1,
      width: 192,
    }).then((dataUrl) => {
      if (isActive) setQrDataUrl(dataUrl);
    });

    return () => {
      isActive = false;
    };
  }, [pageUrl]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard?.writeText(pageUrl);
  }, [pageUrl]);

  const openPage = useCallback(() => {
    window.open(pageUrl, "_blank", "noopener,noreferrer");
  }, [pageUrl]);

  return (
    <main className={s.badgePage}>
      <div
        className={s.badgeFrame}
        dangerouslySetInnerHTML={{ __html: badgeSvg }}
      />
      <div className={s.actions}>
        <MacButton onClick={() => setPopup("share")}>share</MacButton>
        <MacButton onClick={() => setPopup("contacts")}>contact</MacButton>
      </div>

      {popup === "share" && (
        <ShareDialog
          onClose={() => setPopup(null)}
          onCopy={copyLink}
          onOpen={openPage}
          qrDataUrl={qrDataUrl}
        />
      )}

      {popup === "contacts" && (
        <ContactsDialog
          contacts={input.contacts}
          onClose={() => setPopup(null)}
        />
      )}
    </main>
  );
}

const ShareDialog = ({
  onClose,
  onCopy,
  onOpen,
  qrDataUrl,
}: {
  onClose: () => void;
  onCopy: () => void;
  onOpen: () => void;
  qrDataUrl: string;
}) => (
  <div className={s.dialogBackdrop}>
    <div className={s.popupWindow}>
      <div className={s.dialogTitle}>Share Badge</div>
      <div className={s.qrFrame}>
        {qrDataUrl ? <img src={qrDataUrl} alt="Badge QR code" /> : null}
      </div>
      <div className={s.dialogActions}>
        <MacButton onClick={onClose}>close</MacButton>
        <MacButton onClick={onOpen}>open</MacButton>
        <MacButton variant="default" onClick={onCopy}>
          copy link
        </MacButton>
      </div>
    </div>
  </div>
);

const ContactsDialog = ({
  contacts,
  onClose,
}: {
  contacts: BadgeContact[];
  onClose: () => void;
}) => {
  const visibleContacts = contacts.filter((contact) => contact.href.trim());

  return (
    <div className={s.dialogBackdrop}>
      <div className={s.popupWindow}>
        <div className={s.dialogTitle}>Contacts</div>
        <div className={s.contactList}>
          {visibleContacts.length ? (
            visibleContacts.map((contact, index) => (
              <a
                href={contact.href}
                key={`${contact.href}-${index}`}
                rel="noreferrer"
                target="_blank"
              >
                {contact.label || contact.href}
              </a>
            ))
          ) : (
            <div className={s.emptyState}>No contacts</div>
          )}
        </div>
        <div className={s.dialogActions}>
          <MacButton variant="default" onClick={onClose}>
            OK
          </MacButton>
        </div>
      </div>
    </div>
  );
};
