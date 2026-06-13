import { memo } from "react";
import type { CSSProperties } from "react";

import { MacProgress } from "../../../components/UIKit";
import {
  EASTER_EGG_COUNT,
  EASTER_EGG_DEFINITIONS,
} from "../easterEggDefinitions";
import { useEasterEggProgress } from "../useEasterEggProgress";
import s from "./EasterEggLogDocument.module.scss";

export const EasterEggLogDocument = memo(function EasterEggLogDocument() {
  const foundEggIds = useEasterEggProgress((state) => state.foundEggIds);
  const foundEggs = foundEggIds
    .map((eggId) => EASTER_EGG_DEFINITIONS.find((egg) => egg.id === eggId))
    .filter(
      (egg): egg is (typeof EASTER_EGG_DEFINITIONS)[number] => Boolean(egg),
    );

  return (
    <article className={s.document}>
      <section className={s.summary}>
        <div className={s.progressHeader}>
          <span>Found {foundEggs.length} of {EASTER_EGG_COUNT}</span>
        </div>
        <MacProgress
          className={s.progress}
          value={foundEggs.length}
          max={EASTER_EGG_COUNT}
          aria-label="Easter egg progress"
          style={
            {
              "--mac-progress-width": "100%",
            } as CSSProperties
          }
        />
      </section>

      <section className={s.listSection}>
        <ul className={s.list}>
          {foundEggs.map((egg) => (
            <li key={egg.id}>{egg.label}</li>
          ))}
        </ul>
      </section>
    </article>
  );
});
