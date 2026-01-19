"use client";
import React, { useState } from "react";
import { Suspense } from "react";
import { CircularProgress, Box, Tabs, Tab, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TbChartLine, TbCpu } from "react-icons/tb";
import AnalisysContainer from "./analysis-container";
import CodeDiagnoseContainer from "./code-diagnose/code-diagnose-container";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </div>
  );
};

const AnalisysDiagnosePage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Suspense fallback={<CircularProgress />}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2 }}>
        {/* Tab Header */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="analysis tabs"
            sx={{
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                minHeight: 48,
                gap: 1,
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#0075FF",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<TbChartLine size={18} />}
              iconPosition="start"
              label="Trend Analysis"
            />
            <Tab
              icon={<TbCpu size={18} />}
              iconPosition="start"
              label="Code Diagnose"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <TabPanel value={tabValue} index={0}>
            <AnalisysContainer />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <CodeDiagnoseContainer />
          </TabPanel>
        </Box>
      </Box>
    </Suspense>
  );
};

export default AnalisysDiagnosePage;
