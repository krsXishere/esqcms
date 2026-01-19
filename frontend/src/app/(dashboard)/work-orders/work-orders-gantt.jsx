"use client";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { AiFillPlusCircle } from "react-icons/ai";
import {
  MdChevronLeft,
  MdChevronRight,
  MdToday,
  MdCalendarMonth,
} from "react-icons/md";
import { useFetchApi } from "@/app/hook/useFetchApi";
import ModalAddWorkOrder from "./modal-add-work-order";
import ModalDetailWorkOrder from "./modal-detail-work-order";
import ModalEditWorkOrder from "./modal-edit-work-order";
import { format, eachDayOfInterval, addDays, subDays, addWeeks, subWeeks, isSameDay, differenceInDays, startOfDay, endOfDay } from "date-fns";

const WorkOrdersGantt = ({ onViewChange }) => {
  const theme = useTheme();
  const ganttRef = useRef(null);
  
  const [workOrders, setWorkOrders] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [areas, setAreas] = useState([]);
  
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedUtility, setSelectedUtility] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  const [modalOpenAdd, setModalOpenAdd] = useState(false);
  const [modalOpenDetail, setModalOpenDetail] = useState(false);
  const [modalOpenEdit, setModalOpenEdit] = useState(false);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);

  const { sendRequest, loading } = useFetchApi();

  // Fetch utilities
  useEffect(() => {
    const fetchUtilities = async () => {
      const result = await sendRequest({ url: "/utilities" });
      if (result?.success && result?.data) {
        setUtilities(result.data);
      }
    };
    fetchUtilities();
  }, []);

  // Fetch areas
  useEffect(() => {
    const fetchAreas = async () => {
      const result = await sendRequest({ url: "/areas" });
      if (result?.success && result?.data) {
        setAreas(result.data);
      }
    };
    fetchAreas();
  }, []);

  // Fetch work orders
  const fetchWorkOrders = async () => {
    const params = { limit: 500 };
    if (selectedArea) params.area_id = selectedArea;
    if (selectedUtility) params.utility_id = selectedUtility;
    
    const result = await sendRequest({ url: "/work-orders", params });
    if (result?.success && result?.data) {
      setWorkOrders(result.data);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [selectedArea, selectedUtility]);

  // Get days of current week (today - 3 days to today + 3 days = 7 days)
  const daysInWeek = useMemo(() => {
    const start = subDays(currentDate, 3); // 3 days before
    const end = addDays(currentDate, 3);   // 3 days after
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group work orders by utility
  const workOrdersByUtility = useMemo(() => {
    const grouped = {};
    
    // Get unique utilities from work orders
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
    
    // Sort work orders within each utility by start time (earliest first)
    Object.values(grouped).forEach((utility) => {
      utility.workOrders.sort((a, b) => {
        const aStart = a.scheduled_date ? new Date(a.scheduled_date) : new Date(a.created_at);
        const bStart = b.scheduled_date ? new Date(b.scheduled_date) : new Date(b.created_at);
        return aStart - bStart;
      });
    });
    
    return Object.values(grouped);
  }, [workOrders]);

  // Paginated utilities
  const paginatedUtilities = useMemo(() => {
    return workOrdersByUtility.slice(0, entriesPerPage);
  }, [workOrdersByUtility, entriesPerPage]);

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
      : new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Default 1 day

    const weekStart = startOfDay(subDays(currentDate, 3));
    const weekEnd = startOfDay(addDays(currentDate, 3));

    // Check if work order overlaps with current week
    const woStart = startOfDay(startDate);
    const woEnd = startOfDay(endDate);

    if (woEnd < weekStart || woStart > weekEnd) {
      return null; // Not visible this week
    }

    // Clamp to week boundaries
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

  // Get priority color
  const getPriorityBorder = (priority) => {
    const colors = {
      low: "#22c55e",
      medium: "#3b82f6",
      high: "#f59e0b",
      critical: "#ef4444",
    };
    return colors[priority] || "transparent";
  };

  const handleWorkOrderClick = (id) => {
    setSelectedWorkOrderId(id);
    setModalOpenDetail(true);
  };

  const handleEditFromDetail = (id) => {
    setSelectedWorkOrderId(id);
    setModalOpenEdit(true);
  };

  const handleSuccessAdd = () => {
    fetchWorkOrders();
  };

  const handleSuccessEdit = () => {
    fetchWorkOrders();
  };

  return (
    <Box>
      {/* Header Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* View Toggle */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => onViewChange?.("table")}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#fff",
              borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
              color: theme.palette.text.primary,
            }}
          >
            Table
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Gantt
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#fff",
                borderRadius: "8px",
                "& .MuiSelect-select": { color: theme.palette.text.primary },
              }}
            >
              <MenuItem value="">All Areas</MenuItem>
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedUtility}
              onChange={(e) => setSelectedUtility(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#fff",
                borderRadius: "8px",
                "& .MuiSelect-select": { color: theme.palette.text.primary },
              }}
            >
              <MenuItem value="">All Utilities</MenuItem>
              {utilities.map((utility) => (
                <MenuItem key={utility.id} value={utility.id}>
                  {utility.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Navigation */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#f1f5f9",
              borderRadius: "8px",
              px: 1,
              py: 0.5,
            }}
          >
            <IconButton size="small" onClick={goToPreviousWeek}>
              <MdChevronLeft size={24} />
            </IconButton>
            <Typography sx={{ minWidth: 200, textAlign: "center", fontWeight: 600 }}>
              {format(subDays(currentDate, 3), "dd MMM")} - {format(addDays(currentDate, 3), "dd MMM yyyy")}
            </Typography>
            <IconButton size="small" onClick={goToNextWeek}>
              <MdChevronRight size={24} />
            </IconButton>
            <Tooltip title="Today">
              <IconButton size="small" onClick={goToToday}>
                <MdToday size={20} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Add Button */}
          <Button
            variant="contained"
            startIcon={<AiFillPlusCircle size={20} />}
            sx={{
              px: 2,
              py: 1,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
            }}
            onClick={() => setModalOpenAdd(true)}
          >
            Add Work Order
          </Button>
        </Box>
      </Box>

      {/* Entries per page row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 70 }}>
          <Select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(e.target.value)}
            sx={{
              backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              "& .MuiSelect-select": { color: theme.palette.text.primary, py: 1 },
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Entries per page
        </Typography>
      </Box>

      {/* Gantt Chart */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${theme.palette.mode === "dark" ? "#1e293b" : "#e2e8f0"}`,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box ref={ganttRef} sx={{ overflowX: "auto" }}>
            {/* Header Row - Days */}
            <Box sx={{ display: "flex", minWidth: "800px" }}>
              {/* Utility Column Header */}
              <Box
                sx={{
                  width: "200px",
                  minWidth: "200px",
                  p: 2,
                  backgroundColor: theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
                  borderRight: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "12px",
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
                        minWidth: "80px",
                        p: 1,
                        textAlign: "center",
                        backgroundColor: isToday
                          ? "#1e40af"
                          : theme.palette.mode === "dark"
                          ? "#1e293b"
                          : "#f1f5f9",
                        color: isToday ? "#fff" : theme.palette.text.primary,
                        borderRight: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                        borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                        fontSize: "12px",
                        fontWeight: isToday ? 700 : 500,
                      }}
                    >
                      <Box>{format(day, "dd")}</Box>
                      <Box sx={{ fontSize: "10px", opacity: 0.7 }}>{format(day, "EEE")}</Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Utility Rows */}
            {paginatedUtilities.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  color: theme.palette.text.secondary,
                }}
              >
                No work orders found for the selected filters
              </Box>
            ) : (
              paginatedUtilities.map((utility) => (
                <Box key={utility.id} sx={{ display: "flex", minWidth: "800px" }}>
                  {/* Utility Name */}
                  <Box
                    sx={{
                      width: "200px",
                      minWidth: "200px",
                      p: 2,
                      backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#fff",
                      borderRight: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                      borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {utility.name}
                  </Box>

                  {/* Timeline Area */}
                  <Box
                    sx={{
                      flex: 1,
                      position: "relative",
                      minHeight: "80px",
                      backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",
                      borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                    }}
                  >
                    {/* Grid Lines */}
                    <Box sx={{ display: "flex", height: "100%", position: "absolute", width: "100%" }}>
                      {daysInWeek.map((day, index) => {
                        const isToday = isSameDay(day, new Date());
                        return (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              minWidth: "80px",
                              borderRight: `1px solid ${theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9"}`,
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
                    <Box sx={{ position: "relative", p: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {utility.workOrders.map((wo) => {
                        const barStyle = calculateBarStyle(wo, daysInWeek);
                        if (!barStyle) return null;

                        const startDate = wo.scheduled_date 
                          ? new Date(wo.scheduled_date) 
                          : new Date(wo.created_at);
                        const endDate = wo.deadline 
                          ? new Date(wo.deadline) 
                          : null;

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
                                <Typography variant="caption" display="block">
                                  Priority: {wo.priority}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {format(startDate, "dd MMM yyyy HH:mm")}
                                  {endDate && ` - ${format(endDate, "dd MMM yyyy HH:mm")}`}
                                </Typography>
                              </Box>
                            }
                            arrow
                          >
                            <Box
                              onClick={() => handleWorkOrderClick(wo.id)}
                              sx={{
                                position: "relative",
                                left: barStyle.left,
                                width: barStyle.width,
                                minHeight: "44px",
                                backgroundColor: getStatusColor(wo.status),
                                borderRadius: "6px",
                                px: 1.5,
                                py: 0.5,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                borderLeft: `4px solid ${getPriorityBorder(wo.priority)}`,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                "&:hover": {
                                  filter: "brightness(1.1)",
                                  transform: "scale(1.02)",
                                  zIndex: 10,
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#fff",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  lineHeight: 1.3,
                                }}
                              >
                                {wo.title}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "10px",
                                  fontWeight: 400,
                                  color: "rgba(255,255,255,0.85)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  lineHeight: 1.3,
                                }}
                              >
                                {format(startDate, "HH:mm")} - {endDate ? format(endDate, "HH:mm") : "N/A"}
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
      </Paper>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mt: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 2 }}>
          Status:
        </Typography>
        {[
          { label: "Open", color: "#3b82f6" },
          { label: "In Progress", color: "#f59e0b" },
          { label: "Completed", color: "#22c55e" },
          { label: "Closed", color: "#6b7280" },
          { label: "Cancelled", color: "#ef4444" },
        ].map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "4px",
                backgroundColor: item.color,
              }}
            />
            <Typography variant="caption">{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Modals */}
      <ModalAddWorkOrder
        open={modalOpenAdd}
        setOpen={setModalOpenAdd}
        onSuccessAdd={handleSuccessAdd}
      />
      <ModalDetailWorkOrder
        open={modalOpenDetail}
        setOpen={setModalOpenDetail}
        id={selectedWorkOrderId}
        onEdit={handleEditFromDetail}
      />
      <ModalEditWorkOrder
        open={modalOpenEdit}
        setOpen={setModalOpenEdit}
        onSuccessEdit={handleSuccessEdit}
        id={selectedWorkOrderId}
      />
    </Box>
  );
};

export default WorkOrdersGantt;
