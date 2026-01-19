import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  open: false, // default tertutup
  toggleSidebar: () => set((state) => ({ open: !state.open })),
  openSidebar: () => set({ open: true }),
  closeSidebar: () => set({ open: false }),
}));
