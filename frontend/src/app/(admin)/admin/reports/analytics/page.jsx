"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Skeleton,
} from "@mui/material";
import {
  FileDownloadOutlined as ExportIcon,
  Share as ShareIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";
import GlobalFilters from "./GlobalFilters";
import KPICards from "./KPICards";
import DIRAnalytics from "./DIRAnalytics";
import FIAnalytics from "./FIAnalytics";
import PredictiveInsights from "./PredictiveInsights";
import DetailDrawer from "./DetailDrawer";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    checksheetType: "DIR",
    dateType: "inspection",
    dateStart: "2026-01-01",
    dateEnd: "2026-01-13",
    models: [],
    customers: [],
    stations: [],
    status: [],
    includeAfterRepair: false,
    onlyNG: false,
    sampleMode: "aggregated",
  });

  // Mock Data - DIR
  const dirData = {
    kpi: {
      totalChecksheets: 428,
      ngRate: 4.2,
      afterRepairRate: 1.1,
      worstCpk: 0.87,
      avgCpk: 1.42,
    },
    capabilityData: [
      {
        parameter: "Shaft Diameter",
        lsl: 24.95,
        usl: 25.05,
        mean: 25.03,
        sigma: 0.028,
        cp: 0.89,
        cpk: 0.87,
        sampleSize: 123,
        outOfSpecCount: 12,
        histogramData: [
          { range: "< 24.95", count: 2 },
          { range: "24.95-24.98", count: 18 },
          { range: "24.98-25.02", count: 52 },
          { range: "25.02-25.05", count: 38 },
          { range: "> 25.05", count: 13 },
        ],
        trendData: [
          { week: "W1", actual: 25.02, lsl: 24.95, usl: 25.05, target: 25 },
          { week: "W2", actual: 25.01, lsl: 24.95, usl: 25.05, target: 25 },
          { week: "W3", actual: 25.03, lsl: 24.95, usl: 25.05, target: 25 },
          { week: "W4", actual: 25.04, lsl: 24.95, usl: 25.05, target: 25 },
          { week: "W5", actual: 25.03, lsl: 24.95, usl: 25.05, target: 25 },
        ],
        relatedChecksheets: [
          { id: "CS-001", date: "2026-01-10", value: "25.06", status: "NG" },
          { id: "CS-002", date: "2026-01-11", value: "25.01", status: "OK" },
          { id: "CS-003", date: "2026-01-12", value: "24.93", status: "NG" },
        ],
      },
      {
        parameter: "Housing Length",
        lsl: 49.85,
        usl: 50.15,
        mean: 50.02,
        sigma: 0.045,
        cp: 1.67,
        cpk: 1.56,
      },
      {
        parameter: "Bearing Clearance",
        lsl: 0.02,
        usl: 0.08,
        mean: 0.045,
        sigma: 0.012,
        cp: 1.25,
        cpk: 1.18,
      },
      {
        parameter: "Flange Thickness",
        lsl: 5.85,
        usl: 6.15,
        mean: 5.98,
        sigma: 0.055,
        cp: 1.36,
        cpk: 1.33,
      },
      {
        parameter: "Bolt Circle Diameter",
        lsl: 149.8,
        usl: 150.2,
        mean: 149.95,
        sigma: 0.042,
        cp: 1.59,
        cpk: 1.55,
      },
    ],
    histogramData: [
      { range: "< 24.95", count: 2 },
      { range: "24.95-24.98", count: 18 },
      { range: "24.98-25.02", count: 52 },
      { range: "25.02-25.05", count: 38 },
      { range: "> 25.05", count: 13 },
    ],
    trendData: [
      { week: "W1", actual: 25.02, lsl: 24.95, usl: 25.05, target: 25 },
      { week: "W2", actual: 25.01, lsl: 24.95, usl: 25.05, target: 25 },
      { week: "W3", actual: 25.03, lsl: 24.95, usl: 25.05, target: 25 },
      { week: "W4", actual: 25.04, lsl: 24.95, usl: 25.05, target: 25 },
      { week: "W5", actual: 25.03, lsl: 24.95, usl: 25.05, target: 25 },
      { week: "W6", actual: 25.02, lsl: 24.95, usl: 25.05, target: 25 },
    ],
    outOfSpecData: [
      {
        timestamp: "2026-01-12 08:15",
        checksheetId: "CS-4287",
        model: "Model X",
        parameter: "Shaft Diameter",
        value: "25.06",
        deviation: "+0.01",
        operator: "John Doe",
      },
      {
        timestamp: "2026-01-12 10:42",
        checksheetId: "CS-4291",
        model: "Model X",
        parameter: "Shaft Diameter",
        value: "24.93",
        deviation: "-0.02",
        operator: "Jane Smith",
      },
      {
        timestamp: "2026-01-11 14:25",
        checksheetId: "CS-4255",
        model: "Model Y",
        parameter: "Bearing Clearance",
        value: "0.085",
        deviation: "+0.005",
        operator: "Mike Johnson",
      },
    ],
  };

  // Mock Data - FI
  const fiData = {
    kpi: {
      totalChecksheets: 382,
      ngRate: 6.8,
      afterRepairRate: 2.3,
      topDefect: {
        item: "Bolt Loose",
        percentage: 42,
      },
      repairSuccessRate: 78,
    },
    paretoData: [
      { item: "Bolt Loose", count: 52, cumulative: 42 },
      { item: "Paint Defect", count: 35, cumulative: 70 },
      { item: "Shaft Scratch", count: 18, cumulative: 85 },
      { item: "Casing Dent", count: 12, cumulative: 95 },
      { item: "Others", count: 7, cumulative: 100 },
    ],
    ngTrendData: [
      { date: "Jan 1", boltLoose: 5, paintDefect: 3, shaftScratch: 2 },
      { date: "Jan 2", boltLoose: 7, paintDefect: 4, shaftScratch: 1 },
      { date: "Jan 3", boltLoose: 4, paintDefect: 5, shaftScratch: 3 },
      { date: "Jan 4", boltLoose: 8, paintDefect: 3, shaftScratch: 2 },
      { date: "Jan 5", boltLoose: 6, paintDefect: 4, shaftScratch: 1 },
      { date: "Jan 6", boltLoose: 5, paintDefect: 6, shaftScratch: 2 },
      { date: "Jan 7", boltLoose: 9, paintDefect: 3, shaftScratch: 3 },
    ],
    afterRepairData: [
      { item: "Bolt Loose", afterRepair: 32, repeatNG: 11 },
      { item: "Paint Defect", afterRepair: 18, repeatNG: 2 },
      { item: "Shaft Scratch", afterRepair: 7, repeatNG: 0 },
      { item: "Casing Dent", afterRepair: 5, repeatNG: 1 },
    ],
    evidenceData: [
      {
        imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
        defect: "Bolt Loose",
        checksheetId: "FI-1234",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=300&fit=crop",
        defect: "Paint Defect",
        checksheetId: "FI-1235",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop",
        defect: "Shaft Scratch",
        checksheetId: "FI-1236",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&h=300&fit=crop",
        defect: "Casing Dent",
        checksheetId: "FI-1237",
      },
    ],
  };

  // Predictive Insights Data
  const dirInsightsData = {
    riskLevel: "HIGH",
    drivers: [
      "Cpk of Shaft Diameter has declined for 3 consecutive periods",
      "Mean is drifting toward USL (currently at 25.03, USL: 25.05)",
      "Out-of-spec frequency increased by 40% this week",
    ],
    recommendations: [
      {
        title: "Inspect and recalibrate measurement equipment",
        description: "Verify caliper accuracy and ensure proper calibration intervals are maintained",
      },
      {
        title: "Review machining process parameters",
        description: "Check spindle speed, feed rate, and tool wear on CNC machines",
      },
      {
        title: "Implement hourly monitoring for critical parameter",
        description: "Add Shaft Diameter to real-time SPC control chart",
      },
    ],
    insights: [
      {
        severity: "error",
        title: "Critical Process Drift Detected",
        message:
          "Parameter 'Shaft Diameter' shows a consistent upward trend approaching USL. Mean has shifted from 25.00 to 25.03 over the last 3 weeks. This indicates potential tool wear or process setting drift.",
        recommendation:
          "Immediate action: Stop production and verify tool condition. Check fixture alignment and coolant temperature.",
      },
      {
        severity: "warning",
        title: "Bearing Clearance Variability Increasing",
        message:
          "Standard deviation for Bearing Clearance increased from 0.010 to 0.012 in the last month. While still within acceptable Cpk (1.18), the trend suggests process instability.",
        recommendation:
          "Review assembly procedure and operator training. Consider implementing poka-yoke devices.",
      },
    ],
  };

  const fiInsightsData = {
    riskLevel: "HIGH",
    drivers: [
      "Bolt Loose defect consistently represents 42% of all NG items",
      "After Repair success rate for Bolt Loose is only 66% (target: >90%)",
      "Repeat NG for Bolt Loose indicates systemic issue",
    ],
    recommendations: [
      {
        title: "Conduct torque verification audit",
        description: "Verify all torque wrenches are calibrated and operators follow proper tightening sequence",
      },
      {
        title: "Implement torque monitoring system",
        description: "Install digital torque wrenches with data logging capability for critical bolts",
      },
      {
        title: "Review and update work instruction",
        description: "Add visual aids and step-by-step bolt tightening procedure with checkpoints",
      },
      {
        title: "Conduct operator retraining program",
        description: "Focus on proper bolt installation technique and torque application",
      },
    ],
    insights: [
      {
        severity: "error",
        title: "Systemic Issue: Bolt Loose Defect",
        message:
          "Item 'Bolt Loose' represents 42% of all NG occurrences on Model X. Analysis shows 34% repeat rate after repair, indicating the root cause is not being addressed during rework.",
        recommendation:
          "Conduct 5-Why analysis and update repair procedure. Consider design review for bolt specification.",
      },
      {
        severity: "warning",
        title: "Paint Defect Trending Upward",
        message:
          "Paint defects increased from 3 per day to 6 per day over the last week. Most common issues: overspray and color mismatch.",
        recommendation:
          "Check spray booth pressure, paint viscosity, and batch consistency. Review paint supplier quality.",
      },
    ],
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleResetFilters = () => {
    setFilters({
      checksheetType: "DIR",
      dateType: "inspection",
      dateStart: "2026-01-01",
      dateEnd: "2026-01-13",
      models: [],
      customers: [],
      stations: [],
      status: [],
      includeAfterRepair: false,
      onlyNG: false,
      sampleMode: "aggregated",
    });
  };

  const handleParameterClick = (parameter) => {
    setSelectedDetail(parameter);
    setDetailDrawerOpen(true);
  };

  const handleDefectClick = (defect) => {
    // Transform pareto data for detail drawer
    const detailData = {
      item: defect.item,
      totalNG: defect.count,
      afterRepair: fiData.afterRepairData.find((d) => d.item === defect.item)?.afterRepair || 0,
      repeatNG: fiData.afterRepairData.find((d) => d.item === defect.item)?.repeatNG || 0,
      percentage: defect.cumulative,
      repairSuccessRate: 75,
      topModel: "Model X",
      trendData: fiData.ngTrendData,
      relatedChecksheets: [
        { id: "FI-001", date: "2026-01-10", model: "Model X", status: "NG" },
        { id: "FI-002", date: "2026-01-11", model: "Model Y", status: "After Repair" },
        { id: "FI-003", date: "2026-01-12", model: "Model X", status: "NG" },
      ],
    };
    setSelectedDetail(detailData);
    setDetailDrawerOpen(true);
  };

  const handleExport = () => {
    // Implement export logic
    console.log("Exporting report with filters:", filters);
  };

  const handleShare = () => {
    // Implement share logic
    console.log("Generating shareable link with filters:", filters);
  };

  const currentData = filters.checksheetType === "DIR" ? dirData : fiData;
  const currentInsights =
    filters.checksheetType === "DIR" ? dirInsightsData : fiInsightsData;

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#111827",
              mb: 0.5,
            }}
          >
            QC Analytics – DIR / FI
          </Typography>
          <Typography
            sx={{
              fontSize: "0.95rem",
              color: "#6B7280",
            }}
          >
            Comprehensive quality control monitoring and statistical process analysis
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{
              color: "#374151",
              borderColor: "#E5E7EB",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "10px",
              "&:hover": {
                borderColor: "#D1D5DB",
                bgcolor: "#F9FAFB",
              },
            }}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            sx={{
              color: "#374151",
              borderColor: "#E5E7EB",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "10px",
              "&:hover": {
                borderColor: "#D1D5DB",
                bgcolor: "#F9FAFB",
              },
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<HelpIcon />}
            sx={{
              color: "#374151",
              borderColor: "#E5E7EB",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "10px",
              "&:hover": {
                borderColor: "#D1D5DB",
                bgcolor: "#F9FAFB",
              },
            }}
          >
            Help
          </Button>
        </Stack>
      </Stack>

      {/* Global Filters */}
      <GlobalFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {loading ? (
        <Box>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <KPICards data={currentData.kpi} checksheetType={filters.checksheetType} />

          {/* Conditional Analytics Content */}
          {filters.checksheetType === "DIR" ? (
            <DIRAnalytics
              data={{
                capabilityData: currentData.capabilityData,
                histogramData: currentData.histogramData,
                trendData: currentData.trendData,
                outOfSpecData: currentData.outOfSpecData,
              }}
              onParameterClick={handleParameterClick}
            />
          ) : (
            <FIAnalytics
              data={{
                paretoData: currentData.paretoData,
                ngTrendData: currentData.ngTrendData,
                afterRepairData: currentData.afterRepairData,
                evidenceData: currentData.evidenceData,
              }}
              onDefectClick={handleDefectClick}
              onEvidenceClick={(item) => console.log("Evidence clicked:", item)}
            />
          )}

          {/* Predictive Insights */}
          <Box sx={{ mt: 3 }}>
            <PredictiveInsights
              data={currentInsights}
              checksheetType={filters.checksheetType}
            />
          </Box>
        </>
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        data={selectedDetail}
        type={filters.checksheetType}
      />
    </Box>
  );
};

export default AnalyticsPage;
