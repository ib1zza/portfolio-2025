import { memo, useEffect, useState } from "react";

import { MacButton } from "../../../components/UIKit";
import { useHaptics } from "../../../hooks/useHaptics";
import s from "./HyperCardStack.module.scss";

interface HyperCard {
  title: string;
  body: string;
  items?: string[];
}

const CARDS: HyperCard[] = [
  {
    title: "Welcome",
    body: "You have discovered a hidden stack.",
  },
  {
    title: "Tools",
    body: "",
    items: ["React", "TypeScript", "Three.js", "Zustand", "Vite"],
  },
  {
    title: "Developer Notes",
    body: "Good software should feel curious.",
  },
  {
    title: "Credits",
    body: "Thanks for exploring.",
  },
];

export const HyperCardStack = memo(function HyperCardStack() {
  const [cardIndex, setCardIndex] = useState(0);
  const haptics = useHaptics({ throttleMs: 120 });
  const card = CARDS[cardIndex];

  useEffect(() => {
    void haptics.easterEgg("finderClick");
  }, [haptics]);

  return (
    <div className={s.stack}>
      <section className={s.card} aria-label={card.title}>
        <div className={s.cardBadge}>card {cardIndex + 1}</div>
        <h1>{card.title}</h1>
        {card.body && <p>{card.body}</p>}
        {card.items && (
          <ul>
            {card.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>

      <footer className={s.nav}>
        <MacButton
          disabled={cardIndex === 0}
          onClick={() => setCardIndex((current) => Math.max(0, current - 1))}
        >
          Previous
        </MacButton>
        <span>
          {cardIndex + 1} / {CARDS.length}
        </span>
        <MacButton
          disabled={cardIndex === CARDS.length - 1}
          variant="default"
          onClick={() =>
            setCardIndex((current) => Math.min(CARDS.length - 1, current + 1))
          }
        >
          Next
        </MacButton>
      </footer>
    </div>
  );
});
