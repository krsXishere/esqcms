"use client";
import React from "react";
import {
  Grid,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Controller } from "react-hook-form";

/**
 * Template Metadata for FI
 * Input fields for FI template basic information
 */

// Mock data - replace with actual API calls
const MOCK_MODELS = [
  { id: 1, label: "Model A - Sedan" },
  { id: 2, label: "Model B - SUV" },
  { id: 3, label: "Model C - Truck" },
  { id: 4, label: "Model D - Van" },
];

const MOCK_CUSTOMERS = [
  { id: 1, label: "Customer A - PT ABC" },
  { id: 2, label: "Customer B - PT XYZ" },
  { id: 3, label: "Customer C - PT 123" },
];

const MOCK_DESAIN_TRAILER = [
  "Type A - Standard",
  "Type B - Heavy Duty",
  "Type C - Light",
  "Type D - Custom",
];

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(47, 128, 237, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2F80ED",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#374151",
  },
  "& .MuiInputBase-input": {
    color: "#1F2937",
  },
};

const TemplateMetaFI = ({ control, disabled }) => {
  return (
    <Grid container spacing={2.5}>
      {/* Row 1 */}
      <Grid item xs={12} md={6}>
        <Controller
          name="templateCode"
          control={control}
          rules={{ required: "Template Code is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Template Code"
              placeholder="e.g., TPL-FI-001"
              required
              error={!!error}
              helperText={error?.message}
              disabled={disabled}
              sx={textFieldSx}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="templateName"
          control={control}
          rules={{ required: "Template Name is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Template Name"
              placeholder="e.g., Final Visual Inspection"
              required
              error={!!error}
              helperText={error?.message}
              disabled={disabled}
              sx={textFieldSx}
            />
          )}
        />
      </Grid>

      {/* Row 2 */}
      <Grid item xs={12} md={6}>
        <Controller
          name="model"
          control={control}
          rules={{ required: "Model is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              value={value}
              onChange={(e, newValue) => onChange(newValue)}
              options={MOCK_MODELS}
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Model"
                  placeholder="Select model"
                  required
                  error={!!error}
                  helperText={error?.message}
                  sx={textFieldSx}
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="desainTrailer"
          control={control}
          rules={{ required: "Desain Trailer is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              value={value}
              onChange={(e, newValue) => onChange(newValue)}
              options={MOCK_DESAIN_TRAILER}
              freeSolo
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Desain Trailer"
                  placeholder="Select or type design"
                  required
                  error={!!error}
                  helperText={error?.message}
                  sx={textFieldSx}
                />
              )}
            />
          )}
        />
      </Grid>

      {/* Row 3 */}
      <Grid item xs={12} md={6}>
        <Controller
          name="customer"
          control={control}
          rules={{ required: "Customer is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              value={value}
              onChange={(e, newValue) => {
                // Handle both object (from dropdown) and string (freeSolo)
                if (typeof newValue === "string") {
                  onChange(newValue);
                } else {
                  onChange(newValue?.label || newValue);
                }
              }}
              options={MOCK_CUSTOMERS}
              getOptionLabel={(option) => {
                if (typeof option === "string") return option;
                return option.label || "";
              }}
              freeSolo
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  placeholder="Select or type customer name"
                  required
                  error={!!error}
                  helperText={error?.message}
                  sx={textFieldSx}
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Description"
              placeholder="Optional description"
              multiline
              rows={1}
              disabled={disabled}
              sx={textFieldSx}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default TemplateMetaFI;
