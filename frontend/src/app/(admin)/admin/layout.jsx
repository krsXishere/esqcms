"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import Cookies from "js-cookie";
import AdminSidebar, { DRAWER_WIDTH } from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Simple check - just verify token exists
    const token = Cookies.get("token");
    const role = Cookies.get("role") || localStorage.getItem("role");
    
    if (!token) {
      router.push("/login");
      return;
    }

    // For demo mode - just check if role exists
    if (role === "super_admin" || role === "admin") {
      setIsAuthorized(true);
    } else if (token) {
      // If token exists but no role, still allow for demo
      setIsAuthorized(true);
    } else {
      router.push("/login");
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#F9FAFB",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#2F80ED", mb: 2 }} />
          <Typography variant="body2" color="#6B7280">
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F9FAFB" }}>
      {/* Persistent Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          bgcolor: "#F9FAFB",
        }}
      >
        {/* Top Navigation Bar */}
        <AdminTopbar />
        
        {/* Page Content */}
        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
