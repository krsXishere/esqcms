"use client";
import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useFetchApi } from "@/app/hook/useFetchApi";

/**
 * AlarmWorkOrderAction Component
 * 
 * Provides quick action to create work order from alarm
 * Can be used in alarm tables, alarm panels, or detail views
 */
const AlarmWorkOrderAction = ({ alarm, onWorkOrderCreated }) => {
  const { sendRequest } = useFetchApi();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    priority: "high",
    assigned_to: "",
    notes: "",
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setFormData({
      priority: "high",
      assigned_to: "",
      notes: "",
    });
  };

  const handleCreateWorkOrder = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await sendRequest({
        url: "/work-orders/from-alarm",
        method: "POST",
        data: {
          alarm_id: alarm.id,
          priority: formData.priority,
          assigned_to: formData.assigned_to || undefined,
          notes: formData.notes,
        },
      });

      if (response?.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          if (onWorkOrderCreated) {
            onWorkOrderCreated(response.data);
          }
        }, 1500);
      } else {
        setError(response?.message || "Failed to create work order");
      }
    } catch (err) {
      console.error("Failed to create work order from alarm:", err);
      setError(err?.response?.data?.message || "Failed to create work order");
    } finally {
      setLoading(false);
    }
  };

  // Check if alarm is active (not terminated)
  const isActive = !alarm.termination_time;
  
  // Extract alarm severity/priority
  const getAlarmSeverity = () => {
    const desc = (alarm.description || "").toLowerCase();
    if (desc.includes("critical") || desc.includes("high")) return "critical";
    if (desc.includes("medium")) return "high";
    return "medium";
  };

  return (
    <>
      <Tooltip title={isActive ? "Create Work Order" : "Alarm already resolved"}>
        <span>
          <IconButton
            size="small"
            color="warning"
            onClick={handleOpenDialog}
            disabled={!isActive}
          >
            <BuildIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BuildIcon color="warning" />
            <Typography variant="h6">Create Work Order from Alarm</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {success ? (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              Work order created successfully!
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              {error && (
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              {/* Alarm Context */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(255, 152, 0, 0.1)",
                  borderRadius: 1,
                  border: "1px solid rgba(255, 152, 0, 0.3)",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Alarm Details
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {alarm.description}
                </Typography>
                {alarm.metric_name && (
                  <Typography variant="caption" color="text.secondary">
                    {alarm.metric_name}: {alarm.value} {alarm.metric_unit}
                    {alarm.high_threshold && ` (Threshold: ${alarm.high_threshold})`}
                  </Typography>
                )}
                {alarm.activation_time && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Activated: {new Date(alarm.activation_time).toLocaleString()}
                  </Typography>
                )}
              </Box>

              {/* Work Order Form */}
              <TextField
                select
                label="Priority"
                fullWidth
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                helperText="Work order priority level"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>

              <TextField
                label="Assign To (User ID)"
                fullWidth
                type="number"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                helperText="Optional: Assign to specific user"
              />

              <TextField
                label="Additional Notes"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional context or instructions..."
              />

              <Alert severity="info" sx={{ mt: 1 }}>
                A corrective work order will be created with this alarm context.
                The title and description will be auto-generated.
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {success ? "Close" : "Cancel"}
          </Button>
          {!success && (
            <Button
              onClick={handleCreateWorkOrder}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <BuildIcon />}
            >
              Create Work Order
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlarmWorkOrderAction;
