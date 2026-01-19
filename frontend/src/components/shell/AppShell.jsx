"use client";
import React from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useUiStore } from "@/store/useUiStore";

const AppShell = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { sidebarOpen, sidebarCollapsed } = useUiStore();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F5F7FA",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <Box
          onClick={() => useUiStore.getState().closeSidebar()}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 1100,
          }}
        />
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // Prevent flex item from overflowing
          transition: "margin 0.3s ease",
        }}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
