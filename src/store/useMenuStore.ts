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
  activeAppName: string | null;
  fileMenuOverrides: Array<MenuAction | null> | null;
  editMenuOverrides: Array<MenuAction | null> | null;
  customTabs: CustomTab[];

  setAppMenu: (
    appName: string,
    customTabs?: CustomTab[],
    fileOverrides?: Array<MenuAction | null>,
    editOverrides?: Array<MenuAction | null>
  ) => void;
  clearAppMenu: () => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  activeAppName: null,
  fileMenuOverrides: null,
  editMenuOverrides: null,
  customTabs: [],

  setAppMenu: (appName, customTabs = [], fileOverrides = undefined, editOverrides = undefined) =>
    set({
      activeAppName: appName,
      customTabs,
      fileMenuOverrides: fileOverrides ?? null,
      editMenuOverrides: editOverrides ?? null,
    }),

  clearAppMenu: () =>
    set({
      activeAppName: null,
      customTabs: [],
      fileMenuOverrides: null,
      editMenuOverrides: null,
    }),
}));