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
                EASTER_EGG_DEFINITIONS.some((egg) => egg.id === eggId),
              )
            : [],
        };
      },
    },
  ),
);
