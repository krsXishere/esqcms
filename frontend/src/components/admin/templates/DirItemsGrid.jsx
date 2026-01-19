"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Chip,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";

/**
 * DIR Items Grid Component
 * Editable grid for measurement items with nominal and tolerance
 */

const DirItemsGrid = ({ items, onItemsChange, disabled }) => {
  const [editRowsModel, setEditRowsModel] = useState({});

  const handleAddRow = () => {
    const newItem = {
      id: Date.now(), // Temporary ID
      seq: items.length + 1,
      itemName: "",
      nominal: "",
      tolMin: "",
      tolMax: "",
    };
    onItemsChange([...items, newItem]);
  };

  const handleDeleteRow = (id) => {
    const updatedItems = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, seq: index + 1 }));
    onItemsChange(updatedItems);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all items?")) {
      onItemsChange([]);
    }
  };

  const handleProcessRowUpdate = (newRow) => {
    const updatedItems = items.map((item) =>
      item.id === newRow.id ? newRow : item
    );
    onItemsChange(updatedItems);
    return newRow;
  };

  const validateRow = (row) => {
    const errors = [];
    if (!row.itemName?.trim()) errors.push("Item Name is required");
    if (row.nominal === "" || row.nominal === null) errors.push("Nominal is required");
    if (row.tolMin === "" || row.tolMin === null) errors.push("Tol Min is required");
    if (row.tolMax === "" || row.tolMax === null) errors.push("Tol Max is required");
    if (parseFloat(row.tolMin) > parseFloat(row.tolMax)) {
      errors.push("Tol Min must be ≤ Tol Max");
    }
    return errors;
  };

  const columns = [
    {
      field: "seq",
      headerName: "Code",
      width: 70,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <DragIndicatorIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "itemName",
      headerName: "MT",
      flex: 1,
      minWidth: 200,
      editable: !disabled,
      renderCell: (params) => {
        const errors = validateRow(params.row);
        const hasError = errors.length > 0;
        return (
          <Typography
            variant="body2"
            sx={{
              color: hasError && !params.value ? "#EF4444" : "inherit",
            }}
          >
            {params.value || ""}
          </Typography>
        );
      },
    },
    {
      field: "nominal",
      headerName: "SPEC",
      width: 120,
      editable: !disabled,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const errors = validateRow(params.row);
        const hasError = errors.some(e => e.includes("Nominal"));
        return (
          <Typography
            variant="body2"
            sx={{
              color: hasError ? "#EF4444" : "inherit",
              fontWeight: 500,
            }}
          >
            {params.value !== "" && params.value !== null ? params.value : ""}
          </Typography>
        );
      },
    },
    {
      field: "tolMin",
      headerName: "Tol Min",
      width: 120,
      editable: !disabled,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const errors = validateRow(params.row);
        const hasError = errors.some(e => e.includes("Tol Min"));
        return (
          <Typography
            variant="body2"
            sx={{
              color: hasError ? "#EF4444" : "#059669",
              fontWeight: 500,
            }}
          >
            {params.value !== "" && params.value !== null ? params.value : ""}
          </Typography>
        );
      },
    },
    {
      field: "tolMax",
      headerName: "Tol Max",
      width: 120,
      editable: !disabled,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const errors = validateRow(params.row);
        const hasError = errors.some(e => e.includes("Tol Max"));
        return (
          <Typography
            variant="body2"
            sx={{
              color: hasError ? "#EF4444" : "#EF4444",
              fontWeight: 500,
            }}
          >
            {params.value !== "" && params.value !== null ? params.value : ""}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteRow(params.row.id)}
              disabled={disabled}
              sx={{
                color: "#EF4444",
                "&:hover": { bgcolor: "#FEE2E2" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Toolbar */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "#F8FAFC",
          borderRadius: 2,
          border: "1px solid #E2E8F0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={<ListAltIcon sx={{ fontSize: 16 }} />}
            label={`${items.length} item${items.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{
              bgcolor: items.length > 0 ? "#DCFCE7" : "#F1F5F9",
              color: items.length > 0 ? "#166534" : "#64748B",
              fontWeight: 600,
              "& .MuiChip-icon": {
                color: items.length > 0 ? "#166534" : "#64748B",
              },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            disabled={disabled || items.length === 0}
            sx={{
              color: "#EF4444",
              "&:hover": { bgcolor: "#FEE2E2" },
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            disabled={disabled}
            sx={{
              bgcolor: "#2F80ED",
              "&:hover": { bgcolor: "#1E60C8" },
              boxShadow: "0 2px 4px rgba(47, 128, 237, 0.3)",
            }}
          >
            Add Row
          </Button>
        </Box>
      </Box>

      {/* Data Grid or Empty State */}
      {items.length === 0 ? (
        // Empty State
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "2px dashed #E2E8F0",
            borderRadius: 2,
            bgcolor: "#FAFAFA",
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <EditNoteIcon sx={{ fontSize: 40, color: "#6366F1" }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="#1E293B" gutterBottom>
            No Measurement Items Yet
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mb: 3, maxWidth: 300 }}>
            Start by adding measurement items with specifications and tolerances for quality control.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            disabled={disabled}
            sx={{
              bgcolor: "#2F80ED",
              "&:hover": { bgcolor: "#1E60C8" },
              px: 4,
              py: 1,
            }}
          >
            Add First Item
          </Button>
        </Paper>
      ) : (
        // Data Grid
        <Box
          sx={{
            height: Math.min(400, items.length * 56 + 60),
            width: "100%",
          }}
        >
          <DataGrid
            rows={items}
            columns={columns}
            processRowUpdate={handleProcessRowUpdate}
            onProcessRowUpdateError={(error) => console.error(error)}
            editMode="cell"
            disableRowSelectionOnClick
            hideFooter
            rowHeight={52}
            localeText={{
              noRowsLabel: "No measurement items added yet",
            }}
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              "& .MuiDataGrid-main": {
                backgroundColor: "#FFFFFF",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: "#FFFFFF",
              },
              "& .MuiDataGrid-overlay": {
                backgroundColor: "#FFFFFF",
                color: "#64748B",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #F1F5F9",
                color: "#1F2937 !important",
                fontSize: "0.875rem",
                backgroundColor: "#FFFFFF !important",
                py: 1,
                overflow: "visible",
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 2,
                  left: 2,
                  right: 2,
                  bottom: 2,
                  border: "2px solid #2F80ED",
                  borderRadius: "4px",
                  pointerEvents: "none",
                },
              },
              "& .MuiDataGrid-row": {
                overflow: "visible",
                backgroundColor: "#FFFFFF !important",
                transition: "background-color 0.15s ease",
                "&:hover": {
                  backgroundColor: "#F0F9FF !important",
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "#FAFAFA !important",
                  "&:hover": {
                    backgroundColor: "#F0F9FF !important",
                  },
                },
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: "#FFFFFF",
                overflow: "visible !important",
              },
              "& .MuiDataGrid-virtualScrollerContent": {
                overflow: "visible",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#F8FAFC",
                borderRadius: "8px 8px 0 0",
                borderBottom: "2px solid #E2E8F0",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#F8FAFC",
                py: 1.5,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#374151",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
              },
              "& .MuiDataGrid-columnSeparator": {
                color: "#E2E8F0",
              },
              "& .MuiDataGrid-menuIcon": {
                color: "#64748B",
              },
              "& .MuiDataGrid-sortIcon": {
                color: "#64748B",
              },
              "& .MuiInputBase-root": {
                color: "#1F2937",
                backgroundColor: "#FFFFFF",
              },
              "& .MuiInputBase-input": {
                color: "#1F2937 !important",
              },
            }}
          />
        </Box>
      )}

      {/* Tips Section - Always visible */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "#F0F9FF",
          borderRadius: 2,
          border: "1px solid #BFDBFE",
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: "#DBEAFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          <Typography sx={{ fontSize: 12 }}>💡</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="#1E40AF" display="block" fontWeight={600} sx={{ mb: 0.5 }}>
            Quick Tips
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="caption" color="#3B82F6">
              • Click cells to edit
            </Typography>
            <Typography variant="caption" color="#3B82F6">
              • Tol Min ≤ Tol Max
            </Typography>
            <Typography variant="caption" color="#3B82F6">
              • All fields required
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DirItemsGrid;
