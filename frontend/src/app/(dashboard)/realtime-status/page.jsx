"use client";
import React, { useState } from "react";
import { Suspense } from "react";
import { CircularProgress, Box, Tabs, Tab, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MdMonitor } from "react-icons/md";
import { IoPulseOutline } from "react-icons/io5";
import StatusContainer from "./status-container";
import TelemetryContainer from "../telemetry/telemetry-container";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`realtime-tabpanel-${index}`}
      aria-labelledby={`realtime-tab-${index}`}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </div>
  );
};

const RealtimeStatusPage = () => {
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
            aria-label="realtime status tabs"
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
              icon={<MdMonitor size={18} />}
              iconPosition="start"
              label="Real-time Status"
            />
            <Tab
              icon={<IoPulseOutline size={18} />}
              iconPosition="start"
              label="Telemetry"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <TabPanel value={tabValue} index={0}>
            <StatusContainer />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <TelemetryContainer />
          </TabPanel>
        </Box>
      </Box>
    </Suspense>
  );
};

export default RealtimeStatusPage;
