"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  Button,
} from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import TimelineIcon from "@mui/icons-material/Timeline";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import Share from "@mui/icons-material/Share";
import QCTable from "@/components/common/QCTable";
import FilterBar from "@/components/common/FilterBar";

// Mock NG data
const ngTrendData = [
  { id: 1, reason: "Dimensional Out of Spec", count: 45, percentage: 32, trend: "up", category: "Measurement" },
  { id: 2, reason: "Surface Defect", count: 28, percentage: 20, trend: "down", category: "Visual" },
  { id: 3, reason: "Missing Component", count: 22, percentage: 16, trend: "stable", category: "Assembly" },
  { id: 4, reason: "Wrong Material", count: 18, percentage: 13, trend: "down", category: "Material" },
  { id: 5, reason: "Functional Failure", count: 15, percentage: 11, trend: "up", category: "Performance" },
  { id: 6, reason: "Documentation Error", count: 12, percentage: 8, trend: "stable", category: "Documentation" },
];

const getTrendColor = (trend) => {
  if (trend === "up") return "#EF4444";
  if (trend === "down") return "#10B981";
  return "#F59E0B";
};

// Table columns
const columns = [
  { field: "reason", headerName: "Reject Reason", highlight: true },
  { 
    field: "category", 
    headerName: "Category",
    render: (row) => (
      <Chip label={row.category} size="small" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "inherit", fontWeight: 500 }} />
    )
  },
  { field: "count", headerName: "Count" },
  { 
    field: "percentage", 
    headerName: "Distribution",
    render: (row) => (
      <Stack direction="row" alignItems="center" spacing={2}>
        <LinearProgress
          variant="determinate"
          value={row.percentage}
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.1)",
            "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "#2F80ED" },
          }}
        />
        <Typography variant="body2" color="inherit" sx={{ minWidth: 40 }}>{row.percentage}%</Typography>
      </Stack>
    )
  },
  { 
    field: "trend", 
    headerName: "Trend",
    render: (row) => (
      <Chip
        label={row.trend === "up" ? "↑ Increasing" : row.trend === "down" ? "↓ Decreasing" : "→ Stable"}
        size="small"
        sx={{
          bgcolor: row.trend === "up" ? "#FEE2E2" : row.trend === "down" ? "#D1FAE5" : "#FEF3C7",
          color: getTrendColor(row.trend),
          fontWeight: 600,
        }}
      />
    )
  },
];

const NGTrendPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    period: "thisMonth",
    category: "all",
    model: "all",
  });

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleClearFilters = () => {
    setFilters({ period: "thisMonth", category: "all", model: "all" });
  };

  // Filter bar configuration
  const filterBarItems = [
    {
      name: "period",
      label: "Period",
      value: filters.period,
      onChange: (value) => handleFilterChange("period", value),
      options: [
        { value: "thisMonth", label: "This Month" },
        { value: "lastMonth", label: "Last Month" },
        { value: "last3Months", label: "Last 3 Months" },
        { value: "last6Months", label: "Last 6 Months" },
        { value: "thisYear", label: "This Year" },
      ],
      width: 150,
    },
    {
      name: "category",
      label: "Category",
      value: filters.category,
      onChange: (value) => handleFilterChange("category", value),
      options: [
        { value: "Measurement", label: "Measurement" },
        { value: "Visual", label: "Visual" },
        { value: "Assembly", label: "Assembly" },
        { value: "Material", label: "Material" },
        { value: "Performance", label: "Performance" },
        { value: "Documentation", label: "Documentation" },
      ],
      width: 150,
    },
    {
      name: "model",
      label: "Model",
      value: filters.model,
      onChange: (value) => handleFilterChange("model", value),
      options: [
        { value: "ModelX", label: "Model X" },
        { value: "ModelY", label: "Model Y" },
        { value: "ModelZ", label: "Model Z" },
      ],
      width: 150,
    },
  ];

  const activeFiltersCount = [
    filters.period !== "thisMonth" ? 1 : 0,
    filters.category !== "all" ? 1 : 0,
    filters.model !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#111827",
                mb: 0.5,
              }}
            >
              NG Trend Analysis
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
                fontSize: "0.875rem",
              }}
            >
              Monitor and analyze rejection trends and patterns
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Share sx={{ fontSize: 18 }} />}
              sx={{
                color: "#64748B",
                borderColor: "#E5E7EB",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#D1D5DB",
                  bgcolor: "#F9FAFB",
                },
              }}
            >
              Share
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadOutlined sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "#3B82F6",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                "&:hover": {
                  bgcolor: "#2563EB",
                },
              }}
            >
              Export Report
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Filter Bar - Using common component */}
      <FilterBar
        filters={filterBarItems}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { 
            label: "Total NG This Month", 
            value: "140", 
            change: "+12%",
            trend: "up",
            color: "#EF4444", 
            bgColor: "#FEE2E2", 
            icon: WarningIcon 
          },
          { 
            label: "NG Rate", 
            value: "3.1%", 
            change: "-0.5%",
            trend: "down",
            color: "#10B981", 
            bgColor: "#D1FAE5", 
            icon: TrendingDownIcon 
          },
          { 
            label: "Most Common Issue", 
            value: "Dimensional", 
            change: "32%",
            trend: "stable",
            color: "#3B82F6", 
            bgColor: "#DBEAFE", 
            icon: TimelineIcon 
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "12px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                p: 2.5,
                height: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    sx={{ 
                      fontSize: "0.75rem", 
                      color: "#64748B", 
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 1,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: "2rem", 
                      fontWeight: 700, 
                      color: "#111827",
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {stat.trend === "up" && <TrendingUpIcon sx={{ fontSize: 16, color: "#EF4444" }} />}
                    {stat.trend === "down" && <TrendingDownIcon sx={{ fontSize: 16, color: "#10B981" }} />}
                    <Typography 
                      sx={{ 
                        fontSize: "0.75rem", 
                        color: stat.trend === "up" ? "#EF4444" : stat.trend === "down" ? "#10B981" : "#64748B",
                        fontWeight: 600,
                      }}
                    >
                      {stat.change} vs last month
                    </Typography>
                  </Stack>
                </Box>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: stat.bgColor, 
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <stat.icon sx={{ color: stat.color, fontSize: 28 }} />
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* NG Breakdown Table */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}>
          <Typography 
            sx={{ 
              fontSize: "1.125rem", 
              fontWeight: 600, 
              color: "#111827",
              mb: 0.5,
            }}
          >
            NG Breakdown by Reason
          </Typography>
          <Typography 
            sx={{ 
              fontSize: "0.875rem", 
              color: "#64748B",
            }}
          >
            Analysis of rejection reasons this month
          </Typography>
        </Box>

        <QCTable
          columns={columns}
          rows={ngTrendData}
          page={page}
          setPage={setPage}
          totalRows={ngTrendData.length}
          totalPages={1}
          rowsPerPage={10}
          showActions={false}
        />
      </Paper>
    </Box>
  );
};

export default NGTrendPage;
