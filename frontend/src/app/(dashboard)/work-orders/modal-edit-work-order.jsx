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
  Divider,
  CircularProgress,
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
import ModalCompleteWorkOrder from "./modal-complete-work-order";

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

const ModalEditWorkOrder = ({ open, setOpen, onSuccessEdit, id }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [usersOption, setUsersOption] = useState([]);
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openCompleteModal, setOpenCompleteModal] = useState(false);
  const { sendRequest } = useFetchApi();
  const theme = useTheme();

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: "",
      priority: "",
      assigned_to: null,
      scheduled_date: null,
      deadline: null,
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    setWorkOrder(null);
    setOpen(false);
  };

  const selectedStatus = watch("status");

  const onSubmit = async (data) => {
    try {
      // If status is changing to "completed", open completion modal instead
      if (data.status === "completed" && workOrder?.status !== "completed") {
        // Close this modal and open completion modal
        setOpen(false);
        setOpenCompleteModal(true);
        return;
      }

      const result = await sendRequest({
        url: `/work-orders/${id}`,
        method: "PATCH",
        data,
      });

      if (result?.success) {
        enqueueSnackbar("Successfully Updated Work Order", { variant: "success" });
        onSuccessEdit();
        handleClose();
      } else {
        enqueueSnackbar("Failed to Update Work Order", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data || "Failed to Update Work Order", {
        variant: "error",
      });
    }
  };

  const handleCompleteSuccess = () => {
    onSuccessEdit();
    setOpenCompleteModal(false);
    // Reset the edit modal
    handleClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !open) return;

      try {
        setLoading(true);
        const [workOrderRes, usersRes] = await Promise.all([
          sendRequest({ url: `/work-orders/${id}` }),
          sendRequest({ url: "/users", params: { limit: 100 } }),
        ]);

        if (workOrderRes?.success) {
          setWorkOrder(workOrderRes.data);
          reset({
            status: workOrderRes.data.status,
            priority: workOrderRes.data.priority,
            assigned_to: workOrderRes.data.assigned_to || null,
            scheduled_date: workOrderRes.data.scheduled_date || null,
            deadline: workOrderRes.data.deadline || null,
            notes: workOrderRes.data.notes || "",
          });
        }

        const formattedUsers = usersRes?.data?.map((user) => ({
          label: user.name,
          value: user.id,
        })) || [];
        setUsersOption(formattedUsers);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        enqueueSnackbar("Failed to load work order data", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, id]);

  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Closed", value: "closed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Critical", value: "critical" },
  ];

  return (
    <>
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
              mb: 2,
              fontWeight: 700,
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
            }}
          >
            Edit Work Order
          </Typography>

          {loading || !workOrder ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
                  Title
                </Typography>
                <Typography variant="body1" sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
                  {workOrder.title}
                </Typography>

                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
                  Type
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    mb: 1,
                  }}
                >
                  {workOrder.type}
                </Typography>

                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
                  Area
                </Typography>
                <Typography variant="body1" sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
                  {workOrder.area?.name || "-"}
                </Typography>

                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
                  Utility
                </Typography>
                <Typography variant="body1" sx={{ color: "#fff", fontWeight: 600 }}>
                  {workOrder.utility?.name || "-"}
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: "#334155" }} />

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.5}>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: "Status is required" }}
                    render={({ field }) => (
                      <Autocomplete
                        options={statusOptions}
                        getOptionLabel={(option) => option.label}
                        value={statusOptions.find((opt) => opt.value === field.value) || null}
                        onChange={(_, newValue) =>
                          field.onChange(newValue ? newValue.value : null)
                        }
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Status"
                            error={!!errors.status}
                            helperText={errors.status?.message}
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
                            label="Assign To"
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
                          label="End Time / Deadline"
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
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        label="Notes"
                        multiline
                        rows={3}
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
                      bgcolor: "#3b82f6",
                      "&:hover": { bgcolor: "#2563eb" },
                    }}
                  >
                    {selectedStatus === "completed" && workOrder?.status !== "completed"
                      ? "Complete Work Order"
                      : "Update Work Order"}
                  </Button>
                </Stack>
              </form>
            </>
          )}
        </Box>
      </Fade>
    </Modal>

    {/* Completion Modal */}
    <ModalCompleteWorkOrder
      open={openCompleteModal}
      setOpen={setOpenCompleteModal}
      onSuccessComplete={handleCompleteSuccess}
      workOrderId={id}
      workOrderType={workOrder?.type}
    />
    </>
  );
};

export default ModalEditWorkOrder;
