import React from "react";
import {
  Paper,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Stack,
  Box,
} from "@mui/material";

const QCFilters = ({
  inspectionType,
  setInspectionType,
  dateRange,
  setDateRange,
  model,
  setModel,
  customer,
  setCustomer,
  productionLine,
  setProductionLine,
}) => {
  return (
    <Paper sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 2, p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Inspection Type */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Typography variant="caption" color="#6B7280" sx={{ mb: 0.5, display: "block", fontWeight: 500 }}>
            Inspection Type
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label="DIR"
              onClick={() => setInspectionType("DIR")}
              sx={{
                bgcolor: inspectionType === "DIR" ? "#3B82F6" : "#F3F4F6",
                color: inspectionType === "DIR" ? "#FFFFFF" : "#6B7280",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: inspectionType === "DIR" ? "#2563EB" : "#E5E7EB",
                },
              }}
            />
            <Chip
              label="FI"
              onClick={() => setInspectionType("FI")}
              sx={{
                bgcolor: inspectionType === "FI" ? "#3B82F6" : "#F3F4F6",
                color: inspectionType === "FI" ? "#FFFFFF" : "#6B7280",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: inspectionType === "FI" ? "#2563EB" : "#E5E7EB",
                },
              }}
            />
          </Stack>
        </Grid>

        {/* Date Range */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Typography variant="caption" color="#6B7280" sx={{ mb: 0.5, display: "block", fontWeight: 500 }}>
            Date Range
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{ bgcolor: "#FFFFFF" }}
            >
              <MenuItem value="Choose Date Range">Choose Date Range</MenuItem>
              <MenuItem value="Jan-Mar 2025">Jan-Mar 2025</MenuItem>
              <MenuItem value="Apr-Jun 2025">Apr-Jun 2025</MenuItem>
              <MenuItem value="Jul-Sep 2025">Jul-Sep 2025</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Model */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Typography variant="caption" color="#6B7280" sx={{ mb: 0.5, display: "block", fontWeight: 500 }}>
            Model
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              sx={{ bgcolor: "#FFFFFF" }}
            >
              <MenuItem value="Choose Model">Choose Model</MenuItem>
              <MenuItem value="Model X">Model X</MenuItem>
              <MenuItem value="Model Y">Model Y</MenuItem>
              <MenuItem value="Model Z">Model Z</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Customer */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Typography variant="caption" color="#6B7280" sx={{ mb: 0.5, display: "block", fontWeight: 500 }}>
            Customer
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              sx={{ bgcolor: "#FFFFFF" }}
            >
              <MenuItem value="Choose Customer">Choose Customer</MenuItem>
              <MenuItem value="Customer A">Customer A</MenuItem>
              <MenuItem value="Customer B">Customer B</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Production Line */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Typography variant="caption" color="#6B7280" sx={{ mb: 0.5, display: "block", fontWeight: 500 }}>
            Production Line
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={productionLine}
              onChange={(e) => setProductionLine(e.target.value)}
              sx={{ bgcolor: "#FFFFFF" }}
            >
              <MenuItem value="Choose Line">Choose Line</MenuItem>
              <MenuItem value="Line A">Line A</MenuItem>
              <MenuItem value="Line B">Line B</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Applied Filters */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="#9CA3AF">
          Applied: {inspectionType} - Model {model !== "Choose Model" ? model : "X"} - Line {productionLine !== "Choose Line" ? productionLine : "A"} - {dateRange !== "Choose Date Range" ? dateRange : "Jan-Mar 2025"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default QCFilters;
