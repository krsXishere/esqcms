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
import InventoryIcon from "@mui/icons-material/Inventory";
import QCTable from "@/components/common/QCTable";
import FilterBar from "@/components/common/FilterBar";

const mockMaterials = [
  { id: 1, code: "MAT-001", name: "Stainless Steel 316", type: "Metal", grade: "SS316L", spec: "ASTM A240", status: "active" },
  { id: 2, code: "MAT-002", name: "Carbon Steel", type: "Metal", grade: "A36", spec: "ASTM A36", status: "active" },
  { id: 3, code: "MAT-003", name: "Cast Iron", type: "Metal", grade: "GG25", spec: "DIN 1691", status: "active" },
  { id: 4, code: "MAT-004", name: "Bronze", type: "Alloy", grade: "C95400", spec: "ASTM B148", status: "active" },
  { id: 5, code: "MAT-005", name: "PTFE", type: "Polymer", grade: "PTFE-25", spec: "ASTM D4894", status: "inactive" },
];

// Table columns
const columns = [
  { field: "code", headerName: "Material Code", highlight: true },
  { 
    field: "name", 
    headerName: "Material Name",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "#FEF3C7" }}><InventoryIcon sx={{ color: "#D97706", fontSize: 18 }} /></Avatar>
        <Typography variant="body2" fontWeight={500} color="inherit">{row.name}</Typography>
      </Box>
    )
  },
  { 
    field: "type", 
    headerName: "Type",
    render: (row) => (
      <Chip label={row.type} size="small" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "inherit" }} />
    )
  },
  { field: "grade", headerName: "Grade" },
  { field: "spec", headerName: "Specification" },
  { field: "status", headerName: "Status" },
];

const MaterialsPage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          Materials
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
            Manage raw materials and specifications
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
            Add Material
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search materials..."
      />

      <QCTable
        columns={columns}
        rows={mockMaterials}
        page={page}
        setPage={setPage}
        totalRows={mockMaterials.length}
        totalPages={1}
        rowsPerPage={10}
        showActions={true}
        onEdit={(row) => console.log("Edit:", row)}
        onDelete={(row) => console.log("Delete:", row)}
      />
    </Box>
  );
};

export default MaterialsPage;
