"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Pagination,
  Paper,
  CircularProgress,
  Chip,
  Tooltip,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

/**
 * QCTable Component - Transparent background style table for QC System
 * Light theme only with high contrast colors
 */
const QCTable = ({
  columns,
  rows,
  page = 1,
  setPage,
  totalRows = 0,
  totalPages = 1,
  rowsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  onDownload,
  showActions = true,
  hasDownloadPdf = false,
  loading = false,
  title,
  subtitle,
  headerAction,
  emptyMessage = "No data available",
}) => {
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const handleChangePage = (_, value) => setPage(value);

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((o, key) => (o ? o[key] : "-"), obj);
  };

  const handleDownload = async (id) => {
    if (!id) return;
    setDownloadingIds((prev) => new Set(prev).add(id));
    try {
      await onDownload?.(id);
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Status color mapping
  const getStatusStyle = (status) => {
    const statusLower = status?.toString().toLowerCase();
    const styles = {
      active: { bg: "#10B981", color: "#FFFFFF" },
      inactive: { bg: "#EF4444", color: "#FFFFFF" },
      pending: { bg: "#F59E0B", color: "#FFFFFF" },
      approved: { bg: "#10B981", color: "#FFFFFF" },
      rejected: { bg: "#EF4444", color: "#FFFFFF" },
      checked: { bg: "#3B82F6", color: "#FFFFFF" },
      revision: { bg: "#F59E0B", color: "#FFFFFF" },
      draft: { bg: "#6B7280", color: "#FFFFFF" },
      completed: { bg: "#10B981", color: "#FFFFFF" },
      in_progress: { bg: "#3B82F6", color: "#FFFFFF" },
    };
    return styles[statusLower] || { bg: "#6B7280", color: "#FFFFFF" };
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Table Container */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header with Title and Action */}
        {(title || subtitle || headerAction) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
              pt: 3,
              pb: 2,
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            <Box>
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#111827",
                    mb: subtitle ? 0.5 : 0,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6B7280",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {headerAction && <Box>{headerAction}</Box>}
          </Box>
        )}
        
        <TableContainer sx={{ overflowX: "auto", flex: 1 }} className="custom-scroll">
          <Table>
            <TableHead>
              <TableRow>
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
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
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
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column.headerName || column.title}
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
                    }}
                  >
                    Actions
                  </TableCell>
                )}
                {hasDownloadPdf && (
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
                    }}
                  >
                    Download
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showActions ? 1 : 0) + (hasDownloadPdf ? 1 : 0) + 1}
                    align="center"
                    sx={{ borderBottom: "none", py: 6 }}
                  >
                    <CircularProgress size={40} sx={{ color: "#2F80ED" }} />
                    <Typography variant="body2" sx={{ mt: 2, color: "#6B7280" }}>
                      Loading data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showActions ? 1 : 0) + (hasDownloadPdf ? 1 : 0) + 1}
                    align="center"
                    sx={{ borderBottom: "none", py: 6 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: "#6B7280",
                      }}
                    >
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow
                    key={row.id || i}
                    sx={{
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {(page - 1) * rowsPerPage + (i + 1)}
                    </TableCell>
                    {columns.map((column, index) => (
                      <TableCell
                        key={index}
                        align={column.align || "left"}
                        sx={{
                          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                          color: "#374151",
                          py: 2.5,
                          px: 2,
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        {/* Custom render function support */}
                        {column.render ? (
                          column.render(row, i)
                        ) : column.field === "status" || column.field?.includes("status") ? (
                          (() => {
                            const rawStatus = getNestedValue(row, column.field) || "";
                            const statusStyle = getStatusStyle(rawStatus);
                            return (
                              <Chip
                                label={rawStatus || "-"}
                                size="small"
                                sx={{
                                  bgcolor: statusStyle.bg,
                                  color: statusStyle.color,
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  textTransform: "capitalize",
                                  height: 26,
                                }}
                              />
                            );
                          })()
                        ) : (
                          (() => {
                            const value =
                              typeof column.field === "function"
                                ? column.field(row)
                                : getNestedValue(row, column.field);
                            
                            // Highlight for specific fields like code/no
                            if (column.highlight) {
                              return (
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    color: "#2F80ED",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {value || "-"}
                                </Typography>
                              );
                            }
                            return value || "-";
                          })()
                        )}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                          px: 2,
                        }}
                      >
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {onView && (
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => onView(row)}
                                sx={{
                                  color: "#6B7280",
                                  "&:hover": {
                                    bgcolor: "rgba(47, 128, 237, 0.1)",
                                    color: "#2F80ED",
                                  },
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
                                  color: "#6B7280",
                                  "&:hover": {
                                    bgcolor: "rgba(245, 158, 11, 0.1)",
                                    color: "#F59E0B",
                                  },
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
                                  color: "#6B7280",
                                  "&:hover": {
                                    bgcolor: "rgba(239, 68, 68, 0.1)",
                                    color: "#EF4444",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                    {hasDownloadPdf && (
                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                          px: 2,
                        }}
                      >
                        {downloadingIds.has(row?.id) ? (
                          <CircularProgress size={20} sx={{ color: "#2F80ED" }} />
                        ) : (
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(row?.id)}
                              sx={{
                                color: "#6B7280",
                                "&:hover": {
                                  bgcolor: "rgba(47, 128, 237, 0.1)",
                                  color: "#2F80ED",
                                },
                              }}
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Pagination - Inside Card */}
        {rows.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
              py: 2.5,
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
              backgroundColor: "rgba(249, 250, 251, 0.5)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#6B7280",
                fontWeight: 500,
              }}
            >
              Showing {rows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
              {(page - 1) * rowsPerPage + rows.length} of {totalRows} entries
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              variant="outlined"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderColor: "rgba(0, 0, 0, 0.15)",
                  color: "#374151",
                  fontWeight: 500,
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#2F80ED",
                    borderColor: "#2F80ED",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#1E6FD9",
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default QCTable;
