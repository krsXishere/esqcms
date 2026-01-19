"use client";
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TbRobot, TbCurrencyDollar, TbSettings } from "react-icons/tb";
import AutoWORulesTab from "./auto-wo-rules-tab";
import EconomicConfigTab from "./economic-config-tab";

const ROISettingsPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("auto-wo-rules");

  const tabs = [
    {
      id: "auto-wo-rules",
      label: "Auto WO Rules",
      icon: <TbRobot size={18} />,
    },
    {
      id: "economic-config",
      label: "Economic Config",
      icon: <TbCurrencyDollar size={18} />,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Tab Buttons */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "contained" : "outlined"}
            startIcon={tab.icon}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              ...(activeTab === tab.id
                ? {
                    bgcolor: "#3B82F6",
                    "&:hover": { bgcolor: "#2563EB" },
                  }
                : {
                    backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#fff",
                    borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    color: theme.palette.text.primary,
                    "&:hover": {
                      backgroundColor: theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
                      borderColor: theme.palette.primary.main,
                    },
                  }),
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Tab Content */}
      {activeTab === "auto-wo-rules" && <AutoWORulesTab />}
      {activeTab === "economic-config" && <EconomicConfigTab />}
    </Box>
  );
};

export default ROISettingsPage;
