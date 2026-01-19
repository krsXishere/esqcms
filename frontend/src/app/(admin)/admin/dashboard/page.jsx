"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Chip,
  Avatar,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";

// Icons
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EditNoteIcon from "@mui/icons-material/EditNote";

// QC Table Component
import QCTable from "@/components/common/QCTable";

// Mock data for KPIs
const mockKPIs = [
  { 
    title: "Total Checksheets", 
    value: "1,247", 
    icon: AssignmentIcon, 
    color: "#2F80ED", 
    bgColor: "#EBF5FF",
    change: "+12%",
    trend: "up",
    subtitle: "This month"
  },
  { 
    title: "Pending Approval", 
    value: "23", 
    icon: PendingActionsIcon, 
    color: "#F59E0B", 
    bgColor: "#FEF3C7",
    change: "-5%",
    trend: "down",
    subtitle: "Awaiting review"
  },
  { 
    title: "Revision Needed", 
    value: "8", 
    icon: WarningIcon, 
    color: "#EF4444", 
    bgColor: "#FEE2E2",
    change: "+2",
    trend: "up",
    subtitle: "Requires attention"
  },
  { 
    title: "Completed Today", 
    value: "45", 
    icon: CheckCircleIcon, 
    color: "#10B981", 
    bgColor: "#D1FAE5",
    change: "+18%",
    trend: "up",
    subtitle: "13 Jan 2026"
  },
];

// Mock recent checksheets
const mockRecentChecksheets = [
  { id: 1, no: "QC-2026-001", type: "In Process", model: "Pump XYZ-100", inspector: "John Doe", status: "pending", date: "2026-01-13" },
  { id: 2, no: "QC-2026-002", type: "Final", model: "Pump ABC-200", inspector: "Jane Smith", status: "checked", date: "2026-01-13" },
  { id: 3, no: "QC-2026-003", type: "In Process", model: "Pump DEF-300", inspector: "Bob Wilson", status: "approved", date: "2026-01-12" },
  { id: 4, no: "QC-2026-004", type: "Receiving", model: "Pump GHI-400", inspector: "Alice Brown", status: "revision", date: "2026-01-12" },
  { id: 5, no: "QC-2026-005", type: "Final", model: "Pump JKL-500", inspector: "Charlie Davis", status: "rejected", date: "2026-01-12" },
];

// Mock revision queue
const mockRevisionQueue = [
  { id: 1, no: "QC-2026-004", model: "Pump GHI-400", inspector: "Alice Brown", reason: "Dimension out of tolerance", date: "2026-01-12", priority: "high" },
  { id: 2, no: "QC-2026-008", model: "Pump MNO-600", inspector: "David Lee", reason: "Missing signatures", date: "2026-01-12", priority: "medium" },
  { id: 3, no: "QC-2026-012", model: "Pump PQR-700", inspector: "Emma Wilson", reason: "Incomplete test data", date: "2026-01-11", priority: "low" },
  { id: 4, no: "QC-2026-015", model: "Pump STU-800", inspector: "Frank Miller", reason: "Photo documentation needed", date: "2026-01-11", priority: "medium" },
  { id: 5, no: "QC-2026-019", model: "Pump VWX-900", inspector: "Grace Taylor", reason: "Calibration certificate expired", date: "2026-01-10", priority: "high" },
  { id: 6, no: "QC-2026-023", model: "Pump YZA-1000", inspector: "Henry Johnson", reason: "Material certificate missing", date: "2026-01-10", priority: "low" },
];

// Table columns definition
const checksheetColumns = [
  { field: "no", headerName: "Checksheet No", highlight: true },
  { field: "type", headerName: "Type" },
  { field: "model", headerName: "Model" },
  { 
    field: "inspector", 
    headerName: "Inspector",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: "#E5E7EB", fontSize: "0.75rem", color: "#374151" }}>
          {row.inspector?.charAt(0)}
        </Avatar>
        <Typography variant="body2" color="inherit">{row.inspector}</Typography>
      </Box>
    )
  },
  { field: "status", headerName: "Status" },
  { field: "date", headerName: "Date" },
];

// Quick stats data
const quickStats = [
  { label: "Pass Rate", value: 94, color: "#10B981" },
  { label: "On-Time Completion", value: 87, color: "#2F80ED" },
  { label: "Revision Rate", value: 6, color: "#F59E0B" },
];

const DashboardPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockKPIs.map((kpi, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: kpi.bgColor,
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                    }}
                  >
                    <kpi.icon sx={{ color: kpi.color, fontSize: 26 }} />
                  </Avatar>
                  <Chip
                    icon={kpi.trend === "up" ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                    label={kpi.change}
                    size="small"
                    sx={{
                      bgcolor: kpi.trend === "up" && kpi.color === "#EF4444" ? "#FEE2E2" 
                        : kpi.trend === "up" ? "#D1FAE5" 
                        : "#FEE2E2",
                      color: kpi.trend === "up" && kpi.color === "#EF4444" ? "#DC2626"
                        : kpi.trend === "up" ? "#059669" 
                        : "#DC2626",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      height: 24,
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
                </Box>
                <Typography variant="h3" fontWeight={700} color="#111827" sx={{ mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="body2" fontWeight={500} color="#6B7280">
                  {kpi.title}
                </Typography>
                <Typography variant="caption" color="#9CA3AF">
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        {/* Recent Checksheets Table */}
        <Grid item xs={12} lg={8} sx={{ display: "flex" }}>
          <Box sx={{ width: "100%" }}>
            <QCTable
              title="Recent Checksheets"
              subtitle="Latest quality control records"
              headerAction={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/admin/checksheet/monitoring")}
                  sx={{
                    color: "#2F80ED",
                    "&:hover": { bgcolor: "rgba(47, 128, 237, 0.1)" },
                  }}
                >
                  View All
                </Button>
              }
              columns={checksheetColumns}
              rows={mockRecentChecksheets}
              page={page}
              setPage={setPage}
              totalRows={mockRecentChecksheets.length}
              totalPages={1}
              rowsPerPage={10}
              showActions={true}
              onView={(row) => console.log("View:", row)}
            />
          </Box>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} lg={4} sx={{ display: "flex" }}>
          {/* Revision Queue */}
            <Paper
              sx={{
                bgcolor: "#FFFFFF",
                width: "100%",
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: "1px solid #E5E7EB" }}>
                <Typography variant="h6" fontWeight={600} color="#111827">
                  Revision Queue
                </Typography>
                <Typography variant="body2" color="#6B7280" sx={{ mt: 0.5 }}>
                  Latest items requiring revision
                </Typography>
              </Box>
              
              {/* Scrollable List */}
              <Box
                sx={{
                  maxHeight: 440,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: 6,
                  },
                  "&::-webkit-scrollbar-track": {
                    bgcolor: "#F9FAFB",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "#D1D5DB",
                    borderRadius: 3,
                    "&:hover": {
                      bgcolor: "#9CA3AF",
                    },
                  },
                }}
              >
                <Stack spacing={0}>
                  {mockRevisionQueue.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        borderBottom: index < mockRevisionQueue.length - 1 ? "1px solid #F3F4F6" : "none",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#F9FAFB",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#2F80ED"
                            sx={{ mb: 0.5 }}
                          >
                            {item.no}
                          </Typography>
                          <Typography variant="body2" color="#374151" fontWeight={500}>
                            {item.model}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.priority}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            bgcolor: item.priority === "high" ? "#FEE2E2" : item.priority === "medium" ? "#FEF3C7" : "#E5E7EB",
                            color: item.priority === "high" ? "#DC2626" : item.priority === "medium" ? "#D97706" : "#6B7280",
                          }}
                        />
                      </Box>
                      
                      <Typography variant="caption" color="#6B7280" sx={{ display: "block", mb: 1 }}>
                        {item.reason}
                      </Typography>
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Avatar sx={{ width: 20, height: 20, bgcolor: "#E5E7EB", fontSize: "0.65rem", color: "#374151" }}>
                            {item.inspector?.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" color="#6B7280">
                            {item.inspector}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EditNoteIcon sx={{ fontSize: 16 }} />}
                          onClick={() => console.log("Revise:", item.no)}
                          sx={{
                            py: 0.5,
                            px: 1.5,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            bgcolor: "#2F80ED",
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                              bgcolor: "#1E6FD9",
                              boxShadow: "0 2px 8px rgba(47, 128, 237, 0.25)",
                            },
                          }}
                        >
                          Revise
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
