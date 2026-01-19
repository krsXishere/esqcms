"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useFetchApi } from "@/app/hook/useFetchApi";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import TimelineIcon from "@mui/icons-material/Timeline";

/**
 * MaintenanceHistoryPanel Component
 * 
 * Shows maintenance history for a device/utility including:
 * - Completed work orders
 * - MTTR (Mean Time To Repair)
 * - MTBF (Mean Time Between Failures)
 * - Total downtime
 */
const MaintenanceHistoryPanel = ({ deviceId, utilityId, areaId }) => {
  const theme = useTheme();
  const { sendRequest } = useFetchApi();

  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadMaintenanceData();
  }, [deviceId, utilityId, areaId]);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (deviceId) params.device_id = deviceId;
      if (utilityId) params.utility_id = utilityId;
      if (areaId) params.area_id = areaId;

      const [woResponse, statsResponse] = await Promise.all([
        sendRequest({
          url: "/work-orders",
          params: { ...params, limit: 50 },
        }),
        sendRequest({
          url: "/work-orders/stats/summary",
          params,
        }),
      ]);

      if (woResponse?.success && woResponse?.data) {
        setWorkOrders(woResponse.data);
      }

      if (statsResponse?.success && statsResponse?.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Failed to load maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "warning",
      in_progress: "primary",
      completed: "success",
      closed: "default",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate metrics
  const completedWOs = workOrders.filter((wo) => wo.status === "completed");
  const totalDowntime = stats?.total_downtime_minutes || 0;
  const avgCompletionTime = stats?.avg_completion_hours || 0;

  // Simple MTBF calculation (hours between failures)
  const correctiveWOs = workOrders.filter((wo) => wo.type === "corrective");
  const mtbf =
    correctiveWOs.length > 1
      ? Math.round(
          (new Date(correctiveWOs[0]?.created_at) -
            new Date(correctiveWOs[correctiveWOs.length - 1]?.created_at)) /
            (1000 * 60 * 60 * correctiveWOs.length)
        )
      : 0;

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "rgba(30, 126, 79, 0.05)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Completed WOs
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {completedWOs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "rgba(33, 150, 243, 0.05)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TimelineIcon color="primary" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Avg. MTTR
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {avgCompletionTime.toFixed(1)}
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  hrs
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "rgba(255, 152, 0, 0.05)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <WarningIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Total Downtime
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {Math.round(totalDowntime / 60)}
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  hrs
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "rgba(156, 39, 176, 0.05)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BuildIcon color="secondary" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  MTBF
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {mtbf > 0 ? mtbf : "—"}
                {mtbf > 0 && (
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    hrs
                  </Typography>
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Work Orders History Table */}
      <Paper
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #E2E8F0" }}>
          <Typography variant="h6" fontWeight={600}>
            Work Order History
          </Typography>
        </Box>

        {workOrders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No maintenance history found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "#F8FAFC",
                  }}
                >
                  <TableCell>WO #</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workOrders.map((wo) => (
                  <TableRow
                    key={wo.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "#F8FAFC",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{wo.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{wo.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={wo.type}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={wo.priority}
                        size="small"
                        color={
                          wo.priority === "critical" || wo.priority === "high"
                            ? "error"
                            : wo.priority === "medium"
                            ? "warning"
                            : "success"
                        }
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={wo.status.replace("_", " ")}
                        size="small"
                        color={getStatusColor(wo.status)}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(wo.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {wo.completed_at
                        ? new Date(wo.completed_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {wo.actual_hours
                        ? `${wo.actual_hours.toFixed(1)} hrs`
                        : wo.estimated_hours
                        ? `~${wo.estimated_hours} hrs`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default MaintenanceHistoryPanel;
