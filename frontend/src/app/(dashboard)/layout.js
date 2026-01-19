import AppContainer from "@/components/app-container";
import AppNavbar from "@/components/app-navbar";
import AppSidebar from "@/components/app-sidebar";
import { Box } from "@mui/material";
import React from "react";
import DynamicTitle from "@/components/common/dynamic-title";

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", width: "100%", position: "relative" }}>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <AppContainer>
        <DynamicTitle />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <AppNavbar />
          {children}
        </Box>
      </AppContainer>
    </Box>
  );
};

export default DashboardLayout;
