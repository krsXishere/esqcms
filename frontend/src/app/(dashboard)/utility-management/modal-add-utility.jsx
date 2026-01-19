"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Fade,
  Button,
  Box,
  Typography,
  Chip,
  Alert,
  Autocomplete,
  Stack,
  TextField as MuiTextField,
  styled,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#fff" : "#00000050",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#38bdf8" : "#00000090",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38bdf8",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 0 0 3px rgba(56, 189, 248, 0.2)"
          : "0 0 0 3px rgba(56, 189, 248, 0.1)",
    },
    "& input": {
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
    },
    "& textarea": {
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    "&.Mui-focused": {
      color: "#38bdf8",
    },
  },
  "& .MuiFormHelperText-root": {
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
  },
}));

const ModalAddUtility = ({ open, setOpen, onSuccessAdd, areas }) => {
  const { sendRequest } = useFetchApi();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      area_id: null,
      description: "",
      device_ids: [],
    },
  });

  const [availableDevices, setAvailableDevices] = useState([]);
  const [allDevices, setAllDevices] = useState([]); // Keep track of all devices including mapped ones

  const selectedAreaId = watch("area_id");

  // Fetch devices when area changes
  useEffect(() => {
    if (selectedAreaId) {
      fetchDevices(selectedAreaId);
    } else {
      setAvailableDevices([]);
    }
  }, [selectedAreaId]);

  const fetchDevices = async (areaId) => {
    try {
      const response = await sendRequest({
        url: "/devices",
        params: { area_id: areaId, limit: 100 },
      });

      if (response?.data) {
        setAllDevices(response.data); // Store all devices for reference
        // Filter out devices that are already mapped to other utilities
        const unmappedDevices = response.data.filter(
          (device) =>
            !device.utilityMappings || device.utilityMappings.length === 0
        );
        setAvailableDevices(unmappedDevices);
      }
    } catch (err) {
      console.error("Error fetching devices:", err);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: data.name,
        area_id: data.area_id,
        description: data.description,
        device_ids: data.device_ids.map((d) => d.id),
      };

      await sendRequest({
        url: "/utilities",
        method: "POST",
        data: payload,
      });

      reset();
      setOpen(false);
      if (onSuccessAdd) onSuccessAdd();
    } catch (err) {
      console.error("Error creating utility:", err);
      setError(err.response?.data?.message || "Failed to create utility");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setOpen(false);
  };

  const areaOptions = areas.map((area) => ({
    label: area.title,
    value: area.value,
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 370, sm: 500 },
            bgcolor: theme.palette.mode === "dark" ? "#ffffff15" : "#fff",
            backdropFilter: "blur(10px)",
            borderRadius: "24px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
            }}
          >
            Add New Utility
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Utility name is required" }}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Utility Name"
                  placeholder="e.g., Motor OC 1.1"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="area_id"
              control={control}
              rules={{ required: "Area is required" }}
              render={({ field }) => (
                <Autocomplete
                  options={areaOptions}
                  getOptionLabel={(option) => option.label}
                  value={
                    areaOptions.find((opt) => opt.value === field.value) ||
                    null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.value : null)
                  }
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Area"
                      error={!!errors.area_id}
                      helperText={errors.area_id?.message}
                      fullWidth
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                        color: theme.palette.mode === "dark" ? "#fff" : "#000",
                        borderRadius: "8px",
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiAutocomplete-option": {
                      color: "#fff",
                      "&[aria-selected='true']": { bgcolor: "#2563eb" },
                      "&:hover": { bgcolor: "#334155" },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Description"
                  placeholder="Optional description for this utility"
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  fontWeight: 500,
                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                }}
              >
                Map Devices
              </Typography>
              <Controller
                name="device_ids"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={availableDevices}
                    getOptionLabel={(option) => option.name}
                    value={field.value}
                    onChange={(event, newValue) => {
                      field.onChange(newValue);
                    }}
                    disabled={!selectedAreaId}
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        placeholder={
                          selectedAreaId
                            ? "Select devices to map"
                            : "Select an area first"
                        }
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                          sx={{
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "#334155"
                                : "#e2e8f0",
                            color: theme.palette.mode === "dark" ? "#fff" : "#000",
                          }}
                        />
                      ))
                    }
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor:
                            theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                          color:
                            theme.palette.mode === "dark" ? "#fff" : "#000",
                          borderRadius: "8px",
                        },
                      },
                    }}
                    sx={{
                      width: "100%",
                      "& .MuiAutocomplete-option": {
                        color: "#fff",
                        "&[aria-selected='true']": { bgcolor: "#2563eb" },
                        "&:hover": { bgcolor: "#334155" },
                      },
                    }}
                  />
                )}
              />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
                  display: "block",
                  mt: 0.5,
                }}
              >
                Select devices in the order they should appear (e.g., vibration,
                temperature, current)
              </Typography>

              {/* Show info about already mapped devices */}
              {selectedAreaId && allDevices.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
                    borderRadius: "12px",
                    borderLeft: `4px solid ${
                      theme.palette.mode === "dark" ? "#38bdf8" : "#3b82f6"
                    }`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color:
                        theme.palette.mode === "dark" ? "#38bdf8" : "#3b82f6",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Already Mapped Devices in This Area:
                  </Typography>
                  {allDevices
                    .filter(
                      (device) =>
                        device.utilityMappings &&
                        device.utilityMappings.length > 0
                    )
                    .map((device) => (
                      <Typography
                        key={device.id}
                        variant="caption"
                        sx={{
                          color:
                            theme.palette.mode === "dark"
                              ? "#94a3b8"
                              : "#64748b",
                          display: "block",
                          fontSize: "0.75rem",
                        }}
                      >
                        • <strong>{device.name}</strong> → mapped to{" "}
                        <Box
                          component="span"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "#fbbf24"
                                : "#f59e0b",
                            fontWeight: 600,
                          }}
                        >
                          {device.utilityMappings[0].utility.name}
                        </Box>
                      </Typography>
                    ))}
                  {allDevices.filter(
                    (device) =>
                      device.utilityMappings && device.utilityMappings.length > 0
                  ).length === 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
                        fontSize: "0.75rem",
                      }}
                    >
                      All devices in this area are available
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Stack>

          <Stack
            sx={{ flexDirection: "row", justifyContent: "end", gap: "8px", mt: 3 }}
          >
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                bgcolor: "#01b574",
                borderRadius: "12px",
                "&:hover": {
                  bgcolor: "#019961",
                },
              }}
            >
              {loading ? "Creating..." : "Save"}
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              disabled={loading}
              sx={{ borderRadius: "12px" }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalAddUtility;
