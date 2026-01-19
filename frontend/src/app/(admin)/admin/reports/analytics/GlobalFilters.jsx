"use client";
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
  Checkbox,
  FormControlLabel,
  OutlinedInput,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterBar from "@/components/common/FilterBar";

const GlobalFilters = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
}) => {
  const {
    checksheetType,
    dateType,
    dateStart,
    dateEnd,
    models,
    customers,
    stations,
    status,
    includeAfterRepair,
    onlyNG,
    sampleMode,
  } = filters;

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const getAppliedFiltersChips = () => {
    const chips = [];
    
    if (checksheetType) chips.push(checksheetType);
    if (dateStart && dateEnd) {
      chips.push(`${dateStart} - ${dateEnd}`);
    } else if (dateStart) {
      chips.push(dateStart);
    }
    if (models && models.length > 0) {
      chips.push(`Model: ${models.join(", ")}`);
    }
    if (customers && customers.length > 0) {
      chips.push(`Customer: ${customers.join(", ")}`);
    }
    if (stations && stations.length > 0) {
      chips.push(`Station: ${stations.join(", ")}`);
    }
    if (status && status.length > 0) {
      chips.push(`Status: ${status.join(", ")}`);
    }
    if (onlyNG) chips.push("Only NG");
    if (includeAfterRepair) chips.push("Include After Repair");
    if (checksheetType === "DIR" && sampleMode) {
      chips.push(`Sample: ${sampleMode}`);
    }
    
    return chips;
  };

  // Prepare filter bar items using the common FilterBar component structure
  const filterBarItems = [
    {
      name: "dateType",
      label: "Date Type",
      value: dateType,
      onChange: (value) => handleChange("dateType", value),
      options: [
        { value: "inspection", label: "Inspection Date" },
        { value: "approval", label: "Approval Date" },
      ],
      width: 150,
    },
    {
      name: "models",
      label: "Model",
      value: models && models.length > 0 ? models[0] : "",
      onChange: (value) => handleChange("models", value ? [value] : []),
      options: [
        { value: "Model X", label: "Model X" },
        { value: "Model Y", label: "Model Y" },
        { value: "Model Z", label: "Model Z" },
        { value: "Model A", label: "Model A" },
      ],
      width: 150,
    },
    {
      name: "customers",
      label: "Customer",
      value: customers && customers.length > 0 ? customers[0] : "",
      onChange: (value) => handleChange("customers", value ? [value] : []),
      options: [
        { value: "Customer A", label: "Customer A" },
        { value: "Customer B", label: "Customer B" },
        { value: "Customer C", label: "Customer C" },
      ],
      width: 150,
    },
    {
      name: "stations",
      label: "Station/Line",
      value: stations && stations.length > 0 ? stations[0] : "",
      onChange: (value) => handleChange("stations", value ? [value] : []),
      options: [
        { value: "Line A", label: "Line A" },
        { value: "Line B", label: "Line B" },
        { value: "Station 1", label: "Station 1" },
        { value: "Station 2", label: "Station 2" },
      ],
      width: 150,
    },
    {
      name: "status",
      label: "Status",
      value: status && status.length > 0 ? status[0] : "",
      onChange: (value) => handleChange("status", value ? [value] : []),
      options: [
        { value: "OK", label: "OK" },
        { value: "NG", label: "NG" },
        { value: "After Repair", label: "After Repair" },
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Revision", label: "Revision" },
      ],
      width: 150,
    },
  ];

  const activeFiltersCount = [
    dateType !== "inspection" ? 1 : 0,
    dateStart ? 1 : 0,
    dateEnd ? 1 : 0,
    models?.length || 0,
    customers?.length || 0,
    stations?.length || 0,
    status?.length || 0,
    includeAfterRepair ? 1 : 0,
    onlyNG ? 1 : 0,
    checksheetType === "DIR" && sampleMode ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Box>
      {/* Checksheet Type Toggle */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          p: 2,
          mb: 2,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Checksheet Type
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={checksheetType === "DIR" ? "contained" : "outlined"}
                onClick={() => handleChange("checksheetType", "DIR")}
                sx={{
                  bgcolor: checksheetType === "DIR" ? "#3B82F6" : "transparent",
                  color: checksheetType === "DIR" ? "#FFFFFF" : "#64748B",
                  borderColor: "#E5E7EB",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  borderRadius: "8px",
                  textTransform: "none",
                  py: 0.6,
                  px: 3,
                  minHeight: "32px",
                  "&:hover": {
                    bgcolor: checksheetType === "DIR" ? "#2563EB" : "#F1F5F9",
                    borderColor: "#E5E7EB",
                  },
                }}
              >
                DIR
              </Button>
              <Button
                variant={checksheetType === "FI" ? "contained" : "outlined"}
                onClick={() => handleChange("checksheetType", "FI")}
                sx={{
                  bgcolor: checksheetType === "FI" ? "#3B82F6" : "transparent",
                  color: checksheetType === "FI" ? "#FFFFFF" : "#64748B",
                  borderColor: "#E5E7EB",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  borderRadius: "8px",
                  textTransform: "none",
                  py: 0.6,
                  px: 3,
                  minHeight: "32px",
                  "&:hover": {
                    bgcolor: checksheetType === "FI" ? "#2563EB" : "#F1F5F9",
                    borderColor: "#E5E7EB",
                  },
                }}
              >
                FI
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={onReset}
              sx={{
                color: "#64748B",
                borderColor: "#E5E7EB",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.8rem",
                borderRadius: "8px",
                py: 0.5,
                px: 1.5,
                "&:hover": {
                  borderColor: "#D1D5DB",
                  bgcolor: "#F9FAFB",
                },
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={onApply}
              sx={{
                bgcolor: "#3B82F6",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                borderRadius: "8px",
                py: 0.5,
                px: 2,
                "&:hover": {
                  bgcolor: "#2563EB",
                },
              }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Filter Bar - Using common component */}
      <FilterBar
        filters={filterBarItems}
        onClearFilters={onReset}
        activeFiltersCount={activeFiltersCount}
        sticky
      >
        {/* Additional Date Range Filters */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#64748B",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Date Start
            </Typography>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => handleChange("dateStart", e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#111827",
                backgroundColor: "#F5F7FA",
                boxSizing: "border-box",
              }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#64748B",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Date End
            </Typography>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => handleChange("dateEnd", e.target.value)}
              min={dateStart}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#111827",
                backgroundColor: "#F5F7FA",
                boxSizing: "border-box",
              }}
            />
          </Box>
        </Box>

        {/* Additional Options */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={includeAfterRepair}
                onChange={(e) => handleChange("includeAfterRepair", e.target.checked)}
                size="small"
                sx={{
                  color: "#3B82F6",
                  "&.Mui-checked": { color: "#3B82F6" },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Include After Repair
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyNG}
                onChange={(e) => handleChange("onlyNG", e.target.checked)}
                size="small"
                sx={{
                  color: "#EF4444",
                  "&.Mui-checked": { color: "#EF4444" },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Only NG
              </Typography>
            }
          />
          
          {checksheetType === "DIR" && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={sampleMode}
                onChange={(e) => handleChange("sampleMode", e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: "#F5F7FA",
                  borderRadius: 2,
                  fontSize: "0.875rem",
                  height: "36px",
                  color: "#1F2937",
                  fontWeight: 500,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E2E8F0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#CBD5E1",
                  },
                }}
              >
                <MenuItem value="aggregated">Aggregated (Mean)</MenuItem>
                <MenuItem value="median">Aggregated (Median)</MenuItem>
                <MenuItem value="raw">Raw Samples</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>
      </FilterBar>

      {/* Applied Filters Chips */}
      {getAppliedFiltersChips().length > 0 && (
        <Paper
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            p: 2,
            mb: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#64748B",
                mr: 0.5,
              }}
            >
              APPLIED FILTERS:
            </Typography>
            {getAppliedFiltersChips().map((chip, index) => (
              <Chip
                key={index}
                label={chip}
                size="small"
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#1E40AF",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 22,
                  borderRadius: "6px",
                  mb: 0.5,
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default GlobalFilters;
