import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createThrottledLocalStorage } from "../../utils/storage";
import {
  EASTER_EGG_DEFINITIONS,
  type EasterEggId,
} from "./easterEggDefinitions";

interface EasterEggProgressStore {
  foundEggIds: EasterEggId[];
  markFound: (eggId: EasterEggId) => void;
}

const STORAGE_KEY = "portfolio-2025-easter-egg-progress";

// ⚡ Bolt: pre-compute Set for O(1) lookups during migration
// 💡 What: Extracted validEggIds Set outside the component/migration function.
// 🎯 Why: Avoids recreating the Set on every store migration and changes O(N*M) lookup to O(N).
// 📊 Impact: Eliminates redundant array scanning and Set instantiation overhead.
// 🔬 Measurement: Observe lower execution time during state hydration/migration.
const validEggIds = new Set(EASTER_EGG_DEFINITIONS.map((egg) => egg.id));

export const useEasterEggProgress = create<EasterEggProgressStore>()(
  persist(
    (set) => ({
      foundEggIds: [],
      markFound: (eggId) => {
        set((state) =>
          state.foundEggIds.includes(eggId)
            ? state
            : { foundEggIds: [...state.foundEggIds, eggId] },
        );
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => createThrottledLocalStorage()),
      partialize: (state) => ({ foundEggIds: state.foundEggIds }),
      migrate: (persistedState) => {
        if (
          !persistedState ||
          typeof persistedState !== "object" ||
          !("foundEggIds" in persistedState)
        ) {
          return { foundEggIds: [] };
        }

        const foundEggIds = (persistedState as { foundEggIds?: unknown })
          .foundEggIds;

        return {
          foundEggIds: Array.isArray(foundEggIds)
            ? foundEggIds.filter((eggId): eggId is EasterEggId =>
                validEggIds.has(eggId as EasterEggId),
              )
            : [],
        };
      },
    },
  ),
);
