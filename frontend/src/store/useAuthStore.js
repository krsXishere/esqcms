"use client";
import { create } from "zustand";
import Cookies from "js-cookie";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,

  // Actions
  setAuth: (userData, token) => {
    const role = userData?.role || "super_admin";
    set({
      user: userData,
      token: token,
      role: role,
      isAuthenticated: true,
    });
    Cookies.set("token", token, { expires: 7, secure: false });
    Cookies.set("role", role, { expires: 7, secure: false });
    localStorage.setItem("role", role);
  },

  logout: () => {
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    });
    Cookies.remove("token");
    Cookies.remove("role");
    localStorage.removeItem("role");
  },

  // Getters
  isSuperAdmin: () => get().role === "super_admin",
  isInspector: () => get().role === "inspector",
  isChecker: () => get().role === "checker",
  isApprover: () => get().role === "approver",

  // Check if user has permission
  hasRole: (requiredRole) => {
    const currentRole = get().role;
    if (requiredRole === "super_admin") return currentRole === "super_admin";
    if (requiredRole === "approver") return ["super_admin", "approver"].includes(currentRole);
    if (requiredRole === "checker") return ["super_admin", "approver", "checker"].includes(currentRole);
    return true;
  },
}));
