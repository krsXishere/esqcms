"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import QCTable from "@/components/common/QCTable";
import FilterBar from "@/components/common/FilterBar";

const mockCustomers = [
  { id: 1, code: "CUS-001", name: "PT. ABC Industries", country: "Indonesia", contact: "John Doe", phone: "+62 21 1234567", status: "active" },
  { id: 2, code: "CUS-002", name: "XYZ Corporation", country: "Japan", contact: "Tanaka San", phone: "+81 3 1234567", status: "active" },
  { id: 3, code: "CUS-003", name: "Global Pump Ltd", country: "Singapore", contact: "Lee Wei", phone: "+65 6789 0123", status: "active" },
  { id: 4, code: "CUS-004", name: "PT. Maju Bersama", country: "Indonesia", contact: "Budi Santoso", phone: "+62 21 9876543", status: "inactive" },
];

// Table columns
const columns = [
  { field: "code", headerName: "Customer Code", highlight: true },
  { 
    field: "name", 
    headerName: "Company Name",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "#E0E7FF" }}><BusinessIcon sx={{ color: "#4F46E5", fontSize: 18 }} /></Avatar>
        <Typography variant="body2" fontWeight={500} color="inherit">{row.name}</Typography>
      </Box>
    )
  },
  { field: "country", headerName: "Country" },
  { field: "contact", headerName: "Contact Person" },
  { field: "phone", headerName: "Phone" },
  { field: "status", headerName: "Status" },
];

const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          Customers
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
            Manage customer database and relationships
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
            Add Customer
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search customers..."
      />

      <QCTable
        columns={columns}
        rows={mockCustomers}
        page={page}
        setPage={setPage}
        totalRows={mockCustomers.length}
        totalPages={1}
        rowsPerPage={10}
        showActions={true}
        onEdit={(row) => console.log("Edit:", row)}
        onDelete={(row) => console.log("Delete:", row)}
      />
    </Box>
  );
};

export default CustomersPage;
