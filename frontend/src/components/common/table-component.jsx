"use client";
import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
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
} from "@mui/material";
import { FaPen, FaTrashAlt, FaFileDownload, FaInfoCircle } from "react-icons/fa";
import { formatDate, formatDateTime } from "@/utils/utils";

const TableComponents = ({
  columns,
  rows,
  page,
  setPage,
  totalRows,
  totalPages,
  onEdit,
  onDelete,
  onDetail,
  hasActions,
  rowsPerPage = 10,
  title,
  hasDownloadPdf,
  onDownload,
  loading,
}) => {
  const handleChangePage = (_, value) => setPage(value);

  const theme = useTheme();
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((o, key) => (o ? o[key] : "-"), obj);
  };

  // === state tracking download progress per row ===
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const handleDownload = async (id) => {
    if (!id) return;
    setDownloadingIds((prev) => new Set(prev).add(id));
    try {
      await onDownload?.(id); // sudah async di ReportTable
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <Box>
      {/* Table */}
      <Paper
        sx={(theme) => ({
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#E2E8F0",
          [theme.breakpoints.up("xs")]: { p: "10px" },
          [theme.breakpoints.up("sm")]: { p: "16px" },
          [theme.breakpoints.up("lg")]: { p: "24px" },
        })}
      >
        {title && (
          <Typography
            variant="h6"
            sx={{
              py: 2,
            }}
          >
            {title}
          </Typography>
        )}
        <TableContainer sx={{ overflowX: "scroll" }} className="custom-scroll">
          <Table
            sx={{
              "& th, & td": {
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #334155",
                    px: 1,
                  }}
                >
                  No
                </TableCell>
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      borderBottom: "1px solid #334155",
                      px: 1,
                    }}
                  >
                    {column.title}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #334155",
                      px: 1,
                    }}
                  >
                    ACTIONS
                  </TableCell>
                )}
                {hasDownloadPdf && (
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #334155",
                      px: 1,
                    }}
                  >
                    DOWNLOAD
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (hasActions ? 1 : 0) +
                      (hasDownloadPdf ? 1 : 0) +
                      1
                    }
                    align="center"
                  >
                    <Box sx={{ py: 4 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (hasActions ? 1 : 0) +
                      (hasDownloadPdf ? 1 : 0) +
                      1
                    }
                    align="center"
                  >
                    <Typography sx={{ py: 4, fontWeight: 500 }}>
                      Data Is Empty
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid #56577A",
                        paddingBlock: "20px",
                        fontSize: "14px",
                        px: 1,
                      }}
                    >
                      {(page - 1) * rowsPerPage + (i + 1)}
                    </TableCell>
                    {columns.map((column, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          borderBottom: "1px solid #56577A",
                          paddingBlock: "20px",
                          fontSize: "14px",
                          px: 1,
                        }}
                      >
                        {/* Custom render function support */}
                        {column.render
                          ? column.render(row)
                          : column.field === "status" ||
                        column.field === "status.name"
                          ? (() => {
                              const rawStatusOriginal =
                                getNestedValue(row, column.field) || "";
                              const rawStatus = rawStatusOriginal
                                .toString()
                                .toLowerCase();

                              let bgColor = "transparent";
                              let textColor = (theme) =>
                                theme.palette.text.primary;

                              if (rawStatus === "active") {
                                bgColor = "#01B574";
                                textColor = "#fff";
                              } else if (rawStatus === "inactive") {
                                bgColor = "#FF2056";
                                textColor = "#fff";
                              }

                              return (
                                <Typography
                                  sx={{
                                    width: "fit-content",
                                    px: bgColor !== "transparent" ? "8px" : 0,
                                    py: bgColor !== "transparent" ? "4px" : 0,
                                    borderRadius:
                                      bgColor !== "transparent" ? "6px" : 0,
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {rawStatusOriginal || "-"}
                                </Typography>
                              );
                            })()
                          : (() => {
                              const value =
                                typeof column.field === "function"
                                  ? column.field(row)
                                  : getNestedValue(row, column.field);

                              if (typeof column.field !== "function") {
                                if (column.field.endsWith("date_activation")) {
                                  return formatDate(value);
                                }
                                if (
                                  column.field.endsWith("termination_time") ||
                                  column.field.endsWith("activation_time")
                                ) {
                                  return formatDateTime(value);
                                }
                              }
                              return value;
                            })()}
                      </TableCell>
                    ))}
                    {hasDownloadPdf && (
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #56577A",
                          paddingBlock: "20px",
                          fontSize: "14px",
                        }}
                      >
                        <Box sx={{ display: "flex" }}>
                          {downloadingIds.has(row?.id) ? (
                            <CircularProgress size={20} />
                          ) : (
                            <IconButton
                              onClick={() => handleDownload(row?.id)}
                              disabled={downloadingIds.has(row?.id)}
                              aria-label="Download PDF"
                            >
                              <FaFileDownload size={20} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    )}
                    {hasActions && (
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #56577A",
                          paddingBlock: "20px",
                          fontSize: "14px",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: "8px" }}>
                          {onDetail && (
                            <IconButton onClick={() => onDetail(row.id)}>
                              <FaInfoCircle size={20} />
                            </IconButton>
                          )}
                          <IconButton onClick={() => onEdit(row.id)}>
                            <FaPen size={20} />
                          </IconButton>
                          <IconButton onClick={() => onDelete(row.id)}>
                            <FaTrashAlt size={20} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          px: 1,
        }}
      >
        <Typography sx={{ fontSize: "14px" }}>
          {rows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
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
              borderColor: "#E2E8F0",
              color: "#1E293B",
              "&:hover": {
                backgroundColor: "#F1F5F9",
              },
              "&.Mui-selected": {
                backgroundColor: "#2F80ED",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#1D6FD3",
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default TableComponents;
