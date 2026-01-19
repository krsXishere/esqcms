"use client";
import React, { useState, useEffect } from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  Autocomplete,
  TextField as MuiTextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useForm, Controller } from "react-hook-form";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 16,
    color: "#fff",
    "& fieldset": {
      borderColor: "#fff",
    },
    "&:hover fieldset": {
      borderColor: "#eaeaea",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38bdf8",
      boxShadow: "0 0 14px rgba(56,189,248,0.5)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#fff",
  },
}));

const ModalAddWorkOrder = ({ open, setOpen, onSuccessAdd }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [areasOption, setAreasOption] = useState([]);
  const [utilitiesOption, setUtilitiesOption] = useState([]);
  const [usersOption, setUsersOption] = useState([]);
  const { sendRequest } = useFetchApi();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      type: "corrective",
      priority: "medium",
      area_id: null,
      utility_id: null,
      assigned_to: null,
      scheduled_date: null,
      deadline: null,
      estimated_hours: null,
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const result = await sendRequest({
        url: "/work-orders",
        method: "POST",
        data: {
          ...data,
          estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        },
      });
      
      if (result?.success) {
        enqueueSnackbar("Successfully Added Work Order", { variant: "success" });
        onSuccessAdd();
        reset();
        setOpen(false);
      } else {
        enqueueSnackbar("Failed to Add Work Order", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data || "Failed to Add Work Order", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, usersRes] = await Promise.all([
          sendRequest({ url: "/areas", params: { limit: 100 } }),
          sendRequest({ url: "/users", params: { limit: 100 } }),
        ]);

        const formattedAreas = areasRes?.data?.map((area) => ({
          label: area.name,
          value: area.id,
        })) || [];

        const formattedUsers = usersRes?.data?.map((user) => ({
          label: user.name,
          value: user.id,
        })) || [];

        setAreasOption(formattedAreas);
        setUsersOption(formattedUsers);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Watch area_id to fetch utilities
  const selectedAreaId = watch("area_id");
  
  useEffect(() => {
    const fetchUtilities = async () => {
      if (!selectedAreaId) {
        setUtilitiesOption([]);
        setValue("utility_id", null);
        return;
      }

      try {
        const response = await sendRequest({ 
          url: "/utilities", 
          params: { area_id: selectedAreaId, limit: 100 } 
        });
        
        const formattedUtilities = response?.data?.map((utility) => ({
          label: utility.name,
          value: utility.id,
        })) || [];
        
        setUtilitiesOption(formattedUtilities);
      } catch (err) {
        console.error("Failed to fetch utilities:", err);
        setUtilitiesOption([]);
      }
    };

    fetchUtilities();
  }, [selectedAreaId]);

  const typeOptions = [
    { label: "Corrective", value: "corrective" },
    { label: "Preventive", value: "preventive" },
    { label: "Inspection", value: "inspection" },
  ];

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Critical", value: "critical" },
  ];

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
            maxWidth: "600px",
            width: "90%",
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
            }}
          >
            Create New Work Order
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Description"
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="type"
                control={control}
                rules={{ required: "Type is required" }}
                render={({ field }) => (
                  <Autocomplete
                    options={typeOptions}
                    getOptionLabel={(option) => option.label}
                    value={typeOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.value : null)
                    }
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Type"
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        fullWidth
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                          color: theme.palette.mode === "dark" ? "#fff" : "#000",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="priority"
                control={control}
                rules={{ required: "Priority is required" }}
                render={({ field }) => (
                  <Autocomplete
                    options={priorityOptions}
                    getOptionLabel={(option) => option.label}
                    value={priorityOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.value : null)
                    }
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Priority"
                        error={!!errors.priority}
                        helperText={errors.priority?.message}
                        fullWidth
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                          color: theme.palette.mode === "dark" ? "#fff" : "#000",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="area_id"
                control={control}
                rules={{ required: "Area is required" }}
                render={({ field }) => (
                  <Autocomplete
                    options={areasOption}
                    getOptionLabel={(option) => option.label}
                    value={areasOption.find((opt) => opt.value === field.value) || null}
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
                          bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                          color: theme.palette.mode === "dark" ? "#fff" : "#000",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="utility_id"
                control={control}
                rules={{ required: "Utility is required" }}
                render={({ field }) => (
                  <Autocomplete
                    options={utilitiesOption}
                    getOptionLabel={(option) => option.label}
                    value={utilitiesOption.find((opt) => opt.value === field.value) || null}
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.value : null)
                    }
                    disabled={!selectedAreaId}
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Utility"
                        error={!!errors.utility_id}
                        helperText={errors.utility_id?.message || (!selectedAreaId ? "Select Area first" : "")}
                        fullWidth
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                          color: theme.palette.mode === "dark" ? "#fff" : "#000",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="assigned_to"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={usersOption}
                    getOptionLabel={(option) => option.label}
                    value={usersOption.find((opt) => opt.value === field.value) || null}
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.value : null)
                    }
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Assign To (Optional)"
                        fullWidth
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                          color: theme.palette.mode === "dark" ? "#fff" : "#000",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="scheduled_date"
                control={control}
                rules={{ required: "Start Time is required" }}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Start Time"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => {
                        field.onChange(newValue ? newValue.toISOString() : null);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.scheduled_date,
                          helperText: errors.scheduled_date?.message,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 4,
                              color: "#fff",
                              "& fieldset": {
                                borderColor: "#fff",
                              },
                              "&:hover fieldset": {
                                borderColor: "#eaeaea",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#38bdf8",
                                boxShadow: "0 0 14px rgba(56,189,248,0.5)",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "#fff",
                            },
                            "& .MuiSvgIcon-root": {
                              color: "#fff",
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              />

              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="End Time / Deadline (Optional)"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => {
                        field.onChange(newValue ? newValue.toISOString() : null);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 4,
                              color: "#fff",
                              "& fieldset": {
                                borderColor: "#fff",
                              },
                              "&:hover fieldset": {
                                borderColor: "#eaeaea",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#38bdf8",
                                boxShadow: "0 0 14px rgba(56,189,248,0.5)",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "#fff",
                            },
                            "& .MuiSvgIcon-root": {
                              color: "#fff",
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              />

              <Controller
                name="estimated_hours"
                control={control}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Estimated Hours (Optional)"
                    type="number"
                    inputProps={{ min: 0, step: 0.5 }}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Notes (Optional)"
                    multiline
                    rows={2}
                    fullWidth
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={handleClose}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  border: "2px solid",
                  borderColor: theme.palette.mode === "dark" ? "#475569" : "#e5e7eb",
                  "&:hover": {
                    bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#f3f4f6",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                Create
              </Button>
            </Stack>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalAddWorkOrder;
