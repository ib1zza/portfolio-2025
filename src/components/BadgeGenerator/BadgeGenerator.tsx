import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { portfolio } from "../../data/portfolio";
import { useFileSystem } from "../../store/useFileSystem";
import { MacButton } from "../UIKit/MacButton";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import {
  createBlankIconPixels,
  ICON_DESKTOP_STORAGE_EVENT,
  readSavedIcons,
  type SavedDesktopIcon,
} from "../IconPainter/iconPainterDesktop";
import { createBadgeSvg, createBadgeUrl, renderBadgeCanvas } from "./badgeCard";
import s from "./BadgeGenerator.module.scss";

const DEFAULT_STACK = portfolio.skills
  .filter((skill) => ["TypeScript", "React", "Vue", "Nuxt"].includes(skill))
  .join(" / ");

const DEFAULT_CONTACT =
  portfolio.contacts.find((contact) => contact.label === "Telegram")?.href ??
  portfolio.contacts[0]?.href ??
  "";

interface BadgeGeneratorProps {
  windowId: string;
}

export const BadgeGenerator = memo(function BadgeGenerator({
  windowId,
}: BadgeGeneratorProps) {
  const { openWindowAnimated } = useWindowOpenAnimation();
  const setActive = useFileSystem((state) => state.setActive);
  const iconPainterButtonRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState(portfolio.profile.name);
  const [role, setRole] = useState(portfolio.profile.role);
  const [stack, setStack] = useState(DEFAULT_STACK);
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [savedIcons, setSavedIcons] = useState(readSavedIcons);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(
    () => readSavedIcons()[0]?.id ?? null,
  );
  const [dialogIconId, setDialogIconId] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

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
      stack,
      contact,
      pixels: selectedIcon?.pixels ?? createBlankIconPixels(),
    }),
    [contact, name, role, selectedIcon?.pixels, stack],
  );
  const badgeSvg = useMemo(() => createBadgeSvg(badgeInput), [badgeInput]);

  const openIconPainter = useCallback(() => {
    setActive("iconPainter");
    openWindowAnimated({
      id: "iconPainter",
      title: "Icon Painter",
      parentId: "iconPainter",
      sourceRect: iconPainterButtonRef.current?.getBoundingClientRect(),
      preferredSize: { width: 580, height: 384 },
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
    window.open(createBadgeUrl(badgeInput), "_blank", "noopener,noreferrer");
  }, [badgeInput]);

  const copyBadgeUrl = useCallback(async () => {
    await navigator.clipboard?.writeText(createBadgeUrl(badgeInput));
  }, [badgeInput]);

  const openImportDialog = useCallback(() => {
    setDialogIconId(selectedIconId ?? savedIcons[0]?.id ?? null);
    setIsImportOpen(true);
  }, [savedIcons, selectedIconId]);

  const chooseIcon = useCallback(() => {
    setSelectedIconId(dialogIconId);
    setIsImportOpen(false);
  }, [dialogIconId]);

  return (
    <div className={s.badgeGenerator}>
      <section className={s.previewPanel}>
        <div
          className={s.badgePreview}
          dangerouslySetInnerHTML={{ __html: badgeSvg }}
        />
      </section>

      <section className={s.controlsPanel}>
        <div className={s.title}>Badge Generator</div>

        <label className={s.field}>
          <span>Name:</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className={s.field}>
          <span>Role:</span>
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
        </label>
        <label className={s.field}>
          <span>Stack:</span>
          <input
            value={stack}
            onChange={(event) => setStack(event.target.value)}
          />
        </label>
        <label className={s.field}>
          <span>Contact:</span>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />
        </label>

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
          <label className={s.field}>
            <span>Save:</span>
          </label>
          <MacButton variant="default" onClick={exportPng}>
            export png
          </MacButton>

          <label className={s.field}>
            <span>Share:</span>
          </label>
          <MacButton onClick={openBadgeUrl}>open url</MacButton>
          <MacButton onClick={copyBadgeUrl}>copy url</MacButton>
        </div>
      </section>

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
