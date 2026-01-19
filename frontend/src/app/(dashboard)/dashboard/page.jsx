"use client";
import React, { useState } from "react";
import ContainerLoad from "./container-load";
import { Box, Stack, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TableOverview from "./table-overview";
import AlarmContainer from "./alarm-container";
import MapBox from "./map-box";
import GanttWorkOrder from "./gantt-work-order";
import "mapbox-gl/dist/mapbox-gl.css";
import { TbLayoutDashboard, TbChartLine, TbHeartRateMonitor } from "react-icons/tb";

// ROI Analytics components
import ROISummaryCards from "../roi-analytics/roi-summary-cards";
import ROITrendChart from "../roi-analytics/roi-trend-chart";
import ROIByAreaChart from "../roi-analytics/roi-by-area-chart";
import TopSavingsTable from "../roi-analytics/top-savings-table";

// Health Summary component
import HealthSummaryContent from "./health-summary";

const DashboardPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("health");

  const tabs = [
    {
      id: "health",
      label: "Health Summary",
      icon: <TbHeartRateMonitor size={18} />,
    },
    {
      id: "overview",
      label: "Overview",
      icon: <TbLayoutDashboard size={18} />,
    },
    {
      id: "roi",
      label: "ROI",
      icon: <TbChartLine size={18} />,
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
      {activeTab === "health" && (
        <HealthSummaryContent />
      )}

      {activeTab === "overview" && (
        <>
          <ContainerLoad />
          <Stack
            sx={(theme) => ({
              flexDirection: "row",
              alignItems: "center",
              [theme.breakpoints.down("md")]: {
                gap: "16px",
                flexWrap: "wrap",
              },
              [theme.breakpoints.up("md")]: {
                // flexWrap: "wrap",
              },
              [theme.breakpoints.up("lg")]: {
                gap: "30px",
                flexWrap: "nowrap",
              },
            })}
          >
            <AlarmContainer />
            <MapBox />
          </Stack>
          <TableOverview />
          <GanttWorkOrder />
        </>
      )}

      {activeTab === "roi" && (
        <>
          {/* Summary Cards - Total Loss Avoided, Net Benefit, ROI % */}
          <ROISummaryCards />
          
          {/* Charts Row */}
          <Box
            sx={(theme) => ({
              display: "flex",
              flexDirection: "row",
              gap: "24px",
              [theme.breakpoints.down("md")]: {
                flexDirection: "column",
              },
            })}
          >
            <ROITrendChart />
            <ROIByAreaChart />
          </Box>
          
          {/* Top Savings Table */}
          <TopSavingsTable />
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
