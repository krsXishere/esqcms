"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import FilterBar from "@/components/common/FilterBar";
import QCTable from "@/components/common/QCTable";

// Mock data - Current Revisions
const mockRevisions = [
  { id: 1, no: "QC-2026-001", model: "Pump XYZ-100", inspector: "John Doe", reason: "Measurement error on dimension A", requestedBy: "Jane Checker", status: "revision", date: "2026-01-13", priority: "high" },
  { id: 2, no: "QC-2026-004", model: "Pump GHI-400", inspector: "Alice Brown", reason: "Missing visual inspection data", requestedBy: "Bob Checker", status: "revision", date: "2026-01-12", priority: "medium" },
  { id: 3, no: "QC-2026-007", model: "Pump MNO-700", inspector: "Charlie Davis", reason: "Incomplete part list", requestedBy: "Jane Checker", status: "revision", date: "2026-01-11", priority: "low" },
  { id: 4, no: "QC-2026-012", model: "Pump PQR-800", inspector: "Diana Evans", reason: "Wrong serial number recorded", requestedBy: "Bob Checker", status: "revision", date: "2026-01-10", priority: "high" },
  { id: 5, no: "QC-2026-015", model: "Pump STU-900", inspector: "Edward Foster", reason: "Photos not attached", requestedBy: "Jane Checker", status: "revision", date: "2026-01-09", priority: "medium" },
];

// Mock data - Revision History
const mockRevisionHistory = [
  { id: 1, no: "QC-2025-998", model: "Pump ABC-200", inspector: "Frank Miller", reason: "Dimension out of tolerance", requestedBy: "Alice Checker", revisedAt: "2026-01-08T14:30:00Z", completedAt: "2026-01-09T10:15:00Z", duration: "19h 45m" },
  { id: 2, no: "QC-2025-995", model: "Pump DEF-300", inspector: "Grace Wilson", reason: "Missing signatures", requestedBy: "Bob Checker", revisedAt: "2026-01-07T09:00:00Z", completedAt: "2026-01-07T16:20:00Z", duration: "7h 20m" },
  { id: 3, no: "QC-2025-992", model: "Pump GHI-400", inspector: "Henry Johnson", reason: "Incomplete test data", requestedBy: "Jane Checker", revisedAt: "2026-01-06T11:15:00Z", completedAt: "2026-01-07T09:30:00Z", duration: "22h 15m" },
  { id: 4, no: "QC-2025-989", model: "Pump JKL-500", inspector: "Ivy Brown", reason: "Photo documentation needed", requestedBy: "Alice Checker", revisedAt: "2026-01-05T13:45:00Z", completedAt: "2026-01-05T17:00:00Z", duration: "3h 15m" },
  { id: 5, no: "QC-2025-986", model: "Pump MNO-600", inspector: "Jack Davis", reason: "Calibration certificate expired", requestedBy: "Bob Checker", revisedAt: "2026-01-04T10:30:00Z", completedAt: "2026-01-06T15:45:00Z", duration: "53h 15m" },
];

// Table columns
const columns = [
  { field: "no", headerName: "Checksheet No", highlight: true },
  { field: "model", headerName: "Model" },
  { 
    field: "inspector", 
    headerName: "Inspector",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: "#E5E7EB", fontSize: "0.75rem" }}>
          {row.inspector?.charAt(0)}
        </Avatar>
        <Typography variant="body2" color="inherit">{row.inspector}</Typography>
      </Box>
    )
  },
  { field: "reason", headerName: "Revision Reason" },
  { field: "requestedBy", headerName: "Requested By" },
  { 
    field: "priority", 
    headerName: "Priority",
    render: (row) => (
      <Chip
        label={row.priority?.toUpperCase()}
        size="small"
        sx={{
          bgcolor: row.priority === "high" ? "#FEE2E2" : row.priority === "medium" ? "#FEF3C7" : "#E5E7EB",
          color: row.priority === "high" ? "#DC2626" : row.priority === "medium" ? "#D97706" : "#6B7280",
          fontWeight: 600,
          fontSize: "0.7rem",
        }}
      />
    )
  },
  { field: "date", headerName: "Date" },
];

// History table columns
const historyColumns = [
  { field: "no", headerName: "Checksheet No", highlight: true },
  { field: "model", headerName: "Model" },
  { 
    field: "inspector", 
    headerName: "Inspector",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: "#E5E7EB", fontSize: "0.75rem" }}>
          {row.inspector?.charAt(0)}
        </Avatar>
        <Typography variant="body2" color="inherit">{row.inspector}</Typography>
      </Box>
    )
  },
  { field: "reason", headerName: "Revision Reason" },
  { 
    field: "revisedAt", 
    headerName: "Revised At",
    render: (row) => new Date(row.revisedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  },
  { 
    field: "completedAt", 
    headerName: "Completed At",
    render: (row) => new Date(row.completedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  },
  { 
    field: "duration", 
    headerName: "Duration",
    render: (row) => (
      <Chip
        label={row.duration}
        size="small"
        sx={{
          bgcolor: "#EBF5FF",
          color: "#1E40AF",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
    )
  },
];

const RevisionsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [inspector, setInspector] = useState("");
  const [requestedBy, setRequestedBy] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setPriority("");
    setInspector("");
    setRequestedBy("");
  };

  const activeFiltersCount = [priority, inspector, requestedBy, search].filter(Boolean).length;

  // Filter options
  const filters = [
    {
      name: "priority",
      label: "Priority",
      value: priority,
      onChange: setPriority,
      options: [
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
      width: 150,
    },
    {
      name: "inspector",
      label: "Inspector",
      value: inspector,
      onChange: setInspector,
      options: [
        { value: "john", label: "John Doe" },
        { value: "alice", label: "Alice Brown" },
        { value: "charlie", label: "Charlie Davis" },
        { value: "diana", label: "Diana Evans" },
      ],
      width: 180,
    },
    {
      name: "requestedBy",
      label: "Requested By",
      value: requestedBy,
      onChange: setRequestedBy,
      options: [
        { value: "jane", label: "Jane Checker" },
        { value: "bob", label: "Bob Checker" },
        { value: "alice_checker", label: "Alice Checker" },
      ],
      width: 180,
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          Revision Queue
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
          Review and manage pending revisions
        </Typography>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Current Revisions Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} color="#111827" sx={{ mb: 2 }}>
          Current Revisions
        </Typography>
        <QCTable
          columns={columns}
          rows={mockRevisions}
          page={page}
          setPage={setPage}
          totalRows={mockRevisions.length}
          totalPages={1}
          rowsPerPage={10}
          showActions={true}
          onView={(row) => console.log("View:", row)}
          onEdit={(row) => console.log("Edit:", row)}
        />
      </Box>

      {/* Revision History Table */}
      <Box>
        <Typography variant="h6" fontWeight={600} color="#111827" sx={{ mb: 2 }}>
          Revision History
        </Typography>
        <QCTable
          columns={historyColumns}
          rows={mockRevisionHistory}
          page={1}
          setPage={() => {}}
          totalRows={mockRevisionHistory.length}
          totalPages={1}
          rowsPerPage={10}
          showActions={false}
        />
      </Box>
    </Box>
  );
};

export default RevisionsPage;
