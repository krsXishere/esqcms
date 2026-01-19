"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import QCTable from "@/components/common/QCTable";
import FilterBar from "@/components/common/FilterBar";

// Mock data
const mockTemplates = [
  { id: 1, name: "In Process Inspection", code: "TPL-IP-001", type: "In Process", fields: 45, lastModified: "2026-01-10", status: "active" },
  { id: 2, name: "Final Inspection", code: "TPL-FI-001", type: "Final", fields: 62, lastModified: "2026-01-08", status: "active" },
  { id: 3, name: "Receiving Inspection", code: "TPL-RI-001", type: "Receiving", fields: 28, lastModified: "2026-01-05", status: "active" },
  { id: 4, name: "Dimensional Check", code: "TPL-DC-001", type: "In Process", fields: 35, lastModified: "2026-01-03", status: "draft" },
  { id: 5, name: "Visual Inspection", code: "TPL-VI-001", type: "Final", fields: 20, lastModified: "2025-12-28", status: "inactive" },
];

// Table columns
const columns = [
  { 
    field: "name", 
    headerName: "Template Name",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ p: 1, bgcolor: "#EBF5FF", borderRadius: 1.5 }}>
          <DescriptionIcon sx={{ color: "#2F80ED", fontSize: 20 }} />
        </Box>
        <Typography variant="body2" fontWeight={600} color="inherit">{row.name}</Typography>
      </Box>
    )
  },
  { field: "code", headerName: "Code", highlight: true },
  { 
    field: "type", 
    headerName: "Type",
    render: (row) => (
      <Chip label={row.type} size="small" sx={{ bgcolor: "#F3F4F6", color: "#374151", fontWeight: 500 }} />
    )
  },
  { 
    field: "fields", 
    headerName: "Fields",
    render: (row) => (
      <Typography variant="body2" color="inherit">{row.fields} fields</Typography>
    )
  },
  { field: "lastModified", headerName: "Last Modified" },
  { field: "status", headerName: "Status" },
];

const TemplatesPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [status, setStatus] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setTemplateType("");
    setStatus("");
    setPage(1);
  };

  const handleCreateTemplate = () => {
    router.push("/admin/checksheet/templates/create");
  };

  const activeFiltersCount = [search, templateType, status].filter(Boolean).length;

  const filters = [
    {
      name: "type",
      label: "Type",
      value: templateType,
      onChange: setTemplateType,
      options: [
        { value: "In Process", label: "In Process" },
        { value: "Final", label: "Final" },
        { value: "Receiving", label: "Receiving" },
      ],
      width: 150,
    },
    {
      name: "status",
      label: "Status",
      value: status,
      onChange: setStatus,
      options: [
        { value: "active", label: "Active" },
        { value: "draft", label: "Draft" },
        { value: "inactive", label: "Inactive" },
      ],
      width: 150,
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          Checksheet Templates
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
            Manage and configure inspection checksheet templates
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTemplate}
            sx={{
              bgcolor: "#3B82F6",
              "&:hover": { bgcolor: "#2563EB" },
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}
          >
            Create Template
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: "Total Templates", value: 5, color: "#2F80ED", bgColor: "#EBF5FF" },
          { label: "Active", value: 3, color: "#10B981", bgColor: "#D1FAE5" },
          { label: "Draft", value: 1, color: "#F59E0B", bgColor: "#FEF3C7" },
          { label: "Inactive", value: 1, color: "#6B7280", bgColor: "#F3F4F6" },
        ].map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card 
              sx={{ 
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                <Typography variant="body2" color="#1F2937" fontWeight={500} sx={{ mt: 0.5 }}>{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Table */}
      <QCTable
        columns={columns}
        rows={mockTemplates}
        page={page}
        setPage={setPage}
        totalRows={mockTemplates.length}
        totalPages={1}
        rowsPerPage={10}
        showActions={true}
        onView={(row) => console.log("View:", row)}
        onEdit={(row) => console.log("Edit:", row)}
        onDelete={(row) => console.log("Delete:", row)}
      />
    </Box>
  );
};

export default TemplatesPage;
