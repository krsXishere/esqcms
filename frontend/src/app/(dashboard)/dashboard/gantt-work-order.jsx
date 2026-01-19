"use client";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { MdChevronLeft, MdChevronRight, MdToday } from "react-icons/md";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useRouter } from "next/navigation";
import {
  format,
  eachDayOfInterval,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  isSameDay,
  differenceInDays,
  startOfDay,
} from "date-fns";

const GanttWorkOrder = () => {
  const theme = useTheme();
  const router = useRouter();
  const ganttRef = useRef(null);

  const [workOrders, setWorkOrders] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { sendRequest, loading } = useFetchApi();

  // Fetch work orders
  const fetchWorkOrders = async () => {
    const params = { limit: 100 };
    const result = await sendRequest({ url: "/work-orders", params });
    if (result?.success && result?.data) {
      setWorkOrders(result.data);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // Get days of current week (today - 3 days to today + 3 days = 7 days)
  const daysInWeek = useMemo(() => {
    const start = subDays(currentDate, 3);
    const end = addDays(currentDate, 3);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group work orders by utility
  const workOrdersByUtility = useMemo(() => {
    const grouped = {};

    workOrders.forEach((wo) => {
      const utilityId = wo.utility?.id || "unassigned";
      const utilityName = wo.utility?.name || "Unassigned";

      if (!grouped[utilityId]) {
        grouped[utilityId] = {
          id: utilityId,
          name: utilityName,
          workOrders: [],
        };
      }
      grouped[utilityId].workOrders.push(wo);
    });

    // Sort work orders within each utility by start time
    Object.values(grouped).forEach((utility) => {
      utility.workOrders.sort((a, b) => {
        const aStart = a.scheduled_date
          ? new Date(a.scheduled_date)
          : new Date(a.created_at);
        const bStart = b.scheduled_date
          ? new Date(b.scheduled_date)
          : new Date(b.created_at);
        return aStart - bStart;
      });
    });

    return Object.values(grouped).slice(0, 5); // Limit to 5 utilities for dashboard
  }, [workOrders]);

  // Navigation handlers
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Calculate bar position and width
  const calculateBarStyle = (workOrder, days) => {
    const startDate = workOrder.scheduled_date
      ? new Date(workOrder.scheduled_date)
      : new Date(workOrder.created_at);
    const endDate = workOrder.deadline
      ? new Date(workOrder.deadline)
      : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    const weekStart = startOfDay(subDays(currentDate, 3));
    const weekEnd = startOfDay(addDays(currentDate, 3));

    const woStart = startOfDay(startDate);
    const woEnd = startOfDay(endDate);

    if (woEnd < weekStart || woStart > weekEnd) {
      return null;
    }

    const visibleStart = woStart < weekStart ? weekStart : woStart;
    const visibleEnd = woEnd > weekEnd ? weekEnd : woEnd;

    const dayWidth = 100 / days.length;
    const startOffset = differenceInDays(visibleStart, weekStart);
    const duration = differenceInDays(visibleEnd, visibleStart) + 1;

    const left = startOffset * dayWidth;
    const width = duration * dayWidth;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      open: "#3b82f6",
      in_progress: "#f59e0b",
      completed: "#22c55e",
      closed: "#6b7280",
      cancelled: "#ef4444",
    };
    return colors[status] || "#22c55e";
  };

  const handleViewAll = () => {
    router.push("/work-orders");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",
        borderRadius: "16px",
        p: 3,
        border: `1px solid ${
          theme.palette.mode === "dark" ? "#1e293b" : "#e2e8f0"
        }`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
          }}
        >
          Work Orders Schedule
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Date Navigation */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              backgroundColor:
                theme.palette.mode === "dark" ? "#162750" : "#f1f5f9",
              borderRadius: "8px",
              px: 1,
              py: 0.5,
            }}
          >
            <IconButton size="small" onClick={goToPreviousWeek}>
              <MdChevronLeft size={20} />
            </IconButton>
            <Typography
              sx={{
                minWidth: 140,
                textAlign: "center",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {format(subDays(currentDate, 3), "dd MMM")} -{" "}
              {format(addDays(currentDate, 3), "dd MMM")}
            </Typography>
            <IconButton size="small" onClick={goToNextWeek}>
              <MdChevronRight size={20} />
            </IconButton>
            <Tooltip title="Today">
              <IconButton size="small" onClick={goToToday}>
                <MdToday size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography
            onClick={handleViewAll}
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#3b82f6",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View All →
          </Typography>
        </Box>
      </Box>

      {/* Gantt Chart */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Box ref={ganttRef} sx={{ overflowX: "auto" }}>
          {/* Header Row - Days */}
          <Box sx={{ display: "flex", minWidth: "600px" }}>
            {/* Utility Column Header */}
            <Box
              sx={{
                width: "150px",
                minWidth: "150px",
                p: 1.5,
                backgroundColor:
                  theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
                borderRight: `1px solid ${
                  theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
                }`,
                borderBottom: `1px solid ${
                  theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
                }`,
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "0.05em",
              }}
            >
              Utility
            </Box>

            {/* Days Headers */}
            <Box sx={{ flex: 1, display: "flex" }}>
              {daysInWeek.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      minWidth: "60px",
                      p: 1,
                      textAlign: "center",
                      backgroundColor: isToday
                        ? "#1e40af"
                        : theme.palette.mode === "dark"
                        ? "#1e293b"
                        : "#f1f5f9",
                      color: isToday ? "#fff" : theme.palette.text.primary,
                      borderRight: `1px solid ${
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
                      }`,
                      borderBottom: `1px solid ${
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
                      }`,
                      fontSize: "11px",
                      fontWeight: isToday ? 700 : 500,
                    }}
                  >
                    <Box>{format(day, "dd")}</Box>
                    <Box sx={{ fontSize: "9px", opacity: 0.7 }}>
                      {format(day, "EEE")}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Utility Rows */}
          {workOrdersByUtility.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                color: theme.palette.text.secondary,
                fontSize: "13px",
              }}
            >
              No work orders scheduled
            </Box>
          ) : (
            workOrdersByUtility.map((utility) => (
              <Box
                key={utility.id}
                sx={{ display: "flex", minWidth: "600px" }}
              >
                {/* Utility Name */}
                <Box
                  sx={{
                    width: "150px",
                    minWidth: "150px",
                    p: 1.5,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#162750" : "#fff",
                    borderRight: `1px solid ${
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
                    }`,
                    borderBottom: `1px solid ${
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {utility.name}
                </Box>

                {/* Timeline Area */}
                <Box
                  sx={{
                    flex: 1,
                    position: "relative",
                    minHeight: "50px",
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#0f172a" : "#fff",
                    borderBottom: `1px solid ${
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
                    }`,
                  }}
                >
                  {/* Grid Lines */}
                  <Box
                    sx={{
                      display: "flex",
                      height: "100%",
                      position: "absolute",
                      width: "100%",
                    }}
                  >
                    {daysInWeek.map((day, index) => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            minWidth: "60px",
                            borderRight: `1px solid ${
                              theme.palette.mode === "dark"
                                ? "#1e293b"
                                : "#f1f5f9"
                            }`,
                            backgroundColor: isToday
                              ? theme.palette.mode === "dark"
                                ? "rgba(59, 130, 246, 0.1)"
                                : "rgba(59, 130, 246, 0.05)"
                              : "transparent",
                          }}
                        />
                      );
                    })}
                  </Box>

                  {/* Work Order Bars */}
                  <Box
                    sx={{
                      position: "relative",
                      p: 0.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    {utility.workOrders.slice(0, 2).map((wo) => {
                      const barStyle = calculateBarStyle(wo, daysInWeek);
                      if (!barStyle) return null;

                      return (
                        <Tooltip
                          key={wo.id}
                          title={
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>
                                {wo.title}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Status: {wo.status?.replace("_", " ")}
                              </Typography>
                            </Box>
                          }
                          arrow
                        >
                          <Box
                            onClick={handleViewAll}
                            sx={{
                              position: "relative",
                              left: barStyle.left,
                              width: barStyle.width,
                              minHeight: "20px",
                              backgroundColor: getStatusColor(wo.status),
                              borderRadius: "4px",
                              px: 0.5,
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                filter: "brightness(1.1)",
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#fff",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {wo.title}
                            </Typography>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "Open", color: "#3b82f6" },
          { label: "In Progress", color: "#f59e0b" },
          { label: "Completed", color: "#22c55e" },
          { label: "Closed", color: "#6b7280" },
          { label: "Cancelled", color: "#ef4444" },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "3px",
                backgroundColor: item.color,
              }}
            />
            <Typography variant="caption" sx={{ fontSize: "10px" }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default GanttWorkOrder;
