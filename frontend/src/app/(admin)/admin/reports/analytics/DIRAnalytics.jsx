"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  InfoOutlined as InfoIcon,
  TrendingUp as TrendIcon,
  ZoomIn as ZoomInIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";

const DIRAnalytics = ({ data, onParameterClick }) => {
  const { capabilityData, histogramData, trendData, outOfSpecData } = data;

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

  const getCpkStatus = (cpk) => {
    if (cpk >= 1.33) return "GOOD";
    if (cpk >= 1.0) return "WARNING";
    return "CRITICAL";
  };

  return (
    <Box>
      {/* Process Capability Table */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Process Capability (Cp/Cpk)
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  mt: 0.5,
                }}
              >
                Statistical process capability analysis for measurement parameters
              </Typography>
            </Box>
            <Tooltip title="Cpk ≥ 1.33: Good | 1.0 ≤ Cpk < 1.33: Warning | Cpk < 1.0: Critical">
              <IconButton size="small">
                <InfoIcon sx={{ fontSize: 18, color: "#64748B" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
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
                  σ (Std Dev)
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
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {capabilityData?.map((row, index) => {
                const status = getCpkStatus(row.cpk);
                const statusColor = getStatusColor(status);
                return (
                  <TableRow
                    key={index}
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                      },
                    }}
                    onClick={() => onParameterClick && onParameterClick(row)}
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
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                      {row.lsl}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                      {row.usl}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                      {row.mean}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                      {row.sigma}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                      {row.cp}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        color: statusColor.text,
                        py: 2.5,
                        px: 2,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {row.cpk}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", py: 2.5, px: 2 }}>
                      <Chip
                        label={status}
                        size="small"
                        sx={{
                          bgcolor: statusColor.bg,
                          color: statusColor.text,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", py: 2.5, px: 2 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onParameterClick && onParameterClick(row);
                          }}
                        >
                          <ZoomInIcon sx={{ fontSize: 18, color: "#3B82F6" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Histogram + Spec Limits */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              p: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
              }}
            >
              Distribution vs Specification
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#6B7280",
                mb: 3,
              }}
            >
              Histogram with LSL/USL boundaries
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <ReferenceLine
                  x="LSL"
                  stroke="#EF4444"
                  strokeWidth={2}
                  label={{ value: "LSL", fill: "#EF4444", fontSize: 12 }}
                />
                <ReferenceLine
                  x="USL"
                  stroke="#EF4444"
                  strokeWidth={2}
                  label={{ value: "USL", fill: "#EF4444", fontSize: 12 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "#FEF3C7",
                borderRadius: "8px",
                border: "1px solid #FDE68A",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 500 }}>
                ⚠️ Distribution shifting toward USL - Monitor closely
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Trend Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              p: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
              }}
            >
              Trend Analysis
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#6B7280",
                mb: 3,
              }}
            >
              Time series with spec overlay
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                />
                <YAxis
                  domain={["dataMin - 0.1", "dataMax + 0.1"]}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <ReferenceLine
                  y={trendData[0]?.lsl}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{ value: "LSL", fill: "#EF4444", fontSize: 11 }}
                />
                <ReferenceLine
                  y={trendData[0]?.usl}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{ value: "USL", fill: "#EF4444", fontSize: 11 }}
                />
                <ReferenceLine
                  y={trendData[0]?.target}
                  stroke="#10B981"
                  strokeDasharray="3 3"
                  label={{ value: "Target", fill: "#10B981", fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Out-of-Spec Explorer */}
        <Grid item xs={12}>
          <Paper
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              p: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
              }}
            >
              Out-of-Spec Instances
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#6B7280",
                mb: 3,
              }}
            >
              Quick investigation of non-conforming measurements
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Timestamp</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Checksheet ID</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Model</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Parameter</TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>
                      Value
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>
                      Deviation
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Operator</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outOfSpecData?.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        "&:hover": { backgroundColor: "rgba(249, 250, 251, 0.8)" },
                      }}
                    >
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        {row.timestamp}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                          color: "#3B82F6",
                          py: 2.5,
                          px: 2,
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        {row.checksheetId}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        {row.model}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        {row.parameter}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#EF4444", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        {row.value}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#EF4444", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        {row.deviation > 0 ? "+" : ""}
                        {row.deviation}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        {row.operator}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DIRAnalytics;
