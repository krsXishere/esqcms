import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Typography,
  Box,
} from "@mui/material";

const ProcessCapabilityTable = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "GOOD":
        return { bg: "#D1FAE5", text: "#10B981" };
      case "WARNING":
        return { bg: "#FEF3C7", text: "#F59E0B" };
      case "CRITICAL":
        return { bg: "#FEE2E2", text: "#EF4444" };
      default:
        return { bg: "#E5E7EB", text: "#6B7280" };
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Table Container with QC System Style */}
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
        {/* Header */}
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Process Capability Analysis
            </Typography>
          </Box>
        </Box>

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
                  Parameter
                </TableCell>
                <TableCell
                  align="right"
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
                  LSL
                </TableCell>
                <TableCell
                  align="right"
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
                  USL
                </TableCell>
                <TableCell
                  align="right"
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
                  Mean
                </TableCell>
                <TableCell
                  align="right"
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
                  σ (sigma)
                </TableCell>
                <TableCell
                  align="right"
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
                  Cp
                </TableCell>
                <TableCell
                  align="right"
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
                  Cpk
                </TableCell>
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
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {
                const statusColors = getStatusColor(row.status);
                return (
                  <TableRow
                    key={index}
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
                      {row.parameter}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {row.lsl.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {row.usl.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {row.mean.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {row.sigma.toFixed(3)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {row.cp.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {row.cpk.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: "#374151",
                        py: 2.5,
                        px: 2,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: statusColors.bg,
                          color: statusColors.text,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          minWidth: 80,
                          height: 26,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ProcessCapabilityTable;
