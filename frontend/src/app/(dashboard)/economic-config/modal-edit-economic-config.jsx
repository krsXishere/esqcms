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
  Typography,
  InputAdornment,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { TbCurrencyDollar } from "react-icons/tb";

const ModalEditEconomicConfig = ({ open, setOpen, config, areaId, areas, onSuccess }) => {
  const { sendRequest, loading } = useFetchApi();
  const [error, setError] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState(areaId);

  const [formData, setFormData] = useState({
    revenue_per_kwh: 1500,
    cost_per_kwh: 1200,
    avg_power_output_kw: 100,
    operating_hours_per_day: 8,
    downtime_loss_per_hour: 150000,
    critical_multiplier: 2.0,
    technician_cost_per_hour: 50000,
  });

  useEffect(() => {
    if (open) {
      setSelectedAreaId(areaId);
      if (config) {
        setFormData({
          revenue_per_kwh: config.revenue_per_kwh || 1500,
          cost_per_kwh: config.cost_per_kwh || 1200,
          avg_power_output_kw: config.avg_power_output_kw || 100,
          operating_hours_per_day: config.operating_hours_per_day || 8,
          downtime_loss_per_hour: config.downtime_loss_per_hour || 150000,
          critical_multiplier: config.critical_multiplier || 2.0,
          technician_cost_per_hour: config.technician_cost_per_hour || 50000,
        });
      } else {
        // Reset to defaults for new config
        setFormData({
          revenue_per_kwh: 1500,
          cost_per_kwh: 1200,
          avg_power_output_kw: 100,
          operating_hours_per_day: 8,
          downtime_loss_per_hour: 150000,
          critical_multiplier: 2.0,
          technician_cost_per_hour: 50000,
        });
      }
    }
  }, [open, config, areaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async () => {
    setError("");

    const targetAreaId = selectedAreaId || areaId;
    if (!targetAreaId) {
      setError("Please select an area first");
      return;
    }

    try {
      await sendRequest({
        url: `/roi-analytics/economic-configs/${targetAreaId}`,
        method: "PUT",
        data: formData,
      });
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Failed to save configuration");
    }
  };

  const getAreaName = () => {
    const area = areas?.find((a) => a.id === (selectedAreaId || areaId));
    return area?.name || `Area #${selectedAreaId || areaId}`;
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
        <TbCurrencyDollar size={28} color="#10B981" />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {config ? "Edit" : "Add"} Economic Configuration
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {getAreaName()}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Area Selection (only for new config) */}
          {!config && (
            <FormControl fullWidth>
              <InputLabel>Select Area</InputLabel>
              <Select
                value={selectedAreaId || ""}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                label="Select Area"
              >
                {areas?.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Revenue & Cost */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              ⚡ Revenue & Cost per kWh
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Revenue per kWh"
                name="revenue_per_kwh"
                type="number"
                value={formData.revenue_per_kwh}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                helperText="Revenue per kWh sold"
              />
              <TextField
                label="Cost per kWh"
                name="cost_per_kwh"
                type="number"
                value={formData.cost_per_kwh}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                helperText="Production cost per kWh"
              />
            </Box>
          </Box>

          <Divider />

          {/* Operating Parameters */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              🏭 Operating Parameters
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Avg Power Output"
                name="avg_power_output_kw"
                type="number"
                value={formData.avg_power_output_kw}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">kW</InputAdornment>,
                }}
                helperText="Average power output"
              />
              <TextField
                label="Operating Hours/Day"
                name="operating_hours_per_day"
                type="number"
                value={formData.operating_hours_per_day}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                }}
                helperText="Operating hours per day"
              />
            </Box>
          </Box>

          <Divider />

          {/* Loss & Cost Parameters */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1.5}>
              💰 Loss & Cost Parameters
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Downtime Loss per Hour"
                name="downtime_loss_per_hour"
                type="number"
                value={formData.downtime_loss_per_hour}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/jam</InputAdornment>,
                }}
                helperText="Loss per hour if system is down"
              />
              <TextField
                label="Technician Cost per Hour"
                name="technician_cost_per_hour"
                type="number"
                value={formData.technician_cost_per_hour}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hour</InputAdornment>,
                }}
                helperText="Technician cost per work hour"
              />
            </Box>
            <TextField
              label="Critical Priority Multiplier"
              name="critical_multiplier"
              type="number"
              value={formData.critical_multiplier}
              onChange={handleChange}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">x</InputAdornment>,
              }}
              inputProps={{ step: 0.1 }}
              helperText="Multiplier for critical priority WO (e.g. 2x = double the loss)"
            />
          </Box>

          {/* Calculation Preview */}
          <Box
            sx={{
              bgcolor: "#10B98110",
              border: "1px solid #10B98140",
              borderRadius: "12px",
              p: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} color="#10B981" mb={1}>
              📊 Calculation Preview
            </Typography>
            <Typography variant="body2" color="textSecondary">
              With this configuration, if a downtime of 4 hours occurs on a High priority WO:
            </Typography>
            <Typography variant="body2" fontWeight={600} mt={1}>
              • Loss = 4 hours × Rp {formData.downtime_loss_per_hour.toLocaleString()} × 1.5 = 
              <span style={{ color: "#EF4444" }}> Rp {(4 * formData.downtime_loss_per_hour * 1.5).toLocaleString()}</span>
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              • If WO is completed in 2 hours, Loss Avoided = 
              <span style={{ color: "#10B981" }}> Rp {(2 * formData.downtime_loss_per_hour * 1.5).toLocaleString()}</span>
            </Typography>
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
            bgcolor: "#10B981",
            "&:hover": { bgcolor: "#059669" },
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEditEconomicConfig;
