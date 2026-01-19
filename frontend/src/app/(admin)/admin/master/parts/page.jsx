"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import QCTable from "@/components/common/QCTable";
import FilterBar from "@/components/common/FilterBar";

const mockParts = [
  { id: 1, code: "PRT-001", name: "Impeller", category: "Rotor", material: "Stainless Steel 316", status: "active" },
  { id: 2, code: "PRT-002", name: "Shaft", category: "Rotor", material: "Carbon Steel", status: "active" },
  { id: 3, code: "PRT-003", name: "Casing", category: "Housing", material: "Cast Iron", status: "active" },
  { id: 4, code: "PRT-004", name: "Mechanical Seal", category: "Seal", material: "Ceramic/Carbon", status: "active" },
  { id: 5, code: "PRT-005", name: "Bearing", category: "Support", material: "Chrome Steel", status: "inactive" },
];

// Table columns
const columns = [
  { field: "code", headerName: "Part Code", highlight: true },
  { 
    field: "name", 
    headerName: "Part Name",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "#EBF5FF" }}><BuildIcon sx={{ color: "#2F80ED", fontSize: 18 }} /></Avatar>
        <Typography variant="body2" color="inherit">{row.name}</Typography>
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
  { field: "material", headerName: "Material" },
  { field: "status", headerName: "Status" },
];

const PartsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

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
              Parts & Components
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
                fontSize: "0.875rem",
              }}
            >
              Manage parts, components, and assemblies master data
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "#3B82F6",
              "&:hover": { bgcolor: "#2563EB" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Part
          </Button>
        </Stack>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search parts..."
      />

      {/* Data Table */}
      <QCTable
        columns={columns}
        rows={mockParts}
        page={page}
        setPage={setPage}
        totalRows={mockParts.length}
        totalPages={1}
        rowsPerPage={10}
        showActions={true}
        onEdit={(row) => console.log("Edit:", row)}
        onDelete={(row) => console.log("Delete:", row)}
      />
    </Box>
  );
};

export default PartsPage;
