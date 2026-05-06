import { memo } from "react";

import { useWindowManager } from "../../store/useWindowManager";
import { Window } from "./Window";

interface WindowContainerProps {
  id: string;
}

export const WindowContainer = memo(function WindowContainer({
  id,
}: WindowContainerProps) {
  const data = useWindowManager((state) => state.windows[id]);

  if (!data) return null;

  return <Window data={data} />;
});

