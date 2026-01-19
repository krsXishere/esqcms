"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

const FIAnalytics = ({ data, onDefectClick, onEvidenceClick }) => {
  const { paretoData, ngTrendData, afterRepairData, evidenceData } = data;

  const getRepairStatusColor = (successRate) => {
    if (successRate >= 90) return { bg: "#D1FAE5", text: "#10B981", icon: SuccessIcon };
    if (successRate >= 70) return { bg: "#FEF3C7", text: "#F59E0B", icon: WarningIcon };
    return { bg: "#FEE2E2", text: "#EF4444", icon: FailIcon };
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Pareto Defect Chart */}
        <Grid item xs={12} md={7}>
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
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
              }}
            >
              Pareto Analysis - Top Defects
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#6B7280",
                mb: 3,
              }}
            >
              80/20 rule: Focus on high-impact defects
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={paretoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="item"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  label={{ value: "Count", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  label={{
                    value: "Cumulative %",
                    angle: 90,
                    position: "insideRight",
                    fontSize: 12,
                  }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="#EF4444"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => onDefectClick && onDefectClick(data)}
                  cursor="pointer"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "#EFF6FF",
                borderRadius: "8px",
                border: "1px solid #BFDBFE",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "#1E40AF", fontWeight: 500 }}>
                💡 Top 3 defects contribute to 80% of total NG items
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* NG Trend per Item */}
        <Grid item xs={12} md={5}>
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
              NG Trend Timeline
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#6B7280",
                mb: 3,
              }}
            >
              Daily/weekly defect occurrence
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={ngTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line
                  type="monotone"
                  dataKey="boltLoose"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Bolt Loose"
                />
                <Line
                  type="monotone"
                  dataKey="paintDefect"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Paint Defect"
                />
                <Line
                  type="monotone"
                  dataKey="shaftScratch"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Shaft Scratch"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* After Repair Effectiveness Table */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
              }}
            >
              After Repair Effectiveness
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#6B7280",
                mb: 3,
              }}
            >
              Measure repair quality and identify systemic issues
            </Typography>
            <TableContainer>
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
                      Defect Item
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
                      After Repair
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
                      Repeat NG
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
                      Success Rate
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {afterRepairData?.map((row, index) => {
                    const successRate = ((row.afterRepair - row.repeatNG) / row.afterRepair) * 100;
                    const statusColor = getRepairStatusColor(successRate);
                    const StatusIcon = statusColor.icon;
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          transition: "background-color 0.2s ease",
                          "&:hover": { backgroundColor: "rgba(249, 250, 251, 0.8)" },
                        }}
                      >
                        <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                          {row.item}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                          {row.afterRepair}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#EF4444", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 600 }}>
                          {row.repeatNG}
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
                          {successRate.toFixed(0)}%
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", py: 2.5, px: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <StatusIcon sx={{ fontSize: 18, color: statusColor.text }} />
                            <Chip
                              label={
                                successRate >= 90 ? "Excellent" : successRate >= 70 ? "Fair" : "Poor"
                              }
                              size="small"
                              sx={{
                                bgcolor: statusColor.bg,
                                color: statusColor.text,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 24,
                              }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "#FEE2E2",
                borderRadius: "8px",
                border: "1px solid #FECACA",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "#991B1B", fontWeight: 500 }}>
                ⚠️ Bolt Loose has high repeat rate - indicates systemic issue requiring root cause
                analysis
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Evidence Gallery */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
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
              Evidence Gallery
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#6B7280",
                mb: 3,
              }}
            >
              Recent NG photos and documentation
            </Typography>
            <ImageList
              sx={{ maxHeight: 400, overflow: "auto" }}
              cols={2}
              gap={12}
              rowHeight={180}
            >
              {evidenceData?.map((item, index) => (
                <ImageListItem
                  key={index}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      transform: "scale(1.02)",
                      transition: "all 0.2s ease",
                    },
                  }}
                  onClick={() => onEvidenceClick && onEvidenceClick(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.defect}
                    loading="lazy"
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <ImageListItemBar
                    title={item.defect}
                    subtitle={item.checksheetId}
                    sx={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
                      "& .MuiImageListItemBar-title": {
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      },
                      "& .MuiImageListItemBar-subtitle": {
                        fontSize: "0.7rem",
                      },
                    }}
                    actionIcon={
                      <IconButton sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        <ZoomInIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "#F3F4F6",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#6B7280",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#3B82F6", textDecoration: "underline" },
                }}
                onClick={() => onEvidenceClick && onEvidenceClick("viewAll")}
              >
                View All Evidence ({evidenceData?.length || 0}+)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FIAnalytics;
