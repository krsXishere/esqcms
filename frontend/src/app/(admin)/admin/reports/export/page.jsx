"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HistoryIcon from "@mui/icons-material/History";
import FilterBar from "@/components/common/FilterBar";

const exportTypes = [
  { id: "checksheets", label: "Checksheet Data", icon: DescriptionIcon, description: "Export all checksheet records with inspection details", color: "#3B82F6" },
  { id: "analytics", label: "Analytics Report", icon: TableChartIcon, description: "Export performance metrics and statistics", color: "#10B981" },
  { id: "ng-report", label: "NG Report", icon: PictureAsPdfIcon, description: "Export rejection analysis and trends", color: "#EF4444" },
];

const ExportPage = () => {
  const [selectedType, setSelectedType] = useState("checksheets");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-01-13");
  const [format, setFormat] = useState("xlsx");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleClearFilters = () => {
    setDateFrom("2026-01-01");
    setDateTo("2026-01-13");
    setFormat("xlsx");
    setStatusFilter("all");
  };

  // Filter bar configuration
  const filterBarItems = [
    {
      name: "format",
      label: "Format",
      value: format,
      onChange: setFormat,
      options: [
        { value: "xlsx", label: "Excel (.xlsx)" },
        { value: "csv", label: "CSV (.csv)" },
        { value: "pdf", label: "PDF (.pdf)" },
      ],
      width: 150,
    },
    {
      name: "status",
      label: "Status Filter",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "approved", label: "Approved" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
      ],
      width: 150,
    },
  ];

  const activeFiltersCount = [
    format !== "xlsx" ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    dateFrom !== "2026-01-01" ? 1 : 0,
    dateTo !== "2026-01-13" ? 1 : 0,
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
              Export Data
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
                fontSize: "0.875rem",
              }}
            >
              Export checksheet data, analytics reports, and NG trends
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
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
              Export History
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Export Type Selection */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          p: 2,
          mb: 2,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#111827",
            mb: 2,
          }}
        >
          Export Type
        </Typography>
        <Grid container spacing={2}>
          {exportTypes.map((type) => (
            <Grid item xs={12} sm={4} key={type.id}>
              <Paper
                onClick={() => setSelectedType(type.id)}
                sx={{
                  backgroundColor: selectedType === type.id ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.9)",
                  border: selectedType === type.id ? "2px solid #3B82F6" : "1px solid rgba(0, 0, 0, 0.06)",
                  borderRadius: "12px",
                  p: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#3B82F6",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: selectedType === type.id ? `${type.color}15` : "#F3F4F6",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <type.icon sx={{ color: selectedType === type.id ? type.color : "#6B7280", fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#111827",
                        mb: 0.25,
                      }}
                    >
                      {type.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color: "#64748B",
                        lineHeight: 1.3,
                      }}
                    >
                      {type.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Filter Bar - Using common component */}
      <FilterBar
        filters={filterBarItems}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
        sticky
      >
        {/* Additional Date Range Filters */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#64748B",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              From Date
            </Typography>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#111827",
                backgroundColor: "#F5F7FA",
                boxSizing: "border-box",
              }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#64748B",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              To Date
            </Typography>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#111827",
                backgroundColor: "#F5F7FA",
                boxSizing: "border-box",
              }}
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: "#64748B",
              borderColor: "#E2E8F0",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              borderRadius: "8px",
              py: 0.5,
              px: 2,
              "&:hover": {
                borderColor: "#CBD5E1",
                bgcolor: "#F9FAFB",
              },
            }}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: "#3B82F6",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              borderRadius: "8px",
              py: 0.5,
              px: 3,
              "&:hover": {
                bgcolor: "#2563EB",
              },
            }}
          >
            Export Data
          </Button>
        </Stack>
      </FilterBar>

      {/* Recent Exports */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "12px",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          p: 3,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#111827",
            mb: 0.5,
          }}
        >
          Recent Exports
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "#64748B",
            mb: 3,
          }}
        >
          Download your previously exported files
        </Typography>
        
        <Stack spacing={2}>
          {[
            { name: "Checksheet_Export_2026-01-10.xlsx", date: "2026-01-10 14:30", size: "2.4 MB", type: "xlsx", color: "#10B981" },
            { name: "Analytics_Report_Dec2025.pdf", date: "2026-01-05 09:15", size: "856 KB", type: "pdf", color: "#EF4444" },
            { name: "NG_Trend_Q4_2025.xlsx", date: "2026-01-02 16:45", size: "1.2 MB", type: "xlsx", color: "#10B981" },
          ].map((file, index) => (
            <Paper
              key={index}
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                p: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  borderColor: "#3B82F6",
                },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: `${file.color}15`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {file.type === "pdf" ? (
                      <PictureAsPdfIcon sx={{ color: file.color, fontSize: 24 }} />
                    ) : (
                      <TableChartIcon sx={{ color: file.color, fontSize: 24 }} />
                    )}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#111827",
                        mb: 0.25,
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748B",
                        }}
                      >
                        {file.date}
                      </Typography>
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          bgcolor: "#CBD5E1",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748B",
                        }}
                      >
                        {file.size}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    sx={{
                      color: "#3B82F6",
                      "&:hover": { bgcolor: "#EFF6FF" },
                    }}
                  >
                    <FileDownloadIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: "#EF4444",
                      "&:hover": { bgcolor: "#FEE2E2" },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ExportPage;
