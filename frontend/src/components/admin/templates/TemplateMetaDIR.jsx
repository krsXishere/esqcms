"use client";
import React from "react";
import {
  Grid,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Controller } from "react-hook-form";

/**
 * Template Metadata for DIR
 * Input fields for DIR template basic information
 */

// Mock data - replace with actual API calls
const MOCK_MODELS = [
  { id: 1, label: "Model A - Sedan" },
  { id: 2, label: "Model B - SUV" },
  { id: 3, label: "Model C - Truck" },
  { id: 4, label: "Model D - Van" },
];

const MOCK_PARTS = [
  { id: 1, label: "Front Bumper" },
  { id: 2, label: "Rear Bumper" },
  { id: 3, label: "Side Panel" },
  { id: 4, label: "Chassis Frame" },
  { id: 5, label: "Floor Panel" },
];

const MOCK_MATERIALS = [
  { id: 1, label: "Steel SS400" },
  { id: 2, label: "Aluminum A5052" },
  { id: 3, label: "Steel SPCC" },
  { id: 4, label: "Stainless SUS304" },
];

const MOCK_PROCESSES = [
  "Welding",
  "Cutting",
  "Bending",
  "Assembly",
  "Painting",
  "Machining",
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

const TemplateMetaDIR = ({ control, disabled }) => {
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
              placeholder="e.g., TPL-DIR-001"
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
              placeholder="e.g., Chassis Dimensional Check"
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
          name="partName"
          control={control}
          rules={{ required: "Part Name is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              value={value}
              onChange={(e, newValue) => onChange(newValue)}
              options={MOCK_PARTS}
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Part Name"
                  placeholder="Select part"
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
          name="drawingNo"
          control={control}
          rules={{ required: "Drawing No is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Drawing No"
              placeholder="e.g., DWG-12345"
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
          name="process"
          control={control}
          rules={{ required: "Process is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              value={value}
              onChange={(e, newValue) => onChange(newValue)}
              options={MOCK_PROCESSES}
              freeSolo
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Process"
                  placeholder="Select or type process"
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

      {/* Row 4 */}
      <Grid item xs={12} md={6}>
        <Controller
          name="material"
          control={control}
          rules={{ required: "Material is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              value={value}
              onChange={(e, newValue) => onChange(newValue)}
              options={MOCK_MATERIALS}
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Material"
                  placeholder="Select material"
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

export default TemplateMetaDIR;
