"use client";
import React, { useState, useEffect } from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  TextField as MuiTextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Divider,
  Autocomplete,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { MdAdd, MdDelete } from "react-icons/md";
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

const ModalCompleteWorkOrder = ({ open, setOpen, onSuccessComplete, workOrderId, workOrderType }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { sendRequest, loading } = useFetchApi();
  const theme = useTheme();
  const [sparepartUsed, setSparepartUsed] = useState(false);
  const [sparepartList, setSparepartList] = useState([{ name: "", quantity: 1, unit_price: 0, total_price: 0 }]);
  const [sparepartHistory, setSparepartHistory] = useState([]);

  // Fetch sparepart from database first, then fallback to work order history
  const fetchSparepartHistory = async () => {
    try {
      // Try to fetch from spareparts API first
      const sparepartResult = await sendRequest({ url: "/spareparts", params: { limit: 200 } });
      if (sparepartResult?.success && sparepartResult?.data?.length > 0) {
        const sparepartOptions = sparepartResult.data.map((sp) => ({
          name: sp.name,
          unit_price: sp.unit_price || 0,
          material_number: sp.material_number,
          category: sp.category,
        }));
        setSparepartHistory(sparepartOptions);
        return;
      }
      
      // Fallback: fetch from completed work orders
      const result = await sendRequest({ url: "/work-orders", params: { status: "completed", limit: 100 } });
      if (result?.success && result?.data) {
        const historyMap = new Map();
        result.data.forEach((wo) => {
          if (wo.sparepart_details) {
            try {
              const parts = JSON.parse(wo.sparepart_details);
              if (Array.isArray(parts)) {
                parts.forEach((part) => {
                  if (part.name && !historyMap.has(part.name.toLowerCase())) {
                    historyMap.set(part.name.toLowerCase(), {
                      name: part.name,
                      unit_price: part.unit_price || 0,
                    });
                  }
                });
              }
            } catch (e) {
              // Not JSON format, skip
            }
          }
        });
        setSparepartHistory(Array.from(historyMap.values()));
      }
    } catch (error) {
      console.error("Failed to fetch sparepart history:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSparepartHistory();
    }
  }, [open]);

  // Handle sparepart row changes
  const handleSparepartChange = (index, field, value) => {
    const newList = [...sparepartList];
    newList[index][field] = value;
    
    // Auto-calculate total price
    if (field === "quantity" || field === "unit_price") {
      newList[index].total_price = (newList[index].quantity || 0) * (newList[index].unit_price || 0);
    }
    
    // If name is selected from history, auto-fill unit price
    if (field === "name" && typeof value === "object" && value?.unit_price) {
      newList[index].unit_price = value.unit_price;
      newList[index].name = value.name;
      newList[index].total_price = (newList[index].quantity || 0) * value.unit_price;
    }
    
    setSparepartList(newList);
  };

  const addSparepartRow = () => {
    setSparepartList([...sparepartList, { name: "", quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeSparepartRow = (index) => {
    if (sparepartList.length > 1) {
      const newList = sparepartList.filter((_, i) => i !== index);
      setSparepartList(newList);
    }
  };

  const getTotalSparepartCost = () => {
    return sparepartList.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      completion_status: "completed_normal",
      problem_found: "",
      action_taken: "",
      failure_mode: null,
      root_cause_primary: null,
      root_cause_detail: "",
      downtime_start: null,
      downtime_end: null,
      production_stopped: false,
      estimated_production_loss: null,
      sparepart_details: "",
      safety_area_safe: true,
      safety_guarding: true,
      safety_no_tools_left: true,
      safety_machine_tested: true,
      safety_remarks: "",
      needs_additional_pm: false,
      needs_frequent_monitoring: false,
      needs_sparepart_adjustment: false,
      needs_alarm_adjustment: false,
      recommendation_note: "",
    },
  });

  const handleClose = () => {
    reset();
    setSparepartUsed(false);
    setSparepartList([{ name: "", quantity: 1, unit_price: 0, total_price: 0 }]);
    setOpen(false);
  };

  const downtimeStart = watch("downtime_start");
  const downtimeEnd = watch("downtime_end");
  const downtimeTotal = downtimeStart && downtimeEnd 
    ? Math.round((dayjs(downtimeEnd).diff(dayjs(downtimeStart), 'minute')))
    : 0;

  const onSubmit = async (data) => {
    try {
      // Format sparepart list as JSON string
      const sparepartDetailsJson = sparepartUsed && sparepartList.some(s => s.name) 
        ? JSON.stringify(sparepartList.filter(s => s.name).map(s => ({
            name: typeof s.name === 'object' ? s.name.name : s.name,
            quantity: s.quantity,
            unit_price: s.unit_price,
            total_price: s.total_price,
          })))
        : null;

      const completionData = {
        status: "completed",
        completion_status: data.completion_status,
        problem_found: data.problem_found,
        action_taken: data.action_taken,
        downtime_start: data.downtime_start ? dayjs(data.downtime_start).toISOString() : null,
        downtime_end: data.downtime_end ? dayjs(data.downtime_end).toISOString() : null,
        downtime_total_minutes: downtimeTotal,
        production_stopped: data.production_stopped,
        estimated_production_loss: data.estimated_production_loss ? parseFloat(data.estimated_production_loss) : null,
        sparepart_used: sparepartUsed,
        sparepart_details: sparepartDetailsJson,
        safety_area_safe: data.safety_area_safe,
        safety_guarding: data.safety_guarding,
        safety_no_tools_left: data.safety_no_tools_left,
        safety_machine_tested: data.safety_machine_tested,
        safety_remarks: data.safety_remarks,
        needs_additional_pm: data.needs_additional_pm,
        needs_frequent_monitoring: data.needs_frequent_monitoring,
        needs_sparepart_adjustment: data.needs_sparepart_adjustment,
        needs_alarm_adjustment: data.needs_alarm_adjustment,
        recommendation_note: data.recommendation_note,
        completed_at: new Date().toISOString(),
      };

      // Add failure classification for corrective work orders
      if (workOrderType === "corrective") {
        completionData.failure_mode = data.failure_mode;
        completionData.root_cause_primary = data.root_cause_primary;
        completionData.root_cause_detail = data.root_cause_detail;
      }

      const result = await sendRequest({
        url: `/work-orders/${workOrderId}`,
        method: "PATCH",
        data: completionData,
      });

      if (result?.success) {
        enqueueSnackbar("Work Order Completed Successfully", { variant: "success" });
        onSuccessComplete();
        handleClose();
      } else {
        enqueueSnackbar("Failed to Complete Work Order", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data || "Failed to Complete Work Order", {
        variant: "error",
      });
    }
  };

  const failureModeOptions = [
    "Bearing Failure",
    "Overcurrent",
    "Misalignment",
    "Overheating",
    "Sensor Fault",
    "Mechanical Wear",
    "Electrical Short",
    "Vibration Excessive",
    "Unknown",
  ];

  const rootCauseOptions = [
    "Wear & Tear",
    "Installation Error",
    "Electrical Issue",
    "Operator Misuse",
    "Process Overload",
    "External Factor",
    "Lack of Maintenance",
    "Design Flaw",
    "Unknown",
  ];

  const allSafetyChecked = watch("safety_area_safe") && 
                          watch("safety_guarding") && 
                          watch("safety_no_tools_left") && 
                          watch("safety_machine_tested");

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
            maxWidth: "800px",
            width: "95%",
            maxHeight: "90vh",
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
            Complete Work Order
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* 1. Completion Status */}
              <Box>
                <FormControl component="fieldset">
                  <FormLabel sx={{ color: "#fff", mb: 1, fontWeight: 600 }}>
                    1. Completion Status *
                  </FormLabel>
                  <Controller
                    name="completion_status"
                    control={control}
                    rules={{ required: "Completion status is required" }}
                    render={({ field }) => (
                      <RadioGroup {...field}>
                        <FormControlLabel
                          value="completed_normal"
                          control={<Radio sx={{ color: "#fff" }} />}
                          label="Work completed normally"
                          sx={{ color: "#fff" }}
                        />
                        <FormControlLabel
                          value="completed_temporary"
                          control={<Radio sx={{ color: "#fff" }} />}
                          label="Work completed temporarily (temporary fix)"
                          sx={{ color: "#fff" }}
                        />
                        <FormControlLabel
                          value="not_completed_escalated"
                          control={<Radio sx={{ color: "#fff" }} />}
                          label="Work could not be completed (escalated)"
                          sx={{ color: "#fff" }}
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Box>

              <Divider sx={{ borderColor: "#334155" }} />

              {/* 2. Field Work Description */}
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                  2. Field Work Description *
                </Typography>
                <Stack spacing={2}>
                  <Controller
                    name="problem_found"
                    control={control}
                    rules={{ required: "Problem found is required" }}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        label="Problem Found *"
                        multiline
                        rows={3}
                        error={!!errors.problem_found}
                        helperText={errors.problem_found?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="action_taken"
                    control={control}
                    rules={{ required: "Action taken is required" }}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        label="Action Taken *"
                        multiline
                        rows={3}
                        error={!!errors.action_taken}
                        helperText={errors.action_taken?.message}
                        fullWidth
                      />
                    )}
                  />
                </Stack>
              </Box>

              {/* 3. Failure Classification (for corrective only) */}
              {workOrderType === "corrective" && (
                <>
                  <Divider sx={{ borderColor: "#334155" }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                      3. Failure Classification * (Corrective Only)
                    </Typography>
                    <Stack spacing={2}>
                      <Controller
                        name="failure_mode"
                        control={control}
                        rules={{ required: workOrderType === "corrective" ? "Failure mode is required" : false }}
                        render={({ field }) => (
                          <Autocomplete
                            options={failureModeOptions}
                            value={field.value}
                            onChange={(_, newValue) => field.onChange(newValue)}
                            renderInput={(params) => (
                              <StyledTextField
                                {...params}
                                label="Failure Mode *"
                                error={!!errors.failure_mode}
                                helperText={errors.failure_mode?.message}
                                fullWidth
                              />
                            )}
                            slotProps={{
                              paper: {
                                sx: {
                                  bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                                },
                              },
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="root_cause_primary"
                        control={control}
                        rules={{ required: workOrderType === "corrective" ? "Root cause is required" : false }}
                        render={({ field }) => (
                          <Autocomplete
                            options={rootCauseOptions}
                            value={field.value}
                            onChange={(_, newValue) => field.onChange(newValue)}
                            renderInput={(params) => (
                              <StyledTextField
                                {...params}
                                label="Root Cause (Primary) *"
                                error={!!errors.root_cause_primary}
                                helperText={errors.root_cause_primary?.message}
                                fullWidth
                              />
                            )}
                            slotProps={{
                              paper: {
                                sx: {
                                  bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                                },
                              },
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="root_cause_detail"
                        control={control}
                        render={({ field }) => (
                          <StyledTextField
                            {...field}
                            label="Root Cause (Detail) - Optional"
                            multiline
                            rows={2}
                            fullWidth
                          />
                        )}
                      />
                    </Stack>
                  </Box>
                </>
              )}

              <Divider sx={{ borderColor: "#334155" }} />

              {/* 4. Downtime & Impact */}
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                  4. Downtime & Impact *
                </Typography>
                <Stack spacing={2}>
                  <Controller
                    name="downtime_start"
                    control={control}
                    rules={{ required: "Downtime start is required" }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          label="Downtime Start *"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => field.onChange(newValue)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.downtime_start,
                              helperText: errors.downtime_start?.message,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 4,
                                  color: "#fff",
                                  "& fieldset": { borderColor: "#fff" },
                                  "&:hover fieldset": { borderColor: "#eaeaea" },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#38bdf8",
                                    boxShadow: "0 0 14px rgba(56,189,248,0.5)",
                                  },
                                },
                                "& .MuiInputLabel-root": { color: "#fff" },
                                "& .MuiSvgIcon-root": { color: "#fff" },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                  <Controller
                    name="downtime_end"
                    control={control}
                    rules={{ required: "Downtime end is required" }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          label="Downtime End *"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => field.onChange(newValue)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.downtime_end,
                              helperText: errors.downtime_end?.message,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 4,
                                  color: "#fff",
                                  "& fieldset": { borderColor: "#fff" },
                                  "&:hover fieldset": { borderColor: "#eaeaea" },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#38bdf8",
                                    boxShadow: "0 0 14px rgba(56,189,248,0.5)",
                                  },
                                },
                                "& .MuiInputLabel-root": { color: "#fff" },
                                "& .MuiSvgIcon-root": { color: "#fff" },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                  {downtimeTotal > 0 && (
                    <Typography sx={{ color: "#38bdf8", fontWeight: 600 }}>
                      Total Downtime: {downtimeTotal} minutes ({(downtimeTotal / 60).toFixed(2)} hours)
                    </Typography>
                  )}
                  <Controller
                    name="production_stopped"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Production Stopped?"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="estimated_production_loss"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        label="Estimated Production Loss (Optional)"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                </Stack>
              </Box>

              <Divider sx={{ borderColor: "#334155" }} />

              {/* 5. Sparepart & Material */}
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                  5. Sparepart & Material
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!sparepartUsed}
                      onChange={(e) => setSparepartUsed(!e.target.checked)}
                      sx={{ color: "#fff" }}
                    />
                  }
                  label="No sparepart used"
                  sx={{ color: "#fff", mb: 2 }}
                />
                {sparepartUsed && (
                  <Box>
                    <TableContainer sx={{ mb: 2, border: "1px solid #334155", borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#1e293b" }}>
                            <TableCell sx={{ color: "#fff", fontWeight: 600, width: "35%" }}>Sparepart</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: 600, width: "15%", textAlign: "center" }}>Qty</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: 600, width: "20%", textAlign: "right" }}>Harga Satuan</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: 600, width: "20%", textAlign: "right" }}>Total</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: 600, width: "10%", textAlign: "center" }}></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sparepartList.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ p: 1 }}>
                                <Autocomplete
                                  freeSolo
                                  options={sparepartHistory}
                                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name || ''}
                                  value={item.name}
                                  onChange={(_, newValue) => handleSparepartChange(index, "name", newValue)}
                                  onInputChange={(_, newInputValue, reason) => {
                                    if (reason === 'input') {
                                      handleSparepartChange(index, "name", newInputValue);
                                    }
                                  }}
                                  renderOption={(props, option) => (
                                    <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span>{option.name}</span>
                                      <Typography variant="caption" sx={{ color: '#888', ml: 2 }}>
                                        Rp {(option.unit_price || 0).toLocaleString('id-ID')}
                                      </Typography>
                                    </Box>
                                  )}
                                  renderInput={(params) => (
                                    <MuiTextField
                                      {...params}
                                      placeholder="Nama sparepart..."
                                      size="small"
                                      sx={{
                                        "& .MuiOutlinedInput-root": {
                                          color: "#fff",
                                          "& fieldset": { borderColor: "#334155" },
                                          "&:hover fieldset": { borderColor: "#38bdf8" },
                                          "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                                        },
                                        "& .MuiInputBase-input": { color: "#fff" },
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell sx={{ p: 1 }}>
                                <MuiTextField
                                  type="number"
                                  size="small"
                                  value={item.quantity}
                                  onChange={(e) => handleSparepartChange(index, "quantity", parseInt(e.target.value) || 0)}
                                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                  sx={{
                                    width: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      color: "#fff",
                                      "& fieldset": { borderColor: "#334155" },
                                      "&:hover fieldset": { borderColor: "#38bdf8" },
                                      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ p: 1 }}>
                                <MuiTextField
                                  type="number"
                                  size="small"
                                  value={item.unit_price}
                                  onChange={(e) => handleSparepartChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                                  inputProps={{ min: 0, style: { textAlign: 'right' } }}
                                  sx={{
                                    width: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      color: "#fff",
                                      "& fieldset": { borderColor: "#334155" },
                                      "&:hover fieldset": { borderColor: "#38bdf8" },
                                      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ p: 1, textAlign: "right", color: "#22c55e", fontWeight: 600 }}>
                                Rp {(item.total_price || 0).toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell sx={{ p: 1, textAlign: "center" }}>
                                <IconButton
                                  size="small"
                                  onClick={() => removeSparepartRow(index)}
                                  disabled={sparepartList.length === 1}
                                  sx={{ color: "#ef4444", "&:disabled": { color: "#555" } }}
                                >
                                  <MdDelete size={18} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Add Row Button & Total */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Button
                        startIcon={<MdAdd />}
                        onClick={addSparepartRow}
                        sx={{ color: "#38bdf8", textTransform: "none" }}
                      >
                        Add Sparepart
                      </Button>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ color: "#888" }}>
                          Total Sparepart Cost:
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#22c55e", fontWeight: 700 }}>
                          Rp {getTotalSparepartCost().toLocaleString('id-ID')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              <Divider sx={{ borderColor: "#334155" }} />

              {/* 6. Safety & Quality Check */}
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                  6. Safety & Quality Check *
                </Typography>
                <Stack spacing={1}>
                  <Controller
                    name="safety_area_safe"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Work area is safe"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="safety_guarding"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Guarding reinstalled"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="safety_no_tools_left"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="No tools left behind"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="safety_machine_tested"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Machine tested & running normally"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  {!allSafetyChecked && (
                    <Controller
                      name="safety_remarks"
                      control={control}
                      rules={{ required: !allSafetyChecked ? "Safety remarks required if any check is No" : false }}
                      render={({ field }) => (
                        <StyledTextField
                          {...field}
                          label="Safety Remarks (Required if any check is No) *"
                          multiline
                          rows={2}
                          error={!!errors.safety_remarks}
                          helperText={errors.safety_remarks?.message}
                          fullWidth
                        />
                      )}
                    />
                  )}
                </Stack>
              </Box>

              <Divider sx={{ borderColor: "#334155" }} />

              {/* 8. Recommendations & Follow-up */}
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                  8. Recommendations & Follow-up (Optional)
                </Typography>
                <Stack spacing={1}>
                  <Controller
                    name="needs_additional_pm"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Needs additional PM"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="needs_frequent_monitoring"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Needs more frequent monitoring"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="needs_sparepart_adjustment"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Needs sparepart stock adjustment"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="needs_alarm_adjustment"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} sx={{ color: "#fff" }} />}
                        label="Needs alarm threshold adjustment"
                        sx={{ color: "#fff" }}
                      />
                    )}
                  />
                  <Controller
                    name="recommendation_note"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        label="Recommendation Notes"
                        multiline
                        rows={3}
                        fullWidth
                      />
                    )}
                  />
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={handleClose}
                disabled={loading}
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
                disabled={loading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? "Completing..." : "Complete Work Order"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalCompleteWorkOrder;
