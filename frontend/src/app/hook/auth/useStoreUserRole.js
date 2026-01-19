"use client";
import { useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export const useStoreUserRole = () => {
  const ROLE_KEY = "role";

  // Simpan role dan informasi user ke localStorage dari token
  const setRole = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      const role = decoded?.role;
      const username = decoded?.username;
      const adminId = decoded?.id || decoded?.admin_id;
      const areaId = decoded?.area_id || decoded?.area?.id || null;
      const areaName = decoded?.area?.name || null;

      if (role) {
        localStorage.setItem(ROLE_KEY, role);
      }

      if (username) localStorage.setItem("username", username);
      if (adminId !== undefined && adminId !== null)
        localStorage.setItem("admin_id", String(adminId));
      if (areaId) localStorage.setItem("area_id", String(areaId));
      if (areaName) localStorage.setItem("area_name", areaName);
    } catch (error) {
      console.error("Gagal decode token:", error);
    }
  }, []);

  // Ambil role dari localStorage
  const getRole = useCallback(() => {
    return localStorage.getItem(ROLE_KEY);
  }, []);

  const getUsername = useCallback(() => {
    return localStorage.getItem("username");
  }, []);

  const getAdminId = useCallback(() => {
    return localStorage.getItem("admin_id");
  }, []);

  const getAreaId = useCallback(() => {
    return localStorage.getItem("area_id");
  }, []);

  // Hapus role dari localStorage (misalnya saat logout)
  const clearRole = useCallback(() => {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem("username");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("area_id");
    localStorage.removeItem("area_name");
  }, []);

  return { setRole, getRole, clearRole, getUsername, getAdminId, getAreaId };
};
