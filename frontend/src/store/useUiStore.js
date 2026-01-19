"use client";
import { create } from "zustand";

export const useUiStore = create((set, get) => ({
  // Sidebar state
  sidebarOpen: true,
  sidebarCollapsed: false,

  // Loading states
  globalLoading: false,
  pageLoading: false,

  // Dialog states
  confirmDialog: {
    open: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
    severity: "warning", // warning | error | info
  },

  // Actions - Sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Actions - Loading
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  setPageLoading: (loading) => set({ pageLoading: loading }),

  // Actions - Confirm Dialog
  showConfirmDialog: (options) =>
    set({
      confirmDialog: {
        open: true,
        title: options.title || "Confirm Action",
        message: options.message || "Are you sure?",
        onConfirm: options.onConfirm || null,
        onCancel: options.onCancel || null,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        severity: options.severity || "warning",
      },
    }),

  closeConfirmDialog: () =>
    set((state) => ({
      confirmDialog: {
        ...state.confirmDialog,
        open: false,
      },
    })),

  // Breadcrumbs
  breadcrumbs: [],
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
}));
