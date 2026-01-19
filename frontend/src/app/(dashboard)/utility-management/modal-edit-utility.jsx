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
import { Save } from "@mui/icons-material";
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

const ModalEditUtility = ({ open, setOpen, onSuccessEdit, utility, areas }) => {
  const { sendRequest } = useFetchApi();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      device_ids: [],
    },
  });

  const [availableDevices, setAvailableDevices] = useState([]);
  const [allDevices, setAllDevices] = useState([]); // Keep track of all devices including mapped ones

  // Initialize form when utility changes
  useEffect(() => {
    if (utility && open) {
      const devices = utility.deviceMappings?.map((m) => m.device) || [];
      reset({
        name: utility.name || "",
        description: utility.description || "",
        device_ids: devices,
      });

      // Fetch available devices for this area
      if (utility.area_id) {
        fetchDevices(utility.area_id);
      }
    }
  }, [utility, open, reset]);

  const fetchDevices = async (areaId) => {
    try {
      const response = await sendRequest({
        url: "/devices",
        params: { area_id: areaId, limit: 100 },
      });

      if (response?.data) {
        setAllDevices(response.data); // Store all devices for reference
        // Filter devices: allow unmapped devices + devices already mapped to THIS utility
        const currentUtilityDeviceIds =
          utility?.deviceMappings?.map((m) => m.device_id) || [];
        const availableDevs = response.data.filter(
          (device) =>
            // Either not mapped at all
            (!device.utilityMappings ||
              device.utilityMappings.length === 0 ||
              // Or mapped to the current utility being edited
              currentUtilityDeviceIds.includes(device.id))
        );
        setAvailableDevices(availableDevs);
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
        description: data.description,
        device_ids: data.device_ids.map((d) => d.id),
      };

      await sendRequest({
        url: `/utilities/${utility.id}`,
        method: "PUT",
        data: payload,
      });

      setOpen(false);
      if (onSuccessEdit) onSuccessEdit();
    } catch (err) {
      console.error("Error updating utility:", err);
      setError(err.response?.data?.message || "Failed to update utility");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setOpen(false);
  };

  if (!utility) return null;

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
            Edit Utility
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
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              )}
            />

            <Box
              sx={{
                p: 2,
                bgcolor:
                  theme.palette.mode === "dark" ? "#ffffff10" : "#f1f5f9",
                borderRadius: "12px",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
                }}
              >
                Area:{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  }}
                >
                  {utility.area?.name}
                </Box>{" "}
                (Cannot be changed)
              </Typography>
            </Box>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Description"
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
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        placeholder="Select devices to map"
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
                            color:
                              theme.palette.mode === "dark" ? "#fff" : "#000",
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
                Device order determines display order (drag to reorder if
                needed)
              </Typography>

              {/* Show info about already mapped devices in other utilities */}
              {utility && allDevices.length > 0 && (
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
                    Devices Mapped to Other Utilities:
                  </Typography>
                  {allDevices
                    .filter(
                      (device) =>
                        device.utilityMappings &&
                        device.utilityMappings.length > 0 &&
                        device.utilityMappings[0].utility.id !== utility.id
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
                      device.utilityMappings &&
                      device.utilityMappings.length > 0 &&
                      device.utilityMappings[0].utility.id !== utility.id
                  ).length === 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
                        fontSize: "0.75rem",
                      }}
                    >
                      No devices are mapped to other utilities
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Stack>

          <Stack
            sx={{
              flexDirection: "row",
              justifyContent: "end",
              gap: "8px",
              mt: 3,
            }}
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
              {loading ? "Saving..." : "Save Changes"}
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

export default ModalEditUtility;
