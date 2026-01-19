"use client";
import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Pagination,
  Checkbox,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import SkeletonTable from "./SkeletonTable";
import EmptyState from "./EmptyState";

/**
 * DataTable Component
 * Reusable server-side table with sorting, pagination, and actions
 */
const DataTable = ({
  columns,
  rows,
  page = 1,
  limit = 10,
  totalRows = 0,
  totalPages = 1,
  onPageChange,
  onLimitChange,
  sortField,
  sortDirection,
  onSort,
  loading = false,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  selectable = false,
  selected = [],
  onSelectAll,
  onSelectRow,
  emptyMessage = "No data found",
  emptySubMessage = "Try adjusting your filters or search criteria",
}) => {
  const handleSort = (field) => {
    if (onSort) {
      const newDirection =
        sortField === field && sortDirection === "asc" ? "desc" : "asc";
      onSort(field, newDirection);
    }
  };

  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Loading state
  if (loading) {
    return <SkeletonTable columns={columns.length + (showActions ? 1 : 0)} rows={limit} />;
  }

  // Empty state
  if (!rows || rows.length === 0) {
    return (
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
        }}
      >
        <EmptyState message={emptyMessage} subMessage={emptySubMessage} />
      </Paper>
    );
  }

  const isAllSelected = selectable && rows.length > 0 && selected.length === rows.length;
  const isIndeterminate = selectable && selected.length > 0 && selected.length < rows.length;

  return (
    <Paper
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        backdropFilter: "blur(10px)",
        overflow: "hidden",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    sx={{
                      color: "#94A3B8",
                      "&.Mui-checked": { color: "#2F80ED" },
                    }}
                  />
                </TableCell>
              )}
              <TableCell
                sx={{
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                  color: "#374151",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  py: 2,
                  px: 2,
                  backgroundColor: "rgba(249, 250, 251, 0.8)",
                }}
              >
                No
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || "left"}
                  sx={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                    color: "#374151",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    py: 2,
                    px: 2,
                    backgroundColor: "rgba(249, 250, 251, 0.8)",
                    minWidth: column.minWidth,
                    width: column.width,
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={sortField === column.field ? sortDirection : "asc"}
                      onClick={() => handleSort(column.field)}
                      sx={{
                        "&.MuiTableSortLabel-root": {
                          color: "#64748B",
                        },
                        "&.Mui-active": {
                          color: "#2F80ED",
                        },
                      }}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
              {showActions && (
                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                    color: "#374151",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    py: 2,
                    px: 2,
                    backgroundColor: "rgba(249, 250, 251, 0.8)",
                    width: 120,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const isSelected = selectable && selected.includes(row.id);
              const rowNumber = (page - 1) * limit + index + 1;

              return (
                <TableRow
                  key={row.id || index}
                  hover
                  selected={isSelected}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(249, 250, 251, 0.3)",
                    },
                    "&.Mui-selected": {
                      bgcolor: "#EAF4FF",
                      "&:hover": {
                        bgcolor: "#D6E9FF",
                      },
                    },
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => onSelectRow?.(row.id, e.target.checked)}
                        sx={{
                          color: "#94A3B8",
                          "&.Mui-checked": { color: "#2F80ED" },
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>{rowNumber}</TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.align || "left"}
                      sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      {column.renderCell
                        ? column.renderCell(row)
                        : getNestedValue(row, column.field) || "-"}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        {onView && (
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => onView(row)}
                              sx={{
                                color: "#64748B",
                                "&:hover": { color: "#2F80ED", bgcolor: "#EAF4FF" },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row)}
                              sx={{
                                color: "#64748B",
                                "&:hover": { color: "#F59E0B", bgcolor: "#FEF3C7" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(row)}
                              sx={{
                                color: "#64748B",
                                "&:hover": { color: "#EF4444", bgcolor: "#FEE2E2" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination - Inside Card */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          backgroundColor: "rgba(249, 250, 251, 0.5)",
        }}
      >
        <Typography variant="body2" color="#64748B" sx={{ fontWeight: 500 }}>
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalRows)} of {totalRows} entries
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
          shape="rounded"
          size="small"
          sx={{
            "& .MuiPaginationItem-root": {
              color: "#64748B",
              fontWeight: 500,
              "&.Mui-selected": {
                bgcolor: "#2F80ED",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor: "#1D6FD3",
                },
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  if (!path) return obj;
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

export default DataTable;
