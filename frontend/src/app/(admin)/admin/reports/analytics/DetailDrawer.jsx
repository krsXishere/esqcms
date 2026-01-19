"use client";
import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  TrendingUp as TrendIcon,
  BarChart as ChartIcon,
  Description as SummaryIcon,
  Assignment as ChecksheetIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const DetailDrawer = ({ open, onClose, data, type }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!data) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderDIRContent = () => {
    return (
      <>
        {/* Summary Tab */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: "12px" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>
                    LSL
                  </Typography>
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
                    {data.lsl}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: "12px" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>
                    USL
                  </Typography>
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
                    {data.usl}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: "12px" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>
                    Mean
                  </Typography>
                  <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                    {data.mean}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: "12px" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>
                    Std Dev
                  </Typography>
                  <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                    {data.sigma}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: "12px" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>
                    Cpk
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: data.cpk < 1.0 ? "#EF4444" : data.cpk < 1.33 ? "#F59E0B" : "#10B981",
                    }}
                  >
                    {data.cpk}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 1.5 }}>
              Statistical Summary
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>Sample Size:</Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>
                  {data.sampleSize || 123}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>Min Value:</Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>
                  {data.min || (data.mean - 3 * data.sigma).toFixed(3)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>Max Value:</Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>
                  {data.max || (data.mean + 3 * data.sigma).toFixed(3)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
                  Out-of-Spec Count:
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#EF4444" }}>
                  {data.outOfSpecCount || 12}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Histogram Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 2 }}>
              Distribution Histogram
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.histogramData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <ReferenceLine x="LSL" stroke="#EF4444" strokeWidth={2} />
                <ReferenceLine x="USL" stroke="#EF4444" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Trend Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 2 }}>
              Trend Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={data.lsl} stroke="#EF4444" strokeDasharray="5 5" label="LSL" />
                <ReferenceLine y={data.usl} stroke="#EF4444" strokeDasharray="5 5" label="USL" />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Related Checksheets Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 2 }}>
              Related Checksheets
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>ID</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Date</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Value</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", color: "#374151", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2, px: 2, backgroundColor: "rgba(249, 250, 251, 0.8)" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.relatedChecksheets || []).slice(0, 10).map((cs, idx) => (
                    <TableRow key={idx} sx={{ transition: "background-color 0.2s ease", "&:hover": { backgroundColor: "rgba(249, 250, 251, 0.8)" } }}>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#3B82F6", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        {cs.id}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 500 }}>{cs.date}</TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", color: "#374151", py: 2.5, px: 2, fontSize: "0.875rem", fontWeight: 600 }}>
                        {cs.value}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)", py: 2.5, px: 2 }}>
                        <Chip
                          label={cs.status}
                          size="small"
                          sx={{
                            fontSize: "0.65rem",
                            height: 20,
                            bgcolor: cs.status === "OK" ? "#D1FAE5" : "#FEE2E2",
                            color: cs.status === "OK" ? "#10B981" : "#EF4444",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </>
    );
  };

  const renderFIContent = () => {
    return (
      <>
        {/* Summary Tab */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: "#FEE2E2", borderRadius: "12px" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#991B1B", mb: 0.5 }}>
                    Total NG
                  </Typography>
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#DC2626" }}>
                    {data.totalNG || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: "#FEF3C7", borderRadius: "12px" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#92400E", mb: 0.5 }}>
                    After Repair
                  </Typography>
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#F59E0B" }}>
                    {data.afterRepair || 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 1.5 }}>
              Defect Statistics
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
                  % of Total Defects:
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#EF4444" }}>
                  {data.percentage || 0}%
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
                  Repair Success Rate:
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#10B981" }}>
                  {data.repairSuccessRate || 0}%
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
                  Most Affected Model:
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>
                  {data.topModel || "Model X"}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Trend Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 2 }}>
              Defect Occurrence Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* After Repair Effectiveness Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 2 }}>
              After Repair Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: "Before Repair", count: data.totalNG || 0 },
                  { name: "After Repair", count: data.afterRepair || 0 },
                  { name: "Repeat NG", count: data.repeatNG || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Related Checksheets Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 2 }}>
              Related Checksheets
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.relatedChecksheets || []).slice(0, 10).map((cs, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontSize: "0.75rem", color: "#3B82F6" }}>
                        {cs.id}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{cs.date}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{cs.model}</TableCell>
                      <TableCell>
                        <Chip
                          label={cs.status}
                          size="small"
                          sx={{
                            fontSize: "0.65rem",
                            height: 20,
                            bgcolor:
                              cs.status === "After Repair"
                                ? "#FEF3C7"
                                : cs.status === "NG"
                                ? "#FEE2E2"
                                : "#D1FAE5",
                            color:
                              cs.status === "After Repair"
                                ? "#F59E0B"
                                : cs.status === "NG"
                                ? "#EF4444"
                                : "#10B981",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 500, md: 600 },
          bgcolor: "#F9FAFB",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#FFFFFF",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#111827",
                  mb: 0.5,
                }}
              >
                {type === "DIR" ? data.parameter : data.item}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
                {type === "DIR" ? "Measurement Parameter" : "Visual Defect Item"}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Tabs */}
        <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                fontSize: "0.8rem",
                textTransform: "none",
                fontWeight: 500,
              },
            }}
          >
            <Tab icon={<SummaryIcon sx={{ fontSize: 18 }} />} label="Summary" iconPosition="start" />
            <Tab icon={<ChartIcon sx={{ fontSize: 18 }} />} label={type === "DIR" ? "Histogram" : "Trend"} iconPosition="start" />
            <Tab icon={<TrendIcon sx={{ fontSize: 18 }} />} label={type === "DIR" ? "Trend" : "After Repair"} iconPosition="start" />
            <Tab icon={<ChecksheetIcon sx={{ fontSize: 18 }} />} label="Checksheets" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          {type === "DIR" ? renderDIRContent() : renderFIContent()}
        </Box>
      </Box>
    </Drawer>
  );
};

export default DetailDrawer;
