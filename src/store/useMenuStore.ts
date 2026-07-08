import { create } from 'zustand';

export interface MenuAction {
  title: string;
  action: () => void;
  disabled?: boolean;
  checked?: boolean; // Added optional checked property for Window menu
}

export interface CustomTab {
  title: string;
  submenu: Array<MenuAction | null>;
}

interface MenuStore {
  fileMenuOverrides: Array<MenuAction | null> | null;
  editMenuOverrides: Array<MenuAction | null> | null;
  customTabs: CustomTab[];

  setAppMenu: (
    customTabs?: CustomTab[],
    fileOverrides?: Array<MenuAction | null>,
    editOverrides?: Array<MenuAction | null>
  ) => void;
  clearAppMenu: () => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  fileMenuOverrides: null,
  editMenuOverrides: null,
  customTabs: [],

  setAppMenu: (customTabs = [], fileOverrides = undefined, editOverrides = undefined) =>
    set({
      customTabs,
      fileMenuOverrides: fileOverrides ?? null,
      editMenuOverrides: editOverrides ?? null,
    }),

  clearAppMenu: () =>
    set({
      customTabs: [],
      fileMenuOverrides: null,
      editMenuOverrides: null,
    }),
}));