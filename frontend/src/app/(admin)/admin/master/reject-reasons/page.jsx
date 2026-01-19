"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import QCTable from "@/components/common/QCTable";
import FilterBar from "@/components/common/FilterBar";

const mockRejectReasons = [
  { id: 1, code: "REJ-001", name: "Dimensional Out of Spec", category: "Measurement", severity: "high", count: 45, status: "active" },
  { id: 2, code: "REJ-002", name: "Surface Defect", category: "Visual", severity: "medium", count: 28, status: "active" },
  { id: 3, code: "REJ-003", name: "Missing Component", category: "Assembly", severity: "high", count: 22, status: "active" },
  { id: 4, code: "REJ-004", name: "Wrong Material", category: "Material", severity: "critical", count: 18, status: "active" },
  { id: 5, code: "REJ-005", name: "Functional Failure", category: "Performance", severity: "critical", count: 15, status: "active" },
  { id: 6, code: "REJ-006", name: "Documentation Error", category: "Documentation", severity: "low", count: 12, status: "inactive" },
];

const getSeverityColor = (severity) => {
  const colors = {
    critical: { bg: "#FEE2E2", color: "#DC2626" },
    high: { bg: "#FFEDD5", color: "#EA580C" },
    medium: { bg: "#FEF3C7", color: "#D97706" },
    low: { bg: "#D1FAE5", color: "#059669" },
  };
  return colors[severity] || colors.medium;
};

// Table columns
const columns = [
  { field: "code", headerName: "Code", highlight: true },
  { 
    field: "name", 
    headerName: "Reject Reason",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "#FEE2E2" }}><ReportProblemIcon sx={{ color: "#DC2626", fontSize: 18 }} /></Avatar>
        <Typography variant="body2" fontWeight={500} color="inherit">{row.name}</Typography>
      </Box>
    )
  },
  { 
    field: "category", 
    headerName: "Category",
    render: (row) => (
      <Chip label={row.category} size="small" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "inherit" }} />
    )
  },
  { 
    field: "severity", 
    headerName: "Severity",
    render: (row) => {
      const severityColor = getSeverityColor(row.severity);
      return (
        <Chip 
          label={row.severity.charAt(0).toUpperCase() + row.severity.slice(1)} 
          size="small" 
          sx={{ bgcolor: severityColor.bg, color: severityColor.color, fontWeight: 600 }} 
        />
      );
    }
  },
  { field: "count", headerName: "Usage Count" },
  { field: "status", headerName: "Status" },
];

const RejectReasonsPage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          Reject Reasons
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
            Define and manage rejection categories and severity levels
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            sx={{ 
              bgcolor: "#3B82F6", 
              "&:hover": { bgcolor: "#2563EB" }, 
              textTransform: "none", 
              fontWeight: 600,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}
          >
            Add Reject Reason
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search reject reasons..."
      />

      <QCTable
        columns={columns}
        rows={mockRejectReasons}
        page={page}
        setPage={setPage}
        totalRows={mockRejectReasons.length}
        totalPages={1}
        rowsPerPage={10}
        showActions={true}
        onEdit={(row) => console.log("Edit:", row)}
        onDelete={(row) => console.log("Delete:", row)}
      />
    </Box>
  );
};

export default RejectReasonsPage;
