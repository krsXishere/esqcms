"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditIcon from "@mui/icons-material/Edit";

const InfoRow = ({ label, value, color = "#fff" }) => (
  <Stack direction="row" spacing={2} sx={{ py: 1 }}>
    <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography sx={{ color, fontWeight: 600, flex: 1 }}>
      {value || "-"}
    </Typography>
  </Stack>
);

const ModalDetailWorkOrder = ({ open, setOpen, id, onEdit }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { sendRequest } = useFetchApi();
  const theme = useTheme();

  const handleClose = () => {
    setWorkOrder(null);
    setOpen(false);
  };

  const handleEdit = () => {
    handleClose();
    if (onEdit) {
      onEdit(id);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !open) return;

      try {
        setLoading(true);
        const workOrderRes = await sendRequest({ url: `/work-orders/${id}` });

        if (workOrderRes?.success) {
          setWorkOrder(workOrderRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        enqueueSnackbar("Failed to load work order data", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, id]);

  const getStatusColor = (status) => {
    const colors = {
      open: "#3b82f6",
      in_progress: "#f59e0b",
      completed: "#10b981",
      closed: "#6b7280",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#10b981",
      medium: "#3b82f6",
      high: "#f59e0b",
      critical: "#ef4444",
    };
    return colors[priority] || "#6b7280";
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Fade in={open}>
        <Box
          sx={{
            bgcolor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",
            p: 4,
            borderRadius: 4,
            maxWidth: "900px",
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <InfoOutlinedIcon sx={{ color: "#38bdf8", fontSize: 32 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
              }}
            >
              Work Order Details
            </Typography>
          </Stack>

          {loading || !workOrder ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Basic Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: "#38bdf8", mb: 2, fontWeight: 600 }}>
                  Basic Information
                </Typography>
                <InfoRow label="Title" value={workOrder.title} />
                <InfoRow label="Description" value={workOrder.description} />
                <InfoRow 
                  label="Type" 
                  value={workOrder.type?.charAt(0).toUpperCase() + workOrder.type?.slice(1)} 
                />
                <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                  <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                    Status
                  </Typography>
                  <Chip
                    label={workOrder.status?.toUpperCase().replace("_", " ")}
                    sx={{
                      bgcolor: getStatusColor(workOrder.status),
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                  <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                    Priority
                  </Typography>
                  <Chip
                    label={workOrder.priority?.toUpperCase()}
                    sx={{
                      bgcolor: getPriorityColor(workOrder.priority),
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <InfoRow label="Area" value={workOrder.area?.name} />
                <InfoRow label="Utility" value={workOrder.utility?.name} />
                <InfoRow label="Device" value={workOrder.device?.name || "N/A"} />
                <InfoRow label="Created By" value={workOrder.creator?.name} />
                <InfoRow label="Assigned To" value={workOrder.assignee?.name || "Unassigned"} />
                <InfoRow 
                  label="Created At" 
                  value={dayjs(workOrder.created_at).format("DD/MM/YYYY HH:mm")} 
                />
                <InfoRow 
                  label="Start Time" 
                  value={workOrder.scheduled_date ? dayjs(workOrder.scheduled_date).format("DD/MM/YYYY HH:mm") : "Not set"} 
                />
                <InfoRow 
                  label="End Time / Deadline" 
                  value={workOrder.deadline ? dayjs(workOrder.deadline).format("DD/MM/YYYY HH:mm") : "No deadline"} 
                />
                {workOrder.started_at && (
                  <InfoRow 
                    label="Started At" 
                    value={dayjs(workOrder.started_at).format("DD/MM/YYYY HH:mm")} 
                  />
                )}
                {workOrder.completed_at && (
                  <InfoRow 
                    label="Completed At" 
                    value={dayjs(workOrder.completed_at).format("DD/MM/YYYY HH:mm")} 
                  />
                )}
                <InfoRow label="Notes" value={workOrder.notes} />
              </Box>

              {/* Completion Form Data - Only show if status is completed */}
              {workOrder.status === "completed" && workOrder.completion_status && (
                <>
                  <Divider sx={{ borderColor: "#334155", my: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <CheckCircleOutlineIcon sx={{ color: "#10b981", fontSize: 28 }} />
                      <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 600 }}>
                        Completion Report
                      </Typography>
                    </Stack>

                    {/* 1. Completion Status */}
                    <Typography variant="subtitle1" sx={{ color: "#38bdf8", mb: 1, fontWeight: 600 }}>
                      1. Completion Status
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ py: 1, mb: 2 }}>
                      <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                        Status
                      </Typography>
                      <Chip
                        label={
                          workOrder.completion_status === "completed_normal"
                            ? "NORMAL"
                            : workOrder.completion_status === "completed_temporary"
                            ? "TEMPORARY FIX"
                            : "NOT COMPLETED (ESCALATED)"
                        }
                        sx={{
                          bgcolor:
                            workOrder.completion_status === "completed_normal"
                              ? "#10b981"
                              : workOrder.completion_status === "completed_temporary"
                              ? "#f59e0b"
                              : "#ef4444",
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>

                    {/* 2. Field Work Description */}
                    <Typography variant="subtitle1" sx={{ color: "#38bdf8", mb: 1, mt: 2, fontWeight: 600 }}>
                      2. Field Work Description
                    </Typography>
                    <InfoRow label="Problem Found" value={workOrder.problem_found} />
                    <InfoRow label="Action Taken" value={workOrder.action_taken} />

                    {/* 3. Failure Classification (if corrective) */}
                    {workOrder.type === "corrective" && workOrder.failure_mode && (
                      <>
                        <Typography variant="subtitle1" sx={{ color: "#38bdf8", mb: 1, mt: 2, fontWeight: 600 }}>
                          3. Failure Classification
                        </Typography>
                        <InfoRow label="Failure Mode" value={workOrder.failure_mode} />
                        <InfoRow label="Root Cause (Primary)" value={workOrder.root_cause_primary} />
                        <InfoRow label="Root Cause (Detail)" value={workOrder.root_cause_detail} />
                      </>
                    )}

                    {/* 4. Downtime & Impact */}
                    <Typography variant="subtitle1" sx={{ color: "#38bdf8", mb: 1, mt: 2, fontWeight: 600 }}>
                      4. Downtime & Impact
                    </Typography>
                    <InfoRow 
                      label="Downtime Start" 
                      value={workOrder.downtime_start ? dayjs(workOrder.downtime_start).format("DD/MM/YYYY HH:mm") : "-"} 
                    />
                    <InfoRow 
                      label="Downtime End" 
                      value={workOrder.downtime_end ? dayjs(workOrder.downtime_end).format("DD/MM/YYYY HH:mm") : "-"} 
                    />
                    <InfoRow 
                      label="Total Downtime" 
                      value={workOrder.downtime_total_minutes 
                        ? `${workOrder.downtime_total_minutes} minutes (${(workOrder.downtime_total_minutes / 60).toFixed(2)} hours)` 
                        : "-"
                      }
                      color="#f59e0b"
                    />
                    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                      <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                        Production Stopped?
                      </Typography>
                      {workOrder.production_stopped ? (
                        <Chip label="YES" sx={{ bgcolor: "#ef4444", color: "#fff", fontWeight: 600 }} />
                      ) : (
                        <Chip label="NO" sx={{ bgcolor: "#10b981", color: "#fff", fontWeight: 600 }} />
                      )}
                    </Stack>
                    <InfoRow 
                      label="Est. Production Loss" 
                      value={workOrder.estimated_production_loss || "-"} 
                    />

                    {/* 5. Sparepart & Material */}
                    <Typography variant="subtitle1" sx={{ color: "#38bdf8", mb: 1, mt: 2, fontWeight: 600 }}>
                      5. Sparepart & Material
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                      <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                        Sparepart Used?
                      </Typography>
                      {workOrder.sparepart_used ? (
                        <Chip label="YES" sx={{ bgcolor: "#3b82f6", color: "#fff", fontWeight: 600 }} />
                      ) : (
                        <Chip label="NO" sx={{ bgcolor: "#6b7280", color: "#fff", fontWeight: 600 }} />
                      )}
                    </Stack>
                    {workOrder.sparepart_used && workOrder.sparepart_details && (() => {
                      try {
                        const sparepartData = JSON.parse(workOrder.sparepart_details);
                        if (Array.isArray(sparepartData) && sparepartData.length > 0) {
                          const totalCost = sparepartData.reduce((sum, item) => sum + (item.total_price || 0), 0);
                          return (
                            <Box sx={{ mt: 1 }}>
                              <TableContainer sx={{ border: "1px solid #334155", borderRadius: 2 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: "#1e293b" }}>
                                      <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Sparepart</TableCell>
                                      <TableCell sx={{ color: "#fff", fontWeight: 600, textAlign: "center" }}>Qty</TableCell>
                                      <TableCell sx={{ color: "#fff", fontWeight: 600, textAlign: "right" }}>Harga Satuan</TableCell>
                                      <TableCell sx={{ color: "#fff", fontWeight: 600, textAlign: "right" }}>Total</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {sparepartData.map((item, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell sx={{ color: "#fff" }}>{item.name}</TableCell>
                                        <TableCell sx={{ color: "#fff", textAlign: "center" }}>{item.quantity}</TableCell>
                                        <TableCell sx={{ color: "#fff", textAlign: "right" }}>
                                          Rp {(item.unit_price || 0).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell sx={{ color: "#22c55e", textAlign: "right", fontWeight: 600 }}>
                                          Rp {(item.total_price || 0).toLocaleString('id-ID')}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow sx={{ backgroundColor: "#0f172a" }}>
                                      <TableCell colSpan={3} sx={{ color: "#fff", fontWeight: 700, textAlign: "right" }}>
                                        Total Biaya:
                                      </TableCell>
                                      <TableCell sx={{ color: "#22c55e", fontWeight: 700, textAlign: "right" }}>
                                        Rp {totalCost.toLocaleString('id-ID')}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          );
                        }
                        return <InfoRow label="Sparepart Details" value={workOrder.sparepart_details} />;
                      } catch (e) {
                        return <InfoRow label="Sparepart Details" value={workOrder.sparepart_details} />;
                      }
                    })()}

                    {/* 6. Safety & Quality Check */}
                    <Typography variant="subtitle1" sx={{ color: "#38bdf8", mb: 1, mt: 2, fontWeight: 600 }}>
                      6. Safety & Quality Check
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                      <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                        Work Area Safe?
                      </Typography>
                      {workOrder.safety_area_safe ? (
                        <CheckCircleOutlineIcon sx={{ color: "#10b981" }} />
                      ) : (
                        <CancelOutlinedIcon sx={{ color: "#ef4444" }} />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                      <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                        Guarding Reinstalled?
                      </Typography>
                      {workOrder.safety_guarding ? (
                        <CheckCircleOutlineIcon sx={{ color: "#10b981" }} />
                      ) : (
                        <CancelOutlinedIcon sx={{ color: "#ef4444" }} />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                      <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                        No Tools Left Behind?
                      </Typography>
                      {workOrder.safety_no_tools_left ? (
                        <CheckCircleOutlineIcon sx={{ color: "#10b981" }} />
                      ) : (
                        <CancelOutlinedIcon sx={{ color: "#ef4444" }} />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
                      <Typography sx={{ color: "#94a3b8", minWidth: "180px", fontWeight: 500 }}>
                        Machine Tested OK?
                      </Typography>
                      {workOrder.safety_machine_tested ? (
                        <CheckCircleOutlineIcon sx={{ color: "#10b981" }} />
                      ) : (
                        <CancelOutlinedIcon sx={{ color: "#ef4444" }} />
                      )}
                    </Stack>
                    {workOrder.safety_remarks && (
                      <InfoRow label="Safety Remarks" value={workOrder.safety_remarks} color="#f59e0b" />
                    )}

                    {/* 8. Recommendations */}
                    <Typography variant="subtitle1" sx={{ color: "#38bdf8", mb: 1, mt: 2, fontWeight: 600 }}>
                      8. Recommendations & Follow-up
                    </Typography>
                    {(workOrder.needs_additional_pm || 
                      workOrder.needs_frequent_monitoring || 
                      workOrder.needs_sparepart_adjustment || 
                      workOrder.needs_alarm_adjustment) && (
                      <Box sx={{ mb: 2 }}>
                        {workOrder.needs_additional_pm && (
                          <Chip label="Needs Additional PM" sx={{ m: 0.5, bgcolor: "#3b82f6", color: "#fff" }} />
                        )}
                        {workOrder.needs_frequent_monitoring && (
                          <Chip label="Needs Frequent Monitoring" sx={{ m: 0.5, bgcolor: "#f59e0b", color: "#fff" }} />
                        )}
                        {workOrder.needs_sparepart_adjustment && (
                          <Chip label="Needs Sparepart Adjustment" sx={{ m: 0.5, bgcolor: "#8b5cf6", color: "#fff" }} />
                        )}
                        {workOrder.needs_alarm_adjustment && (
                          <Chip label="Needs Alarm Adjustment" sx={{ m: 0.5, bgcolor: "#ec4899", color: "#fff" }} />
                        )}
                      </Box>
                    )}
                    {workOrder.recommendation_note && (
                      <InfoRow label="Recommendation Notes" value={workOrder.recommendation_note} />
                    )}
                  </Box>
                </>
              )}

              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
                <Button
                  onClick={handleEdit}
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    borderColor: "#fff",
                    color: "#fff",
                    "&:hover": { 
                      borderColor: "#e2e8f0",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={handleClose}
                  variant="contained"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    bgcolor: "#3b82f6",
                    "&:hover": { bgcolor: "#2563eb" },
                  }}
                >
                  Close
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalDetailWorkOrder;
