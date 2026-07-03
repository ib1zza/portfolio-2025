import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

import { portfolio } from "../../data/portfolio";
import { useFileSystem } from "../../store/useFileSystem";
import { MacButton, MacTextInput } from "../UIKit";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import {
  createBlankIconPixels,
  ICON_DESKTOP_STORAGE_EVENT,
  readSavedIcons,
  type SavedDesktopIcon,
} from "../IconPainter/iconPainterDesktop";
import {
  BADGE_QR_SIZE,
  createBadgeSvg,
  createBadgeUrl,
  renderBadgeCanvas,
  type BadgeContact,
} from "./badgeCard";
import s from "./BadgeGenerator.module.scss";
import { getAppWindowSize } from "../../constants/windowLayout";
import { isMobilePointerMode } from "../../constants/responsive";
import TrashSmallSvg from "../../assets/icons/trash-small.svg?react";

const DEFAULT_COMPANY = portfolio.experience[0]?.company ?? "GROKHOTOV STUDIO";
const DEFAULT_ABOUT = "I build UI kits, animation, and production websites.";
const DEFAULT_CONTACTS = portfolio.contacts.map((contact) => ({
  label: contact.label,
  href: contact.href,
}));

interface BadgeGeneratorProps {
  windowId: string;
}

export const BadgeGenerator = memo(function BadgeGenerator({
  windowId,
}: BadgeGeneratorProps) {
  const { openWindowAnimated } = useWindowOpenAnimation();
  const setActive = useFileSystem((state) => state.setActive);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const iconPainterButtonRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState(portfolio.profile.name);
  const [role, setRole] = useState(portfolio.profile.role);
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [contacts, setContacts] = useState<BadgeContact[]>(DEFAULT_CONTACTS);
  const [savedIcons, setSavedIcons] = useState(readSavedIcons);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(
    () => readSavedIcons()[0]?.id ?? null,
  );
  const [dialogIconId, setDialogIconId] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const syncSavedIcons = () => {
      const nextIcons = readSavedIcons();

      setSavedIcons(nextIcons);
      setSelectedIconId((currentId) =>
        currentId && nextIcons.some((icon) => icon.id === currentId)
          ? currentId
          : (nextIcons[0]?.id ?? null),
      );
    };

    window.addEventListener(ICON_DESKTOP_STORAGE_EVENT, syncSavedIcons);

    return () =>
      window.removeEventListener(ICON_DESKTOP_STORAGE_EVENT, syncSavedIcons);
  }, []);

  const selectedIcon = useMemo(
    () => savedIcons.find((icon) => icon.id === selectedIconId),
    [savedIcons, selectedIconId],
  );
  const badgeInput = useMemo(
    () => ({
      name,
      role,
      company,
      about,
      contacts,
      pixels: selectedIcon?.pixels ?? createBlankIconPixels(),
    }),
    [about, company, contacts, name, role, selectedIcon?.pixels],
  );
  const badgeSvg = useMemo(() => createBadgeSvg(badgeInput), [badgeInput]);
  const badgeUrl = useMemo(() => createBadgeUrl(badgeInput), [badgeInput]);

  useEffect(() => {
    let isActive = true;

    QRCode.toDataURL(badgeUrl, {
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
      margin: 1,
      width: BADGE_QR_SIZE,
    }).then((dataUrl) => {
      if (isActive) setQrDataUrl(dataUrl);
    });

    return () => {
      isActive = false;
    };
  }, [badgeUrl]);

  const updatePreviewHeight = useCallback(() => {
    const container = containerRef.current;
    const preview = previewRef.current;
    if (!container || !preview) return;

    if (isMobilePointerMode()) {
      preview.style.height = "";
      return;
    }

    let scrollContainer: HTMLElement | null = container;
    while (scrollContainer) {
      const overflow = getComputedStyle(scrollContainer).overflow;
      if (overflow === "auto" || overflow === "scroll") break;
      scrollContainer = scrollContainer.parentElement;
    }
    if (!scrollContainer) return;

    const cs = getComputedStyle(container);
    const paddingTop = parseFloat(cs.paddingTop);
    const paddingBottom = parseFloat(cs.paddingBottom);
    const height = scrollContainer.clientHeight - paddingTop - paddingBottom;
    preview.style.height = `${Math.max(height, 0)}px`;
  }, []);

  useEffect(() => {
    updatePreviewHeight();

    const container = containerRef.current;
    if (!container) return;

    let scrollContainer: HTMLElement | null = container;
    while (scrollContainer) {
      const overflow = getComputedStyle(scrollContainer).overflow;
      if (overflow === "auto" || overflow === "scroll") break;
      scrollContainer = scrollContainer.parentElement;
    }
    if (!scrollContainer) return;

    const ro = new ResizeObserver(updatePreviewHeight);
    ro.observe(scrollContainer);

    return () => ro.disconnect();
  }, [updatePreviewHeight]);

  const openIconPainter = useCallback(() => {
    setActive("iconPainter");
    openWindowAnimated({
      id: "iconPainter",
      title: "Icon Painter",
      parentId: "iconPainter",
      sourceRect: iconPainterButtonRef.current?.getBoundingClientRect(),
      preferredSize: getAppWindowSize("icon-painter"),
      openerWindowId: windowId,
    });
  }, [openWindowAnimated, setActive, windowId]);

  const exportPng = useCallback(async () => {
    const canvas = await renderBadgeCanvas(badgeInput);
    const link = document.createElement("a");

    link.href = canvas.toDataURL("image/png");
    link.download = "portfolio-badge.png";
    link.click();
  }, [badgeInput]);

  const openBadgeUrl = useCallback(() => {
    window.open(badgeUrl, "_blank", "noopener,noreferrer");
  }, [badgeUrl]);

  const copyBadgeUrl = useCallback(async () => {
    await navigator.clipboard?.writeText(badgeUrl);
  }, [badgeUrl]);

  const updateContact = useCallback(
    (index: number, field: keyof BadgeContact, value: string) => {
      setContacts((currentContacts) =>
        currentContacts.map((contact, contactIndex) =>
          contactIndex === index ? { ...contact, [field]: value } : contact,
        ),
      );
    },
    [],
  );

  const addContact = useCallback(() => {
    setContacts((currentContacts) => [
      ...currentContacts,
      { label: "Link", href: "" },
    ]);
  }, []);

  const removeContact = useCallback((index: number) => {
    setContacts((currentContacts) =>
      currentContacts.filter((_, contactIndex) => contactIndex !== index),
    );
  }, []);

  const openImportDialog = useCallback(() => {
    setDialogIconId(selectedIconId ?? savedIcons[0]?.id ?? null);
    setIsImportOpen(true);
  }, [savedIcons, selectedIconId]);

  const chooseIcon = useCallback(() => {
    setSelectedIconId(dialogIconId);
    setIsImportOpen(false);
  }, [dialogIconId]);

  return (
    <div ref={containerRef} className={s.badgeGenerator}>
      <section ref={previewRef} className={s.previewPanel}>
        <div
          className={s.badgePreview}
          dangerouslySetInnerHTML={{ __html: badgeSvg }}
        />
      </section>

      <section className={s.controlsPanel}>
        <div className={s.title}>Badge Generator</div>

        <label className={s.field}>
          <span>Name:</span>
          <MacTextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className={s.field}>
          <span>Role:</span>
          <MacTextInput
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
        </label>
        <label className={s.field}>
          <span>Company:</span>
          <MacTextInput
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </label>
        <label className={s.field}>
          <span>About:</span>
          <MacTextInput
            value={about}
            onChange={(event) => setAbout(event.target.value)}
          />
        </label>

        <div className={s.contactEditor}>
          <div className={s.sectionLabel}>Contacts</div>
          {contacts.map((contactItem, index) => (
            <div className={s.contactFields} key={index}>
              <MacTextInput
                aria-label={`Contact ${index + 1} label`}
                value={contactItem.label}
                onChange={(event) =>
                  updateContact(index, "label", event.target.value)
                }
              />
              <MacTextInput
                aria-label={`Contact ${index + 1} link`}
                value={contactItem.href}
                onChange={(event) =>
                  updateContact(index, "href", event.target.value)
                }
              />
              <MacButton
                aria-label={`Remove contact ${index + 1}`}
                disabled={contacts.length <= 1}
                iconOnly
                onClick={() => removeContact(index)}
              >
                <TrashSmallSvg />
              </MacButton>
            </div>
          ))}
          <MacButton onClick={addContact}>add contact</MacButton>
        </div>

        <div className={s.iconPainterHint}>
          Draw an icon in Icon Painter and save it to desktop.
        </div>

        <div className={s.importRow}>
          <MacButton onClick={openImportDialog}>import icon</MacButton>
          <span>{selectedIcon?.name ?? "No icon"}</span>
        </div>

        <div ref={iconPainterButtonRef}>
          <MacButton onClick={openIconPainter}>open icon painter</MacButton>
        </div>

        <div className={s.exportRow}>
          <MacButton onClick={() => setIsShareOpen(true)}>share</MacButton>

          <MacButton variant="default" onClick={exportPng}>
            export png
          </MacButton>
        </div>
      </section>

      {isShareOpen && (
        <ShareDialog
          onClose={() => setIsShareOpen(false)}
          onCopy={copyBadgeUrl}
          onOpen={openBadgeUrl}
          qrDataUrl={qrDataUrl}
        />
      )}

      {isImportOpen && (
        <IconImportDialog
          icons={savedIcons}
          selectedIconId={dialogIconId}
          onCancel={() => setIsImportOpen(false)}
          onChoose={chooseIcon}
          onSelect={setDialogIconId}
        />
      )}
    </div>
  );
});

const ShareDialog = memo(function ShareDialog({
  onClose,
  onCopy,
  onOpen,
  qrDataUrl,
}: {
  onClose: () => void;
  onCopy: () => void;
  onOpen: () => void;
  qrDataUrl: string;
}) {
  return (
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
});

const IconImportDialog = memo(function IconImportDialog({
  icons,
  selectedIconId,
  onCancel,
  onChoose,
  onSelect,
}: {
  icons: SavedDesktopIcon[];
  selectedIconId: string | null;
  onCancel: () => void;
  onChoose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={s.dialogBackdrop}>
      <div className={s.importDialog}>
        <div className={s.dialogTitle}>Choose Icon</div>
        <div className={s.iconList}>
          {icons.length ? (
            icons.map((icon) => (
              <button
                key={icon.id}
                className={s.iconOption}
                data-selected={icon.id === selectedIconId}
                type="button"
                onClick={() => onSelect(icon.id)}
              >
                <svg viewBox="0 0 32 32" shapeRendering="crispEdges">
                  <rect width="32" height="32" fill="white" />
                  {icon.pixels.map((pixel, index) =>
                    pixel ? (
                      <rect
                        key={index}
                        x={index % 32}
                        y={Math.floor(index / 32)}
                        width="1"
                        height="1"
                        fill="black"
                      />
                    ) : null,
                  )}
                </svg>
                <span>{icon.name}</span>
              </button>
            ))
          ) : (
            <div className={s.emptyState}>No saved icons</div>
          )}
        </div>
        <div className={s.dialogActions}>
          <MacButton onClick={onCancel}>cancel</MacButton>
          <MacButton
            variant="default"
            disabled={!selectedIconId}
            onClick={onChoose}
          >
            choose
          </MacButton>
        </div>
      </div>
    </div>
  );
});
