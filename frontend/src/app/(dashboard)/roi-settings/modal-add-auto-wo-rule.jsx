"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
  Divider,
  Alert,
} from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { TbRobot } from "react-icons/tb";

const ModalAddAutoWORule = ({ open, setOpen, onSuccess }) => {
  const { sendRequest, loading } = useFetchApi();
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [deviceCategories, setDeviceCategories] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    alarm_keyword: "",
    metric_name: "",
    severity: "warning",
    area_id: "",
    device_category_id: "",
    wo_priority: "high",
    wo_type: "corrective",
    sla_hours: 24,
    auto_assign_to: "",
    estimated_loss_per_hour: 150000,
  });

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  const fetchDropdownData = async () => {
    try {
      const [areasRes, usersRes, categoriesRes] = await Promise.all([
        sendRequest({ url: "/areas" }),
        sendRequest({ url: "/users" }),
        sendRequest({ url: "/device-categories" }),
      ]);
      setAreas(areasRes?.data || []);
      setUsers(usersRes?.data || []);
      setDeviceCategories(categoriesRes?.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdown data:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!formData.name || !formData.severity || !formData.wo_priority) {
      setError("Name, Severity, and WO Priority are required");
      return;
    }

    if (!formData.alarm_keyword && !formData.metric_name) {
      setError("At least fill in Alarm Keyword or Metric Name as trigger");
      return;
    }

    try {
      await sendRequest({
        url: "/roi-analytics/auto-wo-rules",
        method: "POST",
        data: formData,
      });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        alarm_keyword: "",
        metric_name: "",
        severity: "warning",
        area_id: "",
        device_category_id: "",
        wo_priority: "high",
        wo_type: "corrective",
        sla_hours: 24,
        auto_assign_to: "",
        estimated_loss_per_hour: 150000,
      });
      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Failed to create rule");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px" },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TbRobot size={28} color="#8B5CF6" />
        <Typography variant="h6" fontWeight={600}>
          Add Auto WO Rule
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Basic Info */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              📝 Basic Information
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Rule Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                placeholder="e.g. Over Voltage Alert"
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={1}
              />
            </Box>
          </Box>

          <Divider />

          {/* Trigger Conditions */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              ⚡ Trigger Conditions
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Alarm Keyword"
                name="alarm_keyword"
                value={formData.alarm_keyword}
                onChange={handleChange}
                fullWidth
                placeholder="e.g. voltage, temperature"
                helperText="Match if alarm description contains this keyword"
              />
              <TextField
                label="Metric Name"
                name="metric_name"
                value={formData.metric_name}
                onChange={handleChange}
                fullWidth
                placeholder="e.g. SOC, voltage"
                helperText="Match if alarm metric contains this name"
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Minimum Severity</InputLabel>
              <Select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                label="Minimum Severity"
              >
                <MenuItem value="warning">⚠️ Warning</MenuItem>
                <MenuItem value="critical">🔴 Critical</MenuItem>
                <MenuItem value="emergency">🚨 Emergency</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Scope */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              🎯 Scope (Optional)
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Area</InputLabel>
                <Select
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  label="Area"
                >
                  <MenuItem value="">All Areas</MenuItem>
                  {areas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Device Category</InputLabel>
                <Select
                  name="device_category_id"
                  value={formData.device_category_id}
                  onChange={handleChange}
                  label="Device Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {deviceCategories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider />

          {/* WO Settings */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              📋 Work Order Settings
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>WO Priority</InputLabel>
                <Select
                  name="wo_priority"
                  value={formData.wo_priority}
                  onChange={handleChange}
                  label="WO Priority"
                >
                  <MenuItem value="low">🟢 Low</MenuItem>
                  <MenuItem value="medium">🔵 Medium</MenuItem>
                  <MenuItem value="high">🟠 High</MenuItem>
                  <MenuItem value="critical">🔴 Critical</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>WO Type</InputLabel>
                <Select
                  name="wo_type"
                  value={formData.wo_type}
                  onChange={handleChange}
                  label="WO Type"
                >
                  <MenuItem value="corrective">Corrective</MenuItem>
                  <MenuItem value="preventive">Preventive</MenuItem>
                  <MenuItem value="inspection">Inspection</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="SLA (Hours)"
                name="sla_hours"
                type="number"
                value={formData.sla_hours}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                }}
                helperText="WO deadline from creation time"
              />
              <FormControl fullWidth>
                <InputLabel>Auto Assign To</InputLabel>
                <Select
                  name="auto_assign_to"
                  value={formData.auto_assign_to}
                  onChange={handleChange}
                  label="Auto Assign To"
                >
                  <MenuItem value="">No Auto Assign</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider />

          {/* Economic Impact */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              💰 Estimated Economic Impact
            </Typography>
            <TextField
              label="Estimated Loss per Hour"
              name="estimated_loss_per_hour"
              type="number"
              value={formData.estimated_loss_per_hour}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                endAdornment: <InputAdornment position="end">/hour</InputAdornment>,
              }}
              helperText="Estimated loss per hour if alarm is not handled"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={() => setOpen(false)} sx={{ borderRadius: "8px" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: "#8B5CF6",
            "&:hover": { bgcolor: "#7C3AED" },
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          {loading ? "Saving..." : "Save Rule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAddAutoWORule;
