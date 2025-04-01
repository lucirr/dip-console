'use client';

import { create } from 'zustand';

type SidebarStore = {
  activeMenu: string | null;
  activeSubMenu: string | null;
  expandedMenus: string[];
  setActiveMenu: (menu: string | null) => void;
  setActiveSubMenu: (subMenu: string | null) => void;
  toggleExpanded: (menu: string) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  activeMenu: '데이터관리',
  activeSubMenu: null,
  expandedMenus: [],
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setActiveSubMenu: (subMenu) => set({ activeSubMenu: subMenu }),
  toggleExpanded: (menu) => 
    set((state) => ({
      expandedMenus: state.expandedMenus.includes(menu)
        ? state.expandedMenus.filter(item => item !== menu)
        : [...state.expandedMenus, menu]
    })),
}));