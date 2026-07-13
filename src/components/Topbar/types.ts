import React from "react";

export interface SubmenuItemData {
  title: string;
  action: () => void;
  disabled?: boolean;
  checked?: boolean;
}

export interface TabData {
  title: React.ReactNode;
  submenu?: Array<SubmenuItemData | null>;
  mobileHidden?: boolean;
  isTitleTab?: boolean;
}

export interface SubmenuProps {
  items: Array<SubmenuItemData | null>;
  onItemClick: (action: () => void) => void;
  setRef: (el: HTMLDivElement | null) => void;
}
