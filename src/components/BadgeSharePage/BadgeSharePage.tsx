import { useMemo } from "react";

import { portfolio } from "../../data/portfolio";
import { createBlankIconPixels } from "../IconPainter/iconPainterDesktop";
import {
  createBadgeSvg,
  readBadgeInputFromSearch,
  type BadgeInput,
} from "../BadgeGenerator/badgeCard";
import s from "./BadgeSharePage.module.scss";

const DEFAULT_STACK = portfolio.skills
  .filter((skill) => ["TypeScript", "React", "Vue", "Nuxt"].includes(skill))
  .join(" / ");

const DEFAULT_CONTACT =
  portfolio.contacts.find((contact) => contact.label === "Telegram")?.href ??
  portfolio.contacts[0]?.href ??
  "";

const FALLBACK_BADGE: BadgeInput = {
  name: portfolio.profile.name,
  role: portfolio.profile.role,
  stack: DEFAULT_STACK,
  contact: DEFAULT_CONTACT,
  pixels: createBlankIconPixels(),
};

export function BadgeSharePage() {
  const badgeSvg = useMemo(() => {
    const input = readBadgeInputFromSearch(window.location.search, FALLBACK_BADGE);

    document.title = `${input.name} badge`;

    return createBadgeSvg(input);
  }, []);

  return (
    <main className={s.badgePage}>
      <div
        className={s.badgeFrame}
        dangerouslySetInnerHTML={{ __html: badgeSvg }}
      />
    </main>
  );
}
